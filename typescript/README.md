# TypeScript

TypeScript telemetry model library for the shared `FullTelemetryEnvelope`.

## Build

```bash
npm install
npm run build
```

## Import

```ts
import {
  parseEnvelope,
  getVisibleEnvelope,
  getVisibleNormalizedCar,
  type FullTelemetryEnvelope,
} from "./dist/index.js";
```

## API

- models: `FullTelemetryEnvelope`, `CarEnvelope`, `NormalizedCar`
- modes: `"public" | "strict" | "frc" | "drivers"`
- full parse: `parseEnvelope(input)`
- visibility getters: `getVisibleEnvelope`, `getVisibleCarEnvelope`, `getVisibleNormalizedCar`, `getVisibleCarStatus`, `getVisibleCarDamage`, `getVisibleCarSetup`

## Example

```ts
import {
  parseEnvelope,
  getVisibleEnvelope,
  getVisibleNormalizedCar,
  type FullTelemetryEnvelope,
} from "./src/index.js";

const env: FullTelemetryEnvelope = {
  capturedAt: new Date(),
  header: { playerCarIndex: 0 },
  participants: {
    participants: [
      { name: "You", teamId: 1, yourTelemetry: 1 },
      { name: "Other", teamId: 2, yourTelemetry: 0 },
    ],
  },
};

const parsed = parseEnvelope(env);
const strictView = getVisibleEnvelope(parsed, { mode: "strict" });
const replayView = getVisibleEnvelope(parsed, { mode: "public" });
const otherCar = getVisibleNormalizedCar(parsed, 1, { mode: "drivers" });

console.log(strictView.cars?.[0]?.normalized.name);
console.log(replayView.cars?.[1]?.normalized.ersStoreEnergy);
console.log(otherCar?.drsActivated);
```

## Visibility Modes

| Data area | `"public"` | `"strict"` | `"frc"` | `"drivers"` |
| --- | --- | --- | --- | --- |
| Base telemetry | all cars | all cars | all cars | all cars |
| Pit state | all cars | all cars | all cars | all cars |
| Setup (`SELF_OR_AI`) | self + AI cars | self + AI cars | self + AI cars | self + AI cars |
| Tyre compound / age | all cars | all cars | all cars | all cars |
| Fuel, brake bias, ERS deploy/harvest | all cars | self only | self only | self only |
| `ersStoreEnergy` | all cars | self only | all cars | self only |
| `drsActivated` | all cars | self only | all cars | all cars |
| Car damage | all cars | self only | all cars | all cars |
| `tireWear` | all cars | self only | self only | self only |
| `ersActualPct` / `ersEstimatePct` | all cars | self only | self only | self only |

## Notes

- `parseEnvelope` keeps the full parsed data.
- Apply mode restrictions only through the visibility getters.
- `frc` and `drivers` expose opponent damage without exposing opponent `tireWear`.
