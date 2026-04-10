package frc.engineer.telemetrymodel;

import frc.engineer.dto.DtoModels;
import frc.engineer.packets.PacketModels;
import java.util.ArrayList;
import java.util.List;

public class NormalizedCar {
    public int index;
    public String name;
    public Integer teamId;
    public Integer yourTelemetry;

    public Integer position;
    public Integer currentLapNum;
    public Float lapDistance;

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

    public String tireCompound;
    public Integer actualTyreCompound;
    public Integer tireAge;
    public Float fuelInTank;
    public Float fuelCapacity;
    public Float fuelRemainingLaps;
    public Integer fuelMix;
    public Integer brakeBias;
    public Float ersStoreEnergy;
    public Integer ersDeployMode;
    public Float ersDeployedThisLap;
    public Float ersHarvestedMGUK;
    public Float ersHarvestedMGUH;

    public int[] tireWear = new int[] {0, 0, 0, 0};
    public DtoModels.CarDamage damage;

    public PacketModels.CarSetupData setup;

    public Integer bestSector1Ms;
    public Integer bestSector2Ms;
    public Integer bestSector3Ms;
    public List<DtoModels.TyreSetBrief> availableSets = new ArrayList<>();
    public List<DtoModels.StintInfoDTO> stintHistory = new ArrayList<>();
    public List<DtoModels.DynamicsLapDTO> dynamics = new ArrayList<>();

    public Integer ersActualPct;
    public Boolean ersActualReady;
    public Integer ersEstimatePct;
    public Boolean ersEstimateReady;
}
