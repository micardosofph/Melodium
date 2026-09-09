import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function MetronomoScreen() {
    const [bpm, setBpm] = useState(120);
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <View>
                    <Text style={styles.eyebrow}>PRÁTICA GUIADA</Text>
                    <Text style={styles.title}>Metrônomo</Text>
                </View>
                <Text style={styles.soundIcon}>◖</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.label}>ANDAMENTO</Text>
                <Text style={styles.bpm}>{bpm}</Text>
                <Text style={styles.unit}>batidas por minuto</Text>
                <View style={styles.meter}><View style={[styles.meterFill, { width: `${Math.min(100, (bpm / 200) * 100)}%` }]} /></View>
                <View style={styles.controls}>
                    <TouchableOpacity style={styles.adjustButton} onPress={() => setBpm(Math.max(40, bpm - 5))}>
                        <Text style={styles.adjustText}>−</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.playButton} onPress={() => setIsPlaying(!isPlaying)}>
                        <Text style={styles.playText}>{isPlaying ? 'Pausar' : 'Iniciar'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.adjustButton} onPress={() => setBpm(Math.min(200, bpm + 5))}>
                        <Text style={styles.adjustText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.tip}>{isPlaying ? 'clique no pulso e encontre seu tempo' : 'pronto para começar uma nova sessão?'}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#F7F9F4' },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 24, marginBottom: 44 },
    eyebrow: { color: '#8A6B56', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.4 },
    title: { color: '#46240C', fontSize: 32, fontWeight: 'bold', marginTop: 8 },
    soundIcon: { color: '#46240C', fontSize: 34 },
    card: { backgroundColor: '#FFFFFF', padding: 28, borderRadius: 20, borderWidth: 1, borderColor: '#46240C', alignItems: 'center', shadowColor: '#46240C', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
    bpm: { fontSize: 92, fontWeight: 'bold', color: '#46240C', lineHeight: 104, marginTop: 8 },
    label: { fontSize: 12, color: '#8A6B56', fontWeight: 'bold', letterSpacing: 1.4 },
    unit: { fontSize: 14, color: '#8A6B56' },
    meter: { width: '100%', height: 8, borderRadius: 4, backgroundColor: '#E9EFE4', marginTop: 28, overflow: 'hidden' },
    meterFill: { height: '100%', backgroundColor: '#8AA878', borderRadius: 4 },
    controls: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 28 },
    adjustButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E9EFE4', alignItems: 'center', justifyContent: 'center' },
    adjustText: { color: '#46240C', fontSize: 26 },
    playButton: { backgroundColor: '#46240C', borderRadius: 24, minWidth: 112, height: 48, alignItems: 'center', justifyContent: 'center' },
    playText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
    tip: { textAlign: 'center', color: '#8A6B56', marginTop: 24, fontSize: 14 }
});