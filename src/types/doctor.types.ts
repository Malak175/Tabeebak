export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience?: string;
  rating?: number;
  reviews?: number;
  location?: string;
  available?: boolean;
  price?: string;
  avatar?: string;
}

export interface DoctorsNearParams {
  latitude: number;
  longitude: number;
  radiusKm?: number;
}
