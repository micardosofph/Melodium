import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { WebView } from 'react-native-webview';
import { pitchyHtml } from '../utils/tunerHtml';
import converterFrequenciaParaNota from '../utils/notesConverter';

export default function TunerScreen() {
    const [frequencia, setFrequencia] = useState("--");

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                Frequência: {frequencia} Hz
            </Text>

            <WebView
                source={{ html: pitchyHtml }}
                javaScriptEnabled={true}
                mediaPlaybackRequiresUserAction={false}
                onMessage={(event) => {
                    const frequenciaHz = parseFloat(event.nativeEvent.data);
                    const notaDetectada = converterFrequenciaParaNota(frequenciaHz);

                    
                    setFrequencia(frequenciaHz.toFixed(1));
                    setNota(notaDetectada); 
                }}
                style={{ height: 0, width: 0, opacity: 0 }}
            />

        </View>
    );
}

export default LiveGoodScreen

