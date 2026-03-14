import { apiRequest } from "@/services/api";
import { Doctor, DoctorsNearParams } from "@/types/doctor.types";

const mapDoctor = (item: Record<string, unknown>): Doctor => {
  const firstName = (item.firstName as string) || "";
  const lastName = (item.lastName as string) || "";
  const name = (item.name as string) || [firstName, lastName].filter(Boolean).join(" ") || "Unknown Doctor";

  return {
    id: String(item.id ?? item._id ?? crypto.randomUUID()),
    name,
    specialty: String(item.specialty ?? item.department ?? "General Physician"),
    experience: item.experience ? String(item.experience) : undefined,
    rating: item.rating ? Number(item.rating) : undefined,
    reviews: item.reviews ? Number(item.reviews) : undefined,
    location: item.location ? String(item.location) : undefined,
    available: Boolean(item.available ?? true),
    price: item.price ? String(item.price) : undefined,
    avatar: name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
};

const normalizeDoctors = (payload: unknown): Doctor[] => {
  if (Array.isArray(payload)) {
    return payload.map((item) => mapDoctor(item as Record<string, unknown>));
  }

  const data = payload as Record<string, unknown>;
  const list = Array.isArray(data.doctors)
    ? (data.doctors as Record<string, unknown>[])
    : Array.isArray(data.data)
    ? (data.data as Record<string, unknown>[])
    : [];

  return list.map(mapDoctor);
};

export const doctorsService = {
  async getDoctors(): Promise<Doctor[]> {
    const response = await apiRequest<unknown>("/doctors", { method: "GET" });
    return normalizeDoctors(response);
  },

  async getNearbyDoctors(params: DoctorsNearParams): Promise<Doctor[]> {
    const query = new URLSearchParams({
      lat: String(params.latitude),
      lng: String(params.longitude),
      radiusKm: String(params.radiusKm ?? 20),
    });

    const response = await apiRequest<unknown>(`/doctors/near?${query.toString()}`, {
      method: "GET",
      auth: true,
    });

    return normalizeDoctors(response);
  },
};
