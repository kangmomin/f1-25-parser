package frc.engineer.telemetrymodel;

import frc.engineer.dto.DtoModels;
import frc.engineer.packets.PacketModels;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class TelemetryParser {
    private TelemetryParser() {
    }

    public static FullTelemetryEnvelope parse(FullTelemetryEnvelope input, ParseOptions options) {
        ParseOptions effectiveOptions = options == null ? new ParseOptions() : options;
        ParseMode mode = effectiveOptions.mode == null ? ParseMode.STRICT : effectiveOptions.mode;
        ParseMode effectiveMode = mode == ParseMode.FRC ? ParseMode.STRICT : mode;
        Integer playerCarIndex = effectiveOptions.playerCarIndex != null
                ? effectiveOptions.playerCarIndex
                : (input.header != null ? input.header.playerCarIndex : null);

        FullTelemetryEnvelope output = new FullTelemetryEnvelope();
        output.capturedAt = input.capturedAt != null ? input.capturedAt : Instant.now();
        output.header = input.header;
        output.session = input.session;
        output.lastEvent = input.lastEvent;
        output.participants = input.participants;
        output.motion = input.motion;
        output.lapData = input.lapData;
        output.carTelemetry = input.carTelemetry;
        output.carSetups = filterCarSetups(input.carSetups, input.participants, playerCarIndex);
        output.carStatus = filterCarStatus(input.carStatus, effectiveMode, playerCarIndex);
        output.carDamage = filterCarDamage(input.carDamage, effectiveMode, playerCarIndex);
        output.sessionHistoryByCar = input.sessionHistoryByCar != null
                ? new HashMap<>(input.sessionHistoryByCar)
                : new HashMap<>();
        output.tyreSetsByCar = input.tyreSetsByCar != null
                ? new HashMap<>(input.tyreSetsByCar)
                : new HashMap<>();
        output.pitwall = input.pitwall;
        output.cars = new ArrayList<>();

        Map<Integer, CarEnvelope> sourceCars = new HashMap<>();
        if (input.cars != null) {
            for (CarEnvelope car : input.cars) {
                sourceCars.put(car.carIndex, car);
            }
        }

        int carCount = detectCarCount(input);
        for (int carIndex = 0; carIndex < carCount; carIndex++) {
            output.cars.add(buildCarEnvelope(output, carIndex, sourceCars.get(carIndex), effectiveMode, playerCarIndex));
        }
        return output;
    }

    private static int detectCarCount(FullTelemetryEnvelope input) {
        int maxCount = input.cars != null ? input.cars.size() : 0;
        maxCount = Math.max(maxCount, sizeOf(input.participants == null ? null : input.participants.participants));
        maxCount = Math.max(maxCount, sizeOf(input.motion == null ? null : input.motion.carMotionData));
        maxCount = Math.max(maxCount, sizeOf(input.lapData == null ? null : input.lapData.lapData));
        maxCount = Math.max(maxCount, sizeOf(input.carSetups == null ? null : input.carSetups.carSetups));
        maxCount = Math.max(maxCount, sizeOf(input.carTelemetry == null ? null : input.carTelemetry.carTelemetryData));
        maxCount = Math.max(maxCount, sizeOf(input.carStatus == null ? null : input.carStatus.carStatusData));
        maxCount = Math.max(maxCount, sizeOf(input.carDamage == null ? null : input.carDamage.carDamageData));
        if (input.sessionHistoryByCar != null) {
            for (Integer carIndex : input.sessionHistoryByCar.keySet()) {
                maxCount = Math.max(maxCount, carIndex + 1);
            }
        }
        if (input.tyreSetsByCar != null) {
            for (Integer carIndex : input.tyreSetsByCar.keySet()) {
                maxCount = Math.max(maxCount, carIndex + 1);
            }
        }
        return maxCount;
    }

    private static CarEnvelope buildCarEnvelope(
            FullTelemetryEnvelope envelope,
            int carIndex,
            CarEnvelope source,
            ParseMode mode,
            Integer playerCarIndex
    ) {
        boolean showPublicOrSelf = canExposePublicOrSelfForMode(mode, carIndex, playerCarIndex);
        boolean showSetup = canExposeSelfOrAi(carIndex, playerCarIndex, envelope.participants);
        CarEnvelope car = new CarEnvelope();
        car.carIndex = carIndex;
        car.participant = getAt(envelope.participants == null ? null : envelope.participants.participants, carIndex);
        car.motion = getAt(envelope.motion == null ? null : envelope.motion.carMotionData, carIndex);
        car.lap = getAt(envelope.lapData == null ? null : envelope.lapData.lapData, carIndex);
        car.setup = showSetup ? getAt(envelope.carSetups == null ? null : envelope.carSetups.carSetups, carIndex) : null;
        car.telemetry = getAt(envelope.carTelemetry == null ? null : envelope.carTelemetry.carTelemetryData, carIndex);
        car.status = getAt(envelope.carStatus == null ? null : envelope.carStatus.carStatusData, carIndex);
        car.damage = showPublicOrSelf ? getAt(envelope.carDamage == null ? null : envelope.carDamage.carDamageData, carIndex) : null;
        car.history = envelope.sessionHistoryByCar != null ? envelope.sessionHistoryByCar.get(carIndex) : null;
        car.tyreSets = envelope.tyreSetsByCar != null ? envelope.tyreSetsByCar.get(carIndex) : null;
        car.normalized = buildNormalizedCar(envelope, carIndex, source, showPublicOrSelf, showSetup);
        return car;
    }

    private static NormalizedCar buildNormalizedCar(
            FullTelemetryEnvelope envelope,
            int carIndex,
            CarEnvelope source,
            boolean showPublicOrSelf,
            boolean showSetup
    ) {
        PacketModels.ParticipantData participant = getAt(envelope.participants == null ? null : envelope.participants.participants, carIndex);
        PacketModels.LapData lap = getAt(envelope.lapData == null ? null : envelope.lapData.lapData, carIndex);
        PacketModels.CarTelemetryData telemetry = getAt(envelope.carTelemetry == null ? null : envelope.carTelemetry.carTelemetryData, carIndex);
        PacketModels.CarStatusData status = getAt(envelope.carStatus == null ? null : envelope.carStatus.carStatusData, carIndex);
        PacketModels.CarDamageData damage = getAt(envelope.carDamage == null ? null : envelope.carDamage.carDamageData, carIndex);
        PacketModels.PacketSessionHistoryData history = envelope.sessionHistoryByCar != null
                ? envelope.sessionHistoryByCar.get(carIndex)
                : null;
        PacketModels.PacketTyreSetsData tyreSets = envelope.tyreSetsByCar != null
                ? envelope.tyreSetsByCar.get(carIndex)
                : null;

        NormalizedCar out = new NormalizedCar();
        out.index = carIndex;
        out.name = participant != null ? participant.name : null;
        out.teamId = participant != null ? participant.teamId : null;
        out.yourTelemetry = participant != null ? participant.yourTelemetry : null;
        out.position = lap != null ? lap.position : null;
        out.currentLapNum = lap != null ? lap.currentLapNum : null;
        out.lapDistance = lap != null ? lap.lapDistance : null;
        out.speed = telemetry != null ? telemetry.speed : null;
        out.throttle = telemetry != null ? telemetry.throttle : null;
        out.brake = telemetry != null ? telemetry.brake : null;
        out.steering = telemetry != null ? telemetry.steering : null;
        out.gear = telemetry != null ? telemetry.gear : null;
        out.brakeTemp = telemetry != null ? telemetry.brakeTemp : out.brakeTemp;
        out.tireSurfaceTemp = telemetry != null ? telemetry.tireSurfaceTemp : out.tireSurfaceTemp;
        out.tireInnerTemp = telemetry != null ? telemetry.tireInnerTemp : out.tireInnerTemp;
        out.tirePressure = telemetry != null ? telemetry.tirePressure : out.tirePressure;
        out.surfaceType = telemetry != null ? telemetry.surfaceType : out.surfaceType;
        out.lastLapTime = lap != null ? lap.lastLapTime : null;
        out.bestLapTime = lap != null ? lap.bestLapTime : null;
        out.sector1TimeMs = lap != null ? lap.sector1TimeMs : null;
        out.sector2TimeMs = lap != null ? lap.sector2TimeMs : null;
        out.currentSector = lap != null ? lap.currentSector : null;
        out.deltaToCarInFront = lap != null ? lap.deltaToCarInFront : null;
        out.deltaToRaceLeader = lap != null ? lap.deltaToRaceLeader : null;
        out.pitStatus = lap != null ? lap.pitStatus : null;
        out.driverStatus = lap != null ? lap.driverStatus : null;
        out.resultStatus = lap != null ? lap.resultStatus : null;
        out.numPitStops = lap != null ? lap.numPitStops : null;
        out.pitStopTimer = lap != null ? lap.pitStopTimer : null;
        out.pitLaneTime = lap != null ? lap.pitLaneTime : null;
        out.penalties = lap != null ? lap.penalties : null;
        out.totalWarnings = lap != null ? lap.totalWarnings : null;
        out.cornerCuttingWarnings = lap != null ? lap.cornerCuttingWarnings : null;
        out.numUnservedDriveThroughs = lap != null ? lap.numUnservedDriveThroughs : null;
        out.numUnservedStopGoPenalties = lap != null ? lap.numUnservedStopGoPenalties : null;
        out.lapInvalid = lap != null ? lap.lapInvalid : null;
        out.actualTyreCompound = status != null ? status.actualTyreCompound : null;
        out.tireAge = status != null ? status.tireAge : null;
        out.bestSector1Ms = history != null ? history.bestSector1Ms : null;
        out.bestSector2Ms = history != null ? history.bestSector2Ms : null;
        out.bestSector3Ms = history != null ? history.bestSector3Ms : null;
        out.tireCompound = source != null && source.normalized != null ? source.normalized.tireCompound : null;
        out.stintHistory = source != null && source.normalized != null ? source.normalized.stintHistory : new ArrayList<>();
        out.dynamics = source != null && source.normalized != null ? source.normalized.dynamics : new ArrayList<>();
        out.availableSets = buildTyreSetBriefs(tyreSets, source);
        out.ersEstimatePct = source != null && source.normalized != null ? source.normalized.ersEstimatePct : null;
        out.ersEstimateReady = source != null && source.normalized != null ? source.normalized.ersEstimateReady : null;

        if (showPublicOrSelf) {
            out.fuelInTank = status != null ? status.fuelInTank : null;
            out.fuelCapacity = status != null ? status.fuelCapacity : null;
            out.fuelRemainingLaps = status != null ? status.fuelRemainingLaps : null;
            out.fuelMix = status != null ? status.fuelMix : null;
            out.brakeBias = status != null ? status.brakeBias : null;
            out.ersStoreEnergy = status != null ? status.ersStoreEnergy : null;
            out.ersDeployMode = status != null ? status.ersDeployMode : null;
            out.ersDeployedThisLap = status != null ? status.ersDeployedThisLap : null;
            out.ersHarvestedMGUK = status != null ? status.ersHarvestedMGUK : null;
            out.ersHarvestedMGUH = status != null ? status.ersHarvestedMGUH : null;
            out.ersActualPct = source != null && source.normalized != null ? source.normalized.ersActualPct : null;
            out.ersActualReady = source != null && source.normalized != null ? source.normalized.ersActualReady : null;
            if (damage != null) {
                out.tireWear = damage.tireWear;
                out.damage = compactDamage(damage);
            }
        }

        if (showSetup) {
            out.setup = getAt(envelope.carSetups == null ? null : envelope.carSetups.carSetups, carIndex);
        }
        return out;
    }

    private static PacketModels.PacketCarSetupData filterCarSetups(
            PacketModels.PacketCarSetupData input,
            PacketModels.PacketParticipantsData participants,
            Integer playerCarIndex
    ) {
        if (input == null) {
            return null;
        }
        PacketModels.PacketCarSetupData output = new PacketModels.PacketCarSetupData();
        for (int i = 0; i < input.carSetups.size(); i++) {
            output.carSetups.add(canExposeSelfOrAi(i, playerCarIndex, participants)
                    ? input.carSetups.get(i)
                    : new PacketModels.CarSetupData());
        }
        return output;
    }

    private static PacketModels.PacketCarStatusData filterCarStatus(
            PacketModels.PacketCarStatusData input,
            ParseMode mode,
            Integer playerCarIndex
    ) {
        if (input == null) {
            return null;
        }
        PacketModels.PacketCarStatusData output = new PacketModels.PacketCarStatusData();
        for (int i = 0; i < input.carStatusData.size(); i++) {
            PacketModels.CarStatusData status = input.carStatusData.get(i);
            if (canExposePublicOrSelfForMode(mode, i, playerCarIndex)) {
                output.carStatusData.add(status);
            } else {
                PacketModels.CarStatusData filtered = copyStatus(status);
                filtered.fuelInTank = null;
                filtered.fuelCapacity = null;
                filtered.fuelRemainingLaps = null;
                filtered.fuelMix = null;
                filtered.brakeBias = null;
                filtered.ersStoreEnergy = null;
                filtered.ersDeployMode = null;
                filtered.ersHarvestedMGUK = null;
                filtered.ersHarvestedMGUH = null;
                filtered.ersDeployedThisLap = null;
                output.carStatusData.add(filtered);
            }
        }
        return output;
    }

    private static PacketModels.PacketCarDamageData filterCarDamage(
            PacketModels.PacketCarDamageData input,
            ParseMode mode,
            Integer playerCarIndex
    ) {
        if (input == null) {
            return null;
        }
        PacketModels.PacketCarDamageData output = new PacketModels.PacketCarDamageData();
        for (int i = 0; i < input.carDamageData.size(); i++) {
            output.carDamageData.add(canExposePublicOrSelfForMode(mode, i, playerCarIndex)
                    ? input.carDamageData.get(i)
                    : new PacketModels.CarDamageData());
        }
        return output;
    }

    private static PacketModels.CarStatusData copyStatus(PacketModels.CarStatusData input) {
        PacketModels.CarStatusData output = new PacketModels.CarStatusData();
        output.tractionControl = input.tractionControl;
        output.antiLockBrakes = input.antiLockBrakes;
        output.fuelMix = input.fuelMix;
        output.brakeBias = input.brakeBias;
        output.pitLimiterStatus = input.pitLimiterStatus;
        output.fuelInTank = input.fuelInTank;
        output.fuelCapacity = input.fuelCapacity;
        output.fuelRemainingLaps = input.fuelRemainingLaps;
        output.maxRpm = input.maxRpm;
        output.idleRpm = input.idleRpm;
        output.maxGears = input.maxGears;
        output.drsAllowed = input.drsAllowed;
        output.actualTyreCompound = input.actualTyreCompound;
        output.visualTyreCompound = input.visualTyreCompound;
        output.tireAge = input.tireAge;
        output.vehicleFiaFlags = input.vehicleFiaFlags;
        output.ersStoreEnergy = input.ersStoreEnergy;
        output.ersDeployMode = input.ersDeployMode;
        output.ersHarvestedMGUK = input.ersHarvestedMGUK;
        output.ersHarvestedMGUH = input.ersHarvestedMGUH;
        output.ersDeployedThisLap = input.ersDeployedThisLap;
        return output;
    }

    private static boolean canExposePublicOrSelfForMode(ParseMode mode, int carIndex, Integer playerCarIndex) {
        return mode == ParseMode.PUBLIC || (playerCarIndex != null && playerCarIndex == carIndex);
    }

    private static boolean canExposeSelfOrAi(
            int carIndex,
            Integer playerCarIndex,
            PacketModels.PacketParticipantsData participants
    ) {
        if (playerCarIndex != null && playerCarIndex == carIndex) {
            return true;
        }
        PacketModels.ParticipantData participant = getAt(participants == null ? null : participants.participants, carIndex);
        return participant != null && Boolean.TRUE.equals(participant.aiControlled);
    }

    private static DtoModels.CarDamage compactDamage(PacketModels.CarDamageData input) {
        DtoModels.CarDamage output = new DtoModels.CarDamage();
        output.frontLeftWing = input.frontLeftWingDamage;
        output.frontRightWing = input.frontRightWingDamage;
        output.rearWing = input.rearWingDamage;
        output.floor = input.floorDamage;
        output.diffuser = input.diffuserDamage;
        output.sidepod = input.sidepodDamage;
        output.gearbox = input.gearboxDamage;
        output.engine = input.engineDamage;
        return output;
    }

    private static List<DtoModels.TyreSetBrief> buildTyreSetBriefs(
            PacketModels.PacketTyreSetsData tyreSets,
            CarEnvelope source
    ) {
        if (source != null && source.normalized != null && source.normalized.availableSets != null && !source.normalized.availableSets.isEmpty()) {
            return source.normalized.availableSets;
        }
        List<DtoModels.TyreSetBrief> output = new ArrayList<>();
        if (tyreSets == null || tyreSets.availableSets == null) {
            return output;
        }
        for (int i = 0; i < tyreSets.availableSets.size(); i++) {
            PacketModels.TyreSetData set = tyreSets.availableSets.get(i);
            DtoModels.TyreSetBrief brief = new DtoModels.TyreSetBrief();
            brief.index = i;
            brief.wear = set.wear;
            brief.available = set.available;
            output.add(brief);
        }
        return output;
    }

    private static <T> T getAt(List<T> items, int index) {
        if (items == null || index < 0 || index >= items.size()) {
            return null;
        }
        return items.get(index);
    }

    private static int sizeOf(List<?> items) {
        return items == null ? 0 : items.size();
    }
}
