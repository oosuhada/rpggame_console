# Avengers RPG Console · Dart

**A turn-based Avengers RPG that began as an interactive Dart CLI and now includes a browser-based portfolio demo.**

Dart 기초 이후 캐릭터·몬스터·스킬·게임 상태·저장/불러오기를 역할별로 분리해 구현한 텍스트 RPG입니다. 원본 CLI를 그대로 보존하면서, 핵심 전투 흐름을 별도의 React/TypeScript 웹 데모로 재구성했습니다.

<p align="center">
  <img src=".github/assets/portfolio/terminal-demo.gif" width="100%" alt="Avengers RPG Console interactive terminal demo" />
</p>

<p align="center">
  <a href="https://flutter.oosu.dev/rpg_console/"><strong>▶ Play in Browser / 브라우저에서 플레이</strong></a>
</p>

## 주요 기능 / Features

- 한국어/영어 언어 선택이 가능한 원본 Dart CLI
- Avengers 캐릭터 선택과 캐릭터별 능력치·스킬
- HP / MP 기반 턴제 전투
- 기본 공격, 방어, 회복 아이템, 스킬 사용
- 데이터 기반 캐릭터·몬스터·스킬 로딩
- 레벨업과 경험치 흐름
- 게임 상태 저장 및 불러오기
- 브라우저 데모의 localStorage 기반 run / history persistence
- desktop / mobile responsive browser UI

## Architecture

```text
rpggame_console/
├── main.dart                       # Original CLI entry point
├── core/
│   ├── game_engine.dart            # Game flow
│   ├── battle_system.dart          # Battle rules
│   └── game_state.dart             # Runtime game state
├── entities/
│   ├── character.dart
│   ├── monster.dart
│   └── skill.dart
├── services/
│   ├── input_output.dart           # Console I/O
│   └── save_load_service.dart      # Persistence
├── data/                            # Character / monster / skill data
└── web/                             # Browser portfolio demo
    ├── src/
    ├── tests/                       # Playwright interaction smoke tests
    ├── package.json
    └── vite.config.ts
```

원본 프로젝트의 핵심은 Dart에서 **도메인 객체, 전투 규칙, 게임 상태, 입출력, persistence를 분리한 multi-file architecture**입니다.

The original project is an early multi-file Dart application focused on separating **domain entities, battle rules, mutable game state, console I/O, and persistence**.

## Run the original CLI

Dart SDK가 설치된 환경에서:

```bash
dart run main.dart
```

위 terminal GIF는 이 원본 CLI의 실제 interaction을 보여줍니다.

## Browser Demo

Live: **https://flutter.oosu.dev/rpg_console/**

The browser demo is a **React/TypeScript recreation of the original interaction model**. It does not execute the Dart CLI source directly in the browser. Instead, it translates the same portfolio idea—character selection, turn-based combat, HP/MP, defense, items, skills, game state, and persistence—into a responsive interactive web experience.

웹 데모는 기존 Dart 코드를 브라우저에서 그대로 실행하는 구조가 아니라, **원본 CLI의 핵심 상호작용을 React/TypeScript로 재현한 포트폴리오 버전**입니다. 원본 Dart 구현과 웹 데모를 함께 두어 초기 구조 설계와 이후의 인터랙션 확장을 모두 확인할 수 있도록 구성했습니다.

### Web validation

```bash
cd web
npm install
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

## Architecture & Topics / 아키텍처 및 주제

**Architecture / 아키텍처**<br>
[`finite-state-machine`](https://github.com/topics/finite-state-machine) · [`command-pattern`](https://github.com/topics/command-pattern) · [`turn-based-loop`](https://github.com/topics/turn-based-loop) · [`domain-model`](https://github.com/topics/domain-model) · [`component-based-ui`](https://github.com/topics/component-based-ui) · [`client-side-rendering`](https://github.com/topics/client-side-rendering)

**Project context / 프로젝트 맥락**<br>
[`browser-game`](https://github.com/topics/browser-game) · [`cli`](https://github.com/topics/cli) · [`console-game`](https://github.com/topics/console-game) · [`dart-game`](https://github.com/topics/dart-game) · [`frontend`](https://github.com/topics/frontend) · [`game`](https://github.com/topics/game) · [`game-development`](https://github.com/topics/game-development) · [`role-playing-game`](https://github.com/topics/role-playing-game) · [`rpg`](https://github.com/topics/rpg) · [`turn-based`](https://github.com/topics/turn-based) · [`turn-based-game`](https://github.com/topics/turn-based-game) · [`web-game`](https://github.com/topics/web-game)

**Implementation stack / 구현 스택**<br>
[`dart`](https://github.com/topics/dart) · [`react`](https://github.com/topics/react) · [`typescript`](https://github.com/topics/typescript) · [`vite`](https://github.com/topics/vite)
