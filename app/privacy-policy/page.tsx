import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Laxmi Narayan Ayurveda Pharma",
  description:
    "Privacy Policy for Laxmi Narayan Ayurveda Pharma. Learn how we collect, use, and protect your personal information when you use our website, book appointments, or use our services.",
  keywords: [
    "Privacy Policy",
    "Data Protection",
    "Personal Information",
    "Laxmi Narayan Ayurveda Pharma",
  ],
};

const clinicInfo = {
  name: "Laxmi Narayan Ayurveda Pharma",
  email: "dr.bishnuacharya.np@gmail.com",
  phone: "+977-9868617515",
  address: "New Baneshwor, Kathmandu",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-bg-light px-4 py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            Privacy Policy
          </h1>
          <p className="font-body text-base text-text-secondary">
            Last updated: 07/05/2026
          </p>
        </div>
      </section>

      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-4xl font-body text-text-secondary">
          <p className="mb-6 text-base leading-relaxed">
            This Privacy Policy explains how {clinicInfo.name} collects, uses,
            stores, and protects personal information when you use our website,
            book an appointment, contact us, or use our online services.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            By using this website, you agree to the practices described in this
            Privacy Policy.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">1. Who We Are</h2>
          <p className="mb-6 text-base leading-relaxed">
            {clinicInfo.name} is a medical practice providing healthcare
            services, including Ayurvedic consultation, appointment booking,
            patient care, and health education.
          </p>
          <p className="mb-6 text-base leading-relaxed">
            If you have any questions about this Privacy Policy, you can contact
            us at:
          </p>
          <ul className="mb-10 ml-6 list-disc space-y-2 text-base">
            <li>
              <strong>Clinic Name:</strong> {clinicInfo.name}
            </li>
            <li>
              <strong>Email:</strong> {clinicInfo.email}
            </li>
            <li>
              <strong>Phone:</strong> {clinicInfo.phone}
            </li>
            <li>
              <strong>Address:</strong> {clinicInfo.address}
            </li>
          </ul>

          <h2 className="mb-4 text-xl font-bold text-primary">
            2. Information We Collect
          </h2>
          <p className="mb-6 text-base leading-relaxed">
            We may collect the following information when you use our website or
            services:
          </p>

          <h3 className="mb-3 text-lg font-semibold text-text-primary">
            Appointment Information
          </h3>
          <ul className="mb-6 ml-6 list-disc space-y-2 text-base">
            <li>Patient name</li>
            <li>Phone number</li>
            <li>Email address, if provided</li>
            <li>Appointment date and time</li>
            <li>Reason for visit or health concern</li>
            <li>Booking status</li>
          </ul>

          <h3 className="mb-3 text-lg font-semibold text-text-primary">
            Patient Record Information
          </h3>
          <p className="mb-4 text-base leading-relaxed">
            If you visit the clinic or receive treatment, we may store patient
            care information such as:
          </p>
          <ul className="mb-6 ml-6 list-disc space-y-2 text-base">
            <li>Visit notes</li>
            <li>Health concerns shared with the doctor</li>
            <li>Prescribed medicines</li>
            <li>Treatment duration</li>
            <li>Follow-up instructions</li>
            <li>Patient history</li>
            <li>Identity or contact notes where needed for safe record management</li>
          </ul>

          <h3 className="mb-3 text-lg font-semibold text-text-primary">
            Shop and Order Information
          </h3>
          <p className="mb-4 text-base leading-relaxed">
            If you use the medicine shop, we may collect:
          </p>
          <ul className="mb-6 ml-6 list-disc space-y-2 text-base">
            <li>Customer name</li>
            <li>Phone number</li>
            <li>Email address</li>
            <li>Delivery address</li>
            <li>Order details</li>
            <li>Payment status</li>
          </ul>

          <h3 className="mb-3 text-lg font-semibold text-text-primary">
            Technical Information
          </h3>
          <p className="mb-4 text-base leading-relaxed">
            We may collect basic technical information such as:
          </p>
          <ul className="mb-10 ml-6 list-disc space-y-2 text-base">
            <li>Browser type</li>
            <li>Device type</li>
            <li>Pages visited</li>
            <li>Date and time of use</li>
            <li>General usage data</li>
          </ul>
          <p className="mb-10 text-base leading-relaxed">
            This helps us improve website performance and user experience.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            3. How We Use Your Information
          </h2>
          <p className="mb-4 text-base leading-relaxed">
            We use your information to:
          </p>
          <ul className="mb-10 ml-6 list-disc space-y-2 text-base">
            <li>Book and manage appointments</li>
            <li>Contact you about your appointment</li>
            <li>Maintain patient records</li>
            <li>Support doctor consultation and follow-up care</li>
            <li>Manage medicine orders</li>
            <li>Improve our website and services</li>
            <li>Respond to your questions or requests</li>
            <li>Keep clinic records accurate and secure</li>
            <li>Meet legal, regulatory, or professional obligations where applicable</li>
          </ul>

          <h2 className="mb-4 text-xl font-bold text-primary">
            4. Health Information
          </h2>
          <p className="mb-6 text-base leading-relaxed">
            Health-related information is sensitive. We handle patient information
            carefully and only use it for healthcare, appointment management,
            record keeping, and related clinic services.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            We do not sell patient health information.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            5. Sharing Your Information
          </h2>
          <p className="mb-6 text-base leading-relaxed">
            We do not sell your personal information.
          </p>
          <p className="mb-4 text-base leading-relaxed">
            We may share limited information only when necessary, such as:
          </p>
          <ul className="mb-6 ml-6 list-disc space-y-2 text-base">
            <li>With the doctor or authorised clinic staff</li>
            <li>
              With service providers who help operate the website, database, email,
              hosting, or payment systems
            </li>
            <li>
              When required by law, regulation, court order, or lawful authority
            </li>
            <li>To protect patient safety, clinic security, or legal rights</li>
          </ul>
          <p className="mb-10 text-base leading-relaxed">
            Any service provider used for website hosting, database storage, email,
            or payment processing should only process data for the purpose of
            supporting clinic services.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            6. Data Storage and Security
          </h2>
          <p className="mb-6 text-base leading-relaxed">
            We use reasonable technical and organisational measures to protect your
            information from unauthorised access, misuse, loss, or disclosure.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            However, no online system can be guaranteed to be completely secure.
            Patients should avoid submitting emergency or highly sensitive
            information through online forms.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            7. Appointment Forms and Online Communication
          </h2>
          <p className="mb-6 text-base leading-relaxed">
            Our appointment forms are designed for booking and basic communication
            only. They should not be used for emergencies.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            If you have a medical emergency, please contact emergency services or
            visit the nearest hospital immediately.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            8. Cookies and Analytics
          </h2>
          <p className="mb-6 text-base leading-relaxed">
            Our website may use cookies or similar technologies to improve user
            experience, remember preferences, measure website performance, and
            understand how visitors use the site.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            You can control cookies through your browser settings.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            9. Payment Information
          </h2>
          <p className="mb-6 text-base leading-relaxed">
            If online payment is enabled, payments may be processed by third-party
            payment providers. We do not store full card details on our website.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            Payment providers may process your information according to their own
            privacy and security policies.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            10. Data Retention
          </h2>
          <p className="mb-6 text-base leading-relaxed">
            We keep personal and patient information only as long as necessary for
            clinic services, patient care, legal obligations, accounting, dispute
            resolution, and record keeping.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            Medical and appointment records may be retained for longer periods
            where required for professional or legal reasons.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">11. Your Rights</h2>
          <p className="mb-4 text-base leading-relaxed">
            Depending on applicable law, you may request to:
          </p>
          <ul className="mb-6 ml-6 list-disc space-y-2 text-base">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Update your contact details</li>
            <li>Request deletion of certain information where legally allowed</li>
            <li>Ask how your information is used</li>
          </ul>
          <p className="mb-10 text-base leading-relaxed">
            Some medical or legal records may need to be retained even if deletion
            is requested.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            To make a request, contact us using the details above.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            12. Children&apos;s Information
          </h2>
          <p className="mb-10 text-base leading-relaxed">
            If a child or minor uses our services, a parent or guardian should
            provide consent and manage appointment communication where appropriate.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            13. Third-Party Links
          </h2>
          <p className="mb-10 text-base leading-relaxed">
            Our website may contain links to third-party websites or services. We are
            not responsible for the privacy practices, content, or security of those
            third-party websites.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            14. Changes to This Privacy Policy
          </h2>
          <p className="mb-10 text-base leading-relaxed">
            We may update this Privacy Policy from time to time. The updated version
            will be posted on this page with a new &ldquo;Last updated&rdquo; date.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">15. Contact Us</h2>
          <p className="mb-4 text-base leading-relaxed">
            For questions about this Privacy Policy or your personal information,
            contact:
          </p>
          <ul className="ml-6 list-disc space-y-2 text-base">
            <li>
              <strong>Clinic Name:</strong> {clinicInfo.name}
            </li>
            <li>
              <strong>Email:</strong> {clinicInfo.email}
            </li>
            <li>
              <strong>Phone:</strong> {clinicInfo.phone}
            </li>
            <li>
              <strong>Address:</strong> {clinicInfo.address}
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
