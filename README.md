# Avengers RPG Console · Dart

Dart로 만든 텍스트 기반 RPG 학습 프로젝트입니다. 캐릭터·몬스터·스킬을 객체로 분리하고, 턴제 전투와 저장/불러오기 흐름을 구현하면서 **게임 상태와 도메인 객체를 분리하는 구조**를 연습했습니다.

A text-based RPG written in Dart to practice **domain entities, game state, turn-based combat, persistence, and service separation**.

## 한국어

### 주요 기능

- 한국어/영어 언어 선택
- Avengers 캐릭터 선택
- 레벨업과 스킬 강화
- 턴제 전투
- 공격·방어·아이템 등 행동 선택
- 몬스터/빌런 데이터 로딩
- 게임 저장 및 불러오기

### 프로젝트 구조

```text
main.dart                       # 게임 진입점
core/
├── game_engine.dart           # 전체 게임 진행
├── battle_system.dart         # 전투 규칙
└── game_state.dart            # 현재 게임 상태
entities/
├── character.dart
├── monster.dart
└── skill.dart
services/
├── input_output.dart          # 콘솔 I/O
└── save_load_service.dart     # 저장/불러오기
data/                           # 캐릭터, 몬스터, 스킬, 결과 데이터
```

제품형 게임이 아니라 Dart 기초 이후 여러 클래스를 실제 도메인 역할별로 분리해 본 초기 구조 연습 프로젝트입니다.

## English

### Features

- Korean/English language selection
- Playable Avengers character selection
- Character leveling and skill upgrades
- Turn-based battle loop
- Attack, defense, and item actions
- Data-driven character, monster, and skill loading
- Save/load support

### What this project demonstrates

This is an early learning project rather than a production game. It documents the point where my Dart practice moved from small exercises into a multi-file application with explicit entities, engine logic, services, and persistent state.

## Run locally

With the Dart SDK installed:

```bash
dart run main.dart
```
