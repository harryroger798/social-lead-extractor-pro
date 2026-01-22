// Imagekit CDN Configuration
// Free tier: 20GB bandwidth/month
// Provides automatic image optimization, WebP conversion, and global CDN delivery

export const IMAGEKIT_URL = "https://ik.imagekit.io/xhjdo9szg";

// Helper function to get CDN URL for images
// Imagekit URL-based transformations: https://docs.imagekit.io/features/image-transformations
export function getCdnImageUrl(
  imagePath: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "auto" | "webp" | "jpg" | "png";
  }
): string {
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  
  // Build transformation string
  const transforms: string[] = [];
  
  if (options?.width) {
    transforms.push(`w-${options.width}`);
  }
  if (options?.height) {
    transforms.push(`h-${options.height}`);
  }
  if (options?.quality) {
    transforms.push(`q-${options.quality}`);
  }
  if (options?.format) {
    transforms.push(`f-${options.format}`);
  }
  
  // If no transforms, just return the base URL with path
  if (transforms.length === 0) {
    return `${IMAGEKIT_URL}/${cleanPath}`;
  }
  
  // Imagekit transformation syntax: /tr:w-300,h-200/path/to/image.jpg
  return `${IMAGEKIT_URL}/tr:${transforms.join(",")}/${cleanPath}`;
}

// Pre-defined image paths for easy access
export const CDN_IMAGES = {
  // Logo
  logo: getCdnImageUrl("images/logo.webp"),
  logoOptimized: getCdnImageUrl("images/logo.webp", { width: 56, quality: 80, format: "auto" }),
  logoFooter: getCdnImageUrl("images/logo.webp", { width: 48, quality: 80, format: "auto" }),
  
  // Hero background
  heroBg: getCdnImageUrl("images/hero-bg.webp"),
  heroBgOptimized: getCdnImageUrl("images/hero-bg.webp", { quality: 80, format: "auto" }),
  
  // Consultation images
  phoneConsultation: getCdnImageUrl("images/phone-consultation.png", { format: "auto" }),
  videoConsultation: getCdnImageUrl("images/video-consultation.png", { format: "auto" }),
  chatConsultation: getCdnImageUrl("images/chat-consultation.png", { format: "auto" }),
  
  // Astrologer images
  astrologers: {
    acharyaShridhar: getCdnImageUrl("images/astrologers/acharya-shridhar-khandal.png", { width: 200, format: "auto" }),
    madhavSharma: getCdnImageUrl("images/astrologers/madhav-sharma.png", { width: 200, format: "auto" }),
    rajKumarShastri: getCdnImageUrl("images/astrologers/raj-kumar-shastri.png", { width: 200, format: "auto" }),
    banwariDadich: getCdnImageUrl("images/astrologers/banwari-dadich.png", { width: 200, format: "auto" }),
    nemichandShastri: getCdnImageUrl("images/astrologers/nemichand-shastri.png", { width: 200, format: "auto" }),
    vinodShastri: getCdnImageUrl("images/astrologers/vinod-shastri.png", { width: 200, format: "auto" }),
    bajarangbaliDubey: getCdnImageUrl("images/astrologers/bajarangbali-dubey.png", { width: 200, format: "auto" }),
    pankajShastri: getCdnImageUrl("images/astrologers/pankaj-shastri.png", { width: 200, format: "auto" }),
  },
  
  // Other images
  kundliChart: getCdnImageUrl("images/kundli-chart.png", { format: "auto" }),
  nakshatraArt: getCdnImageUrl("images/nakshatra-art.png", { format: "auto" }),
  // Note: stars-pattern.png doesn't exist on the server, using CSS gradient instead
  
  // Palmistry images
  palmistry: {
    lines: {
      heartLine: getCdnImageUrl("images/palmistry/lines/heart-line.png", { format: "auto" }),
      headLine: getCdnImageUrl("images/palmistry/lines/head-line.png", { format: "auto" }),
      lifeLine: getCdnImageUrl("images/palmistry/lines/life-line.png", { format: "auto" }),
      fateLine: getCdnImageUrl("images/palmistry/lines/fate-line.png", { format: "auto" }),
      sunLine: getCdnImageUrl("images/palmistry/lines/sun-line.png", { format: "auto" }),
      marriageLine: getCdnImageUrl("images/palmistry/lines/marriage-line.png", { format: "auto" }),
    },
    mounts: {
      jupiter: getCdnImageUrl("images/palmistry/mounts/mount-jupiter.png", { format: "auto" }),
      saturn: getCdnImageUrl("images/palmistry/mounts/mount-saturn.png", { format: "auto" }),
      apollo: getCdnImageUrl("images/palmistry/mounts/mount-apollo.png", { format: "auto" }),
      mercury: getCdnImageUrl("images/palmistry/mounts/mount-mercury.png", { format: "auto" }),
      venus: getCdnImageUrl("images/palmistry/mounts/mount-venus.png", { format: "auto" }),
      moon: getCdnImageUrl("images/palmistry/mounts/mount-moon.png", { format: "auto" }),
      marsUpper: getCdnImageUrl("images/palmistry/mounts/mount-mars-upper.png", { format: "auto" }),
      marsLower: getCdnImageUrl("images/palmistry/mounts/mount-mars-lower.png", { format: "auto" }),
    },
    shapes: {
      earthHand: getCdnImageUrl("images/palmistry/shapes/earth-hand.png", { format: "auto" }),
      airHand: getCdnImageUrl("images/palmistry/shapes/air-hand.png", { format: "auto" }),
      waterHand: getCdnImageUrl("images/palmistry/shapes/water-hand.png", { format: "auto" }),
      fireHand: getCdnImageUrl("images/palmistry/shapes/fire-hand.png", { format: "auto" }),
    },
  },
};
