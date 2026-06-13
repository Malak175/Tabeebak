import { format, isValid, parseISO } from "date-fns";
import { formatDisplayDate } from "@/lib/date-time";

export type AvailableSlotLike = {
  startAt: string;
  date?: string | null;
  time?: string | null;
};

export type GroupedAvailableSlots<T extends AvailableSlotLike> = {
  dateKey: string;
  label: string;
  slots: T[];
};

export const groupAvailableSlots = <T extends AvailableSlotLike>(slots: T[]): GroupedAvailableSlots<T>[] => {
  const now = new Date();
  const bucket = new Map<string, GroupedAvailableSlots<T>>();

  slots.forEach((slot) => {
    const parsed = parseISO(slot.startAt);
    if (!isValid(parsed)) return;
    if (parsed.getTime() <= now.getTime()) return;

    const dateKey = slot.date?.trim() || format(parsed, "yyyy-MM-dd");
    const label = formatDisplayDate(slot.startAt);
    const entry = bucket.get(dateKey) ?? { dateKey, label, slots: [] };
    entry.slots.push(slot);
    bucket.set(dateKey, entry);
  });

  return Array.from(bucket.values())
    .sort((left, right) => left.dateKey.localeCompare(right.dateKey))
    .map((entry) => ({
      ...entry,
      slots: [...entry.slots].sort(
        (left, right) => parseISO(left.startAt).getTime() - parseISO(right.startAt).getTime(),
      ),
    }));
};
