package frc.engineer.packets

data class PacketHeader(
    val packetFormat: Int? = null,
    val gameYear: Int? = null,
    val gameMajorVersion: Int? = null,
    val gameMinorVersion: Int? = null,
    val packetVersion: Int? = null,
    val packetId: Int? = null,
    val sessionUid: Long? = null,
    val sessionTime: Float? = null,
    val frameIdentifier: Long? = null,
    val overallFrameIdentifier: Long? = null,
    val playerCarIndex: Int? = null,
    val secondaryPlayerCarIndex: Int? = null,
)

data class PacketSessionData(
    val weather: Int? = null,
    val trackTemperature: Int? = null,
    val airTemperature: Int? = null,
    val totalLaps: Int? = null,
    val trackLength: Int? = null,
    val sessionType: Int? = null,
    val trackId: Int? = null,
    val pitSpeedLimit: Int? = null,
)

data class PacketEventData(
    val eventStringCode: String? = null,
    val details: String? = null,
)

data class ParticipantData(
    val aiControlled: Boolean? = null,
    val driverId: Int? = null,
    val networkId: Int? = null,
    val teamId: Int? = null,
    val name: String? = null,
    val yourTelemetry: Int? = null,
)

data class PacketParticipantsData(
    val participants: List<ParticipantData> = emptyList(),
)

data class CarMotionData(
    val worldPositionX: Float? = null,
    val worldPositionY: Float? = null,
    val worldPositionZ: Float? = null,
    val worldVelocityX: Float? = null,
    val worldVelocityY: Float? = null,
    val worldVelocityZ: Float? = null,
    val gForceLateral: Float? = null,
    val gForceLongitudinal: Float? = null,
    val gForceVertical: Float? = null,
    val yaw: Float? = null,
    val pitch: Float? = null,
    val roll: Float? = null,
)

data class PacketMotionData(
    val carMotionData: List<CarMotionData> = emptyList(),
)

data class LapData(
    val position: Int? = null,
    val currentLapNum: Int? = null,
    val lapDistance: Float? = null,
    val lastLapTime: Float? = null,
    val bestLapTime: Float? = null,
    val sector1TimeMs: Int? = null,
    val sector2TimeMs: Int? = null,
    val currentSector: Int? = null,
    val deltaToCarInFront: Int? = null,
    val deltaToRaceLeader: Int? = null,
    val pitStatus: Int? = null,
    val driverStatus: Int? = null,
    val resultStatus: Int? = null,
    val numPitStops: Int? = null,
    val pitStopTimer: Float? = null,
    val pitLaneTime: Int? = null,
    val penalties: Int? = null,
    val totalWarnings: Int? = null,
    val cornerCuttingWarnings: Int? = null,
    val numUnservedDriveThroughs: Int? = null,
    val numUnservedStopGoPenalties: Int? = null,
    val lapInvalid: Boolean? = null,
)

data class PacketLapData(
    val lapData: List<LapData> = emptyList(),
)

data class CarSetupData(
    val frontWing: Int? = null,
    val rearWing: Int? = null,
    val onThrottle: Int? = null,
    val diffOnThrottle: Int? = null,
    val offThrottle: Int? = null,
    val frontCamber: Float? = null,
    val rearCamber: Float? = null,
    val frontToe: Float? = null,
    val rearToe: Float? = null,
    val frontSuspension: Int? = null,
    val rearSuspension: Int? = null,
    val frontAntiRollBar: Int? = null,
    val rearAntiRollBar: Int? = null,
    val frontSuspensionHeight: Int? = null,
    val rearSuspensionHeight: Int? = null,
    val brakePressure: Int? = null,
    val brakeBias: Int? = null,
    val rearLeftTyrePressure: Float? = null,
    val rearRightTyrePressure: Float? = null,
    val frontLeftTyrePressure: Float? = null,
    val frontRightTyrePressure: Float? = null,
    val ballast: Int? = null,
    val fuelLoad: Float? = null,
)

data class PacketCarSetupData(
    val carSetups: List<CarSetupData> = emptyList(),
)

data class CarTelemetryData(
    val speed: Int? = null,
    val throttle: Float? = null,
    val brake: Float? = null,
    val steering: Float? = null,
    val gear: Int? = null,
    val brakeTemp: List<Int> = listOf(0, 0, 0, 0),
    val tireSurfaceTemp: List<Int> = listOf(0, 0, 0, 0),
    val tireInnerTemp: List<Int> = listOf(0, 0, 0, 0),
    val tirePressure: List<Float> = listOf(0f, 0f, 0f, 0f),
    val surfaceType: List<Int> = listOf(0, 0, 0, 0),
    val engineRpm: Int? = null,
    val drs: Int? = null,
)

data class PacketCarTelemetryData(
    val carTelemetryData: List<CarTelemetryData> = emptyList(),
)

data class CarStatusData(
    val tractionControl: Int? = null,
    val antiLockBrakes: Int? = null,
    val fuelMix: Int? = null,
    val brakeBias: Int? = null,
    val pitLimiterStatus: Int? = null,
    val fuelInTank: Float? = null,
    val fuelCapacity: Float? = null,
    val fuelRemainingLaps: Float? = null,
    val maxRpm: Int? = null,
    val idleRpm: Int? = null,
    val maxGears: Int? = null,
    val drsAllowed: Int? = null,
    val actualTyreCompound: Int? = null,
    val visualTyreCompound: Int? = null,
    val tireAge: Int? = null,
    val vehicleFiaFlags: Int? = null,
    val ersStoreEnergy: Float? = null,
    val ersDeployMode: Int? = null,
    val ersHarvestedMGUK: Float? = null,
    val ersHarvestedMGUH: Float? = null,
    val ersDeployedThisLap: Float? = null,
)

data class PacketCarStatusData(
    val carStatusData: List<CarStatusData> = emptyList(),
)

data class CarDamageData(
    val tireWear: List<Int> = listOf(0, 0, 0, 0),
    val tiresDamage: List<Int> = listOf(0, 0, 0, 0),
    val brakesDamage: List<Int> = listOf(0, 0, 0, 0),
    val frontLeftWingDamage: Int? = null,
    val frontRightWingDamage: Int? = null,
    val rearWingDamage: Int? = null,
    val floorDamage: Int? = null,
    val diffuserDamage: Int? = null,
    val sidepodDamage: Int? = null,
    val gearboxDamage: Int? = null,
    val engineDamage: Int? = null,
)

data class PacketCarDamageData(
    val carDamageData: List<CarDamageData> = emptyList(),
)

data class LapHistoryData(
    val lapTimeInMs: Long? = null,
    val sector1TimeInMs: Int? = null,
    val sector2TimeInMs: Int? = null,
    val sector3TimeInMs: Int? = null,
    val lapValidBitFlags: Int? = null,
)

data class PacketSessionHistoryData(
    val carIndex: Int? = null,
    val numLaps: Int? = null,
    val bestLapTimeLapNum: Int? = null,
    val bestSector1LapNum: Int? = null,
    val bestSector2LapNum: Int? = null,
    val bestSector3LapNum: Int? = null,
    val bestSector1Ms: Int? = null,
    val bestSector2Ms: Int? = null,
    val bestSector3Ms: Int? = null,
    val lapHistoryData: List<LapHistoryData> = emptyList(),
)

data class TyreSetData(
    val actualTyreCompound: Int? = null,
    val visualTyreCompound: Int? = null,
    val wear: Int? = null,
    val available: Boolean? = null,
    val recommendedSession: Int? = null,
)

data class PacketTyreSetsData(
    val carIndex: Int? = null,
    val fittedIdx: Int? = null,
    val availableSets: List<TyreSetData> = emptyList(),
)
