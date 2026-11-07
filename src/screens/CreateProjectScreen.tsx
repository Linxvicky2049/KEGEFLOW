import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ActionButton } from '../components/ActionButton';
import { colors } from '../theme/colors';
import { createProject } from '../storage/database';
import type { MangaProject } from '../types/project';

type CreateProjectScreenProps = {
  onCancel: () => void;
  onCreated: (project: MangaProject) => void;
};

export function CreateProjectScreen({ onCancel, onCreated }: CreateProjectScreenProps) {
  const [title, setTitle] = useState('');
  const [assets, setAssets] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [saving, setSaving] = useState(false);

  const choosePages = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Photo access needed',
          'Allow KageFlow to access selected images so you can import manga pages.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (!result.canceled) setAssets(result.assets);
    } catch (error) {
      Alert.alert(
        'Could not open your image library',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  const save = async () => {
    const projectTitle = title.trim();
    if (!projectTitle) {
      Alert.alert('Add a project name', 'Give your project a name before saving.');
      return;
    }

    setSaving(true);
    try {
      const project = await createProject(projectTitle, assets);
      onCreated(project);
    } catch (error) {
      Alert.alert(
        'Project could not be saved',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={onCancel} hitSlop={12}>
          <Text style={styles.back}>‹  BACK</Text>
        </Pressable>
        <Text style={styles.headerLabel}>NEW PROJECT</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>START WITH A STORY</Text>
        <Text style={styles.title}>Create a project.</Text>
        <Text style={styles.subtitle}>Give your work a name. You can import pages now or later.</Text>
        <Text style={styles.fieldLabel}>PROJECT NAME</Text>
        <TextInput
          accessibilityLabel="Project name"
          autoCapitalize="sentences"
          autoCorrect={false}
          maxLength={70}
          onChangeText={setTitle}
          placeholder="e.g. The midnight chapter"
          placeholderTextColor="#687589"
          returnKeyType="done"
          style={styles.input}
          value={title}
        />
        <View style={styles.importHeader}>
          <View style={styles.importCopy}>
            <Text style={styles.fieldLabel}>MANGA PAGES</Text>
            <Text style={styles.importHint}>Select one or more images from your device.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={choosePages}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Text style={styles.addButtonLabel}>{assets.length ? 'Change' : '＋ Add'}</Text>
          </Pressable>
        </View>
        {assets.length > 0 ? (
          <ScrollView horizontal contentContainerStyle={styles.previewRow} showsHorizontalScrollIndicator={false}>
            {assets.map((asset, index) => (
              <View key={`${asset.uri}-${index}`} style={styles.previewItem}>
                <Image source={{ uri: asset.uri }} style={styles.preview} />
                <Text numberOfLines={1} style={styles.previewName}>
                  {asset.fileName ?? `Page ${index + 1}`}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={choosePages}
            style={({ pressed }) => [styles.dropArea, pressed && styles.pressed]}
          >
            <View style={styles.uploadMark}><Text style={styles.uploadGlyph}>↑</Text></View>
            <Text style={styles.dropTitle}>Bring your pages in</Text>
            <Text style={styles.dropBody}>Choose image files from your library</Text>
          </Pressable>
        )}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyIcon}>◈</Text>
          <Text style={styles.privacyText}>
            Selected images are copied into this project’s local storage.
          </Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <ActionButton
          busy={saving}
          disabled={!title.trim()}
          label="Create project  →"
          onPress={save}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  header: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 22, paddingVertical: 16 },
  back: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  headerLabel: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.4 },
  content: { paddingBottom: 26, paddingHorizontal: 22, paddingTop: 28 },
  eyebrow: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.8 },
  title: { color: colors.text, fontSize: 29, fontWeight: '800', letterSpacing: -0.8, marginTop: 8 },
  subtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 },
  fieldLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 13, borderWidth: 1, color: colors.text, fontSize: 14, marginTop: 9, minHeight: 52, paddingHorizontal: 14 },
  importHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 28 },
  importCopy: { flex: 1, gap: 5 },
  importHint: { color: colors.muted, fontSize: 10 },
  addButton: { backgroundColor: colors.accentDark, borderRadius: 9, paddingHorizontal: 13, paddingVertical: 9 },
  addButtonLabel: { color: colors.accent, fontSize: 10, fontWeight: '900' },
  pressed: { opacity: 0.75 },
  dropArea: { alignItems: 'center', backgroundColor: colors.surface, borderColor: '#364357', borderRadius: 17, borderStyle: 'dashed', borderWidth: 1, justifyContent: 'center', marginTop: 13, minHeight: 174, padding: 18 },
  uploadMark: { alignItems: 'center', backgroundColor: colors.elevated, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  uploadGlyph: { color: colors.accent, fontSize: 21, fontWeight: '700' },
  dropTitle: { color: colors.text, fontSize: 12, fontWeight: '800', marginTop: 12 },
  dropBody: { color: colors.muted, fontSize: 10, marginTop: 5 },
  previewRow: { gap: 10, paddingVertical: 12 },
  previewItem: { width: 88 },
  preview: { backgroundColor: colors.elevated, borderRadius: 11, height: 112, width: 88 },
  previewName: { color: colors.muted, fontSize: 9, marginTop: 6 },
  privacyNote: { alignItems: 'flex-start', backgroundColor: '#111A1A', borderRadius: 12, flexDirection: 'row', gap: 10, marginTop: 18, padding: 13 },
  privacyIcon: { color: colors.accent, fontSize: 15 },
  privacyText: { color: '#A6B4AE', flex: 1, fontSize: 10, lineHeight: 15 },
  footer: { borderTopColor: colors.border, borderTopWidth: 1, paddingHorizontal: 22, paddingVertical: 14 },
});
