package telemetrymodel

import (
	"time"

	"frc.pitwall.parser/telemetry-go/dto"
	"frc.pitwall.parser/telemetry-go/packets"
)

// FullTelemetryEnvelope stores all received raw packets plus derived views.
type FullTelemetryEnvelope struct {
	CapturedAt time.Time `json:"capturedAt"`

	Header              *packets.PacketHeader                       `json:"header,omitempty"`
	Session             *packets.PacketSessionData                  `json:"session,omitempty"`
	LastEvent           *packets.PacketEventData                    `json:"lastEvent,omitempty"`
	Participants        *packets.PacketParticipantsData             `json:"participants,omitempty"`
	Motion              *packets.PacketMotionData                   `json:"motion,omitempty"`
	LapData             *packets.PacketLapData                      `json:"lapData,omitempty"`
	CarSetups           *packets.PacketCarSetupData                 `json:"carSetups,omitempty"`
	CarTelemetry        *packets.PacketCarTelemetryData             `json:"carTelemetry,omitempty"`
	CarStatus           *packets.PacketCarStatusData                `json:"carStatus,omitempty"`
	CarDamage           *packets.PacketCarDamageData                `json:"carDamage,omitempty"`
	SessionHistoryByCar map[uint8]*packets.PacketSessionHistoryData `json:"sessionHistoryByCar,omitempty"`
	TyreSetsByCar       map[uint8]*packets.PacketTyreSetsData       `json:"tyreSetsByCar,omitempty"`

	Cars    []CarEnvelope     `json:"cars,omitempty"`
	Pitwall *dto.PitwallState `json:"pitwall,omitempty"`
}

// CarEnvelope groups one car's raw and normalized views.
type CarEnvelope struct {
	CarIndex int `json:"carIndex"`

	Participant *packets.ParticipantData          `json:"participant,omitempty"`
	Motion      *packets.CarMotionData            `json:"motion,omitempty"`
	Lap         *packets.LapData                  `json:"lap,omitempty"`
	Setup       *packets.CarSetupData             `json:"setup,omitempty"`
	Telemetry   *packets.CarTelemetryData         `json:"telemetry,omitempty"`
	Status      *packets.CarStatusData            `json:"status,omitempty"`
	Damage      *packets.CarDamageData            `json:"damage,omitempty"`
	History     *packets.PacketSessionHistoryData `json:"history,omitempty"`
	TyreSets    *packets.PacketTyreSetsData       `json:"tyreSets,omitempty"`

	Normalized NormalizedCar `json:"normalized"`
}

// NormalizedCar is a UI-ready normalized representation for a single car.
type NormalizedCar struct {
	Index         int    `json:"index"`
	Name          string `json:"name,omitempty"`
	TeamID        int    `json:"teamId,omitempty"`
	YourTelemetry uint8  `json:"yourTelemetry,omitempty"`
	AiControlled  bool   `json:"aiControlled,omitempty"`

	Position      int     `json:"position,omitempty"`
	CurrentLapNum int     `json:"currentLapNum,omitempty"`
	LapDistance   float32 `json:"lapDistance,omitempty"`

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
	DRSActivated    bool       `json:"drsActivated,omitempty"`

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

	TireCompound       string  `json:"tireCompound,omitempty"`
	ActualTyreCompound uint8   `json:"actualTyreCompound,omitempty"`
	TireAge            uint8   `json:"tireAge,omitempty"`
	FuelInTank         float32 `json:"fuelInTank,omitempty"`
	FuelCapacity       float32 `json:"fuelCapacity,omitempty"`
	FuelRemainingLaps  float32 `json:"fuelRemainingLaps,omitempty"`
	FuelMix            uint8   `json:"fuelMix,omitempty"`
	BrakeBias          uint8   `json:"brakeBias,omitempty"`
	ERSStoreEnergy     float32 `json:"ersStoreEnergy,omitempty"`
	ERSDeployMode      uint8   `json:"ersDeployMode,omitempty"`
	ERSDeployedThisLap float32 `json:"ersDeployedThisLap,omitempty"`
	ERSHarvestedMGUK   float32 `json:"ersHarvestedMGUK,omitempty"`
	ERSHarvestedMGUH   float32 `json:"ersHarvestedMGUH,omitempty"`

	TireWear [4]int         `json:"tireWear,omitempty"`
	Damage   *dto.CarDamage `json:"damage,omitempty"`

	Setup *packets.CarSetupData `json:"setup,omitempty"`

	BestSector1Ms *int                 `json:"bestSector1Ms,omitempty"`
	BestSector2Ms *int                 `json:"bestSector2Ms,omitempty"`
	BestSector3Ms *int                 `json:"bestSector3Ms,omitempty"`
	AvailableSets []dto.TyreSetBrief   `json:"availableSets,omitempty"`
	StintHistory  []dto.StintInfoDTO   `json:"stintHistory,omitempty"`
	Dynamics      []dto.DynamicsLapDTO `json:"dynamics,omitempty"`

	ERSActualPct     int  `json:"ersActualPct,omitempty"`
	ERSActualReady   bool `json:"ersActualReady,omitempty"`
	ERSEstimatePct   int  `json:"ersEstimatePct,omitempty"`
	ERSEstimateReady bool `json:"ersEstimateReady,omitempty"`
}

// CanExposePublicOrSelf returns true when a field is public, or when the car is the player's own car.
func CanExposePublicOrSelf(playerIndex uint8, carIndex int, participants *packets.PacketParticipantsData) bool {
	if carIndex == int(playerIndex) {
		return true
	}
	if participants == nil || carIndex < 0 || carIndex >= len(participants.Participants) {
		return false
	}
	return participants.Participants[carIndex].YourTelemetry == 1
}
