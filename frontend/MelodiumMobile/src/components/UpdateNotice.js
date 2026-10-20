import React, { useEffect, useState } from 'react';
import { Alert, Linking, Modal, StyleSheet, Text, View } from 'react-native';
import { colors, FlowButton } from './FlowUI';
import { checkForAvailableUpdate, dismissUpdate } from '../services/appUpdate';

export default function UpdateNotice() {
    const [update, setUpdate] = useState(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let mounted = true;
        const timer = setTimeout(() => {
            checkForAvailableUpdate().then((availableUpdate) => {
                if (mounted && availableUpdate) setUpdate(availableUpdate);
            });
        }, 900);

        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    }, []);

    const keepCurrentVersion = async () => {
        if (!update || busy) return;
        setBusy(true);
        try {
            await dismissUpdate(update.tagName);
        } catch {
            // The choice still closes the notice if local storage is temporarily unavailable.
        } finally {
            setUpdate(null);
            setBusy(false);
        }
    };

    const openUpdate = async () => {
        if (!update || busy) return;
        setBusy(true);
        try {
            await Linking.openURL(update.updateUrl);
            setUpdate(null);
        } catch {
            Alert.alert('Não foi possível abrir a atualização', 'Confira sua conexão e tente novamente.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Modal
            transparent
            visible={Boolean(update)}
            animationType="fade"
            statusBarTranslucent
            onRequestClose={keepCurrentVersion}
        >
            <View style={styles.overlay} accessibilityViewIsModal>
                <View style={styles.card}>
                    <View style={styles.icon}><Text style={styles.iconText}>↗</Text></View>
                    <Text style={styles.eyebrow}>ATUALIZAÇÃO DISPONÍVEL</Text>
                    <Text style={styles.title}>Uma nova versão do Melodium chegou.</Text>
                    {update && (
                        <Text style={styles.copy}>
                            Você está usando a versão {update.installedVersion}. A versão {update.version} já pode ser instalada.
                        </Text>
                    )}
                    <Text style={styles.note}>Você pode continuar nesta versão e atualizar quando preferir.</Text>
                    <View style={styles.actions}>
                        <FlowButton disabled={busy} onPress={openUpdate}>Atualizar agora</FlowButton>
                        <FlowButton disabled={busy} variant="text" onPress={keepCurrentVersion}>Continuar nesta versão</FlowButton>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: 'rgba(22,17,13,0.58)',
    },
    card: {
        width: '100%',
        maxWidth: 440,
        alignSelf: 'center',
        padding: 24,
        borderRadius: 24,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.green,
        marginBottom: 18,
    },
    iconText: { color: colors.brown, fontSize: 27, lineHeight: 30, fontWeight: '700' },
    eyebrow: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
    title: { color: colors.brown, fontSize: 25, lineHeight: 31, fontWeight: '800', marginTop: 8 },
    copy: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 12 },
    note: { color: colors.soft, fontSize: 12, lineHeight: 18, marginTop: 10 },
    actions: { gap: 6, marginTop: 22 },
});
