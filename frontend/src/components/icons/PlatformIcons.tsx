// Platform logo PNG imports
import linkedinLogo from '@/assets/platform-logos/linkedin.png';
import googleMapsLogo from '@/assets/platform-logos/google_maps.png';
import redditLogo from '@/assets/platform-logos/reddit.png';
import telegramLogo from '@/assets/platform-logos/telegram.png';
import instagramLogo from '@/assets/platform-logos/instagram.png';
import facebookLogo from '@/assets/platform-logos/facebook.png';
import twitterLogo from '@/assets/platform-logos/twitter.png';
import whatsappLogo from '@/assets/platform-logos/whatsapp.png';
import tiktokLogo from '@/assets/platform-logos/tiktok.png';
import youtubeLogo from '@/assets/platform-logos/youtube.png';
import pinterestLogo from '@/assets/platform-logos/pinterest.png';
import emailLogo from '@/assets/platform-logos/email.png';
import indiamartLogo from '@/assets/platform-logos/indiamart.png';
import emailFinderLogo from '@/assets/platform-logos/email_finder_b2b.png';
import tradeindiaLogo from '@/assets/platform-logos/tradeindia.png';
import exportersindiaLogo from '@/assets/platform-logos/exportersindia.png';
import justdialLogo from '@/assets/platform-logos/justdial.png';
import googleMapsBbbLogo from '@/assets/platform-logos/google_maps_b2b.png';
import githubLogo from '@/assets/platform-logos/github_b2b.png';
import businessDirsLogo from '@/assets/platform-logos/business_directories.png';

interface PlatformIconProps {
  className?: string;
  style?: React.CSSProperties;
}

function createPlatformIcon(src: string, alt: string) {
  return function PlatformIcon({ className, style }: PlatformIconProps) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          ...style,
        }}
        draggable={false}
      />
    );
  };
}

export const LinkedInIcon = createPlatformIcon(linkedinLogo, 'LinkedIn');
export const GoogleMapsIcon = createPlatformIcon(googleMapsLogo, 'Google Maps');
export const RedditIcon = createPlatformIcon(redditLogo, 'Reddit');
export const TelegramIcon = createPlatformIcon(telegramLogo, 'Telegram');
export const InstagramIcon = createPlatformIcon(instagramLogo, 'Instagram');
export const FacebookIcon = createPlatformIcon(facebookLogo, 'Facebook');
export const TwitterIcon = createPlatformIcon(twitterLogo, 'Twitter/X');
export const WhatsAppIcon = createPlatformIcon(whatsappLogo, 'WhatsApp');
export const TikTokIcon = createPlatformIcon(tiktokLogo, 'TikTok');
export const YouTubeIcon = createPlatformIcon(youtubeLogo, 'YouTube');
export const PinterestIcon = createPlatformIcon(pinterestLogo, 'Pinterest');
export const EmailIcon = createPlatformIcon(emailLogo, 'Email');
export const TumblrIcon = createPlatformIcon(emailLogo, 'Tumblr');
export const IndiaMARTIcon = createPlatformIcon(indiamartLogo, 'IndiaMART');
export const EmailFinderIcon = createPlatformIcon(emailFinderLogo, 'Email Finder');
export const TradeIndiaIcon = createPlatformIcon(tradeindiaLogo, 'TradeIndia');
export const ExportersIndiaIcon = createPlatformIcon(exportersindiaLogo, 'ExportersIndia');
export const JustDialIcon = createPlatformIcon(justdialLogo, 'JustDial');
export const GoogleMapsBBBIcon = createPlatformIcon(googleMapsBbbLogo, 'Google Maps B2B');
export const GitHubB2BIcon = createPlatformIcon(githubLogo, 'GitHub');
export const BusinessDirectoriesIcon = createPlatformIcon(businessDirsLogo, 'Business Directories');

// Map platform IDs to their icon components
export const PLATFORM_ICONS: Record<string, React.FC<PlatformIconProps>> = {
  linkedin: LinkedInIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  twitter: TwitterIcon,
  youtube: YouTubeIcon,
  reddit: RedditIcon,
  tiktok: TikTokIcon,
  pinterest: PinterestIcon,
  tumblr: TumblrIcon,
  whatsapp: WhatsAppIcon,
  telegram: TelegramIcon,
  google_maps: GoogleMapsIcon,
  email: EmailIcon,
  // B2B platforms (v3.5.57 — replaced Apollo/RocketReach/Crunchbase)
  indiamart: IndiaMARTIcon,
  email_finder_b2b: EmailFinderIcon,
  tradeindia: TradeIndiaIcon,
  exportersindia: ExportersIndiaIcon,
  justdial: JustDialIcon,
  google_maps_b2b: GoogleMapsBBBIcon,
  github_b2b: GitHubB2BIcon,
  business_directories: BusinessDirectoriesIcon,
};
