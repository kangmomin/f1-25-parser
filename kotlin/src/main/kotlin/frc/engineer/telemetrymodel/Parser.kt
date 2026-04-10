package frc.engineer.telemetrymodel

import frc.engineer.dto.CarDamage
import frc.engineer.dto.TyreSetBrief
import frc.engineer.packets.CarDamageData
import frc.engineer.packets.CarSetupData
import frc.engineer.packets.CarStatusData
import frc.engineer.packets.PacketCarDamageData
import frc.engineer.packets.PacketCarSetupData
import frc.engineer.packets.PacketCarStatusData
import frc.engineer.packets.PacketParticipantsData
import frc.engineer.packets.PacketSessionHistoryData
import frc.engineer.packets.PacketTyreSetsData
import java.time.Instant

enum class ParseMode {
    PUBLIC,
    STRICT,
    FRC,
}

data class FRCParseConfig(
    val reservedFields: List<String> = emptyList(),
)

data class ParseOptions(
    val mode: ParseMode = ParseMode.STRICT,
    val playerCarIndex: Int? = null,
    val frc: FRCParseConfig? = null,
)

fun parseEnvelope(
    input: FullTelemetryEnvelope,
    options: ParseOptions = ParseOptions(),
): FullTelemetryEnvelope {
    val mode = options.mode
    val playerCarIndex = options.playerCarIndex ?: input.header?.playerCarIndex
    val sourceCars = input.cars.associateBy { it.carIndex }
    val output = input.copy(
        carSetups = filterCarSetups(input.carSetups, input.participants, playerCarIndex),
        carStatus = filterCarStatus(input.carStatus, mode, playerCarIndex),
        carDamage = filterCarDamage(input.carDamage, mode, playerCarIndex),
        sessionHistoryByCar = input.sessionHistoryByCar.toMap(),
        tyreSetsByCar = input.tyreSetsByCar.toMap(),
        cars = emptyList(),
        capturedAt = input.capturedAt ?: Instant.now(),
    )
    val cars = (0 until detectCarCount(input)).map { carIndex ->
        buildCarEnvelope(output, carIndex, sourceCars[carIndex], mode, playerCarIndex)
    }
    return output.copy(cars = cars)
}

private fun detectCarCount(input: FullTelemetryEnvelope): Int {
    var maxCount = input.cars.size
    listOf(
        input.participants?.participants?.size ?: 0,
        input.motion?.carMotionData?.size ?: 0,
        input.lapData?.lapData?.size ?: 0,
        input.carSetups?.carSetups?.size ?: 0,
        input.carTelemetry?.carTelemetryData?.size ?: 0,
        input.carStatus?.carStatusData?.size ?: 0,
        input.carDamage?.carDamageData?.size ?: 0,
    ).forEach { maxCount = maxOf(maxCount, it) }
    input.sessionHistoryByCar.keys.forEach { maxCount = maxOf(maxCount, it + 1) }
    input.tyreSetsByCar.keys.forEach { maxCount = maxOf(maxCount, it + 1) }
    return maxCount
}

private fun buildCarEnvelope(
    envelope: FullTelemetryEnvelope,
    carIndex: Int,
    source: CarEnvelope?,
    mode: ParseMode,
    playerCarIndex: Int?,
): CarEnvelope {
    val showPublicOrSelf = canExposePublicOrSelfForMode(mode, carIndex, playerCarIndex)
    val showERSPct = canExposeERSPctForMode(mode, carIndex, playerCarIndex)
    val showSetup = canExposeSelfOrAi(carIndex, playerCarIndex, envelope.participants)
    return CarEnvelope(
        carIndex = carIndex,
        participant = envelope.participants?.participants?.getOrNull(carIndex),
        motion = envelope.motion?.carMotionData?.getOrNull(carIndex),
        lap = envelope.lapData?.lapData?.getOrNull(carIndex),
        setup = if (showSetup) envelope.carSetups?.carSetups?.getOrNull(carIndex) else null,
        telemetry = envelope.carTelemetry?.carTelemetryData?.getOrNull(carIndex),
        status = envelope.carStatus?.carStatusData?.getOrNull(carIndex),
        damage = if (showPublicOrSelf) envelope.carDamage?.carDamageData?.getOrNull(carIndex) else null,
        history = envelope.sessionHistoryByCar[carIndex],
        tyreSets = envelope.tyreSetsByCar[carIndex],
        normalized = buildNormalizedCar(envelope, carIndex, source, showPublicOrSelf, showERSPct, showSetup),
    )
}

private fun buildNormalizedCar(
    envelope: FullTelemetryEnvelope,
    carIndex: Int,
    source: CarEnvelope?,
    showPublicOrSelf: Boolean,
    showERSPct: Boolean,
    showSetup: Boolean,
): NormalizedCar {
    val participant = envelope.participants?.participants?.getOrNull(carIndex)
    val lap = envelope.lapData?.lapData?.getOrNull(carIndex)
    val telemetry = envelope.carTelemetry?.carTelemetryData?.getOrNull(carIndex)
    val status = envelope.carStatus?.carStatusData?.getOrNull(carIndex)
    val damage = envelope.carDamage?.carDamageData?.getOrNull(carIndex)
    val history = envelope.sessionHistoryByCar[carIndex]
    val tyreSets = envelope.tyreSetsByCar[carIndex]

    return NormalizedCar(
        index = carIndex,
        name = participant?.name,
        teamId = participant?.teamId,
        yourTelemetry = participant?.yourTelemetry,
        position = lap?.position,
        currentLapNum = lap?.currentLapNum,
        lapDistance = lap?.lapDistance,
        speed = telemetry?.speed,
        throttle = telemetry?.throttle,
        brake = telemetry?.brake,
        steering = telemetry?.steering,
        gear = telemetry?.gear,
        brakeTemp = telemetry?.brakeTemp ?: listOf(0, 0, 0, 0),
        tireSurfaceTemp = telemetry?.tireSurfaceTemp ?: listOf(0, 0, 0, 0),
        tireInnerTemp = telemetry?.tireInnerTemp ?: listOf(0, 0, 0, 0),
        tirePressure = telemetry?.tirePressure ?: listOf(0f, 0f, 0f, 0f),
        surfaceType = telemetry?.surfaceType ?: listOf(0, 0, 0, 0),
        drsActivated = telemetry?.drs?.let { it != 0 },
        lastLapTime = lap?.lastLapTime,
        bestLapTime = lap?.bestLapTime,
        sector1TimeMs = lap?.sector1TimeMs,
        sector2TimeMs = lap?.sector2TimeMs,
        currentSector = lap?.currentSector,
        deltaToCarInFront = lap?.deltaToCarInFront,
        deltaToRaceLeader = lap?.deltaToRaceLeader,
        pitStatus = lap?.pitStatus,
        driverStatus = lap?.driverStatus,
        resultStatus = lap?.resultStatus,
        numPitStops = lap?.numPitStops,
        pitStopTimer = lap?.pitStopTimer,
        pitLaneTime = lap?.pitLaneTime,
        penalties = lap?.penalties,
        totalWarnings = lap?.totalWarnings,
        cornerCuttingWarnings = lap?.cornerCuttingWarnings,
        numUnservedDriveThroughs = lap?.numUnservedDriveThroughs,
        numUnservedStopGoPenalties = lap?.numUnservedStopGoPenalties,
        lapInvalid = lap?.lapInvalid,
        tireCompound = source?.normalized?.tireCompound,
        actualTyreCompound = status?.actualTyreCompound,
        tireAge = status?.tireAge,
        fuelInTank = if (showPublicOrSelf) status?.fuelInTank else null,
        fuelCapacity = if (showPublicOrSelf) status?.fuelCapacity else null,
        fuelRemainingLaps = if (showPublicOrSelf) status?.fuelRemainingLaps else null,
        fuelMix = if (showPublicOrSelf) status?.fuelMix else null,
        brakeBias = if (showPublicOrSelf) status?.brakeBias else null,
        ersStoreEnergy = if (showPublicOrSelf) status?.ersStoreEnergy else null,
        ersDeployMode = if (showPublicOrSelf) status?.ersDeployMode else null,
        ersDeployedThisLap = if (showPublicOrSelf) status?.ersDeployedThisLap else null,
        ersHarvestedMGUK = if (showPublicOrSelf) status?.ersHarvestedMGUK else null,
        ersHarvestedMGUH = if (showPublicOrSelf) status?.ersHarvestedMGUH else null,
        tireWear = if (showPublicOrSelf) damage?.tireWear ?: listOf(0, 0, 0, 0) else listOf(0, 0, 0, 0),
        damage = if (showPublicOrSelf) compactDamage(damage) else null,
        setup = if (showSetup) envelope.carSetups?.carSetups?.getOrNull(carIndex) else null,
        bestSector1Ms = history?.bestSector1Ms,
        bestSector2Ms = history?.bestSector2Ms,
        bestSector3Ms = history?.bestSector3Ms,
        availableSets = buildTyreSetBriefs(tyreSets, source),
        stintHistory = source?.normalized?.stintHistory ?: emptyList(),
        dynamics = source?.normalized?.dynamics ?: emptyList(),
        ersActualPct = if (showERSPct) source?.normalized?.ersActualPct else null,
        ersActualReady = if (showERSPct) source?.normalized?.ersActualReady else null,
        ersEstimatePct = source?.normalized?.ersEstimatePct,
        ersEstimateReady = source?.normalized?.ersEstimateReady,
    )
}

private fun filterCarSetups(
    packet: PacketCarSetupData?,
    participants: PacketParticipantsData?,
    playerCarIndex: Int?,
): PacketCarSetupData? {
    if (packet == null) return null
    return packet.copy(
        carSetups = packet.carSetups.mapIndexed { index, setup ->
            if (canExposeSelfOrAi(index, playerCarIndex, participants)) setup else CarSetupData()
        },
    )
}

private fun filterCarStatus(
    packet: PacketCarStatusData?,
    mode: ParseMode,
    playerCarIndex: Int?,
): PacketCarStatusData? {
    if (packet == null) return null
    return packet.copy(
        carStatusData = packet.carStatusData.mapIndexed { index, status ->
            if (canExposePublicOrSelfForMode(mode, index, playerCarIndex)) {
                status
            } else {
                status.copy(
                    fuelInTank = if (canExposePublicOrSelfForMode(mode, index, playerCarIndex)) status.fuelInTank else null,
                    fuelCapacity = if (canExposePublicOrSelfForMode(mode, index, playerCarIndex)) status.fuelCapacity else null,
                    fuelRemainingLaps = if (canExposePublicOrSelfForMode(mode, index, playerCarIndex)) status.fuelRemainingLaps else null,
                    fuelMix = if (canExposePublicOrSelfForMode(mode, index, playerCarIndex)) status.fuelMix else null,
                    brakeBias = if (canExposePublicOrSelfForMode(mode, index, playerCarIndex)) status.brakeBias else null,
                    ersStoreEnergy = if (canExposePublicOrSelfForMode(mode, index, playerCarIndex)) status.ersStoreEnergy else null,
                    ersDeployMode = if (canExposePublicOrSelfForMode(mode, index, playerCarIndex)) status.ersDeployMode else null,
                    ersHarvestedMGUK = if (canExposePublicOrSelfForMode(mode, index, playerCarIndex)) status.ersHarvestedMGUK else null,
                    ersHarvestedMGUH = if (canExposePublicOrSelfForMode(mode, index, playerCarIndex)) status.ersHarvestedMGUH else null,
                    ersDeployedThisLap = if (canExposePublicOrSelfForMode(mode, index, playerCarIndex)) status.ersDeployedThisLap else null,
                )
            }
        },
    )
}

private fun filterCarDamage(
    packet: PacketCarDamageData?,
    mode: ParseMode,
    playerCarIndex: Int?,
): PacketCarDamageData? {
    if (packet == null) return null
    return packet.copy(
        carDamageData = packet.carDamageData.mapIndexed { index, damage ->
            if (canExposePublicOrSelfForMode(mode, index, playerCarIndex)) damage else CarDamageData()
        },
    )
}

private fun canExposePublicOrSelfForMode(
    mode: ParseMode,
    carIndex: Int,
    playerCarIndex: Int?,
): Boolean = mode == ParseMode.PUBLIC || mode == ParseMode.FRC || playerCarIndex == carIndex

private fun canExposeERSPctForMode(
    mode: ParseMode,
    carIndex: Int,
    playerCarIndex: Int?,
): Boolean = mode == ParseMode.PUBLIC || mode == ParseMode.FRC || playerCarIndex == carIndex

private fun canExposeSelfOrAi(
    carIndex: Int,
    playerCarIndex: Int?,
    participants: PacketParticipantsData?,
): Boolean {
    if (playerCarIndex == carIndex) return true
    return participants?.participants?.getOrNull(carIndex)?.aiControlled == true
}

private fun compactDamage(damage: CarDamageData?): CarDamage? {
    if (damage == null) return null
    return CarDamage(
        frontLeftWing = damage.frontLeftWingDamage,
        frontRightWing = damage.frontRightWingDamage,
        rearWing = damage.rearWingDamage,
        floor = damage.floorDamage,
        diffuser = damage.diffuserDamage,
        sidepod = damage.sidepodDamage,
        gearbox = damage.gearboxDamage,
        engine = damage.engineDamage,
    )
}

private fun buildTyreSetBriefs(
    tyreSets: PacketTyreSetsData?,
    source: CarEnvelope?,
): List<TyreSetBrief> {
    if (!source?.normalized?.availableSets.isNullOrEmpty()) {
        return source!!.normalized.availableSets
    }
    if (tyreSets == null) return emptyList()
    return tyreSets.availableSets.mapIndexed { index, item ->
        TyreSetBrief(
            index = index,
            wear = item.wear,
            available = item.available,
        )
    }
}
