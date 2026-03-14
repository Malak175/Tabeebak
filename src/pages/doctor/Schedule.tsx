import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  HelpCircle,
  Home,
  Save,
  Settings,
  Stethoscope,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useDoctorAvailabilityQuery,
  useDoctorProfessionalProfileQuery,
  useDoctorProfileQuery,
  useUpdateDoctorAvailabilityMutation,
} from "@/hooks/useDoctorProfile";
import { getDisplayName } from "@/lib/auth";
import {
  DoctorAvailabilityDay,
  UpdateDoctorAvailabilityRequest,
} from "@/types/doctor-profile.types";

const navItems = [
  { title: "Dashboard", url: "/doctor/dashboard", icon: Home },
  { title: "Appointments", url: "/doctor/appointments", icon: Calendar },
  { title: "Patients", url: "/doctor/patients", icon: Users },
  { title: "Schedule", url: "/doctor/schedule", icon: Clock },
  { title: "Settings", url: "/doctor/settings", icon: Settings },
  { title: "Help", url: "/doctor/help", icon: HelpCircle },
];

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const blankDay = (dayOfWeek: string): DoctorAvailabilityDay => ({
  dayOfWeek,
  isAvailable: false,
  startTime: "",
  endTime: "",
  breakStartTime: "",
  breakEndTime: "",
  maxAppointments: null,
});

const normalizeInputDay = (day: DoctorAvailabilityDay): DoctorAvailabilityDay => ({
  ...day,
  startTime: day.startTime ?? "",
  endTime: day.endTime ?? "",
  breakStartTime: day.breakStartTime ?? "",
  breakEndTime: day.breakEndTime ?? "",
  maxAppointments: day.maxAppointments ?? null,
});

const toNullableTime = (value?: string | null) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

const DoctorSchedule = () => {
  const profileQuery = useDoctorProfileQuery();
  const professionalQuery = useDoctorProfessionalProfileQuery();
  const availabilityQuery = useDoctorAvailabilityQuery();
  const updateAvailabilityMutation = useUpdateDoctorAvailabilityMutation();

  const [availabilityForm, setAvailabilityForm] = useState({
    timezone: "",
    appointmentDurationMinutes: "",
    bufferBetweenAppointmentsMinutes: "",
    notes: "",
    weeklySchedule: [] as DoctorAvailabilityDay[],
  });

  useEffect(() => {
    if (!availabilityQuery.data) return;

    setAvailabilityForm({
      timezone: availabilityQuery.data.timezone ?? "",
      appointmentDurationMinutes:
        availabilityQuery.data.appointmentDurationMinutes?.toString() ?? "",
      bufferBetweenAppointmentsMinutes:
        availabilityQuery.data.bufferBetweenAppointmentsMinutes?.toString() ?? "",
      notes: availabilityQuery.data.notes ?? "",
      weeklySchedule:
        availabilityQuery.data.weeklySchedule.length > 0
          ? availabilityQuery.data.weeklySchedule.map(normalizeInputDay)
          : weekDays.map(blankDay),
    });
  }, [availabilityQuery.data]);

  const doctorName = getDisplayName(profileQuery.data ?? {});
  const doctorSubtitle =
    professionalQuery.data?.specialty ??
    profileQuery.data?.bio ??
    "Doctor account";

  const availableDays = useMemo(
    () => availabilityForm.weeklySchedule.filter((day) => day.isAvailable),
    [availabilityForm.weeklySchedule],
  );

  const totalWeeklySlots = useMemo(
    () =>
      availableDays.reduce((total, day) => {
        const maxAppointments = day.maxAppointments ?? 0;
        return total + Math.max(maxAppointments, 0);
      }, 0),
    [availableDays],
  );

  const updateDay = (
    index: number,
    updater: (current: DoctorAvailabilityDay) => DoctorAvailabilityDay,
  ) => {
    setAvailabilityForm((current) => ({
      ...current,
      weeklySchedule: current.weeklySchedule.map((day, dayIndex) =>
        dayIndex === index ? updater(day) : day,
      ),
    }));
  };

  const handleSave = () => {
    const payload: UpdateDoctorAvailabilityRequest = {
      timezone: availabilityForm.timezone || undefined,
      appointmentDurationMinutes: availabilityForm.appointmentDurationMinutes
        ? Number(availabilityForm.appointmentDurationMinutes)
        : null,
      bufferBetweenAppointmentsMinutes: availabilityForm.bufferBetweenAppointmentsMinutes
        ? Number(availabilityForm.bufferBetweenAppointmentsMinutes)
        : null,
      notes: availabilityForm.notes || null,
      weeklySchedule: availabilityForm.weeklySchedule.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        isAvailable: day.isAvailable,
        startTime: day.isAvailable ? toNullableTime(day.startTime) : null,
        endTime: day.isAvailable ? toNullableTime(day.endTime) : null,
        breakStartTime: day.isAvailable ? toNullableTime(day.breakStartTime) : null,
        breakEndTime: day.isAvailable ? toNullableTime(day.breakEndTime) : null,
        maxAppointments: day.isAvailable ? day.maxAppointments ?? null : null,
      })),
    };

    updateAvailabilityMutation.mutate(payload, {
      onSuccess: () => toast.success("Availability updated successfully"),
      onError: (error: Error) => toast.error(error.message),
    });
  };

  return (
    <DashboardLayout
      userRole="doctor"
      userName={doctorName}
      userSubtitle={doctorSubtitle}
      navItems={navItems}
      userIcon={Stethoscope}
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Availability</h1>
          <p className="text-muted-foreground">
            Manage working hours from `/api/v1/doctors/me/availability`.
          </p>
        </div>

        <Button onClick={handleSave} disabled={updateAvailabilityMutation.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {updateAvailabilityMutation.isPending ? "Saving..." : "Save Availability"}
        </Button>
      </div>

      {availabilityQuery.isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : availabilityQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load availability</AlertTitle>
          <AlertDescription>
            {(availabilityQuery.error as Error).message}
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void availabilityQuery.refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Schedule Settings</CardTitle>
                <CardDescription>
                  Core availability preferences that affect bookable time windows.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="availability-timezone">Timezone</Label>
                  <Input
                    id="availability-timezone"
                    value={availabilityForm.timezone}
                    onChange={(event) =>
                      setAvailabilityForm((current) => ({
                        ...current,
                        timezone: event.target.value,
                      }))
                    }
                    placeholder="Africa/Cairo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability-duration">Appointment Duration (minutes)</Label>
                  <Input
                    id="availability-duration"
                    type="number"
                    min="0"
                    value={availabilityForm.appointmentDurationMinutes}
                    onChange={(event) =>
                      setAvailabilityForm((current) => ({
                        ...current,
                        appointmentDurationMinutes: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability-buffer">Buffer Between Appointments (minutes)</Label>
                  <Input
                    id="availability-buffer"
                    type="number"
                    min="0"
                    value={availabilityForm.bufferBetweenAppointmentsMinutes}
                    onChange={(event) =>
                      setAvailabilityForm((current) => ({
                        ...current,
                        bufferBetweenAppointmentsMinutes: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="availability-notes">Availability Notes</Label>
                  <Textarea
                    id="availability-notes"
                    rows={3}
                    value={availabilityForm.notes}
                    onChange={(event) =>
                      setAvailabilityForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Optional internal scheduling notes"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
                <CardDescription>Real-time summary derived from the loaded availability.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Available Days</span>
                  <span className="text-2xl font-bold">{availableDays.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Potential Slots</span>
                  <span className="text-2xl font-bold">{totalWeeklySlots}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Timezone</span>
                  <span className="font-medium">
                    {availabilityForm.timezone || "Not set"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>
                Toggle each day on or off, then set working hours and optional break windows.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availabilityForm.weeklySchedule.length === 0 ? (
                <Alert>
                  <AlertTitle>No availability data returned</AlertTitle>
                  <AlertDescription>
                    The backend did not return any schedule rows yet. Save once after configuring the
                    schedule to initialize it.
                  </AlertDescription>
                </Alert>
              ) : (
                availabilityForm.weeklySchedule.map((day, index) => (
                  <div key={day.dayOfWeek || index} className="rounded-xl border p-4">
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold">{day.dayOfWeek || `Day ${index + 1}`}</p>
                        <p className="text-sm text-muted-foreground">
                          Control booking windows for this day.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Label htmlFor={`availability-switch-${index}`}>Available</Label>
                        <Switch
                          id={`availability-switch-${index}`}
                          checked={day.isAvailable}
                          onCheckedChange={(checked) =>
                            updateDay(index, (current) => ({
                              ...current,
                              isAvailable: checked,
                              ...(checked
                                ? {}
                                : {
                                    startTime: "",
                                    endTime: "",
                                    breakStartTime: "",
                                    breakEndTime: "",
                                    maxAppointments: null,
                                  }),
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-5">
                      <div className="space-y-2">
                        <Label htmlFor={`start-time-${index}`}>Start</Label>
                        <Input
                          id={`start-time-${index}`}
                          type="time"
                          value={day.startTime ?? ""}
                          disabled={!day.isAvailable}
                          onChange={(event) =>
                            updateDay(index, (current) => ({
                              ...current,
                              startTime: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`end-time-${index}`}>End</Label>
                        <Input
                          id={`end-time-${index}`}
                          type="time"
                          value={day.endTime ?? ""}
                          disabled={!day.isAvailable}
                          onChange={(event) =>
                            updateDay(index, (current) => ({
                              ...current,
                              endTime: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`break-start-${index}`}>Break Start</Label>
                        <Input
                          id={`break-start-${index}`}
                          type="time"
                          value={day.breakStartTime ?? ""}
                          disabled={!day.isAvailable}
                          onChange={(event) =>
                            updateDay(index, (current) => ({
                              ...current,
                              breakStartTime: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`break-end-${index}`}>Break End</Label>
                        <Input
                          id={`break-end-${index}`}
                          type="time"
                          value={day.breakEndTime ?? ""}
                          disabled={!day.isAvailable}
                          onChange={(event) =>
                            updateDay(index, (current) => ({
                              ...current,
                              breakEndTime: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`max-appointments-${index}`}>Max Appointments</Label>
                        <Input
                          id={`max-appointments-${index}`}
                          type="number"
                          min="0"
                          value={day.maxAppointments ?? ""}
                          disabled={!day.isAvailable}
                          onChange={(event) =>
                            updateDay(index, (current) => ({
                              ...current,
                              maxAppointments: event.target.value
                                ? Number(event.target.value)
                                : null,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorSchedule;
