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

- `"public"`: public 가시성 기준으로 연료/ERS/데미지 등을 전체 차량에 노출합니다.
- `"strict"`: 플레이어 차량만 민감 필드를 유지합니다.
- `"frc"`: `"public"`에서 보이는 데이터는 전부 포함하고, 추가로 `ersActualPct` / `ersEstimatePct`, `drsActivated`, `aiControlled`, `diffOnThrottle`, `tireCompound` 같은 FRC용 필드를 채웁니다.

## 참고

- `SELF_OR_AI` 규칙은 `participants[i].aiControlled`를 봅니다.
- 이 패키지는 raw UDP decoder가 아닙니다. 먼저 envelope 형태로 데이터를 만든 뒤 `parseEnvelope`를 적용해야 합니다.
