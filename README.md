# FRC Telemetry Model Multi-Language Libraries

사용자가 제공한 `telemetrymodel` 구조를 기준으로 다음 언어용 라이브러리 골격을 만들었습니다.

- Go: `go/`
- Java: `java/`
- Kotlin: `kotlin/`
- TypeScript: `typescript/`
- JavaScript: `javascript/`

언어별 적용 문서:

- [Go](./go/README.md)
- [Java](./java/README.md)
- [Kotlin](./kotlin/README.md)
- [TypeScript](./typescript/README.md)
- [JavaScript](./javascript/README.md)
- [Versioning Policy](./VERSIONING.md)

## 포함 범위

- `FullTelemetryEnvelope`
- `CarEnvelope`
- `NormalizedCar`
- `CanExposePublicOrSelf` 대응 헬퍼
- `PUBLIC` / `STRICT` / `FRC` 파싱 모드
- 모드별 `parse/ParseEnvelope/parseEnvelope` 파서
- 현재 스니펫이 참조하는 최소 `dto`, `packets` 타입

## 데이터 종류

- 세션/프레임 메타데이터
  - `PacketHeader`, `PacketSessionData`, `PacketEventData`
  - 게임 버전, 세션 식별자, 프레임 번호, 플레이어 차량 인덱스, 날씨, 트랙 길이, 세션 타입, 마지막 이벤트

- 참가자/차량 기본 정보
  - `PacketParticipantsData`, `ParticipantData`
  - 드라이버 이름, 팀 ID, AI 여부, `YourTelemetry` 공개 상태

- 차량 움직임 데이터
  - `PacketMotionData`, `CarMotionData`
  - 월드 좌표, 속도 벡터, G-force, yaw/pitch/roll

- 랩/레이스 진행 데이터
  - `PacketLapData`, `LapData`
  - 포지션, 현재 랩, 랩 거리, 랩타임, 섹터 타임, 앞차/리더와의 델타, 피트 상태, 페널티, 경고, 결과 상태

- 드라이빙 텔레메트리
  - `PacketCarTelemetryData`, `CarTelemetryData`
  - 속도, throttle, brake, steering, gear, 브레이크 온도, 타이어 온도/압력, 노면 타입, DRS raw 상태

- 차량 셋업 데이터
  - `PacketCarSetupData`, `CarSetupData`
  - 윙, 서스펜션, 캠버, 토, 브레이크 압력, 연료 적재량
  - 가시성 규칙상 `SELF_OR_AI`

- 차량 상태 데이터
  - `PacketCarStatusData`, `CarStatusData`
  - 타이어 컴파운드/수명, 연료량, 연료 믹스, 브레이크 바이어스, ERS 저장량/배치/회수량, DRS 허용 상태
  - 일부 필드는 `PUBLIC_OR_SELF`

- 차량 데미지 데이터
  - `PacketCarDamageData`, `CarDamageData`
  - 타이어 마모, 윙 데미지, 플로어/디퓨저/사이드팟/기어박스/엔진 데미지
  - 보수적으로 `PUBLIC_OR_SELF` 기준으로 처리

- 이력/타이어 인벤토리 데이터
  - `PacketSessionHistoryData`, `PacketTyreSetsData`
  - 베스트 섹터, 랩 히스토리, 사용 가능 타이어 세트, 스틴트 구성 기초 데이터

- 앱 파생 데이터
  - `CarEnvelope`, `NormalizedCar`, `PitwallState`
  - UI용 정규화 차량 뷰, 타이어 세트 요약, 스틴트 이력, dynamics, ERS 퍼센트 추정값

- FRC 모드에서 현재 추가로 보는 값
  - `FRC`는 `STRICT`를 기본으로 유지합니다.
  - 추가로 전체 차량의 `ersStoreEnergy`, `drsActivated`, 차량 데미지(`damage`)를 노출합니다.
  - 단 `tireWear`는 `FRC`에서도 본인 차량만 유지합니다.

- 가시성 분류
  - `BOTH`: 항상 수신/노출 가능
  - `PUBLIC_OR_SELF`: public이면 전체 공개, restricted(strict)이면 본인 차량만 공개
  - `SELF_OR_AI`: 본인 차량 또는 AI 차량만 공개
  - `DERIVED`: raw UDP가 아니라 앱이 계산/조합한 값

## 모드별 파싱 요약

| 데이터 영역 | `public` | `strict` | `frc` |
| --- | --- | --- | --- |
| 참가자, 랩 데이터, 기본 telemetry (`participants`, `lapData`, `carTelemetry`) | 전체 차량 | 전체 차량 | 전체 차량 |
| 피트 상태 (`pitStatus`, `pitStopTimer`, `pitLaneTime`) | 전체 차량 | 전체 차량 | 전체 차량 |
| setup (`SELF_OR_AI`) | 본인 + AI 차량 | 본인 + AI 차량 | 본인 + AI 차량 |
| 타이어 컴파운드 / 수명 (`tireCompound`, `actualTyreCompound`, `tireAge`) | 전체 차량 | 전체 차량 | 전체 차량 |
| 연료, 브레이크 바이어스, ERS deploy/harvest | 전체 차량 | 본인 차량만 | 본인 차량만 |
| ERS 잔량 (`ersStoreEnergy`) | 전체 차량 | 본인 차량만 | 전체 차량 |
| DRS 활성화 (`drsActivated`) | 전체 차량 | 본인 차량만 | 전체 차량 |
| 차량 데미지 (`carDamage`, `normalized.damage`) | 전체 차량 | 본인 차량만 | 전체 차량 |
| 타이어 마모 (`tireWear`) | 전체 차량 | 본인 차량만 | 본인 차량만 |
| ERS 퍼센트 (`ersActualPct`, `ersEstimatePct`) | 전체 차량 | 본인 차량만 | 본인 차량만 |

## 현재 가정

- 원본 `frc.engineer/internal/dto`, `frc.engineer/internal/packets` 정의가 없어서, 각 라이브러리는 스니펫을 컴파일 가능하게 만드는 최소 타입 집합을 포함합니다.
- `restricted(strict)` 해석과 `PUBLIC_OR_SELF`, `SELF_OR_AI` 노출 규칙은 사용자가 준 주석을 그대로 따릅니다.
- 실제 F1 22/23/25 전체 UDP 스펙 전체를 재현한 라이브러리는 아닙니다. 필요한 필드가 더 있으면 각 `packets` 모델에 확장하면 됩니다.
- `FRC` 모드는 현재 `STRICT` 기반이며, 추가로 `ersStoreEnergy`, `drsActivated`, 차량 데미지를 전체 차량에 노출합니다. 단 `tireWear`와 ERS 퍼센트는 플레이어 차량 기준으로만 유지합니다.

## 검증

- Go: 로컬 `go test ./...` 가능
- Java: 로컬 `javac` 가능
- TypeScript: 로컬 `npm install && npm run build` 가능
- JavaScript: 로컬 `node --check` 가능
- Kotlin: 이 환경에 `kotlinc`가 없어 소스 생성까지만 수행
