package packets

// PacketHeader is a lightweight session/frame header.
type PacketHeader struct {
	PacketFormat            uint16  `json:"packetFormat,omitempty"`
	GameYear                uint16  `json:"gameYear,omitempty"`
	GameMajorVersion        uint8   `json:"gameMajorVersion,omitempty"`
	GameMinorVersion        uint8   `json:"gameMinorVersion,omitempty"`
	PacketVersion           uint8   `json:"packetVersion,omitempty"`
	PacketID                uint8   `json:"packetId,omitempty"`
	SessionUID              uint64  `json:"sessionUid,omitempty"`
	SessionTime             float32 `json:"sessionTime,omitempty"`
	FrameIdentifier         uint32  `json:"frameIdentifier,omitempty"`
	OverallFrameIdentifier  uint32  `json:"overallFrameIdentifier,omitempty"`
	PlayerCarIndex          uint8   `json:"playerCarIndex,omitempty"`
	SecondaryPlayerCarIndex uint8   `json:"secondaryPlayerCarIndex,omitempty"`
}

// PacketSessionData contains basic session-wide metadata.
type PacketSessionData struct {
	Weather          uint8  `json:"weather,omitempty"`
	TrackTemperature int8   `json:"trackTemperature,omitempty"`
	AirTemperature   int8   `json:"airTemperature,omitempty"`
	TotalLaps        uint8  `json:"totalLaps,omitempty"`
	TrackLength      uint16 `json:"trackLength,omitempty"`
	SessionType      uint8  `json:"sessionType,omitempty"`
	TrackID          int8   `json:"trackId,omitempty"`
	PitSpeedLimit    uint8  `json:"pitSpeedLimit,omitempty"`
}

// PacketEventData represents the last event frame seen by the app.
type PacketEventData struct {
	EventStringCode string `json:"eventStringCode,omitempty"`
	Details         string `json:"details,omitempty"`
}

// ParticipantData represents one car/driver entry.
type ParticipantData struct {
	AiControlled  bool   `json:"aiControlled,omitempty"`
	DriverID      uint8  `json:"driverId,omitempty"`
	NetworkID     uint8  `json:"networkId,omitempty"`
	TeamID        int    `json:"teamId,omitempty"`
	Name          string `json:"name,omitempty"`
	YourTelemetry uint8  `json:"yourTelemetry,omitempty"`
}

// PacketParticipantsData wraps the participant list.
type PacketParticipantsData struct {
	Participants []ParticipantData `json:"participants,omitempty"`
}

// CarMotionData stores simplified motion values for one car.
type CarMotionData struct {
	WorldPositionX     float32 `json:"worldPositionX,omitempty"`
	WorldPositionY     float32 `json:"worldPositionY,omitempty"`
	WorldPositionZ     float32 `json:"worldPositionZ,omitempty"`
	WorldVelocityX     float32 `json:"worldVelocityX,omitempty"`
	WorldVelocityY     float32 `json:"worldVelocityY,omitempty"`
	WorldVelocityZ     float32 `json:"worldVelocityZ,omitempty"`
	GForceLateral      float32 `json:"gForceLateral,omitempty"`
	GForceLongitudinal float32 `json:"gForceLongitudinal,omitempty"`
	GForceVertical     float32 `json:"gForceVertical,omitempty"`
	Yaw                float32 `json:"yaw,omitempty"`
	Pitch              float32 `json:"pitch,omitempty"`
	Roll               float32 `json:"roll,omitempty"`
}

// PacketMotionData wraps car motion data for the grid.
type PacketMotionData struct {
	CarMotionData []CarMotionData `json:"carMotionData,omitempty"`
}

// LapData stores simplified lap/race state for one car.
type LapData struct {
	Position                   int     `json:"position,omitempty"`
	CurrentLapNum              int     `json:"currentLapNum,omitempty"`
	LapDistance                float32 `json:"lapDistance,omitempty"`
	LastLapTime                float32 `json:"lastLapTime,omitempty"`
	BestLapTime                float32 `json:"bestLapTime,omitempty"`
	Sector1TimeMs              int     `json:"sector1TimeMs,omitempty"`
	Sector2TimeMs              int     `json:"sector2TimeMs,omitempty"`
	CurrentSector              int     `json:"currentSector,omitempty"`
	DeltaToCarInFront          int     `json:"deltaToCarInFront,omitempty"`
	DeltaToRaceLeader          int     `json:"deltaToRaceLeader,omitempty"`
	PitStatus                  int     `json:"pitStatus,omitempty"`
	DriverStatus               int     `json:"driverStatus,omitempty"`
	ResultStatus               int     `json:"resultStatus,omitempty"`
	NumPitStops                int     `json:"numPitStops,omitempty"`
	PitStopTimer               float32 `json:"pitStopTimer,omitempty"`
	PitLaneTime                int     `json:"pitLaneTime,omitempty"`
	Penalties                  int     `json:"penalties,omitempty"`
	TotalWarnings              int     `json:"totalWarnings,omitempty"`
	CornerCuttingWarnings      int     `json:"cornerCuttingWarnings,omitempty"`
	NumUnservedDriveThroughs   int     `json:"numUnservedDriveThroughs,omitempty"`
	NumUnservedStopGoPenalties int     `json:"numUnservedStopGoPenalties,omitempty"`
	LapInvalid                 bool    `json:"lapInvalid,omitempty"`
}

// PacketLapData wraps per-car lap data.
type PacketLapData struct {
	LapData []LapData `json:"lapData,omitempty"`
}

// CarSetupData stores simplified setup data for one car.
type CarSetupData struct {
	FrontWing              uint8   `json:"frontWing,omitempty"`
	RearWing               uint8   `json:"rearWing,omitempty"`
	OnThrottle             uint8   `json:"onThrottle,omitempty"`
	OffThrottle            uint8   `json:"offThrottle,omitempty"`
	FrontCamber            float32 `json:"frontCamber,omitempty"`
	RearCamber             float32 `json:"rearCamber,omitempty"`
	FrontToe               float32 `json:"frontToe,omitempty"`
	RearToe                float32 `json:"rearToe,omitempty"`
	FrontSuspension        uint8   `json:"frontSuspension,omitempty"`
	RearSuspension         uint8   `json:"rearSuspension,omitempty"`
	FrontAntiRollBar       uint8   `json:"frontAntiRollBar,omitempty"`
	RearAntiRollBar        uint8   `json:"rearAntiRollBar,omitempty"`
	FrontSuspensionHeight  uint8   `json:"frontSuspensionHeight,omitempty"`
	RearSuspensionHeight   uint8   `json:"rearSuspensionHeight,omitempty"`
	BrakePressure          uint8   `json:"brakePressure,omitempty"`
	BrakeBias              uint8   `json:"brakeBias,omitempty"`
	RearLeftTyrePressure   float32 `json:"rearLeftTyrePressure,omitempty"`
	RearRightTyrePressure  float32 `json:"rearRightTyrePressure,omitempty"`
	FrontLeftTyrePressure  float32 `json:"frontLeftTyrePressure,omitempty"`
	FrontRightTyrePressure float32 `json:"frontRightTyrePressure,omitempty"`
	Ballast                uint8   `json:"ballast,omitempty"`
	FuelLoad               float32 `json:"fuelLoad,omitempty"`
}

// PacketCarSetupData wraps setup data for the grid.
type PacketCarSetupData struct {
	CarSetups []CarSetupData `json:"carSetups,omitempty"`
}

// CarTelemetryData stores raw driving telemetry for one car.
type CarTelemetryData struct {
	Speed           uint16     `json:"speed,omitempty"`
	Throttle        float32    `json:"throttle,omitempty"`
	Brake           float32    `json:"brake,omitempty"`
	Steering        float32    `json:"steering,omitempty"`
	Gear            int8       `json:"gear,omitempty"`
	BrakeTemp       [4]uint16  `json:"brakeTemp,omitempty"`
	TireSurfaceTemp [4]uint8   `json:"tireSurfaceTemp,omitempty"`
	TireInnerTemp   [4]uint8   `json:"tireInnerTemp,omitempty"`
	TirePressure    [4]float32 `json:"tirePressure,omitempty"`
	SurfaceType     [4]uint8   `json:"surfaceType,omitempty"`
	EngineRPM       uint16     `json:"engineRpm,omitempty"`
	DRS             uint8      `json:"drs,omitempty"`
}

// PacketCarTelemetryData wraps telemetry data for the grid.
type PacketCarTelemetryData struct {
	CarTelemetryData []CarTelemetryData `json:"carTelemetryData,omitempty"`
}

// CarStatusData stores car status fields that may be visibility-restricted.
type CarStatusData struct {
	TractionControl    uint8   `json:"tractionControl,omitempty"`
	AntiLockBrakes     uint8   `json:"antiLockBrakes,omitempty"`
	FuelMix            uint8   `json:"fuelMix,omitempty"`
	BrakeBias          uint8   `json:"brakeBias,omitempty"`
	PitLimiterStatus   uint8   `json:"pitLimiterStatus,omitempty"`
	FuelInTank         float32 `json:"fuelInTank,omitempty"`
	FuelCapacity       float32 `json:"fuelCapacity,omitempty"`
	FuelRemainingLaps  float32 `json:"fuelRemainingLaps,omitempty"`
	MaxRPM             uint16  `json:"maxRpm,omitempty"`
	IdleRPM            uint16  `json:"idleRpm,omitempty"`
	MaxGears           uint8   `json:"maxGears,omitempty"`
	DRSAllowed         uint8   `json:"drsAllowed,omitempty"`
	ActualTyreCompound uint8   `json:"actualTyreCompound,omitempty"`
	VisualTyreCompound uint8   `json:"visualTyreCompound,omitempty"`
	TireAge            uint8   `json:"tireAge,omitempty"`
	VehicleFiaFlags    int8    `json:"vehicleFiaFlags,omitempty"`
	ERSStoreEnergy     float32 `json:"ersStoreEnergy,omitempty"`
	ERSDeployMode      uint8   `json:"ersDeployMode,omitempty"`
	ERSHarvestedMGUK   float32 `json:"ersHarvestedMGUK,omitempty"`
	ERSHarvestedMGUH   float32 `json:"ersHarvestedMGUH,omitempty"`
	ERSDeployedThisLap float32 `json:"ersDeployedThisLap,omitempty"`
}

// PacketCarStatusData wraps status data for the grid.
type PacketCarStatusData struct {
	CarStatusData []CarStatusData `json:"carStatusData,omitempty"`
}

// CarDamageData stores car damage fields for one car.
type CarDamageData struct {
	TireWear             [4]int   `json:"tireWear,omitempty"`
	TiresDamage          [4]uint8 `json:"tiresDamage,omitempty"`
	BrakesDamage         [4]uint8 `json:"brakesDamage,omitempty"`
	FrontLeftWingDamage  uint8    `json:"frontLeftWingDamage,omitempty"`
	FrontRightWingDamage uint8    `json:"frontRightWingDamage,omitempty"`
	RearWingDamage       uint8    `json:"rearWingDamage,omitempty"`
	FloorDamage          uint8    `json:"floorDamage,omitempty"`
	DiffuserDamage       uint8    `json:"diffuserDamage,omitempty"`
	SidepodDamage        uint8    `json:"sidepodDamage,omitempty"`
	GearboxDamage        uint8    `json:"gearboxDamage,omitempty"`
	EngineDamage         uint8    `json:"engineDamage,omitempty"`
}

// PacketCarDamageData wraps damage data for the grid.
type PacketCarDamageData struct {
	CarDamageData []CarDamageData `json:"carDamageData,omitempty"`
}

// LapHistoryData stores one lap history sample.
type LapHistoryData struct {
	LapTimeInMS      uint32 `json:"lapTimeInMs,omitempty"`
	Sector1TimeInMS  uint16 `json:"sector1TimeInMs,omitempty"`
	Sector2TimeInMS  uint16 `json:"sector2TimeInMs,omitempty"`
	Sector3TimeInMS  uint16 `json:"sector3TimeInMs,omitempty"`
	LapValidBitFlags uint8  `json:"lapValidBitFlags,omitempty"`
}

// PacketSessionHistoryData stores a single car session history packet.
type PacketSessionHistoryData struct {
	CarIndex          uint8            `json:"carIndex,omitempty"`
	NumLaps           uint8            `json:"numLaps,omitempty"`
	BestLapTimeLapNum uint8            `json:"bestLapTimeLapNum,omitempty"`
	BestSector1LapNum uint8            `json:"bestSector1LapNum,omitempty"`
	BestSector2LapNum uint8            `json:"bestSector2LapNum,omitempty"`
	BestSector3LapNum uint8            `json:"bestSector3LapNum,omitempty"`
	BestSector1Ms     *int             `json:"bestSector1Ms,omitempty"`
	BestSector2Ms     *int             `json:"bestSector2Ms,omitempty"`
	BestSector3Ms     *int             `json:"bestSector3Ms,omitempty"`
	LapHistoryData    []LapHistoryData `json:"lapHistoryData,omitempty"`
}

// TyreSetData stores one tyre set entry.
type TyreSetData struct {
	ActualTyreCompound uint8 `json:"actualTyreCompound,omitempty"`
	VisualTyreCompound uint8 `json:"visualTyreCompound,omitempty"`
	Wear               uint8 `json:"wear,omitempty"`
	Available          bool  `json:"available,omitempty"`
	RecommendedSession uint8 `json:"recommendedSession,omitempty"`
}

// PacketTyreSetsData stores tyre inventory for one car.
type PacketTyreSetsData struct {
	CarIndex      uint8         `json:"carIndex,omitempty"`
	FittedIdx     uint8         `json:"fittedIdx,omitempty"`
	AvailableSets []TyreSetData `json:"availableSets,omitempty"`
}
