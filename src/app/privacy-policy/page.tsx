"use client";

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getCurrentYear, withCurrentYear } from "@/lib/utils";

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();
  const currentYear = getCurrentYear();
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">{t('legal.badge', 'Legal')}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('legal.privacyPolicy.title', 'Privacy Policy')}
          </h1>
          <p className="text-gray-600">{withCurrentYear(t('legal.lastUpdated', 'Last updated: January {year}'))}</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 mb-8">
            At VedicStarAstro, your privacy is our priority. We are committed to safeguarding your personal 
            information and ensuring transparency about how we collect, use, and protect your data. By using 
            our services, you agree to the terms outlined in this Privacy Policy.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              To provide accurate astrological insights and services, we collect:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                <strong>Personal Details:</strong> Name, date of birth, time of birth, and place of birth 
                for preparing and analyzing Kundalis (birth charts).
              </li>
              <li>
                <strong>Contact Information:</strong> Phone number and/or email address if you wish for us 
                to contact you or follow up on your inquiries.
              </li>
              <li>
                <strong>Payment Information:</strong> Payment details processed securely through our payment 
                partner Razorpay for consultation bookings.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you interact with our website, including 
                pages visited and features used.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the information collected to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Generate accurate Kundali charts and provide astrological consultations.</li>
              <li>Respond to inquiries and follow up on services requested by you.</li>
              <li>Process payments for consultation services.</li>
              <li>Send appointment reminders and service-related communications.</li>
              <li>Improve our offerings and ensure a seamless user experience.</li>
              <li>Comply with legal obligations and protect our rights.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
            <p className="text-gray-700 mb-4">We respect your privacy and ensure that:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                <strong>No Selling of Data:</strong> We do not sell your personal information to any third parties.
              </li>
              <li>
                <strong>Service Providers:</strong> We may share data with trusted service providers (payment 
                processors, email services) who assist in operating our platform.
              </li>
              <li>
                <strong>Astrologers:</strong> Your birth details are shared with the astrologer you book a 
                consultation with, solely for providing the service.
              </li>
              <li>
                <strong>Legal Compliance:</strong> We may disclose your data if required by law or to protect 
                our rights, users, or services.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-700">
              We implement robust security measures to protect your personal information from unauthorized 
              access, misuse, or disclosure. This includes encryption of sensitive data, secure server 
              infrastructure, and regular security audits. However, no method of data transmission or 
              storage is completely secure, and we cannot guarantee absolute protection.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies and Tracking</h2>
            <p className="text-gray-700">
              We use cookies and similar technologies to enhance your browsing experience, analyze website 
              traffic, and personalize content. You can control cookie preferences through your browser 
              settings. Essential cookies required for website functionality cannot be disabled.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Access the personal information we hold about you.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>Request deletion of your personal information (subject to legal requirements).</li>
              <li>Opt-out of marketing communications at any time.</li>
              <li>Withdraw consent for data processing where applicable.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-700">
              We retain your personal information for as long as necessary to provide our services and 
              fulfill the purposes outlined in this policy. Birth chart data may be retained to allow 
              you to access your charts in the future. You may request deletion of your data at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children&apos;s Privacy</h2>
            <p className="text-gray-700">
              Our services are not intended for children under 18 years of age. We do not knowingly 
              collect personal information from children. If you believe we have collected information 
              from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Updates to This Policy</h2>
            <p className="text-gray-700">
              We may revise this Privacy Policy from time to time to reflect updates in our practices 
              or legal requirements. Changes will be posted on this page with the updated revision date. 
              We encourage you to review this policy periodically.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
            <p className="text-gray-700">
              For any questions, concerns, or requests regarding this Privacy Policy, please reach out to us at:
            </p>
            <ul className="list-none pl-0 text-gray-700 mt-4 space-y-2">
              <li><strong>Email:</strong> contact@vedicstarastro.com</li>
              <li><strong>Phone:</strong> +91 8884919349</li>
              <li><strong>Address:</strong> Bangalore, Karnataka, India</li>
            </ul>
          </section>

          <p className="text-gray-700 mt-8 p-4 bg-amber-50 rounded-lg">
            We are dedicated to protecting your privacy and providing a secure and trustworthy platform 
            for all your astrological needs.
          </p>
        </div>
      </div>
    </div>
  );
}
