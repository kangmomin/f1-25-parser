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

- `ParseMode.PUBLIC`: 민감 필드를 모든 차량에 노출합니다.
- `ParseMode.STRICT`: 플레이어 차량만 민감 필드를 유지합니다.
- `ParseMode.FRC`: `STRICT`를 베이스로 하되 `ERS` 값과 `drsActivated`를 추가 노출합니다.

## 참고

- setup 노출은 `aiControlled` 차량에 한해 유지됩니다.
- 이 패키지는 바이트 단위 UDP parser가 아니라, envelope 후처리/정규화 레이어입니다.
