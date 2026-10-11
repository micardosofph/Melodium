import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('barra de status inicia visível e com ícones escuros sobre o fundo claro', async () => {
    const config = JSON.parse(await readFile(new URL('../app.json', import.meta.url), 'utf8')).expo;
    const statusBarPlugin = config.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === 'expo-status-bar');

    assert.deepEqual(statusBarPlugin, [
        'expo-status-bar',
        { hidden: false, style: 'dark' },
    ]);
    assert.equal(config.userInterfaceStyle, 'light');
    assert.equal(config.backgroundColor, '#F7F9F4');
    assert.equal(config.android.backgroundColor, '#F7F9F4');
});

test('seletor de foto não remove a permissão de áudio necessária para gravar vídeos', async () => {
    const config = JSON.parse(await readFile(new URL('../app.json', import.meta.url), 'utf8')).expo;
    const imagePickerPlugin = config.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === 'expo-image-picker');
    const cameraPlugin = config.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === 'expo-camera');

    assert.notEqual(imagePickerPlugin[1].microphonePermission, false);
    assert.match(imagePickerPlugin[1].photosPermission, /foto|imagem/i);
    assert.equal(cameraPlugin[1].recordAudioAndroid, true);
    assert.ok(config.android.permissions.includes('android.permission.RECORD_AUDIO'));
});

test('lembretes locais usam um canal Android próprio', async () => {
    const config = JSON.parse(await readFile(new URL('../app.json', import.meta.url), 'utf8')).expo;
    const notificationsPlugin = config.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === 'expo-notifications');

    assert.equal(notificationsPlugin[1].defaultChannel, 'daily-practice');
    assert.equal(notificationsPlugin[1].color, '#C2D5B6');
});
