import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BodyText, colors, Eyebrow, FlowButton, FlowScreen, Heading } from '../components/FlowUI';
import { localData, useLocalData } from '../services/localData';
import { formatDuration, practiceStats } from '../services/practiceModel';

export default function ProgressScreen({ navigation }) {
    const { ready, error, data } = useLocalData();
    const stats = practiceStats(data.sessions);
    const max = Math.max(60, ...stats.days.map((day) => day.seconds));
    return (
        <FlowScreen>
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
            <Eyebrow>UM POUCO A CADA DIA</Eyebrow>
            <Heading>Sua evolução</Heading>
            <BodyText style={styles.subtitle}>Tempo que virou música.</BodyText>
            {!ready ? <BodyText>{error || 'Carregando seu histórico...'}</BodyText> : <>
                {error && <BodyText>{error}</BodyText>}
                <View style={styles.hero}>
                    <Text style={styles.heroLabel}>TEMPO TOTAL DE PRÁTICA</Text>
                    <Text style={styles.total}>{formatDuration(stats.totalSeconds)}</Text>
                    <Text style={styles.heroCaption}>{stats.count} práticas salvas · {stats.activeDays} dias de música</Text>
                </View>
                <View style={styles.row}>
                    <View style={styles.stat}><Text style={styles.value}>{stats.streak}</Text><Text style={styles.label}>dias seguidos</Text></View>
                    <View style={styles.stat}><Text style={styles.value}>{formatDuration(stats.weekSeconds)}</Text><Text style={styles.label}>nos últimos 7 dias</Text></View>
                </View>
                <Text style={styles.section}>Seu ritmo na semana</Text>
                <View style={styles.chart} accessibilityLabel={`Últimos sete dias: ${formatDuration(stats.weekSeconds)}, ${stats.weekDays} dias de prática`}>
                    {stats.days.map((day) => <View key={day.key} style={styles.column}>
                        <Text style={styles.barValue}>{day.seconds ? formatDuration(day.seconds) : '—'}</Text>
                        <View style={styles.barTrack}><View style={[styles.bar, { height: day.seconds ? Math.max(5, day.seconds / max * 100) : 0 }]} /></View>
                        <Text style={styles.day}>{day.label}</Text>
                    </View>)}
                </View>
                <Text style={styles.section}>Práticas registradas</Text>
                {data.sessions.length ? data.sessions.map((session) => <View key={session.id} style={styles.session}>
                    <View style={styles.sessionCopy}><Text style={styles.sessionTitle}>{session.title}</Text><Text style={styles.label}>{session.instrument} · {new Date(session.completedAt).toLocaleDateString('pt-BR')}</Text></View>
                    <Text style={styles.duration}>{formatDuration(session.durationSeconds)}</Text>
                </View>) : <View style={styles.empty}><Text style={styles.sessionTitle}>Sua primeira prática começa agora</Text><BodyText style={styles.small}>Inicie o cronômetro ou registre uma sessão que já aconteceu.</BodyText><FlowButton onPress={() => navigation.navigate('Practice')}>Começar uma prática</FlowButton></View>}
                <View style={styles.soon}><Eyebrow>EM BREVE</Eyebrow><Text style={styles.sessionTitle}>Sua evolução vai ganhar novos olhares.</Text><BodyText style={styles.small}>Mais formas de acompanhar seu aprendizado estão chegando. Continue registrando sua música.</BodyText></View>
            </>}
            {!ready && error && <FlowButton onPress={() => localData.load().catch(() => {})}>Tentar novamente</FlowButton>}
        </FlowScreen>
    );
}
const styles = StyleSheet.create({
    back: { minHeight: 40, width: 44, justifyContent: 'center', marginBottom: 12 }, backText: { fontSize: 32, color: colors.brown },
    subtitle: { marginTop: 6, marginBottom: 22 }, hero: { backgroundColor: colors.brown, padding: 24, borderRadius: 24 },
    heroLabel: { color: colors.green, fontSize: 10, fontWeight: '700', letterSpacing: 1 }, total: { color: colors.white, fontSize: 38, fontWeight: '700', marginVertical: 10 },
    heroCaption: { color: '#E1D5CA', fontSize: 12 }, row: { flexDirection: 'row', gap: 12, marginTop: 12 },
    stat: { flex: 1, padding: 18, backgroundColor: colors.paleGreen, borderRadius: 18 }, value: { color: colors.brown, fontSize: 24, fontWeight: '700' },
    label: { color: colors.muted, fontSize: 12, marginTop: 5 }, section: { fontSize: 20, color: colors.brown, fontWeight: '700', marginTop: 28, marginBottom: 14 },
    chart: { flexDirection: 'row', gap: 5, backgroundColor: colors.white, borderRadius: 20, padding: 14 }, column: { flex: 1, alignItems: 'center' },
    barValue: { color: colors.muted, fontSize: 9, marginBottom: 7 }, barTrack: { height: 100, width: '100%', maxWidth: 24, backgroundColor: colors.paleGreen, borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
    bar: { backgroundColor: '#7F9D6C', borderRadius: 8 }, day: { color: colors.brown, fontSize: 10, marginTop: 8 },
    session: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    sessionCopy: { flex: 1 }, sessionTitle: { color: colors.brown, fontSize: 16, lineHeight: 22, fontWeight: '700' }, duration: { color: colors.brown, fontSize: 13, fontWeight: '700' },
    empty: { backgroundColor: colors.paleGreen, padding: 20, borderRadius: 18 }, small: { fontSize: 13, lineHeight: 20, marginTop: 8, marginBottom: 14 },
    soon: { marginTop: 28, padding: 20, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: 18 },
});
