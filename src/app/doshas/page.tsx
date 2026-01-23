"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle, Moon, Orbit, Users } from "lucide-react";

const doshasList = [
  {
    key: "mangalDosh",
    href: "/doshas/mangal-dosh",
    icon: AlertTriangle,
    color: "red",
  },
  {
    key: "kaalSarpDosh",
    href: "/doshas/kaal-sarp-dosh",
    icon: Orbit,
    color: "purple",
  },
  {
    key: "sadeSati",
    href: "/doshas/sade-sati",
    icon: Moon,
    color: "blue",
  },
  {
    key: "pitraDosh",
    href: "/doshas/pitra-dosh",
    icon: Users,
    color: "amber",
  },
];

export default function DoshasIndexPage() {
  const { t } = useLanguage();

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-red-100 text-red-800">
            {t('doshas.index.badge', 'Vedic Astrology')}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('doshas.index.title', 'Doshas in Vedic Astrology')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('doshas.index.subtitle', 'Learn about various doshas in your birth chart, their effects on life, and effective remedies to mitigate their negative influences.')}
          </p>
        </div>

        <Card className="border-amber-200 bg-amber-50 mb-12">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('doshas.index.whatAreDoshas', 'What are Doshas?')}
            </h2>
            <p className="text-gray-700">
              {t('doshas.index.description', 'In Vedic astrology, doshas are unfavorable planetary combinations or placements in a birth chart that can create challenges in specific areas of life. Understanding your doshas helps you take appropriate remedial measures and make informed decisions about marriage, career, and other important life events.')}
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {doshasList.map((dosha) => {
            const Icon = dosha.icon;
            const colorClasses = {
              red: "border-red-200 hover:border-red-300",
              purple: "border-purple-200 hover:border-purple-300",
              blue: "border-blue-200 hover:border-blue-300",
              amber: "border-amber-200 hover:border-amber-300",
            };
            const iconColorClasses = {
              red: "text-red-600",
              purple: "text-purple-600",
              blue: "text-blue-600",
              amber: "text-amber-600",
            };
            const badgeClasses = {
              red: "bg-red-100 text-red-800",
              purple: "bg-purple-100 text-purple-800",
              blue: "bg-blue-100 text-blue-800",
              amber: "bg-amber-100 text-amber-800",
            };

            return (
              <Card 
                key={dosha.key} 
                className={`${colorClasses[dosha.color as keyof typeof colorClasses]} transition-all hover:shadow-lg`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-100`}>
                      <Icon className={`w-6 h-6 ${iconColorClasses[dosha.color as keyof typeof iconColorClasses]}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {t(`doshas.index.${dosha.key}.title`, dosha.key)}
                      </CardTitle>
                      <Badge className={badgeClasses[dosha.color as keyof typeof badgeClasses]}>
                        {t(`doshas.index.${dosha.key}.badge`, 'Dosha')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-4">
                    {t(`doshas.index.${dosha.key}.description`, '')}
                  </CardDescription>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={dosha.href}>
                      {t('doshas.index.learnMore', 'Learn More')} <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('doshas.index.checkYourChart', 'Check Your Birth Chart for Doshas')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t('doshas.index.checkDescription', 'Generate your free Kundli to identify any doshas in your birth chart and get personalized remedies.')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/tools/kundli-calculator">
                  {t('doshas.index.generateKundli', 'Generate Free Kundli')}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/tools/mangal-dosh-calculator">
                  {t('doshas.index.checkMangalDosh', 'Check Mangal Dosh')}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/tools/sade-sati-calculator">
                  {t('doshas.index.checkSadeSati', 'Check Sade Sati')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
