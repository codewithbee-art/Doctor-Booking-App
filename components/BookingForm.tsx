"use client";

import { useState } from "react";

export interface BookingFormData {
  fullName: string;
  phone: string;
  email: string;
  problem: string;
  // Counselling fields
  isCounsellingBooking?: boolean;
  consultation_mode?: string;
  privacy_preference?: string;
  payment_preference?: string;
  counselling_reason?: string;
}

interface BookingFormProps {
  selectedDate: string;
  selectedTime: string;
  onBack: () => void;
  onSubmit: (data: BookingFormData) => void;
  isSubmitting: boolean;
  isCounselling?: boolean;
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
  isCounselling = false,
}: BookingFormProps) {
  const [showCounselling, setShowCounselling] = useState(isCounselling);
  const [form, setForm] = useState<BookingFormData>({
    fullName: "",
    phone: "",
    email: "",
    problem: "",
    consultation_mode: isCounselling ? "phone" : undefined,
    privacy_preference: isCounselling ? "private" : undefined,
    payment_preference: isCounselling ? "pay_later" : undefined,
    counselling_reason: "",
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Reset pay_on_visit if consultation mode changes away from in_person
      if (name === "consultation_mode" && value !== "in_person" && prev.payment_preference === "pay_on_visit") {
        next.payment_preference = "pay_later";
      }
      return next;
    });
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function toggleCounselling() {
    const next = !showCounselling;
    setShowCounselling(next);
    if (next) {
      setForm((prev) => ({
        ...prev,
        consultation_mode: prev.consultation_mode || "phone",
        privacy_preference: prev.privacy_preference || "private",
        payment_preference: prev.payment_preference || "pay_later",
      }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      if (showCounselling) {
        onSubmit({ ...form, isCounsellingBooking: true });
      } else {
        onSubmit({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          problem: form.problem,
          isCounsellingBooking: false,
        });
      }
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
              rows={showCounselling ? 2 : 4}
              value={form.problem}
              onChange={handleChange}
              aria-required="true"
              aria-describedby={errors.problem ? "problem-error" : "problem-hint"}
              aria-invalid={!!errors.problem}
              placeholder={showCounselling ? "General reason (e.g. stress, personal concern)…" : "Briefly describe your symptoms or the reason for your visit..."}
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
                {showCounselling ? "You do not need to share sensitive details here. The doctor will discuss everything during the session." : "This helps the doctor prepare for your appointment."}
              </p>
            )}
          </div>

          {/* Private Counselling toggle card */}
          <div
            role="button"
            tabIndex={0}
            aria-pressed={showCounselling}
            onClick={toggleCounselling}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCounselling(); } }}
            className={[
              "flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors select-none",
              showCounselling ? "border-primary bg-primary/5" : "border-border bg-white hover:border-secondary",
            ].join(" ")}
          >
            <div className={[
              "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors",
              showCounselling ? "border-primary bg-primary" : "border-border bg-white",
            ].join(" ")}>
              {showCounselling && (
                <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-body text-base font-semibold text-text-primary">
                I would like Private Counselling
              </p>
              <p className="font-body text-sm text-text-secondary mt-0.5">
                Phone, video, or in-person confidential consultation
              </p>
            </div>
          </div>

          {/* Private Counselling fields */}
          {showCounselling && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span className="font-body text-sm font-semibold text-primary">Private Counselling Details</span>
              </div>

              {/* Consultation Mode */}
              <div>
                <label htmlFor="consultation_mode" className="block font-body text-sm font-semibold text-text-primary mb-1">
                  Consultation Mode <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <select
                  id="consultation_mode"
                  name="consultation_mode"
                  value={form.consultation_mode || "phone"}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 font-body text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="phone">Phone Call</option>
                  <option value="video">Video Call</option>
                  <option value="in_person">In-Person Visit</option>
                </select>
                <p className="mt-1 font-body text-xs text-text-secondary">
                  Choose how you would like to have your consultation.
                </p>
              </div>

              {/* Privacy Preference */}
              <div>
                <label htmlFor="privacy_preference" className="block font-body text-sm font-semibold text-text-primary mb-1">
                  Privacy Level
                </label>
                <select
                  id="privacy_preference"
                  name="privacy_preference"
                  value={form.privacy_preference || "private"}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 font-body text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="private">Private — minimal details stored</option>
                  <option value="normal">Normal — standard record keeping</option>
                </select>
              </div>

              {/* Payment Preference */}
              <div>
                <label htmlFor="payment_preference" className="block font-body text-sm font-semibold text-text-primary mb-1">
                  Payment Preference
                </label>
                <select
                  id="payment_preference"
                  name="payment_preference"
                  value={form.payment_preference || "pay_later"}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 font-body text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pay_later">Pay Later — admin will contact you</option>
                  {form.consultation_mode === "in_person" && (
                    <option value="pay_on_visit">Pay on Visit</option>
                  )}
                  <option value="pay_now">Pay Now (online payment coming soon)</option>
                </select>
                {form.payment_preference === "pay_now" && (
                  <p className="mt-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-body text-xs text-amber-800">
                    Online payment is not yet available. Our team will contact you to arrange payment after your booking is confirmed.
                  </p>
                )}
                {form.payment_preference === "pay_later" && (
                  <p className="mt-1 font-body text-xs text-text-secondary">
                    Our admin team will call you to discuss payment options.
                  </p>
                )}
              </div>

              {/* Counselling Reason (optional, brief) */}
              <div>
                <label htmlFor="counselling_reason" className="block font-body text-sm font-semibold text-text-primary mb-1">
                  Brief Concern{" "}
                  <span className="font-normal text-text-secondary text-xs">(optional)</span>
                </label>
                <input
                  id="counselling_reason"
                  name="counselling_reason"
                  type="text"
                  value={form.counselling_reason || ""}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="e.g. stress, anxiety, personal health…"
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 font-body text-base text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="mt-1 font-body text-xs text-text-secondary">
                  Optional. Keep it brief — you can discuss details during your session.
                </p>
              </div>
            </div>
          )}
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
