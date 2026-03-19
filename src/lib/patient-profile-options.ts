export const BLOOD_TYPE_OPTIONS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const GENDER_OPTIONS = [
  "MALE",
  "FEMALE",
  "OTHER",
  "PREFER_NOT_TO_SAY",
] as const;

export const GENDER_LABELS: Record<(typeof GENDER_OPTIONS)[number], string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};

export const RELATIONSHIP_OPTIONS = [
  "Parent",
  "Spouse",
  "Sibling",
  "Child",
  "Relative",
  "Friend",
  "Other",
] as const;

export const COUNTRY_OPTIONS = [{ value: "Egypt", label: "Egypt" }] as const;

export const EGYPT_GOVERNORATES = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Qalyubia",
  "Port Said",
  "Suez",
  "Dakahlia",
  "Sharqia",
  "Gharbia",
  "Monufia",
  "Beheira",
  "Kafr El Sheikh",
  "Damietta",
  "Ismailia",
  "Faiyum",
  "Beni Suef",
  "Minya",
  "Asyut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
  "Red Sea",
  "Matruh",
  "North Sinai",
  "South Sinai",
] as const;

export const EGYPT_CITIES_BY_GOVERNORATE: Record<string, readonly string[]> = {
  Cairo: ["Cairo", "Heliopolis", "Nasr City", "Maadi", "New Cairo"],
  Giza: ["Giza", "6th of October", "Sheikh Zayed", "Haram", "Dokki"],
  Alexandria: ["Alexandria", "Smouha", "Stanley", "Sidi Gaber", "Miami"],
  Qalyubia: ["Banha", "Qalyub", "Shubra El Kheima"],
  "Port Said": ["Port Said"],
  Suez: ["Suez"],
  Dakahlia: ["Mansoura", "Talkha"],
  Sharqia: ["Zagazig", "10th of Ramadan"],
  Gharbia: ["Tanta", "Mahalla"],
  Monufia: ["Shebin El Kom"],
  Beheira: ["Damanhur"],
  "Kafr El Sheikh": ["Kafr El Sheikh"],
  Damietta: ["Damietta"],
  Ismailia: ["Ismailia"],
  Faiyum: ["Faiyum"],
  "Beni Suef": ["Beni Suef"],
  Minya: ["Minya"],
  Asyut: ["Asyut"],
  Sohag: ["Sohag"],
  Qena: ["Qena"],
  Luxor: ["Luxor"],
  Aswan: ["Aswan"],
  "Red Sea": ["Hurghada", "Safaga", "Marsa Alam"],
  Matruh: ["Marsa Matruh"],
  "North Sinai": ["Arish"],
  "South Sinai": ["Sharm El Sheikh", "Dahab", "Nuweiba"],
};

export const getGovernorateOptions = (country?: string) =>
  country === "Egypt" ? [...EGYPT_GOVERNORATES] : [];

export const getCityOptions = (country?: string, governorate?: string) => {
  if (country !== "Egypt" || !governorate) return [];
  return [...(EGYPT_CITIES_BY_GOVERNORATE[governorate] ?? [])];
};

export const normalizeSelectValue = (
  value: string | null | undefined,
  options: readonly string[],
) => {
  if (!value) return "";
  const match = options.find(
    (option) => option.toLowerCase() === value.trim().toLowerCase(),
  );
  return match ?? value.trim();
};

export const normalizeSelectObjectValue = (
  value: string | null | undefined,
  options: readonly { value: string; label: string }[],
) => {
  if (!value) return "";
  const match = options.find(
    (option) => option.value.toLowerCase() === value.trim().toLowerCase(),
  );
  return match?.value ?? value.trim();
};

export const ensureOption = (options: readonly string[], value: string) => {
  if (!value) return options;
  return options.includes(value) ? options : [...options, value];
};

export const ensureObjectOption = (
  options: readonly { value: string; label: string }[],
  value: string,
) => {
  if (!value) return options;
  return options.some((option) => option.value === value)
    ? options
    : [...options, { value, label: value }];
};
