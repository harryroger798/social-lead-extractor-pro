// Pinata IPFS Upload Utility
// This file handles uploading certificate data to IPFS via Pinata

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || "a19dfcd1f7856428c46d";
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || "ae619fc7f164e0b588a51ddf76f7b1b46ca6e829743619b52f5788dd94e99716";

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

export async function uploadToIPFS(certificateData: CertificateData): Promise<string | null> {
  try {
    const data = JSON.stringify({
      pinataContent: {
        ...certificateData,
        version: "1.0",
        platform: "VedicStarAstro",
        type: "BlockchainKundliCertificate",
      },
      pinataMetadata: {
        name: `VedicStarAstro-Certificate-${certificateData.certificateId}`,
        keyvalues: {
          certificateId: certificateData.certificateId,
          name: certificateData.birthDetails.name,
          platform: "VedicStarAstro",
        },
      },
    });

    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
      body: data,
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
  return `https://ipfs.io/ipfs/${ipfsHash}`;
}
