import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '../components/BrandMark';
import { colors } from '../theme/colors';

export function SettingsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>PREFERENCES</Text>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.brandCard}>
        <BrandMark />
        <Text style={styles.description}>
          A manga and comic motion studio by BLACKSUN.
        </Text>
      </View>
      <Text style={styles.section}>STORAGE & PRIVACY</Text>
      <View style={styles.infoCard}>
        <View style={styles.statusDot} />
        <View style={styles.infoText}>
          <Text style={styles.infoTitle}>Projects stay on this device</Text>
          <Text style={styles.infoBody}>
            Imported images are copied into app storage. No account or cloud upload is configured.
          </Text>
        </View>
      </View>
      <Text style={styles.section}>ABOUT</Text>
      <View style={styles.aboutCard}>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>PRODUCT</Text>
          <Text style={styles.aboutValue}>KageFlow AI</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>EDITION</Text>
          <Text style={styles.aboutValue}>Foundation</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>DEVELOPED BY</Text>
          <Text style={styles.aboutValue}>BLACKSUN</Text>
        </View>
      </View>
      <Text style={styles.disclaimer}>
        Animation, AI reconstruction, voice generation, and video export are not included in this foundation milestone.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32, paddingHorizontal: 22, paddingTop: 24 },
  eyebrow: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.8 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', marginTop: 8 },
  brandCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, marginTop: 22, padding: 18 },
  description: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 16 },
  section: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.3, marginBottom: 10, marginTop: 26 },
  infoCard: { alignItems: 'flex-start', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 12, padding: 16 },
  statusDot: { backgroundColor: colors.accent, borderRadius: 5, height: 8, marginTop: 4, width: 8 },
  infoText: { flex: 1, gap: 6 },
  infoTitle: { color: colors.text, fontSize: 12, fontWeight: '800' },
  infoBody: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  aboutCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16 },
  aboutRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 47 },
  aboutLabel: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  aboutValue: { color: colors.text, fontSize: 11, fontWeight: '700' },
  divider: { backgroundColor: colors.border, height: 1 },
  disclaimer: { color: '#778397', fontSize: 10, lineHeight: 15, marginTop: 20 },
});
