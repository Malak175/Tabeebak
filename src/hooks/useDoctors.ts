import { useQuery } from "@tanstack/react-query";
import { doctorsService } from "@/services/doctors.service";
import { DoctorsNearParams } from "@/types/doctor.types";

export const doctorsQueryKeys = {
  all: ["doctors"] as const,
  near: (params: DoctorsNearParams | null) => ["doctors", "near", params] as const,
};

export const useDoctorsQuery = () => {
  return useQuery({
    queryKey: doctorsQueryKeys.all,
    queryFn: doctorsService.getDoctors,
  });
};

export const useNearbyDoctorsQuery = (params: DoctorsNearParams | null) => {
  return useQuery({
    queryKey: doctorsQueryKeys.near(params),
    queryFn: () => doctorsService.getNearbyDoctors(params as DoctorsNearParams),
    enabled: Boolean(params),
  });
};
