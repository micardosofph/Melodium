import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export default function ComingSoonPopup({ visible, onClose }) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.popup} onPress={() => {}}>
                    <Text style={styles.text}>Em breve</Text>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(70, 36, 12, 0.28)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    popup: {
        backgroundColor: '#F7F9F4',
        borderRadius: 18,
        paddingVertical: 20,
        paddingHorizontal: 36,
        borderWidth: 1.5,
        borderColor: '#C2D5B6',
        shadowColor: '#46240C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 6,
    },
    text: {
        color: '#46240C',
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
});
