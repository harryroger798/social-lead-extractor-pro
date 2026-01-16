import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Disclaimer - VedicStarAstro",
  description:
    "VedicStarAstro Disclaimer. Important information about the nature of astrological services and predictions.",
  keywords: ["disclaimer", "astrology disclaimer", "vedicstarastro disclaimer"],
};

export default function DisclaimerPage() {
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">Legal</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Disclaimer
          </h1>
          <p className="text-gray-600">Last updated: January 2026</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
          <p className="text-gray-700">
            Please read this disclaimer carefully before using our services. By using VedicStarAstro, 
            you acknowledge and accept the terms outlined below.
          </p>
        </div>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nature of Astrological Services</h2>
            <p className="text-gray-700">
              Astrological predictions, consultations, and all services provided by VedicStarAstro are 
              intended for <strong>entertainment and general guidance purposes only</strong>. Vedic astrology 
              (Jyotish Shastra) is an ancient system of knowledge that interprets celestial influences, 
              but it should not be considered as scientific fact or absolute truth.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Professional Advice</h2>
            <p className="text-gray-700 mb-4">
              Our astrological services should <strong>NOT</strong> be considered as substitutes for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Medical Advice:</strong> Always consult qualified healthcare professionals for health-related concerns.</li>
              <li><strong>Legal Advice:</strong> Seek licensed attorneys for legal matters.</li>
              <li><strong>Financial Advice:</strong> Consult certified financial advisors for investment and financial decisions.</li>
              <li><strong>Psychological Advice:</strong> Seek licensed mental health professionals for psychological concerns.</li>
              <li><strong>Professional Counseling:</strong> Our astrologers are not licensed counselors or therapists.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Guarantees</h2>
            <p className="text-gray-700">
              VedicStarAstro makes no guarantees, representations, or warranties regarding the accuracy, 
              reliability, or completeness of any astrological predictions or advice. Individual results 
              may vary significantly. Past predictions do not guarantee future accuracy. The effectiveness 
              of remedies suggested by our astrologers cannot be guaranteed.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Personal Responsibility</h2>
            <p className="text-gray-700">
              You are solely responsible for any decisions you make based on astrological consultations 
              or predictions. VedicStarAstro and its astrologers shall not be held liable for any actions 
              taken or decisions made based on our services. We encourage you to use your own judgment 
              and seek appropriate professional advice when making important life decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Accuracy of Birth Data</h2>
            <p className="text-gray-700">
              The accuracy of astrological calculations depends entirely on the accuracy of birth details 
              provided by the user (date, time, and place of birth). VedicStarAstro is not responsible 
              for inaccurate predictions resulting from incorrect or incomplete birth information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Content</h2>
            <p className="text-gray-700">
              Our website may contain links to third-party websites or content. VedicStarAstro does not 
              endorse or assume responsibility for any third-party content, products, or services. 
              Accessing third-party links is at your own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700">
              To the fullest extent permitted by applicable law, VedicStarAstro, its owners, employees, 
              astrologers, and affiliates shall not be liable for any direct, indirect, incidental, 
              consequential, or punitive damages arising from the use of our services, including but 
              not limited to financial losses, emotional distress, or any other damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cultural and Religious Context</h2>
            <p className="text-gray-700">
              Vedic astrology is rooted in Hindu philosophical and religious traditions. Our services 
              respect all faiths and beliefs. The use of terms like &quot;doshas,&quot; &quot;remedies,&quot; and 
              &quot;planetary influences&quot; are part of traditional astrological terminology and should be 
              understood within their cultural context.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Disclaimer</h2>
            <p className="text-gray-700">
              VedicStarAstro reserves the right to modify this disclaimer at any time. Changes will be 
              effective immediately upon posting. Your continued use of our services constitutes 
              acceptance of any modifications.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700">
              If you have questions about this disclaimer, please contact us:
            </p>
            <ul className="list-none pl-0 text-gray-700 mt-4 space-y-2">
              <li><strong>Email:</strong> contact@vedicstarastro.com</li>
              <li><strong>Phone:</strong> +91 98765 43210</li>
            </ul>
          </section>

          <div className="mt-8 p-6 bg-gray-100 rounded-lg">
            <p className="text-gray-700 text-center font-medium">
              By using VedicStarAstro&apos;s services, you acknowledge that you have read, understood, 
              and agree to this disclaimer.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
