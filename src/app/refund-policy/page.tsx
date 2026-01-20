"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getCurrentYear, withCurrentYear } from "@/lib/utils";

export default function RefundPolicyPage() {
  const { t } = useLanguage();
  const currentYear = getCurrentYear();
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">{t('legal.badge', 'Legal')}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('legal.refundPolicy.title', 'Refund Policy')}
          </h1>
          <p className="text-gray-600">{withCurrentYear(t('legal.lastUpdated', 'Last updated: January {year}'))}</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 mb-8">
            At VedicStarAstro, we strive to provide the best astrological consultation experience. 
            This Refund Policy outlines the terms and conditions for refunds and cancellations.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Free Services</h2>
            <p className="text-gray-700">
              Our free tools, including the Kundli Calculator, Nakshatra Finder, and educational content, 
              are provided at no cost and do not require any refund considerations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Consultation Cancellation by User</h2>
            <p className="text-gray-700 mb-4">If you need to cancel a booked consultation:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                <strong>More than 24 hours before:</strong> Full refund (100%) will be processed within 5-7 business days.
              </li>
              <li>
                <strong>12-24 hours before:</strong> 50% refund will be processed within 5-7 business days.
              </li>
              <li>
                <strong>Less than 12 hours before:</strong> No refund will be provided, but you may reschedule once.
              </li>
              <li>
                <strong>No-show:</strong> No refund will be provided for missed appointments without prior notice.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cancellation by Astrologer</h2>
            <p className="text-gray-700">
              If an astrologer cancels or is unavailable for a scheduled consultation, you will receive 
              a full refund or the option to reschedule with the same or another astrologer at no additional cost.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Technical Issues</h2>
            <p className="text-gray-700">
              If a consultation cannot be completed due to technical issues on our end (platform failure, 
              connectivity issues from our servers), you will be offered a full refund or a free rescheduled 
              session. Technical issues on the user&apos;s end (poor internet, device problems) do not qualify 
              for refunds.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Dissatisfaction with Service</h2>
            <p className="text-gray-700 mb-4">
              We take service quality seriously. If you are dissatisfied with a consultation:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Contact us within 24 hours of the consultation with specific feedback.</li>
              <li>Our team will review your complaint and may offer a partial refund or credit for future services.</li>
              <li>Refunds for dissatisfaction are evaluated on a case-by-case basis.</li>
              <li>Disagreement with astrological predictions does not constitute grounds for a refund.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Refund Process</h2>
            <p className="text-gray-700 mb-4">To request a refund:</p>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>Email us at contact@vedicstarastro.com with your booking details.</li>
              <li>Include your order ID, consultation date, and reason for refund request.</li>
              <li>Our team will review and respond within 2-3 business days.</li>
              <li>Approved refunds will be processed to the original payment method within 5-7 business days.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Non-Refundable Items</h2>
            <p className="text-gray-700 mb-4">The following are not eligible for refunds:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Completed consultations where the service was delivered as described.</li>
              <li>Downloaded reports or PDF documents.</li>
              <li>Promotional or discounted services (unless otherwise stated).</li>
              <li>Services where the user provided incorrect birth details.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Rescheduling Policy</h2>
            <p className="text-gray-700">
              You may reschedule a consultation once without penalty if done at least 12 hours before 
              the scheduled time. Additional rescheduling requests may be subject to availability and 
              may incur a rescheduling fee.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
            <p className="text-gray-700">
              For refund requests or questions about this policy, please contact us:
            </p>
            <ul className="list-none pl-0 text-gray-700 mt-4 space-y-2">
              <li><strong>Email:</strong> contact@vedicstarastro.com</li>
              <li><strong>Phone:</strong> +91 98765 43210</li>
              <li><strong>Response Time:</strong> Within 2-3 business days</li>
            </ul>
          </section>

          <div className="mt-8 p-6 bg-amber-50 rounded-lg text-center">
            <p className="text-gray-700 mb-4">
              Have questions about our refund policy? We&apos;re here to help.
            </p>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
