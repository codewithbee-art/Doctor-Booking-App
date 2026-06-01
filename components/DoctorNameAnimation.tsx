"use client";

import { useState, useEffect } from "react";

const nameSequence = [
  "डा. बिष्णु आचार्य",
  "比什努·阿查里亚博士",
  "د. بيشنو أشاريا",
  "Δρ. Μπίσνου Ατσάρια",
  "డాక్టర్ విష్ణు ఆచార్య",
  "비슈누 아차랴 박사",
  "Доктор Вишну Ачарья",
  "Dr. Bishnu Acharya",
];

export default function DoctorNameAnimation() {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (done) return;

    const timer = setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        const next = index + 1;
        if (next >= nameSequence.length) {
          setIndex(nameSequence.length - 1);
          setDone(true);
          setFade(true);
        } else {
          setIndex(next);
          setFade(true);
        }
      }, 150);
    }, 150);

    return () => clearTimeout(timer);
  }, [index, done]);

  return (
    <span
      className={`inline-block transition-opacity duration-300 ${fade ? "opacity-100" : "opacity-0"}`}
    >
      {nameSequence[index]}
    </span>
  );
}
