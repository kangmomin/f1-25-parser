# Kotlin

이 패키지는 Kotlin/JVM에서 `FullTelemetryEnvelope`에 visibility parsing을 적용하는 모델 라이브러리입니다.

## 패키지

- `frc.engineer.packets`
- `frc.engineer.dto`
- `frc.engineer.telemetrymodel`

## 주요 API

- 모델: `FullTelemetryEnvelope`, `CarEnvelope`, `NormalizedCar`
- 모드: `ParseMode.PUBLIC`, `ParseMode.STRICT`, `ParseMode.FRC`
- 옵션: `ParseOptions`
- 파서: `parseEnvelope(...)`

## 적용 흐름

1. 상위 decoder에서 `packets` 데이터를 채웁니다.
2. `FullTelemetryEnvelope`를 만듭니다.
3. `parseEnvelope`를 호출합니다.

## 예제

```kotlin
import frc.engineer.packets.PacketHeader
import frc.engineer.packets.PacketParticipantsData
import frc.engineer.packets.ParticipantData
import frc.engineer.telemetrymodel.FullTelemetryEnvelope
import frc.engineer.telemetrymodel.ParseMode
import frc.engineer.telemetrymodel.ParseOptions
import frc.engineer.telemetrymodel.parseEnvelope

fun main() {
    val env = FullTelemetryEnvelope(
        header = PacketHeader(playerCarIndex = 0),
        participants = PacketParticipantsData(
            participants = listOf(
                ParticipantData(name = "You", teamId = 1, yourTelemetry = 1),
                ParticipantData(name = "Other", teamId = 2, yourTelemetry = 0),
            ),
        ),
    )

    val parsed = parseEnvelope(
        input = env,
        options = ParseOptions(mode = ParseMode.STRICT),
    )

    println(parsed.cars.first().normalized.name)
}
```

## 모드

| 데이터 영역 | `PUBLIC` | `STRICT` | `FRC` |
| --- | --- | --- | --- |
| 참가자, 랩 데이터, 기본 telemetry | 전체 차량 | 전체 차량 | 전체 차량 |
| 피트 상태 (`pitStatus`, `pitStopTimer`, `pitLaneTime`) | 전체 차량 | 전체 차량 | 전체 차량 |
| setup (`SELF_OR_AI`) | 본인 + AI 차량 | 본인 + AI 차량 | 본인 + AI 차량 |
| 타이어 컴파운드 / 수명 | 전체 차량 | 전체 차량 | 전체 차량 |
| 연료, 브레이크 바이어스, ERS deploy/harvest | 전체 차량 | 본인 차량만 | 본인 차량만 |
| `ersStoreEnergy` | 전체 차량 | 본인 차량만 | 전체 차량 |
| `drsActivated` | 전체 차량 | 본인 차량만 | 전체 차량 |
| 차량 데미지 (`carDamage`, `normalized.damage`) | 전체 차량 | 본인 차량만 | 전체 차량 |
| `tireWear` | 전체 차량 | 본인 차량만 | 본인 차량만 |
| `ersActualPct` / `ersEstimatePct` | 전체 차량 | 본인 차량만 | 본인 차량만 |

## 참고

- `SELF_OR_AI`는 `ParticipantData.aiControlled == true`일 때 setup을 유지합니다.
- `FRC`는 `STRICT` 기반에 `ersStoreEnergy`, `drsActivated`, 차량 데미지만 추가 공개합니다. 단 `tireWear`는 추가 공개하지 않습니다.
- 현재 구현은 raw UDP 바이트를 직접 읽는 decoder가 아니라 envelope 후처리 파서입니다.
