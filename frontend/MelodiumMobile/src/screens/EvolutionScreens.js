import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BodyText, colors, Eyebrow, FlowButton, Heading } from '../components/FlowUI';
import { deleteEvolutionVideo, getEvolutionVideos, requestEvolutionVideoPermission } from '../services/evolutionVideos';
import { formatTime } from '../services/practiceModel';

const formatDate = (timestamp) => timestamp ? new Date(timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Seu registro musical';

export function EvolutionGalleryScreen({ navigation }) {
    const [videos, setVideos] = useState([]);
    const [status, setStatus] = useState('loading');
    const [more, setMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const offset = useRef(0);
    const generation = useRef(0);
    const loadLock = useRef(false);
    const deleteLock = useRef(false);
    const reload = useCallback(async () => {
        const token = ++generation.current;
        setStatus('loading');
        try {
            const result = await getEvolutionVideos();
            if (token !== generation.current) return;
            offset.current = result.nextOffset;
            setMore(result.hasMore);
            setVideos(result.videos);
            setStatus(result.permissionGranted ? result.videos.length ? 'ready' : 'empty' : 'permission');
        } catch { if (token === generation.current) setStatus('error'); }
    }, []);
    useFocusEffect(useCallback(() => {
        reload();
        return () => { generation.current++; };
    }, [reload]));
    const loadMore = async () => {
        if (!more || loadLock.current || status !== 'ready') return;
        loadLock.current = true;
        setLoadingMore(true);
        const token = generation.current;
        try {
            const result = await getEvolutionVideos(offset.current);
            if (token !== generation.current) return;
            if (!result.permissionGranted) { setStatus('permission'); return; }
            offset.current = result.nextOffset;
            setMore(result.hasMore);
            setVideos((current) => {
                const ids = new Set(current.map((video) => video.id));
                return [...current, ...result.videos.filter((video) => !ids.has(video.id))];
            });
        } catch { Alert.alert('Não foi possível carregar mais vídeos', 'Tente novamente.'); }
        finally { loadLock.current = false; setLoadingMore(false); }
    };
    const requestAccess = async () => {
        try { if (await requestEvolutionVideoPermission()) await reload(); else setStatus('permission'); }
        catch { setStatus('error'); }
    };
    const remove = (video) => Alert.alert('Apagar vídeo?', `“${video.title}” será apagado do álbum Melodium e da galeria do aparelho. Esta ação não pode ser desfeita.`, [
        { text: 'Manter vídeo', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: async () => {
            if (deleteLock.current) return;
            deleteLock.current = true;
            setDeleting(video.id);
            try { await deleteEvolutionVideo(video.id); await reload(); }
            catch { Alert.alert('Vídeo mantido', 'A exclusão não foi concluída. Se o aparelho pedir autorização, confirme apenas se desejar apagar.'); }
            finally { deleteLock.current = false; setDeleting(null); }
        } },
    ]);
    return <SafeAreaView style={styles.screen} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.content}>
            <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable><View style={{ flex: 1 }}><Eyebrow>OUÇA SEU CAMINHO</Eyebrow><Heading style={styles.heading}>Minha evolução</Heading></View></View>
            <BodyText style={styles.subtitle}>A mesma música. Novas descobertas a cada registro.</BodyText>
            <FlowButton variant="secondary" onPress={() => navigation.navigate('RecordVideo')}>+ Gravar um novo momento</FlowButton>
            {status === 'loading' && <View style={styles.empty}><ActivityIndicator color={colors.brown} /><BodyText style={styles.centered}>Buscando seus registros...</BodyText></View>}
            {status === 'permission' && <View style={styles.empty}><Text style={styles.emptyTitle}>Seus vídeos estão aqui.</Text><BodyText style={styles.centered}>Permita o acesso ao álbum Melodium para rever sua evolução.</BodyText><FlowButton onPress={requestAccess}>Permitir acesso</FlowButton></View>}
            {status === 'error' && <View style={styles.empty}><Text style={styles.emptyTitle}>Não foi possível abrir a galeria</Text><BodyText style={styles.centered}>Confira a permissão de vídeos e tente novamente.</BodyText><FlowButton onPress={reload}>Tentar novamente</FlowButton></View>}
            {status === 'empty' && <View style={styles.empty}><Text style={styles.emptyNote}>♫</Text><Text style={styles.emptyTitle}>Seu primeiro registro é o começo.</Text><BodyText style={styles.centered}>Grave um trecho hoje. No próximo, você já terá com o que comparar.</BodyText></View>}
            {status === 'ready' && <FlatList data={videos} keyExtractor={(video) => video.id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} onEndReached={loadMore} onEndReachedThreshold={0.3}
                ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.brown} /> : more ? <FlowButton variant="text" onPress={loadMore}>Carregar mais vídeos</FlowButton> : null}
                renderItem={({ item }) => <View style={styles.card}>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Reproduzir ${item.title}`} onPress={() => navigation.navigate('EvolutionPlayer', { video: item })} style={styles.videoAction}>
                        <View style={styles.poster}><Text style={styles.play}>▶</Text><Text style={styles.duration}>{item.duration ? formatTime(item.duration / 1000) : 'Vídeo'}</Text></View>
                        <View style={styles.videoCopy}><Text numberOfLines={2} style={styles.videoTitle}>{item.title}</Text><Text style={styles.date}>{formatDate(item.creationTime)}</Text></View>
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Apagar ${item.title}`} disabled={deleting !== null} onPress={() => remove(item)} style={styles.deleteButton}><Text style={styles.deleteText}>{deleting === item.id ? '...' : 'Apagar'}</Text></Pressable>
                </View>} />}
        </View>
    </SafeAreaView>;
}
export function EvolutionPlayerScreen({ navigation, route }) {
    const { video } = route.params;
    const player = useVideoPlayer(video.uri, (instance) => { instance.loop = false; });
    useFocusEffect(useCallback(() => () => { player.pause(); }, [player]));
    return <SafeAreaView style={styles.playerScreen} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Voltar à galeria" onPress={() => navigation.goBack()} style={styles.back}><Text style={[styles.backText, { color: colors.white }]}>‹</Text></Pressable><View style={{ flex: 1 }}><Text numberOfLines={2} style={styles.playerTitle}>{video.title || video.filename}</Text><Text style={styles.date}>{formatDate(video.creationTime)}</Text></View></View>
        <VideoView player={player} style={styles.player} contentFit="contain" nativeControls fullscreenOptions={{ enable: true }} />
    </SafeAreaView>;
}
const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background }, content: { flex: 1, padding: 20 }, header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    back: { width: 36, minHeight: 44, justifyContent: 'center' }, backText: { color: colors.brown, fontSize: 34 }, heading: { fontSize: 27, lineHeight: 33 },
    subtitle: { fontSize: 13, lineHeight: 20, marginTop: 12, marginBottom: 18 }, list: { paddingTop: 20, paddingBottom: 24, gap: 12 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 16 }, centered: { textAlign: 'center', fontSize: 14, lineHeight: 22 },
    emptyTitle: { fontSize: 22, lineHeight: 28, textAlign: 'center', color: colors.brown, fontWeight: '700' }, emptyNote: { color: colors.muted, fontSize: 56 },
    card: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, borderRadius: 18, overflow: 'hidden' },
    videoAction: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 }, poster: { width: 78, height: 84, borderRadius: 12, backgroundColor: colors.paleGreen, alignItems: 'center', justifyContent: 'center', gap: 10 },
    play: { color: colors.brown, fontSize: 22 }, duration: { color: colors.muted, fontSize: 10 }, videoCopy: { flex: 1 }, videoTitle: { color: colors.brown, fontSize: 16, fontWeight: '700', lineHeight: 22 },
    date: { color: colors.muted, fontSize: 12, marginTop: 6 }, deleteButton: { alignSelf: 'flex-end', paddingHorizontal: 18, minHeight: 44, justifyContent: 'center' }, deleteText: { color: '#9A4636', fontSize: 12, fontWeight: '700' },
    playerScreen: { flex: 1, backgroundColor: '#20160F', paddingHorizontal: 16, paddingTop: 10 }, playerTitle: { color: colors.white, fontSize: 19, fontWeight: '700' }, player: { flex: 1, marginVertical: 20 },
});
