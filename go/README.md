# Go

이 패키지는 이미 수집된 `FullTelemetryEnvelope`를 기준으로 모드별 가시성 파싱을 적용하는 Go 라이브러리입니다.

## 모듈 경로

```go
module frc.pitwall.parser/telemetry-go
```

주요 패키지:

- `frc.pitwall.parser/telemetry-go/packets`
- `frc.pitwall.parser/telemetry-go/dto`
- `frc.pitwall.parser/telemetry-go/telemetrymodel`

## 포함 API

- 모델: `telemetrymodel.FullTelemetryEnvelope`
- 헬퍼: `telemetrymodel.CanExposePublicOrSelf`
- 파서: `telemetrymodel.ParseEnvelope`
- 모드: `telemetrymodel.ParseModePublic`, `telemetrymodel.ParseModeStrict`, `telemetrymodel.ParseModeFRC`

## 적용 흐름

1. UDP 디코더 또는 상위 파서에서 `packets.*` 데이터를 채웁니다.
2. 이를 `telemetrymodel.FullTelemetryEnvelope`에 담습니다.
3. `ParseEnvelope`를 호출해서 `Cars`와 visibility-filtered raw packet 뷰를 만듭니다.

## 예제

```go
package main

import (
	"fmt"
	"time"

	"frc.pitwall.parser/telemetry-go/packets"
	"frc.pitwall.parser/telemetry-go/telemetrymodel"
)

func main() {
	env := telemetrymodel.FullTelemetryEnvelope{
		CapturedAt: time.Now().UTC(),
		Header: &packets.PacketHeader{
			PlayerCarIndex: 0,
		},
		Participants: &packets.PacketParticipantsData{
			Participants: []packets.ParticipantData{
				{Name: "You", TeamID: 1, YourTelemetry: 1},
				{Name: "Other", TeamID: 2, YourTelemetry: 0},
			},
		},
	}

	parsed := telemetrymodel.ParseEnvelope(env, telemetrymodel.ParseOptions{
		Mode: telemetrymodel.ParseModeStrict,
	})

	fmt.Println(parsed.Cars[0].Normalized.Name)
}
```

## 모드

- `public`: `PUBLIC_OR_SELF` 필드를 모든 차량에 공개합니다.
- `strict`: `PUBLIC_OR_SELF` 필드는 플레이어 차량만 공개합니다.
- `frc`: 현재는 `strict`와 동일하게 동작합니다. 나중에 `FRCConfig`에 규칙을 추가할 수 있습니다.

## 참고

- `SELF_OR_AI` 규칙은 `participants.Participants[i].AiControlled` 값을 사용합니다.
- 현재 구현은 raw UDP byte decoder가 아닙니다. 먼저 envelope를 구성한 뒤 이 라이브러리로 visibility parsing을 적용해야 합니다.
