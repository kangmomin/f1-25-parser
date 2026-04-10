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

## 포함 범위

- `FullTelemetryEnvelope`
- `CarEnvelope`
- `NormalizedCar`
- `CanExposePublicOrSelf` 대응 헬퍼
- `PUBLIC` / `STRICT` / `FRC` 파싱 모드
- 모드별 `parse/ParseEnvelope/parseEnvelope` 파서
- 현재 스니펫이 참조하는 최소 `dto`, `packets` 타입

## 현재 가정

- 원본 `frc.engineer/internal/dto`, `frc.engineer/internal/packets` 정의가 없어서, 각 라이브러리는 스니펫을 컴파일 가능하게 만드는 최소 타입 집합을 포함합니다.
- `restricted(strict)` 해석과 `PUBLIC_OR_SELF`, `SELF_OR_AI` 노출 규칙은 사용자가 준 주석을 그대로 따릅니다.
- 실제 F1 22/23/25 전체 UDP 스펙 전체를 재현한 라이브러리는 아닙니다. 필요한 필드가 더 있으면 각 `packets` 모델에 확장하면 됩니다.
- `FRC` 모드는 현재 `STRICT`를 기본 베이스로 둡니다. 추후 사용자가 지정할 FRC 전용 필드/규칙을 넣을 수 있게 설정 타입만 열어두었습니다.

## 검증

- Go: 로컬 `go test ./...` 가능
- Java: 로컬 `javac` 가능
- TypeScript: 로컬 `npm install && npm run build` 가능
- JavaScript: 로컬 `node --check` 가능
- Kotlin: 이 환경에 `kotlinc`가 없어 소스 생성까지만 수행
