function withInit(target, init = {}) {
  Object.assign(target, init);
}

export class PitwallState {
  constructor(init = {}) {
    this.focusedCarIndex = null;
    this.notes = [];
    this.warnings = [];
    withInit(this, init);
  }
}

export class CarDamage {
  constructor(init = {}) {
    this.frontLeftWing = null;
    this.frontRightWing = null;
    this.rearWing = null;
    this.floor = null;
    this.diffuser = null;
    this.sidepod = null;
    this.gearbox = null;
    this.engine = null;
    withInit(this, init);
  }
}

export class TyreSetBrief {
  constructor(init = {}) {
    this.index = null;
    this.compound = null;
    this.ageLaps = null;
    this.wear = null;
    this.available = null;
    withInit(this, init);
  }
}

export class StintInfoDTO {
  constructor(init = {}) {
    this.startLap = null;
    this.endLap = null;
    this.compound = null;
    this.totalLaps = null;
    withInit(this, init);
  }
}

export class DynamicsLapDTO {
  constructor(init = {}) {
    this.lapNumber = null;
    this.fuelInTank = null;
    this.ersPct = null;
    this.tireWearAvg = null;
    withInit(this, init);
  }
}
