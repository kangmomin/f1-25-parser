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

| 데이터 영역 | `public` | `strict` | `frc` |
| --- | --- | --- | --- |
| 참가자, 랩 데이터, 기본 telemetry | 전체 차량 | 전체 차량 | 전체 차량 |
| 피트 상태 (`PitStatus`, `PitStopTimer`, `PitLaneTime`) | 전체 차량 | 전체 차량 | 전체 차량 |
| setup (`SELF_OR_AI`) | 본인 + AI 차량 | 본인 + AI 차량 | 본인 + AI 차량 |
| 타이어 컴파운드 / 수명 | 전체 차량 | 전체 차량 | 전체 차량 |
| 연료, 브레이크 바이어스, ERS deploy/harvest | 전체 차량 | 본인 차량만 | 본인 차량만 |
| `ERSStoreEnergy` | 전체 차량 | 본인 차량만 | 전체 차량 |
| `DRSActivated` | 전체 차량 | 본인 차량만 | 전체 차량 |
| 차량 데미지 (`CarDamage`, `Normalized.Damage`) | 전체 차량 | 본인 차량만 | 전체 차량 |
| `TireWear` | 전체 차량 | 본인 차량만 | 본인 차량만 |
| `ERSActualPct` / `ERSEstimatePct` | 전체 차량 | 본인 차량만 | 본인 차량만 |

## 참고

- `SELF_OR_AI` 규칙은 `participants.Participants[i].AiControlled` 값을 사용합니다.
- `frc`는 `strict` 기반에 `ERSStoreEnergy`, `DRSActivated`, 차량 데미지만 추가 공개합니다. 단 `TireWear`는 추가 공개하지 않습니다.
- 현재 구현은 raw UDP byte decoder가 아닙니다. 먼저 envelope를 구성한 뒤 이 라이브러리로 visibility parsing을 적용해야 합니다.
