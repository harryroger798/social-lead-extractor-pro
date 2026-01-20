// Pinata IPFS Upload Utility
// This file handles uploading certificate data to IPFS via Pinata
// Note: This module should only be used in server-side code (API routes, server actions)

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

interface CertificateData {
  certificateId: string;
  birthDetails: {
    name: string;
    date: string;
    time: string;
    place: string;
  };
  chartSummary: {
    ascendant: string;
    moonSign: string;
    sunSign: string;
    nakshatra: string;
  };
  hash: string;
  timestamp: string;
}

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

// Generate beautiful HTML certificate for IPFS display
function generateCertificateHTML(certificateData: CertificateData): string {
  const formattedDate = new Date(certificateData.timestamp).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VedicStarAstro - Blockchain Kundli Certificate</title>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Cormorant Garamond', Georgia, serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .certificate-container {
      max-width: 800px;
      width: 100%;
      background: linear-gradient(145deg, #fffef5 0%, #fff8e7 50%, #fff5d6 100%);
      border-radius: 20px;
      box-shadow: 0 25px 80px rgba(0,0,0,0.4), 0 0 0 8px #d4a853, 0 0 0 12px #1a1a2e;
      overflow: hidden;
      position: relative;
    }
    .certificate-container::before {
      content: '';
      position: absolute;
      top: 20px; left: 20px; right: 20px; bottom: 20px;
      border: 2px solid #d4a853;
      border-radius: 10px;
      pointer-events: none;
    }
    .corner-ornament {
      position: absolute;
      width: 80px;
      height: 80px;
      opacity: 0.6;
    }
    .corner-ornament.top-left { top: 30px; left: 30px; }
    .corner-ornament.top-right { top: 30px; right: 30px; transform: rotate(90deg); }
    .corner-ornament.bottom-left { bottom: 30px; left: 30px; transform: rotate(-90deg); }
    .corner-ornament.bottom-right { bottom: 30px; right: 30px; transform: rotate(180deg); }
    .corner-ornament svg { width: 100%; height: 100%; fill: #d4a853; }
    .header {
      background: linear-gradient(135deg, #d4a853 0%, #f4d03f 50%, #d4a853 100%);
      padding: 40px 30px;
      text-align: center;
      position: relative;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 200px;
      height: 4px;
      background: linear-gradient(90deg, transparent, #8b6914, transparent);
    }
    .om-symbol {
      font-size: 36px;
      color: #8b6914;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .logo-text {
      font-family: 'Cinzel', serif;
      font-size: 32px;
      font-weight: 700;
      color: #1a1a2e;
      letter-spacing: 4px;
      text-shadow: 1px 1px 2px rgba(255,255,255,0.5);
    }
    .subtitle {
      font-family: 'Cinzel', serif;
      font-size: 14px;
      color: #5a4a1a;
      letter-spacing: 6px;
      margin-top: 8px;
      text-transform: uppercase;
    }
    .certificate-title {
      font-family: 'Cinzel', serif;
      font-size: 24px;
      color: #1a1a2e;
      text-align: center;
      padding: 30px;
      letter-spacing: 3px;
      position: relative;
    }
    .certificate-title::before, .certificate-title::after {
      content: '✦';
      color: #d4a853;
      margin: 0 15px;
    }
    .content {
      padding: 20px 50px 40px;
    }
    .section {
      margin-bottom: 30px;
      background: rgba(212, 168, 83, 0.08);
      border-radius: 12px;
      padding: 25px;
      border: 1px solid rgba(212, 168, 83, 0.3);
    }
    .section-title {
      font-family: 'Cinzel', serif;
      font-size: 16px;
      color: #8b6914;
      letter-spacing: 3px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #d4a853;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-title::before {
      content: '☉';
      font-size: 20px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-size: 12px;
      color: #8b6914;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 18px;
      color: #1a1a2e;
      font-weight: 600;
    }
    .info-value.name {
      font-size: 24px;
      font-family: 'Cinzel', serif;
    }
    .zodiac-symbols {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin: 20px 0;
      font-size: 24px;
      color: #d4a853;
    }
    .verification-section {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 12px;
      padding: 25px;
      color: #fff;
    }
    .verification-section .section-title {
      color: #d4a853;
      border-bottom-color: #d4a853;
    }
    .verification-section .section-title::before {
      content: '🔐';
    }
    .hash-display {
      background: rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 12px;
      margin-top: 10px;
      word-break: break-all;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      color: #a0d2db;
    }
    .hash-label {
      font-size: 11px;
      color: #d4a853;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 15px;
      margin-bottom: 5px;
    }
    .footer {
      text-align: center;
      padding: 30px;
      background: linear-gradient(180deg, transparent, rgba(212, 168, 83, 0.1));
    }
    .seal {
      width: 100px;
      height: 100px;
      margin: 0 auto 20px;
      border: 3px solid #d4a853;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #fffef5, #fff8e7);
      box-shadow: 0 4px 15px rgba(212, 168, 83, 0.3);
    }
    .seal-text {
      font-family: 'Cinzel', serif;
      font-size: 10px;
      color: #8b6914;
      letter-spacing: 2px;
    }
    .seal-icon {
      font-size: 28px;
      color: #d4a853;
      margin: 5px 0;
    }
    .footer-text {
      font-size: 12px;
      color: #5a4a1a;
      line-height: 1.8;
    }
    .footer-text a {
      color: #8b6914;
      text-decoration: none;
    }
    .timestamp {
      font-size: 11px;
      color: #8b6914;
      margin-top: 15px;
    }
    @media (max-width: 600px) {
      .info-grid { grid-template-columns: 1fr; }
      .content { padding: 20px 25px 30px; }
      .logo-text { font-size: 24px; }
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <div class="corner-ornament top-left">
      <svg viewBox="0 0 100 100"><path d="M0,0 L100,0 L100,20 L20,20 L20,100 L0,100 Z M30,30 L30,70 L70,70 L70,30 Z"/></svg>
    </div>
    <div class="corner-ornament top-right">
      <svg viewBox="0 0 100 100"><path d="M0,0 L100,0 L100,20 L20,20 L20,100 L0,100 Z M30,30 L30,70 L70,70 L70,30 Z"/></svg>
    </div>
    <div class="corner-ornament bottom-left">
      <svg viewBox="0 0 100 100"><path d="M0,0 L100,0 L100,20 L20,20 L20,100 L0,100 Z M30,30 L30,70 L70,70 L70,30 Z"/></svg>
    </div>
    <div class="corner-ornament bottom-right">
      <svg viewBox="0 0 100 100"><path d="M0,0 L100,0 L100,20 L20,20 L20,100 L0,100 Z M30,30 L30,70 L70,70 L70,30 Z"/></svg>
    </div>
    
    <div class="header">
      <div class="om-symbol">ॐ</div>
      <div class="logo-text">VEDICSTARASTRO</div>
      <div class="subtitle">Authentic Vedic Astrology</div>
    </div>
    
    <div class="certificate-title">Blockchain Kundli Certificate</div>
    
    <div class="zodiac-symbols">♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓</div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">Personal Details</div>
        <div class="info-grid">
          <div class="info-item" style="grid-column: span 2;">
            <span class="info-label">Full Name</span>
            <span class="info-value name">${certificateData.birthDetails.name}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Date of Birth</span>
            <span class="info-value">${certificateData.birthDetails.date}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Time of Birth</span>
            <span class="info-value">${certificateData.birthDetails.time}</span>
          </div>
          <div class="info-item" style="grid-column: span 2;">
            <span class="info-label">Place of Birth</span>
            <span class="info-value">${certificateData.birthDetails.place}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Astrological Summary</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Ascendant (Lagna)</span>
            <span class="info-value">${certificateData.chartSummary.ascendant}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Moon Sign (Rashi)</span>
            <span class="info-value">${certificateData.chartSummary.moonSign}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Sun Sign</span>
            <span class="info-value">${certificateData.chartSummary.sunSign}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Birth Nakshatra</span>
            <span class="info-value">${certificateData.chartSummary.nakshatra}</span>
          </div>
        </div>
      </div>
      
      <div class="section verification-section">
        <div class="section-title">Blockchain Verification</div>
        <div class="hash-label">Certificate ID</div>
        <div class="hash-display">${certificateData.certificateId}</div>
        <div class="hash-label">Cryptographic Hash (SHA-256)</div>
        <div class="hash-display">${certificateData.hash}</div>
      </div>
    </div>
    
    <div class="footer">
      <div class="seal">
        <span class="seal-text">VERIFIED</span>
        <span class="seal-icon">✓</span>
        <span class="seal-text">AUTHENTIC</span>
      </div>
      <p class="footer-text">
        This certificate is cryptographically signed and permanently stored on IPFS.<br>
        It can be independently verified using the certificate ID or hash.<br>
        <a href="https://vedicstarastro.com">www.vedicstarastro.com</a>
      </p>
      <p class="timestamp">Generated on: ${formattedDate}</p>
    </div>
  </div>
</body>
</html>`;
}

export async function uploadToIPFS(certificateData: CertificateData): Promise<string | null> {
  try {
    // Check if API keys are configured
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      console.error("Pinata API keys are not configured");
      return null;
    }

    // Upload JSON data to IPFS (JSON works reliably on Pinata's gateway)
    // HTML was causing issues with ipfs.io gateway timeouts
    const jsonData = {
      version: "1.0",
      platform: "VedicStarAstro",
      type: "BlockchainKundliCertificate",
      certificateId: certificateData.certificateId,
      birthDetails: certificateData.birthDetails,
      chartSummary: certificateData.chartSummary,
      cryptographicHash: certificateData.hash,
      timestamp: certificateData.timestamp,
      generatedAt: new Date(certificateData.timestamp).toISOString(),
      verification: {
        method: "SHA-256",
        note: "This certificate data is cryptographically signed and permanently stored on IPFS."
      }
    };

    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
      body: JSON.stringify({
        pinataContent: jsonData,
        pinataMetadata: {
          name: `VedicStarAstro-Certificate-${certificateData.certificateId}`,
          keyvalues: {
            certificateId: certificateData.certificateId,
            name: certificateData.birthDetails.name,
            platform: "VedicStarAstro",
            type: "BlockchainKundliCertificate"
          },
        },
      }),
    });

    if (!response.ok) {
      console.error("Pinata upload failed:", response.status, response.statusText);
      return null;
    }

    const result: PinataResponse = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    return null;
  }
}

export function getIPFSGatewayUrl(ipfsHash: string): string {
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
}

export function getPublicIPFSUrl(ipfsHash: string): string {
  // Use Pinata's gateway - they reliably serve their own pinned content
  // ipfs.io was causing 504 timeouts due to provider discovery issues
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
}
