"use client";

const LEAF = "M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z";

export default function HeroParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]" aria-hidden="true">

      {/* ═══════ Large soft background shapes (3) — 50-80px ═══════ */}
      <div
        className="absolute top-[5%] left-[2%] rounded-full bg-sky-200/[0.18] blur-xl animate-drift"
        style={{ width: 72, height: 72, animationDelay: "0s", animationDuration: "14s" }}
      />
      <div
        className="absolute bottom-[5%] right-[2%] rounded-full bg-teal-200/[0.15] blur-xl animate-drift"
        style={{ width: 80, height: 80, animationDelay: "5s", animationDuration: "16s" }}
      />
      <div
        className="absolute top-[60%] left-[30%] rounded-full bg-blue-100/[0.12] blur-lg animate-float"
        style={{ width: 56, height: 56, animationDelay: "3s", animationDuration: "12s" }}
      />

      {/* ═══════ Filled plus signs (4) — 22-40px ═══════ */}
      <div
        className="absolute top-[8%] left-[4%] font-black text-blue-500/[0.40] animate-float"
        style={{ fontSize: 40, animationDelay: "0s" }}
      >+</div>
      <div
        className="absolute bottom-[12%] right-[5%] font-black text-teal-500/[0.35] animate-float"
        style={{ fontSize: 32, animationDelay: "3.2s" }}
      >+</div>
      <div
        className="absolute top-[72%] left-[10%] font-black text-sky-400/[0.28] animate-floatSpin"
        style={{ fontSize: 24, animationDelay: "1.5s" }}
      >+</div>
      <div
        className="absolute top-[35%] left-[44%] font-black text-teal-400/[0.22] animate-drift"
        style={{ fontSize: 22, animationDelay: "6s", animationDuration: "11s" }}
      >+</div>

      {/* ═══════ Hollow / outlined plus signs (4) — 20-36px ═══════ */}
      <svg
        className="absolute top-[14%] right-[6%] text-blue-500/[0.35] animate-float"
        style={{ width: 36, height: 36, animationDelay: "1s" }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      ><path d="M12 4v16M4 12h16" /></svg>

      <svg
        className="absolute bottom-[26%] left-[2%] text-sky-500/[0.30] animate-drift"
        style={{ width: 28, height: 28, animationDelay: "4s", animationDuration: "10s" }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      ><path d="M12 4v16M4 12h16" /></svg>

      <svg
        className="absolute top-[48%] right-[2%] text-teal-400/[0.25] animate-floatSpin"
        style={{ width: 22, height: 22, animationDelay: "6s" }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      ><path d="M12 4v16M4 12h16" /></svg>

      <svg
        className="absolute bottom-[8%] left-[40%] text-blue-400/[0.22] animate-float"
        style={{ width: 20, height: 20, animationDelay: "2.8s", animationDuration: "9s" }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      ><path d="M12 4v16M4 12h16" /></svg>

      {/* ═══════ Hollow circle rings (5) — 22-44px ═══════ */}
      <div
        className="absolute top-[5%] left-[18%] rounded-full border-2 border-blue-400/[0.30] animate-drift"
        style={{ width: 40, height: 40, animationDelay: "0.5s", animationDuration: "11s" }}
      />
      <div
        className="absolute top-[55%] right-[8%] rounded-full border-2 border-teal-400/[0.32] animate-floatSpin"
        style={{ width: 32, height: 32, animationDelay: "3.5s" }}
      />
      <div
        className="absolute bottom-[8%] left-[24%] rounded-full border-2 border-sky-400/[0.25] animate-float"
        style={{ width: 44, height: 44, animationDelay: "2s", animationDuration: "8s" }}
      />
      <div
        className="absolute top-[30%] left-[35%] rounded-full border-2 border-rose-300/[0.20] animate-drift"
        style={{ width: 24, height: 24, animationDelay: "5.5s", animationDuration: "10s" }}
      />
      <div
        className="absolute top-[82%] right-[20%] rounded-full border border-teal-300/[0.22] animate-float"
        style={{ width: 28, height: 28, animationDelay: "4.2s", animationDuration: "9s" }}
      />

      {/* ═══════ Dot clusters (3 clusters, ~9 dots) — 8-14px ═══════ */}
      {/* Top-left */}
      <div className="absolute top-[22%] left-[7%] flex gap-2 animate-float" style={{ animationDelay: "0.8s" }}>
        <div className="rounded-full bg-blue-500/[0.40]" style={{ width: 10, height: 10 }} />
        <div className="rounded-full bg-sky-400/[0.32] mt-1" style={{ width: 8, height: 8 }} />
        <div className="rounded-full bg-teal-500/[0.35]" style={{ width: 12, height: 12 }} />
      </div>
      {/* Bottom-right */}
      <div className="absolute bottom-[18%] right-[12%] flex gap-2 animate-drift" style={{ animationDelay: "4.2s", animationDuration: "9s" }}>
        <div className="rounded-full bg-rose-400/[0.30]" style={{ width: 8, height: 8 }} />
        <div className="rounded-full bg-blue-400/[0.38] mt-1" style={{ width: 12, height: 12 }} />
        <div className="rounded-full bg-teal-400/[0.28]" style={{ width: 10, height: 10 }} />
      </div>
      {/* Center area */}
      <div className="absolute bottom-[35%] left-[48%] flex gap-1.5 animate-float" style={{ animationDelay: "2.5s", animationDuration: "7s" }}>
        <div className="rounded-full bg-sky-500/[0.30]" style={{ width: 8, height: 8 }} />
        <div className="rounded-full bg-teal-400/[0.35] mt-0.5" style={{ width: 10, height: 10 }} />
        <div className="rounded-full bg-blue-300/[0.25]" style={{ width: 14, height: 14 }} />
      </div>

      {/* ═══════ Ayurveda leaf shapes (4) — 22-40px ═══════ */}
      <svg
        className="absolute top-[38%] left-[1%] text-teal-500/[0.30] animate-floatSpin"
        style={{ width: 38, height: 38, animationDelay: "2.2s" }}
        viewBox="0 0 24 24" fill="currentColor"
      ><path d={LEAF} /></svg>

      <svg
        className="absolute top-[75%] right-[4%] text-green-500/[0.25] rotate-45 animate-drift"
        style={{ width: 30, height: 30, animationDelay: "5s", animationDuration: "12s" }}
        viewBox="0 0 24 24" fill="currentColor"
      ><path d={LEAF} /></svg>

      <svg
        className="absolute top-[6%] right-[30%] text-teal-400/[0.22] -rotate-12 animate-float"
        style={{ width: 24, height: 24, animationDelay: "3.8s", animationDuration: "10s" }}
        viewBox="0 0 24 24" fill="currentColor"
      ><path d={LEAF} /></svg>

      <svg
        className="absolute bottom-[15%] left-[15%] text-emerald-400/[0.20] rotate-[30deg] animate-drift"
        style={{ width: 22, height: 22, animationDelay: "7s", animationDuration: "13s" }}
        viewBox="0 0 24 24" fill="currentColor"
      ><path d={LEAF} /></svg>

      {/* ═══════ Standalone accent dots (5) — 8-14px ═══════ */}
      <div
        className="absolute top-[44%] left-[1%] rounded-full bg-sky-500/[0.45] animate-float"
        style={{ width: 10, height: 10, animationDelay: "4s" }}
      />
      <div
        className="absolute top-[3%] right-[18%] rounded-full bg-rose-400/[0.30] animate-drift"
        style={{ width: 12, height: 12, animationDelay: "1.2s" }}
      />
      <div
        className="absolute bottom-[4%] right-[25%] rounded-full bg-teal-500/[0.38] animate-float"
        style={{ width: 10, height: 10, animationDelay: "5.5s" }}
      />
      <div
        className="absolute top-[85%] left-[32%] rounded-full bg-blue-500/[0.28] animate-drift"
        style={{ width: 14, height: 14, animationDelay: "2.8s", animationDuration: "11s" }}
      />
      <div
        className="absolute top-[18%] left-[42%] rounded-full bg-teal-400/[0.32] animate-floatSpin"
        style={{ width: 8, height: 8, animationDelay: "6.5s" }}
      />
    </div>
  );
}
