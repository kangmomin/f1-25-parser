# JavaScript

JavaScript telemetry model library for the shared `FullTelemetryEnvelope`.

## Import

```js
import {
  parseEnvelope,
  getVisibleEnvelope,
  getVisibleNormalizedCar,
} from "./src/index.js";
```

## API

- models: `FullTelemetryEnvelope`, `CarEnvelope`, `NormalizedCar`
- modes: `ParseMode.PUBLIC`, `ParseMode.STRICT`, `ParseMode.FRC`, `ParseMode.DRIVERS`
- full parse: `parseEnvelope(input)`
- visibility getters: `getVisibleEnvelope`, `getVisibleCarEnvelope`, `getVisibleNormalizedCar`, `getVisibleCarStatus`, `getVisibleCarDamage`, `getVisibleCarSetup`

## Example

```js
import {
  parseEnvelope,
  getVisibleEnvelope,
  getVisibleNormalizedCar,
  ParseMode,
} from "./src/index.js";

const parsed = parseEnvelope(env);
const strictView = getVisibleEnvelope(parsed, { mode: ParseMode.STRICT });
const replayView = getVisibleEnvelope(parsed, { mode: ParseMode.PUBLIC });
const otherCar = getVisibleNormalizedCar(parsed, 1, { mode: ParseMode.DRIVERS });
```

## Visibility Modes

| Data area | `PUBLIC` | `STRICT` | `FRC` | `DRIVERS` |
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
- Use the visibility getters when exposing data to consumers with different permissions.
