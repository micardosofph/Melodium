import React from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { openDiaryTab, openHomeTab } from '../services/tabNavigation';

export const colors = {
    background: '#F7F9F4',
    brown: '#46240C',
    muted: '#8A6B56',
    green: '#C2D5B6',
    paleGreen: '#E9EFE4',
    border: '#D8E2D0',
    white: '#FFFFFF',
    soft: '#A99A8D',
};

export function FlowScreen({ children, contentStyle, scroll = true }) {
    return (
        <SafeAreaView style={styles.screen} edges={['top', 'bottom', 'left', 'right']}>
            {scroll ? (
                <ScrollView
                    contentContainerStyle={[styles.content, contentStyle]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {children}
                </ScrollView>
            ) : (
                <View style={[styles.content, contentStyle]}>{children}</View>
            )}
        </SafeAreaView>
    );
}

export function BrandMark({ compact = false }) {
    return (
        <View style={[styles.brandRow, compact && styles.brandCompact]}>
            <Image source={require('../../assets/logo-minimalist.png')} style={styles.mark} />

            <View>
                <Text style={styles.brandName}>Melodium</Text>
                {!compact && <Text style={styles.brandTagline}>Mantenha o ritmo.</Text>}
            </View>
        </View>
    );
}

export function Eyebrow({ children, style }) {
    return <Text style={[styles.eyebrow, style]}>{children}</Text>;
}

export function Heading({ children, style }) {
    return <Text style={[styles.heading, style]}>{children}</Text>;
}

export function BodyText({ children, style }) {
    return <Text style={[styles.body, style]}>{children}</Text>;
}

export function FlowButton({ children, onPress, variant = 'primary', style, disabled = false }) {
    return (
        <Pressable
            accessibilityRole="button"
            disabled={disabled}
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                variant === 'secondary' && styles.secondaryButton,
                variant === 'text' && styles.textButton,
                disabled && styles.disabledButton,
                pressed && !disabled && styles.pressedButton,
                style,
            ]}
        >
            <Text style={[
                styles.buttonText,
                variant === 'secondary' && styles.secondaryButtonText,
                variant === 'text' && styles.textButtonText,
            ]}>
                {children}
            </Text>
        </Pressable>
    );
}

export function FlowField({ label, style, ...inputProps }) {
    return (
        <View style={[styles.field, style]}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
                placeholderTextColor={colors.soft}
                selectionColor={colors.brown}
                style={styles.input}
                {...inputProps}
            />
        </View>
    );
}

export function AppTabs({ navigation, active = 'Home', onAdd }) {
    const goHome = () => openHomeTab(navigation, active);
    const goDiary = () => openDiaryTab(navigation, active);
    return (
        <View style={styles.tabBar}>
            <Pressable accessibilityRole="button" onPress={goHome} style={styles.tabItem}>
                <Text style={[styles.tabLabel, active === 'Home' && styles.tabActive]}>Home</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onAdd || (() => navigation.navigate('AddPractice'))} style={styles.addTab}>
                <Text style={styles.addTabText}>+</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={goDiary} style={styles.tabItem}>
                <Text style={[styles.tabLabel, active === 'Social' && styles.tabActive]}>Diário</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 },
    brandCompact: { marginBottom: 0 },
    mark: {
        width: 54,
        height: 54,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: colors.brown,
        backgroundColor: colors.green,
        alignItems: 'center',
        justifyContent: 'center',
    },
    markText: { color: colors.brown, fontSize: 22, fontWeight: '700' },
    brandName: { color: colors.brown, fontSize: 24, fontWeight: '700' },
    brandTagline: { color: colors.muted, fontSize: 14, marginTop: 2 },
    eyebrow: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 },
    heading: { color: colors.brown, fontSize: 30, lineHeight: 36, fontWeight: '700' },
    body: { color: colors.muted, fontSize: 16, lineHeight: 24 },
    button: {
        minHeight: 54,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: colors.brown,
    },
    secondaryButton: { backgroundColor: colors.green },
    textButton: { backgroundColor: 'transparent', minHeight: 44 },
    disabledButton: { opacity: 0.55 },
    pressedButton: { opacity: 0.82 },
    buttonText: { color: colors.white, fontSize: 16, fontWeight: '700', textAlign: 'center' },
    secondaryButtonText: { color: colors.brown },
    textButtonText: { color: colors.brown, fontSize: 14 },
    field: { marginBottom: 18 },
    fieldLabel: { color: colors.brown, fontSize: 14, fontWeight: '700', marginBottom: 8 },
    input: {
        minHeight: 54,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
        color: colors.brown,
        fontSize: 16,
        paddingHorizontal: 16,
    },
    tabBar: {
        minHeight: 76,
        paddingHorizontal: 40,
        paddingTop: 10,
        paddingBottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.paleGreen,
    },
    tabItem: { width: 60, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
    tabLabel: { color: '#A1B397', fontSize: 13 },
    tabActive: { color: colors.brown, fontWeight: '700' },
    addTab: {
        width: 58,
        height: 58,
        marginTop: -26,
        borderRadius: 29,
        borderWidth: 4,
        borderColor: colors.background,
        backgroundColor: colors.brown,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addTabText: { color: colors.white, fontSize: 32, lineHeight: 34 },
});
