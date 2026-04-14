# TypeScript

이 패키지는 TypeScript에서 `FullTelemetryEnvelope`를 visibility-aware 모델로 다시 파싱하는 라이브러리입니다.

## 설치

```bash
npm install
npm run build
```

## import

```ts
import {
  parseEnvelope,
  type ParseOptions,
  type FullTelemetryEnvelope,
} from "./dist/index.js";
```

프로젝트 내부에서 바로 사용할 때는 `src/index.ts`를 import해도 됩니다.

## 주요 API

- 모델: `FullTelemetryEnvelope`, `CarEnvelope`, `NormalizedCar`
- 모드: `"public" | "strict" | "frc"`
- 파서: `parseEnvelope(input, options)`

## 예제

```ts
import { parseEnvelope, type FullTelemetryEnvelope } from "./src/index.js";

const env: FullTelemetryEnvelope = {
  capturedAt: new Date(),
  header: {
    playerCarIndex: 0,
  },
  participants: {
    participants: [
      { name: "You", teamId: 1, yourTelemetry: 1 },
      { name: "Other", teamId: 2, yourTelemetry: 0 },
    ],
  },
};

const parsed = parseEnvelope(env, {
  mode: "strict",
});

console.log(parsed.cars?.[0]?.normalized.name);
```

## 모드

| 데이터 영역 | `"public"` | `"strict"` | `"frc"` |
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

- `SELF_OR_AI` 규칙은 `participants[i].aiControlled`를 봅니다.
- `frc`는 `strict` 기반에 `ersStoreEnergy`, `drsActivated`, 차량 데미지만 추가 공개합니다. 단 `tireWear`는 추가 공개하지 않습니다.
- 이 패키지는 raw UDP decoder가 아닙니다. 먼저 envelope 형태로 데이터를 만든 뒤 `parseEnvelope`를 적용해야 합니다.
