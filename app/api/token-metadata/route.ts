import { NextResponse } from "next/server";
import { DEMP_TOKEN_MINT, DEMP_DEPLOYER_WALLET, CANONICAL_SITE_URL } from "@/lib/config/public";

export async function GET() {
  const baseUrl = CANONICAL_SITE_URL;

  const metadata = {
    name: "Dark Empire",
    symbol: "DEMP",
    description: "Official utility token of Dark Empire Lords LLC powering high-speed Solana RPC relays, AI Oracle intelligence, and VIP Syndicate governance.",
    image: `${baseUrl}/assets/demp-logo.png`,
    icon: `${baseUrl}/assets/demp-logo.svg`,
    banner: `${baseUrl}/assets/demp-banner.svg`,
    external_url: `${baseUrl}/token`,
    seller_fee_basis_points: 0,
    attributes: [
      {
        trait_type: "Blockchain",
        value: "Solana"
      },
      {
        trait_type: "Token Standard",
        value: "SPL Token"
      },
      {
        trait_type: "Mint Address",
        value: DEMP_TOKEN_MINT
      },
      {
        trait_type: "Deployer Wallet",
        value: DEMP_DEPLOYER_WALLET
      },
      {
        trait_type: "Update Authority",
        value: DEMP_DEPLOYER_WALLET
      },
      {
        trait_type: "Ecosystem",
        value: "Dark Empire HQ"
      }
    ],
    properties: {
      files: [
        {
          uri: `${baseUrl}/assets/demp-logo.png`,
          type: "image/png"
        },
        {
          uri: `${baseUrl}/assets/demp-logo.svg`,
          type: "image/svg+xml"
        },
        {
          uri: `${baseUrl}/assets/demp-banner.svg`,
          type: "image/svg+xml"
        }
      ],
      category: "image",
      creators: [
        {
          address: DEMP_DEPLOYER_WALLET,
          share: 100
        }
      ]
    }
  };

  return NextResponse.json(metadata, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
