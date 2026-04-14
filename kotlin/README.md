# Kotlin

Kotlin telemetry model library for the shared `FullTelemetryEnvelope`.

## API

- models: `FullTelemetryEnvelope`, `CarEnvelope`, `NormalizedCar`
- modes: `ParseMode.PUBLIC`, `ParseMode.STRICT`, `ParseMode.FRC`, `ParseMode.DRIVERS`
- full parse: `parseEnvelope(...)`
- visibility getters: `getVisibleEnvelope(...)`, `getVisibleCarEnvelope(...)`, `getVisibleNormalizedCar(...)`, `getVisibleCarStatus(...)`, `getVisibleCarDamage(...)`, `getVisibleCarSetup(...)`

## Example

```kotlin
val parsed = parseEnvelope(env)

val strictView = getVisibleEnvelope(
    parsed,
    ParseOptions(mode = ParseMode.STRICT),
)

val replayView = getVisibleEnvelope(
    parsed,
    ParseOptions(mode = ParseMode.PUBLIC),
)

val otherCar = getVisibleNormalizedCar(
    parsed,
    carIndex = 1,
    options = ParseOptions(mode = ParseMode.DRIVERS),
)
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

- `parseEnvelope(...)` keeps the full parsed data.
- Use the visibility getters to build the mode-specific view you want.
