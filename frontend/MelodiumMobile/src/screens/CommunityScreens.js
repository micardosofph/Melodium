import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    BodyText,
    colors,
    Eyebrow,
    FlowButton,
    FlowScreen,
    Heading,
    ScreenHeader,
} from '../components/FlowUI';
import ProfileAvatar from '../components/ProfileAvatar';
import { localData, useLocalData } from '../services/localData';
import { formatDuration, practiceStats } from '../services/practiceModel';
import { pickProfilePhoto, removeStoredProfilePhoto, takeProfilePhoto } from '../services/profilePhoto';
import { formatReminderTime } from '../services/reminderModel';
import { pickDiaryPhoto, removeDiaryPhoto, takeDiaryPhoto } from '../services/diaryPhoto';

function diaryDate(value) {
    return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function SocialScreen({ navigation, embedded = false }) {
    const { data } = useLocalData();
    const removeEntry = (entry) => Alert.alert('Apagar esta nota?', 'A nota e a foto guardada nela serão removidas deste aparelho.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: async () => {
            try { await localData.removeDiaryEntry(entry.id); removeDiaryPhoto(entry.photoUri); }
            catch { Alert.alert('Não foi possível apagar', 'Tente novamente.'); }
        } },
    ]);

    return (
        <SafeAreaView style={styles.screen} edges={embedded ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']}>
            <ScrollView contentContainerStyle={styles.feedContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <Eyebrow>SEU CAMINHO EM NOTAS</Eyebrow>
                        <Heading>Diário de evolução</Heading>
                    </View>
                    <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={() => navigation.navigate('User')}>
                        <ProfileAvatar uri={data.profilePhotoUri} size={44} />
                    </Pressable>
                </View>
                <BodyText style={styles.intro}>Registre descobertas, dificuldades e pequenas vitórias. Você não vai se arrepender de anotar isso.</BodyText>

                <Pressable style={styles.compose} onPress={() => navigation.navigate('DiaryEntry')}>
                    <ProfileAvatar uri={data.profilePhotoUri} size={36} />
                    <Text style={styles.composePlaceholder}>Escreva uma nota sobre hoje...</Text>
                    <Text style={styles.composeArrow}>＋</Text>
                </Pressable>

                {data.diaryEntries.length === 0 ? <View style={styles.emptyDiary}>
                    <View style={styles.emptyDiaryIcon}><Text style={styles.emptyDiaryGlyph}>♬</Text></View>
                    <Text style={styles.emptyDiaryTitle}>Sua primeira nota começa aqui.</Text>
                    <BodyText style={styles.emptyDiaryText}>Conte como foi a prática de hoje, o que melhorou ou o que você quer tentar amanhã.</BodyText>
                    <FlowButton onPress={() => navigation.navigate('DiaryEntry')} style={styles.emptyDiaryButton}>Escrever minha primeira nota</FlowButton>
                </View> : data.diaryEntries.map((entry) => (
                        <View style={styles.post} key={entry.id}>
                            <View style={styles.postHeader}>
                                <ProfileAvatar uri={data.profilePhotoUri} size={42} />
                                <View style={styles.postIdentity}>
                                    <Text style={styles.postName}>{data.profileName || 'Musicista'}</Text>
                                    <Text style={styles.postMeta}>{diaryDate(entry.createdAt)} · salvo localmente</Text>
                                </View>
                                <Pressable accessibilityRole="button" accessibilityLabel="Apagar nota" onPress={() => removeEntry(entry)} style={styles.deleteEntry}><Text style={styles.deleteEntryText}>×</Text></Pressable>
                            </View>
                            <Text style={styles.caption}>{entry.text}</Text>
                            {entry.photoUri && <Image source={{ uri: entry.photoUri }} style={styles.diaryImage} />}
                        </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

export function DiaryEntryScreen({ navigation }) {
    const [text, setText] = useState('');
    const [photoUri, setPhotoUri] = useState(null);
    const [busy, setBusy] = useState(false);
    const photoRef = useRef(null);
    const saved = useRef(false);
    useEffect(() => { photoRef.current = photoUri; }, [photoUri]);
    useEffect(() => () => { if (!saved.current) removeDiaryPhoto(photoRef.current); }, []);
    const choosePhoto = async (source) => {
        try {
            const nextUri = source === 'camera' ? await takeDiaryPhoto() : await pickDiaryPhoto();
            if (!nextUri) return;
            removeDiaryPhoto(photoUri);
            setPhotoUri(nextUri);
        } catch (error) {
            if (error.code === 'CAMERA_PERMISSION_DENIED') {
                Alert.alert('Acesso à câmera necessário', error.message);
                return;
            }
            Alert.alert('Não foi possível adicionar a foto', 'Tente novamente com outra imagem.');
        }
    };
    const openPhotoActions = () => Alert.alert(photoUri ? 'Trocar foto' : 'Adicionar foto', 'Como você quer adicionar a imagem?', [
        { text: 'Tirar foto', onPress: () => choosePhoto('camera') },
        { text: 'Escolher da galeria', onPress: () => choosePhoto('library') },
        { text: 'Cancelar', style: 'cancel' },
    ]);
    const save = async () => {
        if (busy) return;
        setBusy(true);
        try {
            await localData.addDiaryEntry({ text, photoUri });
            saved.current = true;
            navigation.goBack();
        } catch (error) { Alert.alert('Não foi possível salvar', error.message || 'Tente novamente.'); }
        finally { setBusy(false); }
    };
    return <FlowScreen contentStyle={styles.entryContent}>
        <ScreenHeader navigation={navigation} title="Nova nota" />
        <Eyebrow style={styles.entryEyebrow}>DIÁRIO DE EVOLUÇÃO</Eyebrow>
        <Heading>O que a música te ensinou hoje?</Heading>
        <BodyText style={styles.entryIntro}>Pode ser uma conquista, uma dificuldade ou só uma sensação que você quer guardar.</BodyText>
        <TextInput multiline maxLength={600} value={text} onChangeText={setText} placeholder="Ex.: Hoje consegui trocar os acordes sem parar pela primeira vez..." placeholderTextColor={colors.soft} selectionColor={colors.brown} textAlignVertical="top" style={styles.diaryInput} />
        {photoUri ? <View style={styles.photoPreviewWrap}><Image source={{ uri: photoUri }} style={styles.photoPreview} /><Pressable accessibilityRole="button" onPress={() => { removeDiaryPhoto(photoUri); setPhotoUri(null); }} style={styles.removePhoto}><Text style={styles.removePhotoText}>Remover foto</Text></Pressable></View> : null}
        <FlowButton variant="secondary" onPress={openPhotoActions}>{photoUri ? 'Trocar foto' : 'Adicionar uma foto · opcional'}</FlowButton>
        <FlowButton disabled={busy || !text.trim()} onPress={save} style={styles.saveEntry}>{busy ? 'Salvando...' : 'Guardar no meu diário'}</FlowButton>
    </FlowScreen>;
}

export function UserScreen({ navigation }) {
    const [menuVisible, setMenuVisible] = useState(false);
    const [photoBusy, setPhotoBusy] = useState(false);

    const { data, ready } = useLocalData();
    const stats = practiceStats(data.sessions);
    const choosePhoto = async (source) => {
        if (photoBusy) return;
        setPhotoBusy(true);
        let nextUri;
        try {
            nextUri = source === 'camera' ? await takeProfilePhoto() : await pickProfilePhoto();
            if (!nextUri) return;
            const previousUri = data.profilePhotoUri;
            await localData.setProfilePhoto(nextUri);
            removeStoredProfilePhoto(previousUri);
        } catch (error) {
            removeStoredProfilePhoto(nextUri);
            if (error.code === 'CAMERA_PERMISSION_DENIED') {
                Alert.alert('Acesso à câmera necessário', error.message);
                return;
            }
            Alert.alert('Não foi possível trocar a foto', 'Escolha outra imagem e tente novamente.');
        } finally { setPhotoBusy(false); }
    };
    const removePhoto = () => Alert.alert('Remover foto de perfil?', 'O avatar volta a ser a bolinha verde com “Me”.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: async () => {
            const previousUri = data.profilePhotoUri;
            try { await localData.setProfilePhoto(null); removeStoredProfilePhoto(previousUri); }
            catch { Alert.alert('Não foi possível remover a foto', 'Tente novamente.'); }
        } },
    ]);
    const openPhotoSourceActions = () => Alert.alert('Foto de perfil', 'Como você quer adicionar a imagem?', [
        { text: 'Tirar foto', onPress: () => choosePhoto('camera') },
        { text: 'Escolher da galeria', onPress: () => choosePhoto('library') },
        { text: 'Cancelar', style: 'cancel' },
    ]);
    const openPhotoActions = () => data.profilePhotoUri
        ? Alert.alert('Foto de perfil', 'Esta imagem fica somente neste aparelho.', [
            { text: 'Trocar foto', onPress: openPhotoSourceActions },
            { text: 'Remover foto', style: 'destructive', onPress: removePhoto },
            { text: 'Cancelar', style: 'cancel' },
        ])
        : openPhotoSourceActions();

    return (
        <View style={styles.screen}>
            <FlowScreen contentStyle={styles.profileContent}>
                <ScreenHeader
                    navigation={navigation}
                    title="Perfil"
                    right={<Pressable accessibilityRole="button" accessibilityLabel="Mais opções do perfil" onPress={() => setMenuVisible(true)} style={styles.menuTrigger}><Text style={styles.more}>···</Text></Pressable>}
                />
                <View style={styles.profileHero}>
                    <Pressable accessibilityRole="button" accessibilityLabel="Trocar foto de perfil" disabled={photoBusy} onPress={openPhotoActions} style={photoBusy && { opacity: 0.55 }}>
                        <ProfileAvatar uri={data.profilePhotoUri} size={96} />
                        <View style={styles.photoEdit}><Text style={styles.photoEditText}>✎</Text></View>
                    </Pressable>
                    <Pressable accessibilityRole="button" onPress={openPhotoActions} disabled={photoBusy}><Text style={styles.changePhoto}>{photoBusy ? 'Salvando foto...' : 'Trocar foto'}</Text></Pressable>
                    <Heading style={styles.name}>{data.profileName || 'Musicista'}</Heading>
                    <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Name', { editing: true })}><Text style={styles.editName}>Editar nome</Text></Pressable>
                    <BodyText style={styles.bio}>Música faz parte do meu dia.</BodyText>
                </View>
                <View style={styles.stats}>
                    <Pressable accessibilityRole="button" accessibilityLabel={`${stats.count} práticas. Abrir progresso`} onPress={() => navigation.navigate('Progress')} style={styles.stat}><Text style={styles.statValue}>{ready ? stats.count : '—'}</Text><Text style={styles.statLabel}>práticas</Text></Pressable>
                    <View style={styles.stat}><Text style={styles.statValue}>{ready ? formatDuration(stats.totalSeconds) : '—'}</Text><Text style={styles.statLabel}>praticados</Text></View>
                    <View style={styles.stat}><Text style={styles.statValue}>{ready ? stats.streak : '—'}</Text><Text style={styles.statLabel}>dias seguidos</Text></View>
                </View>
                <Pressable style={styles.profileAction} onPress={() => navigation.navigate('EvolutionGallery')}>
                    <View style={styles.activityIcon}><Text style={styles.activityGlyph}>▣</Text></View>
                    <View style={styles.activityCopy}><Text style={styles.postName}>Galeria de evolução</Text><Text style={styles.postMeta}>Reviva seus registros de prática</Text></View>
                    <Text style={styles.activityArrow}>›</Text>
                </Pressable>
                <Pressable style={styles.profileAction} onPress={() => navigation.navigate('Support')}>
                    <View style={[styles.activityIcon, styles.activityIconGreen]}><Text style={styles.activityGlyph}>?</Text></View>
                    <View style={styles.activityCopy}><Text style={styles.postName}>Ajuda e suporte</Text><Text style={styles.postMeta}>Fale com a equipe Melodium</Text></View>
                    <Text style={styles.activityArrow}>›</Text>
                </Pressable>
                <Pressable style={styles.profileAction} onPress={() => navigation.navigate('Reminder', { editing: true })}>
                    <View style={[styles.activityIcon, styles.activityIconGreen]}><Text style={styles.activityGlyph}>♪</Text></View>
                    <View style={styles.activityCopy}><Text style={styles.postName}>Lembrete diário</Text><Text style={styles.postMeta}>{data.dailyReminder?.enabled ? `Todos os dias às ${formatReminderTime(data.dailyReminder.hour, data.dailyReminder.minute)}` : 'Desativado · toque para escolher um horário'}</Text></View>
                    <Text style={styles.activityArrow}>›</Text>
                </Pressable>
                <Text style={styles.sectionTitle}>Atividade recente</Text>
                {!ready ? <BodyText>Carregando seus registros…</BodyText> : data.sessions.length === 0
                    ? <BodyText>Sua primeira prática aparece aqui. Vamos tocar?</BodyText>
                    : data.sessions.slice(0, 3).map((session) => (
                        <View style={styles.activity} key={session.id}>
                            <View style={styles.activityIcon}><Text style={styles.activityGlyph}>♫</Text></View>
                            <View style={styles.activityCopy}>
                                <Text style={styles.postName}>{session.title}</Text>
                                <Text style={styles.postMeta}>{new Date(session.completedAt).toLocaleDateString('pt-BR')} · {formatDuration(session.durationSeconds)}</Text>
                            </View>
                        </View>
                    ))}
            </FlowScreen>
            <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
                <Pressable style={styles.menuRoot} onPress={() => setMenuVisible(false)}>
                    <Pressable style={styles.menuPanel} onPress={(event) => event.stopPropagation()}>
                        <View style={[styles.menuOption, { maxWidth: 280, paddingVertical: 16, gap: 8 }]}>
                            <Text style={styles.menuOptionText}>Erro 4/4 encontrado.</Text>
                            <BodyText style={{ fontSize: 13, lineHeight: 19 }}>Ops, ainda não temos o que colocar nessa seção, finja que você não viu nada. 🤫</BodyText>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    feedContent: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 24 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    avatarText: { color: colors.brown, fontSize: 12, fontWeight: '700' },
    intro: { marginTop: 5 },
    segmentRow: { flexDirection: 'row', gap: 24, marginTop: 25, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 11 },
    segment: { color: colors.soft, fontSize: 14 },
    segmentActive: { color: colors.brown, fontSize: 14, fontWeight: '700', borderBottomWidth: 2, borderBottomColor: colors.brown, paddingBottom: 10, marginBottom: -12 },
    compose: { minHeight: 64, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginTop: 18, marginBottom: 18, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
    composePlaceholder: { flex: 1, color: colors.soft, fontSize: 13, marginLeft: 11 },
    composeArrow: { color: colors.brown, fontSize: 23 },
    post: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, marginBottom: 14 },
    postHeader: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
    postIdentity: { flex: 1, marginLeft: 10 },
    postName: { color: colors.brown, fontSize: 14, fontWeight: '700' },
    postMeta: { color: colors.muted, fontSize: 11, marginTop: 4 },
    more: { color: colors.muted, fontSize: 24, lineHeight: 25 },
    caption: { color: colors.brown, fontSize: 14, lineHeight: 21, marginTop: 14 },
    diaryImage: { width: '100%', aspectRatio: 1.2, borderRadius: 12, marginTop: 14, backgroundColor: colors.paleGreen },
    deleteEntry: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19 },
    deleteEntryText: { color: colors.muted, fontSize: 25, lineHeight: 27 },
    emptyDiary: { alignItems: 'center', paddingHorizontal: 22, paddingVertical: 40, marginTop: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 22, backgroundColor: colors.white },
    emptyDiaryIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paleGreen, borderWidth: 1.5, borderColor: colors.brown },
    emptyDiaryGlyph: { color: colors.brown, fontSize: 34 },
    emptyDiaryTitle: { color: colors.brown, fontSize: 20, lineHeight: 27, fontWeight: '800', textAlign: 'center', marginTop: 20 },
    emptyDiaryText: { textAlign: 'center', fontSize: 13, lineHeight: 20, marginTop: 8 },
    emptyDiaryButton: { alignSelf: 'stretch', marginTop: 22 },
    postArtwork: { height: 150, backgroundColor: '#E8E1DA', borderRadius: 9, marginTop: 13, alignItems: 'center', justifyContent: 'center' },
    artworkGlyph: { color: colors.brown, fontSize: 46 },
    artworkLabel: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginTop: 4 },
    postActions: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14 },
    actionText: { color: colors.muted, fontSize: 11 },
    liked: { color: '#A54435' },
    profileContent: { paddingTop: 18 },
    profileHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    back: { color: colors.brown, fontSize: 32, width: 34 },
    profileHeading: { fontSize: 19, lineHeight: 24 },
    profileHero: { alignItems: 'center', paddingTop: 28 },
    photoEdit: { position: 'absolute', right: -2, bottom: -2, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.brown },
    photoEditText: { color: colors.brown, fontSize: 15, fontWeight: '700' },
    changePhoto: { color: colors.brown, fontSize: 12, fontWeight: '700', marginTop: 10 },
    name: { fontSize: 23, marginTop: 14 },
    editName: { color: colors.muted, fontSize: 12, fontWeight: '700', marginTop: 5, textDecorationLine: 'underline' },
    handle: { color: colors.muted, fontSize: 14, marginTop: 4 },
    bio: { marginTop: 12 },
    menuTrigger: { width: 40, height: 40, alignItems: 'flex-end', justifyContent: 'center' },
    stats: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, marginTop: 24, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
    stat: { alignItems: 'center' },
    statValue: { color: colors.brown, fontSize: 21, fontWeight: '700' },
    statLabel: { color: colors.muted, fontSize: 11, marginTop: 3 },
    sectionTitle: { color: colors.brown, fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 12 },
    activity: { flexDirection: 'row', alignItems: 'center', padding: 13, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 10, marginBottom: 9 },
    activityIcon: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#F0E8E0', alignItems: 'center', justifyContent: 'center' },
    activityIconGreen: { backgroundColor: colors.paleGreen },
    activityGlyph: { color: colors.brown, fontSize: 22 },
    activityCopy: { flex: 1, marginLeft: 12 },
    activityArrow: { color: colors.muted, fontSize: 24 },
    profileAction: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 13, marginTop: 10 },
    menuRoot: { flex: 1, backgroundColor: 'rgba(35, 22, 14, 0.22)' },
    menuPanel: { position: 'absolute', top: 62, right: 18, minWidth: 180, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 4, elevation: 6 },
    menuOption: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 16 },
    menuOptionText: { color: colors.brown, fontSize: 14, fontWeight: '700' },
    entryContent: { paddingTop: 18, paddingBottom: 30 },
    entryTopLabel: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
    entryEyebrow: { marginTop: 30 },
    entryIntro: { marginTop: 8 },
    diaryInput: { minHeight: 180, marginTop: 24, marginBottom: 14, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, color: colors.brown, fontSize: 16, lineHeight: 23 },
    photoPreviewWrap: { marginBottom: 14 },
    photoPreview: { width: '100%', aspectRatio: 1.3, borderRadius: 16, backgroundColor: colors.paleGreen },
    removePhoto: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
    removePhotoText: { color: '#984F40', fontSize: 12, fontWeight: '700' },
    saveEntry: { marginTop: 12 },
});
