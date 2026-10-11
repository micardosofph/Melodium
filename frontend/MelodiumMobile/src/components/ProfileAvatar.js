import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from './FlowUI';

export default function ProfileAvatar({ uri, size = 44, style }) {
    const geometry = { width: size, height: size, borderRadius: size / 2 };
    return (
        <View style={[styles.avatar, geometry, style]}>
            {uri
                ? <Image source={{ uri }} style={[styles.image, geometry]} resizeMode="cover" />
                : <Text style={[styles.initials, { fontSize: size * 0.36 }]}>Me</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    avatar: { backgroundColor: colors.green, borderWidth: 2, borderColor: colors.brown, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    image: { position: 'absolute' },
    initials: { color: colors.brown, fontWeight: '800' },
});
