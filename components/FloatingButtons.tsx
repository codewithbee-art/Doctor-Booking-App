"use client";

import { useState } from "react";
import Link from "next/link";

export default function FloatingButtons() {
  const [chatToast, setChatToast] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* AI Chat - Coming Soon */}
      <div className="group relative">
        <button
          onClick={() => { setChatToast(true); setTimeout(() => setChatToast(false), 2500); }}
          className="flex h-12 items-center gap-2 rounded-full bg-emerald-600 px-3 shadow-lg transition-all duration-300 hover:pr-4 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
          aria-label="AI Chat - Coming Soon"
        >
          <svg className="h-6 w-6 text-white shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold text-white transition-all duration-300 group-hover:max-w-[120px] group-hover:block">
            Coming Soon
          </span>
        </button>
        {chatToast && (
          <div className="absolute bottom-full right-0 mb-2 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white shadow-lg animate-fadeIn whitespace-nowrap">
            AI Chat coming soon!
          </div>
        )}
      </div>

      {/* Doctor Portal */}
      <Link
        href="/admin/login"
        className="group hidden md:flex h-12 items-center gap-2 rounded-full bg-primary-dark px-3 shadow-lg transition-all duration-300 hover:pr-4 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Doctor Portal"
      >
        <svg className="h-6 w-6 text-white shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <span className="hidden max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:max-w-[140px] group-hover:block">
          <span className="text-sm font-semibold text-white">Doctor Portal</span>
        </span>
      </Link>
    </div>
  );
}
