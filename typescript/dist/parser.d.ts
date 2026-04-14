import type { FullTelemetryEnvelope } from "./telemetrymodel.js";
export type ParseMode = "public" | "strict" | "frc" | "drivers";
export interface FRCParseConfig {
    reservedFields?: string[];
}
export interface ParseOptions {
    mode?: ParseMode;
    playerCarIndex?: number;
    frc?: FRCParseConfig;
}
export declare function parseEnvelope(input: FullTelemetryEnvelope, options?: ParseOptions): FullTelemetryEnvelope;
