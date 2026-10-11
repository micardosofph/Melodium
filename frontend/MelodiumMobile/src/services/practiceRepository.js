import { elapsedSeconds } from './practiceModel.js';
import { DEFAULT_REMINDER, normalizeReminder } from './reminderModel.js';

export const STORAGE_KEY = '@melodium/local-data/v1';
const emptyData = () => ({ schema: 1, sessions: [], active: null, videoTitles: {}, diaryEntries: [], tourSeen: false, onboardingSeen: false, profileName: '', profilePhotoUri: null, dailyReminder: { ...DEFAULT_REMINDER } });

function validate(data) {
    const validSession = (s) => s && typeof s.id === 'string' && typeof s.title === 'string' && typeof s.instrument === 'string' && Number.isFinite(s.completedAt) && Number.isFinite(s.durationSeconds) && s.durationSeconds > 0 && s.durationSeconds <= 86400;
    if (!data || data.schema !== 1 || !Array.isArray(data.sessions) || !data.sessions.every(validSession) || !data.videoTitles || typeof data.videoTitles !== 'object' || Array.isArray(data.videoTitles) || !Object.values(data.videoTitles).every((title) => typeof title === 'string')) throw new Error('Não foi possível ler seus registros. Os dados existentes foram preservados.');
    if (data.profileName !== undefined && typeof data.profileName !== 'string') throw new Error('Não foi possível ler o nome salvo.');
    if (data.profilePhotoUri !== undefined && data.profilePhotoUri !== null && typeof data.profilePhotoUri !== 'string') throw new Error('Não foi possível ler a foto de perfil salva.');
    const validDiaryEntry = (entry) => entry && typeof entry.id === 'string' && typeof entry.text === 'string' && entry.text.trim().length > 0 && Number.isFinite(entry.createdAt) && (entry.photoUri === null || typeof entry.photoUri === 'string');
    if (data.diaryEntries !== undefined && (!Array.isArray(data.diaryEntries) || !data.diaryEntries.every(validDiaryEntry))) throw new Error('Não foi possível ler seu diário de evolução.');
    if (data.active && (typeof data.active.id !== 'string' || !Number.isFinite(data.active.startedAt) || !Number.isFinite(data.active.elapsedSeconds) || data.active.elapsedSeconds < 0 || (data.active.runningSince !== null && !Number.isFinite(data.active.runningSince)))) throw new Error('Não foi possível ler a prática em andamento.');
    return data;
}

export function createPracticeRepository(storage, { now = Date.now, makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}` } = {}) {
    let snapshot = { ready: false, error: null, data: emptyData() };
    let loading;
    let queue = Promise.resolve();
    const listeners = new Set();
    const publish = (value) => { snapshot = value; listeners.forEach((listener) => listener()); };

    async function load() {
        if (snapshot.ready) return snapshot.data;
        if (loading) return loading;
        loading = (async () => {
            try {
                const raw = await storage.getItem(STORAGE_KEY);
                const data = raw === null ? emptyData() : { ...emptyData(), ...validate(JSON.parse(raw)) };
                data.dailyReminder = normalizeReminder(data.dailyReminder);
                data.profileName = data.profileName.trim().slice(0, 40);
                data.diaryEntries = data.diaryEntries.map((entry) => ({ ...entry, text: entry.text.trim().slice(0, 600) }));
                // Recover the last checkpoint, never count time while the process was stopped.
                if (data.active) data.active = { ...data.active, runningSince: null };
                publish({ ready: true, error: null, data });
                return data;
            } catch (error) {
                publish({ ...snapshot, error: error.message || 'Falha ao ler os registros.' });
                throw error;
            } finally { loading = null; }
        })();
        return loading;
    }

    function change(reducer) {
        const operation = queue.then(async () => {
            await load();
            try {
                const data = reducer(snapshot.data);
                await storage.setItem(STORAGE_KEY, JSON.stringify(data));
                publish({ ready: true, error: null, data });
                return data;
            } catch (error) {
                publish({ ...snapshot, error: error.message || 'Não foi possível salvar no aparelho.' });
                throw error;
            }
        });
        queue = operation.catch(() => {});
        return operation;
    }

    const pause = () => change((data) => ({
        ...data,
        active: data.active ? { ...data.active, elapsedSeconds: elapsedSeconds(data.active, now()), runningSince: null } : null,
    }));

    return {
        load,
        getSnapshot: () => snapshot,
        subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
        start: () => change((data) => ({
            ...data,
            active: data.active ? { ...data.active, runningSince: data.active.runningSince ?? now() } : { id: makeId(), startedAt: now(), elapsedSeconds: 0, runningSince: now() },
        })),
        pause,
        checkpoint: () => change((data) => ({
            ...data,
            active: data.active ? { ...data.active, elapsedSeconds: elapsedSeconds(data.active, now()), runningSince: data.active.runningSince === null ? null : now() } : null,
        })),
        discard: () => change((data) => ({ ...data, active: null })),
        saveSession: ({ id, title, instrument = 'Livre', durationSeconds, fromActive = false }) => change((data) => {
            const sessionId = fromActive ? data.active?.id : id;
            // A second tap after finalization must not create a duplicate.
            if (fromActive && !data.active) return data;
            if (sessionId && data.sessions.some((session) => session.id === sessionId)) return data;
            const duration = Math.floor(fromActive ? elapsedSeconds(data.active, now()) : durationSeconds);
            if (!Number.isFinite(duration) || duration < 1 || duration > 86400) throw new Error('Informe uma duração entre 1 segundo e 24 horas.');
            const cleanTitle = title?.trim();
            if (!cleanTitle) throw new Error('Dê um nome à sua prática.');
            const session = { id: sessionId || makeId(), title: cleanTitle.slice(0, 100), instrument: instrument.trim().slice(0, 40) || 'Livre', durationSeconds: duration, completedAt: now() };
            return { ...data, active: fromActive ? null : data.active, sessions: [session, ...data.sessions] };
        }),
        setVideoTitle: (id, title) => change((data) => {
            if (!id || !title.trim()) throw new Error('Dê um nome ao vídeo.');
            return { ...data, videoTitles: { ...data.videoTitles, [id]: title.trim().slice(0, 100) } };
        }),
        removeVideoTitle: (id) => change((data) => {
            const videoTitles = { ...data.videoTitles };
            delete videoTitles[id];
            return { ...data, videoTitles };
        }),
        setProfileName: (name) => change((data) => {
            const cleanName = name?.trim().replace(/\s+/g, ' ');
            if (!cleanName) throw new Error('Conte para a gente como você quer ser chamado.');
            return { ...data, profileName: cleanName.slice(0, 40) };
        }),
        setProfilePhoto: (uri) => change((data) => {
            if (uri !== null && (typeof uri !== 'string' || !uri.trim())) throw new Error('A foto de perfil escolhida não é válida.');
            return { ...data, profilePhotoUri: uri?.trim() || null };
        }),
        addDiaryEntry: ({ text, photoUri = null }) => change((data) => {
            const cleanText = text?.trim();
            if (!cleanText) throw new Error('Escreva uma nota sobre sua evolução.');
            if (photoUri !== null && (typeof photoUri !== 'string' || !photoUri.trim())) throw new Error('A foto escolhida não é válida.');
            const entry = { id: makeId(), text: cleanText.slice(0, 600), photoUri: photoUri?.trim() || null, createdAt: now() };
            return { ...data, diaryEntries: [entry, ...data.diaryEntries] };
        }),
        removeDiaryEntry: (id) => change((data) => ({ ...data, diaryEntries: data.diaryEntries.filter((entry) => entry.id !== id) })),
        setDailyReminder: (reminder) => change((data) => ({ ...data, dailyReminder: normalizeReminder(reminder) })),
        finishOnboarding: () => change((data) => ({ ...data, onboardingSeen: true })),
        finishTour: () => change((data) => ({ ...data, tourSeen: true })),
    };
}
