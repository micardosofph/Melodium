import React from 'react';
import { View } from 'react-native';
import { colors } from './FlowUI';

export default function MusicToolIcon({ type, size = 34, color = colors.brown }) {
    return (
        <View accessible={false} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            {type === 'metronome' ? <>
                <View style={{ width: size * 0.65, height: size * 0.8, borderWidth: 2, borderColor: color, borderTopLeftRadius: size * 0.32, borderTopRightRadius: size * 0.32, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }} />
                <View style={{ position: 'absolute', width: 2, height: size * 0.67, backgroundColor: color, transform: [{ rotate: '25deg' }] }} />
                <View style={{ position: 'absolute', top: size * 0.28, right: size * 0.22, width: size * 0.2, height: size * 0.12, borderRadius: 2, backgroundColor: color }} />
            </> : <>
                <View style={{ width: size * 0.55, height: size * 0.57, borderWidth: 2.5, borderTopWidth: 0, borderColor: color, borderBottomLeftRadius: size * 0.25, borderBottomRightRadius: size * 0.25, position: 'absolute', top: size * 0.05 }} />
                <View style={{ width: 2.5, height: size * 0.4, backgroundColor: color, position: 'absolute', bottom: 0 }} />
                <View style={{ width: size * 0.22, height: 2.5, backgroundColor: color, position: 'absolute', bottom: 0 }} />
            </>}
        </View>
    );
}
