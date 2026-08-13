export interface AdminFlag {
  flag_id: string;
  reason: string | null;
  flagged_at: string;
  report_id: string;
  report_name: string | null;
  report_species: string;
  report_status: string;
  report_city: string;
  report_photo_url: string | null;
  report_contact: string;
}

export interface AdminShelterSuggestion {
  id: string;
  name: string;
  city: string;
  contact: string;
  website: string | null;
  notes: string | null;
  created_at: string;
}
