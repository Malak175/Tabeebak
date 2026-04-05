import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Plus, Save, Stethoscope, Trash2 } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { doctorNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useDoctorAvailabilityQuery,
  useDoctorProfessionalProfileQuery,
  useDoctorProfileQuery,
  useUpdateDoctorAvailabilityMutation,
} from "@/hooks/useDoctorProfile";
import { getDisplayName } from "@/lib/auth";
import type {
  DoctorAvailability,
  DoctorAvailabilityDaySchedule,
  UpdateDoctorAvailabilityRequest,
} from "@/types/doctor-profile.types";

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type SlotDraft = {
  id: string;
  startTime: string;
  endTime: string;
};

type DayScheduleDraft = {
  dayOfWeek: string;
  isAvailable: boolean;
  slots: SlotDraft[];
  maxAppointments: string;
};

const createSlotId = () => `slot-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const toNullableTime = (value?: string | null) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

const parseTimeToMinutes = (value: string) => {
  const [hour, minute] = value.split(":").map((part) => Number(part));
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
};

const formatMinutesToTime = (value: number) => {
  const clamped = Math.max(0, Math.min(value, 23 * 60 + 59));
  const hour = Math.floor(clamped / 60)
    .toString()
    .padStart(2, "0");
  const minute = (clamped % 60).toString().padStart(2, "0");
  return `${hour}:${minute}`;
};

const addMinutesToTime = (value: string, minutes: number) => {
  const base = parseTimeToMinutes(value);
  if (base === null) return "";
  return formatMinutesToTime(base + minutes);
};

const sortSlots = (slots: SlotDraft[]) =>
  [...slots].sort((left, right) => {
    const leftMinutes = parseTimeToMinutes(left.startTime) ?? 0;
    const rightMinutes = parseTimeToMinutes(right.startTime) ?? 0;
    return leftMinutes - rightMinutes;
  });

const buildDefaultSlot = (day: DayScheduleDraft, durationMinutes: number) => {
  const sorted = sortSlots(day.slots);
  const startTime = sorted.length
    ? sorted[sorted.length - 1].endTime || "09:00"
    : "09:00";
  const endTime = addMinutesToTime(startTime, durationMinutes || 30) || "09:30";
  return { id: createSlotId(), startTime, endTime };
};

const normalizeDaySchedule = (day: DoctorAvailabilityDaySchedule): DayScheduleDraft => ({
  dayOfWeek: day.dayOfWeek,
  isAvailable: day.isAvailable,
  slots: day.slots.map((slot) => ({
    id: createSlotId(),
    startTime: slot.startTime ?? "",
    endTime: slot.endTime ?? "",
  })),
  maxAppointments: day.maxAppointments != null ? String(day.maxAppointments) : "",
});

const normalizeDayKey = (value: string) => value.trim().toLowerCase();

const ensureFullWeek = (days: DayScheduleDraft[]) => {
  const dayMap = new Map(days.map((day) => [normalizeDayKey(day.dayOfWeek), day]));
  return weekDays.map((dayOfWeek) => {
    const key = normalizeDayKey(dayOfWeek);
    return (
      dayMap.get(key) ?? {
        dayOfWeek,
        isAvailable: false,
        slots: [],
        maxAppointments: "",
      }
    );
  });
};

const buildScheduleFromAvailability = (availability: DoctorAvailability): DayScheduleDraft[] => {
  if (availability.weeklyScheduleJson?.length) {
    return ensureFullWeek(availability.weeklyScheduleJson.map(normalizeDaySchedule));
  }

  return availability.weeklySchedule.length
    ? ensureFullWeek(
        availability.weeklySchedule.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          isAvailable: day.isAvailable,
          slots:
            day.isAvailable && day.startTime && day.endTime
              ? [
                  {
                    id: createSlotId(),
                    startTime: day.startTime,
                    endTime: day.endTime,
                  },
                ]
              : [],
          maxAppointments: day.maxAppointments != null ? String(day.maxAppointments) : "",
        })),
      )
    : ensureFullWeek(
        weekDays.map((dayOfWeek) => ({
          dayOfWeek,
          isAvailable: false,
          slots: [],
          maxAppointments: "",
        })),
      );
};

const buildWeeklyScheduleJson = (weeklySchedule: DayScheduleDraft[]): DoctorAvailabilityDaySchedule[] =>
  weeklySchedule.map((day) => ({
    dayOfWeek: day.dayOfWeek,
    isAvailable: day.slots.length > 0,
    slots: day.slots
      .filter((slot) => slot.startTime && slot.endTime)
      .map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    maxAppointments: day.maxAppointments ? Number(day.maxAppointments) : null,
  }));

const buildWeeklyScheduleObject = (
  weeklySchedule: DayScheduleDraft[],
): Record<string, { startTime: string; endTime: string }[]> =>
  weeklySchedule.reduce<Record<string, { startTime: string; endTime: string }[]>>((acc, day) => {
    const key = normalizeDayKey(day.dayOfWeek);
    if (!key) return acc;

    acc[key] = day.slots
      .filter((slot) => slot.startTime && slot.endTime)
      .map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
      }));

    return acc;
  }, {});

const buildLegacyWeeklySchedule = (weeklySchedule: DayScheduleDraft[]) =>
  weeklySchedule.map((day) => {
    const sorted = sortSlots(day.slots).filter((slot) => slot.startTime && slot.endTime);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const isAvailable = day.slots.length > 0;

    return {
      dayOfWeek: day.dayOfWeek,
      isAvailable,
      startTime: isAvailable && first ? toNullableTime(first.startTime) : null,
      endTime: isAvailable && last ? toNullableTime(last.endTime) : null,
      maxAppointments: isAvailable && day.maxAppointments ? Number(day.maxAppointments) : null,
    };
  });

const validateDay = (day: DayScheduleDraft) => {
  const errors: string[] = [];

  if (!day.isAvailable) return errors;

  if (!day.slots.length) {
    errors.push("Add at least one slot for this day.");
    return errors;
  }

  const sorted = sortSlots(day.slots);
  sorted.forEach((slot) => {
    if (!slot.startTime || !slot.endTime) {
      errors.push("Every slot needs a start and end time.");
      return;
    }
    const start = parseTimeToMinutes(slot.startTime);
    const end = parseTimeToMinutes(slot.endTime);
    if (start === null || end === null) {
      errors.push("One or more slot times are invalid.");
      return;
    }
    if (end <= start) {
      errors.push("Slot end time must be after start time.");
    }
  });

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    const previousEnd = parseTimeToMinutes(previous.endTime);
    const currentStart = parseTimeToMinutes(current.startTime);
    if (previousEnd != null && currentStart != null && currentStart < previousEnd) {
      errors.push("Slots cannot overlap.");
      break;
    }
  }

  return Array.from(new Set(errors));
};

const DRAFT_STORAGE_KEY = "doctor-schedule-draft";

const DoctorSchedule = () => {
  const profileQuery = useDoctorProfileQuery();
  const professionalQuery = useDoctorProfessionalProfileQuery();
  const availabilityQuery = useDoctorAvailabilityQuery();
  const updateAvailabilityMutation = useUpdateDoctorAvailabilityMutation();

  const [availabilityForm, setAvailabilityForm] = useState({
    timezone: "",
    appointmentDurationMinutes: "",
    weeklySchedule: [] as DayScheduleDraft[],
  });
  const [isDirty, setIsDirty] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (!availabilityQuery.data) return;

    if (!hasHydrated) {
      const draftRaw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (draftRaw) {
        try {
          const parsed = JSON.parse(draftRaw) as { form?: typeof availabilityForm; isDirty?: boolean };
          if (parsed?.form && parsed.isDirty) {
            setAvailabilityForm(parsed.form);
            setIsDirty(true);
            setHasHydrated(true);
            return;
          }
        } catch {
          sessionStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      }
    }

    if (!isDirty) {
      setAvailabilityForm({
        timezone: availabilityQuery.data.timezone ?? "",
        appointmentDurationMinutes:
          availabilityQuery.data.appointmentDurationMinutes?.toString() ?? "",
        weeklySchedule: buildScheduleFromAvailability(availabilityQuery.data),
      });
      setHasHydrated(true);
      setIsDirty(false);
    }
  }, [availabilityQuery.data, hasHydrated, isDirty]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (isDirty) {
      sessionStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ form: availabilityForm, isDirty: true }),
      );
    } else {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, [availabilityForm, hasHydrated, isDirty]);

  const doctorName = getDisplayName(profileQuery.data ?? {});
  const doctorSubtitle =
    professionalQuery.data?.specialty ??
    profileQuery.data?.bio ??
    "Doctor account";

  const availableDays = useMemo(
    () => availabilityForm.weeklySchedule.filter((day) => day.slots.length > 0),
    [availabilityForm.weeklySchedule],
  );

  const totalWeeklySlots = useMemo(
    () =>
      availabilityForm.weeklySchedule.reduce((total, day) => total + day.slots.length, 0),
    [availabilityForm.weeklySchedule],
  );

  const dayErrors = useMemo(
    () =>
      availabilityForm.weeklySchedule.reduce<Record<string, string[]>>((acc, day) => {
        const errors = validateDay(day);
        if (errors.length) {
          acc[day.dayOfWeek] = errors;
        }
        return acc;
      }, {}),
    [availabilityForm.weeklySchedule],
  );

  const hasBlockingErrors = Object.keys(dayErrors).length > 0;

  const updateDay = (
    index: number,
    updater: (current: DayScheduleDraft) => DayScheduleDraft,
  ) => {
    setAvailabilityForm((current) => ({
      ...current,
      weeklySchedule: current.weeklySchedule.map((day, dayIndex) =>
        dayIndex === index ? updater(day) : day,
      ),
    }));
    setIsDirty(true);
  };

  const handleSave = () => {
    if (hasBlockingErrors) {
      toast.error("Resolve schedule errors before saving.");
      return;
    }

    const payload: UpdateDoctorAvailabilityRequest = {
      timezone: availabilityForm.timezone || undefined,
      appointmentDurationMinutes: availabilityForm.appointmentDurationMinutes
        ? Number(availabilityForm.appointmentDurationMinutes)
        : null,
      slotDurationMinutes: availabilityForm.appointmentDurationMinutes
        ? Number(availabilityForm.appointmentDurationMinutes)
        : null,
      slot_duration_minutes: availabilityForm.appointmentDurationMinutes
        ? Number(availabilityForm.appointmentDurationMinutes)
        : null,
      weeklySchedule: buildWeeklyScheduleObject(availabilityForm.weeklySchedule),
      weeklyScheduleJson: buildWeeklyScheduleJson(availabilityForm.weeklySchedule),
      weekly_schedule_json: buildWeeklyScheduleJson(availabilityForm.weeklySchedule),
    };

    updateAvailabilityMutation.mutate(payload, {
      onSuccess: () => {
        setIsDirty(false);
        toast.success("Availability updated successfully");
      },
      onError: (error: Error) => toast.error(error.message),
    });
  };

  const slotDurationHint = availabilityForm.appointmentDurationMinutes
    ? `${availabilityForm.appointmentDurationMinutes} min slots`
    : "Slot duration not set";

  return (
    <DashboardLayout
      userRole="doctor"
      userName={doctorName}
      userSubtitle={doctorSubtitle}
      navItems={doctorNavItems}
      userIcon={Stethoscope}
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Availability</h1>
          <p className="text-muted-foreground">
            Design your weekly schedule as slots patients can book.
          </p>
        </div>

        <Button onClick={handleSave} disabled={updateAvailabilityMutation.isPending || hasBlockingErrors}>
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
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Settings</CardTitle>
                <CardDescription>Keep these lightweight and accurate.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="availability-timezone">Timezone</Label>
                  <Input
                    id="availability-timezone"
                    value={availabilityForm.timezone}
                    onChange={(event) => {
                      setAvailabilityForm((current) => ({
                        ...current,
                        timezone: event.target.value,
                      }));
                      setIsDirty(true);
                    }}
                    placeholder="Africa/Cairo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability-duration">Slot Duration (minutes)</Label>
                  <Input
                    id="availability-duration"
                    type="number"
                    min="0"
                    value={availabilityForm.appointmentDurationMinutes}
                    onChange={(event) => {
                      setAvailabilityForm((current) => ({
                        ...current,
                        appointmentDurationMinutes: event.target.value,
                      }));
                      setIsDirty(true);
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
                <CardDescription>Summary derived from the slot schedule below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Available Days</span>
                  <span className="text-2xl font-bold">{availableDays.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Slots</span>
                  <span className="text-2xl font-bold">{totalWeeklySlots}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Slot Duration</span>
                  <span className="font-medium">{slotDurationHint}</span>
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
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5" />
                Weekly Slot Builder
              </CardTitle>
              <CardDescription>
                Toggle a day on, then add one or more time slots. Slots cannot overlap.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {availabilityForm.weeklySchedule.length === 0 ? (
                <Alert>
                  <AlertTitle>No availability data returned</AlertTitle>
                  <AlertDescription>
                    The backend did not return any schedule rows yet. Save once after configuring the
                    schedule to initialize it.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {availabilityForm.weeklySchedule.map((day, index) => {
                    const errors = dayErrors[day.dayOfWeek] ?? [];
                    const durationMinutes = Number(availabilityForm.appointmentDurationMinutes) || 30;

                    return (
                      <Card
                        key={day.dayOfWeek || index}
                        className={!day.isAvailable ? "border-dashed opacity-80" : undefined}
                      >
                        <CardHeader className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>{day.dayOfWeek || `Day ${index + 1}`}</CardTitle>
                              <CardDescription>
                                {day.isAvailable ? "Open for booking" : "Day off"}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={day.isAvailable ? "default" : "outline"}>
                                {day.slots.length} slots
                              </Badge>
                              <Switch
                                checked={day.isAvailable}
                                onCheckedChange={(checked) =>
                                  updateDay(index, (current) => ({
                                    ...current,
                                    isAvailable: checked,
                                    ...(checked
                                      ? {}
                                      : {
                                          slots: [],
                                          maxAppointments: "",
                                        }),
                                  }))
                                }
                              />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{slotDurationHint}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {day.isAvailable ? (
                            <>
                              {day.slots.length ? (
                                <div className="space-y-3">
                                  {day.slots.map((slot) => (
                                    <div key={slot.id} className="flex flex-wrap items-end gap-3">
                                      <div className="min-w-[140px] flex-1 space-y-2">
                                        <Label>Start</Label>
                                        <Input
                                          type="time"
                                          value={slot.startTime}
                                          onChange={(event) =>
                                            updateDay(index, (current) => ({
                                              ...current,
                                              slots: sortSlots(
                                                current.slots.map((item) =>
                                                  item.id === slot.id
                                                    ? { ...item, startTime: event.target.value }
                                                    : item,
                                                ),
                                              ),
                                            }))
                                          }
                                        />
                                      </div>
                                      <div className="min-w-[140px] flex-1 space-y-2">
                                        <Label>End</Label>
                                        <Input
                                          type="time"
                                          value={slot.endTime}
                                          onChange={(event) =>
                                            updateDay(index, (current) => ({
                                              ...current,
                                              slots: sortSlots(
                                                current.slots.map((item) =>
                                                  item.id === slot.id
                                                    ? { ...item, endTime: event.target.value }
                                                    : item,
                                                ),
                                              ),
                                            }))
                                          }
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() =>
                                          updateDay(index, (current) => ({
                                            ...current,
                                            slots: current.slots.filter((item) => item.id !== slot.id),
                                          }))
                                        }
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                  No slots yet. Add your first slot to open this day.
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-3">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    updateDay(index, (current) => ({
                                      ...current,
                                      slots: [
                                        ...current.slots,
                                        buildDefaultSlot(current, durationMinutes),
                                      ],
                                    }))
                                  }
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add slot
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                  Defaults to {durationMinutes} min blocks.
                                </span>
                              </div>

                              <div className="max-w-xs space-y-2">
                                <Label>Max appointments</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={day.maxAppointments}
                                  onChange={(event) =>
                                    updateDay(index, (current) => ({
                                      ...current,
                                      maxAppointments: event.target.value,
                                    }))
                                  }
                                />
                              </div>

                              {errors.length ? (
                                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                                  {errors.map((error) => (
                                    <p key={error}>{error}</p>
                                  ))}
                                </div>
                              ) : null}
                            </>
                          ) : (
                            null
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorSchedule;
