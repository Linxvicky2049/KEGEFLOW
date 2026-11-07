import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import type { MangaProject } from '../types/project';

type LibraryScreenProps = {
  projects: MangaProject[];
  onCreate: () => void;
  onOpenProject: (project: MangaProject) => void;
};

export function LibraryScreen({ projects, onCreate, onOpenProject }: LibraryScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>YOUR WORKSPACE</Text>
      <Text style={styles.title}>Projects</Text>
      <Text style={styles.subtitle}>{projects.length} saved on this device</Text>
      <Pressable accessibilityRole="button" onPress={onCreate} style={styles.createButton}>
        <Text style={styles.createText}>＋  New project</Text>
      </Pressable>
      {projects.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyBody}>Your projects will appear here after you create one.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {projects.map((project) => (
            <Pressable
              key={project.id}
              accessibilityRole="button"
              onPress={() => onOpenProject(project)}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              {project.cover_uri ? (
                <Image source={{ uri: project.cover_uri }} style={styles.cover} />
              ) : (
                <View style={[styles.cover, styles.coverEmpty]}>
                  <Text style={styles.coverSymbol}>▧</Text>
                </View>
              )}
              <View style={styles.info}>
                <Text numberOfLines={1} style={styles.name}>{project.title}</Text>
                <Text style={styles.meta}>{project.page_count} PAGES  ·  ON DEVICE</Text>
                <Text style={styles.date}>Updated {new Date(project.updated_at).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32, paddingHorizontal: 22, paddingTop: 24 },
  eyebrow: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.8 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', marginTop: 8 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 5 },
  createButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: 11, marginTop: 22, paddingHorizontal: 15, paddingVertical: 12 },
  createText: { color: colors.background, fontSize: 12, fontWeight: '900' },
  list: { gap: 10, marginTop: 24 },
  card: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 17, borderWidth: 1, flexDirection: 'row', gap: 13, minHeight: 90, padding: 12 },
  pressed: { opacity: 0.8 },
  cover: { backgroundColor: colors.elevated, borderRadius: 11, height: 64, width: 55 },
  coverEmpty: { alignItems: 'center', justifyContent: 'center' },
  coverSymbol: { color: colors.accent, fontSize: 22 },
  info: { flex: 1, gap: 5 },
  name: { color: colors.text, fontSize: 14, fontWeight: '800' },
  meta: { color: colors.accent, fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  date: { color: colors.muted, fontSize: 10 },
  arrow: { color: colors.muted, fontSize: 24, paddingHorizontal: 6 },
  empty: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, marginTop: 24, padding: 28 },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  emptyBody: { color: colors.muted, fontSize: 12, lineHeight: 19, marginTop: 8, textAlign: 'center' },
});
