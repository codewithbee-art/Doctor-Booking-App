"use client";

import { useState, useEffect } from "react";
import BSADCalendar, { CalendarMode } from "@/components/BSADCalendar";
import TimeSlotPicker, { TimeSlot } from "@/components/TimeSlotPicker";
import BookingForm, { BookingFormData } from "@/components/BookingForm";

type Step = "pick" | "details" | "success";

function formatDisplayDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDisplayTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export default function BookingPage() {
  const [step, setStep] = useState<Step>("pick");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [calendarMode, setCalendarMode] = useState<CalendarMode>("BS");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedName, setConfirmedName] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Slots API state
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch slots from API when date is selected
  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      setSlotsError(null);
      return;
    }

    async function fetchSlots() {
      setSlotsLoading(true);
      setSlotsError(null);
      setSelectedTime(null);

      try {
        const response = await fetch(`/api/slots?date=${encodeURIComponent(selectedDate!)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch slots");
        }

        if (data.success && Array.isArray(data.slots)) {
          // Convert API slots to TimeSlot format
          const formattedSlots: TimeSlot[] = data.slots.map((slot: any) => {
            const [hour, minute] = slot.slot_time.split(":").map(Number);
            const suffix = hour >= 12 ? "PM" : "AM";
            const displayHour = hour % 12 || 12;
            const label = `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
            
            return {
              time: slot.slot_time,
              label,
              isBooked: slot.is_booked,
            };
          });
          setSlots(formattedSlots);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Failed to fetch slots:", err);
        setSlotsError(err instanceof Error ? err.message : "An unexpected error occurred");
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    }

    fetchSlots();
  }, [selectedDate]);

  function handleDateSelect(date: string) {
    setSelectedDate(date);
  }

  function handleContinue() {
    if (selectedDate && selectedTime) {
      setStep("details");
    }
  }

  function handleBack() {
    setStep("pick");
  }

  async function handleSubmit(data: BookingFormData) {
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: data.fullName,
          patient_phone: data.phone,
          patient_email: data.email || undefined,
          problem: data.problem,
          appointment_date_ad: selectedDate,
          appointment_date_bs: "", // BS conversion not implemented yet
          appointment_time: selectedTime,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create booking");
      }

      if (result.success && result.booking_id) {
        setConfirmedName(data.fullName);
        setBookingId(result.booking_id);
        setStep("success");
        // Refresh slots so the booked slot appears unavailable
        await refreshSlots();
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (err) {
      console.error("Booking submission failed:", err);
      setSubmitError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Refresh slots for the currently selected date
  async function refreshSlots() {
    if (!selectedDate) return;

    try {
      const response = await fetch(`/api/slots?date=${encodeURIComponent(selectedDate)}`);
      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.slots)) {
        const formattedSlots: TimeSlot[] = data.slots.map((slot: any) => {
          const [hour, minute] = slot.slot_time.split(":").map(Number);
          const suffix = hour >= 12 ? "PM" : "AM";
          const displayHour = hour % 12 || 12;
          const label = `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
          return {
            time: slot.slot_time,
            label,
            isBooked: slot.is_booked,
          };
        });
        setSlots(formattedSlots);
      }
    } catch (err) {
      console.error("Failed to refresh slots:", err);
    }
  }

  function handleBookAnother() {
    setStep("pick");
    setSelectedDate(null);
    setSelectedTime(null);
    setConfirmedName("");
    setBookingId(null);
    setCalendarMode("BS");
    setSlots([]);
    setSlotsError(null);
    setSubmitError(null);
  }

  const stepNumber = step === "pick" ? 1 : step === "details" ? 2 : 3;

  return (
    <main className="min-h-screen bg-bg-light">
      {/* Page Header */}
      <div className="bg-primary px-4 py-12 md:py-16 text-center">
        <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
          Book an Appointment
        </h1>
        <p className="mt-3 font-body text-lg text-light-blue/90 max-w-xl mx-auto">
          Choose a convenient date and time, then fill in your details. We will confirm your appointment promptly.
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        {/* Success screen */}
        {step === "success" && (
          <div className="rounded-2xl border border-accent/30 bg-white px-6 py-12 text-center shadow-sm md:px-12">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <svg className="h-9 w-9 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">
              Booking Received!
            </h2>
            <p className="mt-3 font-body text-lg text-text-secondary">
              Thank you, <span className="font-semibold text-text-primary">{confirmedName}</span>. Your appointment request has been submitted.
            </p>
            {selectedDate && selectedTime && (
              <div className="mt-5 inline-block rounded-xl border border-light-blue bg-light-blue/30 px-6 py-4 text-left">
                <p className="font-body text-sm font-semibold text-primary mb-2">Appointment Details</p>
                <p className="font-body text-base text-text-primary">
                  <span className="font-semibold">Date:</span> {formatDisplayDate(selectedDate)}
                </p>
                <p className="font-body text-base text-text-primary mt-1">
                  <span className="font-semibold">Time:</span> {formatDisplayTime(selectedTime)}
                </p>
                {bookingId && (
                  <p className="font-body text-sm text-text-secondary mt-2">
                    <span className="font-semibold">Booking ID:</span> {bookingId}
                  </p>
                )}
              </div>
            )}
            <p className="mt-5 font-body text-base text-text-secondary">
              We will call you to confirm. If you do not hear from us within 24 hours, please call us directly.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="tel:+977-000000000"
                className="flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-3 font-body text-base font-semibold text-text-primary hover:bg-bg-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                Call the Clinic
              </a>
              <button
                onClick={handleBookAnother}
                className="rounded-lg bg-accent px-6 py-3 font-body text-base font-semibold text-white shadow-sm hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Book Another Appointment
              </button>
            </div>
          </div>
        )}

        {/* Step 1 & 2 */}
        {step !== "success" && (
          <>
            {/* Progress indicator */}
            <div className="mb-8 flex items-center justify-center gap-3">
              {[
                { n: 1, label: "Choose Date & Time" },
                { n: 2, label: "Your Details" },
              ].map(({ n, label }, idx) => (
                <div key={n} className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={[
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold font-body transition-colors",
                        stepNumber >= n
                          ? "bg-primary text-white"
                          : "border-2 border-border bg-white text-text-secondary",
                      ].join(" ")}
                      aria-current={stepNumber === n ? "step" : undefined}
                    >
                      {stepNumber > n ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        n
                      )}
                    </div>
                    <span
                      className={[
                        "hidden font-body text-sm font-medium sm:block",
                        stepNumber >= n ? "text-primary" : "text-text-secondary",
                      ].join(" ")}
                    >
                      {label}
                    </span>
                  </div>
                  {idx === 0 && (
                    <div className={["h-px w-8 sm:w-12", stepNumber > 1 ? "bg-primary" : "bg-border"].join(" ")} />
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-white shadow-sm">
              <div className="border-b border-border px-6 py-5">
                <h2 className="font-heading text-xl font-bold text-text-primary">
                  {step === "pick" ? "Step 1: Choose Date & Time" : "Step 2: Your Details"}
                </h2>
                <p className="mt-1 font-body text-sm text-text-secondary">
                  {step === "pick"
                    ? "Select a date from the calendar, then pick an available time slot."
                    : "Please fill in your details so we can confirm your appointment."}
                </p>
              </div>

              <div className="px-6 py-6">
                {step === "pick" && (
                  <div className="space-y-6">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-body text-base font-semibold text-text-primary">
                          Select Date
                        </h3>
                        {/* BS / AD toggle */}
                        <div
                          role="group"
                          aria-label="Calendar mode"
                          className="flex rounded-lg border border-border overflow-hidden"
                        >
                          {(["BS", "AD"] as CalendarMode[]).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => {
                                setCalendarMode(mode);
                                setSelectedDate(null);
                                setSelectedTime(null);
                                setSlots([]);
                                setSlotsError(null);
                              }}
                              aria-pressed={calendarMode === mode}
                              className={[
                                "px-4 py-1.5 font-body text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                                calendarMode === mode
                                  ? "bg-primary text-white"
                                  : "bg-white text-text-secondary hover:bg-bg-light hover:text-primary",
                              ].join(" ")}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>
                      <BSADCalendar
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                        calendarMode={calendarMode}
                      />
                    </div>

                    <div>
                      <h3 className="mb-3 font-body text-base font-semibold text-text-primary">
                        Select Time
                      </h3>
                      <TimeSlotPicker
                        slots={slots}
                        selectedTime={selectedTime}
                        onTimeSelect={setSelectedTime}
                        loading={slotsLoading}
                        error={slotsError}
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleContinue}
                        disabled={!selectedDate || !selectedTime}
                        className="flex items-center gap-2 rounded-lg bg-accent px-8 py-3 font-body text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Continue
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {step === "details" && selectedDate && selectedTime && (
                  <>
                    {submitError && (
                      <div className="mb-6 rounded-xl border border-danger/40 bg-danger/10 px-5 py-4 flex items-start gap-3">
                        <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-danger" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <div>
                          <p className="font-body text-sm font-semibold text-danger">Booking failed</p>
                          <p className="font-body text-sm text-text-secondary">{submitError}</p>
                        </div>
                      </div>
                    )}
                    <BookingForm
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      onBack={handleBack}
                      onSubmit={handleSubmit}
                      isSubmitting={isSubmitting}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Help note */}
            <div className="mt-6 rounded-xl border border-border bg-white px-5 py-4 flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <p className="font-body text-sm text-text-secondary leading-relaxed">
                Need help? Call us at{" "}
                <a href="tel:+977-000000000" className="font-semibold text-primary underline underline-offset-2 hover:text-primary-dark">
                  +977-000000000
                </a>{" "}
                and we will book your appointment over the phone.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
