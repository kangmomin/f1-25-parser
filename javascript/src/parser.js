import { FullTelemetryEnvelope, CarEnvelope, NormalizedCar } from "./telemetrymodel.js";

export const ParseMode = Object.freeze({
  PUBLIC: "public",
  STRICT: "strict",
  FRC: "frc",
  DRIVERS: "drivers",
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

export function parseEnvelope(input, _options = new ParseOptions()) {
  const sourceCars = new Map((input.cars ?? []).map((car) => [car.carIndex, car]));
  const output = new FullTelemetryEnvelope({
    ...input,
    carSetups: normalizeCarSetups(input.carSetups),
    sessionHistoryByCar: { ...(input.sessionHistoryByCar ?? {}) },
    tyreSetsByCar: { ...(input.tyreSetsByCar ?? {}) },
    cars: [],
  });

  const carCount = detectCarCount(output);
  for (let carIndex = 0; carIndex < carCount; carIndex += 1) {
    output.cars.push(buildCarEnvelope(output, carIndex, sourceCars.get(carIndex)));
  }
  if (!output.capturedAt) {
    output.capturedAt = new Date();
  }
  return output;
}

export function getVisibleEnvelope(input, options = new ParseOptions()) {
  const envelope = ensureParsedEnvelope(input);
  const mode = normalizeMode(options.mode);
  const playerCarIndex = resolvePlayerCarIndex(envelope, options);
  const sourceCars = new Map((envelope.cars ?? []).map((car) => [car.carIndex, car]));

  const output = new FullTelemetryEnvelope({
    ...envelope,
    carSetups: getVisibleCarSetupsPacket(envelope.carSetups, envelope.participants, playerCarIndex),
    carStatus: getVisibleCarStatusPacket(envelope.carStatus, mode, playerCarIndex),
    carDamage: getVisibleCarDamagePacket(envelope.carDamage, mode, playerCarIndex),
    sessionHistoryByCar: { ...(envelope.sessionHistoryByCar ?? {}) },
    tyreSetsByCar: { ...(envelope.tyreSetsByCar ?? {}) },
    cars: [],
  });

  const carCount = detectCarCount(envelope);
  for (let carIndex = 0; carIndex < carCount; carIndex += 1) {
    output.cars.push(
      buildVisibleCarEnvelope(envelope, carIndex, sourceCars.get(carIndex), mode, playerCarIndex),
    );
  }
  if (!output.capturedAt) {
    output.capturedAt = new Date();
  }
  return output;
}

export function getVisibleCars(input, options = new ParseOptions()) {
  return getVisibleEnvelope(input, options).cars ?? [];
}

export function getVisibleCarEnvelope(input, carIndex, options = new ParseOptions()) {
  const envelope = ensureParsedEnvelope(input);
  const mode = normalizeMode(options.mode);
  const playerCarIndex = resolvePlayerCarIndex(envelope, options);
  const source = envelope.cars?.find((car) => car.carIndex === carIndex);
  return buildVisibleCarEnvelope(envelope, carIndex, source, mode, playerCarIndex);
}

export function getVisibleNormalizedCar(input, carIndex, options = new ParseOptions()) {
  return getVisibleCarEnvelope(input, carIndex, options)?.normalized ?? null;
}

export function getVisibleCarSetup(input, carIndex, options = new ParseOptions()) {
  const envelope = ensureParsedEnvelope(input);
  return getVisibleSetupAt(
    envelope.carSetups,
    envelope.participants,
    carIndex,
    resolvePlayerCarIndex(envelope, options),
  );
}

export function getVisibleCarStatus(input, carIndex, options = new ParseOptions()) {
  const envelope = ensureParsedEnvelope(input);
  const mode = normalizeMode(options.mode);
  const playerCarIndex = resolvePlayerCarIndex(envelope, options);
  return getVisibleStatusAt(envelope.carStatus, carIndex, mode, playerCarIndex);
}

export function getVisibleCarDamage(input, carIndex, options = new ParseOptions()) {
  const envelope = ensureParsedEnvelope(input);
  const mode = normalizeMode(options.mode);
  const playerCarIndex = resolvePlayerCarIndex(envelope, options);
  return getVisibleDamageAt(envelope.carDamage, carIndex, mode, playerCarIndex);
}

function ensureParsedEnvelope(input) {
  return input.cars?.length ? input : parseEnvelope(input);
}

function normalizeMode(mode) {
  return Object.values(ParseMode).includes(mode) ? mode : ParseMode.STRICT;
}

function resolvePlayerCarIndex(input, options) {
  return options.playerCarIndex ?? input.header?.playerCarIndex ?? null;
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

function buildCarEnvelope(envelope, carIndex, source) {
  return new CarEnvelope({
    carIndex,
    participant: envelope.participants?.participants?.[carIndex] ?? null,
    motion: envelope.motion?.carMotionData?.[carIndex] ?? null,
    lap: envelope.lapData?.lapData?.[carIndex] ?? null,
    setup: envelope.carSetups?.carSetups?.[carIndex] ?? null,
    telemetry: envelope.carTelemetry?.carTelemetryData?.[carIndex] ?? null,
    status: envelope.carStatus?.carStatusData?.[carIndex] ?? null,
    damage: envelope.carDamage?.carDamageData?.[carIndex] ?? null,
    history: envelope.sessionHistoryByCar?.[carIndex] ?? null,
    tyreSets: envelope.tyreSetsByCar?.[carIndex] ?? null,
    normalized: buildNormalizedCar(envelope, carIndex, source),
  });
}

function buildVisibleCarEnvelope(envelope, carIndex, source, mode, playerCarIndex) {
  return new CarEnvelope({
    carIndex,
    participant: envelope.participants?.participants?.[carIndex] ?? null,
    motion: envelope.motion?.carMotionData?.[carIndex] ?? null,
    lap: envelope.lapData?.lapData?.[carIndex] ?? null,
    setup: getVisibleSetupAt(envelope.carSetups, envelope.participants, carIndex, playerCarIndex) ?? null,
    telemetry: envelope.carTelemetry?.carTelemetryData?.[carIndex] ?? null,
    status: getVisibleStatusAt(envelope.carStatus, carIndex, mode, playerCarIndex) ?? null,
    damage: getVisibleDamageAt(envelope.carDamage, carIndex, mode, playerCarIndex) ?? null,
    history: envelope.sessionHistoryByCar?.[carIndex] ?? null,
    tyreSets: envelope.tyreSetsByCar?.[carIndex] ?? null,
    normalized: buildVisibleNormalizedCar(envelope, carIndex, source, mode, playerCarIndex),
  });
}

function buildNormalizedCar(envelope, carIndex, source) {
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
    tireCompound: resolveTireCompound(source, status),
    actualTyreCompound: status?.actualTyreCompound ?? null,
    tireAge: status?.tireAge ?? null,
    fuelInTank: status?.fuelInTank ?? null,
    fuelCapacity: status?.fuelCapacity ?? null,
    fuelRemainingLaps: status?.fuelRemainingLaps ?? null,
    fuelMix: status?.fuelMix ?? null,
    brakeBias: status?.brakeBias ?? null,
    ersStoreEnergy: status?.ersStoreEnergy ?? null,
    ersDeployMode: status?.ersDeployMode ?? null,
    ersDeployedThisLap: status?.ersDeployedThisLap ?? null,
    ersHarvestedMGUK: status?.ersHarvestedMGUK ?? null,
    ersHarvestedMGUH: status?.ersHarvestedMGUH ?? null,
    setup: envelope.carSetups?.carSetups?.[carIndex] ?? null,
    bestSector1Ms: history?.bestSector1Ms ?? null,
    bestSector2Ms: history?.bestSector2Ms ?? null,
    bestSector3Ms: history?.bestSector3Ms ?? null,
    availableSets: buildTyreSetBriefs(tyreSets, source),
    stintHistory: source?.normalized?.stintHistory ?? [],
    dynamics: source?.normalized?.dynamics ?? [],
    ersActualPct: source?.normalized?.ersActualPct ?? null,
    ersActualReady: source?.normalized?.ersActualReady ?? null,
    ersEstimatePct: source?.normalized?.ersEstimatePct ?? null,
    ersEstimateReady: source?.normalized?.ersEstimateReady ?? null,
  });

  if (damage) {
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
    normalized.tireWear = damage.tireWear ?? [0, 0, 0, 0];
  }

  return normalized;
}

function buildVisibleNormalizedCar(envelope, carIndex, source, mode, playerCarIndex) {
  const fullNormalized = source?.normalized ?? buildNormalizedCar(envelope, carIndex, source);
  const showPublicOrSelf = canExposePublicOrSelfForMode(mode, carIndex, playerCarIndex);
  const showERSEnergy = canExposeERSEnergyForMode(mode, carIndex, playerCarIndex);
  const showERSPct = canExposeERSPctForMode(mode, carIndex, playerCarIndex);
  const showDRSActivated = canExposeDRSActivatedForMode(mode, carIndex, playerCarIndex);
  const showSetup = canExposeSelfOrAi(carIndex, playerCarIndex, envelope.participants);
  const showDamage = canExposeDamageForMode(mode, carIndex, playerCarIndex);
  const showTireWear = canExposeTireWearForMode(mode, carIndex, playerCarIndex);

  const normalized = new NormalizedCar({
    ...fullNormalized,
    setup: showSetup ? fullNormalized.setup : null,
    drsActivated: showDRSActivated ? fullNormalized.drsActivated : null,
  });

  if (!showPublicOrSelf) {
    normalized.fuelInTank = null;
    normalized.fuelCapacity = null;
    normalized.fuelRemainingLaps = null;
    normalized.fuelMix = null;
    normalized.brakeBias = null;
    normalized.ersDeployMode = null;
    normalized.ersDeployedThisLap = null;
    normalized.ersHarvestedMGUK = null;
    normalized.ersHarvestedMGUH = null;
  }

  if (!showERSEnergy) {
    normalized.ersStoreEnergy = null;
  }

  if (!showDamage) {
    normalized.damage = null;
    normalized.tireWear = null;
  } else if (!showTireWear) {
    normalized.tireWear = null;
  }

  if (!showERSPct) {
    normalized.ersActualPct = null;
    normalized.ersActualReady = null;
    normalized.ersEstimatePct = null;
    normalized.ersEstimateReady = null;
  }

  return normalized;
}

function normalizeCarSetups(packet) {
  if (!packet?.carSetups) {
    return packet;
  }
  return {
    ...packet,
    carSetups: packet.carSetups.map((setup) => normalizeSetup(setup)),
  };
}

function getVisibleCarSetupsPacket(packet, participants, playerCarIndex) {
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

function getVisibleCarStatusPacket(packet, mode, playerCarIndex) {
  if (!packet?.carStatusData) {
    return packet;
  }
  return {
    ...packet,
    carStatusData: packet.carStatusData.map((status, index) =>
      filterCarStatusEntry(status, index, mode, playerCarIndex),
    ),
  };
}

function getVisibleCarDamagePacket(packet, mode, playerCarIndex) {
  if (!packet?.carDamageData) {
    return packet;
  }
  return {
    ...packet,
    carDamageData: packet.carDamageData.map((damage, index) =>
      filterCarDamageEntry(damage, index, mode, playerCarIndex),
    ),
  };
}

function getVisibleSetupAt(packet, participants, carIndex, playerCarIndex) {
  const setup = packet?.carSetups?.[carIndex];
  if (!setup) {
    return null;
  }
  return canExposeSelfOrAi(carIndex, playerCarIndex, participants)
    ? normalizeSetup(setup)
    : null;
}

function getVisibleStatusAt(packet, carIndex, mode, playerCarIndex) {
  const status = packet?.carStatusData?.[carIndex];
  if (!status) {
    return null;
  }
  return filterCarStatusEntry(status, carIndex, mode, playerCarIndex);
}

function getVisibleDamageAt(packet, carIndex, mode, playerCarIndex) {
  const damage = packet?.carDamageData?.[carIndex];
  if (!damage) {
    return null;
  }
  const filtered = filterCarDamageEntry(damage, carIndex, mode, playerCarIndex);
  return Object.keys(filtered).length > 0 ? filtered : null;
}

function filterCarStatusEntry(status, carIndex, mode, playerCarIndex) {
  const showPublicOrSelf = canExposePublicOrSelfForMode(mode, carIndex, playerCarIndex);
  const showERSEnergy = canExposeERSEnergyForMode(mode, carIndex, playerCarIndex);
  if (showPublicOrSelf) {
    return { ...status };
  }
  return {
    ...status,
    fuelInTank: null,
    fuelCapacity: null,
    fuelRemainingLaps: null,
    fuelMix: null,
    brakeBias: null,
    ersStoreEnergy: showERSEnergy ? status.ersStoreEnergy : null,
    ersDeployMode: null,
    ersHarvestedMGUK: null,
    ersHarvestedMGUH: null,
    ersDeployedThisLap: null,
  };
}

function filterCarDamageEntry(damage, carIndex, mode, playerCarIndex) {
  const showPublicOrSelf = canExposePublicOrSelfForMode(mode, carIndex, playerCarIndex);
  const showDamage = canExposeDamageForMode(mode, carIndex, playerCarIndex);
  if (showPublicOrSelf) {
    return { ...damage };
  }
  if (showDamage) {
    return {
      ...damage,
      tireWear: null,
    };
  }
  return {};
}

function canExposePublicOrSelfForMode(mode, carIndex, playerCarIndex) {
  return mode === ParseMode.PUBLIC || (playerCarIndex !== null && playerCarIndex === carIndex);
}

function canExposeERSPctForMode(mode, carIndex, playerCarIndex) {
  return mode === ParseMode.PUBLIC || (playerCarIndex !== null && playerCarIndex === carIndex);
}

function canExposeERSEnergyForMode(mode, carIndex, playerCarIndex) {
  return mode === ParseMode.PUBLIC || mode === ParseMode.FRC || (playerCarIndex !== null && playerCarIndex === carIndex);
}

function canExposeDRSActivatedForMode(mode, carIndex, playerCarIndex) {
  return mode === ParseMode.PUBLIC
    || mode === ParseMode.FRC
    || mode === ParseMode.DRIVERS
    || (playerCarIndex !== null && playerCarIndex === carIndex);
}

function canExposeDamageForMode(mode, carIndex, playerCarIndex) {
  return mode === ParseMode.PUBLIC
    || mode === ParseMode.FRC
    || mode === ParseMode.DRIVERS
    || (playerCarIndex !== null && playerCarIndex === carIndex);
}

function canExposeTireWearForMode(mode, carIndex, playerCarIndex) {
  return mode === ParseMode.PUBLIC || (playerCarIndex !== null && playerCarIndex === carIndex);
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
