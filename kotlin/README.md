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

- `PUBLIC`: `PUBLIC_OR_SELF` 필드를 전체 차량에 노출합니다.
- `STRICT`: 플레이어 차량 외 민감 필드를 숨깁니다.
- `FRC`: `PUBLIC`에서 보이는 데이터는 전부 포함하고, 추가로 ERS 퍼센트, `DRS` 활성화 여부, `aiControlled`, `diffOnThrottle`, `tireCompound` 같은 FRC용 필드를 노출합니다.

## 참고

- `SELF_OR_AI`는 `ParticipantData.aiControlled == true`일 때 setup을 유지합니다.
- 현재 구현은 raw UDP 바이트를 직접 읽는 decoder가 아니라 envelope 후처리 파서입니다.
