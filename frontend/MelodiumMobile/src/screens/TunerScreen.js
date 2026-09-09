import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function AfinadorScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>OUÇA E AJUSTE</Text>
      <Text style={styles.title}>Afinador</Text>
      <View style={styles.tunerCard}>
        <View style={styles.scale}><Text style={styles.scaleText}>♭</Text><View style={styles.centerMark} /><Text style={styles.scaleText}>♯</Text></View>
        <Text style={styles.status}>AFINADO</Text>
        <Text style={styles.nota}>A4</Text>
        <Text style={styles.hz}>440 Hz</Text>
        <Text style={styles.instruction}>toque uma corda para começar</Text>
      </View>
      <TouchableOpacity style={styles.libraryButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.libraryText}>Voltar para a prática</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F7F9F4' },
  eyebrow: { color: '#8A6B56', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.4, marginTop: 24 },
  title: { color: '#46240C', fontSize: 32, fontWeight: 'bold', marginTop: 8, marginBottom: 36 },
  tunerCard: { backgroundColor: '#C2D5B6', borderRadius: 22, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#46240C' },
  scale: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scaleText: { fontSize: 24, color: '#46240C' },
  centerMark: { height: 3, flex: 1, backgroundColor: '#46240C', marginHorizontal: 16 },
  status: { color: '#46240C', fontSize: 12, fontWeight: 'bold', letterSpacing: 1.4, marginTop: 34 },
  nota: { fontSize: 96, fontWeight: 'bold', color: '#46240C', marginTop: 2 },
  hz: { fontSize: 22, color: '#46240C', marginTop: 2 },
  instruction: { color: '#46240C', marginTop: 32, opacity: 0.72 },
  libraryButton: { alignItems: 'center', padding: 18, marginTop: 18 },
  libraryText: { color: '#46240C', fontSize: 15, fontWeight: 'bold' }
});