import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ComingSoonPopup from '../components/ComingSoonPopup';
import {
    AppTabs,
    BodyText,
    colors,
    Eyebrow,
    FlowScreen,
    Heading,
} from '../components/FlowUI';

const learningPaths = [
    { title: 'Primeiros acordes', level: 'INICIANTE', lessons: '6 etapas', progress: 0.65, tint: '#C2D5B6' },
    { title: 'Ritmo e levada', level: 'INICIANTE', lessons: '8 etapas', progress: 0.25, tint: '#E7D9A8' },
    { title: 'Harmonia essencial', level: 'INTERMEDIÁRIO', lessons: '10 etapas', progress: 0.1, tint: '#D9BFAE' },
];

const concepts = [
    { title: 'Notas musicais', detail: 'Conheça as sete notas e suas relações.', icon: '♫', tint: '#C2D5B6' },
    { title: 'Ritmo e compasso', detail: 'Entenda pulsação, tempo e divisão.', icon: '◷', tint: '#E7D9A8' },
    { title: 'Acordes', detail: 'Como as notas se combinam em harmonia.', icon: '♬', tint: '#D9BFAE' },
    { title: 'Escalas', detail: 'Explore sequências e tonalidades.', icon: '⌁', tint: '#D8D1CB' },
];

export function PathsScreen({ navigation }) {
    const [comingSoonVisible, setComingSoonVisible] = useState(false);
    const showComingSoon = () => setComingSoonVisible(true);
    return (
        <View style={styles.screen}>
            <FlowScreen contentStyle={styles.content}>
                <Eyebrow>APRENDA POR ETAPAS</Eyebrow>
                <Heading>Trilhas</Heading>
                <BodyText style={styles.subtitle}>Escolha um caminho e avance no seu ritmo.</BodyText>
                <View style={styles.summary}>
                    <View style={styles.summaryIcon}><Text style={styles.summaryGlyph}>↗</Text></View>
                    <View style={styles.summaryCopy}><Text style={styles.summaryTitle}>Seu aprendizado</Text><Text style={styles.summaryText}>3 trilhas em andamento</Text></View>
                    <Pressable onPress={showComingSoon}><Text style={styles.summaryArrow}>›</Text></Pressable>
                </View>
                {learningPaths.map((path) => (
                    <Pressable key={path.title} onPress={showComingSoon} style={styles.pathRow}>
                        <View style={[styles.pathIcon, { backgroundColor: path.tint }]}><Text style={styles.pathGlyph}>♫</Text></View>
                        <View style={styles.pathCopy}>
                            <Text style={styles.pathLevel}>{path.level}</Text>
                            <Text style={styles.pathTitle}>{path.title}</Text>
                            <Text style={styles.pathMeta}>{path.lessons}  ·  {Math.round(path.progress * 100)}% concluído</Text>
                            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${path.progress * 100}%` }]} /></View>
                        </View>
                        <Text style={styles.rowArrow}>›</Text>
                    </Pressable>
                ))}
                <Pressable onPress={showComingSoon} style={styles.linkRow}>
                    <Text style={styles.linkText}>Explorar conceitos musicais</Text><Text style={styles.rowArrow}>›</Text>
                </Pressable>
            </FlowScreen>
            <AppTabs navigation={navigation} />
            <ComingSoonPopup visible={comingSoonVisible} onClose={() => setComingSoonVisible(false)} />
        </View>
    );
}

export function ConceptsScreen({ navigation }) {
    const [comingSoonVisible, setComingSoonVisible] = useState(false);
    const showComingSoon = () => setComingSoonVisible(true);
    return (
        <View style={styles.screen}>
            <FlowScreen contentStyle={styles.content}>
                <View style={styles.headingRow}>
                    <View><Eyebrow>CONSULTE FUNDAMENTOS</Eyebrow><Heading>Conceitos musicais</Heading></View>
                    <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>×</Text></Pressable>
                </View>
                <BodyText style={styles.subtitle}>Fundamentos para acompanhar sua jornada.</BodyText>
                <View style={styles.conceptList}>
                    {concepts.map((concept) => (
                        <Pressable key={concept.title} onPress={showComingSoon} style={styles.conceptRow}>
                            <View style={[styles.conceptIcon, { backgroundColor: concept.tint }]}><Text style={styles.conceptGlyph}>{concept.icon}</Text></View>
                            <View style={styles.conceptCopy}><Text style={styles.pathTitle}>{concept.title}</Text><Text style={styles.conceptDetail}>{concept.detail}</Text></View>
                            <Text style={styles.rowArrow}>›</Text>
                        </Pressable>
                    ))}
                </View>
                <Pressable onPress={showComingSoon} style={styles.linkRow}>
                    <Text style={styles.linkText}>Ver trilhas de aprendizado</Text><Text style={styles.rowArrow}>›</Text>
                </Pressable>
            </FlowScreen>
            <AppTabs navigation={navigation} />
            <ComingSoonPopup visible={comingSoonVisible} onClose={() => setComingSoonVisible(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { paddingTop: 28, paddingBottom: 24 },
    subtitle: { marginTop: 7, marginBottom: 22 },
    summary: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: colors.green, borderRadius: 11, marginBottom: 16 },
    summaryIcon: { width: 42, height: 42, borderRadius: 11, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
    summaryGlyph: { color: colors.brown, fontSize: 23 },
    summaryCopy: { flex: 1, marginLeft: 12 },
    summaryTitle: { color: colors.brown, fontSize: 14, fontWeight: '700' },
    summaryText: { color: colors.muted, fontSize: 11, marginTop: 3 },
    summaryArrow: { color: colors.brown, fontSize: 25 },
    pathRow: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 11, marginBottom: 10 },
    pathIcon: { width: 45, height: 45, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    pathGlyph: { color: colors.brown, fontSize: 22 },
    pathCopy: { flex: 1, marginLeft: 12 },
    pathLevel: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
    pathTitle: { color: colors.brown, fontSize: 14, fontWeight: '700', marginTop: 4 },
    pathMeta: { color: colors.muted, fontSize: 10, marginTop: 4 },
    progressTrack: { height: 5, borderRadius: 3, backgroundColor: colors.paleGreen, overflow: 'hidden', marginTop: 9 },
    progressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.brown },
    rowArrow: { color: colors.muted, fontSize: 24, marginLeft: 12 },
    linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 50, marginTop: 8, paddingHorizontal: 5 },
    linkText: { color: colors.brown, fontSize: 13, fontWeight: '700' },
    headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    back: { color: colors.brown, fontSize: 30, lineHeight: 34 },
    conceptList: { gap: 10 },
    conceptRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 13 },
    conceptIcon: { width: 45, height: 45, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    conceptGlyph: { color: colors.brown, fontSize: 24 },
    conceptCopy: { flex: 1, marginLeft: 12 },
    conceptDetail: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },

});
