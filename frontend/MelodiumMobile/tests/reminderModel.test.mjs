import test from 'node:test';
import assert from 'node:assert/strict';
import { formatReminderTime, isValidReminderTime, normalizeReminder } from '../src/services/reminderModel.js';

test('horário do lembrete é validado e formatado com dois dígitos', () => {
    assert.equal(isValidReminderTime(9, 0), true);
    assert.equal(isValidReminderTime(24, 0), false);
    assert.equal(isValidReminderTime(9, 60), false);
    assert.equal(formatReminderTime(7, 5), '07:05');
});

test('preferência antiga ou inválida volta para o padrão seguro de 09:00', () => {
    assert.deepEqual(normalizeReminder(null), { enabled: false, hour: 9, minute: 0, identifier: null });
    assert.deepEqual(normalizeReminder({ enabled: true, hour: 30, minute: 90, identifier: 42 }), { enabled: true, hour: 9, minute: 0, identifier: null });
});
