import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ActionButton } from '../components/ActionButton';
import { colors } from '../theme/colors';
import { addProjectPages, getProjectPages } from '../storage/database';
import type { MangaPage, MangaProject } from '../types/project';

type ProjectDetailScreenProps = {
  project: MangaProject;
  onBack: () => void;
  onProjectUpdated: () => Promise<void>;
};

export function ProjectDetailScreen({
  project,
  onBack,
  onProjectUpdated,
}: ProjectDetailScreenProps) {
  const [pages, setPages] = useState<MangaPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [openPage, setOpenPage] = useState<MangaPage | null>(null);

  const loadPages = async () => {
    setLoading(true);
    try {
      setPages(await getProjectPages(project.id));
    } catch (error) {
      Alert.alert(
        'Pages could not be loaded',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPages();
  }, [project.id]);

  const importPages = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Photo access needed', 'Allow KageFlow to access selected images to import pages.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (result.canceled || result.assets.length === 0) return;

      setImporting(true);
      await addProjectPages(project.id, result.assets);
      await loadPages();
      await onProjectUpdated();
    } catch (error) {
      Alert.alert(
        'Pages could not be imported',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setImporting(false);
    }
  };

  if (openPage) {
    const currentIndex = pages.findIndex((page) => page.id === openPage.id);
    return (
      <View style={styles.reader}>
        <View style={styles.readerHeader}>
          <Pressable accessibilityRole="button" onPress={() => setOpenPage(null)}>
            <Text style={styles.back}>‹  PROJECT</Text>
          </Pressable>
          <Text style={styles.pageNumber}>{currentIndex + 1} / {pages.length}</Text>
        </View>
        <Image resizeMode="contain" source={{ uri: openPage.uri }} style={styles.readerImage} />
        <View style={styles.readerFooter}>
          <Pressable
            accessibilityRole="button"
            disabled={currentIndex <= 0}
            onPress={() => setOpenPage(pages[currentIndex - 1])}
            style={styles.readerControl}
          >
            <Text style={[styles.readerControlText, currentIndex <= 0 && styles.dimmed]}>←  Previous</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={currentIndex >= pages.length - 1}
            onPress={() => setOpenPage(pages[currentIndex + 1])}
            style={styles.readerControl}
          >
            <Text style={[styles.readerControlText, currentIndex >= pages.length - 1 && styles.dimmed]}>Next  →</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={onBack} hitSlop={12}>
          <Text style={styles.back}>‹  LIBRARY</Text>
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>{project.title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>MANGA PROJECT</Text>
        <Text style={styles.title}>{project.title}</Text>
        <Text style={styles.subtitle}>
          {pages.length} {pages.length === 1 ? 'page' : 'pages'}  ·  Saved on this device
        </Text>
        <View style={styles.action}>
          <ActionButton
            busy={importing}
            label="＋  Import manga pages"
            onPress={() => void importPages()}
          />
        </View>
        {loading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : pages.length ? (
          <View style={styles.grid}>
            {pages.map((page, index) => (
              <Pressable
                key={page.id}
                accessibilityRole="button"
                accessibilityLabel={`View page ${index + 1}`}
                onPress={() => setOpenPage(page)}
                style={({ pressed }) => [styles.pageCard, pressed && styles.pressed]}
              >
                <Image resizeMode="cover" source={{ uri: page.uri }} style={styles.pageImage} />
                <Text style={styles.pageLabel}>PAGE {String(index + 1).padStart(2, '0')}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No pages yet</Text>
            <Text style={styles.emptyBody}>Import images you own to start building your manga project.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  header: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 18, paddingHorizontal: 22, paddingVertical: 16 },
  back: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  headerTitle: { color: colors.text, flex: 1, fontSize: 12, fontWeight: '800', textAlign: 'right' },
  content: { paddingBottom: 30, paddingHorizontal: 22, paddingTop: 24 },
  eyebrow: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.6 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 8 },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 5 },
  action: { marginTop: 20 },
  loader: { marginTop: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 },
  pageCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 13, borderWidth: 1, overflow: 'hidden', padding: 7, width: '47%' },
  pressed: { opacity: 0.78 },
  pageImage: { backgroundColor: colors.elevated, borderRadius: 8, height: 190, width: '100%' },
  pageLabel: { color: colors.muted, fontSize: 8, fontWeight: '800', letterSpacing: 0.8, paddingHorizontal: 3, paddingVertical: 9 },
  empty: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 17, borderWidth: 1, marginTop: 24, padding: 25 },
  emptyTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  emptyBody: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 8, textAlign: 'center' },
  reader: { backgroundColor: colors.background, flex: 1 },
  readerHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 22, paddingVertical: 16 },
  pageNumber: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  readerImage: { flex: 1, width: '100%' },
  readerFooter: { borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 22, paddingVertical: 18 },
  readerControl: { padding: 8 },
  readerControlText: { color: colors.accent, fontSize: 12, fontWeight: '800' },
  dimmed: { color: colors.muted, opacity: 0.5 },
});
