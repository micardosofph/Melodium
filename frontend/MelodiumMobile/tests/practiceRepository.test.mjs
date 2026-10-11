import test from 'node:test';
import assert from 'node:assert/strict';
import { createPracticeRepository, STORAGE_KEY } from '../src/services/practiceRepository.js';
import { elapsedSeconds, localDay, practiceStats } from '../src/services/practiceModel.js';

function fixture() {
    const values = new Map();
    let clock = new Date(2026, 9, 9, 12).getTime();
    let failWrites = false;
    let sequence = 0;
    const storage = {
        getItem: async (key) => values.get(key) ?? null,
        setItem: async (key, value) => { if (failWrites) throw new Error('Disco cheio'); values.set(key, value); },
    };
    const create = () => createPracticeRepository(storage, { now: () => clock, makeId: () => `session-${++sequence}` });
    return { values, create, advance: (seconds) => { clock += seconds * 1000; }, now: () => clock, fail: (value) => { failWrites = value; } };
}

test('histórico, títulos e guia sobrevivem a uma nova instância', async () => {
    const f = fixture();
    const repo = f.create();
    await repo.saveSession({ title: ' Acordes ', instrument: 'Violão', durationSeconds: 90 });
    await repo.setVideoTitle('42', 'Meu primeiro trecho');
    await repo.setProfilePhoto('file:///document/profile/avatar.jpg');
    await repo.setProfileName(' Miguel ');
    await repo.addDiaryEntry({ text: 'Primeiro acorde limpo.', photoUri: 'file:///document/diary/note.jpg' });
    await repo.finishTour();
    const restored = f.create();
    await restored.load();
    assert.equal(restored.getSnapshot().data.sessions[0].title, 'Acordes');
    assert.equal(practiceStats(restored.getSnapshot().data.sessions, f.now()).totalSeconds, 90);
    assert.equal(restored.getSnapshot().data.videoTitles['42'], 'Meu primeiro trecho');
    assert.equal(restored.getSnapshot().data.profilePhotoUri, 'file:///document/profile/avatar.jpg');
    assert.equal(restored.getSnapshot().data.profileName, 'Miguel');
    assert.equal(restored.getSnapshot().data.diaryEntries[0].text, 'Primeiro acorde limpo.');
    assert.equal(restored.getSnapshot().data.tourSeen, true);
});

test('operações concorrentes preservam os registros e não duplicam uma sessão', async () => {
    const f = fixture(); const repo = f.create();
    await Promise.all([
        repo.saveSession({ id: 'a', title: 'A', durationSeconds: 60 }),
        repo.saveSession({ id: 'b', title: 'B', durationSeconds: 120 }),
        repo.saveSession({ id: 'a', title: 'A', durationSeconds: 60 }),
        repo.setVideoTitle('v', 'Vídeo'),
    ]);
    assert.equal(repo.getSnapshot().data.sessions.length, 2);
    assert.equal(repo.getSnapshot().data.videoTitles.v, 'Vídeo');
    assert.equal(practiceStats(repo.getSnapshot().data.sessions, f.now()).totalSeconds, 180);
});

test('falha de escrita não publica sucesso e permite tentar novamente', async () => {
    const f = fixture(); const repo = f.create(); await repo.load();
    f.fail(true);
    await assert.rejects(repo.saveSession({ id: 'a', title: 'A', durationSeconds: 30 }), /Disco cheio/);
    assert.equal(repo.getSnapshot().data.sessions.length, 0);
    assert.equal(repo.getSnapshot().error, 'Disco cheio');
    f.fail(false);
    await repo.saveSession({ id: 'a', title: 'A', durationSeconds: 30 });
    assert.equal(repo.getSnapshot().data.sessions.length, 1);
    assert.equal(repo.getSnapshot().error, null);
});

test('dados corrompidos são preservados, sem sobrescrever o armazenamento', async () => {
    const f = fixture(); f.values.set(STORAGE_KEY, '{invalid'); const repo = f.create();
    await assert.rejects(repo.load());
    await assert.rejects(repo.finishTour());
    assert.equal(repo.getSnapshot().ready, false);
    assert.equal(f.values.get(STORAGE_KEY), '{invalid');
});

test('pausar, retomar e finalizar contam apenas o tempo ativo, uma única vez', async () => {
    const f = fixture(); const repo = f.create();
    await repo.start(); f.advance(12.5); await repo.pause();
    f.advance(300); assert.equal(elapsedSeconds(repo.getSnapshot().data.active, f.now()), 12.5);
    await repo.start(); f.advance(7.5); await repo.pause();
    await Promise.all([repo.saveSession({ fromActive: true, title: 'Sessão' }), repo.saveSession({ fromActive: true, title: 'Sessão' })]);
    assert.equal(repo.getSnapshot().data.sessions.length, 1);
    assert.equal(repo.getSnapshot().data.sessions[0].durationSeconds, 20);
    assert.equal(repo.getSnapshot().data.active, null);
});

test('recuperação usa o último checkpoint e exclui o tempo com processo fechado', async () => {
    const f = fixture(); const repo = f.create();
    await repo.start(); f.advance(15); await repo.checkpoint(); f.advance(3600);
    const restored = f.create(); await restored.load();
    assert.equal(restored.getSnapshot().data.active.runningSince, null);
    assert.equal(elapsedSeconds(restored.getSnapshot().data.active, f.now()), 15);
    await restored.start(); f.advance(5); await restored.saveSession({ fromActive: true, title: 'Retomada' });
    assert.equal(restored.getSnapshot().data.sessions[0].durationSeconds, 20);
});

test('durações e títulos inválidos não criam registros', async () => {
    const f = fixture(); const repo = f.create();
    for (const durationSeconds of [0, -1, NaN, Infinity, 86401]) {
        await assert.rejects(repo.saveSession({ title: 'Teste', durationSeconds }));
    }
    await assert.rejects(repo.saveSession({ title: '  ', durationSeconds: 60 }));
    assert.equal(repo.getSnapshot().data.sessions.length, 0);
});

test('totais, sequência e últimos sete dias usam o calendário local', () => {
    const now = new Date(2026, 2, 2, 12).getTime();
    const sessions = [
        { completedAt: new Date(2026, 2, 1, 23, 59).getTime(), durationSeconds: 60 },
        { completedAt: new Date(2026, 1, 28, 0, 1).getTime(), durationSeconds: 120 },
        { completedAt: new Date(2026, 1, 28, 20).getTime(), durationSeconds: 30 },
        { completedAt: new Date(2026, 1, 1).getTime(), durationSeconds: 600 },
    ];
    const stats = practiceStats(sessions, now);
    assert.equal(stats.totalSeconds, 810);
    assert.equal(stats.weekSeconds, 210);
    assert.equal(stats.streak, 2);
    assert.equal(stats.activeDays, 3);
    assert.equal(stats.weekDays, 2);
    assert.equal(stats.days.at(-1).key, localDay(now));
    assert.equal(practiceStats([], now).totalSeconds, 0);
    assert.equal(practiceStats(sessions, new Date(2026, 2, 4).getTime()).streak, 0);
});

test('remover título de um vídeo preserva os demais registros', async () => {
    const f = fixture(); const repo = f.create();
    await repo.setVideoTitle('a', 'A'); await repo.setVideoTitle('b', 'B');
    await repo.removeVideoTitle('a');
    const restored = f.create(); await restored.load();
    assert.deepEqual(restored.getSnapshot().data.videoTitles, { b: 'B' });
});

test('foto de perfil pode ser trocada e removida localmente', async () => {
    const f = fixture(); const repo = f.create();
    await repo.setProfilePhoto('file:///document/profile/avatar-1.jpg');
    await repo.setProfilePhoto('file:///document/profile/avatar-2.jpg');
    assert.equal(repo.getSnapshot().data.profilePhotoUri, 'file:///document/profile/avatar-2.jpg');
    await repo.setProfilePhoto(null);
    const restored = f.create(); await restored.load();
    assert.equal(restored.getSnapshot().data.profilePhotoUri, null);
    await assert.rejects(restored.setProfilePhoto('  '));
});

test('nome e notas do diário são validados, persistidos e podem ser removidos', async () => {
    const f = fixture(); const repo = f.create();
    await assert.rejects(repo.setProfileName('   '));
    await assert.rejects(repo.addDiaryEntry({ text: '  ' }));
    await repo.setProfileName('  Ana   Clara  ');
    await repo.addDiaryEntry({ text: '  A troca de acordes melhorou.  ', photoUri: null });
    const restored = f.create(); await restored.load();
    assert.equal(restored.getSnapshot().data.profileName, 'Ana Clara');
    assert.equal(restored.getSnapshot().data.diaryEntries[0].text, 'A troca de acordes melhorou.');
    await restored.removeDiaryEntry(restored.getSnapshot().data.diaryEntries[0].id);
    assert.equal(restored.getSnapshot().data.diaryEntries.length, 0);
});

test('dados anteriores à foto de perfil continuam compatíveis', async () => {
    const f = fixture();
    f.values.set(STORAGE_KEY, JSON.stringify({ schema: 1, sessions: [], active: null, videoTitles: {}, tourSeen: true }));
    const repo = f.create(); await repo.load();
    assert.equal(repo.getSnapshot().data.profilePhotoUri, null);
    assert.equal(repo.getSnapshot().data.profileName, '');
    assert.deepEqual(repo.getSnapshot().data.diaryEntries, []);
    assert.equal(repo.getSnapshot().data.tourSeen, true);
    assert.equal(repo.getSnapshot().data.onboardingSeen, false);
    assert.deepEqual(repo.getSnapshot().data.dailyReminder, { enabled: false, hour: 9, minute: 0, identifier: null });
});

test('conclusão do onboarding e lembrete diário sobrevivem ao reinício', async () => {
    const f = fixture(); const repo = f.create();
    await repo.setDailyReminder({ enabled: true, hour: 18, minute: 35, identifier: 'daily-1' });
    await repo.finishOnboarding();
    const restored = f.create(); await restored.load();
    assert.equal(restored.getSnapshot().data.onboardingSeen, true);
    assert.deepEqual(restored.getSnapshot().data.dailyReminder, { enabled: true, hour: 18, minute: 35, identifier: 'daily-1' });
});

test('ofensiva continua ativa quando a última prática foi ontem e quebra após uma lacuna', () => {
    const now = new Date(2026, 9, 10, 12).getTime();
    const session = (year, month, day) => ({ completedAt: new Date(year, month, day, 18).getTime(), durationSeconds: 60 });
    assert.equal(practiceStats([session(2026, 9, 9), session(2026, 9, 8), session(2026, 9, 7)], now).streak, 3);
    assert.equal(practiceStats([session(2026, 9, 10), session(2026, 9, 8)], now).streak, 1);
    assert.equal(practiceStats([session(2026, 9, 8), session(2026, 9, 7)], now).streak, 0);
});
