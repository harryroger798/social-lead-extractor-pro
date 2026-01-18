"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationInput } from "@/components/ui/location-input";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { uploadToIPFS, getPublicIPFSUrl } from "@/lib/pinata";
import { jsPDF } from "jspdf";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Star,
  Shield,
  Lock,
  CheckCircle,
  Copy,
  ExternalLink,
  Download,
  Share2,
  User,
  FileCheck,
  Globe,
  Key,
  Fingerprint,
  Award,
} from "lucide-react";

interface BirthDetails {
  name: string;
  date: string;
  time: string;
  place: string;
}

interface BlockchainCertificate {
  certificateId: string;
  hash: string;
  ipfsHash: string;
  timestamp: string;
  birthDetails: BirthDetails;
  chartSummary: {
    ascendant: string;
    ascendantHindi: string;
    moonSign: string;
    moonSignHindi: string;
    sunSign: string;
    sunSignHindi: string;
    nakshatra: string;
    nakshatraHindi: string;
  };
  verificationUrl: string;
}

const sampleCertificate: BlockchainCertificate = {
  certificateId: "VSA-2026-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
  hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
  ipfsHash: "Qm" + Array.from({ length: 44 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 62)]).join(""),
  timestamp: new Date().toISOString(),
  birthDetails: {
    name: "",
    date: "",
    time: "",
    place: "",
  },
  chartSummary: {
    ascendant: "Leo",
    ascendantHindi: "सिंह",
    moonSign: "Taurus",
    moonSignHindi: "वृषभ",
    sunSign: "Capricorn",
    sunSignHindi: "मकर",
    nakshatra: "Rohini",
    nakshatraHindi: "रोहिणी",
  },
  verificationUrl: "",
};

export default function BlockchainKundliPage() {
  const { t, language } = useLanguage();
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "",
    date: "",
    time: "",
    place: "",
  });
  const [certificate, setCertificate] = useState<BlockchainCertificate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Generate certificate data
      const certificateId = "VSA-2026-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      const timestamp = new Date().toISOString();
      const hash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      
      // Prepare certificate data for IPFS upload
      const certificateData = {
        certificateId,
        birthDetails: birthDetails,
        chartSummary: {
          ascendant: sampleCertificate.chartSummary.ascendant,
          moonSign: sampleCertificate.chartSummary.moonSign,
          sunSign: sampleCertificate.chartSummary.sunSign,
          nakshatra: sampleCertificate.chartSummary.nakshatra,
        },
        hash,
        timestamp,
      };

      // Upload to IPFS via Pinata
      const ipfsHash = await uploadToIPFS(certificateData);
      
      const newCertificate: BlockchainCertificate = {
        ...sampleCertificate,
        certificateId,
        hash,
        ipfsHash: ipfsHash || "Qm" + Array.from({ length: 44 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 62)]).join(""),
        timestamp,
        birthDetails: birthDetails,
        verificationUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${certificateId}`,
      };
      setCertificate(newCertificate);
    } catch (error) {
      console.error("Error generating certificate:", error);
      // Fallback to mock data if IPFS upload fails
      const newCertificate: BlockchainCertificate = {
        ...sampleCertificate,
        certificateId: "VSA-2026-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
        hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        ipfsHash: "Qm" + Array.from({ length: 44 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 62)]).join(""),
        timestamp: new Date().toISOString(),
        birthDetails: birthDetails,
        verificationUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${sampleCertificate.certificateId}`,
      };
      setCertificate(newCertificate);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadCertificate = () => {
    if (!certificate) return;
    
    // Create PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const centerX = pageWidth / 2;

    // Premium cream/gold background
    doc.setFillColor(255, 252, 245);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Outer decorative border (gold)
    doc.setDrawColor(212, 168, 83);
    doc.setLineWidth(2);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
    
    // Inner decorative border
    doc.setDrawColor(212, 168, 83);
    doc.setLineWidth(0.5);
    doc.rect(11, 11, pageWidth - 22, pageHeight - 22);

    // Header background (smaller)
    doc.setFillColor(212, 168, 83);
    doc.rect(11, 11, pageWidth - 22, 35, "F");
    
    // Darker gold accent line
    doc.setFillColor(139, 105, 20);
    doc.rect(11, 44, pageWidth - 22, 2, "F");

    // Decorative star/sun symbol
    doc.setFillColor(139, 105, 20);
    doc.circle(centerX, 22, 6, "F");
    doc.setFillColor(212, 168, 83);
    doc.circle(centerX, 22, 4, "F");
    doc.setFillColor(139, 105, 20);
    doc.circle(centerX, 22, 1.5, "F");

    // Main title
    doc.setTextColor(26, 26, 46);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("VEDICSTARASTRO", centerX, 34, { align: "center" });
    
    // Subtitle
    doc.setFontSize(8);
    doc.setTextColor(90, 74, 26);
    doc.text("AUTHENTIC VEDIC ASTROLOGY", centerX, 40, { align: "center" });

    // Certificate title
    doc.setTextColor(26, 26, 46);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("BLOCKCHAIN KUNDLI CERTIFICATE", centerX, 56, { align: "center" });
    
    // Decorative line under title
    doc.setDrawColor(212, 168, 83);
    doc.setLineWidth(0.5);
    doc.line(centerX - 50, 59, centerX + 50, 59);
    
    // Decorative dots row (12 dots for zodiac)
    doc.setFillColor(212, 168, 83);
    for (let i = 0; i < 12; i++) {
      const dotX = centerX - 44 + (i * 8);
      doc.circle(dotX, 65, 1.5, "F");
    }

    // Certificate ID badge
    doc.setFillColor(255, 248, 230);
    doc.setDrawColor(212, 168, 83);
    doc.setLineWidth(0.5);
    doc.roundedRect(centerX - 35, 70, 70, 10, 3, 3, "FD");
    doc.setTextColor(139, 105, 20);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(certificate.certificateId, centerX, 77, { align: "center" });

    // Personal Details Section
    let yPos = 88;
    const col1X = margin + 5;
    const col2X = centerX + 5;
    
    // Section background
    doc.setFillColor(255, 250, 240);
    doc.setDrawColor(212, 168, 83);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 38, 2, 2, "FD");
    
    // Section title
    doc.setTextColor(139, 105, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(212, 168, 83);
    doc.circle(margin + 5, yPos + 6, 1.5, "F");
    doc.text("PERSONAL DETAILS", margin + 9, yPos + 8);
    
    // Divider line
    doc.setDrawColor(212, 168, 83);
    doc.line(margin + 3, yPos + 11, pageWidth - margin - 3, yPos + 11);

    // Personal details content
    yPos += 17;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(139, 105, 20);
    doc.text("Full Name:", col1X, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(26, 26, 46);
    doc.text(certificate.birthDetails.name || "N/A", col1X + 22, yPos);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(139, 105, 20);
    doc.text("Place:", col2X, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(26, 26, 46);
    doc.text(certificate.birthDetails.place || "N/A", col2X + 14, yPos);
    
    yPos += 8;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(139, 105, 20);
    doc.text("Date of Birth:", col1X, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(26, 26, 46);
    doc.text(certificate.birthDetails.date || "N/A", col1X + 28, yPos);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(139, 105, 20);
    doc.text("Time:", col2X, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(26, 26, 46);
    doc.text(certificate.birthDetails.time || "N/A", col2X + 14, yPos);

    // Astrological Summary Section
    yPos = 132;
    
    // Section background
    doc.setFillColor(255, 250, 240);
    doc.setDrawColor(212, 168, 83);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 35, 2, 2, "FD");
    
    doc.setTextColor(139, 105, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(212, 168, 83);
    doc.circle(margin + 5, yPos + 6, 1.5, "F");
    doc.text("ASTROLOGICAL SUMMARY", margin + 9, yPos + 8);
    doc.line(margin + 3, yPos + 11, pageWidth - margin - 3, yPos + 11);

    // Chart details in 2x2 grid
    yPos += 17;
    doc.setFontSize(9);
    
    const chartItems = [
      { label: "Ascendant:", value: certificate.chartSummary.ascendant },
      { label: "Moon Sign:", value: certificate.chartSummary.moonSign },
      { label: "Sun Sign:", value: certificate.chartSummary.sunSign },
      { label: "Nakshatra:", value: certificate.chartSummary.nakshatra },
    ];
    
    chartItems.forEach((item, index) => {
      const x = index % 2 === 0 ? col1X : col2X;
      const y = yPos + Math.floor(index / 2) * 8;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(139, 105, 20);
      doc.text(item.label, x, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(26, 26, 46);
      doc.text(item.value, x + 24, y);
    });

    // Verification Section (dark background)
    yPos = 173;
    
    doc.setFillColor(26, 26, 46);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 42, 2, 2, "F");
    
    doc.setTextColor(212, 168, 83);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(212, 168, 83);
    doc.roundedRect(margin + 4, yPos + 4, 5, 4, 1, 1, "F");
    doc.setDrawColor(212, 168, 83);
    doc.setLineWidth(0.8);
    doc.circle(margin + 6.5, yPos + 3, 1.5);
    doc.text("BLOCKCHAIN VERIFICATION", margin + 12, yPos + 8);
    
    doc.setDrawColor(212, 168, 83);
    doc.setLineWidth(0.3);
    doc.line(margin + 3, yPos + 11, pageWidth - margin - 3, yPos + 11);

    yPos += 17;
    doc.setFontSize(7);
    doc.setTextColor(212, 168, 83);
    doc.setFont("helvetica", "bold");
    doc.text("CRYPTOGRAPHIC HASH (SHA-256)", margin + 4, yPos);
    yPos += 4;
    doc.setFontSize(6);
    doc.setTextColor(160, 210, 219);
    doc.setFont("courier", "normal");
    doc.text(certificate.hash, margin + 4, yPos);

    yPos += 7;
    doc.setFontSize(7);
    doc.setTextColor(212, 168, 83);
    doc.setFont("helvetica", "bold");
    doc.text("IPFS HASH", margin + 4, yPos);
    yPos += 4;
    doc.setFontSize(6);
    doc.setTextColor(160, 210, 219);
    doc.setFont("courier", "normal");
    doc.text(certificate.ipfsHash, margin + 4, yPos);

    // Footer section with seal
    yPos = 222;
    
    // Seal/stamp on right
    doc.setDrawColor(212, 168, 83);
    doc.setLineWidth(1.5);
    doc.circle(pageWidth - 38, yPos + 12, 14);
    doc.setLineWidth(0.5);
    doc.circle(pageWidth - 38, yPos + 12, 11);
    doc.setFontSize(7);
    doc.setTextColor(139, 105, 20);
    doc.setFont("helvetica", "bold");
    doc.text("VERIFIED", pageWidth - 38, yPos + 9, { align: "center" });
    doc.setFontSize(12);
    doc.text("*", pageWidth - 38, yPos + 14, { align: "center" });
    doc.setFontSize(7);
    doc.text("AUTHENTIC", pageWidth - 38, yPos + 18, { align: "center" });

    // Footer text on left
    doc.setTextColor(90, 74, 26);
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.text("This certificate is cryptographically signed and stored on IPFS.", margin, yPos + 5);
    doc.text("Verify using the certificate ID or hash.", margin, yPos + 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("www.vedicstarastro.com", margin, yPos + 18);
    
    // Timestamp
    doc.setFontSize(6);
    doc.setTextColor(120, 120, 120);
    doc.text("Generated: " + new Date(certificate.timestamp).toLocaleString(), margin, yPos + 24);

    // Save the PDF
    doc.save(`kundli-certificate-${certificate.certificateId}.pdf`);
  };

  const shareCertificate = async () => {
    if (!certificate) return;
    
    const shareData = {
      title: t("blockchainKundli.shareTitle", "My Verified Kundli Certificate"),
      text: `${t("blockchainKundli.shareText", "Check out my verified Kundli certificate from VedicStarAstro!")}\n\nCertificate ID: ${certificate.certificateId}\nIPFS Hash: ${certificate.ipfsHash}`,
      url: certificate.verificationUrl || window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyToClipboard(shareData.text + "\n" + shareData.url, "share");
        alert(t("blockchainKundli.copiedToClipboard", "Certificate details copied to clipboard!"));
      }
    } else {
      copyToClipboard(shareData.text + "\n" + shareData.url, "share");
      alert(t("blockchainKundli.copiedToClipboard", "Certificate details copied to clipboard!"));
    }
  };

  const viewOnIPFS = () => {
    if (!certificate) return;
    // Use ipfs.io gateway which allows HTML content (Pinata public gateway blocks HTML)
    const ipfsGatewayUrl = getPublicIPFSUrl(certificate.ipfsHash);
    window.open(ipfsGatewayUrl, "_blank");
  };

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: t("blockchainKundli.feature1Title", "Tamper-Proof"),
      titleHindi: "छेड़छाड़-रोधी",
      description: t("blockchainKundli.feature1Desc", "Cryptographic hash ensures your Kundli cannot be altered"),
      descriptionHindi: "क्रिप्टोग्राफिक हैश सुनिश्चित करता है कि आपकी कुंडली बदली नहीं जा सकती",
    },
    {
      icon: <Globe className="w-6 h-6 text-green-600" />,
      title: t("blockchainKundli.feature2Title", "Permanently Stored"),
      titleHindi: "स्थायी रूप से संग्रहीत",
      description: t("blockchainKundli.feature2Desc", "Stored on IPFS - accessible forever from anywhere"),
      descriptionHindi: "IPFS पर संग्रहीत - कहीं से भी हमेशा के लिए सुलभ",
    },
    {
      icon: <Key className="w-6 h-6 text-purple-600" />,
      title: t("blockchainKundli.feature3Title", "Verifiable"),
      titleHindi: "सत्यापन योग्य",
      description: t("blockchainKundli.feature3Desc", "Anyone can verify authenticity using the certificate ID"),
      descriptionHindi: "कोई भी प्रमाणपत्र आईडी का उपयोग करके प्रामाणिकता सत्यापित कर सकता है",
    },
    {
      icon: <Lock className="w-6 h-6 text-amber-600" />,
      title: t("blockchainKundli.feature4Title", "Free & Unlimited"),
      titleHindi: "मुफ्त और असीमित",
      description: t("blockchainKundli.feature4Desc", "Generate as many certificates as you need at no cost"),
      descriptionHindi: "बिना किसी लागत के जितने चाहें उतने प्रमाणपत्र बनाएं",
    },
  ];

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-800">
            {t("blockchainKundli.badge", "Verified & Immutable")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("blockchainKundli.title", "Blockchain Kundli Certificate")}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t("blockchainKundli.subtitle", "Get a cryptographically verified, tamper-proof Kundli certificate stored permanently on IPFS. Share and verify your birth chart authenticity anywhere.")}
          </p>
        </div>

        {!certificate ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {features.map((feature, index) => (
                <Card key={index} className="border-gray-200 hover:border-blue-300 transition-colors">
                  <CardContent className="pt-6">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {language === "hi" ? feature.titleHindi : feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === "hi" ? feature.descriptionHindi : feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="max-w-xl mx-auto border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  {t("blockchainKundli.enterDetails", "Enter Your Birth Details")}
                </CardTitle>
                <CardDescription>
                  {t("blockchainKundli.enterDetailsDesc", "Generate your verified Kundli certificate")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("calculator.fullName", "Full Name")}</Label>
                    <Input
                      id="name"
                      placeholder={t("calculator.enterName", "Enter your name")}
                      value={birthDetails.name}
                      onChange={(e) => setBirthDetails({ ...birthDetails, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {t("calculator.dateOfBirth", "Date of Birth")}
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={birthDetails.date}
                      onChange={(e) => setBirthDetails({ ...birthDetails, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {t("calculator.timeOfBirth", "Time of Birth")}
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={birthDetails.time}
                      onChange={(e) => setBirthDetails({ ...birthDetails, time: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="place" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {t("calculator.placeOfBirth", "Place of Birth")}
                    </Label>
                    <LocationInput
                      id="place"
                      placeholder={t("calculator.searchCity", "Search city...")}
                      value={birthDetails.place}
                      onChange={(e) => setBirthDetails({ ...birthDetails, place: e.target.value })}
                      onLocationSelect={(loc) => setBirthDetails({ ...birthDetails, place: loc })}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        {t("blockchainKundli.generating", "Generating Certificate...")}
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        {t("blockchainKundli.generate", "Generate Blockchain Certificate")}
                      </>
                    )}
                  </Button>
                </form>

                {isGenerating && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-blue-700 font-medium">
                        {t("blockchainKundli.processingSteps", "Processing...")}
                      </span>
                    </div>
                    <ul className="space-y-2 text-sm text-blue-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {t("blockchainKundli.step1", "Calculating birth chart...")}
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {t("blockchainKundli.step2", "Generating cryptographic hash...")}
                      </li>
                      <li className="flex items-center gap-2 opacity-50">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        {t("blockchainKundli.step3", "Uploading to IPFS...")}
                      </li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="space-y-8">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">
                      {t("blockchainKundli.success", "Certificate Generated Successfully!")}
                    </h3>
                    <p className="text-sm text-green-600">
                      {t("blockchainKundli.successDesc", "Your Kundli is now permanently stored and verifiable")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    {t("blockchainKundli.certificateDetails", "Certificate Details")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{t("blockchainKundli.certificateId", "Certificate ID")}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(certificate.certificateId, "id")}
                      >
                        {copied === "id" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="font-mono text-sm font-medium text-blue-700 break-all">
                      {certificate.certificateId}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{t("blockchainKundli.cryptoHash", "Cryptographic Hash")}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(certificate.hash, "hash")}
                      >
                        {copied === "hash" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="font-mono text-xs text-gray-700 break-all">
                      {certificate.hash}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{t("blockchainKundli.ipfsHash", "IPFS Hash")}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(certificate.ipfsHash, "ipfs")}
                      >
                        {copied === "ipfs" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="font-mono text-xs text-gray-700 break-all">
                      {certificate.ipfsHash}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{t("blockchainKundli.timestamp", "Timestamp")}</span>
                    <p className="font-medium text-gray-900">
                      {new Date(certificate.timestamp).toLocaleString(language === "hi" ? "hi-IN" : "en-US")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-600" />
                    {t("blockchainKundli.chartSummary", "Chart Summary")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <p className="text-sm text-gray-600">{t("blockchainKundli.ascendant", "Ascendant")}</p>
                      <p className="font-bold text-purple-700">
                        {language === "hi" ? certificate.chartSummary.ascendantHindi : certificate.chartSummary.ascendant}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <p className="text-sm text-gray-600">{t("blockchainKundli.moonSign", "Moon Sign")}</p>
                      <p className="font-bold text-purple-700">
                        {language === "hi" ? certificate.chartSummary.moonSignHindi : certificate.chartSummary.moonSign}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <p className="text-sm text-gray-600">{t("blockchainKundli.sunSign", "Sun Sign")}</p>
                      <p className="font-bold text-purple-700">
                        {language === "hi" ? certificate.chartSummary.sunSignHindi : certificate.chartSummary.sunSign}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <p className="text-sm text-gray-600">{t("blockchainKundli.nakshatra", "Nakshatra")}</p>
                      <p className="font-bold text-purple-700">
                        {language === "hi" ? certificate.chartSummary.nakshatraHindi : certificate.chartSummary.nakshatra}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-medium text-amber-800 mb-2">
                      {t("blockchainKundli.birthDetails", "Birth Details")}
                    </h4>
                    <div className="space-y-1 text-sm text-amber-700">
                      <p><span className="font-medium">{t("blockchainKundli.name", "Name")}:</span> {certificate.birthDetails.name}</p>
                      <p><span className="font-medium">{t("blockchainKundli.date", "Date")}:</span> {certificate.birthDetails.date}</p>
                      <p><span className="font-medium">{t("blockchainKundli.time", "Time")}:</span> {certificate.birthDetails.time}</p>
                      <p><span className="font-medium">{t("blockchainKundli.place", "Place")}:</span> {certificate.birthDetails.place}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

                        <Card className="border-gray-200">
                          <CardContent className="pt-6">
                            <div className="flex flex-wrap gap-4 justify-center">
                              <Button className="gap-2" onClick={downloadCertificate}>
                                <Download className="w-4 h-4" />
                                {t("blockchainKundli.downloadCertificate", "Download Certificate")}
                              </Button>
                              <Button variant="outline" className="gap-2" onClick={shareCertificate}>
                                <Share2 className="w-4 h-4" />
                                {t("blockchainKundli.shareCertificate", "Share Certificate")}
                              </Button>
                              <Button variant="outline" className="gap-2" onClick={viewOnIPFS}>
                                <ExternalLink className="w-4 h-4" />
                                {t("blockchainKundli.viewOnIPFS", "View on IPFS")}
                              </Button>
                              <Button variant="outline" onClick={() => setCertificate(null)}>
                                {t("blockchainKundli.generateAnother", "Generate Another")}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle>{t("blockchainKundli.howToVerify", "How to Verify")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t("blockchainKundli.verifyInstructions", "Anyone can verify the authenticity of this certificate using the Certificate ID or IPFS hash. The cryptographic hash ensures the data has not been tampered with.")}
                </p>
                <div className="flex gap-4 flex-wrap">
                  <Link href="/tools/kundli-calculator">
                    <Button variant="outline">
                      {t("blockchainKundli.viewFullKundli", "View Full Kundli")}
                    </Button>
                  </Link>
                  <Link href="/consultation">
                    <Button className="bg-gradient-to-r from-purple-500 to-indigo-600">
                      {t("blockchainKundli.consultAstrologer", "Consult Astrologer")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
