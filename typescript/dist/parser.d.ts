import type { CarDamageData, CarSetupData, CarStatusData } from "./packets.js";
import type { CarEnvelope, FullTelemetryEnvelope, NormalizedCar } from "./telemetrymodel.js";
export type ParseMode = "public" | "strict" | "frc" | "drivers";
export interface FRCParseConfig {
    reservedFields?: string[];
}
export interface ParseOptions {
    mode?: ParseMode;
    playerCarIndex?: number;
    frc?: FRCParseConfig;
}
export declare function parseEnvelope(input: FullTelemetryEnvelope, _options?: ParseOptions): FullTelemetryEnvelope;
export declare function getVisibleEnvelope(input: FullTelemetryEnvelope, options?: ParseOptions): FullTelemetryEnvelope;
export declare function getVisibleCars(input: FullTelemetryEnvelope, options?: ParseOptions): CarEnvelope[];
export declare function getVisibleCarEnvelope(input: FullTelemetryEnvelope, carIndex: number, options?: ParseOptions): CarEnvelope | undefined;
export declare function getVisibleNormalizedCar(input: FullTelemetryEnvelope, carIndex: number, options?: ParseOptions): NormalizedCar | undefined;
export declare function getVisibleCarSetup(input: FullTelemetryEnvelope, carIndex: number, options?: ParseOptions): CarSetupData | undefined;
export declare function getVisibleCarStatus(input: FullTelemetryEnvelope, carIndex: number, options?: ParseOptions): CarStatusData | undefined;
export declare function getVisibleCarDamage(input: FullTelemetryEnvelope, carIndex: number, options?: ParseOptions): CarDamageData | undefined;
