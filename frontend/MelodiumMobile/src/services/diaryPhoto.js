import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

const diaryDirectory = new Directory(Paths.document, 'diary');

function extensionFor(asset) {
    const extension = asset.fileName?.split('.').pop() || asset.uri.split(/[?#]/)[0].split('.').pop();
    return /^[a-z0-9]{2,5}$/i.test(extension || '') ? extension.toLowerCase() : 'jpg';
}

async function storeDiaryPhoto(result) {
    if (result.canceled || !result.assets?.[0]?.uri) return null;
    diaryDirectory.create({ idempotent: true, intermediates: true });
    const asset = result.assets[0];
    const destination = new File(diaryDirectory, `note-${Date.now()}.${extensionFor(asset)}`);
    await new File(asset.uri).copy(destination);
    return destination.uri;
}

export async function pickDiaryPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
    });
    return storeDiaryPhoto(result);
}

export async function takeDiaryPhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
        const error = new Error('Permita o acesso à câmera para fotografar seu registro.');
        error.code = 'CAMERA_PERMISSION_DENIED';
        throw error;
    }
    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
    });
    return storeDiaryPhoto(result);
}

export function removeDiaryPhoto(uri) {
    if (!uri || !uri.startsWith(diaryDirectory.uri)) return;
    const file = new File(uri);
    if (file.exists) file.delete();
}
