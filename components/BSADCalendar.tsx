"use client";

import { useState, useMemo } from "react";
import {
  BS_MONTHS,
  todayBS,
  todayAD,
  getBSDaysInMonth,
  getBSFirstDayOfMonth,
  bsToAD,
  formatBS,
} from "@/lib/dateConvert";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const AD_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonthAD(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonthAD(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatADKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export type CalendarMode = "BS" | "AD";

interface BSADCalendarProps {
  selectedDate: string | null; // Always AD YYYY-MM-DD
  onDateSelect: (dateAD: string) => void;
  calendarMode?: CalendarMode;
}

export default function BSADCalendar({ selectedDate, onDateSelect, calendarMode = "BS" }: BSADCalendarProps) {
  const todayADStr = todayAD();
  const todayBSObj = todayBS();

  // AD state
  const adToday = new Date();
  const [adYear, setAdYear] = useState(adToday.getFullYear());
  const [adMonth, setAdMonth] = useState(adToday.getMonth());

  // BS state
  const [bsYear, setBsYear] = useState(todayBSObj.year);
  const [bsMonth, setBsMonth] = useState(todayBSObj.month);

  // ---- AD Calendar Logic ----
  function prevMonthAD() {
    if (adMonth === 0) { setAdMonth(11); setAdYear((y) => y - 1); }
    else { setAdMonth((m) => m - 1); }
  }
  function nextMonthAD() {
    if (adMonth === 11) { setAdMonth(0); setAdYear((y) => y + 1); }
    else { setAdMonth((m) => m + 1); }
  }

  // ---- BS Calendar Logic ----
  function prevMonthBS() {
    if (bsMonth === 0) { setBsMonth(11); setBsYear((y) => y - 1); }
    else { setBsMonth((m) => m - 1); }
  }
  function nextMonthBS() {
    if (bsMonth === 11) { setBsMonth(0); setBsYear((y) => y + 1); }
    else { setBsMonth((m) => m + 1); }
  }

  // ---- BS grid ----
  const bsDaysInMonth = useMemo(() => getBSDaysInMonth(bsYear, bsMonth), [bsYear, bsMonth]);
  const bsFirstDay = useMemo(() => getBSFirstDayOfMonth(bsYear, bsMonth), [bsYear, bsMonth]);

  const bsCells: (number | null)[] = useMemo(() => [
    ...Array(bsFirstDay).fill(null),
    ...Array.from({ length: bsDaysInMonth }, (_, i) => i + 1),
  ], [bsFirstDay, bsDaysInMonth]);

  function isBSDayPast(day: number): boolean {
    if (bsYear < todayBSObj.year) return true;
    if (bsYear > todayBSObj.year) return false;
    if (bsMonth < todayBSObj.month) return true;
    if (bsMonth > todayBSObj.month) return false;
    return day < todayBSObj.day;
  }

  function isBSDayToday(day: number): boolean {
    return bsYear === todayBSObj.year && bsMonth === todayBSObj.month && day === todayBSObj.day;
  }

  function handleBSDayClick(day: number) {
    const adDate = bsToAD(bsYear, bsMonth, day);
    if (adDate) onDateSelect(adDate);
  }

  // Check if a BS day is selected (compare AD result)
  function isBSDaySelected(day: number): boolean {
    if (!selectedDate) return false;
    const adDate = bsToAD(bsYear, bsMonth, day);
    return adDate === selectedDate;
  }

  // ---- AD grid ----
  const adDaysInMonth = getDaysInMonthAD(adYear, adMonth);
  const adFirstDay = getFirstDayOfMonthAD(adYear, adMonth);
  const adCells: (number | null)[] = [
    ...Array(adFirstDay).fill(null),
    ...Array.from({ length: adDaysInMonth }, (_, i) => i + 1),
  ];

  function isADDayPast(day: number): boolean {
    return formatADKey(adYear, adMonth, day) < todayADStr;
  }

  function isADDayToday(day: number): boolean {
    return formatADKey(adYear, adMonth, day) === todayADStr;
  }

  function handleADDayClick(day: number) {
    onDateSelect(formatADKey(adYear, adMonth, day));
  }

  function isADDaySelected(day: number): boolean {
    return formatADKey(adYear, adMonth, day) === selectedDate;
  }

  // ---- Selected date display ----
  const selectedDisplay = useMemo(() => {
    if (!selectedDate) return null;
    const adDisplay = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const bsDisplay = formatBS(selectedDate);
    return { ad: adDisplay, bs: bsDisplay };
  }, [selectedDate]);

  return (
    <div className="bg-white rounded-xl border border-border p-4 select-none">
      {calendarMode === "BS" ? (
        <>
          {/* BS Month / Year navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonthBS}
              aria-label="Previous month"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-bg-light hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <span className="font-body font-semibold text-base text-text-primary">
              {BS_MONTHS[bsMonth]} {bsYear}
            </span>
            <button
              onClick={nextMonthBS}
              aria-label="Next month"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-bg-light hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-text-secondary py-1">
                {d}
              </div>
            ))}
          </div>

          {/* BS Date grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {bsCells.map((day, idx) => {
              if (day === null) return <div key={`bs-empty-${idx}`} />;
              const past = isBSDayPast(day);
              const isSelected = isBSDaySelected(day);
              const isToday = isBSDayToday(day);

              return (
                <button
                  key={`bs-${bsYear}-${bsMonth}-${day}`}
                  disabled={past}
                  onClick={() => handleBSDayClick(day)}
                  aria-label={`${day} ${BS_MONTHS[bsMonth]} ${bsYear}`}
                  aria-pressed={isSelected}
                  className={[
                    "mx-auto w-9 h-9 rounded-lg text-sm font-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    past
                      ? "text-border cursor-not-allowed"
                      : isSelected
                      ? "bg-primary text-white shadow-sm"
                      : isToday
                      ? "border-2 border-primary text-primary hover:bg-light-blue"
                      : "text-text-primary hover:bg-light-blue hover:text-primary",
                  ].join(" ")}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* AD Month / Year navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonthAD}
              aria-label="Previous month"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-bg-light hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <span className="font-body font-semibold text-base text-text-primary">
              {AD_MONTHS[adMonth]} {adYear}
            </span>
            <button
              onClick={nextMonthAD}
              aria-label="Next month"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-bg-light hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-text-secondary py-1">
                {d}
              </div>
            ))}
          </div>

          {/* AD Date grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {adCells.map((day, idx) => {
              if (day === null) return <div key={`ad-empty-${idx}`} />;
              const past = isADDayPast(day);
              const isSelected = isADDaySelected(day);
              const isToday = isADDayToday(day);

              return (
                <button
                  key={`ad-${adYear}-${adMonth}-${day}`}
                  disabled={past}
                  onClick={() => handleADDayClick(day)}
                  aria-label={`${day} ${AD_MONTHS[adMonth]} ${adYear}`}
                  aria-pressed={isSelected}
                  className={[
                    "mx-auto w-9 h-9 rounded-lg text-sm font-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    past
                      ? "text-border cursor-not-allowed"
                      : isSelected
                      ? "bg-primary text-white shadow-sm"
                      : isToday
                      ? "border-2 border-primary text-primary hover:bg-light-blue"
                      : "text-text-primary hover:bg-light-blue hover:text-primary",
                  ].join(" ")}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Selected date display - show both BS and AD */}
      {selectedDate && selectedDisplay && (
        <div className="mt-3 text-center space-y-0.5">
          <p className="text-sm font-body text-accent font-semibold">
            {selectedDisplay.bs} <span className="text-text-secondary font-normal">(BS)</span>
          </p>
          <p className="text-xs font-body text-text-secondary">
            {selectedDisplay.ad} <span>(AD)</span>
          </p>
        </div>
      )}
    </div>
  );
}
