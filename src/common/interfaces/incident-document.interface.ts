export interface IncidentDocument {
  id: number;
  incident_id: number;
  uploaded_by: string;
  file_name?: string;
  mime_type?: string | null;
  file_size?: number;
  created_at?: string;
  updated_at?: string;
}
