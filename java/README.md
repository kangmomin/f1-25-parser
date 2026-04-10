# Java

이 라이브러리는 `FullTelemetryEnvelope`에 대해 `PUBLIC`, `STRICT`, `FRC` 파싱 모드를 적용하는 Java 모델 패키지입니다.

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

- `ParseMode.PUBLIC`: public 가시성 기준으로 파싱합니다.
- `ParseMode.STRICT`: 플레이어 차량 중심으로 민감 필드를 숨깁니다.
- `ParseMode.FRC`: 현재는 `STRICT`와 동일하게 동작합니다.

## 참고

- setup 공개 규칙은 `ParticipantData.aiControlled`를 사용합니다.
- 현재 구현은 byte array를 직접 디코딩하지 않습니다. 이미 매핑된 envelope를 파싱하는 계층입니다.
