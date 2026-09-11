import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import LiveAudioStream from 'react-native-live-audio-stream';
import { PitchDetector } from 'pitchy';
import { Buffer } from 'buffer';

export default function AfinadorScreen({ navigation }) {
  const [nota, setNota] = useState('--');
  const [frequencia, setFrequencia] = useState(0);
  const [status, setStatus] = useState('Aguardando som');
  const [tuningDirection, setTuningDirection] = useState('');
  const [tuningOffset, setTuningOffset] = useState(0);

  const openSystemSettings = () => {
    Linking.openSettings();
  };

  const requestMicrophonePermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );

        if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Permissão do microfone bloqueada',
            'O acesso ao microfone foi bloqueado permanentemente. Para continuar, habilite a permissão manualmente nas Configurações do sistema.',
            [
              { text: 'Abrir configurações', onPress: openSystemSettings },
              { text: 'Cancelar', style: 'cancel' },
            ]
          );
          return false;
        }

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Microfone desativado',
            'A permissão de uso do microfone foi negada. Ela é necessária para detectar a frequência das notas.',
            [{ text: 'OK' }]
          );
          return false;
        }

        return true;
      }

      return true;
    } catch (error) {
      console.log('Erro ao solicitar permissão do microfone:', error);
      return false;
    }
  };

  useEffect(() => {
    const setupTuner = async () => {
      const hasPermission = await requestMicrophonePermission();

      if (!hasPermission) {
        setStatus('Permissão necessária');
        return;
      }

      const sampleRate = 44100;
      const bufferSize = 2048;

      LiveAudioStream.init({
        sampleRate,
        channels: 1,
        bitsPerSample: 16,
        audioSource: 6,
        bufferSize,
      });

      const detector = PitchDetector.forFloat32Array(bufferSize);

      LiveAudioStream.on('data', (data) => {
        const chunk = Buffer.from(data, 'base64');
        const float32Array = new Float32Array(bufferSize);
        const sampleCount = Math.floor(chunk.length / 2);

        for (let i = 0; i < bufferSize && i < sampleCount; i++) {
          const int16 = chunk.readInt16LE(i * 2);
          float32Array[i] = int16 / 32768.0;
        }

        for (let i = sampleCount; i < bufferSize; i++) {
          float32Array[i] = 0;
        }

        const [pitch, clarity] = detector.findPitch(float32Array, sampleRate);

        if (clarity > 0.85 && pitch > 50) {
          const notaDetectada = converterHzParaNota(pitch);
          const frequenciaAlvo = frequenciaReferencia(notaDetectada);
          const diferenca = Math.abs(pitch - frequenciaAlvo);
          const precisaSerMaisAgudo = pitch > frequenciaAlvo;
          const cents = 1200 * Math.log2(pitch / Math.max(frequenciaAlvo, 1));
          const deadZone = 6;
          const rawOffset = Math.max(-100, Math.min(100, (cents / 50) * 100));
          const nextOffset = Math.abs(cents) < deadZone ? 0 : rawOffset;

          setFrequencia(Number(pitch).toFixed(1));
          setNota(notaDetectada);
          setTuningOffset(nextOffset);

          if (diferenca <= 2 || Math.abs(cents) < deadZone) {
            setStatus('AFINADO');
            setTuningDirection('afinado');
          } else if (precisaSerMaisAgudo) {
            setStatus('APERTE');
            setTuningDirection('agudo');
          } else {
            setStatus('SOLTE');
            setTuningDirection('grave');
          }
        }
      });

      LiveAudioStream.start();
    };

    setupTuner();

    return () => {
      LiveAudioStream.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>OUÇA E AJUSTE</Text>
      <Text style={styles.title}>Afinador</Text>

      <View style={styles.tunerCard}>
        <View style={styles.scale}>
          <Text style={styles.scaleText}>♭</Text>
          <View
            style={[
              styles.centerMarkWrap,
              tuningDirection === 'agudo' && styles.trackAgudo,
              tuningDirection === 'grave' && styles.trackGrave,
              tuningDirection === 'afinado' && styles.trackAjustado,
            ]}
          >
            <View style={styles.centerMarkTrack} />
            <View
              style={[
                styles.meterArrow,
                {
                  left: `${Math.max(0, Math.min(100, 50 + tuningOffset))}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.scaleText}>♯</Text>
        </View>

        <View
          style={[
            styles.tuningIndicator,
            tuningDirection === 'agudo' && styles.tuningAgudo,
            tuningDirection === 'grave' && styles.tuningGrave,
            tuningDirection === 'afinado' && styles.tuningAjustado,
          ]}
        >
          <Text style={styles.tuningIndicatorText}>
            {tuningDirection === 'agudo' && '⬆ APERTE'}
            {tuningDirection === 'grave' && '⬇ SOLTE'}
            {tuningDirection === 'afinado' && '✓ AFINADO'}
            {!tuningDirection && '…'}
          </Text>
        </View>

        <Text style={styles.status}>{status}</Text>
        <Text style={styles.nota}>{nota}</Text>
        <Text style={styles.hz}>{frequencia > 0 ? `${frequencia} Hz` : '0.0 Hz'}</Text>
        <Text style={styles.instruction}>toque uma corda para começar</Text>
      </View>

      <TouchableOpacity style={styles.libraryButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.libraryText}>Voltar para a prática</Text>
      </TouchableOpacity>
    </View>
  );
}

function converterHzParaNota(freq) {
  const notas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const midi = Math.round(69 + 12 * Math.log2(freq / 440));
  const notaIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;

  return `${notas[notaIndex]}${octave}`;
}

function frequenciaReferencia(nota) {
  const notas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const match = nota.match(/^([A-G]#?)(-?\d)$/);

  if (!match) return 440;

  const [, nomeNota, octaveText] = match;
  const octave = Number(octaveText);
  const indice = notas.indexOf(nomeNota);

  if (indice === -1) return 440;

  const midi = (octave + 1) * 12 + indice;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F7F9F4' },
  eyebrow: { color: '#8A6B56', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.4, marginTop: 24 },
  title: { color: '#46240C', fontSize: 32, fontWeight: 'bold', marginTop: 8, marginBottom: 36 },
  tunerCard: { backgroundColor: '#C2D5B6', borderRadius: 22, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#46240C' },
  centerMarkWrap: {
    position: 'relative',
    flex: 1,
    height: 22,
    marginHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#E7F0DE',
    borderWidth: 1,
    borderColor: '#46240C',
    overflow: 'hidden',
  },
  trackAgudo: { backgroundColor: '#F9D7C8' },
  trackGrave: { backgroundColor: '#D6E6FF' },
  trackAjustado: { backgroundColor: '#D8F0D2' },
  centerMarkTrack: {
    position: 'absolute',
    left: '50%',
    top: 0,
    width: 3,
    height: 22,
    backgroundColor: '#46240C',
    transform: [{ translateX: -1.5 }],
    borderRadius: 2,
  },
  meterArrow: {
    position: 'absolute',
    top: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#46240C',
    transform: [{ translateX: -10 }],
  },
  scale: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scaleText: { fontSize: 24, color: '#46240C' },
  centerMark: { height: 3, flex: 1, backgroundColor: '#46240C', marginHorizontal: 16 },
  status: { color: '#46240C', fontSize: 12, fontWeight: 'bold', letterSpacing: 1.4, marginTop: 18 },
  tuningIndicator: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#E7F0DE',
    borderWidth: 1,
    borderColor: '#46240C',
  },
  tuningAgudo: { backgroundColor: '#F9D7C8', borderColor: '#A3441F' },
  tuningGrave: { backgroundColor: '#D6E6FF', borderColor: '#2D5F9E' },
  tuningAjustado: { backgroundColor: '#D8F0D2', borderColor: '#2D6A3B' },
  tuningIndicatorText: { color: '#46240C', fontSize: 14, fontWeight: 'bold', letterSpacing: 1.3 },
  nota: { fontSize: 96, fontWeight: 'bold', color: '#46240C', marginTop: 2 },
  hz: { fontSize: 22, color: '#46240C', marginTop: 2 },
  instruction: { color: '#46240C', marginTop: 32, opacity: 0.72 },
  libraryButton: { alignItems: 'center', padding: 18, marginTop: 18 },
  libraryText: { color: '#46240C', fontSize: 15, fontWeight: 'bold' }
});