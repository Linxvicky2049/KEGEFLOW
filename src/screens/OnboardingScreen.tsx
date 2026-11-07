import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '../components/ActionButton';
import { BrandMark } from '../components/BrandMark';
import { colors } from '../theme/colors';

const slides = [
  {
    eyebrow: 'YOUR ART, IN MOTION',
    title: 'Bring every\npanel to life.',
    body: 'Turn the manga and comic pages you own into expressive motion projects.',
    symbol: '✦',
  },
  {
    eyebrow: 'MADE FOR CREATORS',
    title: 'Start with\nyour pages.',
    body: 'Import artwork from your device. Your original images stay yours and are copied into local project storage.',
    symbol: '▧',
  },
  {
    eyebrow: 'BUILT AROUND YOUR WORK',
    title: 'Create at\nyour own pace.',
    body: 'Projects are saved on this device. KageFlow only shows tools that are ready to use.',
    symbol: '↗',
  },
];

type OnboardingScreenProps = {
  onComplete: () => void;
};

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const finalSlide = index === slides.length - 1;

  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <BrandMark />
        <Pressable accessibilityRole="button" onPress={onComplete} hitSlop={12}>
          <Text style={styles.skip}>SKIP</Text>
        </Pressable>
      </View>
      <View style={styles.artCard}>
        <View style={styles.artGlow} />
        <Text style={styles.artSymbol}>{slide.symbol}</Text>
        <View style={styles.artCaption}>
          <View style={styles.captionLine} />
          <Text style={styles.captionText}>BLKSN / MOTION LAB</Text>
        </View>
        <Text style={styles.verticalLabel}>KAGEFLOW  —  01</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((item, dotIndex) => (
            <View
              key={item.eyebrow}
              style={[styles.dot, dotIndex === index && styles.activeDot]}
            />
          ))}
        </View>
        <ActionButton
          label={finalSlide ? 'Enter the studio  →' : 'Continue  →'}
          onPress={() => (finalSlide ? onComplete() : setIndex(index + 1))}
        />
        <Text style={styles.credit}>A BLACKSUN CREATIVE TOOL</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1, paddingHorizontal: 24, paddingTop: 22 },
  top: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  skip: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  artCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 28,
    flex: 1,
    justifyContent: 'center',
    marginTop: 28,
    maxHeight: 300,
    overflow: 'hidden',
    position: 'relative',
  },
  artGlow: {
    backgroundColor: colors.accentDark,
    borderRadius: 180,
    height: 210,
    opacity: 0.75,
    position: 'absolute',
    right: -52,
    top: -85,
    width: 210,
  },
  artSymbol: { color: colors.accent, fontSize: 112, fontWeight: '200', lineHeight: 130 },
  artCaption: { alignItems: 'center', bottom: 24, flexDirection: 'row', gap: 9, left: 22, position: 'absolute' },
  captionLine: { backgroundColor: colors.accent, height: 1, width: 28 },
  captionText: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.4 },
  verticalLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    position: 'absolute',
    right: 18,
    top: 22,
    transform: [{ rotate: '90deg' }, { translateX: 35 }],
  },
  copy: { paddingTop: 28 },
  eyebrow: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  title: { color: colors.text, fontSize: 38, fontWeight: '800', letterSpacing: -1.2, lineHeight: 43, marginTop: 12 },
  body: { color: colors.muted, fontSize: 14, lineHeight: 22, marginTop: 12, maxWidth: 330 },
  footer: { paddingBottom: 14, paddingTop: 22 },
  dots: { flexDirection: 'row', gap: 7, marginBottom: 18 },
  dot: { backgroundColor: colors.border, borderRadius: 5, height: 5, width: 16 },
  activeDot: { backgroundColor: colors.accent, width: 30 },
  credit: { color: '#596476', fontSize: 9, fontWeight: '800', letterSpacing: 1.6, marginTop: 16, textAlign: 'center' },
});
