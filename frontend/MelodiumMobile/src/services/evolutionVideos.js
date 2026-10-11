import { Album, Asset, AssetField, getPermissionsAsync, MediaType, Query, requestPermissionsAsync } from 'expo-media-library';
import { localData } from './localData';

export const EVOLUTION_ALBUM_NAME = 'Melodium - Evolução';
const pendingImports = new Map();

export async function requestEvolutionVideoPermission() {
    const permission = await requestPermissionsAsync(false, ['video']);
    return permission.granted || permission.accessPrivileges === 'limited';
}

export async function getEvolutionVideos(offset = 0, limit = 24) {
    const permission = await getPermissionsAsync(false, ['video']);
    if (!permission.granted && permission.accessPrivileges !== 'limited') return { permissionGranted: false, videos: [], hasMore: false, nextOffset: 0 };
    await localData.load();
    const album = await Album.get(EVOLUTION_ALBUM_NAME);
    if (!album) return { permissionGranted: true, videos: [], hasMore: false, nextOffset: 0 };
    const assets = await new Query().album(album).eq(AssetField.MEDIA_TYPE, MediaType.VIDEO).orderBy({ key: AssetField.CREATION_TIME, ascending: false }).offset(offset).limit(limit).exe();
    const titles = localData.getSnapshot().data.videoTitles;
    const videos = [];
    // Bound native work to small batches, including when the album has many videos.
    for (let index = 0; index < assets.length; index += 4) {
        const batch = await Promise.all(assets.slice(index, index + 4).map(async (asset) => {
            const [uri, filename, creationTime, duration] = await Promise.all([asset.getUri(), asset.getFilename(), asset.getCreationTime(), asset.getDuration()]);
            return { id: asset.id, uri, filename, creationTime, duration, title: titles[asset.id] || filename.replace(/\.[^.]+$/, '') };
        }));
        videos.push(...batch);
    }
    return { permissionGranted: true, videos, hasMore: assets.length === limit, nextOffset: offset + assets.length };
}

export async function saveEvolutionVideo(uri) {
    if (!await requestEvolutionVideoPermission()) {
        const error = new Error('MEDIA_PERMISSION_DENIED');
        error.code = 'MEDIA_PERMISSION_DENIED';
        throw error;
    }
    const album = await Album.get(EVOLUTION_ALBUM_NAME);
    let asset = pendingImports.get(uri);
    if (!asset) {
        asset = await Asset.create(uri, album || undefined);
        pendingImports.set(uri, asset);
    }
    if (!album) await Album.create(EVOLUTION_ALBUM_NAME, [asset]);
    else {
        const albums = await asset.getAlbums();
        if (!albums.some((item) => item.id === album.id)) await album.add(asset);
    }
    pendingImports.delete(uri);
    return asset;
}

export async function deleteEvolutionVideo(id) {
    const album = await Album.get(EVOLUTION_ALBUM_NAME);
    const asset = new Asset(id);
    const albums = await asset.getAlbums();
    if (!album || !albums.some((item) => item.id === album.id)) throw new Error('Este vídeo não pertence ao álbum Melodium.');
    await asset.delete();
    // The media removal is already committed; stale optional metadata must not make it look undone.
    await localData.removeVideoTitle(id).catch(() => {});
}
