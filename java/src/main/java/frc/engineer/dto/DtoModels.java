package frc.engineer.dto;

import java.util.ArrayList;
import java.util.List;

public final class DtoModels {
    private DtoModels() {
    }

    public static final class PitwallState {
        public Integer focusedCarIndex;
        public List<String> notes = new ArrayList<>();
        public List<String> warnings = new ArrayList<>();
    }

    public static final class CarDamage {
        public Integer frontLeftWing;
        public Integer frontRightWing;
        public Integer rearWing;
        public Integer floor;
        public Integer diffuser;
        public Integer sidepod;
        public Integer gearbox;
        public Integer engine;
    }

    public static final class TyreSetBrief {
        public Integer index;
        public String compound;
        public Integer ageLaps;
        public Integer wear;
        public Boolean available;
    }

    public static final class StintInfoDTO {
        public Integer startLap;
        public Integer endLap;
        public String compound;
        public Integer totalLaps;
    }

    public static final class DynamicsLapDTO {
        public Integer lapNumber;
        public Float fuelInTank;
        public Integer ersPct;
        public Float tireWearAvg;
    }
}
