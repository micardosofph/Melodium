import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from './FlowUI';

export default function VinylRecord({ size = 150, showSpindle = true }) {
    return (
        <View accessible={false} style={[styles.disc, { width: size, height: size, borderRadius: size / 2 }]}>
            {[0.94, 0.86, 0.78, 0.7, 0.62, 0.54].map((ratio, index) => (
                <View key={ratio} style={[styles.groove, { width: size * ratio, height: size * ratio, borderRadius: size, borderColor: index % 2 ? '#765339' : '#644027' }]} />
            ))}
            <View style={[styles.label, { width: size * 0.4, height: size * 0.4, borderRadius: size }]}>
                <Text style={[styles.logo, { fontSize: size * 0.155 }]}>Me</Text>
                {showSpindle && <View style={styles.spindle} />}
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    disc: { backgroundColor: colors.brown, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#301B0D' },
    groove: { position: 'absolute', borderWidth: 1 },
    label: { backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
    logo: { color: colors.brown, fontWeight: '800' },
    spindle: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.brown, marginTop: 2 },
});
