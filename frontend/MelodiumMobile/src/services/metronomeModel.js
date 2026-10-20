const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function metronomeVibrationPattern(bpm, isStrongBeat) {
    const strongDuration = clamp(Math.round(120 - bpm * 0.25), 55, 110);
    const weakDuration = clamp(Math.round(86 - bpm * 0.16), 44, 78);
    return isStrongBeat
        ? [0, strongDuration, 24, Math.round(strongDuration * 0.65)]
        : [0, weakDuration];
}

export async function replayMetronomePlayer(player, volume) {
    if (!player) return false;
    player.volume = volume;
    await player.seekTo(0);
    player.play();
    return true;
}
