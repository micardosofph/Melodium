import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import VinylRecord from '../components/VinylRecord';
import { BodyText, BrandMark, colors, Eyebrow, FlowButton, FlowField, FlowScreen, Heading } from '../components/FlowUI';
import { localData, useLocalData } from '../services/localData';
import { cancelDailyReminder, scheduleDailyReminder } from '../services/dailyReminder';
import { formatReminderTime } from '../services/reminderModel';

const capabilities = [
    { icon: '◉', title: 'Pratique com intenção', text: 'Cronometre suas sessões e construa um histórico real.' },
    { icon: '♬', title: 'Afinador e metrônomo', text: 'Tenha as ferramentas essenciais sempre por perto.' },
    { icon: '▶', title: 'Grave sua evolução', text: 'Dê nome aos vídeos e compare seus momentos na galeria.' },
    { icon: '↗', title: 'Perceba seu caminho', text: 'Acompanhe tempo total, dias ativos e sua ofensiva.' },
    { icon: 'Me', title: 'Seu diário musical', text: 'Guarde notas, fotos, personalize o perfil e mantenha tudo salvo localmente.' },
];

export function LaunchScreen({ navigation }) {
    const { ready, error, data } = useLocalData();
    useEffect(() => {
        if (!ready) return;
        const route = !data.onboardingSeen ? { name: 'AppGuide' } : data.profileName ? { name: 'Home' } : { name: 'Name', params: { completeToHome: true } };
        navigation.reset({ index: 0, routes: [route] });
    }, [ready, data.onboardingSeen, data.profileName, navigation]);
    return <FlowScreen scroll={false} contentStyle={styles.launchContent}>
        <BrandMark />
        <View style={styles.launchCenter}><VinylRecord size={112} /><BodyText style={styles.launchText}>{error || 'Preparando seu espaço musical…'}</BodyText></View>
        {error && <FlowButton onPress={() => localData.load().catch(() => {})}>Tentar novamente</FlowButton>}
    </FlowScreen>;
}

export function AppGuideScreen({ navigation }) {
    return <FlowScreen contentStyle={styles.guideContent}>
        <BrandMark compact />
        <View style={styles.guideHeading}>
            <Eyebrow>SEU ESTÚDIO DE BOLSO</Eyebrow>
            <Heading style={styles.guideTitle}>Tudo para ouvir a sua evolução.</Heading>
            <BodyText style={styles.guideDescription}>O Melodium transforma alguns minutos de música em um caminho que você consegue acompanhar.</BodyText>
        </View>
        <View style={styles.capabilityList}>{capabilities.map((item) => <View key={item.title} style={styles.capabilityCard}>
            <View style={styles.capabilityIcon}><Text style={styles.capabilityGlyph}>{item.icon}</Text></View>
            <View style={styles.capabilityCopy}><Text style={styles.capabilityTitle}>{item.title}</Text><Text style={styles.capabilityText}>{item.text}</Text></View>
        </View>)}</View>
        <View style={styles.moreCard}><Text style={styles.moreEyebrow}>ESTAMOS SÓ AQUECENDO</Text><Text style={styles.moreTitle}>E vem mais por aí!</Text><Text style={styles.moreText}>Novas formas de aprender, praticar e compartilhar música já estão no horizonte.</Text></View>
        <FlowButton onPress={() => navigation.navigate('Welcome')} style={styles.guideButton}>Continuar  →</FlowButton>
    </FlowScreen>;
}

export function WelcomeScreen({ navigation }) {
    return <FlowScreen contentStyle={styles.welcomeContent}>
        <BrandMark />
        <View style={styles.welcomeHero}>
            <View style={styles.musicScene} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <View style={styles.staff}>{[0, 1, 2, 3, 4].map((line) => <View key={line} style={styles.staffLine} />)}</View>
                <Text style={[styles.floatingNote, styles.noteLeft]}>♫</Text><Text style={[styles.floatingNote, styles.noteRight]}>♪</Text><Text style={[styles.floatingNote, styles.noteSmall]}>♩</Text>
                <View style={styles.welcomeDisc}><VinylRecord size={144} /></View>
                <View style={styles.sceneCaption}><Text style={styles.sceneCaptionText}>TODO SOM TEM UM COMEÇO</Text></View>
            </View>
            <Eyebrow style={styles.centered}>SEU ESPAÇO MUSICAL</Eyebrow><Heading style={styles.welcomeTitle}>Encontre seu ritmo.</Heading>
            <BodyText style={styles.welcomeCopy}>Afine seu instrumento, acompanhe a batida, registre práticas e grave sua evolução. A próxima nota é sua.</BodyText>
            <View style={styles.practiceHint}><Text style={styles.hintNote} accessible={false}>♬</Text><BodyText style={styles.hintText}>Um instrumento, alguns minutos e vontade de tocar.</BodyText></View>
        </View>
        <View style={styles.welcomeActions}><FlowButton onPress={() => navigation.navigate('Name')}>Criar meu espaço  →</FlowButton><Text style={styles.localNote}>Livre para experimentar. Sem conta ou cadastro.</Text></View>
    </FlowScreen>;
}

export function NameScreen({ navigation, route }) {
    const { data, ready } = useLocalData();
    const editing = route.params?.editing === true;
    const completeToHome = route.params?.completeToHome === true;
    const [name, setName] = useState(data.profileName || '');
    const [busy, setBusy] = useState(false);
    const save = async () => {
        if (!ready || busy) return;
        setBusy(true);
        try {
            await localData.setProfileName(name);
            if (editing) navigation.goBack();
            else if (completeToHome) navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
            else navigation.navigate('Reminder');
        } catch (error) { Alert.alert('Como podemos te chamar?', error.message || 'Digite seu nome para continuar.'); }
        finally { setBusy(false); }
    };
    return <FlowScreen contentStyle={styles.nameContent}>
        <BrandMark compact />
        <View style={styles.nameHero}>
            <View style={styles.nameAvatar}><Text style={styles.nameAvatarText}>Me</Text></View>
            <Eyebrow style={styles.centered}>{editing ? 'SEU PERFIL' : 'ANTES DA PRIMEIRA NOTA'}</Eyebrow>
            <Heading style={styles.nameTitle}>{editing ? 'Como quer aparecer?' : 'Como podemos te chamar?'}</Heading>
            <BodyText style={styles.nameCopy}>Este nome aparece no seu perfil e no diário de evolução. Ele fica somente neste aparelho.</BodyText>
        </View>
        <FlowField label="Seu nome" autoFocus maxLength={40} autoCapitalize="words" returnKeyType="done" value={name} onChangeText={setName} onSubmitEditing={save} placeholder="Ex.: Miguel" />
        <FlowButton disabled={!ready || busy || !name.trim()} onPress={save}>{busy ? 'Salvando…' : editing ? 'Salvar nome' : 'Continuar  →'}</FlowButton>
    </FlowScreen>;
}

function TimeColumn({ label, value, onDecrease, onIncrease }) {
    return <View style={styles.timeColumn}><Text style={styles.timeLabel}>{label}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`Aumentar ${label}`} onPress={onIncrease} style={styles.timeAdjust}><Text style={styles.timeAdjustText}>+</Text></Pressable>
        <Text style={styles.timeValue}>{String(value).padStart(2, '0')}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`Diminuir ${label}`} onPress={onDecrease} style={styles.timeAdjust}><Text style={styles.timeAdjustText}>−</Text></Pressable>
    </View>;
}

export function ReminderScreen({ navigation, route }) {
    const { data, ready } = useLocalData();
    const editing = route.params?.editing === true;
    const current = data.dailyReminder;
    const [hour, setHour] = useState(current?.enabled ? current.hour : 9);
    const [minute, setMinute] = useState(current?.enabled ? current.minute : 0);
    const [busy, setBusy] = useState(false);
    const finish = async () => {
        if (!editing) await localData.finishOnboarding();
        if (editing) navigation.goBack(); else navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    };
    const activate = async () => {
        if (!ready || busy) return;
        setBusy(true);
        let identifier;
        try {
            identifier = await scheduleDailyReminder(hour, minute, current?.identifier);
            await localData.setDailyReminder({ enabled: true, hour, minute, identifier });
            await finish();
        } catch (error) {
            if (identifier) await cancelDailyReminder(identifier);
            Alert.alert(error.code === 'NOTIFICATION_PERMISSION_DENIED' ? 'Notificações desativadas' : 'Não foi possível criar o lembrete', error.message || 'Tente novamente.');
        } finally { setBusy(false); }
    };
    const disable = async () => {
        if (busy) return;
        setBusy(true);
        try {
            await cancelDailyReminder(current?.identifier);
            await localData.setDailyReminder({ enabled: false, hour, minute, identifier: null });
            await finish();
        } catch { Alert.alert('Não foi possível salvar', 'Tente novamente.'); }
        finally { setBusy(false); }
    };
    const setPreset = (nextHour) => { setHour(nextHour); setMinute(0); };
    return <FlowScreen contentStyle={styles.reminderContent}>
        <BrandMark compact />
        <View style={styles.reminderHero}><View style={styles.reminderBell}><Text style={styles.reminderBellGlyph}>♪</Text></View>
            <Eyebrow style={styles.centered}>{editing ? 'SEU LEMBRETE' : 'UM EMPURRÃOZINHO MUSICAL'}</Eyebrow>
            <Heading style={styles.reminderTitle}>{editing ? 'Qual é o melhor horário?' : 'Quando a música chama?'}</Heading>
            <BodyText style={styles.reminderCopy}>Escolha um horário para receber um convite diário. Ele fica agendado somente neste aparelho.</BodyText>
        </View>
        <View style={styles.timePicker}>
            <TimeColumn label="hora" value={hour} onIncrease={() => setHour((value) => (value + 1) % 24)} onDecrease={() => setHour((value) => (value + 23) % 24)} />
            <Text style={styles.timeSeparator}>:</Text>
            <TimeColumn label="minutos" value={minute} onIncrease={() => setMinute((value) => (value + 5) % 60)} onDecrease={() => setMinute((value) => (value + 55) % 60)} />
        </View>
        <Text style={styles.suggestionLabel}>SUGESTÕES</Text>
        <View style={styles.presets}>{[[9, '09:00'], [18, '18:00'], [20, '20:00']].map(([value, label]) => <Pressable key={label} accessibilityRole="button" onPress={() => setPreset(value)} style={[styles.preset, hour === value && minute === 0 && styles.presetActive]}><Text style={[styles.presetText, hour === value && minute === 0 && styles.presetTextActive]}>{label}</Text></Pressable>)}</View>
        <View style={styles.reminderActions}><FlowButton disabled={!ready || busy} onPress={activate}>{busy ? 'Salvando…' : `Lembrar todos os dias às ${formatReminderTime(hour, minute)}`}</FlowButton><FlowButton disabled={busy} variant="text" onPress={disable}>{editing && current?.enabled ? 'Desativar lembrete' : 'Agora não'}</FlowButton></View>
    </FlowScreen>;
}

const styles = StyleSheet.create({
    launchContent: { justifyContent: 'space-between' }, launchCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22 }, launchText: { textAlign: 'center' },
    guideContent: { paddingTop: 18, paddingBottom: 32 }, guideHeading: { marginTop: 32 }, guideTitle: { fontSize: 32, lineHeight: 38, maxWidth: 350 }, guideDescription: { marginTop: 10, maxWidth: 360 },
    capabilityList: { gap: 10, marginTop: 24 }, capabilityCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 15, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 18 }, capabilityIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paleGreen }, capabilityGlyph: { color: colors.brown, fontSize: 22, fontWeight: '700' }, capabilityCopy: { flex: 1 }, capabilityTitle: { color: colors.brown, fontSize: 14, fontWeight: '800' }, capabilityText: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
    moreCard: { marginTop: 18, padding: 20, backgroundColor: colors.brown, borderRadius: 22 }, moreEyebrow: { color: colors.green, fontSize: 9, fontWeight: '800', letterSpacing: 1 }, moreTitle: { color: colors.white, fontSize: 24, fontWeight: '800', marginTop: 7 }, moreText: { color: '#E5DCD4', fontSize: 12, lineHeight: 18, marginTop: 7 }, guideButton: { marginTop: 18 },
    welcomeContent: { paddingTop: 20, paddingBottom: 36 }, welcomeHero: { flex: 1, justifyContent: 'center', paddingVertical: 24, width: '100%', maxWidth: 480, alignSelf: 'center' }, centered: { textAlign: 'center' }, musicScene: { height: 194, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }, staff: { position: 'absolute', left: 0, right: 0, top: 48, gap: 14, transform: [{ rotate: '-7deg' }] }, staffLine: { height: 1, backgroundColor: colors.border }, floatingNote: { position: 'absolute', color: colors.muted, fontSize: 44 }, noteLeft: { left: '5%', top: 20, transform: [{ rotate: '-15deg' }] }, noteRight: { right: '5%', top: 64, fontSize: 56, transform: [{ rotate: '14deg' }] }, noteSmall: { left: '16%', bottom: 20, fontSize: 28 }, welcomeDisc: { transform: [{ rotate: '-12deg' }] }, sceneCaption: { position: 'absolute', bottom: 0, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 20, backgroundColor: colors.paleGreen }, sceneCaptionText: { color: colors.brown, fontSize: 9, fontWeight: '700', letterSpacing: 1 }, welcomeTitle: { textAlign: 'center', fontSize: 32, lineHeight: 39 }, welcomeCopy: { textAlign: 'center', marginTop: 10 }, practiceHint: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 20 }, hintNote: { color: colors.muted, fontSize: 28 }, hintText: { flex: 1, fontSize: 13, lineHeight: 19 }, welcomeActions: { gap: 10, width: '100%', maxWidth: 480, alignSelf: 'center' }, localNote: { color: colors.muted, fontSize: 12, textAlign: 'center' },
    nameContent: { paddingTop: 20, paddingBottom: 32 }, nameHero: { alignItems: 'center', marginTop: 64, marginBottom: 30 }, nameAvatar: { width: 86, height: 86, borderRadius: 43, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.green, borderWidth: 2, borderColor: colors.brown, marginBottom: 24 }, nameAvatarText: { color: colors.brown, fontSize: 27, fontWeight: '800' }, nameTitle: { textAlign: 'center', fontSize: 30, lineHeight: 37 }, nameCopy: { textAlign: 'center', marginTop: 10, maxWidth: 350 },
    reminderContent: { paddingTop: 18, paddingBottom: 28 }, reminderHero: { alignItems: 'center', marginTop: 30 }, reminderBell: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.green, borderWidth: 2, borderColor: colors.brown, alignItems: 'center', justifyContent: 'center', marginBottom: 22 }, reminderBellGlyph: { color: colors.brown, fontSize: 35 }, reminderTitle: { textAlign: 'center', fontSize: 30, lineHeight: 36 }, reminderCopy: { textAlign: 'center', marginTop: 9, maxWidth: 340 },
    timePicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 26 }, timeColumn: { alignItems: 'center' }, timeLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 }, timeAdjust: { width: 54, height: 36, alignItems: 'center', justifyContent: 'center' }, timeAdjustText: { color: colors.brown, fontSize: 26 }, timeValue: { minWidth: 90, textAlign: 'center', color: colors.brown, fontSize: 56, lineHeight: 66, fontWeight: '800', fontVariant: ['tabular-nums'] }, timeSeparator: { color: colors.brown, fontSize: 48, fontWeight: '700', marginHorizontal: 1, marginTop: 14 }, suggestionLabel: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1, textAlign: 'center', marginTop: 20 }, presets: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginTop: 10 }, preset: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white }, presetActive: { backgroundColor: colors.green, borderColor: colors.brown }, presetText: { color: colors.muted, fontSize: 11 }, presetTextActive: { color: colors.brown, fontWeight: '700' }, reminderActions: { marginTop: 25, gap: 4 },
});
