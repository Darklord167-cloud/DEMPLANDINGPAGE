"use client";

import { MarketTelemetry, MarketTelemetryProps } from "@/components/MarketTelemetry";

export type GeckoTerminalChartProps = MarketTelemetryProps;

export function GeckoTerminalChart(props: GeckoTerminalChartProps) {
  return <MarketTelemetry {...props} />;
}

export { MarketTelemetry };
