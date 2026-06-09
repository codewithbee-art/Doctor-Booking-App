import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildMetadata } from "@/lib/seo";

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;

  const { data: specialist } = await supabaseAdmin
    .from("visiting_specialists")
    .select("specialist_name, specialization, treatment_type, profile_image_url, bio")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!specialist) {
    return buildMetadata({
      title: "Specialist Not Found",
      description: "The specialist you are looking for is not currently available.",
      path: `/specialists/${id}`,
    });
  }

  const title = specialist.specialization
    ? `${specialist.specialist_name} — ${specialist.specialization}`
    : specialist.specialist_name;

  const description =
    (specialist.bio ? specialist.bio.slice(0, 160) : "") ||
    `Book a consultation with ${specialist.specialist_name}${specialist.specialization ? `, ${specialist.specialization}` : ""}, visiting Dr. Bishnu Acharya's clinic.`;

  return buildMetadata({
    title,
    description,
    image: specialist.profile_image_url || null,
    path: `/specialists/${id}`,
    type: "article",
  });
}

export default function SpecialistDetailLayout({ children }: Props) {
  return children;
}
