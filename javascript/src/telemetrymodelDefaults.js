function apply(target, init = {}) {
  Object.assign(target, init);
}

function normalizedCar(target, init = {}) {
  target.index = init.index ?? 0;
  target.name = null;
  target.teamId = null;
  target.yourTelemetry = null;
  target.aiControlled = null;
  target.position = null;
  target.currentLapNum = null;
  target.lapDistance = null;
  target.speed = null;
  target.throttle = null;
  target.brake = null;
  target.steering = null;
  target.gear = null;
  target.brakeTemp = [0, 0, 0, 0];
  target.tireSurfaceTemp = [0, 0, 0, 0];
  target.tireInnerTemp = [0, 0, 0, 0];
  target.tirePressure = [0, 0, 0, 0];
  target.surfaceType = [0, 0, 0, 0];
  target.drsActivated = null;
  target.lastLapTime = null;
  target.bestLapTime = null;
  target.sector1TimeMs = null;
  target.sector2TimeMs = null;
  target.currentSector = null;
  target.deltaToCarInFront = null;
  target.deltaToRaceLeader = null;
  target.pitStatus = null;
  target.driverStatus = null;
  target.resultStatus = null;
  target.numPitStops = null;
  target.pitStopTimer = null;
  target.pitLaneTime = null;
  target.penalties = null;
  target.totalWarnings = null;
  target.cornerCuttingWarnings = null;
  target.numUnservedDriveThroughs = null;
  target.numUnservedStopGoPenalties = null;
  target.lapInvalid = null;
  target.tireCompound = null;
  target.actualTyreCompound = null;
  target.tireAge = null;
  target.fuelInTank = null;
  target.fuelCapacity = null;
  target.fuelRemainingLaps = null;
  target.fuelMix = null;
  target.brakeBias = null;
  target.ersStoreEnergy = null;
  target.ersDeployMode = null;
  target.ersDeployedThisLap = null;
  target.ersHarvestedMGUK = null;
  target.ersHarvestedMGUH = null;
  target.tireWear = [0, 0, 0, 0];
  target.damage = null;
  target.setup = null;
  target.bestSector1Ms = null;
  target.bestSector2Ms = null;
  target.bestSector3Ms = null;
  target.availableSets = [];
  target.stintHistory = [];
  target.dynamics = [];
  target.ersActualPct = null;
  target.ersActualReady = null;
  target.ersEstimatePct = null;
  target.ersEstimateReady = null;
  apply(target, init);
}

function carEnvelope(target, init = {}) {
  target.carIndex = init.carIndex ?? 0;
  target.participant = null;
  target.motion = null;
  target.lap = null;
  target.setup = null;
  target.telemetry = null;
  target.status = null;
  target.damage = null;
  target.history = null;
  target.tyreSets = null;
  target.normalized = init.normalized ?? { index: target.carIndex };
  apply(target, init);
}

function fullEnvelope(target, init = {}) {
  target.capturedAt = init.capturedAt ?? null;
  target.header = null;
  target.session = null;
  target.lastEvent = null;
  target.participants = null;
  target.motion = null;
  target.lapData = null;
  target.carSetups = null;
  target.carTelemetry = null;
  target.carStatus = null;
  target.carDamage = null;
  target.sessionHistoryByCar = {};
  target.tyreSetsByCar = {};
  target.cars = [];
  target.pitwall = null;
  apply(target, init);
}

export const withTelemetryDefaults = {
  normalizedCar,
  carEnvelope,
  fullEnvelope,
};
