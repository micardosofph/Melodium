import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, Eyebrow, FlowButton } from '../components/FlowUI';
import HomeTour, { tourSteps } from '../components/HomeTour';
import MusicToolIcon from '../components/MusicToolIcon';
import ProfileAvatar from '../components/ProfileAvatar';
import { localData, useLocalData } from '../services/localData';
import { formatDuration, practiceStats } from '../services/practiceModel';

const homeGreetings = ['Hoje tem música.', 'Seu som começa aqui.', 'Vamos tirar uma nota do papel?', 'Um pouco de música muda o dia.', 'Seu próximo acorde te espera.'];

export default function HomeScreen({ navigation, embedded = false }) {
    const { ready, error, data } = useLocalData();
    const stats = practiceStats(data.sessions);
    const [greeting, setGreeting] = useState(homeGreetings[0]);
    const [tour, setTour] = useState(null);
    const [rect, setRect] = useState(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const root = useRef(null);
    const scroll = useRef(null);
    const targets = useRef({});
    const positions = useRef({});
    const autoTour = useRef(false);
    useFocusEffect(useCallback(() => {
        setGreeting((current) => {
            const alternatives = homeGreetings.filter((item) => item !== current);
            return alternatives[Math.floor(Math.random() * alternatives.length)];
        });
    }, []));
    const closeTour = useCallback(() => {
        setTour(null);
        setRect(null);
        scroll.current?.scrollTo({ y: 0, animated: false });
        localData.finishTour().catch(() => {});
    }, []);
    useEffect(() => {
        if (ready && !data.tourSeen && !autoTour.current) { autoTour.current = true; setTour(0); }
    }, [ready, data.tourSeen]);
    useEffect(() => {
        if (tour === null) return undefined;
        const back = BackHandler.addEventListener('hardwareBackPress', () => { closeTour(); return true; });
        return () => back.remove();
    }, [tour, closeTour]);
    useEffect(() => {
        setRect(null);
        if (tour === null || tour >= tourSteps.length) return undefined;
        const key = tourSteps[tour].key;
        let measureTimer;
        let cancelled = false;
        const timer = setTimeout(() => {
            scroll.current?.scrollTo({ y: Math.max(0, (positions.current[key] || 0) - 55), animated: false });
            // Android applies the scroll on the native thread before measurements settle.
            measureTimer = setTimeout(() => {
                root.current?.measureInWindow((rootX, rootY) => {
                    targets.current[key]?.measureInWindow((x, y, width, height) => {
                        if (!cancelled) setRect({ x: x - rootX, y: y - rootY, width, height });
                    });
                });
            }, 120);
        }, 180);
        return () => { cancelled = true; clearTimeout(timer); clearTimeout(measureTimer); };
    }, [tour, size.width, size.height]);
    const target = (key) => ({
        ref: (node) => { targets.current[key] = node; },
        collapsable: false,
        onLayout: (event) => { positions.current[key] = event.nativeEvent.layout.y; },
    });
    const open = (screen) => navigation.navigate(screen);
    return (
        <SafeAreaView ref={root} collapsable={false} style={styles.screen} edges={embedded ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']} onLayout={(event) => setSize(event.nativeEvent.layout)}>
            <View style={styles.main} importantForAccessibility={tour !== null ? 'no-hide-descendants' : 'auto'}>
                <ScrollView ref={scroll} scrollEnabled={tour === null} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, tour !== null && { paddingBottom: size.height * 0.65 }]}>
                    <View style={styles.header}>
                        <View style={styles.headerCopy}><Eyebrow>SEU ESTÚDIO DE BOLSO</Eyebrow><Text style={styles.title}>{greeting}</Text><Text style={styles.subtitle}>Pratique. Grave. Perceba a diferença.</Text></View>
                        <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={() => open('User')}><ProfileAvatar uri={data.profilePhotoUri} size={44} /></Pressable>
                    </View>
                    {error && <View style={styles.notice}><Text style={styles.noticeText}>{error}</Text>{!ready && <FlowButton onPress={() => localData.load().catch(() => {})}>Tentar novamente</FlowButton>}</View>}
                    <View {...target('practice')} style={styles.practiceHero}>
                        <View style={styles.heroHeading}><Text style={styles.heroEyebrow}>SEU PRÓXIMO PASSO</Text><Text style={styles.heroNote}>♬</Text></View>
                        <Text style={styles.heroTitle}>{data.active ? 'Sua prática está aqui.' : 'Dê tempo à sua música.'}</Text>
                        <Text style={styles.heroCopy}>{data.active ? 'Retome o cronômetro e salve mais um capítulo.' : 'Comece uma sessão e transforme cada minuto em evolução.'}</Text>
                        <FlowButton variant="secondary" style={styles.heroButton} disabled={!ready} onPress={() => open('Practice')}>{data.active ? 'Retomar prática  →' : 'Começar prática  →'}</FlowButton>
                        <Pressable accessibilityRole="button" disabled={!ready} onPress={() => open('AddPractice')} style={styles.manualLink}><Text style={styles.manualText}>Já pratiquei. adicionar ao histórico</Text></Pressable>
                    </View>
                    <View style={styles.stats}>
                        <View style={styles.stat}><Text style={styles.statValue}>{ready ? formatDuration(stats.totalSeconds) : '—'}</Text><Text style={styles.statLabel}>de música registrada</Text></View>
                        <View style={styles.statDivider} />
                        <Pressable accessibilityRole="button" accessibilityLabel={`${stats.count} práticas salvas. Abrir progresso`} onPress={() => open('Progress')} style={styles.stat}><Text style={styles.statValue}>{ready ? stats.count : '—'}</Text><Text style={styles.statLabel}>práticas salvas</Text></Pressable>
                        <View style={styles.statDivider} />
                        <View style={styles.stat}><Text style={styles.statValue}>{ready ? stats.streak : '—'}</Text><Text style={styles.statLabel}>dias seguidos</Text></View>
                    </View>
                    <Text style={styles.sectionTitle}>Sua evolução merece ser ouvida</Text>
                    <View {...target('record')} style={styles.recordWrap}>
                        <Pressable accessibilityRole="button" onPress={() => open('RecordVideo')} style={styles.recordCard}>
                            <View style={styles.recordIcon}><Text style={styles.recordGlyph}>●</Text></View>
                            <View style={styles.actionCopy}><Text style={styles.cardTitle}>Gravar minha prática</Text><Text style={styles.cardCopy}>Um pouco hoje. Fica mais fácil amanhã.</Text></View>
                            <Text style={styles.arrow}>↗</Text>
                        </Pressable>
                    </View>
                    <View {...target('evolution')}>
                        <Pressable accessibilityRole="button" onPress={() => open('EvolutionGallery')} style={styles.galleryCard}>
                            <View style={styles.galleryIcon}><Text style={styles.play}>▶</Text></View>
                            <View style={styles.actionCopy}><Text style={styles.cardTitle}>Minha galeria de evolução</Text><Text style={styles.cardCopy}>Reveja, compare e reconheça seu caminho.</Text></View>
                            <Text style={styles.arrow}>›</Text>
                        </Pressable>
                    </View>
                    <Text style={styles.sectionTitle}>Antes da próxima nota</Text>
                    <View {...target('tools')} style={styles.row}>
                        <Pressable accessibilityRole="button" style={styles.tool} onPress={() => open('Metronome')}><MusicToolIcon type="metronome" /><Text style={styles.cardTitle}>Metrônomo</Text><Text style={styles.cardCopy}>Tic tac tic tac</Text></Pressable>
                        <Pressable accessibilityRole="button" style={styles.tool} onPress={() => open('Tuner')}><MusicToolIcon type="tuner" /><Text style={styles.cardTitle}>Afinador</Text><Text style={styles.cardCopy}>Cada nota no seu lugar</Text></Pressable>
                    </View>
                    <Text style={styles.sectionTitle}>Acompanhe seu caminho</Text>
                    <View {...target('progress')} style={styles.row}>
                        <Pressable accessibilityRole="button" style={styles.smallCard} onPress={() => open('Progress')}><Text style={styles.smallIcon}>↗</Text><Text style={styles.cardTitle}>Progresso</Text><Text style={styles.cardCopy}>Seu tempo, suas conquistas</Text></Pressable>
                        <Pressable accessibilityRole="button" style={styles.smallCard} onPress={() => setTour(0)}><Text style={styles.smallIcon}>?</Text><Text style={styles.cardTitle}>Guia Melodium</Text><Text style={styles.cardCopy}>Vamos conhecer o app?</Text></Pressable>
                    </View>
                    <View style={styles.row}>
                        {[['Trilhas', 'Aprenda por etapas'], ['Conceitos', 'Explore os fundamentos']].map(([title, copy]) => <View key={title} style={[styles.smallCard, styles.unavailable]} accessibilityState={{ disabled: true }}><Text style={styles.soon}>EM BREVE</Text><Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardCopy}>{copy}</Text></View>)}
                    </View>
                </ScrollView>
            </View>
            {tour !== null && <HomeTour step={tour} rect={rect} size={size} onNext={() => setTour((current) => current + 1)} onSkip={closeTour} onSupport={() => { closeTour(); navigation.navigate('Support'); }} />}
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background }, main: { flex: 1 }, content: { padding: 22, paddingBottom: 30 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }, headerCopy: { flex: 1 }, title: { color: colors.brown, fontSize: 29, lineHeight: 35, fontWeight: '800' }, subtitle: { color: colors.muted, fontSize: 12, marginTop: 7 },
    practiceHero: { backgroundColor: colors.brown, borderRadius: 24, padding: 22 }, heroHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    heroEyebrow: { color: colors.green, fontSize: 10, fontWeight: '700', letterSpacing: 1.1 }, heroNote: { fontSize: 30, color: colors.green },
    heroTitle: { fontSize: 28, lineHeight: 34, color: colors.white, fontWeight: '700', marginTop: 7 }, heroCopy: { color: '#E5DCD4', fontSize: 13, lineHeight: 20, marginTop: 10, marginBottom: 18 },
    heroButton: { backgroundColor: colors.green }, manualLink: { minHeight: 42, alignItems: 'center', justifyContent: 'center', marginTop: 5 }, manualText: { color: '#E5DCD4', fontSize: 11 },
    stats: { flexDirection: 'row', alignItems: 'center', paddingVertical: 22 }, stat: { flex: 1, alignItems: 'center' }, statValue: { color: colors.brown, fontSize: 19, fontWeight: '800' }, statLabel: { color: colors.muted, fontSize: 9, marginTop: 5, textAlign: 'center' }, statDivider: { height: 28, width: 1, backgroundColor: colors.border },
    sectionTitle: { color: colors.brown, fontSize: 18, lineHeight: 24, fontWeight: '700', marginTop: 14, marginBottom: 14 },
    recordWrap: { marginBottom: 10 }, recordCard: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 18, backgroundColor: colors.green, borderRadius: 20 },
    recordIcon: { width: 42, height: 42, borderWidth: 1.5, borderColor: colors.brown, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, recordGlyph: { color: colors.brown, fontSize: 24 },
    actionCopy: { flex: 1 }, cardTitle: { fontSize: 15, lineHeight: 20, color: colors.brown, fontWeight: '700', marginTop: 7 }, cardCopy: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 5 },
    arrow: { fontSize: 26, color: colors.brown }, galleryCard: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 20, marginBottom: 10 },
    galleryIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.paleGreen, alignItems: 'center', justifyContent: 'center' }, play: { color: colors.brown, fontSize: 15 },
    row: { flexDirection: 'row', gap: 12, marginBottom: 12 }, tool: { flex: 1, padding: 18, backgroundColor: colors.paleGreen, borderRadius: 18 },
    smallCard: { flex: 1, padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.white }, smallIcon: { color: colors.brown, fontSize: 25 },
    unavailable: { opacity: 0.45 }, soon: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
    notice: { backgroundColor: '#F7E1D6', padding: 12, borderRadius: 12, marginBottom: 14 }, noticeText: { color: colors.brown, fontSize: 12 },
});
