import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '../components/ActionButton';
import { BrandMark } from '../components/BrandMark';
import { colors } from '../theme/colors';
import type { MangaProject } from '../types/project';

type HomeScreenProps = {
  projects: MangaProject[];
  onCreate: () => void;
  onOpenProject: (project: MangaProject) => void;
  onViewLibrary: () => void;
};

function ProjectCard({
  project,
  onPress,
}: {
  project: MangaProject;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${project.title}, ${project.page_count} pages`}
      onPress={onPress}
      style={({ pressed }) => [styles.projectCard, pressed && styles.pressed]}
    >
      {project.cover_uri ? (
        <Image source={{ uri: project.cover_uri }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.emptyCover]}>
          <Text style={styles.emptyCoverMark}>▧</Text>
        </View>
      )}
      <View style={styles.projectInfo}>
        <Text numberOfLines={1} style={styles.projectTitle}>{project.title}</Text>
        <Text style={styles.projectMeta}>
          {project.page_count} {project.page_count === 1 ? 'page' : 'pages'}  ·  LOCAL PROJECT
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export function HomeScreen({
  projects,
  onCreate,
  onOpenProject,
  onViewLibrary,
}: HomeScreenProps) {
  const recent = projects.slice(0, 3);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <BrandMark compact />
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>ON DEVICE</Text>
        </View>
      </View>
      <View style={styles.greeting}>
        <Text style={styles.eyebrow}>YOUR CREATIVE SPACE</Text>
        <Text style={styles.title}>Make it move.</Text>
        <Text style={styles.subtitle}>Every frame starts with your story.</Text>
      </View>
      <View style={styles.hero}>
        <View style={styles.heroOrb} />
        <Text style={styles.heroEyebrow}>KAGEFLOW STUDIO  /  001</Text>
        <Text style={styles.heroTitle}>From page{'\n'}to motion.</Text>
        <Text style={styles.heroBody}>
          Bring your manga pages into a workspace made for motion.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onCreate}
          style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}
        >
          <Text style={styles.heroButtonText}>＋  New project</Text>
        </Pressable>
        <Text style={styles.heroIndex}>01 — 04</Text>
      </View>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Recent projects</Text>
          <Text style={styles.sectionCaption}>PICK UP WHERE YOU LEFT OFF</Text>
        </View>
        {projects.length > 0 && (
          <Pressable accessibilityRole="button" onPress={onViewLibrary} hitSlop={10}>
            <Text style={styles.viewAll}>View all  →</Text>
          </Pressable>
        )}
      </View>
      {recent.length > 0 ? (
        <View style={styles.projectList}>
          {recent.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onPress={() => onOpenProject(project)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Your first story starts here.</Text>
          <Text style={styles.emptyBody}>
            Create a project and import manga pages from your device. Your work stays on this device.
          </Text>
          <ActionButton label="Create your first project" onPress={onCreate} secondary />
        </View>
      )}
      <Text style={styles.footer}>DESIGNED BY BLACKSUN  ·  KAGEFLOW AI</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 30, paddingHorizontal: 22, paddingTop: 16 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  statusPill: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusDot: { backgroundColor: colors.accent, borderRadius: 4, height: 6, width: 6 },
  statusText: { color: colors.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  greeting: { marginBottom: 20, marginTop: 28 },
  eyebrow: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.8 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -1, marginTop: 7 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  hero: {
    backgroundColor: '#14211F',
    borderColor: '#2D5148',
    borderRadius: 24,
    borderWidth: 1,
    minHeight: 250,
    overflow: 'hidden',
    padding: 21,
    position: 'relative',
  },
  heroOrb: {
    borderColor: '#3F7463',
    borderRadius: 150,
    borderWidth: 1,
    height: 220,
    opacity: 0.55,
    position: 'absolute',
    right: -78,
    top: -65,
    width: 220,
  },
  heroEyebrow: { color: '#91B8AA', fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  heroTitle: { color: colors.text, fontSize: 34, fontWeight: '800', letterSpacing: -1, lineHeight: 37, marginTop: 20 },
  heroBody: { color: '#A8B9B4', fontSize: 12, lineHeight: 18, marginTop: 10, maxWidth: 215 },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: 11,
    marginTop: 18,
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  heroButtonText: { color: colors.background, fontSize: 12, fontWeight: '900' },
  heroIndex: { bottom: 20, color: '#71978A', fontSize: 9, fontWeight: '800', position: 'absolute', right: 20 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, marginTop: 28 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  sectionCaption: { color: colors.muted, fontSize: 8, fontWeight: '800', letterSpacing: 1.1, marginTop: 5 },
  viewAll: { color: colors.accent, fontSize: 11, fontWeight: '800' },
  projectList: { gap: 10 },
  projectCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 13,
    minHeight: 76,
    padding: 10,
  },
  pressed: { opacity: 0.8 },
  cover: { backgroundColor: colors.elevated, borderRadius: 10, height: 54, width: 48 },
  emptyCover: { alignItems: 'center', justifyContent: 'center' },
  emptyCoverMark: { color: colors.accent, fontSize: 21 },
  projectInfo: { flex: 1, gap: 5 },
  projectTitle: { color: colors.text, fontSize: 13, fontWeight: '800' },
  projectMeta: { color: colors.muted, fontSize: 8, fontWeight: '700', letterSpacing: 0.65 },
  chevron: { color: colors.muted, fontSize: 24, paddingHorizontal: 8 },
  emptyState: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, gap: 10, padding: 17 },
  emptyTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  emptyBody: { color: colors.muted, fontSize: 12, lineHeight: 18, marginBottom: 5 },
  footer: { color: '#536073', fontSize: 8, fontWeight: '800', letterSpacing: 1, marginTop: 28, textAlign: 'center' },
});
