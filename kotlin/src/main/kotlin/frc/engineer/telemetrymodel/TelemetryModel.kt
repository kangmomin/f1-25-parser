package frc.engineer.telemetrymodel

import frc.engineer.dto.CarDamage
import frc.engineer.dto.DynamicsLapDTO
import frc.engineer.dto.PitwallState
import frc.engineer.dto.StintInfoDTO
import frc.engineer.dto.TyreSetBrief
import frc.engineer.packets.CarDamageData
import frc.engineer.packets.CarMotionData
import frc.engineer.packets.CarSetupData
import frc.engineer.packets.CarStatusData
import frc.engineer.packets.CarTelemetryData
import frc.engineer.packets.LapData
import frc.engineer.packets.PacketCarDamageData
import frc.engineer.packets.PacketCarSetupData
import frc.engineer.packets.PacketCarStatusData
import frc.engineer.packets.PacketCarTelemetryData
import frc.engineer.packets.PacketEventData
import frc.engineer.packets.PacketHeader
import frc.engineer.packets.PacketLapData
import frc.engineer.packets.PacketMotionData
import frc.engineer.packets.PacketParticipantsData
import frc.engineer.packets.PacketSessionData
import frc.engineer.packets.PacketSessionHistoryData
import frc.engineer.packets.PacketTyreSetsData
import frc.engineer.packets.ParticipantData
import java.time.Instant

data class FullTelemetryEnvelope(
    val capturedAt: Instant? = null,
    val header: PacketHeader? = null,
    val session: PacketSessionData? = null,
    val lastEvent: PacketEventData? = null,
    val participants: PacketParticipantsData? = null,
    val motion: PacketMotionData? = null,
    val lapData: PacketLapData? = null,
    val carSetups: PacketCarSetupData? = null,
    val carTelemetry: PacketCarTelemetryData? = null,
    val carStatus: PacketCarStatusData? = null,
    val carDamage: PacketCarDamageData? = null,
    val sessionHistoryByCar: Map<Int, PacketSessionHistoryData> = emptyMap(),
    val tyreSetsByCar: Map<Int, PacketTyreSetsData> = emptyMap(),
    val cars: List<CarEnvelope> = emptyList(),
    val pitwall: PitwallState? = null,
)

data class CarEnvelope(
    val carIndex: Int,
    val participant: ParticipantData? = null,
    val motion: CarMotionData? = null,
    val lap: LapData? = null,
    val setup: CarSetupData? = null,
    val telemetry: CarTelemetryData? = null,
    val status: CarStatusData? = null,
    val damage: CarDamageData? = null,
    val history: PacketSessionHistoryData? = null,
    val tyreSets: PacketTyreSetsData? = null,
    val normalized: NormalizedCar,
)

data class NormalizedCar(
    val index: Int,
    val name: String? = null,
    val teamId: Int? = null,
    val yourTelemetry: Int? = null,
    val position: Int? = null,
    val currentLapNum: Int? = null,
    val lapDistance: Float? = null,
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
    val tireCompound: String? = null,
    val actualTyreCompound: Int? = null,
    val tireAge: Int? = null,
    val fuelInTank: Float? = null,
    val fuelCapacity: Float? = null,
    val fuelRemainingLaps: Float? = null,
    val fuelMix: Int? = null,
    val brakeBias: Int? = null,
    val ersStoreEnergy: Float? = null,
    val ersDeployMode: Int? = null,
    val ersDeployedThisLap: Float? = null,
    val ersHarvestedMGUK: Float? = null,
    val ersHarvestedMGUH: Float? = null,
    val tireWear: List<Int> = listOf(0, 0, 0, 0),
    val damage: CarDamage? = null,
    val setup: CarSetupData? = null,
    val bestSector1Ms: Int? = null,
    val bestSector2Ms: Int? = null,
    val bestSector3Ms: Int? = null,
    val availableSets: List<TyreSetBrief> = emptyList(),
    val stintHistory: List<StintInfoDTO> = emptyList(),
    val dynamics: List<DynamicsLapDTO> = emptyList(),
    val ersActualPct: Int? = null,
    val ersActualReady: Boolean? = null,
    val ersEstimatePct: Int? = null,
    val ersEstimateReady: Boolean? = null,
)

fun canExposePublicOrSelf(
    playerIndex: Int,
    carIndex: Int,
    participants: PacketParticipantsData?,
): Boolean {
    if (carIndex == playerIndex) {
        return true
    }
    val participantList = participants?.participants ?: return false
    if (carIndex < 0 || carIndex >= participantList.size) {
        return false
    }
    return participantList[carIndex].yourTelemetry == 1
}
