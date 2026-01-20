"use client";

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getCurrentYear, withCurrentYear } from "@/lib/utils";

export default function TermsOfServicePage() {
  const { t } = useLanguage();
  const currentYear = getCurrentYear();
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">{t('legal.badge', 'Legal')}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('legal.termsOfService.title', 'Terms of Service')}
          </h1>
          <p className="text-gray-600">{withCurrentYear(t('legal.lastUpdated', 'Last updated: January {year}'))}</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 mb-8">
            Welcome to VedicStarAstro. By accessing or using our website and services, you agree to be 
            bound by these Terms of Service. Please read them carefully before using our platform.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing and using VedicStarAstro&apos;s website, mobile applications, or any of our services, 
              you acknowledge that you have read, understood, and agree to be bound by these Terms of Service 
              and our Privacy Policy. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Services</h2>
            <p className="text-gray-700 mb-4">VedicStarAstro provides:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Free online tools for generating Kundali (birth charts) and finding Nakshatras.</li>
              <li>Paid consultation services with verified Vedic astrologers via phone, video, or chat.</li>
              <li>Educational content about Vedic astrology, Nakshatras, and related topics.</li>
              <li>Horoscope matching and compatibility analysis services.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Eligibility</h2>
            <p className="text-gray-700">
              You must be at least 18 years of age to use our services. By using our platform, you represent 
              and warrant that you are of legal age and have the legal capacity to enter into this agreement. 
              If you are using our services on behalf of a minor, you accept these terms on their behalf.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Responsibilities</h2>
            <p className="text-gray-700 mb-4">When using our services, you agree to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide accurate and complete birth details for astrological calculations.</li>
              <li>Use our services for personal, non-commercial purposes only.</li>
              <li>Not misuse, copy, or redistribute our content without permission.</li>
              <li>Treat our astrologers and staff with respect during consultations.</li>
              <li>Not use our platform for any illegal or unauthorized purpose.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Consultation Services</h2>
            <p className="text-gray-700 mb-4">For paid consultations:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Consultation fees are displayed before booking and must be paid in advance.</li>
              <li>Consultations are scheduled based on astrologer availability.</li>
              <li>You are responsible for being available at the scheduled time.</li>
              <li>Missed appointments may not be eligible for refunds (see Refund Policy).</li>
              <li>Recording of consultations is prohibited without explicit consent.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment Terms</h2>
            <p className="text-gray-700">
              All payments are processed securely through Razorpay. Prices are displayed in Indian Rupees (INR) 
              and include applicable taxes. We reserve the right to modify pricing at any time, but changes 
              will not affect already-booked consultations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700">
              All content on VedicStarAstro, including text, graphics, logos, images, software, and 
              astrological interpretations, is the property of VedicStarAstro or its content providers 
              and is protected by intellectual property laws. You may not reproduce, distribute, or 
              create derivative works without our written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-gray-700">
              Astrological predictions and consultations are provided for entertainment and guidance purposes 
              only. VedicStarAstro makes no guarantees about the accuracy of predictions or outcomes. Our 
              services should not be considered substitutes for professional medical, legal, financial, or 
              psychological advice. Individual results may vary.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700">
              To the maximum extent permitted by law, VedicStarAstro shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages arising from your use of our services. 
              Our total liability shall not exceed the amount paid by you for the specific service in question.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify and hold harmless VedicStarAstro, its officers, directors, employees, 
              and agents from any claims, damages, losses, or expenses arising from your use of our services 
              or violation of these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Modifications to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective 
              immediately upon posting on our website. Your continued use of our services after changes 
              constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-700">
              These Terms of Service shall be governed by and construed in accordance with the laws of India. 
              Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the 
              courts in Bangalore, Karnataka.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
            <p className="text-gray-700">
              For questions about these Terms of Service, please contact us at:
            </p>
            <ul className="list-none pl-0 text-gray-700 mt-4 space-y-2">
              <li><strong>Email:</strong> contact@vedicstarastro.com</li>
              <li><strong>Phone:</strong> +91 98765 43210</li>
              <li><strong>Address:</strong> Bangalore, Karnataka, India</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
