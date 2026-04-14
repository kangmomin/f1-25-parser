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
    DRIVERS,
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
    val sourceCars = input.cars.associateBy { it.carIndex }
    val output = input.copy(
        carSetups = normalizeCarSetups(input.carSetups),
        sessionHistoryByCar = input.sessionHistoryByCar.toMap(),
        tyreSetsByCar = input.tyreSetsByCar.toMap(),
        cars = emptyList(),
        capturedAt = input.capturedAt ?: Instant.now(),
    )
    val cars = (0 until detectCarCount(output)).map { carIndex ->
        buildRawCarEnvelope(output, carIndex, sourceCars[carIndex])
    }
    return output.copy(cars = cars)
}

fun getVisibleEnvelope(
    input: FullTelemetryEnvelope,
    options: ParseOptions = ParseOptions(),
): FullTelemetryEnvelope {
    val envelope = ensureParsedEnvelope(input)
    val playerCarIndex = options.playerCarIndex ?: envelope.header?.playerCarIndex
    val sourceCars = envelope.cars.associateBy { it.carIndex }
    val output = envelope.copy(
        carSetups = filterCarSetups(envelope.carSetups, envelope.participants, playerCarIndex),
        carStatus = filterCarStatus(envelope.carStatus, options.mode, playerCarIndex),
        carDamage = filterCarDamage(envelope.carDamage, options.mode, playerCarIndex),
        sessionHistoryByCar = envelope.sessionHistoryByCar.toMap(),
        tyreSetsByCar = envelope.tyreSetsByCar.toMap(),
        cars = emptyList(),
        capturedAt = envelope.capturedAt ?: Instant.now(),
    )
    val cars = (0 until detectCarCount(envelope)).map { carIndex ->
        buildVisibleCarEnvelope(envelope, carIndex, sourceCars[carIndex], options.mode, playerCarIndex)
    }
    return output.copy(cars = cars)
}

fun getVisibleCars(
    input: FullTelemetryEnvelope,
    options: ParseOptions = ParseOptions(),
): List<CarEnvelope> = getVisibleEnvelope(input, options).cars

fun getVisibleCarEnvelope(
    input: FullTelemetryEnvelope,
    carIndex: Int,
    options: ParseOptions = ParseOptions(),
): CarEnvelope {
    val envelope = ensureParsedEnvelope(input)
    val playerCarIndex = options.playerCarIndex ?: envelope.header?.playerCarIndex
    val source = envelope.cars.firstOrNull { it.carIndex == carIndex }
    return buildVisibleCarEnvelope(envelope, carIndex, source, options.mode, playerCarIndex)
}

fun getVisibleNormalizedCar(
    input: FullTelemetryEnvelope,
    carIndex: Int,
    options: ParseOptions = ParseOptions(),
): NormalizedCar = getVisibleCarEnvelope(input, carIndex, options).normalized

fun getVisibleCarSetup(
    input: FullTelemetryEnvelope,
    carIndex: Int,
    options: ParseOptions = ParseOptions(),
): CarSetupData? {
    val envelope = ensureParsedEnvelope(input)
    val playerCarIndex = options.playerCarIndex ?: envelope.header?.playerCarIndex
    return if (canExposeSelfOrAi(carIndex, playerCarIndex, envelope.participants)) {
        envelope.carSetups?.carSetups?.getOrNull(carIndex)
    } else {
        null
    }
}

fun getVisibleCarStatus(
    input: FullTelemetryEnvelope,
    carIndex: Int,
    options: ParseOptions = ParseOptions(),
): CarStatusData? {
    val envelope = ensureParsedEnvelope(input)
    val playerCarIndex = options.playerCarIndex ?: envelope.header?.playerCarIndex
    val status = envelope.carStatus?.carStatusData?.getOrNull(carIndex) ?: return null
    return filterCarStatusEntry(status, options.mode, carIndex, playerCarIndex)
}

fun getVisibleCarDamage(
    input: FullTelemetryEnvelope,
    carIndex: Int,
    options: ParseOptions = ParseOptions(),
): CarDamageData? {
    val envelope = ensureParsedEnvelope(input)
    val playerCarIndex = options.playerCarIndex ?: envelope.header?.playerCarIndex
    val damage = envelope.carDamage?.carDamageData?.getOrNull(carIndex) ?: return null
    val filtered = filterCarDamageEntry(damage, options.mode, carIndex, playerCarIndex)
    return if (filtered == CarDamageData()) null else filtered
}

private fun ensureParsedEnvelope(input: FullTelemetryEnvelope): FullTelemetryEnvelope =
    if (input.cars.isNotEmpty()) input else parseEnvelope(input)

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

private fun buildRawCarEnvelope(
    envelope: FullTelemetryEnvelope,
    carIndex: Int,
    source: CarEnvelope?,
): CarEnvelope = CarEnvelope(
    carIndex = carIndex,
    participant = envelope.participants?.participants?.getOrNull(carIndex),
    motion = envelope.motion?.carMotionData?.getOrNull(carIndex),
    lap = envelope.lapData?.lapData?.getOrNull(carIndex),
    setup = envelope.carSetups?.carSetups?.getOrNull(carIndex),
    telemetry = envelope.carTelemetry?.carTelemetryData?.getOrNull(carIndex),
    status = envelope.carStatus?.carStatusData?.getOrNull(carIndex),
    damage = envelope.carDamage?.carDamageData?.getOrNull(carIndex),
    history = envelope.sessionHistoryByCar[carIndex],
    tyreSets = envelope.tyreSetsByCar[carIndex],
    normalized = buildRawNormalizedCar(envelope, carIndex, source),
)

private fun buildVisibleCarEnvelope(
    envelope: FullTelemetryEnvelope,
    carIndex: Int,
    source: CarEnvelope?,
    mode: ParseMode,
    playerCarIndex: Int?,
): CarEnvelope {
    val showSetup = canExposeSelfOrAi(carIndex, playerCarIndex, envelope.participants)
    val showDamage = canExposeDamageForMode(mode, carIndex, playerCarIndex)
    return CarEnvelope(
        carIndex = carIndex,
        participant = envelope.participants?.participants?.getOrNull(carIndex),
        motion = envelope.motion?.carMotionData?.getOrNull(carIndex),
        lap = envelope.lapData?.lapData?.getOrNull(carIndex),
        setup = if (showSetup) envelope.carSetups?.carSetups?.getOrNull(carIndex) else null,
        telemetry = envelope.carTelemetry?.carTelemetryData?.getOrNull(carIndex),
        status = envelope.carStatus?.carStatusData?.getOrNull(carIndex)?.let {
            filterCarStatusEntry(it, mode, carIndex, playerCarIndex)
        },
        damage = if (showDamage) {
            envelope.carDamage?.carDamageData?.getOrNull(carIndex)?.let {
                filterCarDamageEntry(it, mode, carIndex, playerCarIndex).takeIf { filtered ->
                    filtered != CarDamageData()
                }
            }
        } else {
            null
        },
        history = envelope.sessionHistoryByCar[carIndex],
        tyreSets = envelope.tyreSetsByCar[carIndex],
        normalized = buildVisibleNormalizedCar(envelope, carIndex, source, mode, playerCarIndex),
    )
}

private fun buildRawNormalizedCar(
    envelope: FullTelemetryEnvelope,
    carIndex: Int,
    source: CarEnvelope?,
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
        aiControlled = participant?.aiControlled,
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
        tireCompound = resolveTireCompound(source, status),
        actualTyreCompound = status?.actualTyreCompound,
        tireAge = status?.tireAge,
        fuelInTank = status?.fuelInTank,
        fuelCapacity = status?.fuelCapacity,
        fuelRemainingLaps = status?.fuelRemainingLaps,
        fuelMix = status?.fuelMix,
        brakeBias = status?.brakeBias,
        ersStoreEnergy = status?.ersStoreEnergy,
        ersDeployMode = status?.ersDeployMode,
        ersDeployedThisLap = status?.ersDeployedThisLap,
        ersHarvestedMGUK = status?.ersHarvestedMGUK,
        ersHarvestedMGUH = status?.ersHarvestedMGUH,
        tireWear = damage?.tireWear ?: listOf(0, 0, 0, 0),
        damage = compactDamage(damage),
        setup = envelope.carSetups?.carSetups?.getOrNull(carIndex),
        bestSector1Ms = history?.bestSector1Ms,
        bestSector2Ms = history?.bestSector2Ms,
        bestSector3Ms = history?.bestSector3Ms,
        availableSets = buildTyreSetBriefs(tyreSets, source),
        stintHistory = source?.normalized?.stintHistory ?: emptyList(),
        dynamics = source?.normalized?.dynamics ?: emptyList(),
        ersActualPct = source?.normalized?.ersActualPct,
        ersActualReady = source?.normalized?.ersActualReady,
        ersEstimatePct = source?.normalized?.ersEstimatePct,
        ersEstimateReady = source?.normalized?.ersEstimateReady,
    )
}

private fun buildVisibleNormalizedCar(
    envelope: FullTelemetryEnvelope,
    carIndex: Int,
    source: CarEnvelope?,
    mode: ParseMode,
    playerCarIndex: Int?,
): NormalizedCar {
    val fullNormalized = source?.normalized ?: buildRawNormalizedCar(envelope, carIndex, source)
    val showPublicOrSelf = canExposePublicOrSelfForMode(mode, carIndex, playerCarIndex)
    val showERSEnergy = canExposeERSEnergyForMode(mode, carIndex, playerCarIndex)
    val showERSPct = canExposeERSPctForMode(mode, carIndex, playerCarIndex)
    val showDRSActivated = canExposeDRSActivatedForMode(mode, carIndex, playerCarIndex)
    val showSetup = canExposeSelfOrAi(carIndex, playerCarIndex, envelope.participants)
    val showDamage = canExposeDamageForMode(mode, carIndex, playerCarIndex)
    val showTireWear = canExposeTireWearForMode(mode, carIndex, playerCarIndex)

    return fullNormalized.copy(
        drsActivated = if (showDRSActivated) fullNormalized.drsActivated else null,
        fuelInTank = if (showPublicOrSelf) fullNormalized.fuelInTank else null,
        fuelCapacity = if (showPublicOrSelf) fullNormalized.fuelCapacity else null,
        fuelRemainingLaps = if (showPublicOrSelf) fullNormalized.fuelRemainingLaps else null,
        fuelMix = if (showPublicOrSelf) fullNormalized.fuelMix else null,
        brakeBias = if (showPublicOrSelf) fullNormalized.brakeBias else null,
        ersStoreEnergy = if (showERSEnergy) fullNormalized.ersStoreEnergy else null,
        ersDeployMode = if (showPublicOrSelf) fullNormalized.ersDeployMode else null,
        ersDeployedThisLap = if (showPublicOrSelf) fullNormalized.ersDeployedThisLap else null,
        ersHarvestedMGUK = if (showPublicOrSelf) fullNormalized.ersHarvestedMGUK else null,
        ersHarvestedMGUH = if (showPublicOrSelf) fullNormalized.ersHarvestedMGUH else null,
        tireWear = if (showDamage && showTireWear) fullNormalized.tireWear else listOf(0, 0, 0, 0),
        damage = if (showDamage) fullNormalized.damage else null,
        setup = if (showSetup) fullNormalized.setup else null,
        ersActualPct = if (showERSPct) fullNormalized.ersActualPct else null,
        ersActualReady = if (showERSPct) fullNormalized.ersActualReady else null,
        ersEstimatePct = if (showERSPct) fullNormalized.ersEstimatePct else null,
        ersEstimateReady = if (showERSPct) fullNormalized.ersEstimateReady else null,
    )
}

private fun normalizeCarSetups(packet: PacketCarSetupData?): PacketCarSetupData? {
    if (packet == null) return null
    return packet.copy(
        carSetups = packet.carSetups.map(::normalizeSetup),
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
            if (canExposeSelfOrAi(index, playerCarIndex, participants)) normalizeSetup(setup) else CarSetupData()
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
            filterCarStatusEntry(status, mode, index, playerCarIndex)
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
            filterCarDamageEntry(damage, mode, index, playerCarIndex)
        },
    )
}

private fun filterCarStatusEntry(
    status: CarStatusData,
    mode: ParseMode,
    carIndex: Int,
    playerCarIndex: Int?,
): CarStatusData {
    val showPublicOrSelf = canExposePublicOrSelfForMode(mode, carIndex, playerCarIndex)
    val showERSEnergy = canExposeERSEnergyForMode(mode, carIndex, playerCarIndex)
    if (showPublicOrSelf) {
        return status.copy()
    }
    return status.copy(
        fuelInTank = null,
        fuelCapacity = null,
        fuelRemainingLaps = null,
        fuelMix = null,
        brakeBias = null,
        ersStoreEnergy = if (showERSEnergy) status.ersStoreEnergy else null,
        ersDeployMode = null,
        ersHarvestedMGUK = null,
        ersHarvestedMGUH = null,
        ersDeployedThisLap = null,
    )
}

private fun filterCarDamageEntry(
    damage: CarDamageData,
    mode: ParseMode,
    carIndex: Int,
    playerCarIndex: Int?,
): CarDamageData = when {
    canExposePublicOrSelfForMode(mode, carIndex, playerCarIndex) -> damage.copy()
    canExposeDamageForMode(mode, carIndex, playerCarIndex) -> damage.copy(tireWear = listOf(0, 0, 0, 0))
    else -> CarDamageData()
}

private fun canExposePublicOrSelfForMode(
    mode: ParseMode,
    carIndex: Int,
    playerCarIndex: Int?,
): Boolean = mode == ParseMode.PUBLIC || playerCarIndex == carIndex

private fun canExposeERSEnergyForMode(
    mode: ParseMode,
    carIndex: Int,
    playerCarIndex: Int?,
): Boolean = mode == ParseMode.PUBLIC || mode == ParseMode.FRC || playerCarIndex == carIndex

private fun canExposeDRSActivatedForMode(
    mode: ParseMode,
    carIndex: Int,
    playerCarIndex: Int?,
): Boolean = mode == ParseMode.PUBLIC || mode == ParseMode.FRC || mode == ParseMode.DRIVERS || playerCarIndex == carIndex

private fun canExposeDamageForMode(
    mode: ParseMode,
    carIndex: Int,
    playerCarIndex: Int?,
): Boolean = mode == ParseMode.PUBLIC || mode == ParseMode.FRC || mode == ParseMode.DRIVERS || playerCarIndex == carIndex

private fun canExposeTireWearForMode(
    mode: ParseMode,
    carIndex: Int,
    playerCarIndex: Int?,
): Boolean = mode == ParseMode.PUBLIC || playerCarIndex == carIndex

private fun canExposeERSPctForMode(
    mode: ParseMode,
    carIndex: Int,
    playerCarIndex: Int?,
): Boolean = mode == ParseMode.PUBLIC || playerCarIndex == carIndex

private fun canExposeSelfOrAi(
    carIndex: Int,
    playerCarIndex: Int?,
    participants: PacketParticipantsData?,
): Boolean {
    if (playerCarIndex == carIndex) return true
    return participants?.participants?.getOrNull(carIndex)?.aiControlled == true
}

private fun normalizeSetup(setup: CarSetupData): CarSetupData {
    val resolvedOnThrottle = setup.onThrottle ?: setup.diffOnThrottle
    return setup.copy(
        onThrottle = resolvedOnThrottle,
        diffOnThrottle = resolvedOnThrottle,
    )
}

private fun resolveTireCompound(source: CarEnvelope?, status: CarStatusData?): String? {
    if (!source?.normalized?.tireCompound.isNullOrEmpty()) {
        return source?.normalized?.tireCompound
    }
    if (status?.actualTyreCompound == null && status?.visualTyreCompound == null) {
        return null
    }
    return "actual:${status?.actualTyreCompound ?: 0}/visual:${status?.visualTyreCompound ?: 0}"
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
