# F1 25 Parser

Multi-language telemetry model libraries for a shared `FullTelemetryEnvelope` shape.

- Go: `go/`
- Java: `java/`
- Kotlin: `kotlin/`
- TypeScript: `typescript/`
- JavaScript: `javascript/`

Language-specific guides:

- [Go](./go/README.md)
- [Java](./java/README.md)
- [Kotlin](./kotlin/README.md)
- [TypeScript](./typescript/README.md)
- [JavaScript](./javascript/README.md)
- [Versioning Policy](./VERSIONING.md)

## Model

- `FullTelemetryEnvelope`: raw packet collection plus derived car views
- `CarEnvelope`: one car's raw packets grouped together
- `NormalizedCar`: UI-friendly derived car shape

`parseEnvelope` / `ParseEnvelope` now parses everything and keeps the full dataset.

Visibility rules are applied later through getter/view helpers such as:

- `getVisibleEnvelope`
- `getVisibleCarEnvelope`
- `getVisibleNormalizedCar`
- `getVisibleCarStatus`
- `getVisibleCarDamage`
- `getVisibleCarSetup`

This lets one parsed frame serve multiple consumers. For example:

- replay tools can read a `public` view
- pitwall tools can read a `strict`, `frc`, or `drivers` view

## Visibility Modes

| Data area | `public` | `strict` | `frc` | `drivers` |
| --- | --- | --- | --- | --- |
| Base telemetry (`participants`, `lapData`, `carTelemetry`) | all cars | all cars | all cars | all cars |
| Pit state (`pitStatus`, `pitStopTimer`, `pitLaneTime`) | all cars | all cars | all cars | all cars |
| Setup (`SELF_OR_AI`) | self + AI cars | self + AI cars | self + AI cars | self + AI cars |
| Tyre compound / age (`tireCompound`, `actualTyreCompound`, `tireAge`) | all cars | all cars | all cars | all cars |
| Fuel, brake bias, ERS deploy/harvest | all cars | self only | self only | self only |
| `ersStoreEnergy` | all cars | self only | all cars | self only |
| `drsActivated` | all cars | self only | all cars | all cars |
| Car damage (`carDamage`, `normalized.damage`) | all cars | self only | all cars | all cars |
| `tireWear` | all cars | self only | self only | self only |
| `ersActualPct` / `ersEstimatePct` | all cars | self only | self only | self only |

## Notes

- `frc` is `strict` plus opponent `ersStoreEnergy`, `drsActivated`, and non-tyre-wear damage.
- `drivers` is `strict` plus opponent `drsActivated` and non-tyre-wear damage.
- `parseEnvelope` itself does not hide data anymore.
- Use the visibility getters when exposing data to UI, APIs, replay, or broadcasting flows.
