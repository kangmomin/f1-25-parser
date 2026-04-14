# Java

Java telemetry model library for the shared `FullTelemetryEnvelope`.

## API

- models: `FullTelemetryEnvelope`, `CarEnvelope`, `NormalizedCar`
- modes: `ParseMode.PUBLIC`, `ParseMode.STRICT`, `ParseMode.FRC`, `ParseMode.DRIVERS`
- full parse: `TelemetryParser.parse(...)`
- visibility getters: `TelemetryParser.getVisibleEnvelope(...)`, `TelemetryParser.getVisibleCarEnvelope(...)`, `TelemetryParser.getVisibleNormalizedCar(...)`, `TelemetryParser.getVisibleCarStatus(...)`, `TelemetryParser.getVisibleCarDamage(...)`, `TelemetryParser.getVisibleCarSetup(...)`

## Example

```java
FullTelemetryEnvelope parsed = TelemetryParser.parse(env, new ParseOptions());

ParseOptions strict = new ParseOptions();
strict.mode = ParseMode.STRICT;
FullTelemetryEnvelope strictView = TelemetryParser.getVisibleEnvelope(parsed, strict);

ParseOptions replay = new ParseOptions();
replay.mode = ParseMode.PUBLIC;
FullTelemetryEnvelope replayView = TelemetryParser.getVisibleEnvelope(parsed, replay);

ParseOptions drivers = new ParseOptions();
drivers.mode = ParseMode.DRIVERS;
NormalizedCar otherCar = TelemetryParser.getVisibleNormalizedCar(parsed, 1, drivers);
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

- `TelemetryParser.parse(...)` keeps the full parsed data.
- Apply permissions through the getter methods when exposing data to callers.
