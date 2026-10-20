import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

const profileDirectory = new Directory(Paths.document, 'profile');

function extensionFor(asset) {
    const extension = asset.fileName?.split('.').pop() || asset.uri.split(/[?#]/)[0].split('.').pop();
    return /^[a-z0-9]{2,5}$/i.test(extension || '') ? extension.toLowerCase() : 'jpg';
}

async function storeProfilePhoto(result) {
    if (result.canceled || !result.assets?.[0]?.uri) return null;
    profileDirectory.create({ idempotent: true, intermediates: true });
    const asset = result.assets[0];
    const destination = new File(profileDirectory, `avatar-${Date.now()}.${extensionFor(asset)}`);
    await new File(asset.uri).copy(destination);
    return destination.uri;
}

export async function pickProfilePhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
    });
    return storeProfilePhoto(result);
}

export async function takeProfilePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
        const error = new Error('Permita o acesso à câmera para tirar uma foto de perfil.');
        error.code = 'CAMERA_PERMISSION_DENIED';
        throw error;
    }
    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
    });
    return storeProfilePhoto(result);
}

export function removeStoredProfilePhoto(uri) {
    if (!uri || !uri.startsWith(profileDirectory.uri)) return;
    const file = new File(uri);
    if (file.exists) file.delete();
}
