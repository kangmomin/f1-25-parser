# Java

이 라이브러리는 `FullTelemetryEnvelope`에 대해 `PUBLIC`, `STRICT`, `FRC`, `DRIVERS` 파싱 모드를 적용하는 Java 모델 패키지입니다.

## 패키지

- `frc.engineer.packets`
- `frc.engineer.dto`
- `frc.engineer.telemetrymodel`

## 주요 클래스

- `frc.engineer.telemetrymodel.FullTelemetryEnvelope`
- `frc.engineer.telemetrymodel.NormalizedCar`
- `frc.engineer.telemetrymodel.TelemetryParser`
- `frc.engineer.telemetrymodel.ParseMode`
- `frc.engineer.telemetrymodel.ParseOptions`

## 적용 흐름

1. 상위 레이어에서 `PacketModels.*` 객체를 채웁니다.
2. `FullTelemetryEnvelope`에 raw packet 참조를 넣습니다.
3. `TelemetryParser.parse(...)`를 호출합니다.

## 예제

```java
import frc.engineer.packets.PacketModels;
import frc.engineer.telemetrymodel.FullTelemetryEnvelope;
import frc.engineer.telemetrymodel.ParseMode;
import frc.engineer.telemetrymodel.ParseOptions;
import frc.engineer.telemetrymodel.TelemetryParser;

public class Example {
    public static void main(String[] args) {
        FullTelemetryEnvelope env = new FullTelemetryEnvelope();
        env.header = new PacketModels.PacketHeader();
        env.header.playerCarIndex = 0;

        env.participants = new PacketModels.PacketParticipantsData();
        PacketModels.ParticipantData you = new PacketModels.ParticipantData();
        you.name = "You";
        you.teamId = 1;
        you.yourTelemetry = 1;
        env.participants.participants.add(you);

        PacketModels.ParticipantData other = new PacketModels.ParticipantData();
        other.name = "Other";
        other.teamId = 2;
        other.yourTelemetry = 0;
        env.participants.participants.add(other);

        ParseOptions options = new ParseOptions();
        options.mode = ParseMode.STRICT;

        FullTelemetryEnvelope parsed = TelemetryParser.parse(env, options);
        System.out.println(parsed.cars.get(0).normalized.name);
    }
}
```

## 모드

| 데이터 영역 | `ParseMode.PUBLIC` | `ParseMode.STRICT` | `ParseMode.FRC` | `ParseMode.DRIVERS` |
| --- | --- | --- | --- | --- |
| 참가자, 랩 데이터, 기본 telemetry | 전체 차량 | 전체 차량 | 전체 차량 | 전체 차량 |
| 피트 상태 (`pitStatus`, `pitStopTimer`, `pitLaneTime`) | 전체 차량 | 전체 차량 | 전체 차량 | 전체 차량 |
| setup (`SELF_OR_AI`) | 본인 + AI 차량 | 본인 + AI 차량 | 본인 + AI 차량 | 본인 + AI 차량 |
| 타이어 컴파운드 / 수명 | 전체 차량 | 전체 차량 | 전체 차량 | 전체 차량 |
| 연료, 브레이크 바이어스, ERS deploy/harvest | 전체 차량 | 본인 차량만 | 본인 차량만 | 본인 차량만 |
| `ersStoreEnergy` | 전체 차량 | 본인 차량만 | 전체 차량 | 본인 차량만 |
| `drsActivated` | 전체 차량 | 본인 차량만 | 전체 차량 | 전체 차량 |
| 차량 데미지 (`carDamage`, `normalized.damage`) | 전체 차량 | 본인 차량만 | 전체 차량 | 전체 차량 |
| `tireWear` | 전체 차량 | 본인 차량만 | 본인 차량만 | 본인 차량만 |
| `ersActualPct` / `ersEstimatePct` | 전체 차량 | 본인 차량만 | 본인 차량만 | 본인 차량만 |

## 참고

- setup 공개 규칙은 `ParticipantData.aiControlled`를 사용합니다.
- `ParseMode.FRC`는 `ParseMode.STRICT` 기반에 `ersStoreEnergy`, `drsActivated`, 차량 데미지만 추가 공개합니다. 단 `tireWear`는 추가 공개하지 않습니다.
- `ParseMode.DRIVERS`는 `ParseMode.STRICT` 기반에 `drsActivated`, 차량 데미지만 추가 공개합니다. 단 `ersStoreEnergy`, `tireWear`, ERS 퍼센트는 추가 공개하지 않습니다.
- 현재 구현은 byte array를 직접 디코딩하지 않습니다. 이미 매핑된 envelope를 파싱하는 계층입니다.
