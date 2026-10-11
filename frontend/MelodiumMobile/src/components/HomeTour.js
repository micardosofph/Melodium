import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, FlowButton } from './FlowUI';

export const tourSteps = [
    { key: 'practice', title: 'Seu tempo merece um registro', text: 'Inicie uma prática, use as ferramentas e salve a sessão. Cada minuto passa a fazer parte da sua evolução.' },
    { key: 'record', title: 'Escute a diferença', text: 'Grave um trecho, escolha um nome e guarde seu vídeo no álbum Melodium deste aparelho.' },
    { key: 'evolution', title: 'Reveja o seu caminho', text: 'Abra sua galeria para comparar gravações e perceber o que mudou na sua música.' },
    { key: 'tools', title: 'Afine. Marque o tempo. Toque.', text: 'Use o afinador e o metrônomo durante a prática. O cronômetro continua enquanto você usa as ferramentas.' },
    { key: 'progress', title: 'Seu progresso, de verdade', text: 'Veja o tempo salvo, os dias de prática e seu histórico. Esses dados ficam neste celular.' },
];
export default function HomeTour({ step, rect, size, onNext, onSkip, onSupport }) {
    const finished = step >= tourSteps.length;
    const shade = 'rgba(22, 17, 13, 0.78)';
    const cardProgress = useRef(new Animated.Value(0)).current;
    const pulse = useRef(new Animated.Value(0)).current;
    const padding = 14;
    const hole = !finished && rect && (() => {
        const x = Math.max(8, rect.x - padding);
        const y = Math.max(8, rect.y - padding);
        const right = Math.min(size.width - 8, rect.x + rect.width + padding);
        const bottom = Math.min(size.height - 8, rect.y + rect.height + padding);
        return { x, y, w: Math.max(0, right - x), h: Math.max(0, bottom - y) };
    })();
    useEffect(() => {
        cardProgress.setValue(0);
        Animated.spring(cardProgress, { toValue: 1, damping: 20, stiffness: 220, useNativeDriver: true }).start();
        const loop = Animated.loop(Animated.sequence([
            Animated.timing(pulse, { toValue: 1, duration: 850, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 0, duration: 850, useNativeDriver: true }),
        ]));
        loop.start();
        return () => loop.stop();
    }, [step, cardProgress, pulse]);
    const animatedCard = {
        opacity: cardProgress,
        transform: [{ translateY: cardProgress.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }],
    };
    return (
        <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
            <View style={StyleSheet.absoluteFill} />
            {hole ? <>
                <View style={{ position: 'absolute', left: 0, top: 0, width: size.width, height: hole.y, backgroundColor: shade }} />
                <View style={{ position: 'absolute', left: 0, top: hole.y, width: hole.x, height: hole.h, backgroundColor: shade }} />
                <View style={{ position: 'absolute', left: hole.x + hole.w, right: 0, top: hole.y, height: hole.h, backgroundColor: shade }} />
                <View style={{ position: 'absolute', left: 0, right: 0, top: hole.y + hole.h, bottom: 0, backgroundColor: shade }} />
                <Animated.View style={{ position: 'absolute', left: hole.x, top: hole.y, width: hole.w, height: hole.h, borderWidth: 2, borderColor: colors.green, borderRadius: 22, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.018] }) }] }} />
            </> : <View style={[StyleSheet.absoluteFill, { backgroundColor: shade }]} />}
            <Animated.View style={[styles.card, animatedCard]}>
                <View style={styles.top}>
                    <Text style={styles.step}>{finished ? 'DO SEU JEITO' : `GUIA MELODIUM · ${step + 1}/${tourSteps.length}`}</Text>
                    <Pressable accessibilityRole="button" onPress={onSkip} hitSlop={10} style={styles.skip}><Text style={styles.skipText}>{finished ? 'Fechar' : 'Pular tudo'}</Text></Pressable>
                </View>
                <Text accessibilityRole="header" style={styles.title}>{finished ? 'Ficou com dúvida?' : tourSteps[step].title}</Text>
                <Text style={styles.body}>{finished ? 'O guia fica sempre aqui na Home. Se precisar, fale com a gente.' : tourSteps[step].text}</Text>
                {finished ? <>
                    <FlowButton onPress={onSupport}>Falar com a equipe</FlowButton>
                    <FlowButton variant="text" onPress={onSkip}>Tudo certo, vamos tocar</FlowButton>
                </> : <FlowButton onPress={onNext}>{step === tourSteps.length - 1 ? 'Concluir o guia' : 'Próximo  →'}</FlowButton>}
            </Animated.View>
        </View>
    );
}
const styles = StyleSheet.create({
    card: { position: 'absolute', left: 18, right: 18, bottom: 18, padding: 22, backgroundColor: colors.background, borderRadius: 24, elevation: 10 },
    top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 14 },
    step: { color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, flex: 1 },
    skip: { minHeight: 44, justifyContent: 'center' }, skipText: { color: colors.brown, fontSize: 13, fontWeight: '700' },
    title: { color: colors.brown, fontSize: 24, lineHeight: 29, fontWeight: '700' },
    body: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 18 },
});
