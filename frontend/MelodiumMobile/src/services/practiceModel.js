export function localDay(timestamp) {
    const date = new Date(timestamp);
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function elapsedSeconds(active, now = Date.now()) {
    if (!active) return 0;
    return Math.min(86400, Math.max(0, active.elapsedSeconds + (active.runningSince === null ? 0 : (now - active.runningSince) / 1000)));
}

export function formatTime(seconds = 0) {
    const value = Math.floor(Math.max(0, seconds));
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export function formatDuration(seconds = 0) {
    if (seconds < 60) return `${Math.floor(seconds)} s`;
    const minutes = Math.floor(seconds / 60);
    return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export function practiceStats(sessions, now = Date.now()) {
    const today = new Date(now);
    const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6 + index);
        const key = localDay(date);
        const matches = sessions.filter((session) => localDay(session.completedAt) === key);
        return { key, label: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), seconds: matches.reduce((sum, s) => sum + s.durationSeconds, 0), count: matches.length };
    });
    const practiced = new Set(sessions.map((session) => localDay(session.completedAt)));
    const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (!practiced.has(localDay(cursor))) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (practiced.has(localDay(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }
    return {
        totalSeconds: sessions.reduce((sum, s) => sum + s.durationSeconds, 0),
        count: sessions.length,
        activeDays: practiced.size,
        streak,
        days,
        weekSeconds: days.reduce((sum, day) => sum + day.seconds, 0),
        weekCount: days.reduce((sum, day) => sum + day.count, 0),
        weekDays: days.filter((day) => day.count > 0).length,
    };
}
