import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from './src/components/ActionButton';
import { BrandMark } from './src/components/BrandMark';
import { CreateProjectScreen } from './src/screens/CreateProjectScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ProjectDetailScreen } from './src/screens/ProjectDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import {
  completeOnboarding,
  hasCompletedOnboarding,
  initializeStorage,
  listProjects,
} from './src/storage/database';
import { colors } from './src/theme/colors';
import type { MangaProject } from './src/types/project';

type Tab = 'home' | 'library' | 'settings';

function StartupScreen({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  return (
    <View style={styles.startup}>
      <BrandMark />
      {error ? (
        <View style={styles.startupError}>
          <Text style={styles.errorTitle}>KageFlow couldn’t start.</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <ActionButton label="Try again" onPress={onRetry} secondary />
        </View>
      ) : (
        <ActivityIndicator color={colors.accent} style={styles.startupSpinner} />
      )}
      <Text style={styles.startupFooter}>A BLACKSUN CREATIVE TOOL</Text>
    </View>
  );
}

function TabBar({ selected, onSelect }: { selected: Tab; onSelect: (tab: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: '⌂' },
    { id: 'library', label: 'Projects', icon: '▦' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const active = selected === tab.id;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(tab.id)}
            style={styles.tab}
          >
            <Text style={[styles.tabIcon, active && styles.tabActive]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, active && styles.tabActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function AppExperience() {
  const [ready, setReady] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [projects, setProjects] = useState<MangaProject[]>([]);
  const [tab, setTab] = useState<Tab>('home');
  const [creating, setCreating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<MangaProject | null>(null);

  const loadWorkspace = useCallback(async () => {
    setStartupError(null);
    setReady(false);
    try {
      await initializeStorage();
      const [complete, savedProjects] = await Promise.all([
        hasCompletedOnboarding(),
        listProjects(),
      ]);
      setOnboardingComplete(complete);
      setProjects(savedProjects);
      setReady(true);
    } catch (error) {
      setStartupError(error instanceof Error ? error.message : 'Storage initialization failed.');
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const refreshProjects = async () => {
    const savedProjects = await listProjects();
    setProjects(savedProjects);
    if (selectedProject) {
      setSelectedProject(savedProjects.find((project) => project.id === selectedProject.id) ?? null);
    }
  };

  const finishOnboarding = async () => {
    try {
      await completeOnboarding();
      setOnboardingComplete(true);
    } catch (error) {
      Alert.alert(
        'Could not save your preference',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  const handleProjectCreated = (project: MangaProject) => {
    setProjects((current) => [project, ...current]);
    setCreating(false);
    setSelectedProject(project);
  };

  if (startupError) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.app}>
        <StatusBar barStyle="light-content" />
        <StartupScreen error={startupError} onRetry={() => void loadWorkspace()} />
      </SafeAreaView>
    );
  }

  if (!ready) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.app}>
        <StatusBar barStyle="light-content" />
        <StartupScreen error={null} onRetry={() => void loadWorkspace()} />
      </SafeAreaView>
    );
  }

  if (!onboardingComplete) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.app}>
        <StatusBar barStyle="light-content" />
        <OnboardingScreen onComplete={() => void finishOnboarding()} />
      </SafeAreaView>
    );
  }

  if (creating) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.app}>
        <StatusBar barStyle="light-content" />
        <CreateProjectScreen onCancel={() => setCreating(false)} onCreated={handleProjectCreated} />
      </SafeAreaView>
    );
  }

  if (selectedProject) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.app}>
        <StatusBar barStyle="light-content" />
        <ProjectDetailScreen
          key={selectedProject.id}
          onBack={() => setSelectedProject(null)}
          onProjectUpdated={refreshProjects}
          project={selectedProject}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.app}>
      <StatusBar barStyle="light-content" />
      <View style={styles.screen}>
        {tab === 'home' && (
          <HomeScreen
            onCreate={() => setCreating(true)}
            onOpenProject={setSelectedProject}
            onViewLibrary={() => setTab('library')}
            projects={projects}
          />
        )}
        {tab === 'library' && (
          <LibraryScreen
            onCreate={() => setCreating(true)}
            onOpenProject={setSelectedProject}
            projects={projects}
          />
        )}
        {tab === 'settings' && <SettingsScreen />}
      </View>
      <TabBar onSelect={setTab} selected={tab} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppExperience />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: { backgroundColor: colors.background, flex: 1 },
  screen: { flex: 1 },
  startup: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  startupSpinner: { marginTop: 32 },
  startupError: { gap: 12, marginTop: 34, width: '100%' },
  errorTitle: { color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  errorBody: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  startupFooter: { bottom: 28, color: '#596476', fontSize: 9, fontWeight: '800', letterSpacing: 1.5, position: 'absolute' },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 8,
    paddingTop: 8,
  },
  tab: { alignItems: 'center', flex: 1, gap: 3, minHeight: 43, justifyContent: 'center' },
  tabIcon: { color: colors.muted, fontSize: 19, lineHeight: 21 },
  tabLabel: { color: colors.muted, fontSize: 9, fontWeight: '700' },
  tabActive: { color: colors.accent },
});
