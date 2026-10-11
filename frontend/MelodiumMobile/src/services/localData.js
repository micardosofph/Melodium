import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import { createPracticeRepository } from './practiceRepository';

export const localData = createPracticeRepository(AsyncStorage);

export function useLocalData() {
    const state = useSyncExternalStore(localData.subscribe, localData.getSnapshot, localData.getSnapshot);
    useEffect(() => { localData.load().catch(() => {}); }, []);
    return state;
}

export function LocalDataLifecycle() {
    useEffect(() => {
        localData.load().catch(() => {});
        const listener = AppState.addEventListener('change', (state) => {
            if (state !== 'active' && localData.getSnapshot().data.active?.runningSince != null) localData.pause().catch(() => {});
        });
        const interval = setInterval(() => {
            if (localData.getSnapshot().data.active?.runningSince != null) localData.checkpoint().catch(() => {});
        }, 15000);
        return () => { listener.remove(); clearInterval(interval); };
    }, []);
    return null;
}
