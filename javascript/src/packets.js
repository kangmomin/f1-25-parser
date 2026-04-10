function withInit(target, init = {}) {
  Object.assign(target, init);
}

export class PacketHeader {
  constructor(init = {}) {
    this.packetFormat = null;
    this.gameYear = null;
    this.gameMajorVersion = null;
    this.gameMinorVersion = null;
    this.packetVersion = null;
    this.packetId = null;
    this.sessionUid = null;
    this.sessionTime = null;
    this.frameIdentifier = null;
    this.overallFrameIdentifier = null;
    this.playerCarIndex = null;
    this.secondaryPlayerCarIndex = null;
    withInit(this, init);
  }
}

export class PacketSessionData {
  constructor(init = {}) {
    this.weather = null;
    this.trackTemperature = null;
    this.airTemperature = null;
    this.totalLaps = null;
    this.trackLength = null;
    this.sessionType = null;
    this.trackId = null;
    this.pitSpeedLimit = null;
    withInit(this, init);
  }
}

export class PacketEventData {
  constructor(init = {}) {
    this.eventStringCode = null;
    this.details = null;
    withInit(this, init);
  }
}

export class ParticipantData {
  constructor(init = {}) {
    this.aiControlled = null;
    this.driverId = null;
    this.networkId = null;
    this.teamId = null;
    this.name = null;
    this.yourTelemetry = null;
    withInit(this, init);
  }
}

export class PacketParticipantsData {
  constructor(init = {}) {
    this.participants = [];
    withInit(this, init);
  }
}

export class CarMotionData {
  constructor(init = {}) {
    this.worldPositionX = null;
    this.worldPositionY = null;
    this.worldPositionZ = null;
    this.worldVelocityX = null;
    this.worldVelocityY = null;
    this.worldVelocityZ = null;
    this.gForceLateral = null;
    this.gForceLongitudinal = null;
    this.gForceVertical = null;
    this.yaw = null;
    this.pitch = null;
    this.roll = null;
    withInit(this, init);
  }
}

export class PacketMotionData {
  constructor(init = {}) {
    this.carMotionData = [];
    withInit(this, init);
  }
}

export class LapData {
  constructor(init = {}) {
    this.position = null;
    this.currentLapNum = null;
    this.lapDistance = null;
    this.lastLapTime = null;
    this.bestLapTime = null;
    this.sector1TimeMs = null;
    this.sector2TimeMs = null;
    this.currentSector = null;
    this.deltaToCarInFront = null;
    this.deltaToRaceLeader = null;
    this.pitStatus = null;
    this.driverStatus = null;
    this.resultStatus = null;
    this.numPitStops = null;
    this.pitStopTimer = null;
    this.pitLaneTime = null;
    this.penalties = null;
    this.totalWarnings = null;
    this.cornerCuttingWarnings = null;
    this.numUnservedDriveThroughs = null;
    this.numUnservedStopGoPenalties = null;
    this.lapInvalid = null;
    withInit(this, init);
  }
}

export class PacketLapData {
  constructor(init = {}) {
    this.lapData = [];
    withInit(this, init);
  }
}

export class CarSetupData {
  constructor(init = {}) {
    this.frontWing = null;
    this.rearWing = null;
    this.onThrottle = null;
    this.diffOnThrottle = null;
    this.offThrottle = null;
    this.frontCamber = null;
    this.rearCamber = null;
    this.frontToe = null;
    this.rearToe = null;
    this.frontSuspension = null;
    this.rearSuspension = null;
    this.frontAntiRollBar = null;
    this.rearAntiRollBar = null;
    this.frontSuspensionHeight = null;
    this.rearSuspensionHeight = null;
    this.brakePressure = null;
    this.brakeBias = null;
    this.rearLeftTyrePressure = null;
    this.rearRightTyrePressure = null;
    this.frontLeftTyrePressure = null;
    this.frontRightTyrePressure = null;
    this.ballast = null;
    this.fuelLoad = null;
    withInit(this, init);
  }
}

export class PacketCarSetupData {
  constructor(init = {}) {
    this.carSetups = [];
    withInit(this, init);
  }
}

export class CarTelemetryData {
  constructor(init = {}) {
    this.speed = null;
    this.throttle = null;
    this.brake = null;
    this.steering = null;
    this.gear = null;
    this.brakeTemp = [0, 0, 0, 0];
    this.tireSurfaceTemp = [0, 0, 0, 0];
    this.tireInnerTemp = [0, 0, 0, 0];
    this.tirePressure = [0, 0, 0, 0];
    this.surfaceType = [0, 0, 0, 0];
    this.engineRpm = null;
    this.drs = null;
    withInit(this, init);
  }
}

export class PacketCarTelemetryData {
  constructor(init = {}) {
    this.carTelemetryData = [];
    withInit(this, init);
  }
}

export class CarStatusData {
  constructor(init = {}) {
    this.tractionControl = null;
    this.antiLockBrakes = null;
    this.fuelMix = null;
    this.brakeBias = null;
    this.pitLimiterStatus = null;
    this.fuelInTank = null;
    this.fuelCapacity = null;
    this.fuelRemainingLaps = null;
    this.maxRpm = null;
    this.idleRpm = null;
    this.maxGears = null;
    this.drsAllowed = null;
    this.actualTyreCompound = null;
    this.visualTyreCompound = null;
    this.tireAge = null;
    this.vehicleFiaFlags = null;
    this.ersStoreEnergy = null;
    this.ersDeployMode = null;
    this.ersHarvestedMGUK = null;
    this.ersHarvestedMGUH = null;
    this.ersDeployedThisLap = null;
    withInit(this, init);
  }
}

export class PacketCarStatusData {
  constructor(init = {}) {
    this.carStatusData = [];
    withInit(this, init);
  }
}

export class CarDamageData {
  constructor(init = {}) {
    this.tireWear = [0, 0, 0, 0];
    this.tiresDamage = [0, 0, 0, 0];
    this.brakesDamage = [0, 0, 0, 0];
    this.frontLeftWingDamage = null;
    this.frontRightWingDamage = null;
    this.rearWingDamage = null;
    this.floorDamage = null;
    this.diffuserDamage = null;
    this.sidepodDamage = null;
    this.gearboxDamage = null;
    this.engineDamage = null;
    withInit(this, init);
  }
}

export class PacketCarDamageData {
  constructor(init = {}) {
    this.carDamageData = [];
    withInit(this, init);
  }
}

export class LapHistoryData {
  constructor(init = {}) {
    this.lapTimeInMs = null;
    this.sector1TimeInMs = null;
    this.sector2TimeInMs = null;
    this.sector3TimeInMs = null;
    this.lapValidBitFlags = null;
    withInit(this, init);
  }
}

export class PacketSessionHistoryData {
  constructor(init = {}) {
    this.carIndex = null;
    this.numLaps = null;
    this.bestLapTimeLapNum = null;
    this.bestSector1LapNum = null;
    this.bestSector2LapNum = null;
    this.bestSector3LapNum = null;
    this.bestSector1Ms = null;
    this.bestSector2Ms = null;
    this.bestSector3Ms = null;
    this.lapHistoryData = [];
    withInit(this, init);
  }
}

export class TyreSetData {
  constructor(init = {}) {
    this.actualTyreCompound = null;
    this.visualTyreCompound = null;
    this.wear = null;
    this.available = null;
    this.recommendedSession = null;
    withInit(this, init);
  }
}

export class PacketTyreSetsData {
  constructor(init = {}) {
    this.carIndex = null;
    this.fittedIdx = null;
    this.availableSets = [];
    withInit(this, init);
  }
}
