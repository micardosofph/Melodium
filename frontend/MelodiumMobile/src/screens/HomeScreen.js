import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Modal, Pressable } from 'react-native';
import ComingSoonPopup from '../components/ComingSoonPopup';

export default function HomeScreen({ navigation }) {
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [isComingSoonVisible, setIsComingSoonVisible] = useState(false);

    const closeDrawer = () => setIsDrawerVisible(false);
    const openComingSoon = () => {
        closeDrawer();
        setIsComingSoonVisible(true);
    };
    const startPractice = () => {
        closeDrawer();
        navigation.navigate('Pratica');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.eyebrow}>BOM DIA, MÚSICO</Text>
                        <Text style={styles.title}>Área de prática</Text>
                        <Text style={styles.subtitle}>mantenha o ritmo</Text>
                    </View>
                    <TouchableOpacity style={styles.profileButton} onPress={openComingSoon}>
                        <Text style={styles.profileText}>US</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardHeader}>⏱ tempo total de prática</Text>
                        <Text style={styles.cardNumber}>0</Text>
                        <Text style={styles.cardFooter}>minutos</Text>
                    </View>

                    <TouchableOpacity style={styles.cardInfo} onPress={openComingSoon}>
                        <Text style={styles.cardHeader}>✦ ofensiva atual</Text>
                        <Text style={styles.cardNumber}>3</Text>
                        <Text style={styles.cardFooter}>dias seguidos</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>ações rápidas</Text>

                <TouchableOpacity
                    style={styles.btnGreen}
                    onPress={() => navigation.navigate('Metronome')}
                >
                    <View>
                        <Text style={styles.btnGreenTitle}>Metrônomo</Text>
                        <Text style={styles.btnGreenSub}>pratique a precisão</Text>
                    </View>
                    <Text style={styles.iconSimbol}>⏱</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.btnBrown}
                    onPress={() => navigation.navigate('Tuner')}
                >
                    <View>
                        <Text style={styles.btnBrownTitle}>Afinar instrumento</Text>
                        <Text style={styles.btnBrownSub}>deixe cada nota no lugar</Text>
                    </View>
                    <Text style={styles.iconSimbolLight}>⌁</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>aprenda e acompanhe</Text>
                <View style={styles.discoverRow}>
                    <TouchableOpacity style={styles.smallCard} onPress={openComingSoon}>
                        <Text style={styles.smallIcon}>✦</Text>
                        <Text style={styles.smallTitle}>Trilhas</Text>
                        <Text style={styles.smallSub}>aprenda por etapas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.smallCard} onPress={openComingSoon}>
                        <Text style={styles.smallIcon}>♪</Text>
                        <Text style={styles.smallTitle}>Conceitos</Text>
                        <Text style={styles.smallSub}>consulte fundamentos</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.discoverRow}>
                    <TouchableOpacity style={styles.smallCard} onPress={openComingSoon}>
                        <Text style={styles.smallIcon}>↗</Text>
                        <Text style={styles.smallTitle}>Progresso</Text>
                        <Text style={styles.smallSub}>acompanhe seu caminho</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.smallCard} onPress={openComingSoon}>
                        <Text style={styles.smallIcon}>?</Text>
                        <Text style={styles.smallTitle}>Guia Melodium</Text>
                        <Text style={styles.smallSub}>entenda o aplicativo</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.tab} onPress={() => { }}>
                    <Text style={styles.tabTextActive}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabMain} onPress={() => setIsDrawerVisible(true)} accessibilityLabel="Abrir gaveta de ações">
                    <Text style={styles.tabMainText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab} onPress={openComingSoon}>
                    <Text style={styles.tabText}>Social</Text>
                </TouchableOpacity>
            </View>

            <ComingSoonPopup visible={isComingSoonVisible} onClose={() => setIsComingSoonVisible(false)} />

            <Modal visible={isDrawerVisible} transparent animationType="slide" onRequestClose={closeDrawer}>
                <View style={styles.modalRoot}>
                    <Pressable style={styles.modalBackdrop} onPress={closeDrawer} />
                    <View style={styles.drawer}>
                        <View style={styles.drawerHandle} />
                        <View style={styles.drawerHeader}>
                            <View>
                                <Text style={styles.drawerEyebrow}>NOVA ATIVIDADE</Text>
                                <Text style={styles.drawerTitle}>O que você quer fazer?</Text>
                            </View>
                            <TouchableOpacity style={styles.closeButton} onPress={closeDrawer} accessibilityLabel="Fechar gaveta">
                                <Text style={styles.closeButtonText}>×</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.drawerActionPrimary} onPress={startPractice}>
                            <View style={styles.drawerIconPrimary}><Text style={styles.drawerIconText}>♩</Text></View>
                            <View style={styles.drawerActionCopy}>
                                <Text style={styles.drawerActionTitle}>Começar uma prática</Text>
                                <Text style={styles.drawerActionSub}>use o metrônomo e registre seu tempo</Text>
                            </View>
                            <Text style={styles.drawerArrow}>›</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.drawerAction} onPress={openComingSoon}>
                            <View style={styles.drawerIcon}><Text style={styles.drawerIconText}>＋</Text></View>
                            <View style={styles.drawerActionCopy}>
                                <Text style={styles.drawerActionTitle}>Nova atividade</Text>
                                <Text style={styles.drawerActionSub}>registre uma sessão que já aconteceu</Text>
                            </View>
                            <Text style={styles.drawerArrow}>›</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.drawerAction} onPress={openComingSoon}>
                            <View style={styles.drawerIcon}><Text style={styles.drawerIconText}>▣</Text></View>
                            <View style={styles.drawerActionCopy}>
                                <Text style={styles.drawerActionTitle}>Gravar vídeo</Text>
                                <Text style={styles.drawerActionSub}>registre sua evolução tocando</Text>
                            </View>
                            <Text style={styles.drawerArrow}>›</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F9F4' },
    content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 44 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 20 },
    eyebrow: { color: '#8A6B56', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.4, marginBottom: 8 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#46240C', marginTop: 20 },
    subtitle: { fontSize: 18, color: '#8A6B56', marginBottom: 20 },
    profileButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#C2D5B6', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#46240C' },
    profileText: { color: '#46240C', fontWeight: 'bold' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    cardInfo: {
        width: '48%', backgroundColor: '#FFFFFF', borderColor: '#46240C',
        borderWidth: 1, borderRadius: 16, padding: 16
    },
    cardHeader: { color: '#8A6B56', fontSize: 12, marginBottom: 20 },
    cardNumber: { color: '#46240C', fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
    cardFooter: { color: '#8A6B56', fontSize: 12 },
    sectionTitle: { fontSize: 18, color: '#46240C', textAlign: 'center', marginVertical: 20 },
    btnGreen: {
        backgroundColor: '#C2D5B6', borderRadius: 16, padding: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
        borderWidth: 1, borderColor: '#46240C'
    },
    btnGreenTitle: { fontSize: 20, fontWeight: 'bold', color: '#46240C' },
    btnGreenSub: { fontSize: 16, color: '#46240C', opacity: 0.8 },
    btnBrown: {
        backgroundColor: '#46240C', borderRadius: 16, padding: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    btnBrownTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
    btnBrownSub: { fontSize: 16, color: '#E0E0E0' },
    iconSimbol: { fontSize: 24, color: '#46240C' },
    iconSimbolLight: { fontSize: 24, color: '#FFFFFF' },
    discoverRow: { flexDirection: 'row', justifyContent: 'space-between' },
    smallCard: { width: '48%', backgroundColor: '#E9EFE4', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#C2D5B6', marginBottom: 12 },
    smallIcon: { color: '#46240C', fontSize: 26, marginBottom: 12 },
    smallTitle: { color: '#46240C', fontSize: 15, fontWeight: 'bold' },
    smallSub: { color: '#8A6B56', fontSize: 12, marginTop: 4 },
    bottomBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E9EFE4' },
    tab: { alignItems: 'center' },
    tabTextActive: { color: '#46240C', fontWeight: 'bold' },
    tabText: { color: '#A0D0A0' },
    tabMain: { backgroundColor: '#46240C', width: 58, height: 58, borderRadius: 29, justifyContent: 'center', alignItems: 'center', marginTop: -28, borderWidth: 4, borderColor: '#F7F9F4' },
    tabMainText: { color: '#FFF', fontSize: 30, lineHeight: 32 },
    modalRoot: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(35, 22, 14, 0.42)' },
    drawer: { backgroundColor: '#F7F9F4', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 30 },
    drawerHandle: { width: 42, height: 5, borderRadius: 3, backgroundColor: '#C2D5B6', alignSelf: 'center', marginBottom: 22 },
    drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    drawerEyebrow: { color: '#8A6B56', fontSize: 10, fontWeight: 'bold', letterSpacing: 1.4, marginBottom: 7 },
    drawerTitle: { color: '#46240C', fontSize: 23, fontWeight: 'bold' },
    closeButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#E9EFE4', alignItems: 'center', justifyContent: 'center' },
    closeButtonText: { color: '#46240C', fontSize: 25, lineHeight: 28 },
    drawerAction: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D8E2D0', borderRadius: 16, padding: 14, marginBottom: 10 },
    drawerActionPrimary: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#C2D5B6', borderWidth: 1, borderColor: '#46240C', borderRadius: 16, padding: 14, marginBottom: 10 },
    drawerIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#E9EFE4', alignItems: 'center', justifyContent: 'center' },
    drawerIconPrimary: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#F7F9F4', alignItems: 'center', justifyContent: 'center' },
    drawerIconText: { color: '#46240C', fontSize: 24 },
    drawerActionCopy: { flex: 1, marginLeft: 13 },
    drawerActionTitle: { color: '#46240C', fontSize: 15, fontWeight: 'bold' },
    drawerActionSub: { color: '#8A6B56', fontSize: 12, marginTop: 4 },
    drawerArrow: { color: '#8A6B56', fontSize: 27, marginLeft: 8 }
});