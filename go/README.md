# Go

Go telemetry model library for the shared `FullTelemetryEnvelope`.

## Module

```go
module frc.pitwall.parser/telemetry-go
```

## API

- models: `telemetrymodel.FullTelemetryEnvelope`, `telemetrymodel.CarEnvelope`, `telemetrymodel.NormalizedCar`
- modes: `telemetrymodel.ParseModePublic`, `telemetrymodel.ParseModeStrict`, `telemetrymodel.ParseModeFRC`, `telemetrymodel.ParseModeDrivers`
- full parse: `telemetrymodel.ParseEnvelope`
- visibility getters: `telemetrymodel.GetVisibleEnvelope`, `telemetrymodel.GetVisibleCarEnvelope`, `telemetrymodel.GetVisibleNormalizedCar`, `telemetrymodel.GetVisibleCarStatus`, `telemetrymodel.GetVisibleCarDamage`, `telemetrymodel.GetVisibleCarSetup`

## Example

```go
parsed := telemetrymodel.ParseEnvelope(env, telemetrymodel.ParseOptions{})
strictView := telemetrymodel.GetVisibleEnvelope(parsed, telemetrymodel.ParseOptions{
    Mode: telemetrymodel.ParseModeStrict,
})
replayView := telemetrymodel.GetVisibleEnvelope(parsed, telemetrymodel.ParseOptions{
    Mode: telemetrymodel.ParseModePublic,
})
otherCar := telemetrymodel.GetVisibleNormalizedCar(parsed, 1, telemetrymodel.ParseOptions{
    Mode: telemetrymodel.ParseModeDrivers,
})
```

## Visibility Modes

| Data area | `public` | `strict` | `frc` | `drivers` |
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

- `ParseEnvelope` keeps the full parsed data.
- Use the visibility getters when building downstream APIs, replay screens, or pitwall tools.
