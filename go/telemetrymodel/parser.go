package telemetrymodel

import (
	"time"

	"frc.pitwall.parser/telemetry-go/dto"
	"frc.pitwall.parser/telemetry-go/packets"
)

type ParseMode string

const (
	ParseModePublic ParseMode = "public"
	ParseModeStrict ParseMode = "strict"
	ParseModeFRC    ParseMode = "frc"
)

// FRCConfig is a placeholder extension point for future frc-specific parsing rules.
type FRCConfig struct {
	ReservedFields []string `json:"reservedFields,omitempty"`
}

// ParseOptions controls visibility filtering while building derived car views.
type ParseOptions struct {
	Mode           ParseMode  `json:"mode,omitempty"`
	PlayerCarIndex *uint8     `json:"playerCarIndex,omitempty"`
	FRC            *FRCConfig `json:"frc,omitempty"`
}

// ParseEnvelope builds visibility-aware car views for public, strict, and frc modes.
// FRC currently uses strict visibility as its baseline, plus ERS percentage and DRS activation.
func ParseEnvelope(in FullTelemetryEnvelope, opts ParseOptions) FullTelemetryEnvelope {
	mode := normalizeParseMode(opts.Mode)
	playerIndex, hasPlayer := resolvePlayerCarIndex(in.Header, opts)

	out := FullTelemetryEnvelope{
		CapturedAt:          in.CapturedAt,
		Header:              in.Header,
		Session:             in.Session,
		LastEvent:           in.LastEvent,
		Participants:        in.Participants,
		Motion:              in.Motion,
		LapData:             in.LapData,
		CarTelemetry:        in.CarTelemetry,
		SessionHistoryByCar: cloneSessionHistoryMap(in.SessionHistoryByCar),
		TyreSetsByCar:       cloneTyreSetsMap(in.TyreSetsByCar),
		Pitwall:             in.Pitwall,
	}

	out.CarSetups = filterCarSetups(in.CarSetups, in.Participants, playerIndex, hasPlayer)
	out.CarStatus = filterCarStatus(in.CarStatus, mode, playerIndex, hasPlayer)
	out.CarDamage = filterCarDamage(in.CarDamage, mode, playerIndex, hasPlayer)

	sourceCars := indexCarsByNumber(in.Cars)
	carCount := detectCarCount(in)
	if carCount == 0 {
		out.Cars = []CarEnvelope{}
		if out.CapturedAt.IsZero() {
			out.CapturedAt = time.Now().UTC()
		}
		return out
	}

	out.Cars = make([]CarEnvelope, 0, carCount)
	for carIndex := 0; carIndex < carCount; carIndex++ {
		out.Cars = append(out.Cars, buildCarEnvelope(out, carIndex, sourceCars[carIndex], mode, playerIndex, hasPlayer))
	}

	if out.CapturedAt.IsZero() {
		out.CapturedAt = time.Now().UTC()
	}
	return out
}

func normalizeParseMode(mode ParseMode) ParseMode {
	switch mode {
	case ParseModePublic, ParseModeStrict, ParseModeFRC:
		return mode
	default:
		return ParseModeStrict
	}
}

func resolvePlayerCarIndex(header *packets.PacketHeader, opts ParseOptions) (uint8, bool) {
	if opts.PlayerCarIndex != nil {
		return *opts.PlayerCarIndex, true
	}
	if header != nil {
		return header.PlayerCarIndex, true
	}
	return 0, false
}

func detectCarCount(in FullTelemetryEnvelope) int {
	maxCount := 0
	lengths := []int{
		lenParticipants(in.Participants),
		lenMotion(in.Motion),
		lenLapData(in.LapData),
		lenSetups(in.CarSetups),
		lenTelemetry(in.CarTelemetry),
		lenStatus(in.CarStatus),
		lenDamage(in.CarDamage),
		len(in.Cars),
	}
	for _, n := range lengths {
		if n > maxCount {
			maxCount = n
		}
	}
	for carIndex := range in.SessionHistoryByCar {
		if int(carIndex)+1 > maxCount {
			maxCount = int(carIndex) + 1
		}
	}
	for carIndex := range in.TyreSetsByCar {
		if int(carIndex)+1 > maxCount {
			maxCount = int(carIndex) + 1
		}
	}
	return maxCount
}

func buildCarEnvelope(env FullTelemetryEnvelope, carIndex int, source *CarEnvelope, mode ParseMode, playerIndex uint8, hasPlayer bool) CarEnvelope {
	participant := participantAt(env.Participants, carIndex)
	motion := motionAt(env.Motion, carIndex)
	lap := lapAt(env.LapData, carIndex)
	setup := setupAt(env.CarSetups, carIndex)
	telemetry := telemetryAt(env.CarTelemetry, carIndex)
	status := statusAt(env.CarStatus, carIndex)
	damage := damageAt(env.CarDamage, carIndex)
	history := historyAt(env.SessionHistoryByCar, carIndex)
	tyreSets := tyreSetsAt(env.TyreSetsByCar, carIndex)

	showPublicOrSelf := shouldExposePublicOrSelf(mode, playerIndex, hasPlayer, carIndex)
	showERSPct := shouldExposeERSPct(mode, playerIndex, hasPlayer, carIndex)
	showSetup := shouldExposeSelfOrAI(playerIndex, hasPlayer, carIndex, env.Participants)
	showDamage := showPublicOrSelf

	return CarEnvelope{
		CarIndex:    carIndex,
		Participant: participant,
		Motion:      motion,
		Lap:         lap,
		Setup:       setup,
		Telemetry:   telemetry,
		Status:      status,
		Damage:      damage,
		History:     history,
		TyreSets:    tyreSets,
		Normalized:  buildNormalizedCar(carIndex, participant, lap, telemetry, status, damage, setup, history, tyreSets, source, showPublicOrSelf, showERSPct, showSetup, showDamage),
	}
}

func buildNormalizedCar(
	carIndex int,
	participant *packets.ParticipantData,
	lap *packets.LapData,
	telemetry *packets.CarTelemetryData,
	status *packets.CarStatusData,
	damage *packets.CarDamageData,
	setup *packets.CarSetupData,
	history *packets.PacketSessionHistoryData,
	tyreSets *packets.PacketTyreSetsData,
	source *CarEnvelope,
	showPublicOrSelf bool,
	showERSPct bool,
	showSetup bool,
	showDamage bool,
) NormalizedCar {
	out := NormalizedCar{Index: carIndex}
	if participant != nil {
		out.Name = participant.Name
		out.TeamID = participant.TeamID
		out.YourTelemetry = participant.YourTelemetry
	}
	if lap != nil {
		out.Position = lap.Position
		out.CurrentLapNum = lap.CurrentLapNum
		out.LapDistance = lap.LapDistance
		out.LastLapTime = lap.LastLapTime
		out.BestLapTime = lap.BestLapTime
		out.Sector1TimeMs = lap.Sector1TimeMs
		out.Sector2TimeMs = lap.Sector2TimeMs
		out.CurrentSector = lap.CurrentSector
		out.DeltaToCarInFront = lap.DeltaToCarInFront
		out.DeltaToRaceLeader = lap.DeltaToRaceLeader
		out.PitStatus = lap.PitStatus
		out.DriverStatus = lap.DriverStatus
		out.ResultStatus = lap.ResultStatus
		out.NumPitStops = lap.NumPitStops
		out.PitStopTimer = lap.PitStopTimer
		out.PitLaneTime = lap.PitLaneTime
		out.Penalties = lap.Penalties
		out.TotalWarnings = lap.TotalWarnings
		out.CornerCuttingWarnings = lap.CornerCuttingWarnings
		out.NumUnservedDriveThroughs = lap.NumUnservedDriveThroughs
		out.NumUnservedStopGoPenalties = lap.NumUnservedStopGoPenalties
		out.LapInvalid = lap.LapInvalid
	}
	if telemetry != nil {
		out.Speed = telemetry.Speed
		out.Throttle = telemetry.Throttle
		out.Brake = telemetry.Brake
		out.Steering = telemetry.Steering
		out.Gear = telemetry.Gear
		out.BrakeTemp = telemetry.BrakeTemp
		out.TireSurfaceTemp = telemetry.TireSurfaceTemp
		out.TireInnerTemp = telemetry.TireInnerTemp
		out.TirePressure = telemetry.TirePressure
		out.SurfaceType = telemetry.SurfaceType
		out.DRSActivated = telemetry.DRS != 0
	}
	if status != nil {
		out.ActualTyreCompound = status.ActualTyreCompound
		out.TireAge = status.TireAge
		if showPublicOrSelf {
			out.FuelInTank = status.FuelInTank
			out.FuelCapacity = status.FuelCapacity
			out.FuelRemainingLaps = status.FuelRemainingLaps
			out.FuelMix = status.FuelMix
			out.BrakeBias = status.BrakeBias
		}
		if showPublicOrSelf {
			out.ERSStoreEnergy = status.ERSStoreEnergy
			out.ERSDeployMode = status.ERSDeployMode
			out.ERSDeployedThisLap = status.ERSDeployedThisLap
			out.ERSHarvestedMGUK = status.ERSHarvestedMGUK
			out.ERSHarvestedMGUH = status.ERSHarvestedMGUH
		}
	}
	if history != nil {
		out.BestSector1Ms = history.BestSector1Ms
		out.BestSector2Ms = history.BestSector2Ms
		out.BestSector3Ms = history.BestSector3Ms
	}
	if showSetup {
		out.Setup = setup
	}
	if showDamage && damage != nil {
		out.TireWear = damage.TireWear
		out.Damage = &dto.CarDamage{
			FrontLeftWing:  damage.FrontLeftWingDamage,
			FrontRightWing: damage.FrontRightWingDamage,
			RearWing:       damage.RearWingDamage,
			Floor:          damage.FloorDamage,
			Diffuser:       damage.DiffuserDamage,
			Sidepod:        damage.SidepodDamage,
			Gearbox:        damage.GearboxDamage,
			Engine:         damage.EngineDamage,
		}
	}
	if source != nil {
		copyDerivedValues(&out, source, showERSPct)
	}
	if tyreSets != nil {
		out.AvailableSets = tyreSetBriefs(tyreSets, source)
	}
	return out
}

func copyDerivedValues(out *NormalizedCar, source *CarEnvelope, showERSPct bool) {
	out.TireCompound = source.Normalized.TireCompound
	out.StintHistory = append([]dto.StintInfoDTO(nil), source.Normalized.StintHistory...)
	out.Dynamics = append([]dto.DynamicsLapDTO(nil), source.Normalized.Dynamics...)
	out.ERSEstimatePct = source.Normalized.ERSEstimatePct
	out.ERSEstimateReady = source.Normalized.ERSEstimateReady
	if showERSPct {
		out.ERSActualPct = source.Normalized.ERSActualPct
		out.ERSActualReady = source.Normalized.ERSActualReady
	}
	if len(source.Normalized.AvailableSets) > 0 {
		out.AvailableSets = append([]dto.TyreSetBrief(nil), source.Normalized.AvailableSets...)
	}
}

func tyreSetBriefs(tyreSets *packets.PacketTyreSetsData, source *CarEnvelope) []dto.TyreSetBrief {
	if source != nil && len(source.Normalized.AvailableSets) > 0 {
		return append([]dto.TyreSetBrief(nil), source.Normalized.AvailableSets...)
	}
	if tyreSets == nil {
		return nil
	}
	out := make([]dto.TyreSetBrief, 0, len(tyreSets.AvailableSets))
	for i, set := range tyreSets.AvailableSets {
		out = append(out, dto.TyreSetBrief{
			Index:     i,
			AgeLaps:   0,
			Wear:      set.Wear,
			Available: set.Available,
		})
	}
	return out
}

func filterCarSetups(in *packets.PacketCarSetupData, participants *packets.PacketParticipantsData, playerIndex uint8, hasPlayer bool) *packets.PacketCarSetupData {
	if in == nil {
		return nil
	}
	out := &packets.PacketCarSetupData{CarSetups: make([]packets.CarSetupData, len(in.CarSetups))}
	for i, setup := range in.CarSetups {
		if shouldExposeSelfOrAI(playerIndex, hasPlayer, i, participants) {
			out.CarSetups[i] = setup
		}
	}
	return out
}

func filterCarStatus(in *packets.PacketCarStatusData, mode ParseMode, playerIndex uint8, hasPlayer bool) *packets.PacketCarStatusData {
	if in == nil {
		return nil
	}
	out := &packets.PacketCarStatusData{CarStatusData: make([]packets.CarStatusData, len(in.CarStatusData))}
	for i, status := range in.CarStatusData {
		filtered := status
		if !shouldExposePublicOrSelf(mode, playerIndex, hasPlayer, i) {
			filtered.FuelInTank = 0
			filtered.FuelCapacity = 0
			filtered.FuelRemainingLaps = 0
			filtered.FuelMix = 0
			filtered.BrakeBias = 0
		}
		if !shouldExposePublicOrSelf(mode, playerIndex, hasPlayer, i) {
			filtered.ERSStoreEnergy = 0
			filtered.ERSDeployMode = 0
			filtered.ERSHarvestedMGUK = 0
			filtered.ERSHarvestedMGUH = 0
			filtered.ERSDeployedThisLap = 0
		}
		out.CarStatusData[i] = filtered
	}
	return out
}

func filterCarDamage(in *packets.PacketCarDamageData, mode ParseMode, playerIndex uint8, hasPlayer bool) *packets.PacketCarDamageData {
	if in == nil {
		return nil
	}
	out := &packets.PacketCarDamageData{CarDamageData: make([]packets.CarDamageData, len(in.CarDamageData))}
	for i, damage := range in.CarDamageData {
		if shouldExposePublicOrSelf(mode, playerIndex, hasPlayer, i) {
			out.CarDamageData[i] = damage
		}
	}
	return out
}

func shouldExposePublicOrSelf(mode ParseMode, playerIndex uint8, hasPlayer bool, carIndex int) bool {
	if mode == ParseModePublic {
		return true
	}
	return hasPlayer && carIndex == int(playerIndex)
}

func shouldExposeERSPct(mode ParseMode, playerIndex uint8, hasPlayer bool, carIndex int) bool {
	if mode == ParseModePublic || mode == ParseModeFRC {
		return true
	}
	return hasPlayer && carIndex == int(playerIndex)
}

func shouldExposeSelfOrAI(playerIndex uint8, hasPlayer bool, carIndex int, participants *packets.PacketParticipantsData) bool {
	if hasPlayer && carIndex == int(playerIndex) {
		return true
	}
	if participants == nil || carIndex < 0 || carIndex >= len(participants.Participants) {
		return false
	}
	return participants.Participants[carIndex].AiControlled
}

func participantAt(data *packets.PacketParticipantsData, carIndex int) *packets.ParticipantData {
	if data == nil || carIndex < 0 || carIndex >= len(data.Participants) {
		return nil
	}
	return &data.Participants[carIndex]
}

func motionAt(data *packets.PacketMotionData, carIndex int) *packets.CarMotionData {
	if data == nil || carIndex < 0 || carIndex >= len(data.CarMotionData) {
		return nil
	}
	return &data.CarMotionData[carIndex]
}

func lapAt(data *packets.PacketLapData, carIndex int) *packets.LapData {
	if data == nil || carIndex < 0 || carIndex >= len(data.LapData) {
		return nil
	}
	return &data.LapData[carIndex]
}

func setupAt(data *packets.PacketCarSetupData, carIndex int) *packets.CarSetupData {
	if data == nil || carIndex < 0 || carIndex >= len(data.CarSetups) {
		return nil
	}
	setup := data.CarSetups[carIndex]
	if setup == (packets.CarSetupData{}) {
		return nil
	}
	return &data.CarSetups[carIndex]
}

func telemetryAt(data *packets.PacketCarTelemetryData, carIndex int) *packets.CarTelemetryData {
	if data == nil || carIndex < 0 || carIndex >= len(data.CarTelemetryData) {
		return nil
	}
	return &data.CarTelemetryData[carIndex]
}

func statusAt(data *packets.PacketCarStatusData, carIndex int) *packets.CarStatusData {
	if data == nil || carIndex < 0 || carIndex >= len(data.CarStatusData) {
		return nil
	}
	return &data.CarStatusData[carIndex]
}

func damageAt(data *packets.PacketCarDamageData, carIndex int) *packets.CarDamageData {
	if data == nil || carIndex < 0 || carIndex >= len(data.CarDamageData) {
		return nil
	}
	damage := data.CarDamageData[carIndex]
	if damage == (packets.CarDamageData{}) {
		return nil
	}
	return &data.CarDamageData[carIndex]
}

func historyAt(data map[uint8]*packets.PacketSessionHistoryData, carIndex int) *packets.PacketSessionHistoryData {
	if data == nil {
		return nil
	}
	return data[uint8(carIndex)]
}

func tyreSetsAt(data map[uint8]*packets.PacketTyreSetsData, carIndex int) *packets.PacketTyreSetsData {
	if data == nil {
		return nil
	}
	return data[uint8(carIndex)]
}

func cloneSessionHistoryMap(in map[uint8]*packets.PacketSessionHistoryData) map[uint8]*packets.PacketSessionHistoryData {
	if in == nil {
		return nil
	}
	out := make(map[uint8]*packets.PacketSessionHistoryData, len(in))
	for k, v := range in {
		out[k] = v
	}
	return out
}

func cloneTyreSetsMap(in map[uint8]*packets.PacketTyreSetsData) map[uint8]*packets.PacketTyreSetsData {
	if in == nil {
		return nil
	}
	out := make(map[uint8]*packets.PacketTyreSetsData, len(in))
	for k, v := range in {
		out[k] = v
	}
	return out
}

func indexCarsByNumber(cars []CarEnvelope) map[int]*CarEnvelope {
	if len(cars) == 0 {
		return nil
	}
	out := make(map[int]*CarEnvelope, len(cars))
	for i := range cars {
		car := cars[i]
		out[car.CarIndex] = &cars[i]
	}
	return out
}

func lenParticipants(data *packets.PacketParticipantsData) int {
	if data == nil {
		return 0
	}
	return len(data.Participants)
}

func lenMotion(data *packets.PacketMotionData) int {
	if data == nil {
		return 0
	}
	return len(data.CarMotionData)
}

func lenLapData(data *packets.PacketLapData) int {
	if data == nil {
		return 0
	}
	return len(data.LapData)
}

func lenSetups(data *packets.PacketCarSetupData) int {
	if data == nil {
		return 0
	}
	return len(data.CarSetups)
}

func lenTelemetry(data *packets.PacketCarTelemetryData) int {
	if data == nil {
		return 0
	}
	return len(data.CarTelemetryData)
}

func lenStatus(data *packets.PacketCarStatusData) int {
	if data == nil {
		return 0
	}
	return len(data.CarStatusData)
}

func lenDamage(data *packets.PacketCarDamageData) int {
	if data == nil {
		return 0
	}
	return len(data.CarDamageData)
}
