import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';
import type { ImagePickerAsset } from 'expo-image-picker';
import type { MangaPage, MangaProject } from '../types/project';

const DATABASE_NAME = 'kageflow.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

function getProjectsDirectory(): string {
  const documentDirectory = FileSystem.documentDirectory;
  if (!documentDirectory) {
    throw new Error('App-managed file storage is unavailable on this device.');
  }
  return `${documentDirectory}projects/`;
}

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  databasePromise ??= SQLite.openDatabaseAsync(DATABASE_NAME).then(async (database) => {
    await database.execAsync(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY NOT NULL,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        uri TEXT NOT NULL,
        file_name TEXT NOT NULL,
        page_order INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS pages_project_order
        ON pages(project_id, page_order);
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
    return database;
  });
  return databasePromise;
}

export async function initializeStorage(): Promise<void> {
  await getDatabase();
  await FileSystem.makeDirectoryAsync(getProjectsDirectory(), { intermediates: true });
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    'onboarding_complete',
  );
  return row?.value === 'true';
}

export async function completeOnboarding(): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    'onboarding_complete',
    'true',
  );
}

export async function listProjects(): Promise<MangaProject[]> {
  const database = await getDatabase();
  return database.getAllAsync<MangaProject>(`
    SELECT
      projects.id,
      projects.title,
      projects.created_at,
      projects.updated_at,
      COUNT(pages.id) AS page_count,
      (
        SELECT uri FROM pages
        WHERE pages.project_id = projects.id
        ORDER BY page_order ASC
        LIMIT 1
      ) AS cover_uri
    FROM projects
    LEFT JOIN pages ON pages.project_id = projects.id
    GROUP BY projects.id
    ORDER BY projects.updated_at DESC
  `);
}

export async function getProjectPages(projectId: string): Promise<MangaPage[]> {
  const database = await getDatabase();
  return database.getAllAsync<MangaPage>(
    'SELECT * FROM pages WHERE project_id = ? ORDER BY page_order ASC',
    projectId,
  );
}

async function copyAssets(
  projectId: string,
  assets: ImagePickerAsset[],
  startAt: number,
): Promise<MangaPage[]> {
  const projectDirectory = `${getProjectsDirectory()}${projectId}/`;
  await FileSystem.makeDirectoryAsync(projectDirectory, { intermediates: true });

  const copied: MangaPage[] = [];
  for (const [index, asset] of assets.entries()) {
    const sourceName = asset.fileName ?? `page-${index + 1}.jpg`;
    const extension = sourceName.match(/\.[a-zA-Z0-9]{1,8}$/)?.[0] ?? '.jpg';
    const fileName = `${String(startAt + index + 1).padStart(3, '0')}-${createId()}${extension}`;
    const uri = `${projectDirectory}${fileName}`;
    await FileSystem.copyAsync({ from: asset.uri, to: uri });
    copied.push({
      id: createId(),
      project_id: projectId,
      uri,
      file_name: sourceName,
      page_order: startAt + index,
    });
  }
  return copied;
}

export async function createProject(
  title: string,
  assets: ImagePickerAsset[],
): Promise<MangaProject> {
  const database = await getDatabase();
  const id = createId();
  const now = new Date().toISOString();
  const pages = await copyAssets(id, assets, 0);

  await database.withTransactionAsync(async () => {
    await database.runAsync(
      'INSERT INTO projects (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)',
      id,
      title.trim(),
      now,
      now,
    );
    for (const page of pages) {
      await database.runAsync(
        'INSERT INTO pages (id, project_id, uri, file_name, page_order) VALUES (?, ?, ?, ?, ?)',
        page.id,
        page.project_id,
        page.uri,
        page.file_name,
        page.page_order,
      );
    }
  });

  return {
    id,
    title: title.trim(),
    created_at: now,
    updated_at: now,
    page_count: pages.length,
    cover_uri: pages[0]?.uri ?? null,
  };
}

export async function addProjectPages(
  projectId: string,
  assets: ImagePickerAsset[],
): Promise<void> {
  if (assets.length === 0) return;

  const database = await getDatabase();
  const lastPage = await database.getFirstAsync<{ page_order: number }>(
    'SELECT page_order FROM pages WHERE project_id = ? ORDER BY page_order DESC LIMIT 1',
    projectId,
  );
  const startAt = lastPage ? lastPage.page_order + 1 : 0;
  const pages = await copyAssets(projectId, assets, startAt);

  await database.withTransactionAsync(async () => {
    for (const page of pages) {
      await database.runAsync(
        'INSERT INTO pages (id, project_id, uri, file_name, page_order) VALUES (?, ?, ?, ?, ?)',
        page.id,
        page.project_id,
        page.uri,
        page.file_name,
        page.page_order,
      );
    }
    await database.runAsync(
      'UPDATE projects SET updated_at = ? WHERE id = ?',
      new Date().toISOString(),
      projectId,
    );
  });
}
