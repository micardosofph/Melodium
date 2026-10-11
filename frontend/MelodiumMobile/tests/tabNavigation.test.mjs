import test from 'node:test';
import assert from 'node:assert/strict';
import { openDiaryTab, openHomeTab } from '../src/services/tabNavigation.js';

test('trocar entre Home e Diário substitui uma única rota com animação de avanço', () => {
    const calls = [];
    const navigation = {
        replace: (...args) => calls.push(['replace', ...args]),
        navigate: (...args) => calls.push(['navigate', ...args]),
    };
    openHomeTab(navigation, 'Social');
    openDiaryTab(navigation, 'Home');
    assert.deepEqual(calls, [['replace', 'Home'], ['replace', 'Social']]);
});

test('atalho Home fora de Social reutiliza a rota normalmente', () => {
    const calls = [];
    const navigation = {
        replace: (...args) => calls.push(['replace', ...args]),
        navigate: (...args) => calls.push(['navigate', ...args]),
    };
    openHomeTab(navigation, 'Home');
    assert.deepEqual(calls, [['navigate', 'Home']]);
});

test('atalho Diário fora da Home reutiliza a rota normalmente', () => {
    const calls = [];
    const navigation = { replace: (...args) => calls.push(['replace', ...args]), navigate: (...args) => calls.push(['navigate', ...args]) };
    openDiaryTab(navigation, 'Social');
    assert.deepEqual(calls, [['navigate', 'Social']]);
});
