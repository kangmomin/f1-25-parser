export function parseEnvelope(input, _options = {}) {
    const sourceCars = new Map((input.cars ?? []).map((car) => [car.carIndex, car]));
    const output = {
        ...input,
        carSetups: normalizeCarSetups(input.carSetups),
        sessionHistoryByCar: { ...(input.sessionHistoryByCar ?? {}) },
        tyreSetsByCar: { ...(input.tyreSetsByCar ?? {}) },
        cars: [],
    };
    for (let carIndex = 0; carIndex < detectCarCount(output); carIndex += 1) {
        output.cars.push(buildCarEnvelope(output, carIndex, sourceCars.get(carIndex)));
    }
    if (!output.capturedAt) {
        output.capturedAt = new Date();
    }
    return output;
}
export function getVisibleEnvelope(input, options = {}) {
    const envelope = ensureParsedEnvelope(input);
    const mode = normalizeMode(options.mode);
    const playerCarIndex = resolvePlayerCarIndex(envelope, options);
    const sourceCars = new Map((envelope.cars ?? []).map((car) => [car.carIndex, car]));
    const output = {
        ...envelope,
        carSetups: getVisibleCarSetupsPacket(envelope.carSetups, envelope.participants, playerCarIndex),
        carStatus: getVisibleCarStatusPacket(envelope.carStatus, mode, playerCarIndex),
        carDamage: getVisibleCarDamagePacket(envelope.carDamage, mode, playerCarIndex),
        sessionHistoryByCar: { ...(envelope.sessionHistoryByCar ?? {}) },
        tyreSetsByCar: { ...(envelope.tyreSetsByCar ?? {}) },
        cars: [],
    };
    for (let carIndex = 0; carIndex < detectCarCount(envelope); carIndex += 1) {
        output.cars.push(buildVisibleCarEnvelope(envelope, carIndex, sourceCars.get(carIndex), mode, playerCarIndex));
    }
    if (!output.capturedAt) {
        output.capturedAt = new Date();
    }
    return output;
}
export function getVisibleCars(input, options = {}) {
    return getVisibleEnvelope(input, options).cars ?? [];
}
export function getVisibleCarEnvelope(input, carIndex, options = {}) {
    const envelope = ensureParsedEnvelope(input);
    const mode = normalizeMode(options.mode);
    const playerCarIndex = resolvePlayerCarIndex(envelope, options);
    const source = envelope.cars?.find((car) => car.carIndex === carIndex);
    return buildVisibleCarEnvelope(envelope, carIndex, source, mode, playerCarIndex);
}
export function getVisibleNormalizedCar(input, carIndex, options = {}) {
    return getVisibleCarEnvelope(input, carIndex, options)?.normalized;
}
export function getVisibleCarSetup(input, carIndex, options = {}) {
    const envelope = ensureParsedEnvelope(input);
    return getVisibleSetupAt(envelope.carSetups, envelope.participants, carIndex, resolvePlayerCarIndex(envelope, options));
}
export function getVisibleCarStatus(input, carIndex, options = {}) {
    const envelope = ensureParsedEnvelope(input);
    const mode = normalizeMode(options.mode);
    const playerCarIndex = resolvePlayerCarIndex(envelope, options);
    return getVisibleStatusAt(envelope.carStatus, carIndex, mode, playerCarIndex);
}
export function getVisibleCarDamage(input, carIndex, options = {}) {
    const envelope = ensureParsedEnvelope(input);
    const mode = normalizeMode(options.mode);
    const playerCarIndex = resolvePlayerCarIndex(envelope, options);
    return getVisibleDamageAt(envelope.carDamage, carIndex, mode, playerCarIndex);
}
function ensureParsedEnvelope(input) {
    return input.cars?.length ? input : parseEnvelope(input);
}
function normalizeMode(mode) {
    return mode === "public" || mode === "strict" || mode === "frc" || mode === "drivers"
        ? mode
        : "strict";
}
function resolvePlayerCarIndex(input, options) {
    return options.playerCarIndex ?? input.header?.playerCarIndex ?? null;
}
function detectCarCount(input) {
    let maxCount = input.cars?.length ?? 0;
    const lengths = [
        input.participants?.participants?.length ?? 0,
        input.motion?.carMotionData?.length ?? 0,
        input.lapData?.lapData?.length ?? 0,
        input.carSetups?.carSetups?.length ?? 0,
        input.carTelemetry?.carTelemetryData?.length ?? 0,
        input.carStatus?.carStatusData?.length ?? 0,
        input.carDamage?.carDamageData?.length ?? 0,
    ];
    for (const length of lengths) {
        maxCount = Math.max(maxCount, length);
    }
    for (const key of Object.keys(input.sessionHistoryByCar ?? {})) {
        maxCount = Math.max(maxCount, Number(key) + 1);
    }
    for (const key of Object.keys(input.tyreSetsByCar ?? {})) {
        maxCount = Math.max(maxCount, Number(key) + 1);
    }
    return maxCount;
}
function buildCarEnvelope(envelope, carIndex, source) {
    return {
        carIndex,
        participant: envelope.participants?.participants?.[carIndex],
        motion: envelope.motion?.carMotionData?.[carIndex],
        lap: envelope.lapData?.lapData?.[carIndex],
        setup: envelope.carSetups?.carSetups?.[carIndex],
        telemetry: envelope.carTelemetry?.carTelemetryData?.[carIndex],
        status: envelope.carStatus?.carStatusData?.[carIndex],
        damage: envelope.carDamage?.carDamageData?.[carIndex],
        history: envelope.sessionHistoryByCar?.[carIndex],
        tyreSets: envelope.tyreSetsByCar?.[carIndex],
        normalized: buildNormalizedCar(carIndex, envelope, source),
    };
}
function buildVisibleCarEnvelope(envelope, carIndex, source, mode, playerCarIndex) {
    return {
        carIndex,
        participant: envelope.participants?.participants?.[carIndex],
        motion: envelope.motion?.carMotionData?.[carIndex],
        lap: envelope.lapData?.lapData?.[carIndex],
        setup: getVisibleSetupAt(envelope.carSetups, envelope.participants, carIndex, playerCarIndex),
        telemetry: envelope.carTelemetry?.carTelemetryData?.[carIndex],
        status: getVisibleStatusAt(envelope.carStatus, carIndex, mode, playerCarIndex),
        damage: getVisibleDamageAt(envelope.carDamage, carIndex, mode, playerCarIndex),
        history: envelope.sessionHistoryByCar?.[carIndex],
        tyreSets: envelope.tyreSetsByCar?.[carIndex],
        normalized: buildVisibleNormalizedCar(envelope, carIndex, source, mode, playerCarIndex),
    };
}
function buildNormalizedCar(carIndex, envelope, source) {
    const participant = envelope.participants?.participants?.[carIndex];
    const lap = envelope.lapData?.lapData?.[carIndex];
    const telemetry = envelope.carTelemetry?.carTelemetryData?.[carIndex];
    const status = envelope.carStatus?.carStatusData?.[carIndex];
    const damage = envelope.carDamage?.carDamageData?.[carIndex];
    const history = envelope.sessionHistoryByCar?.[carIndex];
    const tyreSets = envelope.tyreSetsByCar?.[carIndex];
    const normalized = {
        index: carIndex,
        name: participant?.name,
        teamId: participant?.teamId,
        yourTelemetry: participant?.yourTelemetry,
        aiControlled: participant?.aiControlled,
        position: lap?.position,
        currentLapNum: lap?.currentLapNum,
        lapDistance: lap?.lapDistance,
        speed: telemetry?.speed,
        throttle: telemetry?.throttle,
        brake: telemetry?.brake,
        steering: telemetry?.steering,
        gear: telemetry?.gear,
        brakeTemp: telemetry?.brakeTemp,
        tireSurfaceTemp: telemetry?.tireSurfaceTemp,
        tireInnerTemp: telemetry?.tireInnerTemp,
        tirePressure: telemetry?.tirePressure,
        surfaceType: telemetry?.surfaceType,
        drsActivated: telemetry?.drs !== undefined ? telemetry.drs !== 0 : undefined,
        lastLapTime: lap?.lastLapTime,
        bestLapTime: lap?.bestLapTime,
        sector1TimeMs: lap?.sector1TimeMs,
        sector2TimeMs: lap?.sector2TimeMs,
        currentSector: lap?.currentSector,
        deltaToCarInFront: lap?.deltaToCarInFront,
        deltaToRaceLeader: lap?.deltaToRaceLeader,
        pitStatus: lap?.pitStatus,
        driverStatus: lap?.driverStatus,
        resultStatus: lap?.resultStatus,
        numPitStops: lap?.numPitStops,
        pitStopTimer: lap?.pitStopTimer,
        pitLaneTime: lap?.pitLaneTime,
        penalties: lap?.penalties,
        totalWarnings: lap?.totalWarnings,
        cornerCuttingWarnings: lap?.cornerCuttingWarnings,
        numUnservedDriveThroughs: lap?.numUnservedDriveThroughs,
        numUnservedStopGoPenalties: lap?.numUnservedStopGoPenalties,
        lapInvalid: lap?.lapInvalid,
        tireCompound: resolveTireCompound(source, status),
        actualTyreCompound: status?.actualTyreCompound,
        tireAge: status?.tireAge,
        fuelInTank: status?.fuelInTank,
        fuelCapacity: status?.fuelCapacity,
        fuelRemainingLaps: status?.fuelRemainingLaps,
        fuelMix: status?.fuelMix,
        brakeBias: status?.brakeBias,
        ersStoreEnergy: status?.ersStoreEnergy,
        ersDeployMode: status?.ersDeployMode,
        ersDeployedThisLap: status?.ersDeployedThisLap,
        ersHarvestedMGUK: status?.ersHarvestedMGUK,
        ersHarvestedMGUH: status?.ersHarvestedMGUH,
        setup: envelope.carSetups?.carSetups?.[carIndex],
        bestSector1Ms: history?.bestSector1Ms,
        bestSector2Ms: history?.bestSector2Ms,
        bestSector3Ms: history?.bestSector3Ms,
        availableSets: buildTyreSetBriefs(tyreSets, source),
        stintHistory: source?.normalized.stintHistory,
        dynamics: source?.normalized.dynamics,
        ersActualPct: source?.normalized.ersActualPct,
        ersActualReady: source?.normalized.ersActualReady,
        ersEstimatePct: source?.normalized.ersEstimatePct,
        ersEstimateReady: source?.normalized.ersEstimateReady,
    };
    if (damage) {
        normalized.damage = compactDamage(damage);
        normalized.tireWear = damage.tireWear;
    }
    return normalized;
}
function buildVisibleNormalizedCar(envelope, carIndex, source, mode, playerCarIndex) {
    const fullNormalized = source?.normalized ?? buildNormalizedCar(carIndex, envelope, source);
    const showPublicOrSelf = canExposePublicOrSelfForMode(mode, carIndex, playerCarIndex);
    const showERSEnergy = canExposeERSEnergyForMode(mode, carIndex, playerCarIndex);
    const showERSPct = canExposeERSPctForMode(mode, carIndex, playerCarIndex);
    const showDRSActivated = canExposeDRSActivatedForMode(mode, carIndex, playerCarIndex);
    const showSetup = canExposeSelfOrAi(carIndex, playerCarIndex, envelope.participants);
    const showDamage = canExposeDamageForMode(mode, carIndex, playerCarIndex);
    const showTireWear = canExposeTireWearForMode(mode, carIndex, playerCarIndex);
    const normalized = {
        ...fullNormalized,
        setup: showSetup ? fullNormalized.setup : undefined,
        drsActivated: showDRSActivated ? fullNormalized.drsActivated : undefined,
    };
    if (!showPublicOrSelf) {
        normalized.fuelInTank = undefined;
        normalized.fuelCapacity = undefined;
        normalized.fuelRemainingLaps = undefined;
        normalized.fuelMix = undefined;
        normalized.brakeBias = undefined;
        normalized.ersDeployMode = undefined;
        normalized.ersDeployedThisLap = undefined;
        normalized.ersHarvestedMGUK = undefined;
        normalized.ersHarvestedMGUH = undefined;
    }
    if (!showERSEnergy) {
        normalized.ersStoreEnergy = undefined;
    }
    if (!showDamage) {
        normalized.damage = undefined;
        normalized.tireWear = undefined;
    }
    else if (!showTireWear) {
        normalized.tireWear = undefined;
    }
    if (!showERSPct) {
        normalized.ersActualPct = undefined;
        normalized.ersActualReady = undefined;
        normalized.ersEstimatePct = undefined;
        normalized.ersEstimateReady = undefined;
    }
    return normalized;
}
function normalizeCarSetups(packet) {
    if (!packet?.carSetups) {
        return packet;
    }
    return {
        ...packet,
        carSetups: packet.carSetups.map((setup) => normalizeSetup(setup)),
    };
}
function getVisibleCarSetupsPacket(packet, participants, playerCarIndex) {
    if (!packet?.carSetups) {
        return packet;
    }
    return {
        ...packet,
        carSetups: packet.carSetups.map((setup, index) => canExposeSelfOrAi(index, playerCarIndex, participants) ? normalizeSetup(setup) : {}),
    };
}
function getVisibleCarStatusPacket(packet, mode, playerCarIndex) {
    if (!packet?.carStatusData) {
        return packet;
    }
    return {
        ...packet,
        carStatusData: packet.carStatusData.map((status, index) => filterCarStatusEntry(status, index, mode, playerCarIndex)),
    };
}
function getVisibleCarDamagePacket(packet, mode, playerCarIndex) {
    if (!packet?.carDamageData) {
        return packet;
    }
    return {
        ...packet,
        carDamageData: packet.carDamageData.map((damage, index) => filterCarDamageEntry(damage, index, mode, playerCarIndex)),
    };
}
function getVisibleSetupAt(packet, participants, carIndex, playerCarIndex) {
    const setup = packet?.carSetups?.[carIndex];
    if (!setup) {
        return undefined;
    }
    return canExposeSelfOrAi(carIndex, playerCarIndex, participants)
        ? normalizeSetup(setup)
        : undefined;
}
function getVisibleStatusAt(packet, carIndex, mode, playerCarIndex) {
    const status = packet?.carStatusData?.[carIndex];
    if (!status) {
        return undefined;
    }
    return filterCarStatusEntry(status, carIndex, mode, playerCarIndex);
}
function getVisibleDamageAt(packet, carIndex, mode, playerCarIndex) {
    const damage = packet?.carDamageData?.[carIndex];
    if (!damage) {
        return undefined;
    }
    const filtered = filterCarDamageEntry(damage, carIndex, mode, playerCarIndex);
    return Object.keys(filtered).length > 0 ? filtered : undefined;
}
function filterCarStatusEntry(status, carIndex, mode, playerCarIndex) {
    const showPublicOrSelf = canExposePublicOrSelfForMode(mode, carIndex, playerCarIndex);
    const showERSEnergy = canExposeERSEnergyForMode(mode, carIndex, playerCarIndex);
    if (showPublicOrSelf) {
        return { ...status };
    }
    const filtered = { ...status };
    filtered.fuelInTank = undefined;
    filtered.fuelCapacity = undefined;
    filtered.fuelRemainingLaps = undefined;
    filtered.fuelMix = undefined;
    filtered.brakeBias = undefined;
    filtered.ersDeployMode = undefined;
    filtered.ersDeployedThisLap = undefined;
    filtered.ersHarvestedMGUK = undefined;
    filtered.ersHarvestedMGUH = undefined;
    if (!showERSEnergy) {
        filtered.ersStoreEnergy = undefined;
    }
    return filtered;
}
function filterCarDamageEntry(damage, carIndex, mode, playerCarIndex) {
    const showPublicOrSelf = canExposePublicOrSelfForMode(mode, carIndex, playerCarIndex);
    const showDamage = canExposeDamageForMode(mode, carIndex, playerCarIndex);
    if (showPublicOrSelf) {
        return { ...damage };
    }
    if (showDamage) {
        return {
            ...damage,
            tireWear: undefined,
        };
    }
    return {};
}
function canExposePublicOrSelfForMode(mode, carIndex, playerCarIndex) {
    return mode === "public" || (playerCarIndex !== null && playerCarIndex === carIndex);
}
function canExposeERSPctForMode(mode, carIndex, playerCarIndex) {
    return mode === "public" || (playerCarIndex !== null && playerCarIndex === carIndex);
}
function canExposeERSEnergyForMode(mode, carIndex, playerCarIndex) {
    return mode === "public" || mode === "frc" || (playerCarIndex !== null && playerCarIndex === carIndex);
}
function canExposeDRSActivatedForMode(mode, carIndex, playerCarIndex) {
    return mode === "public"
        || mode === "frc"
        || mode === "drivers"
        || (playerCarIndex !== null && playerCarIndex === carIndex);
}
function canExposeDamageForMode(mode, carIndex, playerCarIndex) {
    return mode === "public"
        || mode === "frc"
        || mode === "drivers"
        || (playerCarIndex !== null && playerCarIndex === carIndex);
}
function canExposeTireWearForMode(mode, carIndex, playerCarIndex) {
    return mode === "public" || (playerCarIndex !== null && playerCarIndex === carIndex);
}
function canExposeSelfOrAi(carIndex, playerCarIndex, participants) {
    if (playerCarIndex !== null && playerCarIndex === carIndex) {
        return true;
    }
    return participants?.participants?.[carIndex]?.aiControlled === true;
}
function normalizeSetup(setup) {
    if (setup.onThrottle !== undefined) {
        return {
            ...setup,
            diffOnThrottle: setup.onThrottle,
        };
    }
    if (setup.diffOnThrottle !== undefined) {
        return {
            ...setup,
            onThrottle: setup.diffOnThrottle,
        };
    }
    return { ...setup };
}
function resolveTireCompound(source, status) {
    if (source?.normalized.tireCompound) {
        return source.normalized.tireCompound;
    }
    const actual = status?.actualTyreCompound;
    const visual = status?.visualTyreCompound;
    if (actual === undefined && visual === undefined) {
        return undefined;
    }
    return `actual:${actual ?? 0}/visual:${visual ?? 0}`;
}
function compactDamage(damage) {
    return {
        frontLeftWing: damage.frontLeftWingDamage,
        frontRightWing: damage.frontRightWingDamage,
        rearWing: damage.rearWingDamage,
        floor: damage.floorDamage,
        diffuser: damage.diffuserDamage,
        sidepod: damage.sidepodDamage,
        gearbox: damage.gearboxDamage,
        engine: damage.engineDamage,
    };
}
function buildTyreSetBriefs(tyreSets, source) {
    if (source?.normalized.availableSets?.length) {
        return source.normalized.availableSets;
    }
    if (!tyreSets?.availableSets?.length) {
        return undefined;
    }
    return tyreSets.availableSets.map((item, index) => ({
        index,
        wear: item.wear,
        available: item.available,
    }));
}
