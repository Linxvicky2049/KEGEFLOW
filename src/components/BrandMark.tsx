import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.symbol, compact && styles.symbolCompact]}>
        <Text style={[styles.symbolText, compact && styles.symbolTextCompact]}>K</Text>
      </View>
      <View>
        <Text style={[styles.name, compact && styles.nameCompact]}>KAGEFLOW</Text>
        {!compact && <Text style={styles.tagline}>MANGA MOTION STUDIO</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', gap: 11 },
  symbol: {
    alignItems: 'center',
    backgroundColor: colors.accentDark,
    borderColor: '#36745F',
    borderRadius: 16,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  symbolCompact: { borderRadius: 12, height: 36, width: 36 },
  symbolText: { color: colors.accent, fontSize: 26, fontWeight: '900' },
  symbolTextCompact: { fontSize: 20 },
  name: { color: colors.text, fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  nameCompact: { fontSize: 15 },
  tagline: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1.4, marginTop: 3 },
});
