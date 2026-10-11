import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { isValidReminderTime } from './reminderModel';

const CHANNEL_ID = 'daily-practice';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

async function preparePermissions() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
            name: 'Lembrete diário de prática',
            description: 'Um convite diário para reservar alguns minutos para a sua música.',
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 180],
            lightColor: '#C2D5B6',
        });
    }
    const current = await Notifications.getPermissionsAsync();
    const permission = current.status === 'granted' ? current : await Notifications.requestPermissionsAsync();
    if (permission.status !== 'granted') {
        const error = new Error('As notificações estão desativadas neste aparelho.');
        error.code = 'NOTIFICATION_PERMISSION_DENIED';
        throw error;
    }
}

export async function scheduleDailyReminder(hour, minute, previousIdentifier = null) {
    if (!isValidReminderTime(hour, minute)) throw new Error('Escolha um horário válido.');
    await preparePermissions();
    const identifier = await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Um pouco de música hoje? 🎵',
            body: 'Alguns minutos já contam. Abra o Melodium e mantenha seu ritmo.',
            sound: 'default',
            data: { kind: 'daily-practice-reminder' },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
            channelId: CHANNEL_ID,
        },
    });
    if (previousIdentifier && previousIdentifier !== identifier) {
        await Notifications.cancelScheduledNotificationAsync(previousIdentifier).catch(() => {});
    }
    return identifier;
}

export async function cancelDailyReminder(identifier) {
    if (identifier) await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
}
