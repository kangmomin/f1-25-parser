import type { CarDamage, TyreSetBrief } from "./dto.js";
import type {
  CarDamageData,
  CarSetupData,
  CarStatusData,
  PacketCarDamageData,
  PacketCarSetupData,
  PacketCarStatusData,
  PacketParticipantsData,
  PacketSessionHistoryData,
  PacketTyreSetsData,
} from "./packets.js";
import type { CarEnvelope, FullTelemetryEnvelope, NormalizedCar } from "./telemetrymodel.js";

export type ParseMode = "public" | "strict" | "frc";

export interface FRCParseConfig {
  reservedFields?: string[];
}

export interface ParseOptions {
  mode?: ParseMode;
  playerCarIndex?: number;
  frc?: FRCParseConfig;
}

export function parseEnvelope(
  input: FullTelemetryEnvelope,
  options: ParseOptions = {},
): FullTelemetryEnvelope {
  const mode = normalizeMode(options.mode);
  const effectiveMode: ParseMode = mode === "frc" ? "strict" : mode;
  const playerCarIndex =
    options.playerCarIndex ?? input.header?.playerCarIndex ?? null;
  const carCount = detectCarCount(input);
  const sourceCars = new Map((input.cars ?? []).map((car) => [car.carIndex, car]));

  const output: FullTelemetryEnvelope = {
    ...input,
    carSetups: filterCarSetups(input.carSetups, input.participants, playerCarIndex),
    carStatus: filterCarStatus(input.carStatus, effectiveMode, playerCarIndex),
    carDamage: filterCarDamage(input.carDamage, effectiveMode, playerCarIndex),
    sessionHistoryByCar: { ...(input.sessionHistoryByCar ?? {}) },
    tyreSetsByCar: { ...(input.tyreSetsByCar ?? {}) },
    cars: [],
  };

  for (let carIndex = 0; carIndex < carCount; carIndex += 1) {
    output.cars!.push(
      buildCarEnvelope(output, carIndex, sourceCars.get(carIndex), effectiveMode, playerCarIndex),
    );
  }

  if (!output.capturedAt) {
    output.capturedAt = new Date();
  }
  return output;
}

function normalizeMode(mode?: ParseMode): ParseMode {
  return mode === "public" || mode === "strict" || mode === "frc" ? mode : "strict";
}

function detectCarCount(input: FullTelemetryEnvelope): number {
  let maxCount = input.cars?.length ?? 0;
  const lengths = [
    input.participants?.participants?.length ?? 0,
    input.motion?.carMotionData?.length ?? 0,
    input.lapData?.lapData?.length ?? 0,
    input.carSetups?.carSetups?.length ?? 0,
    input.carTelemetry?.carTelemetryData?.length ?? 0,
    input.carStatus?.carStatusData?.length ?? 0,
    input.carDamage?.carDamageData?.length ?? 0,
  ];
  for (const length of lengths) {
    maxCount = Math.max(maxCount, length);
  }
  for (const key of Object.keys(input.sessionHistoryByCar ?? {})) {
    maxCount = Math.max(maxCount, Number(key) + 1);
  }
  for (const key of Object.keys(input.tyreSetsByCar ?? {})) {
    maxCount = Math.max(maxCount, Number(key) + 1);
  }
  return maxCount;
}

function buildCarEnvelope(
  envelope: FullTelemetryEnvelope,
  carIndex: number,
  source: CarEnvelope | undefined,
  mode: ParseMode,
  playerCarIndex: number | null,
): CarEnvelope {
  const showPublicOrSelf = canExposePublicOrSelfForMode(mode, carIndex, playerCarIndex);
  const showSetup = canExposeSelfOrAi(carIndex, playerCarIndex, envelope.participants);
  const participant = envelope.participants?.participants?.[carIndex];
  const history = envelope.sessionHistoryByCar?.[carIndex];
  const tyreSets = envelope.tyreSetsByCar?.[carIndex];

  return {
    carIndex,
    participant,
    motion: envelope.motion?.carMotionData?.[carIndex],
    lap: envelope.lapData?.lapData?.[carIndex],
    setup: envelope.carSetups?.carSetups?.[carIndex] && showSetup
      ? envelope.carSetups?.carSetups?.[carIndex]
      : undefined,
    telemetry: envelope.carTelemetry?.carTelemetryData?.[carIndex],
    status: envelope.carStatus?.carStatusData?.[carIndex],
    damage: envelope.carDamage?.carDamageData?.[carIndex] && showPublicOrSelf
      ? envelope.carDamage?.carDamageData?.[carIndex]
      : undefined,
    history,
    tyreSets,
    normalized: buildNormalizedCar(
      carIndex,
      envelope,
      source,
      showPublicOrSelf,
      showSetup,
    ),
  };
}

function buildNormalizedCar(
  carIndex: number,
  envelope: FullTelemetryEnvelope,
  source: CarEnvelope | undefined,
  showPublicOrSelf: boolean,
  showSetup: boolean,
): NormalizedCar {
  const participant = envelope.participants?.participants?.[carIndex];
  const lap = envelope.lapData?.lapData?.[carIndex];
  const telemetry = envelope.carTelemetry?.carTelemetryData?.[carIndex];
  const status = envelope.carStatus?.carStatusData?.[carIndex];
  const damage = envelope.carDamage?.carDamageData?.[carIndex];
  const history = envelope.sessionHistoryByCar?.[carIndex];
  const tyreSets = envelope.tyreSetsByCar?.[carIndex];

  const normalized: NormalizedCar = {
    index: carIndex,
    name: participant?.name,
    teamId: participant?.teamId,
    yourTelemetry: participant?.yourTelemetry,
    position: lap?.position,
    currentLapNum: lap?.currentLapNum,
    lapDistance: lap?.lapDistance,
    speed: telemetry?.speed,
    throttle: telemetry?.throttle,
    brake: telemetry?.brake,
    steering: telemetry?.steering,
    gear: telemetry?.gear,
    brakeTemp: telemetry?.brakeTemp,
    tireSurfaceTemp: telemetry?.tireSurfaceTemp,
    tireInnerTemp: telemetry?.tireInnerTemp,
    tirePressure: telemetry?.tirePressure,
    surfaceType: telemetry?.surfaceType,
    lastLapTime: lap?.lastLapTime,
    bestLapTime: lap?.bestLapTime,
    sector1TimeMs: lap?.sector1TimeMs,
    sector2TimeMs: lap?.sector2TimeMs,
    currentSector: lap?.currentSector,
    deltaToCarInFront: lap?.deltaToCarInFront,
    deltaToRaceLeader: lap?.deltaToRaceLeader,
    pitStatus: lap?.pitStatus,
    driverStatus: lap?.driverStatus,
    resultStatus: lap?.resultStatus,
    numPitStops: lap?.numPitStops,
    pitStopTimer: lap?.pitStopTimer,
    pitLaneTime: lap?.pitLaneTime,
    penalties: lap?.penalties,
    totalWarnings: lap?.totalWarnings,
    cornerCuttingWarnings: lap?.cornerCuttingWarnings,
    numUnservedDriveThroughs: lap?.numUnservedDriveThroughs,
    numUnservedStopGoPenalties: lap?.numUnservedStopGoPenalties,
    lapInvalid: lap?.lapInvalid,
    actualTyreCompound: status?.actualTyreCompound,
    tireAge: status?.tireAge,
    bestSector1Ms: history?.bestSector1Ms,
    bestSector2Ms: history?.bestSector2Ms,
    bestSector3Ms: history?.bestSector3Ms,
    availableSets: buildTyreSetBriefs(tyreSets, source),
    stintHistory: source?.normalized.stintHistory,
    dynamics: source?.normalized.dynamics,
    tireCompound: source?.normalized.tireCompound,
    ersEstimatePct: source?.normalized.ersEstimatePct,
    ersEstimateReady: source?.normalized.ersEstimateReady,
  };

  if (showPublicOrSelf) {
    normalized.fuelInTank = status?.fuelInTank;
    normalized.fuelCapacity = status?.fuelCapacity;
    normalized.fuelRemainingLaps = status?.fuelRemainingLaps;
    normalized.fuelMix = status?.fuelMix;
    normalized.brakeBias = status?.brakeBias;
    normalized.ersStoreEnergy = status?.ersStoreEnergy;
    normalized.ersDeployMode = status?.ersDeployMode;
    normalized.ersDeployedThisLap = status?.ersDeployedThisLap;
    normalized.ersHarvestedMGUK = status?.ersHarvestedMGUK;
    normalized.ersHarvestedMGUH = status?.ersHarvestedMGUH;
    normalized.ersActualPct = source?.normalized.ersActualPct;
    normalized.ersActualReady = source?.normalized.ersActualReady;
    if (damage) {
      normalized.tireWear = damage.tireWear;
      normalized.damage = compactDamage(damage);
    }
  }

  if (showSetup) {
    normalized.setup = envelope.carSetups?.carSetups?.[carIndex];
  }

  return normalized;
}

function filterCarSetups(
  packet: PacketCarSetupData | undefined,
  participants: PacketParticipantsData | undefined,
  playerCarIndex: number | null,
): PacketCarSetupData | undefined {
  if (!packet?.carSetups) {
    return packet;
  }
  return {
    ...packet,
    carSetups: packet.carSetups.map((setup, index) =>
      canExposeSelfOrAi(index, playerCarIndex, participants) ? setup : {},
    ),
  };
}

function filterCarStatus(
  packet: PacketCarStatusData | undefined,
  mode: ParseMode,
  playerCarIndex: number | null,
): PacketCarStatusData | undefined {
  if (!packet?.carStatusData) {
    return packet;
  }
  return {
    ...packet,
    carStatusData: packet.carStatusData.map((status, index) => {
      if (canExposePublicOrSelfForMode(mode, index, playerCarIndex)) {
        return status;
      }
      const filtered: CarStatusData = { ...status };
      filtered.fuelInTank = undefined;
      filtered.fuelCapacity = undefined;
      filtered.fuelRemainingLaps = undefined;
      filtered.fuelMix = undefined;
      filtered.brakeBias = undefined;
      filtered.ersStoreEnergy = undefined;
      filtered.ersDeployMode = undefined;
      filtered.ersDeployedThisLap = undefined;
      filtered.ersHarvestedMGUK = undefined;
      filtered.ersHarvestedMGUH = undefined;
      return filtered;
    }),
  };
}

function filterCarDamage(
  packet: PacketCarDamageData | undefined,
  mode: ParseMode,
  playerCarIndex: number | null,
): PacketCarDamageData | undefined {
  if (!packet?.carDamageData) {
    return packet;
  }
  return {
    ...packet,
    carDamageData: packet.carDamageData.map((damage, index) =>
      canExposePublicOrSelfForMode(mode, index, playerCarIndex) ? damage : {},
    ),
  };
}

function canExposePublicOrSelfForMode(
  mode: ParseMode,
  carIndex: number,
  playerCarIndex: number | null,
): boolean {
  return mode === "public" || (playerCarIndex !== null && playerCarIndex === carIndex);
}

function canExposeSelfOrAi(
  carIndex: number,
  playerCarIndex: number | null,
  participants: PacketParticipantsData | undefined,
): boolean {
  if (playerCarIndex !== null && playerCarIndex === carIndex) {
    return true;
  }
  return participants?.participants?.[carIndex]?.aiControlled === true;
}

function compactDamage(damage: CarDamageData): CarDamage {
  return {
    frontLeftWing: damage.frontLeftWingDamage,
    frontRightWing: damage.frontRightWingDamage,
    rearWing: damage.rearWingDamage,
    floor: damage.floorDamage,
    diffuser: damage.diffuserDamage,
    sidepod: damage.sidepodDamage,
    gearbox: damage.gearboxDamage,
    engine: damage.engineDamage,
  };
}

function buildTyreSetBriefs(
  tyreSets: PacketTyreSetsData | undefined,
  source: CarEnvelope | undefined,
): TyreSetBrief[] | undefined {
  if (source?.normalized.availableSets?.length) {
    return source.normalized.availableSets;
  }
  if (!tyreSets?.availableSets?.length) {
    return undefined;
  }
  return tyreSets.availableSets.map((item, index) => ({
    index,
    wear: item.wear,
    available: item.available,
  }));
}
