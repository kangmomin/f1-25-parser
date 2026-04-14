# JavaScript

이 패키지는 JavaScript에서 `FullTelemetryEnvelope`를 기준으로 모드별 visibility parsing을 적용하는 라이브러리입니다.

## 설치

```bash
npm install
npm run check
```

## import

```js
import {
  FullTelemetryEnvelope,
  ParseMode,
  ParseOptions,
  parseEnvelope,
} from "./src/index.js";
```

## 예제

```js
import {
  FullTelemetryEnvelope,
  ParseMode,
  ParseOptions,
  parseEnvelope,
} from "./src/index.js";

const env = new FullTelemetryEnvelope({
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
});

const parsed = parseEnvelope(
  env,
  new ParseOptions({
    mode: ParseMode.STRICT,
  }),
);

console.log(parsed.cars[0].normalized.name);
```

## 모드

| 데이터 영역 | `ParseMode.PUBLIC` | `ParseMode.STRICT` | `ParseMode.FRC` |
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

- setup 노출은 `aiControlled` 차량에 한해 유지됩니다.
- `FRC`는 `STRICT` 기반에 `ersStoreEnergy`, `drsActivated`, 차량 데미지만 추가 공개합니다. 단 `tireWear`는 추가 공개하지 않습니다.
- 이 패키지는 바이트 단위 UDP parser가 아니라, envelope 후처리/정규화 레이어입니다.
