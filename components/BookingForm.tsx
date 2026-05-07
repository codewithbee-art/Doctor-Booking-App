"use client";

import { useState } from "react";

export interface BookingFormData {
  fullName: string;
  phone: string;
  email: string;
  problem: string;
}

interface BookingFormProps {
  selectedDate: string;
  selectedTime: string;
  onBack: () => void;
  onSubmit: (data: BookingFormData) => void;
  isSubmitting: boolean;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  problem?: string;
}

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

export default function BookingForm({
  selectedDate,
  selectedTime,
  onBack,
  onSubmit,
  isSubmitting,
}: BookingFormProps) {
  const [form, setForm] = useState<BookingFormData>({
    fullName: "",
    phone: "",
    email: "",
    problem: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    } else if (form.fullName.trim().length < 2) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^[0-9+\-\s()]{7,20}$/.test(form.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!form.problem.trim()) {
      newErrors.problem = "Please describe your reason for visit.";
    } else if (form.problem.trim().length < 5) {
      newErrors.problem = "Please provide a brief description (at least 5 characters).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  }

  return (
    <div>
      {/* Selected appointment summary */}
      <div className="mb-6 rounded-xl border border-light-blue bg-light-blue/40 px-5 py-4">
        <p className="font-body text-sm font-semibold text-primary mb-1">Your Appointment</p>
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
          <div className="flex items-center gap-2 text-sm font-body text-text-primary">
            <svg className="h-4 w-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
            </svg>
            <span>{formatDisplayDate(selectedDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-body text-text-primary">
            <svg className="h-4 w-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatDisplayTime(selectedTime)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block font-body text-base font-semibold text-text-primary mb-1">
              Full Name <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={handleChange}
              aria-required="true"
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              aria-invalid={!!errors.fullName}
              placeholder="e.g. Ram Prasad Sharma"
              className={[
                "w-full rounded-lg border px-4 py-3 font-body text-base text-text-primary placeholder:text-text-secondary/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                errors.fullName ? "border-danger bg-red-50" : "border-border bg-white hover:border-secondary",
              ].join(" ")}
            />
            {errors.fullName && (
              <p id="fullName-error" role="alert" className="mt-1 font-body text-sm text-danger">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block font-body text-base font-semibold text-text-primary mb-1">
              Phone Number <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={handleChange}
              aria-required="true"
              aria-describedby={errors.phone ? "phone-error" : undefined}
              aria-invalid={!!errors.phone}
              placeholder="e.g. 9800000000"
              className={[
                "w-full rounded-lg border px-4 py-3 font-body text-base text-text-primary placeholder:text-text-secondary/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                errors.phone ? "border-danger bg-red-50" : "border-border bg-white hover:border-secondary",
              ].join(" ")}
            />
            {errors.phone && (
              <p id="phone-error" role="alert" className="mt-1 font-body text-sm text-danger">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Email (optional) */}
          <div>
            <label htmlFor="email" className="block font-body text-base font-semibold text-text-primary mb-1">
              Email Address{" "}
              <span className="font-normal text-text-secondary text-sm">(optional)</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              aria-describedby={errors.email ? "email-error" : "email-hint"}
              aria-invalid={!!errors.email}
              placeholder="e.g. name@example.com"
              className={[
                "w-full rounded-lg border px-4 py-3 font-body text-base text-text-primary placeholder:text-text-secondary/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                errors.email ? "border-danger bg-red-50" : "border-border bg-white hover:border-secondary",
              ].join(" ")}
            />
            {errors.email ? (
              <p id="email-error" role="alert" className="mt-1 font-body text-sm text-danger">
                {errors.email}
              </p>
            ) : (
              <p id="email-hint" className="mt-1 font-body text-sm text-text-secondary">
                We will send a confirmation to this address if provided.
              </p>
            )}
          </div>

          {/* Problem / Reason */}
          <div>
            <label htmlFor="problem" className="block font-body text-base font-semibold text-text-primary mb-1">
              Reason for Visit <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <textarea
              id="problem"
              name="problem"
              rows={4}
              value={form.problem}
              onChange={handleChange}
              aria-required="true"
              aria-describedby={errors.problem ? "problem-error" : "problem-hint"}
              aria-invalid={!!errors.problem}
              placeholder="Briefly describe your symptoms or the reason for your visit..."
              className={[
                "w-full resize-none rounded-lg border px-4 py-3 font-body text-base text-text-primary placeholder:text-text-secondary/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                errors.problem ? "border-danger bg-red-50" : "border-border bg-white hover:border-secondary",
              ].join(" ")}
            />
            {errors.problem ? (
              <p id="problem-error" role="alert" className="mt-1 font-body text-sm text-danger">
                {errors.problem}
              </p>
            ) : (
              <p id="problem-hint" className="mt-1 font-body text-sm text-text-secondary">
                This helps the doctor prepare for your appointment.
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-6 py-3 font-body text-base font-semibold text-text-primary transition-colors hover:bg-bg-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-lg bg-accent px-8 py-3 font-body text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Submitting…
              </>
            ) : (
              <>
                Confirm Booking
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
