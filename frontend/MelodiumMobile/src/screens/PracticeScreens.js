import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useIsFocused, usePreventRemove } from '@react-navigation/native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BodyText, colors, Eyebrow, FlowButton, FlowField, FlowScreen, Heading } from '../components/FlowUI';
import MusicToolIcon from '../components/MusicToolIcon';
import { saveEvolutionVideo } from '../services/evolutionVideos';
import { localData, useLocalData } from '../services/localData';
import { elapsedSeconds, formatTime } from '../services/practiceModel';

function usePracticeClock() {
    const state = useLocalData();
    const [, redraw] = useState(0);
    const focused = useIsFocused();
    useEffect(() => {
        if (!focused || state.data.active?.runningSince == null) return undefined;
        const interval = setInterval(() => redraw((tick) => tick + 1), 1000);
        return () => clearInterval(interval);
    }, [focused, state.data.active?.runningSince]);
    return { ...state, seconds: elapsedSeconds(state.data.active), running: state.data.active?.runningSince != null };
}

function useSaveAction() {
    const lock = useRef(false);
    const [busy, setBusy] = useState(false);
    const run = async (action) => {
        if (lock.current) return;
        lock.current = true;
        setBusy(true);
        try { await action(); } catch (error) { Alert.alert('Não foi possível concluir', error.message || 'Tente novamente. Seus dados não foram apagados.'); }
        finally { lock.current = false; setBusy(false); }
    };
    return [busy, run];
}

function BackRow({ navigation, title }) {
    return <View style={styles.topRow}><Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => navigation.goBack()}><Text style={styles.back}>‹</Text></Pressable><Text style={styles.topLabel}>{title}</Text><View style={styles.topSpacer} /></View>;
}

export function PracticeScreen({ navigation }) {
    const { ready, data, seconds, running, error } = usePracticeClock();
    const [busy, run] = useSaveAction();
    const finish = () => run(async () => {
        await localData.pause();
        navigation.navigate('RecordPractice');
    });
    return <SafeAreaView style={styles.practiceFullScreen} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.practiceInner}>
            <BackRow navigation={navigation} title="PRÁTICA ATUAL" />
            <View style={styles.practiceIntro}><Eyebrow>VAMOS TOCAR</Eyebrow><Heading>Sua prática</Heading><BodyText style={styles.practiceSubtitle}>Este tempo é só seu.</BodyText></View>
            {error && <BodyText>{error}</BodyText>}
            <View style={styles.liveTimer}>
                <Text style={styles.liveTimerLabel}>{running ? 'PRÁTICA EM ANDAMENTO' : seconds ? 'PRÁTICA PAUSADA' : 'PRONTO PARA COMEÇAR'}</Text>
                <Text adjustsFontSizeToFit numberOfLines={1} style={styles.liveTimerValue}>{formatTime(seconds)}</Text>
                <Text style={styles.liveTimerHint}>minutos : segundos</Text>
            </View>
            <View style={styles.practiceActions}>
            <FlowButton disabled={!ready || busy} onPress={() => run(() => running ? localData.pause() : localData.start())}>{running ? 'Pausar prática' : seconds ? 'Retomar prática' : 'Iniciar prática'}</FlowButton>
                <FlowButton style={styles.finishButton} disabled={!ready || busy || seconds < 1} variant="secondary" onPress={finish}>Finalizar e registrar</FlowButton>
                <View style={styles.practiceLinks}>
                    <Pressable accessibilityRole="button" onPress={() => navigation.navigate('RecordVideo')}><Text style={styles.practiceLink}>● Gravar um trecho</Text></Pressable>
                    {data.active && <Pressable accessibilityRole="button" disabled={busy} onPress={() => Alert.alert('Descartar esta sessão?', 'O tempo desta sessão ainda não foi salvo no histórico.', [{ text: 'Manter', style: 'cancel' }, { text: 'Descartar', style: 'destructive', onPress: () => run(() => localData.discard()) }])}><Text style={styles.practiceLink}>Descartar</Text></Pressable>}
                </View>
            </View>
            <View style={styles.bottomTools}>
                <Pressable accessibilityRole="button" style={styles.bottomToolCard} onPress={() => navigation.navigate('Metronome')}><MusicToolIcon type="metronome" /><View><Text style={styles.toolTitle}>Metrônomo</Text><Text style={styles.toolHint}>marque o tempo</Text></View></Pressable>
                <Pressable accessibilityRole="button" style={styles.bottomToolCard} onPress={() => navigation.navigate('Tuner')}><MusicToolIcon type="tuner" /><View><Text style={styles.toolTitle}>Afinador</Text><Text style={styles.toolHint}>afine seu instrumento</Text></View></Pressable>
            </View>
        </View>
    </SafeAreaView>;
}

function InstrumentPicker({ instrument, setInstrument }) {
    return <><Text style={styles.fieldLabel}>Instrumento</Text><View style={styles.chips}>{['Violão', 'Piano', 'Voz', 'Outro'].map((item) => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: instrument === item }} onPress={() => setInstrument(item)} style={[styles.chip, instrument === item && styles.chipSelected]}><Text style={[styles.chipText, instrument === item && styles.chipTextSelected]}>{item}</Text></Pressable>)}</View></>;
}

function DurationPicker({ value, onChange }) {
    const adjust = (amount) => {
        const current = Number(String(value).replace(',', '.')) || 15;
        onChange(String(Math.min(1440, Math.max(1, Math.round(current + amount)))));
    };
    return <View style={styles.durationBlock}>
        <Text style={styles.fieldLabel}>Duração (minutos)</Text>
        <View style={styles.durationPicker}>
            <Pressable accessibilityRole="button" accessibilityLabel="Diminuir cinco minutos" onPress={() => adjust(-5)} style={styles.durationAdjust}><Text style={styles.durationAdjustText}>−</Text></Pressable>
            <TextInput accessibilityLabel="Duração em minutos" keyboardType="decimal-pad" maxLength={7} selectTextOnFocus value={value} onChangeText={onChange} placeholder="15" placeholderTextColor={colors.soft} selectionColor={colors.brown} style={styles.durationInput} />
            <Pressable accessibilityRole="button" accessibilityLabel="Aumentar cinco minutos" onPress={() => adjust(5)} style={styles.durationAdjust}><Text style={styles.durationAdjustText}>+</Text></Pressable>
        </View>
        <Text style={styles.durationHint}>Toque no número para digitar outro tempo.</Text>
    </View>;
}

export function AddPracticeScreen({ navigation }) {
    const { ready } = useLocalData();
    const [activity, setActivity] = useState('');
    const [duration, setDuration] = useState('15');
    const [instrument, setInstrument] = useState('Violão');
    const [busy, run] = useSaveAction();
    const sessionId = useRef(`manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    const save = () => run(async () => {
        await localData.saveSession({ id: sessionId.current, title: activity, instrument, durationSeconds: Number(duration.replace(',', '.')) * 60 });
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    });
    return <FlowScreen contentStyle={styles.addContent}>
        <BackRow navigation={navigation} title="NOVA ATIVIDADE" />
        <Eyebrow style={styles.addEyebrow}>SEU HISTÓRICO</Eyebrow><Heading>Adicionar prática</Heading>
        <BodyText style={styles.addSubtitle}>Registre uma sessão que já aconteceu hoje.</BodyText>
        <View style={styles.addFields}>
            <FlowField label="O que você praticou?" placeholder="Ex.: troca de acordes" maxLength={100} value={activity} onChangeText={setActivity} />
            <InstrumentPicker instrument={instrument} setInstrument={setInstrument} />
            <DurationPicker value={duration} onChange={setDuration} />
            <FlowButton disabled={!ready || busy} onPress={save}>{busy ? 'Salvando...' : 'Salvar prática'}</FlowButton>
        </View>
    </FlowScreen>;
}

export function RecordPracticeScreen({ navigation }) {
    const { ready, data, seconds } = usePracticeClock();
    const [title, setTitle] = useState('');
    const [instrument, setInstrument] = useState('Violão');
    const [busy, run] = useSaveAction();
    const finish = () => run(async () => {
        await localData.saveSession({ fromActive: true, title, instrument });
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    });
    return <FlowScreen contentStyle={styles.recordContent}>
        <BackRow navigation={navigation} title="REGISTRAR PRÁTICA" />
        <Eyebrow style={styles.recordEyebrow}>MUITO BEM</Eyebrow><Heading>Sua sessão</Heading>
        <BodyText style={styles.recordSubtitle}>Dê um nome a esse passo na sua evolução.</BodyText>
        <View style={[styles.timerCard, { marginBottom: 22 }]}><Text style={styles.timerLabel}>TEMPO DE PRÁTICA</Text><Text style={styles.timerValue}>{formatTime(seconds)}</Text></View>
        <FlowField label="O que você praticou?" placeholder="Ex.: minha primeira música" maxLength={100} value={title} onChangeText={setTitle} />
        <InstrumentPicker instrument={instrument} setInstrument={setInstrument} />
        <View style={styles.recordActions}>
            <FlowButton disabled={!ready || busy || !data.active || seconds < 1} onPress={finish}>{busy ? 'Salvando...' : 'Salvar prática'}</FlowButton>
            <FlowButton variant="text" onPress={() => navigation.goBack()}>Voltar à prática</FlowButton>
        </View>
    </FlowScreen>;
}

export function RecordVideoScreen({ navigation }) {
    const cameraRef = useRef(null);
    const saveLock = useRef(false);
    const recordingLock = useRef(false);
    const savedAsset = useRef(null);
    const isFocused = useIsFocused();
    const { ready } = useLocalData();
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
    const [cameraReady, setCameraReady] = useState(false);
    const [facing, setFacing] = useState('front');
    const [isRecording, setIsRecording] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [pendingVideoUri, setPendingVideoUri] = useState(null);
    const [videoTitle, setVideoTitle] = useState('');
    const [savedVideo, setSavedVideo] = useState(false);
    usePreventRemove(Boolean(pendingVideoUri) || isRecording || isSaving, ({ data }) => {
        if (isRecording || isSaving) { Alert.alert('Só um instante', 'Pare a gravação e termine de salvar antes de sair.'); return; }
        Alert.alert('Sair sem salvar?', 'Seu trecho ainda não foi confirmado. Deseja voltar para dar um nome e salvar?', [
            { text: 'Continuar editando', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
        ]);
    });
    useFocusEffect(useCallback(() => {
        setCameraReady(false);
        return () => { cameraRef.current?.stopRecording(); };
    }, []));
    useEffect(() => {
        const listener = AppState.addEventListener('change', (state) => {
            if (state !== 'active' && recordingLock.current) cameraRef.current?.stopRecording();
        });
        return () => listener.remove();
    }, []);
    useEffect(() => {
        if (!isRecording) return undefined;
        const started = Date.now();
        const interval = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 500);
        return () => clearInterval(interval);
    }, [isRecording]);
    const requestCameraAccess = async () => {
        try {
            const camera = cameraPermission?.granted ? cameraPermission : await requestCameraPermission();
            if (!camera.granted) {
                Alert.alert('A câmera precisa de permissão', camera.canAskAgain ? 'Toque novamente e permita o uso da câmera.' : 'Abra as configurações do Melodium e permita o uso da câmera.', camera.canAskAgain ? [{ text: 'Entendi' }] : [{ text: 'Cancelar', style: 'cancel' }, { text: 'Abrir configurações', onPress: () => Linking.openSettings() }]);
                return;
            }
            const microphone = microphonePermission?.granted ? microphonePermission : await requestMicrophonePermission();
            if (!microphone.granted) {
                Alert.alert('O microfone precisa de permissão', microphone.canAskAgain ? 'Toque novamente e permita o uso do microfone para gravar com áudio.' : 'Abra as configurações do Melodium e permita o uso do microfone.', microphone.canAskAgain ? [{ text: 'Entendi' }] : [{ text: 'Cancelar', style: 'cancel' }, { text: 'Abrir configurações', onPress: () => Linking.openSettings() }]);
            }
        } catch { Alert.alert('Permissão indisponível', 'Confira o acesso à câmera e ao microfone nas configurações do aparelho.'); }
    };
    const saveVideo = async () => {
        if (!pendingVideoUri || saveLock.current) return;
        if (!videoTitle.trim()) { Alert.alert('Dê um nome ao vídeo', 'Escolha um título para encontrar esse momento depois.'); return; }
        saveLock.current = true;
        setIsSaving(true);
        try {
            // Keep the created asset if writing its title fails; retry must not duplicate the video.
            if (!savedAsset.current) savedAsset.current = await saveEvolutionVideo(pendingVideoUri);
            await localData.setVideoTitle(savedAsset.current.id, videoTitle);
            setPendingVideoUri(null);
            setSavedVideo(true);
            Alert.alert('Vídeo salvo', 'Seu registro está na galeria de evolução deste aparelho.');
        } catch (error) {
            Alert.alert('Não foi possível concluir', error.code === 'MEDIA_PERMISSION_DENIED' ? 'Permita o acesso à galeria para salvar o vídeo.' : 'Seu trecho foi mantido nesta tela. Tente salvar novamente.');
        } finally { saveLock.current = false; setIsSaving(false); }
    };
    const startRecording = async () => {
        if (!cameraReady || !cameraRef.current || recordingLock.current || pendingVideoUri || isSaving) return;
        recordingLock.current = true;
        savedAsset.current = null;
        setSavedVideo(false);
        setElapsed(0);
        setIsRecording(true);
        try {
            const result = await cameraRef.current.recordAsync({ maxDuration: 90 });
            if (result?.uri) {
                setVideoTitle(`Prática de ${new Date().toLocaleDateString('pt-BR')}`);
                setPendingVideoUri(result.uri);
            }
        } catch { Alert.alert('Falha na gravação', 'Não foi possível concluir o vídeo. Tente novamente.'); }
        finally { recordingLock.current = false; setIsRecording(false); }
    };
    const permissionsGranted = cameraPermission?.granted && microphonePermission?.granted;
    return <FlowScreen contentStyle={styles.videoContent}>
        <BackRow navigation={navigation} title="REGISTRE SUA EVOLUÇÃO" />
        <Eyebrow style={styles.videoEyebrow}>UM NOVO REGISTRO</Eyebrow><Heading>{pendingVideoUri ? 'Dê nome ao momento.' : 'Sua música em vídeo.'}</Heading>
        <BodyText style={styles.videoSubtitle}>{pendingVideoUri ? 'Escolha como este vídeo aparece na sua galeria Melodium.' : 'Grave até 90 segundos. Depois, escolha um nome e salve.'}</BodyText>
        {pendingVideoUri ? <View style={{ marginTop: 24, padding: 20, borderRadius: 20, backgroundColor: colors.paleGreen }}>
            <Text style={styles.fieldLabel}>Seu trecho está pronto ♬</Text>
            <FlowField label="Nome do vídeo" maxLength={100} value={videoTitle} onChangeText={setVideoTitle} editable={!isSaving} />
            <FlowButton disabled={isSaving || !ready} onPress={saveVideo}>{isSaving ? 'Salvando...' : 'Salvar na minha galeria'}</FlowButton>
            {!savedAsset.current && <FlowButton disabled={isSaving} variant="text" onPress={() => Alert.alert('Gravar novamente?', 'Este trecho ainda não salvo será descartado.', [{ text: 'Manter trecho', style: 'cancel' }, { text: 'Gravar novamente', style: 'destructive', onPress: () => { setPendingVideoUri(null); setCameraReady(false); } }])}>Gravar novamente</FlowButton>}
        </View> : <>
            {permissionsGranted && isFocused ? <View style={styles.cameraFrame}>
                <CameraView ref={cameraRef} style={styles.cameraPreview} facing={facing} mirror={facing === 'front'} mode="video" videoQuality="720p" onCameraReady={() => setCameraReady(true)} onMountError={(event) => { setCameraReady(false); Alert.alert('Câmera indisponível', event?.message || 'Feche outros aplicativos que estejam usando a câmera e tente novamente.'); }} />
                <Pressable accessibilityRole="button" accessibilityLabel="Trocar câmera" disabled={isRecording} style={styles.flipButton} onPress={() => { setCameraReady(false); setFacing((value) => value === 'back' ? 'front' : 'back'); }}><Text style={styles.flipGlyph}>↻</Text></Pressable>
                {isRecording && <View style={styles.recordingBadge}><View style={styles.recordingDot} /><Text style={styles.recordingTime}>{formatTime(elapsed)}</Text></View>}
            </View> : <View style={[styles.cameraFrame, styles.cameraPermissionState]}><Text style={styles.permissionGlyph}>◉</Text><Text style={styles.cameraMessage}>Uma janela para sua evolução</Text><Text style={styles.cameraHint}>Permita câmera e microfone para registrar sua música.</Text></View>}
            {!permissionsGranted && <FlowButton onPress={requestCameraAccess} style={styles.permissionButton}>Permitir câmera e microfone</FlowButton>}
            {permissionsGranted && <Pressable accessibilityRole="button" accessibilityLabel={isRecording ? 'Parar gravação' : 'Iniciar gravação'} disabled={!cameraReady || isSaving} onPress={() => isRecording ? cameraRef.current?.stopRecording() : startRecording()} style={[styles.shutter, !cameraReady && styles.shutterDisabled]}><View style={[styles.shutterInner, isRecording && styles.shutterRecording]} /></Pressable>}
            <Text style={styles.recordHint}>{isRecording ? `Gravando ${formatTime(elapsed)}` : 'Toque para gravar'}</Text>
        </>}
        {savedVideo && <FlowButton variant="secondary" onPress={() => navigation.navigate('EvolutionGallery')}>Ver vídeo na minha galeria</FlowButton>}
    </FlowScreen>;
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    practiceFullScreen: { flex: 1, backgroundColor: colors.green },
    practiceInner: { flex: 1, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 14 },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 32 },
    back: { color: colors.brown, fontSize: 32, lineHeight: 34, width: 38 },
    topLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.1 },
    topSpacer: { width: 38 },
    practiceIntro: { marginTop: 20 },
    practiceSubtitle: { marginTop: 4, color: colors.brown },
    liveTimer: { flex: 1, minHeight: 180, alignItems: 'center', justifyContent: 'center' },
    liveTimerLabel: { color: colors.brown, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
    liveTimerValue: { color: colors.brown, fontSize: 82, lineHeight: 100, fontWeight: '800', fontVariant: ['tabular-nums'], marginTop: 4 },
    liveTimerHint: { color: colors.muted, fontSize: 12 },
    timerCard: { backgroundColor: colors.brown, borderRadius: 12, alignItems: 'center', paddingVertical: 20, marginTop: 24 },
    timerLabel: { color: colors.green, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    timerValue: { color: colors.white, fontSize: 48, lineHeight: 58, fontWeight: '700', marginTop: 6 },
    timerHint: { color: '#E4DAD2', fontSize: 11 },
    bottomTools: { flexDirection: 'row', gap: 10, marginTop: 12 },
    bottomToolCard: { flex: 1, minHeight: 78, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.brown, borderRadius: 16 },
    toolIcon: { color: colors.brown, fontSize: 21 },
    toolTitle: { color: colors.brown, fontSize: 13, fontWeight: '700', marginTop: 5 },
    toolHint: { color: colors.muted, fontSize: 10, marginTop: 3 },
    practiceActions: { gap: 9 },
    finishButton: { backgroundColor: colors.white },
    practiceLinks: { minHeight: 38, paddingHorizontal: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    practiceLink: { color: colors.brown, fontSize: 12, fontWeight: '700' },
    addContent: { paddingTop: 18 },
    addEyebrow: { marginTop: 26 },
    addSubtitle: { marginTop: 6 },
    addFields: { marginTop: 28 },
    fieldLabel: { color: colors.brown, fontSize: 14, fontWeight: '700', marginBottom: 9 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 },
    chip: { borderRadius: 20, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 13, paddingVertical: 9, backgroundColor: colors.white },
    chipSelected: { backgroundColor: colors.green, borderColor: colors.brown },
    chipText: { color: colors.muted, fontSize: 12 },
    chipTextSelected: { color: colors.brown, fontWeight: '700' },
    durationBlock: { marginBottom: 22 },
    durationPicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.white },
    durationAdjust: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paleGreen, borderWidth: 1, borderColor: colors.border },
    durationAdjustText: { color: colors.brown, fontSize: 28, lineHeight: 31, fontWeight: '700' },
    durationInput: { minWidth: 86, paddingHorizontal: 6, paddingVertical: 4, color: colors.brown, fontSize: 34, lineHeight: 42, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'] },
    durationHint: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 7 },
    recordContent: { paddingTop: 18 },
    recordEyebrow: { marginTop: 32 },
    recordSubtitle: { marginTop: 6 },
    recordSummary: { flex: 1, minHeight: 270, maxHeight: 360, marginTop: 26, backgroundColor: colors.paleGreen, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
    summaryLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    summaryTime: { color: colors.brown, fontSize: 62, lineHeight: 72, fontWeight: '700', marginTop: 10 },
    summaryUnit: { color: colors.muted, fontSize: 12 },
    recordActions: { gap: 10, paddingTop: 24 },
    videoContent: { paddingTop: 18, alignItems: 'stretch', paddingBottom: 16 },
    videoEyebrow: { marginTop: 18 },
    videoSubtitle: { marginTop: 6 },
    cameraFrame: { position: 'relative', width: '100%', aspectRatio: 1, alignSelf: 'stretch', backgroundColor: '#211810', borderRadius: 16, marginTop: 18, overflow: 'hidden' },
    cameraPreview: { flex: 1 },
    cameraPermissionState: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    permissionGlyph: { color: colors.green, fontSize: 44 },
    cameraMessage: { color: colors.white, fontSize: 16, lineHeight: 22, fontWeight: '700', marginTop: 14, textAlign: 'center' },
    cameraHint: { color: '#D4C9BF', fontSize: 12, lineHeight: 18, marginTop: 8, textAlign: 'center', paddingHorizontal: 10 },
    flipButton: { position: 'absolute', right: 14, top: 14, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(20, 15, 11, 0.62)', alignItems: 'center', justifyContent: 'center' },
    flipGlyph: { color: colors.white, fontSize: 25 },
    recordingBadge: { position: 'absolute', top: 18, left: 14, flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: 'rgba(20, 15, 11, 0.7)' },
    recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D96350' },
    recordingTime: { color: colors.white, fontSize: 12, fontVariant: ['tabular-nums'] },
    shutter: { width: 62, height: 62, borderRadius: 31, borderWidth: 2, borderColor: colors.muted, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
    shutterInner: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#CC775D' },
    shutterRecording: { borderRadius: 8, width: 22, height: 22 },
    shutterDisabled: { opacity: 0.5 },
    recordHint: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 7, marginBottom: 5 },
    permissionButton: { marginTop: 14 },
    retrySaveButton: { marginBottom: 8 },
});
