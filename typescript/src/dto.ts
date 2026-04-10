export interface PitwallState {
  focusedCarIndex?: number;
  notes?: string[];
  warnings?: string[];
}

export interface CarDamage {
  frontLeftWing?: number;
  frontRightWing?: number;
  rearWing?: number;
  floor?: number;
  diffuser?: number;
  sidepod?: number;
  gearbox?: number;
  engine?: number;
}

export interface TyreSetBrief {
  index?: number;
  compound?: string;
  ageLaps?: number;
  wear?: number;
  available?: boolean;
}

export interface StintInfoDTO {
  startLap?: number;
  endLap?: number;
  compound?: string;
  totalLaps?: number;
}

export interface DynamicsLapDTO {
  lapNumber?: number;
  fuelInTank?: number;
  ersPct?: number;
  tireWearAvg?: number;
}
