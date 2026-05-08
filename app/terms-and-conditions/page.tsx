import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | Laxmi Narayan Ayurveda Pharma",
  description:
    "Terms and Conditions for Laxmi Narayan Ayurveda Pharma. Read the rules for using our website, appointment booking system, medicine shop, and related online services.",
  keywords: [
    "Terms and Conditions",
    "Terms of Use",
    "Legal Terms",
    "Laxmi Narayan Ayurveda Pharma",
  ],
};

const clinicInfo = {
  name: "Laxmi Narayan Ayurveda Pharma",
  email: "dr.bishnuacharya.np@gmail.com",
  phone: "+977-9868617515",
  address: "New Baneshwor, Kathmandu",
};

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-bg-light px-4 py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            Terms and Conditions
          </h1>
          <p className="font-body text-base text-text-secondary">
            Last updated: 07/05/2026
          </p>
        </div>
      </section>

      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-4xl font-body text-text-secondary">
          <p className="mb-6 text-base leading-relaxed">
            These Terms and Conditions explain the rules for using the{" "}
            {clinicInfo.name} website, appointment booking system, medicine shop,
            educational content, and related online services.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            By using this website, you agree to these Terms and Conditions. If you
            do not agree, please do not use the website.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">1. About This Website</h2>
          <p className="mb-4 text-base leading-relaxed">
            This website is operated by {clinicInfo.name}.
          </p>
          <p className="mb-4 text-base leading-relaxed">The website provides:</p>
          <ul className="mb-10 ml-6 list-disc space-y-2 text-base">
            <li>Clinic information</li>
            <li>Ayurvedic and health education content</li>
            <li>Online appointment booking</li>
            <li>Visiting specialist information</li>
            <li>Patient communication support</li>
            <li>Medicine shop services, where available</li>
            <li>Blog and health-related information</li>
          </ul>

          <h2 className="mb-4 text-xl font-bold text-primary">
            2. Medical Disclaimer
          </h2>
          <p className="mb-6 text-base leading-relaxed">
            The information on this website is for general education and awareness
            only.
          </p>
          <p className="mb-6 text-base leading-relaxed">
            It should not be treated as a substitute for medical advice, diagnosis,
            or treatment from a qualified healthcare professional.
          </p>
          <p className="mb-6 text-base leading-relaxed">
            You should consult a qualified doctor or healthcare practitioner before
            starting any treatment, medicine, herb, supplement, or major lifestyle
            change.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            If you have a medical emergency, contact emergency services or visit the
            nearest hospital immediately.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            3. Ayurvedic Information
          </h2>
          <p className="mb-6 text-base leading-relaxed">
            Ayurvedic content on this website is provided for educational purposes.
            Ayurveda focuses on personalised care, constitution, lifestyle, diet, and
            balance.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            Results may vary from person to person. The suitability of any treatment
            depends on individual health condition, medical history, lifestyle,
            current symptoms, and professional assessment.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            4. Appointment Booking
          </h2>
          <p className="mb-4 text-base leading-relaxed">
            When you book an appointment through this website:
          </p>
          <ul className="mb-6 ml-6 list-disc space-y-2 text-base">
            <li>You must provide accurate information</li>
            <li>You must choose an available date and time</li>
            <li>You should provide a correct phone number so the clinic can contact you</li>
            <li>Your appointment may remain pending until confirmed by the clinic</li>
            <li>
              The clinic may confirm, reschedule, cancel, or update appointment status
              where necessary
            </li>
          </ul>
          <p className="mb-10 text-base leading-relaxed">
            Submitting an appointment request does not guarantee that the appointment
            is confirmed until the clinic accepts or confirms it.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            5. Patient Information
          </h2>
          <p className="mb-6 text-base leading-relaxed">
            You agree to provide truthful and accurate information when booking an
            appointment or using clinic services.
          </p>
          <p className="mb-6 text-base leading-relaxed">
            Incorrect information may affect appointment handling, patient records,
            treatment history, and communication.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            The clinic may maintain patient records for healthcare, follow-up,
            treatment history, and clinic administration.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            6. Rescheduling and Cancellation
          </h2>
          <p className="mb-6 text-base leading-relaxed">
            Appointments may be rescheduled or cancelled by the patient or clinic
            depending on availability.
          </p>
          <p className="mb-6 text-base leading-relaxed">
            The clinic may reschedule appointments due to doctor unavailability,
            emergencies, holidays, technical issues, or other operational reasons.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            Where possible, the clinic will try to inform patients using the contact
            details provided.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            7. Online Forms
          </h2>
          <p className="mb-6 text-base leading-relaxed">
            Online forms should be used only for appointment requests, basic patient
            details, and non-emergency communication.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            Do not use online forms for emergencies or urgent medical conditions.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">8. Medicine Shop</h2>
          <p className="mb-4 text-base leading-relaxed">
            If the website includes a medicine shop:
          </p>
          <ul className="mb-6 ml-6 list-disc space-y-2 text-base">
            <li>Product availability may change without notice</li>
            <li>Prices may change without notice</li>
            <li>Some medicines may require prescription or doctor approval</li>
            <li>
              Orders may be accepted, rejected, delayed, or cancelled depending on
              stock, prescription requirements, delivery availability, or safety concerns
            </li>
            <li>The clinic may contact you before processing certain orders</li>
          </ul>
          <p className="mb-10 text-base leading-relaxed">
            You should use medicines only as directed by a qualified healthcare
            professional.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">9. Payments</h2>
          <p className="mb-6 text-base leading-relaxed">
            If online payment is available, payments may be processed through
            third-party payment providers.
          </p>
          <p className="mb-6 text-base leading-relaxed">
            The clinic is not responsible for delays, failures, or errors caused by
            third-party payment systems, banks, wallets, or card providers.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            Refunds, if applicable, will depend on clinic policy, order status,
            service status, and payment provider rules.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">10. Website Content</h2>
          <p className="mb-6 text-base leading-relaxed">
            All text, design, images, branding, and content on this website are
            provided for clinic communication and patient education.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            You may not copy, reproduce, republish, or misuse website content without
            permission, except for personal and non-commercial reference.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            11. User Responsibilities
          </h2>
          <p className="mb-4 text-base leading-relaxed">You agree not to:</p>
          <ul className="mb-10 ml-6 list-disc space-y-2 text-base">
            <li>Provide false information</li>
            <li>Misuse appointment forms</li>
            <li>Attempt unauthorised access to admin areas</li>
            <li>Interfere with website security</li>
            <li>Use the website for unlawful purposes</li>
            <li>Upload harmful code, spam, or abusive content</li>
          </ul>

          <h2 className="mb-4 text-xl font-bold text-primary">
            12. Admin and Patient Records
          </h2>
          <p className="mb-6 text-base leading-relaxed">
            Admin areas are restricted to authorised clinic users only.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            Patients and visitors must not attempt to access protected admin pages,
            patient records, booking management tools, or internal clinic data.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            13. Availability of the Website
          </h2>
          <p className="mb-6 text-base leading-relaxed">
            We aim to keep the website available and working properly, but we do not
            guarantee uninterrupted access.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            The website may be unavailable due to maintenance, hosting issues,
            technical problems, internet outages, updates, or third-party service
            failures.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            14. Limitation of Liability
          </h2>
          <p className="mb-4 text-base leading-relaxed">
            To the maximum extent allowed by law, {clinicInfo.name} is not responsible
            for losses or damages caused by:
          </p>
          <ul className="mb-6 ml-6 list-disc space-y-2 text-base">
            <li>Use or inability to use the website</li>
            <li>Incorrect information submitted by users</li>
            <li>Delays in appointment confirmation</li>
            <li>Technical errors</li>
            <li>Third-party service failures</li>
            <li>Misuse of health information without professional consultation</li>
          </ul>
          <p className="mb-10 text-base leading-relaxed">
            This does not limit any responsibility that cannot legally be excluded.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            15. Third-Party Services
          </h2>
          <p className="mb-6 text-base leading-relaxed">
            This website may use third-party services for hosting, database storage,
            email, payments, analytics, maps, or other functionality.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            Those services may have their own terms and privacy policies.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">
            16. Changes to These Terms
          </h2>
          <p className="mb-6 text-base leading-relaxed">
            We may update these Terms and Conditions from time to time. Updated terms
            will be posted on this page with a new &ldquo;Last updated&rdquo; date.
          </p>
          <p className="mb-10 text-base leading-relaxed">
            Continued use of the website means you accept the updated terms.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">17. Governing Law</h2>
          <p className="mb-10 text-base leading-relaxed">
            These Terms are intended to be interpreted under the applicable laws of
            Nepal.
          </p>

          <h2 className="mb-4 text-xl font-bold text-primary">18. Contact Us</h2>
          <p className="mb-4 text-base leading-relaxed">
            For questions about these Terms and Conditions, contact:
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
