export type Species = "perro" | "gato" | "otro";
export type ReportStatus = "perdido" | "encontrado" | "en_refugio";
export type Sex = "macho" | "hembra";

export interface PetReport {
  id: string;
  name: string | null;
  species: Species;
  breed: string | null;
  sex: Sex | null;
  status: ReportStatus;
  photo_url: string | null;
  lat: number;
  lng: number;
  city: string;
  description: string | null;
  contact: string;
  resolved: boolean;
  created_at: string;
}

export interface Shelter {
  id: string;
  name: string;
  city: string;
  zone: string | null;
  contact: string | null;
  lat: number | null;
  lng: number | null;
  notes: string | null;
}
