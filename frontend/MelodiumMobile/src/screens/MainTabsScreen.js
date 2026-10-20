import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppTabs, colors, FlowButton } from '../components/FlowUI';
import { SocialScreen } from './CommunityScreens';
import HomeScreen from './HomeScreen';

const SHEET_OFFSET = 520;
const OVERLAY_FADE_OUT_MS = 220;

export default function MainTabsScreen({ navigation, route }) {
    const initialTab = route.params?.tab === 'Social' ? 'Social' : 'Home';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [pageLayers, setPageLayers] = useState([initialTab]);
    const [incomingTab, setIncomingTab] = useState(null);
    const [sheetVisible, setSheetVisible] = useState(false);
    const [contentWidth, setContentWidth] = useState(360);
    const slideX = useRef(new Animated.Value(0)).current;
    const sheetY = useRef(new Animated.Value(SHEET_OFFSET)).current;
    const overlayOpacity = useRef(new Animated.Value(1)).current;
    const sheetOpen = useRef(false);
    const sheetClosing = useRef(false);
    const actionLock = useRef(false);
    const tabTransitionRunning = useRef(false);

    const closeSheet = useCallback((onClosed) => {
        if (!sheetOpen.current || sheetClosing.current) return;

        sheetClosing.current = true;
        sheetY.stopAnimation();
        overlayOpacity.stopAnimation();
        Animated.parallel([
            Animated.timing(sheetY, {
                toValue: SHEET_OFFSET,
                duration: 190,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: OVERLAY_FADE_OUT_MS,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (!finished) {
                sheetClosing.current = false;
                return;
            }

            sheetOpen.current = false;
            sheetClosing.current = false;
            setSheetVisible(false);
            onClosed?.();
        });
    }, [overlayOpacity, sheetY]);

    const openSheet = useCallback(() => {
        if (sheetOpen.current || sheetClosing.current) return;

        actionLock.current = false;
        sheetOpen.current = true;
        sheetY.setValue(SHEET_OFFSET);
        overlayOpacity.stopAnimation();
        overlayOpacity.setValue(1);
        setSheetVisible(true);
        requestAnimationFrame(() => Animated.timing(sheetY, {
            toValue: 0,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start());
    }, [overlayOpacity, sheetY]);

    const sheetPan = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onMoveShouldSetPanResponderCapture: (_, gesture) => gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => sheetY.setValue(Math.max(0, gesture.dy)),
        onPanResponderRelease: (_, gesture) => {
            if (gesture.dy > 85 || gesture.vy > 0.8) closeSheet();
            else Animated.timing(sheetY, {
                toValue: 0,
                duration: 170,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        },
        onPanResponderTerminate: () => Animated.timing(sheetY, {
            toValue: 0,
            duration: 170,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(),
        onPanResponderTerminationRequest: () => false,
    })).current;

    useEffect(() => {
        if (!sheetVisible) return undefined;

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            closeSheet();
            return true;
        });

        return () => backHandler.remove();
    }, [closeSheet, sheetVisible]);

    const switchTab = (nextTab) => {
        if (nextTab === activeTab || tabTransitionRunning.current) return;

        tabTransitionRunning.current = true;
        slideX.stopAnimation();
        const entryOffset = contentWidth;
        slideX.setValue(entryOffset);
        setPageLayers([activeTab, nextTab]);
        setIncomingTab(nextTab);
        requestAnimationFrame(() => Animated.timing(slideX, {
            toValue: 0,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(({ finished }) => {
            tabTransitionRunning.current = false;

            if (!finished) {
                slideX.setValue(0);
                setIncomingTab(null);
                setPageLayers([activeTab]);
                return;
            }

            setActiveTab(nextTab);
            setIncomingTab(null);
            setPageLayers([nextTab]);
        }));
    };

    const openAction = (screen) => {
        if (actionLock.current) return;

        actionLock.current = true;
        closeSheet(() => navigation.navigate(screen));
    };

    return (
        <SafeAreaView style={styles.screen} edges={['bottom']}>
            <View style={styles.contentArea} onLayout={(event) => setContentWidth(event.nativeEvent.layout.width || 360)}>
                {pageLayers.map((tab) => {
                    const isIncoming = tab === incomingTab;

                    return (
                        <Animated.View
                            key={tab}
                            pointerEvents={isIncoming || (!incomingTab && tab === activeTab) ? 'auto' : 'none'}
                            style={[
                                styles.page,
                                { zIndex: isIncoming ? 2 : 1 },
                                isIncoming && { transform: [{ translateX: slideX }] },
                            ]}
                        >
                            {tab === 'Home'
                                ? <HomeScreen navigation={navigation} embedded />
                                : <SocialScreen navigation={navigation} embedded />}
                        </Animated.View>
                    );
                })}

                {sheetVisible && (
                    <View style={styles.sheetOverlay}>
                        <Animated.View
                            pointerEvents="none"
                            style={[styles.sheetShade, { opacity: overlayOpacity }]}
                        />
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Fechar ações"
                            accessibilityHint="Fecha a folha de ações de prática"
                            onPress={() => closeSheet()}
                            style={styles.sheetBackdrop}
                        />
                        <Animated.View {...sheetPan.panHandlers} style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}>
                            <View style={styles.sheetSurface}>
                                <View style={styles.dragHandle} accessibilityElementsHidden />
                                <View style={styles.sheetHeader}>
                                    <Text style={styles.sheetTitle}>Mais música, do seu jeito</Text>
                                    <Pressable accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={8} onPress={() => closeSheet()} style={styles.closeButton}>
                                        <Text style={styles.closeGlyph}>×</Text>
                                    </Pressable>
                                </View>
                                <FlowButton onPress={() => openAction('Practice')}>Começar uma prática</FlowButton>
                                <FlowButton variant="secondary" onPress={() => openAction('AddPractice')}>Registrar uma prática anterior</FlowButton>
                                <FlowButton variant="secondary" onPress={() => openAction('RecordVideo')}>Gravar vídeo</FlowButton>
                            </View>
                        </Animated.View>
                    </View>
                )}
            </View>

            <AppTabs
                active={activeTab}
                onAdd={openSheet}
                onHome={() => switchTab('Home')}
                onDiary={() => switchTab('Social')}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.white },
    contentArea: { flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: colors.background },
    page: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: colors.background,
    },
    sheetOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 20,
        justifyContent: 'flex-end',
    },
    sheetShade: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 0,
        backgroundColor: 'rgba(22,17,13,0.55)',
    },
    sheetBackdrop: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 1,
    },
    sheet: { width: '100%', zIndex: 2 },
    sheetSurface: {
        paddingHorizontal: 24,
        paddingTop: 14,
        paddingBottom: 28,
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        gap: 12,
    },
    dragHandle: {
        width: 48,
        height: 5,
        borderRadius: 3,
        backgroundColor: colors.border,
        alignSelf: 'center',
        marginBottom: 2,
    },
    sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sheetTitle: { color: colors.brown, fontSize: 18, lineHeight: 24, fontWeight: '700' },
    closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    closeGlyph: { color: colors.brown, fontSize: 28, lineHeight: 31 },
});
