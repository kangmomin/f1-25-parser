import { FullTelemetryEnvelope, CarEnvelope, NormalizedCar } from "./telemetrymodel.js";

export const ParseMode = Object.freeze({
  PUBLIC: "public",
  STRICT: "strict",
  FRC: "frc",
});

export class FRCParseConfig {
  constructor(init = {}) {
    this.reservedFields = [];
    Object.assign(this, init);
  }
}

export class ParseOptions {
  constructor(init = {}) {
    this.mode = ParseMode.STRICT;
    this.playerCarIndex = null;
    this.frc = null;
    Object.assign(this, init);
  }
}

export function parseEnvelope(input, options = new ParseOptions()) {
  const mode = normalizeMode(options.mode);
  const playerCarIndex = options.playerCarIndex ?? input.header?.playerCarIndex ?? null;
  const sourceCars = new Map((input.cars ?? []).map((car) => [car.carIndex, car]));
  const output = new FullTelemetryEnvelope({
    ...input,
    carSetups: filterCarSetups(input.carSetups, input.participants, playerCarIndex),
    carStatus: filterCarStatus(input.carStatus, mode, playerCarIndex),
    carDamage: filterCarDamage(input.carDamage, mode, playerCarIndex),
    sessionHistoryByCar: { ...(input.sessionHistoryByCar ?? {}) },
    tyreSetsByCar: { ...(input.tyreSetsByCar ?? {}) },
    cars: [],
  });

  const carCount = detectCarCount(input);
  for (let carIndex = 0; carIndex < carCount; carIndex += 1) {
    output.cars.push(
      buildCarEnvelope(output, carIndex, sourceCars.get(carIndex), mode, playerCarIndex),
    );
  }
  if (!output.capturedAt) {
    output.capturedAt = new Date();
  }
  return output;
}

function normalizeMode(mode) {
  return Object.values(ParseMode).includes(mode) ? mode : ParseMode.STRICT;
}

function detectCarCount(input) {
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

function buildCarEnvelope(envelope, carIndex, source, mode, playerCarIndex) {
  const showPublicOrSelf = canExposePublicOrSelfForMode(mode, carIndex, playerCarIndex);
  const showERSPct = canExposeERSPctForMode(mode, carIndex, playerCarIndex);
  const showSetup = canExposeSelfOrAi(carIndex, playerCarIndex, envelope.participants);

  return new CarEnvelope({
    carIndex,
    participant: envelope.participants?.participants?.[carIndex] ?? null,
    motion: envelope.motion?.carMotionData?.[carIndex] ?? null,
    lap: envelope.lapData?.lapData?.[carIndex] ?? null,
    setup: showSetup ? envelope.carSetups?.carSetups?.[carIndex] ?? null : null,
    telemetry: envelope.carTelemetry?.carTelemetryData?.[carIndex] ?? null,
    status: envelope.carStatus?.carStatusData?.[carIndex] ?? null,
    damage: showPublicOrSelf ? envelope.carDamage?.carDamageData?.[carIndex] ?? null : null,
    history: envelope.sessionHistoryByCar?.[carIndex] ?? null,
    tyreSets: envelope.tyreSetsByCar?.[carIndex] ?? null,
    normalized: buildNormalizedCar(envelope, carIndex, source, showPublicOrSelf, showERSPct, showSetup),
  });
}

function buildNormalizedCar(envelope, carIndex, source, showPublicOrSelf, showERSPct, showSetup) {
  const participant = envelope.participants?.participants?.[carIndex];
  const lap = envelope.lapData?.lapData?.[carIndex];
  const telemetry = envelope.carTelemetry?.carTelemetryData?.[carIndex];
  const status = envelope.carStatus?.carStatusData?.[carIndex];
  const damage = envelope.carDamage?.carDamageData?.[carIndex];
  const history = envelope.sessionHistoryByCar?.[carIndex];
  const tyreSets = envelope.tyreSetsByCar?.[carIndex];

  const normalized = new NormalizedCar({
    index: carIndex,
    name: participant?.name ?? null,
    teamId: participant?.teamId ?? null,
    yourTelemetry: participant?.yourTelemetry ?? null,
    aiControlled: participant?.aiControlled ?? null,
    position: lap?.position ?? null,
    currentLapNum: lap?.currentLapNum ?? null,
    lapDistance: lap?.lapDistance ?? null,
    speed: telemetry?.speed ?? null,
    throttle: telemetry?.throttle ?? null,
    brake: telemetry?.brake ?? null,
    steering: telemetry?.steering ?? null,
    gear: telemetry?.gear ?? null,
    brakeTemp: telemetry?.brakeTemp ?? [0, 0, 0, 0],
    tireSurfaceTemp: telemetry?.tireSurfaceTemp ?? [0, 0, 0, 0],
    tireInnerTemp: telemetry?.tireInnerTemp ?? [0, 0, 0, 0],
    tirePressure: telemetry?.tirePressure ?? [0, 0, 0, 0],
    surfaceType: telemetry?.surfaceType ?? [0, 0, 0, 0],
    drsActivated: telemetry?.drs != null ? telemetry.drs !== 0 : null,
    lastLapTime: lap?.lastLapTime ?? null,
    bestLapTime: lap?.bestLapTime ?? null,
    sector1TimeMs: lap?.sector1TimeMs ?? null,
    sector2TimeMs: lap?.sector2TimeMs ?? null,
    currentSector: lap?.currentSector ?? null,
    deltaToCarInFront: lap?.deltaToCarInFront ?? null,
    deltaToRaceLeader: lap?.deltaToRaceLeader ?? null,
    pitStatus: lap?.pitStatus ?? null,
    driverStatus: lap?.driverStatus ?? null,
    resultStatus: lap?.resultStatus ?? null,
    numPitStops: lap?.numPitStops ?? null,
    pitStopTimer: lap?.pitStopTimer ?? null,
    pitLaneTime: lap?.pitLaneTime ?? null,
    penalties: lap?.penalties ?? null,
    totalWarnings: lap?.totalWarnings ?? null,
    cornerCuttingWarnings: lap?.cornerCuttingWarnings ?? null,
    numUnservedDriveThroughs: lap?.numUnservedDriveThroughs ?? null,
    numUnservedStopGoPenalties: lap?.numUnservedStopGoPenalties ?? null,
    lapInvalid: lap?.lapInvalid ?? null,
    actualTyreCompound: status?.actualTyreCompound ?? null,
    tireAge: status?.tireAge ?? null,
    bestSector1Ms: history?.bestSector1Ms ?? null,
    bestSector2Ms: history?.bestSector2Ms ?? null,
    bestSector3Ms: history?.bestSector3Ms ?? null,
    tireCompound: resolveTireCompound(source, status),
    availableSets: buildTyreSetBriefs(tyreSets, source),
    stintHistory: source?.normalized?.stintHistory ?? [],
    dynamics: source?.normalized?.dynamics ?? [],
    ersEstimatePct: source?.normalized?.ersEstimatePct ?? null,
    ersEstimateReady: source?.normalized?.ersEstimateReady ?? null,
  });

  if (showPublicOrSelf) {
    normalized.fuelInTank = status?.fuelInTank ?? null;
    normalized.fuelCapacity = status?.fuelCapacity ?? null;
    normalized.fuelRemainingLaps = status?.fuelRemainingLaps ?? null;
    normalized.fuelMix = status?.fuelMix ?? null;
    normalized.brakeBias = status?.brakeBias ?? null;
    normalized.ersStoreEnergy = status?.ersStoreEnergy ?? null;
    normalized.ersDeployMode = status?.ersDeployMode ?? null;
    normalized.ersDeployedThisLap = status?.ersDeployedThisLap ?? null;
    normalized.ersHarvestedMGUK = status?.ersHarvestedMGUK ?? null;
    normalized.ersHarvestedMGUH = status?.ersHarvestedMGUH ?? null;
    if (damage) {
      normalized.tireWear = damage.tireWear ?? [0, 0, 0, 0];
      normalized.damage = {
        frontLeftWing: damage.frontLeftWingDamage ?? null,
        frontRightWing: damage.frontRightWingDamage ?? null,
        rearWing: damage.rearWingDamage ?? null,
        floor: damage.floorDamage ?? null,
        diffuser: damage.diffuserDamage ?? null,
        sidepod: damage.sidepodDamage ?? null,
        gearbox: damage.gearboxDamage ?? null,
        engine: damage.engineDamage ?? null,
      };
    }
  }

  if (showERSPct) {
    normalized.ersActualPct = source?.normalized?.ersActualPct ?? null;
    normalized.ersActualReady = source?.normalized?.ersActualReady ?? null;
  }

  if (showSetup) {
    normalized.setup = envelope.carSetups?.carSetups?.[carIndex] ?? null;
  }
  return normalized;
}

function filterCarSetups(packet, participants, playerCarIndex) {
  if (!packet?.carSetups) {
    return packet;
  }
  return {
    ...packet,
    carSetups: packet.carSetups.map((setup, index) =>
      canExposeSelfOrAi(index, playerCarIndex, participants) ? normalizeSetup(setup) : {},
    ),
  };
}

function filterCarStatus(packet, mode, playerCarIndex) {
  if (!packet?.carStatusData) {
    return packet;
  }
  return {
    ...packet,
    carStatusData: packet.carStatusData.map((status, index) => {
      if (canExposePublicOrSelfForMode(mode, index, playerCarIndex)) {
        return status;
      }
      return {
        ...status,
        fuelInTank: canExposePublicOrSelfForMode(mode, index, playerCarIndex) ? status.fuelInTank : null,
        fuelCapacity: canExposePublicOrSelfForMode(mode, index, playerCarIndex) ? status.fuelCapacity : null,
        fuelRemainingLaps: canExposePublicOrSelfForMode(mode, index, playerCarIndex) ? status.fuelRemainingLaps : null,
        fuelMix: canExposePublicOrSelfForMode(mode, index, playerCarIndex) ? status.fuelMix : null,
        brakeBias: canExposePublicOrSelfForMode(mode, index, playerCarIndex) ? status.brakeBias : null,
        ersStoreEnergy: canExposePublicOrSelfForMode(mode, index, playerCarIndex) ? status.ersStoreEnergy : null,
        ersDeployMode: canExposePublicOrSelfForMode(mode, index, playerCarIndex) ? status.ersDeployMode : null,
        ersHarvestedMGUK: canExposePublicOrSelfForMode(mode, index, playerCarIndex) ? status.ersHarvestedMGUK : null,
        ersHarvestedMGUH: canExposePublicOrSelfForMode(mode, index, playerCarIndex) ? status.ersHarvestedMGUH : null,
        ersDeployedThisLap: canExposePublicOrSelfForMode(mode, index, playerCarIndex) ? status.ersDeployedThisLap : null,
      };
    }),
  };
}

function filterCarDamage(packet, mode, playerCarIndex) {
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

function canExposePublicOrSelfForMode(mode, carIndex, playerCarIndex) {
  return mode === ParseMode.PUBLIC || mode === ParseMode.FRC || (playerCarIndex !== null && playerCarIndex === carIndex);
}

function canExposeERSPctForMode(mode, carIndex, playerCarIndex) {
  return mode === ParseMode.PUBLIC || mode === ParseMode.FRC || (playerCarIndex !== null && playerCarIndex === carIndex);
}

function canExposeSelfOrAi(carIndex, playerCarIndex, participants) {
  if (playerCarIndex !== null && playerCarIndex === carIndex) {
    return true;
  }
  return participants?.participants?.[carIndex]?.aiControlled === true;
}

function normalizeSetup(setup) {
  if (setup?.onThrottle != null) {
    return {
      ...setup,
      diffOnThrottle: setup.onThrottle,
    };
  }
  if (setup?.diffOnThrottle != null) {
    return {
      ...setup,
      onThrottle: setup.diffOnThrottle,
    };
  }
  return { ...setup };
}

function resolveTireCompound(source, status) {
  if (source?.normalized?.tireCompound) {
    return source.normalized.tireCompound;
  }
  const actual = status?.actualTyreCompound;
  const visual = status?.visualTyreCompound;
  if (actual == null && visual == null) {
    return null;
  }
  return `actual:${actual ?? 0}/visual:${visual ?? 0}`;
}

function buildTyreSetBriefs(tyreSets, source) {
  if (source?.normalized?.availableSets?.length) {
    return source.normalized.availableSets;
  }
  if (!tyreSets?.availableSets?.length) {
    return [];
  }
  return tyreSets.availableSets.map((item, index) => ({
    index,
    wear: item.wear ?? null,
    available: item.available ?? null,
  }));
}
