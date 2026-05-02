"use client";

export interface TimeSlot {
  time: string; // "09:00"
  label: string; // "9:00 AM"
  isBooked: boolean;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
}

export default function TimeSlotPicker({
  slots,
  selectedTime,
  onTimeSelect,
}: TimeSlotPickerProps) {
  if (slots.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-bg-light px-6 py-8 text-center">
        <svg className="mx-auto mb-3 h-10 w-10 text-border" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
        </svg>
        <p className="font-body text-base text-text-secondary">
          Please select a date to see available time slots.
        </p>
      </div>
    );
  }

  const available = slots.filter((s) => !s.isBooked);

  if (available.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-bg-light px-6 py-8 text-center">
        <p className="font-body text-base font-semibold text-danger">
          No slots available for this date.
        </p>
        <p className="mt-1 font-body text-sm text-text-secondary">
          Please choose a different date.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 font-body text-sm text-text-secondary">
        {available.length} slot{available.length !== 1 ? "s" : ""} available — select your preferred time:
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((slot) => {
          const isSelected = slot.time === selectedTime;
          return (
            <button
              key={slot.time}
              disabled={slot.isBooked}
              onClick={() => onTimeSelect(slot.time)}
              aria-label={`${slot.label}${slot.isBooked ? ", unavailable" : ""}`}
              aria-pressed={isSelected}
              className={[
                "rounded-lg border px-3 py-2 text-sm font-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                slot.isBooked
                  ? "cursor-not-allowed border-border bg-bg-light text-border line-through"
                  : isSelected
                  ? "border-primary bg-primary text-white shadow-sm"
                  : "border-border bg-white text-text-primary hover:border-primary hover:bg-light-blue hover:text-primary",
              ].join(" ")}
            >
              {slot.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
