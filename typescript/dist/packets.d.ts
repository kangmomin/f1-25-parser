export interface PacketHeader {
    packetFormat?: number;
    gameYear?: number;
    gameMajorVersion?: number;
    gameMinorVersion?: number;
    packetVersion?: number;
    packetId?: number;
    sessionUid?: number;
    sessionTime?: number;
    frameIdentifier?: number;
    overallFrameIdentifier?: number;
    playerCarIndex?: number;
    secondaryPlayerCarIndex?: number;
}
export interface PacketSessionData {
    weather?: number;
    trackTemperature?: number;
    airTemperature?: number;
    totalLaps?: number;
    trackLength?: number;
    sessionType?: number;
    trackId?: number;
    pitSpeedLimit?: number;
}
export interface PacketEventData {
    eventStringCode?: string;
    details?: string;
}
export interface ParticipantData {
    aiControlled?: boolean;
    driverId?: number;
    networkId?: number;
    teamId?: number;
    name?: string;
    yourTelemetry?: number;
}
export interface PacketParticipantsData {
    participants?: ParticipantData[];
}
export interface CarMotionData {
    worldPositionX?: number;
    worldPositionY?: number;
    worldPositionZ?: number;
    worldVelocityX?: number;
    worldVelocityY?: number;
    worldVelocityZ?: number;
    gForceLateral?: number;
    gForceLongitudinal?: number;
    gForceVertical?: number;
    yaw?: number;
    pitch?: number;
    roll?: number;
}
export interface PacketMotionData {
    carMotionData?: CarMotionData[];
}
export interface LapData {
    position?: number;
    currentLapNum?: number;
    lapDistance?: number;
    lastLapTime?: number;
    bestLapTime?: number;
    sector1TimeMs?: number;
    sector2TimeMs?: number;
    currentSector?: number;
    deltaToCarInFront?: number;
    deltaToRaceLeader?: number;
    pitStatus?: number;
    driverStatus?: number;
    resultStatus?: number;
    numPitStops?: number;
    pitStopTimer?: number;
    pitLaneTime?: number;
    penalties?: number;
    totalWarnings?: number;
    cornerCuttingWarnings?: number;
    numUnservedDriveThroughs?: number;
    numUnservedStopGoPenalties?: number;
    lapInvalid?: boolean;
}
export interface PacketLapData {
    lapData?: LapData[];
}
export interface CarSetupData {
    frontWing?: number;
    rearWing?: number;
    onThrottle?: number;
    offThrottle?: number;
    frontCamber?: number;
    rearCamber?: number;
    frontToe?: number;
    rearToe?: number;
    frontSuspension?: number;
    rearSuspension?: number;
    frontAntiRollBar?: number;
    rearAntiRollBar?: number;
    frontSuspensionHeight?: number;
    rearSuspensionHeight?: number;
    brakePressure?: number;
    brakeBias?: number;
    rearLeftTyrePressure?: number;
    rearRightTyrePressure?: number;
    frontLeftTyrePressure?: number;
    frontRightTyrePressure?: number;
    ballast?: number;
    fuelLoad?: number;
}
export interface PacketCarSetupData {
    carSetups?: CarSetupData[];
}
export interface CarTelemetryData {
    speed?: number;
    throttle?: number;
    brake?: number;
    steering?: number;
    gear?: number;
    brakeTemp?: [number, number, number, number];
    tireSurfaceTemp?: [number, number, number, number];
    tireInnerTemp?: [number, number, number, number];
    tirePressure?: [number, number, number, number];
    surfaceType?: [number, number, number, number];
    engineRpm?: number;
    drs?: number;
}
export interface PacketCarTelemetryData {
    carTelemetryData?: CarTelemetryData[];
}
export interface CarStatusData {
    tractionControl?: number;
    antiLockBrakes?: number;
    fuelMix?: number;
    brakeBias?: number;
    pitLimiterStatus?: number;
    fuelInTank?: number;
    fuelCapacity?: number;
    fuelRemainingLaps?: number;
    maxRpm?: number;
    idleRpm?: number;
    maxGears?: number;
    drsAllowed?: number;
    actualTyreCompound?: number;
    visualTyreCompound?: number;
    tireAge?: number;
    vehicleFiaFlags?: number;
    ersStoreEnergy?: number;
    ersDeployMode?: number;
    ersHarvestedMGUK?: number;
    ersHarvestedMGUH?: number;
    ersDeployedThisLap?: number;
}
export interface PacketCarStatusData {
    carStatusData?: CarStatusData[];
}
export interface CarDamageData {
    tireWear?: [number, number, number, number];
    tiresDamage?: [number, number, number, number];
    brakesDamage?: [number, number, number, number];
    frontLeftWingDamage?: number;
    frontRightWingDamage?: number;
    rearWingDamage?: number;
    floorDamage?: number;
    diffuserDamage?: number;
    sidepodDamage?: number;
    gearboxDamage?: number;
    engineDamage?: number;
}
export interface PacketCarDamageData {
    carDamageData?: CarDamageData[];
}
export interface LapHistoryData {
    lapTimeInMs?: number;
    sector1TimeInMs?: number;
    sector2TimeInMs?: number;
    sector3TimeInMs?: number;
    lapValidBitFlags?: number;
}
export interface PacketSessionHistoryData {
    carIndex?: number;
    numLaps?: number;
    bestLapTimeLapNum?: number;
    bestSector1LapNum?: number;
    bestSector2LapNum?: number;
    bestSector3LapNum?: number;
    bestSector1Ms?: number;
    bestSector2Ms?: number;
    bestSector3Ms?: number;
    lapHistoryData?: LapHistoryData[];
}
export interface TyreSetData {
    actualTyreCompound?: number;
    visualTyreCompound?: number;
    wear?: number;
    available?: boolean;
    recommendedSession?: number;
}
export interface PacketTyreSetsData {
    carIndex?: number;
    fittedIdx?: number;
    availableSets?: TyreSetData[];
}
