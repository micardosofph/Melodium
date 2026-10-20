import React from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { BodyText, colors, Eyebrow, FlowScreen, ScreenHeader } from '../components/FlowUI';

const SUPPORT_EMAIL = 'melodium.contato@gmail.com';
const SUPPORT_INSTAGRAM = '@melodiumsoqbemol';

async function openLink(url) {
    try {
        await Linking.openURL(url);
    } catch (error) {
        Alert.alert('Não foi possível abrir o link', 'Verifique se há um aplicativo compatível instalado.');
    }
}

export function SupportScreen({ navigation }) {
    return (
        <FlowScreen contentStyle={styles.content}>
            <ScreenHeader navigation={navigation} title="Ajuda e suporte" />
            <Eyebrow>ESTAMOS AQUI</Eyebrow>
            <BodyText style={styles.intro}>Fale com a equipe Melodium. Vamos ajudar você.</BodyText>

            <Pressable accessibilityRole="link" onPress={() => openLink(`mailto:${SUPPORT_EMAIL}`)} style={styles.contactRow}>
                <View style={styles.contactIcon}><Text style={styles.icon}>@</Text></View>
                <View style={styles.contactCopy}>
                    <Text style={styles.contactLabel}>E-mail</Text>
                    <Text style={styles.contactValue}>{SUPPORT_EMAIL}</Text>
                </View>
                <Text style={styles.arrow}>↗</Text>
            </Pressable>
            <Pressable accessibilityRole="link" onPress={() => openLink(`https://instagram.com/${SUPPORT_INSTAGRAM.slice(1)}`)} style={styles.contactRow}>
                <View style={[styles.contactIcon, styles.instagramIcon]}><Text style={styles.icon}>◎</Text></View>
                <View style={styles.contactCopy}>
                    <Text style={styles.contactLabel}>Instagram</Text>
                    <Text style={styles.contactValue}>{SUPPORT_INSTAGRAM}</Text>
                </View>
                <Text style={styles.arrow}>↗</Text>
            </Pressable>

            <View style={styles.bugNotice}>
                <Text style={styles.bugTitle}>Encontrou algum bug?</Text>
                <BodyText style={styles.bugText}>Avise a gente pelo e-mail ou Instagram acima. Seu relato ajuda a deixar o Melodium cada vez melhor.</BodyText>
            </View>

            <View style={styles.note}>
                <Eyebrow>CONTA COM A GENTE</Eyebrow>
                <Text style={styles.noteTitle}>Sua música importa.</Text>
                <BodyText style={styles.noteBody}>Envie sua dúvida ou conte como podemos tornar o Melodium melhor para você.</BodyText>
            </View>        </FlowScreen>
    );
}

const styles = StyleSheet.create({
    content: { paddingTop: 18, paddingBottom: 30 },
    intro: { fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 22 },
    contactRow: { minHeight: 78, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 10, marginBottom: 11 },
    contactIcon: { width: 42, height: 42, borderRadius: 11, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
    instagramIcon: { backgroundColor: '#E9D7C9' },
    icon: { color: colors.brown, fontSize: 22, fontWeight: '700' },
    contactCopy: { flex: 1, marginLeft: 12 },
    contactLabel: { color: colors.muted, fontSize: 11 },
    contactValue: { color: colors.brown, fontSize: 13, fontWeight: '700', marginTop: 4 },
    arrow: { color: colors.muted, fontSize: 18, marginLeft: 8 },
    bugNotice: { padding: 16, backgroundColor: '#F7EDE5', borderWidth: 1, borderColor: '#E9D7C9', borderRadius: 10, marginTop: 7 },
    bugTitle: { color: colors.brown, fontSize: 15, fontWeight: '700' },
    bugText: { fontSize: 13, lineHeight: 19, marginTop: 5 },
    note: { padding: 18, backgroundColor: colors.paleGreen, borderRadius: 10, marginTop: 18, marginBottom: 22 },
    noteTitle: { color: colors.brown, fontSize: 19, fontWeight: '700', marginTop: 6 },
    noteBody: { fontSize: 13, lineHeight: 19, marginTop: 6 },

});
