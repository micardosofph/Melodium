export const DEFAULT_REMINDER = Object.freeze({ enabled: false, hour: 9, minute: 0, identifier: null });

export function isValidReminderTime(hour, minute) {
    return Number.isInteger(hour) && hour >= 0 && hour <= 23 && Number.isInteger(minute) && minute >= 0 && minute <= 59;
}

export function normalizeReminder(value) {
    if (!value || typeof value !== 'object') return { ...DEFAULT_REMINDER };
    const hour = Number(value.hour);
    const minute = Number(value.minute);
    return {
        enabled: value.enabled === true,
        hour: isValidReminderTime(hour, minute) ? hour : DEFAULT_REMINDER.hour,
        minute: isValidReminderTime(hour, minute) ? minute : DEFAULT_REMINDER.minute,
        identifier: typeof value.identifier === 'string' && value.identifier ? value.identifier : null,
    };
}

export function formatReminderTime(hour, minute) {
    if (!isValidReminderTime(hour, minute)) return '09:00';
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
