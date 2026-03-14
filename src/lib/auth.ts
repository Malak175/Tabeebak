import { UserRole } from "@/types/auth.types";

export const normalizeRole = (value: unknown): UserRole => {
  const raw = String(value ?? "").trim().toLowerCase();

  if (raw === "patient") return "Patient";
  if (raw === "doctor") return "Doctor";
  if (raw === "lab" || raw === "laboratory") return "Lab";
  return "Admin";
};

export const getDisplayName = (user: {
  name?: string | null;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}) => {
  const fromFields = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  return (
    user.name?.trim() ||
    user.displayName?.trim() ||
    fromFields ||
    user.email?.trim() ||
    "User"
  );
};

export const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const routeByRole = (role: UserRole): string => {
  switch (role) {
    case "Patient":
      return "/patient/dashboard";
    case "Doctor":
      return "/doctor/dashboard";
    case "Lab":
      return "/lab/dashboard";
    default:
      return "/";
  }
};

export const getDoctorsRouteByRole = (role?: UserRole | null): string => {
  if (role === "Patient") {
    return "/patient/doctors";
  }

  return "/doctors";
};

export const getBookAppointmentRoute = (role?: UserRole | null): string => {
  if (role === "Patient") {
    return "/patient/doctors";
  }

  return "/register";
};
