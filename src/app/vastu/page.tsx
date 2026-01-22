"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CDN_IMAGES } from "@/lib/cdn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home,
  Building2,
  Compass,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Bed,
  UtensilsCrossed,
  Bath,
  Sofa,
  DoorOpen,
  TreePine,
  Droplets,
  Flame,
  Wind,
  Mountain,
  Sun,
  Moon,
  Star,
} from "lucide-react";

interface VastuTip {
  direction: string;
  element: string;
  color: string;
  dos: string[];
  donts: string[];
  remedies: string[];
}

const directions = [
  { name: "North", element: "Water", deity: "Kubera (Wealth)", color: "Blue, Green", icon: Droplets },
  { name: "South", element: "Fire", deity: "Yama (Dharma)", color: "Red, Orange", icon: Flame },
  { name: "East", element: "Air", deity: "Indra (King of Gods)", color: "White, Light Blue", icon: Wind },
  { name: "West", element: "Space", deity: "Varuna (Rain God)", color: "Blue, White", icon: Mountain },
  { name: "North-East", element: "Water", deity: "Ishanya (Shiva)", color: "Yellow, Light Blue", icon: Star },
  { name: "South-East", element: "Fire", deity: "Agni (Fire God)", color: "Red, Pink", icon: Flame },
  { name: "South-West", element: "Earth", deity: "Nairuti (Demon)", color: "Brown, Yellow", icon: Mountain },
  { name: "North-West", element: "Air", deity: "Vayu (Wind God)", color: "White, Grey", icon: Wind },
];

const roomTips: Record<string, { ideal: string[], avoid: string[], tips: string[] }> = {
  bedroom: {
    ideal: ["South-West (Master)", "South", "West", "North-West (Guest)"],
    avoid: ["North-East", "South-East"],
    tips: [
      "Place bed with head towards South or East",
      "Avoid mirrors facing the bed",
      "Keep electronics away from sleeping area",
      "Use soothing colors like light blue, green, or pink",
      "Avoid storing items under the bed"
    ]
  },
  kitchen: {
    ideal: ["South-East", "North-West"],
    avoid: ["North-East", "South-West"],
    tips: [
      "Cook facing East for positive energy",
      "Keep stove in South-East corner",
      "Water source should be in North-East of kitchen",
      "Avoid black color in kitchen",
      "Keep kitchen clean and clutter-free"
    ]
  },
  bathroom: {
    ideal: ["North-West", "West"],
    avoid: ["North-East", "South-West", "Center"],
    tips: [
      "Toilet seat should face North or South",
      "Keep bathroom door closed always",
      "Ensure proper ventilation",
      "Use light colors for walls",
      "Fix any leaking taps immediately"
    ]
  },
  livingRoom: {
    ideal: ["North", "East", "North-East"],
    avoid: ["South-West"],
    tips: [
      "Place heavy furniture in South or West",
      "Keep North-East corner light and clutter-free",
      "Main seating should face East or North",
      "Use bright colors for positive energy",
      "Place TV in South-East corner"
    ]
  },
  puja: {
    ideal: ["North-East"],
    avoid: ["South", "South-West", "Bathroom adjacent"],
    tips: [
      "Face East or North while praying",
      "Keep idols at least 1 inch away from wall",
      "Use marble or wooden platform for idols",
      "Light lamp in South-East of puja room",
      "Keep puja room clean and sacred"
    ]
  },
  entrance: {
    ideal: ["North", "East", "North-East"],
    avoid: ["South-West", "South"],
    tips: [
      "Main door should open inwards clockwise",
      "Keep entrance well-lit and clean",
      "Avoid shoe rack near main door",
      "Place nameplate on right side",
      "Use auspicious symbols like Swastika or Om"
    ]
  }
};

const vastuRemedies = [
  {
    problem: "Financial Problems",
    remedies: [
      "Keep North direction clutter-free",
      "Place a money plant in North",
      "Fix any water leakage in North",
      "Keep a Kuber Yantra in North",
      "Avoid toilet in North-East"
    ]
  },
  {
    problem: "Health Issues",
    remedies: [
      "Keep North-East clean and light",
      "Avoid sleeping under beam",
      "Remove dead plants from home",
      "Ensure proper ventilation",
      "Use copper vessels for drinking water"
    ]
  },
  {
    problem: "Relationship Problems",
    remedies: [
      "Keep South-West strong and heavy",
      "Place couple photos in South-West bedroom",
      "Avoid cactus or thorny plants",
      "Keep bedroom clutter-free",
      "Use pink or light colors in bedroom"
    ]
  },
  {
    problem: "Career Obstacles",
    remedies: [
      "Face North or East while working",
      "Keep North direction open",
      "Place awards in South wall",
      "Avoid sitting under beam",
      "Keep work desk clutter-free"
    ]
  },
  {
    problem: "Negative Energy",
    remedies: [
      "Burn camphor daily",
      "Keep sea salt in corners",
      "Use wind chimes in North-West",
      "Light incense sticks regularly",
      "Keep home well-ventilated and lit"
    ]
  }
];

export default function VastuPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("directions");
  const [selectedRoom, setSelectedRoom] = useState("bedroom");

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url('${CDN_IMAGES.starsPattern}')` }}></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Home className="w-3 h-3 mr-1" />
              {t("vastu.badge", "Vastu Shastra")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t("vastu.title", "Vastu Shastra Guide")}
            </h1>
            <p className="text-lg text-amber-100 max-w-2xl mx-auto">
              {t("vastu.subtitle", "Ancient Indian science of architecture and design for harmony, prosperity, and positive energy in your living spaces.")}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="directions" className="flex items-center gap-2">
              <Compass className="w-4 h-4" />
              {t("vastu.directions", "Directions")}
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              {t("vastu.rooms", "Rooms")}
            </TabsTrigger>
            <TabsTrigger value="remedies" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              {t("vastu.remedies", "Remedies")}
            </TabsTrigger>
            <TabsTrigger value="office" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {t("vastu.office", "Office")}
            </TabsTrigger>
          </TabsList>

          {/* Directions Tab */}
          <TabsContent value="directions">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {t("vastu.directionsTitle", "Eight Directions in Vastu")}
              </h2>
              <p className="text-gray-600">
                {t("vastu.directionsDesc", "Each direction is governed by a deity and element, influencing different aspects of life")}
              </p>
            </div>

            {/* Vastu Compass */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative aspect-square">
                <div className="absolute inset-0 rounded-full border-4 border-amber-300 bg-gradient-to-br from-amber-100 to-orange-100"></div>
                {directions.map((dir, idx) => {
                  const angle = idx * 45 - 90;
                  const radius = 42;
                  const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
                  const Icon = dir.icon;
                  return (
                    <div
                      key={dir.name}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center mb-1">
                        <Icon className="w-6 h-6 text-amber-600" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{dir.name}</span>
                    </div>
                  );
                })}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center">
                    <Compass className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Direction Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {directions.map((dir) => {
                const Icon = dir.icon;
                return (
                  <Card key={dir.name} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{dir.name}</CardTitle>
                          <CardDescription>{dir.element}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>{t("vastu.deity", "Deity")}:</strong> {dir.deity}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>{t("vastu.colors", "Colors")}:</strong> {dir.color}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {t("vastu.roomsTitle", "Room-wise Vastu Tips")}
              </h2>
              <p className="text-gray-600">
                {t("vastu.roomsDesc", "Ideal placement and tips for each room in your home")}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[
                { id: "bedroom", icon: Bed, label: "Bedroom" },
                { id: "kitchen", icon: UtensilsCrossed, label: "Kitchen" },
                { id: "bathroom", icon: Bath, label: "Bathroom" },
                { id: "livingRoom", icon: Sofa, label: "Living Room" },
                { id: "puja", icon: Star, label: "Puja Room" },
                { id: "entrance", icon: DoorOpen, label: "Entrance" },
              ].map((room) => {
                const Icon = room.icon;
                return (
                  <Button
                    key={room.id}
                    variant={selectedRoom === room.id ? "default" : "outline"}
                    onClick={() => setSelectedRoom(room.id)}
                    className={selectedRoom === room.id ? "bg-amber-600 hover:bg-amber-700" : ""}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {room.label}
                  </Button>
                );
              })}
            </div>

            {roomTips[selectedRoom] && (
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      {t("vastu.idealDirections", "Ideal Directions")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {roomTips[selectedRoom].ideal.map((dir, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {dir}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <XCircle className="w-5 h-5" />
                      {t("vastu.avoidDirections", "Avoid Directions")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {roomTips[selectedRoom].avoid.map((dir, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {dir}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-amber-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-700">
                      <Lightbulb className="w-5 h-5" />
                      {t("vastu.tips", "Vastu Tips")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {roomTips[selectedRoom].tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Remedies Tab */}
          <TabsContent value="remedies">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {t("vastu.remediesTitle", "Vastu Remedies")}
              </h2>
              <p className="text-gray-600">
                {t("vastu.remediesDesc", "Solutions for common problems caused by Vastu defects")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vastuRemedies.map((item, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      {item.problem}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {item.remedies.map((remedy, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {remedy}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Office Tab */}
          <TabsContent value="office">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {t("vastu.officeTitle", "Office & Business Vastu")}
              </h2>
              <p className="text-gray-600">
                {t("vastu.officeDesc", "Vastu tips for workplace success and prosperity")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">{t("vastu.officeDos", "Do's for Office")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Owner/Boss should sit in South-West facing North or East",
                      "Keep North and East directions open and clutter-free",
                      "Place cash box in North facing South",
                      "Reception should be in North-East",
                      "Conference room in North-West",
                      "Accounts department in South-East",
                      "Keep plants in East or North",
                      "Water fountain in North-East"
                    ].map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-700">{t("vastu.officeDonts", "Don'ts for Office")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Avoid sitting with back towards door",
                      "Don't place mirror in front of desk",
                      "Avoid toilet in North-East",
                      "Don't keep broken items in office",
                      "Avoid cactus or thorny plants",
                      "Don't sit under beam or AC",
                      "Avoid dark colors on walls",
                      "Don't keep dustbin in North-East"
                    ].map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* About Vastu Section */}
        <section className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>{t("vastu.aboutTitle", "About Vastu Shastra")}</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-600">
                {t("vastu.aboutText1", "Vastu Shastra is an ancient Indian science of architecture and design that dates back over 5,000 years. The word 'Vastu' means dwelling or building, and 'Shastra' means science or knowledge. It provides guidelines for designing and constructing buildings in harmony with natural forces.")}
              </p>
              <p className="text-gray-600 mt-4">
                {t("vastu.aboutText2", "The principles of Vastu are based on the five elements (Pancha Bhoota) - Earth, Water, Fire, Air, and Space - and the eight cardinal directions. By aligning our living and working spaces with these natural elements and directions, we can enhance positive energy flow and attract prosperity, health, and happiness.")}
              </p>
              <p className="text-gray-600 mt-4">
                {t("vastu.aboutText3", "While it may not always be possible to follow all Vastu principles, especially in modern apartments, there are many remedies and adjustments that can help balance the energy in your space. Simple changes like rearranging furniture, using specific colors, or placing certain objects can make a significant difference.")}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
