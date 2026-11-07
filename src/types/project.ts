export type MangaPage = {
  id: string;
  project_id: string;
  uri: string;
  file_name: string;
  page_order: number;
};

export type MangaProject = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  page_count: number;
  cover_uri: string | null;
};
