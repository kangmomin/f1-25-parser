package frc.engineer.packets;

import java.util.ArrayList;
import java.util.List;

public final class PacketModels {
    private PacketModels() {
    }

    public static final class PacketHeader {
        public Integer packetFormat;
        public Integer gameYear;
        public Integer gameMajorVersion;
        public Integer gameMinorVersion;
        public Integer packetVersion;
        public Integer packetId;
        public Long sessionUid;
        public Float sessionTime;
        public Long frameIdentifier;
        public Long overallFrameIdentifier;
        public Integer playerCarIndex;
        public Integer secondaryPlayerCarIndex;
    }

    public static final class PacketSessionData {
        public Integer weather;
        public Integer trackTemperature;
        public Integer airTemperature;
        public Integer totalLaps;
        public Integer trackLength;
        public Integer sessionType;
        public Integer trackId;
        public Integer pitSpeedLimit;
    }

    public static final class PacketEventData {
        public String eventStringCode;
        public String details;
    }

    public static final class ParticipantData {
        public Boolean aiControlled;
        public Integer driverId;
        public Integer networkId;
        public Integer teamId;
        public String name;
        public Integer yourTelemetry;
    }

    public static final class PacketParticipantsData {
        public List<ParticipantData> participants = new ArrayList<>();
    }

    public static final class CarMotionData {
        public Float worldPositionX;
        public Float worldPositionY;
        public Float worldPositionZ;
        public Float worldVelocityX;
        public Float worldVelocityY;
        public Float worldVelocityZ;
        public Float gForceLateral;
        public Float gForceLongitudinal;
        public Float gForceVertical;
        public Float yaw;
        public Float pitch;
        public Float roll;
    }

    public static final class PacketMotionData {
        public List<CarMotionData> carMotionData = new ArrayList<>();
    }

    public static final class LapData {
        public Integer position;
        public Integer currentLapNum;
        public Float lapDistance;
        public Float lastLapTime;
        public Float bestLapTime;
        public Integer sector1TimeMs;
        public Integer sector2TimeMs;
        public Integer currentSector;
        public Integer deltaToCarInFront;
        public Integer deltaToRaceLeader;
        public Integer pitStatus;
        public Integer driverStatus;
        public Integer resultStatus;
        public Integer numPitStops;
        public Float pitStopTimer;
        public Integer pitLaneTime;
        public Integer penalties;
        public Integer totalWarnings;
        public Integer cornerCuttingWarnings;
        public Integer numUnservedDriveThroughs;
        public Integer numUnservedStopGoPenalties;
        public Boolean lapInvalid;
    }

    public static final class PacketLapData {
        public List<LapData> lapData = new ArrayList<>();
    }

    public static final class CarSetupData {
        public Integer frontWing;
        public Integer rearWing;
        public Integer onThrottle;
        public Integer offThrottle;
        public Float frontCamber;
        public Float rearCamber;
        public Float frontToe;
        public Float rearToe;
        public Integer frontSuspension;
        public Integer rearSuspension;
        public Integer frontAntiRollBar;
        public Integer rearAntiRollBar;
        public Integer frontSuspensionHeight;
        public Integer rearSuspensionHeight;
        public Integer brakePressure;
        public Integer brakeBias;
        public Float rearLeftTyrePressure;
        public Float rearRightTyrePressure;
        public Float frontLeftTyrePressure;
        public Float frontRightTyrePressure;
        public Integer ballast;
        public Float fuelLoad;
    }

    public static final class PacketCarSetupData {
        public List<CarSetupData> carSetups = new ArrayList<>();
    }

    public static final class CarTelemetryData {
        public Integer speed;
        public Float throttle;
        public Float brake;
        public Float steering;
        public Integer gear;
        public int[] brakeTemp = new int[] {0, 0, 0, 0};
        public int[] tireSurfaceTemp = new int[] {0, 0, 0, 0};
        public int[] tireInnerTemp = new int[] {0, 0, 0, 0};
        public float[] tirePressure = new float[] {0f, 0f, 0f, 0f};
        public int[] surfaceType = new int[] {0, 0, 0, 0};
        public Integer engineRpm;
        public Integer drs;
    }

    public static final class PacketCarTelemetryData {
        public List<CarTelemetryData> carTelemetryData = new ArrayList<>();
    }

    public static final class CarStatusData {
        public Integer tractionControl;
        public Integer antiLockBrakes;
        public Integer fuelMix;
        public Integer brakeBias;
        public Integer pitLimiterStatus;
        public Float fuelInTank;
        public Float fuelCapacity;
        public Float fuelRemainingLaps;
        public Integer maxRpm;
        public Integer idleRpm;
        public Integer maxGears;
        public Integer drsAllowed;
        public Integer actualTyreCompound;
        public Integer visualTyreCompound;
        public Integer tireAge;
        public Integer vehicleFiaFlags;
        public Float ersStoreEnergy;
        public Integer ersDeployMode;
        public Float ersHarvestedMGUK;
        public Float ersHarvestedMGUH;
        public Float ersDeployedThisLap;
    }

    public static final class PacketCarStatusData {
        public List<CarStatusData> carStatusData = new ArrayList<>();
    }

    public static final class CarDamageData {
        public int[] tireWear = new int[] {0, 0, 0, 0};
        public int[] tiresDamage = new int[] {0, 0, 0, 0};
        public int[] brakesDamage = new int[] {0, 0, 0, 0};
        public Integer frontLeftWingDamage;
        public Integer frontRightWingDamage;
        public Integer rearWingDamage;
        public Integer floorDamage;
        public Integer diffuserDamage;
        public Integer sidepodDamage;
        public Integer gearboxDamage;
        public Integer engineDamage;
    }

    public static final class PacketCarDamageData {
        public List<CarDamageData> carDamageData = new ArrayList<>();
    }

    public static final class LapHistoryData {
        public Long lapTimeInMs;
        public Integer sector1TimeInMs;
        public Integer sector2TimeInMs;
        public Integer sector3TimeInMs;
        public Integer lapValidBitFlags;
    }

    public static final class PacketSessionHistoryData {
        public Integer carIndex;
        public Integer numLaps;
        public Integer bestLapTimeLapNum;
        public Integer bestSector1LapNum;
        public Integer bestSector2LapNum;
        public Integer bestSector3LapNum;
        public Integer bestSector1Ms;
        public Integer bestSector2Ms;
        public Integer bestSector3Ms;
        public List<LapHistoryData> lapHistoryData = new ArrayList<>();
    }

    public static final class TyreSetData {
        public Integer actualTyreCompound;
        public Integer visualTyreCompound;
        public Integer wear;
        public Boolean available;
        public Integer recommendedSession;
    }

    public static final class PacketTyreSetsData {
        public Integer carIndex;
        public Integer fittedIdx;
        public List<TyreSetData> availableSets = new ArrayList<>();
    }
}
