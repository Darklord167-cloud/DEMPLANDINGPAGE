import { DEMP_TOKEN_MINT, USDC_TOKEN_MINT, JUPITER_SWAP_BASE_URL } from "./config";

export interface SwapRouteOptions {
  inputMint?: string;
  outputMint?: string;
  amount?: number;
  slippageBps?: number;
}

/**
 * Returns the direct Jupiter Swap URL fallback trigger for instant $DEMP swaps.
 */
export function getJupiterSwapUrl(options?: SwapRouteOptions): string {
  const input = options?.inputMint || USDC_TOKEN_MINT;
  const output = options?.outputMint || DEMP_TOKEN_MINT;
  return `${JUPITER_SWAP_BASE_URL}/${input}-${output}`;
}

/**
 * Triggers direct fallback navigation to Jupiter Swap.
 */
export function triggerJupiterDirectSwap(options?: SwapRouteOptions): void {
  if (typeof window !== "undefined") {
    const url = getJupiterSwapUrl(options);
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

/**
 * Initializer helper for Jupiter Terminal Script Widget.
 */
export function initJupiterTerminalWidget(targetElementId: string = "jupiter-terminal", outputMint: string = DEMP_TOKEN_MINT): boolean {
  if (typeof window !== "undefined" && window.Jupiter) {
    try {
      window.Jupiter.init({
        displayMode: "integrated",
        integratedTargetId: targetElementId,
        strictTokenList: false,
        formProps: {
          initialInputMint: USDC_TOKEN_MINT,
          initialOutputMint: outputMint,
        },
        theme: "dark",
      });
      return true;
    } catch (err) {
      console.error("Jupiter Terminal init error:", err);
      return false;
    }
  }
  return false;
}
