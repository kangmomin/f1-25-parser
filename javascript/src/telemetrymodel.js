import { withTelemetryDefaults } from "./telemetrymodelDefaults.js";

export class NormalizedCar {
  constructor(init = {}) {
    withTelemetryDefaults.normalizedCar(this, init);
  }
}

export class CarEnvelope {
  constructor(init = {}) {
    withTelemetryDefaults.carEnvelope(this, init);
  }
}

export class FullTelemetryEnvelope {
  constructor(init = {}) {
    withTelemetryDefaults.fullEnvelope(this, init);
  }
}

export function canExposePublicOrSelf(playerIndex, carIndex, participants) {
  if (carIndex === playerIndex) {
    return true;
  }
  const participantList = participants?.participants;
  if (!participantList || carIndex < 0 || carIndex >= participantList.length) {
    return false;
  }
  return participantList[carIndex]?.yourTelemetry === 1;
}
