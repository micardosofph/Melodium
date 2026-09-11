import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, preload, setAudioModeAsync } from 'expo-audio';

const MIN_BPM = 40;
const MAX_BPM = 260;
const MIN_BEATS = 2;
const MAX_BEATS = 12;
const STORAGE_KEY = '@melodium/metronome_preferences';
const AVAILABLE_TIME_SIGNATURES = ['2/4', '3/4', '4/4', '6/8', '12/8'];
const CLICK_PACK_NAME = 'click';
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const SOUND_PATHS = {
    [CLICK_PACK_NAME]: {
        hi: require('../../assets/sounds/metronome/flClickHi.wav'),
        low: require('../../assets/sounds/metronome/flClickLo.wav'),
    },
};

export default function MetronomoScreen() {
    const [bpm, setBpm] = useState(100);
    const [timeSignature, setTimeSignature] = useState('4/4');
    const [beatsPerBar, setBeatsPerBar] = useState(4);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeBeat, setActiveBeat] = useState(0);
    const [currentBeatNumber, setCurrentBeatNumber] = useState(1);
    const [isConfigVisible, setIsConfigVisible] = useState(false);
    const [activeMode, setActiveMode] = useState('click');

    const timeoutRef = useRef(null);
    const beatIndexRef = useRef(0);
    const nextBeatAtRef = useRef(0);
    const soundCacheRef = useRef({});
    const rafRef = useRef(null);
    const timingSamplesRef = useRef([]);
    const lastBeatTimestampRef = useRef(0);

    const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

    const reportTiming = useCallback((expectedAtMs, actualAtMs) => {
        if (!__DEV__) return;

        const driftMs = actualAtMs - expectedAtMs;
        timingSamplesRef.current.push(driftMs);

        if (timingSamplesRef.current.length < 20) return;

        const avgDrift = timingSamplesRef.current.reduce((sum, value) => sum + value, 0) / timingSamplesRef.current.length;
        const maxDrift = Math.max(...timingSamplesRef.current);
        const minDrift = Math.min(...timingSamplesRef.current);

        console.log(`[METRÔNOMO] avg drift ${avgDrift.toFixed(2)}ms | min ${minDrift.toFixed(2)}ms | max ${maxDrift.toFixed(2)}ms`);
        timingSamplesRef.current = [];
    }, []);

    const prepareSoundPack = async (packName) => {
        const soundPack = SOUND_PATHS[packName];
        if (!soundPack) return {};

        const nextSounds = {};

        for (const [key, asset] of Object.entries(soundPack)) {
            try {
                await preload(asset);
                const player = createAudioPlayer(asset, { downloadFirst: true });
                nextSounds[key] = player;
            } catch (error) {
                console.log(`Erro ao preparar ${packName}-${key}:`, error);
            }
        }

        return nextSounds;
    };

    const playMetronomeTick = useCallback(async (isStrongBeat) => {
        const soundKey = isStrongBeat ? 'hi' : 'low';
        const player = soundCacheRef.current[soundKey];
        const vibroDuration = clamp(Math.round(80 - bpm * 0.2), 18, 68);
        const vibratePattern = isStrongBeat
            ? [0, vibroDuration, 20, vibroDuration]
            : [0, Math.max(14, Math.round(vibroDuration * 0.5)), 18, Math.max(14, Math.round(vibroDuration * 0.5))];

        if (activeMode === 'vibration') {
            Vibration.vibrate(vibratePattern);
            return;
        }

        if (!player) {
            return;
        }

        try {
            player.volume = isStrongBeat ? 1 : 0.76;
            player.seekTo(0);
            player.play();
        } catch (error) {
            console.log('Erro ao tocar som do metrônomo:', error);
        }
    }, [activeMode, bpm]);

    useEffect(() => {
        let cancelled = false;

        const loadSelectedSoundPack = async () => {
            const nextSounds = await prepareSoundPack(CLICK_PACK_NAME);

            if (cancelled) {
                Object.values(nextSounds).forEach((player) => {
                    try {
                        player.remove();
                    } catch (error) {
                        console.log('Erro ao remover player em cleanup:', error);
                    }
                });
                return;
            }

            Object.values(soundCacheRef.current).forEach((player) => {
                try {
                    player.remove();
                } catch (error) {
                    console.log('Erro ao remover player antigo:', error);
                }
            });

            soundCacheRef.current = nextSounds;
        };

        loadSelectedSoundPack();

        return () => {
            cancelled = true;
            Object.values(soundCacheRef.current).forEach((player) => {
                try {
                    player.remove();
                } catch (error) {
                    console.log('Erro ao remover player ao sair:', error);
                }
            });
            soundCacheRef.current = {};
        };
    }, []);

    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);

                if (!raw) return;

                const parsed = JSON.parse(raw);

                if (typeof parsed.bpm === 'number') {
                    setBpm(Math.min(MAX_BPM, Math.max(MIN_BPM, parsed.bpm)));
                }

                if (typeof parsed.timeSignature === 'string') {
                    const value = parsed.timeSignature;
                    const match = value.match(/^\d+\/\d+$/);

                    if (match && AVAILABLE_TIME_SIGNATURES.includes(value)) {
                        setTimeSignature(value);
                        const [numerator] = value.split('/').map(Number);
                        const safeBeats = Math.min(MAX_BEATS, Math.max(MIN_BEATS, numerator));
                        setBeatsPerBar(safeBeats);
                    }
                }
            } catch (error) {
                console.log('Erro ao carregar preferências do metrônomo:', error);
            }
        };

        loadPreferences();
    }, []);

    useEffect(() => {
        const savePreferences = async () => {
            try {
                const payload = {
                    bpm,
                    timeSignature,
                };

                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            } catch (error) {
                console.log('Erro ao salvar preferências do metrônomo:', error);
            }
        };

        savePreferences();
    }, [bpm, beatsPerBar]);

    useEffect(() => {
        let cancelled = false;

        const configureAudio = async () => {
            try {
                await setAudioModeAsync({
                    playsInSilentMode: true,
                    interruptionMode: 'mixWithOthers',
                });
            } catch (error) {
                if (!cancelled) {
                    console.log('Erro ao configurar modo de áudio do metrônomo:', error);
                }
            }
        };

        configureAudio();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isPlaying) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            timingSamplesRef.current = [];
            lastBeatTimestampRef.current = 0;
            return;
        }

        const intervalMs = 60000 / bpm;
        const schedulerToleranceMs = 3;
        nextBeatAtRef.current = nowMs() + intervalMs;
        lastBeatTimestampRef.current = nextBeatAtRef.current;

        const tickLoop = () => {
            if (!isPlaying) return;

            const now = nowMs();
            let scheduledTickCount = 0;

            while (now >= nextBeatAtRef.current - schedulerToleranceMs) {
                const expectedAtMs = nextBeatAtRef.current;
                const actualAtMs = nowMs();
                const beat = beatIndexRef.current % beatsPerBar;
                const isStrongBeat = beat === 0;

                if (__DEV__) {
                    reportTiming(expectedAtMs, actualAtMs);
                }

                setActiveBeat(beat);
                setCurrentBeatNumber(beat + 1);
                playMetronomeTick(isStrongBeat);

                beatIndexRef.current += 1;
                nextBeatAtRef.current += intervalMs;
                scheduledTickCount += 1;

                if (scheduledTickCount > 3 && nowMs() - actualAtMs > intervalMs * 1.4) {
                    break;
                }
            }

            rafRef.current = requestAnimationFrame(tickLoop);
        };

        rafRef.current = requestAnimationFrame(tickLoop);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, [isPlaying, bpm, beatsPerBar, playMetronomeTick, reportTiming]);

    const updateBpm = (nextValue) => {
        const clamped = Math.min(MAX_BPM, Math.max(MIN_BPM, nextValue));
        setBpm(clamped);
    };

    const updateBeatsPerBar = (nextValue) => {
        const clamped = Math.min(MAX_BEATS, Math.max(MIN_BEATS, nextValue));
        setBeatsPerBar(clamped);
        setTimeSignature(`${clamped}/4`);
        setActiveBeat(0);
        setCurrentBeatNumber(1);
        beatIndexRef.current = 0;
    };

    const handleTimeSignaturePress = (signature) => {
        setTimeSignature(signature);
        const [numerator] = signature.split('/').map(Number);
        const safeBeats = Math.min(MAX_BEATS, Math.max(MIN_BEATS, numerator));
        setBeatsPerBar(safeBeats);
        setActiveBeat(0);
        setCurrentBeatNumber(1);
        beatIndexRef.current = 0;
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            setIsPlaying(false);
            setActiveBeat(0);
            setCurrentBeatNumber(1);
            beatIndexRef.current = 0;
            return;
        }

        beatIndexRef.current = 0;
        setCurrentBeatNumber(1);
        setActiveBeat(0);
        setIsPlaying(true);
    };

    const visualBeats = Array.from({ length: beatsPerBar }, (_, index) => (
        <View
            key={`beat-${index}`}
            style={[
                styles.visualBeat,
                activeBeat === index && styles.visualBeatActive,
                index === 0 && !activeBeat && styles.visualBeatStrong,
            ]}
        >
            <Text style={activeBeat === index ? styles.visualBeatTextActive : styles.visualBeatText}>{index + 1}</Text>
        </View>
    ));

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <View>
                    <Text style={styles.eyebrow}>PRÁTICA GUIADA</Text>
                    <Text style={styles.title}>Metrônomo</Text>
                </View>

                <TouchableOpacity
                    style={styles.configButton}
                    onPress={() => setIsConfigVisible(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.configIcon}>⚙</Text>
                </TouchableOpacity>
            </View>

            <Modal
                transparent
                animationType="fade"
                visible={isConfigVisible}
                onRequestClose={() => setIsConfigVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Configurações</Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setActiveMode('click')}
                            style={[
                                styles.settingRow,
                                activeMode !== 'click' && styles.settingRowInactive,
                            ]}
                        >
                            <View>
                                <Text style={styles.settingLabel}>Clique</Text>
                                <Text style={styles.settingHint}>{activeMode === 'click' ? 'Ativado' : 'Desativado'}</Text>
                            </View>
                            <View
                                style={[
                                    styles.radioButton,
                                    activeMode === 'click' && styles.radioButtonActive,
                                    activeMode !== 'click' && styles.radioButtonInactive,
                                ]}
                            >
                                {activeMode === 'click' && <View style={styles.radioButtonInner} />}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setActiveMode('vibration')}
                            style={[
                                styles.settingRow,
                                activeMode !== 'vibration' && styles.settingRowInactive,
                            ]}
                        >
                            <View>
                                <Text style={styles.settingLabel}>Vibração</Text>
                                <Text style={styles.settingHint}>{activeMode === 'vibration' ? 'Ativada' : 'Desativada'}</Text>
                            </View>
                            <View
                                style={[
                                    styles.radioButton,
                                    activeMode === 'vibration' && styles.radioButtonActive,
                                    activeMode !== 'vibration' && styles.radioButtonInactive,
                                ]}
                            >
                                {activeMode === 'vibration' && <View style={styles.radioButtonInner} />}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setIsConfigVisible(false)}
                        >
                            <Text style={styles.modalCloseText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={styles.card}>
                <Text style={styles.label}>ANDAMENTO</Text>
                <Text style={styles.bpm}>{bpm}</Text>
                <Text style={styles.unit}>batidas por minuto</Text>

                <View style={styles.meter}>
                    <View style={[styles.meterFill, { width: `${Math.min(100, (bpm / MAX_BPM) * 100)}%` }]} />
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity style={styles.adjustButton} onPress={() => updateBpm(bpm - 1)}>
                        <Text style={styles.adjustText}>−</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
                        <Text style={styles.playText}>{isPlaying ? 'Pausar' : 'Iniciar'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.adjustButton} onPress={() => updateBpm(bpm + 1)}>
                        <Text style={styles.adjustText}>+</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.beatsSection}>
                    <Text style={styles.beatsLabel}>COMPASSO</Text>
                    <View style={styles.signatureRow}>
                        {AVAILABLE_TIME_SIGNATURES.map((signature) => (
                            <TouchableOpacity
                                key={signature}
                                style={[
                                    styles.signatureButton,
                                    timeSignature === signature && styles.signatureButtonActive,
                                ]}
                                onPress={() => handleTimeSignaturePress(signature)}
                            >
                                <Text
                                    style={[
                                        styles.signatureText,
                                        timeSignature === signature && styles.signatureTextActive,
                                    ]}
                                >
                                    {signature}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.visualBeatsContainer}>{visualBeats}</View>
                </View>
            </View>

            <Text style={styles.tip}>
                {isPlaying ? 'clique no pulso e encontre seu tempo' : 'pronto para começar uma nova sessão?'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#F7F9F4' },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 24, marginBottom: 30 },
    eyebrow: { color: '#8A6B56', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.4 },
    title: { color: '#46240C', fontSize: 32, fontWeight: 'bold', marginTop: 8 },
    configButton: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#E9EFE4',
        borderWidth: 1,
        borderColor: '#C2D5B6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    configIcon: { color: '#46240C', fontSize: 22, fontWeight: 'bold' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(39, 35, 29, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#46240C',
        padding: 20,
    },
    modalTitle: {
        color: '#46240C',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: '#F5F7F2',
        borderWidth: 1,
        borderColor: '#E1E9DA',
        marginBottom: 10,
    },
    settingRowInactive: {
        opacity: 0.42,
        backgroundColor: '#F2F4EF',
        borderColor: '#D7DDCF',
    },
    settingLabel: {
        color: '#46240C',
        fontSize: 14,
        fontWeight: '700',
    },
    settingHint: {
        color: '#8A6B56',
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    radioButton: {
        width: 22,
        height: 22,
        borderRadius: 100,
        backgroundColor: '#E9EFE4',
        borderWidth: 2,
        borderColor: '#46240C',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonActive: {
        backgroundColor: '#FFFFFF',
        borderColor: '#46240C',
    },
    radioButtonInner: {
        width: 13,
        height: 13,
        borderRadius: 100,
        backgroundColor: '#46240C',
    },
    modalCloseButton: {
        marginTop: 10,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#46240C',
    },
    modalCloseText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    card: {
        backgroundColor: '#FFFFFF',
        padding: 28,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#46240C',
        alignItems: 'center',
        shadowColor: '#46240C',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 }
    },
    bpm: { fontSize: 92, fontWeight: 'bold', color: '#46240C', lineHeight: 104, marginTop: 8 },
    label: { fontSize: 12, color: '#8A6B56', fontWeight: 'bold', letterSpacing: 1.4 },
    unit: { fontSize: 14, color: '#8A6B56' },
    meter: { width: '100%', height: 8, borderRadius: 4, backgroundColor: '#E9EFE4', marginTop: 28, overflow: 'hidden' },
    meterFill: { height: '100%', backgroundColor: '#8AA878', borderRadius: 4 },
    controls: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 28 },
    adjustButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E9EFE4', alignItems: 'center', justifyContent: 'center' },
    adjustText: { color: '#46240C', fontSize: 26 },
    playButton: { backgroundColor: '#46240C', borderRadius: 24, minWidth: 112, height: 48, alignItems: 'center', justifyContent: 'center' },
    playText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
    beatsSection: { width: '100%', marginTop: 28 },
    beatsLabel: { fontSize: 12, color: '#8A6B56', fontWeight: 'bold', letterSpacing: 1.4, textAlign: 'center', marginBottom: 12 },
    signatureRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 14,
    },
    signatureButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#E9EFE4',
        borderWidth: 1,
        borderColor: '#D8E2D0',
    },
    signatureButtonActive: {
        backgroundColor: '#C2D5B6',
        borderColor: '#46240C',
    },
    signatureText: { color: '#46240C', fontSize: 12, fontWeight: '600' },
    signatureTextActive: { fontWeight: 'bold' },
    visualBeatsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
        marginBottom: 10
    },
    visualBeat: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#E9EFE4',
        borderWidth: 1,
        borderColor: '#C2D5B6',
        alignItems: 'center',
        justifyContent: 'center'
    },
    visualBeatStrong: {
        backgroundColor: '#46240C',
        borderColor: '#8A6B56'
    },
    visualBeatActive: {
        backgroundColor: '#C2D5B6',
        borderColor: '#46240C',
        transform: [{ scale: 1.08 }]
    },
    visualBeatText: { color: '#46240C', fontSize: 12, fontWeight: 'bold' },
    visualBeatTextActive: { color: '#FFF9F5', fontSize: 12, fontWeight: 'bold' },
    counterText: { color: '#8A6B56', textAlign: 'center', fontSize: 12, marginTop: 6 },
    soundSection: { width: '100%', marginTop: 18 },
    soundRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
    },
    soundButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#E9EFE4',
        borderWidth: 1,
        borderColor: '#C2D5B6',
    },
    soundButtonActive: {
        backgroundColor: '#C2D5B6',
        borderColor: '#46240C',
    },
    soundText: { color: '#46240C', fontSize: 12, fontWeight: '700' },
    soundTextActive: { color: '#46240C' },
    tip: { textAlign: 'center', color: '#8A6B56', marginTop: 24, fontSize: 14 }
});