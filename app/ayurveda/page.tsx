import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Understanding Ayurveda | Dr. Bishnu Acharya",
  description:
    "Learn about Ayurveda, the ancient science of life. Discover the five elements, three Doshas (Vata, Pitta, Kapha), and how understanding your constitution can guide your health and wellbeing.",
  keywords: [
    "Ayurveda",
    "Doshas",
    "Vata",
    "Pitta",
    "Kapha",
    "Prakriti",
    "Vikriti",
    "Ayurvedic consultation",
    "Nepal Ayurveda",
    "holistic health",
  ],
  openGraph: {
    title: "Understanding Ayurveda | Dr. Bishnu Acharya",
    description:
      "Discover the wisdom of Ayurveda: the five elements, three Doshas, and your unique constitution.",
    type: "article",
    locale: "en_US",
  },
};

const elements = [
  { name: "Space (Akasha)", description: "The element of expansion and openness" },
  { name: "Air (Vayu)", description: "The element of movement and change" },
  { name: "Fire (Tejas)", description: "The element of transformation and metabolism" },
  { name: "Water (Jala)", description: "The element of flow and cohesion" },
  { name: "Earth (Prithvi)", description: "The element of stability and structure" },
];

const doshas = [
  {
    name: "Vata",
    subtitle: "The Energy of Movement",
    elements: "Air + Space",
    color: "blue",
    description:
      "Vata governs movement and communication in the body. It is connected to breathing, circulation, nerve impulses, movement of thoughts, and the natural flow of energy.",
    balanced: ["Creativity", "Flexibility", "Energy", "Enthusiasm", "Quick thinking"],
    imbalanced: [
      "Anxiety or restlessness",
      "Dry skin",
      "Bloating or gas",
      "Irregular digestion",
      "Difficulty sleeping",
      "Feeling scattered or overwhelmed",
    ],
  },
  {
    name: "Pitta",
    subtitle: "The Energy of Transformation",
    elements: "Fire + Water",
    color: "orange",
    description:
      "Pitta governs digestion, metabolism, body temperature, and transformation. It also relates to focus, understanding, decision-making, and the ability to process both food and information.",
    balanced: ["Strong digestion", "Clear thinking", "Confidence", "Natural leadership", "Good focus"],
    imbalanced: [
      "Irritability",
      "Acid reflux",
      "Inflammation",
      "Skin rashes",
      "Excess heat in the body",
      "Anger or impatience",
    ],
  },
  {
    name: "Kapha",
    subtitle: "The Energy of Structure",
    elements: "Water + Earth",
    color: "green",
    description:
      "Kapha provides structure, strength, stability, and lubrication in the body. It supports tissues, joints, immunity, endurance, and emotional calmness.",
    balanced: ["Calmness", "Strength", "Loyalty", "Patience", "Stable energy", "Healthy immunity"],
    imbalanced: [
      "Weight gain",
      "Lethargy",
      "Congestion",
      "Heaviness",
      "Slow digestion",
      "Attachment or resistance to change",
    ],
  },
];

export default function AyurvedaPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-28 lg:py-32">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/Images/ayurveda/scienceoflife.png"
            alt=""
            fill
            className="object-cover"
            priority
          />
          {/* Dark blue overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/75 to-primary/85"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1 font-body text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            The Science of Life
          </span>
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            The Wisdom of Ayurveda
          </h1>
          <p className="mx-auto max-w-2xl font-body text-lg text-white/90 leading-relaxed md:text-xl">
            Harmony in Mind, Body, and Spirit
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 font-body text-lg text-text-secondary leading-relaxed">
            Ayurveda, translated from Sanskrit as “The Science of Life,” is more than a medical
            system. It is a way of living in harmony with nature, the body, the mind, and the spirit.
          </p>
          <p className="mb-6 font-body text-lg text-text-secondary leading-relaxed">
            Rather than looking only at symptoms, Ayurveda seeks to understand the root cause of
            imbalance. It treats each person as a whole individual, considering lifestyle, diet,
            environment, emotions, digestion, sleep, and natural constitution.
          </p>
          <div className="rounded-xl bg-light-blue p-6 md:p-8">
            <p className="font-body text-lg text-text-primary leading-relaxed">
              <strong>The goal of Ayurveda is not only to treat illness,</strong> but also to support
              balance, prevention, and long-term wellbeing.
            </p>
          </div>
        </div>
      </section>

      {/* Five Elements Section */}
      <section className="bg-bg-light px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
            The Foundation: The Five Elements
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center font-body text-base text-text-secondary leading-relaxed">
            Ayurveda teaches that everything in the universe, including the human body, is made from
            five great elements, known as <strong>Pancha Mahabhuta</strong>.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {elements.map((element, index) => (
              <div
                key={element.name}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-secondary/30 hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="font-body text-lg font-bold text-primary">{index + 1}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{element.name}</h3>
                <p className="font-body text-base text-text-secondary">{element.description}</p>
              </div>
            ))}
            <div className="flex items-center justify-center rounded-xl bg-primary p-6 sm:col-span-2 lg:col-span-3">
              <p className="text-center font-body text-base text-white leading-relaxed">
                When these elements combine in the human body, they form three main life energies
                known as <strong>Doshas</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Doshas Section */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
            Understanding the Three Doshas
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center font-body text-base text-text-secondary leading-relaxed">
            The three Doshas are <strong>Vata, Pitta, and Kapha</strong>. They are the biological
            energies that influence physical health, mental patterns, digestion, movement, structure,
            and emotional tendencies.
          </p>

          {/* Doshas Chart Image */}
          <div className="mb-12 flex justify-center">
            <div className="relative max-w-lg">
              <Image
                src="/images/ayurveda/doshas-chart.png"
                alt="Ayurveda five elements and three doshas chart"
                width={500}
                height={500}
                className="rounded-2xl object-contain shadow-lg"
                priority
              />
            </div>
          </div>

          <div className="mx-auto max-w-3xl rounded-xl bg-light-blue p-6 md:p-8">
            <p className="mb-4 font-body text-base text-text-secondary leading-relaxed">
              Everyone has a unique combination of these three Doshas. This natural constitution is
              known as <strong>Prakriti</strong>. Understanding your Prakriti helps explain why
              different people respond differently to food, weather, stress, sleep, and lifestyle
              habits.
            </p>
            <p className="font-body text-base text-text-secondary leading-relaxed">
              When the Doshas are balanced, the body and mind function well. When they become
              imbalanced, discomfort and illness may begin to appear.
            </p>
          </div>
        </div>
      </section>

      {/* Individual Doshas Detail */}
      <section className="bg-bg-light px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-3xl font-bold md:text-4xl">
            The Three Doshas in Detail
          </h2>

          <div className="space-y-6">
            {doshas.map((dosha) => (
              <div
                key={dosha.name}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-secondary/30 hover:shadow-md md:p-8"
              >
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="mb-1 text-2xl font-bold text-primary">{dosha.name}</h3>
                    <p className="font-body text-base font-semibold text-secondary">
                      {dosha.subtitle}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-secondary/10 px-4 py-2 font-body text-sm font-semibold text-secondary">
                    Elements: {dosha.elements}
                  </span>
                </div>

                <p className="mb-6 font-body text-base text-text-secondary leading-relaxed">
                  {dosha.description}
                </p>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-lg bg-green-50 p-5">
                    <h4 className="mb-3 flex items-center gap-2 font-body text-base font-semibold text-green-800">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      When {dosha.name} is balanced
                    </h4>
                    <ul className="space-y-2">
                      {dosha.balanced.map((trait) => (
                        <li key={trait} className="flex items-start gap-2 font-body text-base text-text-secondary">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" aria-hidden="true" />
                          {trait}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg bg-amber-50 p-5">
                    <h4 className="mb-3 flex items-center gap-2 font-body text-base font-semibold text-amber-800">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      When {dosha.name} is imbalanced
                    </h4>
                    <ul className="space-y-2">
                      {dosha.imbalanced.map((trait) => (
                        <li key={trait} className="flex items-start gap-2 font-body text-base text-text-secondary">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
                          {trait}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Science of Balance */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center text-3xl font-bold md:text-4xl">
            The Science of Balance: From Elements to Energy
          </h2>
          <p className="mb-6 font-body text-base text-text-secondary leading-relaxed">
            In Ayurveda, health is understood through the relationship between the five elements and
            the three Doshas.
          </p>
          <p className="mb-6 font-body text-base text-text-secondary leading-relaxed">
            The Doshas are formed from combinations of the elements:
          </p>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-blue-50 p-5 text-center">
              <h3 className="mb-2 text-xl font-bold text-primary">Vata</h3>
              <p className="mb-2 font-body text-sm text-text-secondary">Space + Air</p>
              <p className="font-body text-base text-text-secondary">The energy of movement and communication.</p>
            </div>
            <div className="rounded-xl bg-orange-50 p-5 text-center">
              <h3 className="mb-2 text-xl font-bold text-primary">Pitta</h3>
              <p className="mb-2 font-body text-sm text-text-secondary">Fire + Water</p>
              <p className="font-body text-base text-text-secondary">The energy of digestion and transformation.</p>
            </div>
            <div className="rounded-xl bg-green-50 p-5 text-center">
              <h3 className="mb-2 text-xl font-bold text-primary">Kapha</h3>
              <p className="mb-2 font-body text-sm text-text-secondary">Water + Earth</p>
              <p className="font-body text-base text-text-secondary">The energy of structure and lubrication.</p>
            </div>
          </div>

          <div className="rounded-xl bg-light-blue p-6 md:p-8">
            <p className="font-body text-base text-text-secondary leading-relaxed">
              Understanding these patterns helps Ayurveda identify why imbalance may appear
              differently in each person. For example, two people may both experience digestive
              discomfort, but the underlying Dosha imbalance may be different.
            </p>
            <p className="mt-4 font-body text-base font-semibold text-primary">
              This is why Ayurvedic care is personalised rather than one-size-fits-all.
            </p>
          </div>
        </div>
      </section>

      {/* Prakriti and Vikriti */}
      <section className="bg-bg-light px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-3xl font-bold md:text-4xl">
            Wellness vs. Illness: Prakriti and Vikriti
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center font-body text-base text-text-secondary leading-relaxed">
            Ayurveda looks at two important states of health: <strong>Prakriti</strong> and{" "}
            <strong>Vikriti</strong>.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
              <h3 className="mb-4 text-xl font-bold text-primary">Prakriti: Your Natural Constitution</h3>
              <p className="mb-6 font-body text-base text-text-secondary leading-relaxed">
                Prakriti is your natural birth constitution. It is your unique “factory setting,”
                shaped by your natural balance of Vata, Pitta, and Kapha.
              </p>
              <h4 className="mb-3 font-body text-base font-semibold text-text-primary">
                When your Doshas are close to your natural Prakriti, you may experience:
              </h4>
              <ul className="space-y-2">
                {["Better vitality", "Mental clarity", "Stronger immunity", "Better digestion", "Emotional balance"].map((item) => (
                  <li key={item} className="flex items-start gap-2 font-body text-base text-text-secondary">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
              <h3 className="mb-4 text-xl font-bold text-primary">Vikriti: Your Current Imbalance</h3>
              <p className="mb-6 font-body text-base text-text-secondary leading-relaxed">
                Vikriti is your current state of imbalance. It can be affected by lifestyle, diet,
                stress, sleep, weather, age, emotions, and daily habits.
              </p>
              <p className="font-body text-base text-text-secondary leading-relaxed">
                When one or more Doshas become aggravated, symptoms may begin to appear. Ayurveda
                aims to understand this imbalance and guide the person back toward balance through
                suitable lifestyle, diet, herbs, routines, and care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Personalised Approach */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center text-3xl font-bold md:text-4xl">
            A Personalised Approach to Wellbeing
          </h2>
          <p className="mb-8 font-body text-base text-text-secondary leading-relaxed">
            Ayurveda recognises that every person is different. What supports one person may not
            suit another. This is why understanding your constitution and current imbalance is
            important.
          </p>

          <div className="rounded-xl bg-light-blue p-6 md:p-8">
            <h3 className="mb-4 text-xl font-semibold text-primary">
              An Ayurvedic consultation may help identify:
            </h3>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                "Your natural constitution",
                "Current signs of imbalance",
                "Lifestyle patterns affecting your health",
                "Diet and routine adjustments",
                "Areas where the body may need support",
                "Preventive steps for long-term wellbeing",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 font-body text-base text-text-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Important Note */}
      <section className="bg-bg-light px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-border bg-white p-6 md:p-8">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
              <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zM8.25 9.75h.008v.008H8.25V9.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 9.75h.008v.008H12V9.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM15.75 9.75h.008v.008H15.75V9.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Important Note
            </h3>
            <p className="mb-3 font-body text-base text-text-secondary leading-relaxed">
              This information is for educational purposes only. It should not replace medical
              advice, diagnosis, or treatment from a qualified healthcare professional.
            </p>
            <p className="font-body text-base text-text-secondary leading-relaxed">
              If you have symptoms, a medical condition, or are taking medication, please consult a
              qualified practitioner before starting any new treatment, herbs, supplements, or major
              lifestyle changes.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Book an Ayurvedic Consultation
          </h2>
          <p className="mb-8 font-body text-lg text-white/80 leading-relaxed">
            If you would like to understand your body constitution, current imbalance, and
            personalised wellness approach, you can book an Ayurvedic consultation with the doctor.
          </p>
          <Link
            href="/booking"
            className="inline-block rounded-lg bg-accent px-10 py-4 font-body text-lg font-semibold text-white shadow-lg hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Book Consultation
          </Link>
        </div>
      </section>
    </main>
  );
}
