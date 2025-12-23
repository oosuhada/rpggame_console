import { useState } from 'react';
import {
  Activity,
  ArrowRight,
  Crosshair,
  ExternalLink,
  HeartPulse,
  History,
  RotateCcw,
  Save,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Terminal,
  Trophy,
  X,
  Zap,
} from 'lucide-react';

type Skill = { name: string; power: number; mpCost: number; category: string };
type Character = {
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  maxMp: number;
  mp: number;
  level: number;
  experience: number;
  skills: Skill[];
};
type Monster = {
  name: string;
  type: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  level: number;
  skills: Skill[];
};
type LogKind = 'attack' | 'damage' | 'success' | 'system';
type LogEntry = { id: number; kind: LogKind; text: string; meta: string };
type GameStatus = 'player' | 'victory' | 'defeat' | 'complete';
type GameState = {
  hero: Character;
  monster: Monster;
  stage: number;
  status: GameStatus;
  medkits: number;
  cells: number;
  logs: LogEntry[];
};
type HistoryEntry = {
  id: number;
  hero: string;
  result: 'VICTORY' | 'DEFEAT';
  stage: number;
  level: number;
  date: string;
};

const SAVE_KEY = 'avengers-rpg-browser-save';
const HISTORY_KEY = 'avengers-rpg-browser-history';

const heroes: Character[] = [
  {
    name: 'Iron Man', health: 124, maxHealth: 124, attack: 25, defense: 10, maxMp: 42, mp: 42, level: 1, experience: 0,
    skills: [{ name: 'Repulsor Burst', power: 42, mpCost: 12, category: 'energy' }, { name: 'Unibeam', power: 66, mpCost: 22, category: 'ultimate' }],
  },
  {
    name: 'Captain America', health: 142, maxHealth: 142, attack: 21, defense: 16, maxMp: 34, mp: 34, level: 1, experience: 0,
    skills: [{ name: 'Shield Bash', power: 35, mpCost: 9, category: 'impact' }, { name: 'Rally Cry', power: 54, mpCost: 19, category: 'tactical' }],
  },
  {
    name: 'Black Widow', health: 105, maxHealth: 105, attack: 29, defense: 8, maxMp: 46, mp: 46, level: 1, experience: 0,
    skills: [{ name: 'Widow Bite', power: 48, mpCost: 13, category: 'shock' }, { name: 'Red Room', power: 72, mpCost: 25, category: 'precision' }],
  },
  {
    name: 'Thor', health: 135, maxHealth: 135, attack: 27, defense: 12, maxMp: 38, mp: 38, level: 1, experience: 0,
    skills: [{ name: 'Mjolnir Arc', power: 46, mpCost: 12, category: 'storm' }, { name: 'Thunderclap', power: 78, mpCost: 26, category: 'ultimate' }],
  },
];

const monsters: Monster[] = [
  { name: 'Batman', type: 'TACTICAL VIGILANTE', health: 112, maxHealth: 112, attack: 19, defense: 12, level: 1, skills: [{ name: 'Batarang', power: 26, mpCost: 0, category: 'ranged' }] },
  { name: 'Spiderman', type: 'URBAN ACROBAT', health: 138, maxHealth: 138, attack: 23, defense: 10, level: 2, skills: [{ name: 'Web Strike', power: 31, mpCost: 0, category: 'impact' }] },
  { name: 'Superman', type: 'KRYPTONIAN THREAT', health: 178, maxHealth: 178, attack: 29, defense: 18, level: 3, skills: [{ name: 'Heat Vision', power: 39, mpCost: 0, category: 'energy' }] },
];

function cloneHero(hero: Character): Character {
  return { ...hero, skills: hero.skills.map((skill) => ({ ...skill })) };
}

function cloneMonster(stage: number): Monster {
  const base = monsters[Math.min(stage - 1, monsters.length - 1)];
  return { ...base, skills: base.skills.map((skill) => ({ ...skill })) };
}

function initialGame(hero: Character): GameState {
  return {
    hero: cloneHero(hero),
    monster: cloneMonster(1),
    stage: 1,
    status: 'player',
    medkits: 2,
    cells: 1,
    logs: [{ id: Date.now(), kind: 'system', text: `Mission started. ${hero.name} enters the arena.`, meta: 'TURN 01 / COMMAND' }],
  };
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeGame(game: GameState | null) {
  if (game) window.localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  else window.localStorage.removeItem(SAVE_KEY);
}

function readHistory(): HistoryEntry[] {
  return readJson<HistoryEntry[]>(HISTORY_KEY, []);
}

function writeHistory(entry: HistoryEntry) {
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...readHistory()].slice(0, 8)));
}

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2);
}

function formatDate() {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date()).toUpperCase();
}

function barWidth(value: number, max: number) {
  return `${Math.max(0, Math.min(100, (value / max) * 100))}%`;
}

function App() {
  const [selectedHero, setSelectedHero] = useState(heroes[0]);
  const [savedRun, setSavedRun] = useState<GameState | null>(() => readJson<GameState | null>(SAVE_KEY, null));
  const [game, setGame] = useState<GameState | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() => readHistory());
  const [showHistory, setShowHistory] = useState(false);
  const [flash, setFlash] = useState<{ text: string; kind: string; id: number } | null>(null);
  const [saveNotice, setSaveNotice] = useState('LOCAL SAVE READY');

  const showFlash = (text: string, kind = '') => {
    const next = { text, kind, id: Date.now() };
    setFlash(next);
    window.setTimeout(() => setFlash((current) => current?.id === next.id ? null : current), 800);
  };

  const startRun = () => {
    const next = initialGame(selectedHero);
    setGame(next);
    setSavedRun(next);
    writeGame(next);
    setSaveNotice('RUN SAVED');
  };

  const newRun = () => {
    if (game && !window.confirm('Abandon the current run and assemble a new hero?')) return;
    writeGame(null);
    setSavedRun(null);
    setGame(null);
    setSaveNotice('LOCAL SAVE READY');
  };

  const saveRun = () => {
    if (!game) return;
    writeGame(game);
    setSavedRun(game);
    setSaveNotice('RUN SAVED JUST NOW');
    showFlash('RUN SAVED', 'success-flash');
  };

  const finishRun = (result: 'VICTORY' | 'DEFEAT', current: GameState) => {
    writeHistory({ id: Date.now(), hero: current.hero.name, result, stage: current.stage, level: current.hero.level, date: formatDate() });
    setHistory(readHistory());
    writeGame(null);
    setSavedRun(null);
  };

  const nextStage = () => {
    if (!game || game.stage >= monsters.length) return;
    const stage = game.stage + 1;
    const hero = {
      ...game.hero,
      health: Math.min(game.hero.maxHealth, game.hero.health + 22),
      mp: Math.min(game.hero.maxMp, game.hero.mp + 11),
    };
    const monster = cloneMonster(stage);
    const next: GameState = {
      ...game,
      hero,
      monster,
      stage,
      status: 'player',
      logs: [...game.logs, { id: Date.now(), kind: 'system', text: `Next signal acquired. ${monster.name} is entering the arena.`, meta: `STAGE ${stage} / COMMAND` }],
    };
    setGame(next);
    writeGame(next);
    setSavedRun(next);
    showFlash(`STAGE ${stage}`, 'success-flash');
  };

  const performAction = (action: 'attack' | 'defend' | 'medkit' | 'cell' | 'skill', skill?: Skill) => {
    if (!game || game.status !== 'player') return;
    if (action === 'medkit' && game.medkits < 1) return;
    if (action === 'cell' && game.cells < 1) return;
    if (action === 'skill' && (!skill || game.hero.mp < skill.mpCost)) return;

    const hero = { ...game.hero };
    const monster = { ...game.monster };
    const logs = [...game.logs];
    const turnNumber = logs.length + 1;
    let medkits = game.medkits;
    let cells = game.cells;
    let defending = false;
    let flashText = '';
    let flashKind = '';

    if (action === 'attack') {
      const damage = Math.max(4, hero.attack + Math.floor(Math.random() * 7) - monster.defense);
      monster.health = Math.max(0, monster.health - damage);
      logs.push({ id: Date.now(), kind: 'attack', text: `${hero.name} lands a basic strike for ${damage} damage.`, meta: `TURN ${String(turnNumber).padStart(2, '0')} / BASIC ATTACK` });
      flashText = `-${damage}`;
      flashKind = 'damage-flash';
    } else if (action === 'skill' && skill) {
      const damage = Math.max(8, skill.power + Math.floor(Math.random() * 9) - monster.defense);
      hero.mp -= skill.mpCost;
      monster.health = Math.max(0, monster.health - damage);
      logs.push({ id: Date.now(), kind: 'attack', text: `${hero.name} deploys ${skill.name}; ${damage} damage confirmed.`, meta: `TURN ${String(turnNumber).padStart(2, '0')} / ${skill.category}` });
      flashText = `-${damage}`;
      flashKind = 'damage-flash';
    } else if (action === 'defend') {
      defending = true;
      hero.mp = Math.min(hero.maxMp, hero.mp + 4);
      logs.push({ id: Date.now(), kind: 'success', text: `${hero.name} braces for impact. Incoming damage is reduced.`, meta: `TURN ${String(turnNumber).padStart(2, '0')} / DEFENSE` });
      flashText = 'GUARD';
    } else if (action === 'medkit') {
      const healed = Math.min(hero.maxHealth - hero.health, 34);
      hero.health += healed;
      medkits -= 1;
      logs.push({ id: Date.now(), kind: 'success', text: `${hero.name} restores ${healed} health from a medkit.`, meta: `TURN ${String(turnNumber).padStart(2, '0')} / CONSUMABLE` });
      flashText = `+${healed}`;
      flashKind = 'success-flash';
    } else if (action === 'cell') {
      const charged = Math.min(hero.maxMp - hero.mp, 18);
      hero.mp += charged;
      cells -= 1;
      logs.push({ id: Date.now(), kind: 'success', text: `${hero.name} recharges ${charged} MP with an energy cell.`, meta: `TURN ${String(turnNumber).padStart(2, '0')} / CONSUMABLE` });
      flashText = `+${charged} MP`;
      flashKind = 'success-flash';
    }

    if (monster.health <= 0) {
      const gained = 38 + game.stage * 11;
      hero.experience += gained;
      const required = hero.level * 100;
      let leveled = false;
      if (hero.experience >= required) {
        hero.experience -= required;
        hero.level += 1;
        hero.maxHealth += 13;
        hero.health = Math.min(hero.maxHealth, hero.health + 28);
        hero.attack += 3;
        hero.defense += 2;
        hero.maxMp += 4;
        hero.mp = hero.maxMp;
        leveled = true;
        logs.push({ id: Date.now() + 1, kind: 'success', text: `${hero.name} reached level ${hero.level}. Systems upgraded.`, meta: 'LEVEL UP / CONFIRMED' });
      }
      const complete = game.stage >= monsters.length;
      const next: GameState = {
        ...game,
        hero,
        monster,
        medkits,
        cells,
        status: complete ? 'complete' : 'victory',
        logs: [...logs, { id: Date.now() + 2, kind: 'success', text: `${monster.name} neutralized. +${gained} experience acquired.`, meta: complete ? 'CAMPAIGN CLEAR' : 'STAGE CLEAR' }],
      };
      setGame(next);
      if (complete) finishRun('VICTORY', next);
      else {
        writeGame(next);
        setSavedRun(next);
      }
      showFlash(leveled ? 'LEVEL UP' : 'TARGET DOWN', 'success-flash');
      return;
    }

    const enemySkill = monster.skills[0];
    const useSkill = Math.random() > 0.55;
    let incoming = Math.max(3, (useSkill ? enemySkill.power : monster.attack) + Math.floor(Math.random() * 5) - hero.defense);
    if (defending) incoming = Math.floor(incoming / 2);
    hero.health = Math.max(0, hero.health - incoming);
    logs.push({ id: Date.now() + 1, kind: 'damage', text: `${monster.name} answers with ${useSkill ? enemySkill.name : 'a basic attack'} for ${incoming} damage.`, meta: `TURN ${String(turnNumber + 1).padStart(2, '0')} / ENEMY RESPONSE` });
    const defeated = hero.health <= 0;
    const next: GameState = { ...game, hero, monster, medkits, cells, logs, status: defeated ? 'defeat' : 'player' };
    setGame(next);
    if (defeated) {
      finishRun('DEFEAT', next);
      showFlash('SYSTEM FAILURE', 'damage-flash');
    } else {
      writeGame(next);
      setSavedRun(next);
      showFlash(flashText, flashKind);
    }
  };

  return (
    <main className="app-shell">
      <div className="app-frame">
        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-mark">A</div>
            <div><div className="brand-name">ARC // COMMAND</div><div className="brand-sub">Avengers RPG browser portfolio demo</div></div>
          </div>
          <div className="topbar-actions">
            <div className="micro-status" data-testid="status-local-save">{saveNotice}</div>
            {game && <button className="icon-button" onClick={saveRun} data-testid="button-save-run" title="Save run"><Save size={15} /></button>}
            {game && <button className="icon-button" onClick={newRun} data-testid="button-new-run" title="New run"><RotateCcw size={15} /></button>}
          </div>
        </header>

        {game ? (
          <BattleScreen game={game} saveNotice={saveNotice} onAction={performAction} onSave={saveRun} onNew={newRun} onNext={nextStage} />
        ) : (
          <SelectionScreen
            selectedHero={selectedHero}
            setSelectedHero={setSelectedHero}
            history={history}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            hasSave={Boolean(savedRun)}
            onStart={startRun}
            onContinue={() => savedRun && setGame(savedRun)}
            onResetHistory={() => {
              if (!window.confirm('Clear the recent mission results?')) return;
              window.localStorage.removeItem(HISTORY_KEY);
              setHistory([]);
            }}
          />
        )}

        <footer className="origin-note">
          <div><span>PORTFOLIO WEB DEMO</span><p>Browser recreation of the interaction model from the original multi-file Dart CLI project.</p></div>
          <a href="https://github.com/oosuhada/rpggame_console" target="_blank" rel="noreferrer">View Dart source <ExternalLink size={12} /></a>
        </footer>
      </div>
      {flash && <div key={flash.id} className={`feedback-flash ${flash.kind}`} data-testid="feedback-flash">{flash.text}</div>}
    </main>
  );
}

function SelectionScreen({ selectedHero, setSelectedHero, history, showHistory, setShowHistory, hasSave, onStart, onContinue, onResetHistory }: {
  selectedHero: Character;
  setSelectedHero: (hero: Character) => void;
  history: HistoryEntry[];
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  hasSave: boolean;
  onStart: () => void;
  onContinue: () => void;
  onResetHistory: () => void;
}) {
  return (
    <section>
      <div className="hero-intro">
        <div>
          <div className="section-kicker">A.R.C. // FIELD DEPLOYMENT 01</div>
          <h1>Assemble<br /><span>your line.</span></h1>
          <p className="hero-intro-copy">A turn-based tactical arena rebuilt for the browser from an early Dart console RPG. Read the field, spend your power, and make the next move count.</p>
        </div>
        <div className="run-brief"><strong>Three targets.<br />One clean run.</strong><p>Choose an Avenger, survive the escalation, and leave a mark in the local mission archive. No account. No server state. Just the next turn.</p></div>
      </div>

      <div className="selection-head">
        <div><div className="section-kicker">01 / Select operative</div><h2>Who answers the signal?</h2></div>
        <p>BASELINE LOADOUTS<br />LEVEL 01 / FULL CHARGE</p>
      </div>
      <div className="hero-grid" data-testid="hero-selection-grid">
        {heroes.map((hero, index) => (
          <button key={hero.name} className={`hero-card ${selectedHero.name === hero.name ? 'selected' : ''}`} data-tone={index % 3 === 0 ? 'gold' : index % 3 === 1 ? 'cyan' : 'coral'} onClick={() => setSelectedHero(hero)} data-testid={`card-hero-${hero.name.toLowerCase().replaceAll(' ', '-')}`}>
            <div>
              <div className="hero-card-top"><span className="hero-index">0{index + 1} / OPERATIVE</span><div className="hero-crest">{initials(hero.name)}</div></div>
              <h3>{hero.name}</h3><div className="hero-role">{hero.skills[0].category} specialist</div>
              <div className="stat-strip"><div className="stat-line"><span>HP</span><b>{hero.maxHealth}</b></div><div className="stat-line"><span>ATK</span><b>{hero.attack}</b></div><div className="stat-line"><span>DEF</span><b>{hero.defense}</b></div><div className="stat-line"><span>MP</span><b>{hero.maxMp}</b></div></div>
            </div>
            <div className="skill-row">{hero.skills.map((skill) => <span className="skill-chip" key={skill.name}>{skill.name}</span>)}</div>
          </button>
        ))}
      </div>
      <div className="selection-footer">
        <div className="selection-footer-note"><Terminal size={13} /> Local persistence keeps the latest browser run on this device.</div>
        <div className="selection-actions">
          {hasSave && <button className="secondary-btn" onClick={onContinue} data-testid="button-continue-run"><Activity size={14} /> Continue run</button>}
          <button className="secondary-btn" onClick={() => setShowHistory(!showHistory)} data-testid="button-toggle-history"><History size={14} /> Results {history.length > 0 && `(${history.length})`}</button>
          <button className="primary-btn" onClick={onStart} data-testid="button-deploy-hero">Deploy {selectedHero.name} <ArrowRight size={15} /></button>
        </div>
      </div>
      {showHistory && (
        <div className="history-panel" data-testid="panel-history">
          <div className="history-head"><div><div className="section-kicker">Local archive / last 08</div><h3>Recent results</h3></div><button className="icon-button" onClick={() => setShowHistory(false)} data-testid="button-close-history"><X size={15} /></button></div>
          {history.length === 0 ? <div className="empty-history" data-testid="empty-history">No missions have been archived yet. Your first completed run will appear here.</div> : <div className="history-list">{history.map((entry) => <div className={`history-item ${entry.result === 'VICTORY' ? 'win' : 'loss'}`} key={entry.id}><strong>{entry.hero}</strong><span>Stage {entry.stage} / Level {entry.level}</span><span className={entry.result === 'VICTORY' ? 'result-win' : 'result-loss'}>{entry.result}</span><span>{entry.date}</span></div>)}</div>}
          {history.length > 0 && <button className="secondary-btn" onClick={onResetHistory} data-testid="button-clear-history">Clear archive</button>}
        </div>
      )}
    </section>
  );
}

function BattleScreen({ game, saveNotice, onAction, onSave, onNew, onNext }: {
  game: GameState;
  saveNotice: string;
  onAction: (action: 'attack' | 'defend' | 'medkit' | 'cell' | 'skill', skill?: Skill) => void;
  onSave: () => void;
  onNew: () => void;
  onNext: () => void;
}) {
  const isOver = game.status !== 'player';
  const outcome = game.status === 'defeat'
    ? { title: 'Run interrupted', body: `${game.hero.name} could not hold the line. The attempt is in the archive.`, icon: <Skull size={28} /> }
    : game.status === 'complete'
      ? { title: 'Arena cleared', body: `${game.hero.name} completed the three-target operation at level ${game.hero.level}.`, icon: <Trophy size={28} /> }
      : { title: `Stage ${game.stage} cleared`, body: `${game.monster.name} is down. Recover charge and prepare for the next signal.`, icon: <Sparkles size={28} /> };

  return (
    <section>
      <div className="battle-header">
        <div className="battle-title"><Crosshair size={22} /><div><h1>Live engagement</h1><p>Turn-based browser recreation / local state</p></div></div>
        <div className="stage-rail" aria-label="Mission stages" data-testid="stage-rail">{monsters.map((monster, index) => <div key={monster.name} className="stage-segment">{index > 0 && <span className="stage-line" />}<div className={`stage-node ${game.stage === index + 1 ? 'active' : game.stage > index + 1 ? 'done' : ''}`}>{String(index + 1).padStart(2, '0')}</div></div>)}</div>
      </div>
      <div className="battle-grid">
        <CombatantCard side="enemy" label="Hostile signal" name={game.monster.name} subtitle={game.monster.type} level={game.monster.level} health={game.monster.health} maxHealth={game.monster.maxHealth} attack={game.monster.attack} defense={game.monster.defense} />
        <LogCard logs={game.logs} status={game.status} />
        <CombatantCard side="player" label="Active operative" name={game.hero.name} subtitle={`Level ${game.hero.level} / ${game.hero.skills[0].category} specialist`} level={game.hero.level} health={game.hero.health} maxHealth={game.hero.maxHealth} mp={game.hero.mp} maxMp={game.hero.maxMp} xp={game.hero.experience} xpMax={game.hero.level * 100} attack={game.hero.attack} defense={game.hero.defense} />
        <ActionDock game={game} onAction={onAction} />
      </div>
      <div className="battle-footer"><button className="secondary-btn" onClick={onSave} data-testid="button-save-battle"><Save size={13} /> {saveNotice}</button><button className="secondary-btn" onClick={onNew} data-testid="button-abandon-run"><RotateCcw size={13} /> Abandon run</button></div>
      {isOver && <div className="overlay-card" data-testid="overlay-result"><div className="result-modal"><div className="result-seal">{outcome.icon}</div><h2>{outcome.title}</h2><p>{outcome.body}</p>{game.status === 'victory' ? <button className="primary-btn" onClick={onNext} data-testid="button-next-target">Next target <ArrowRight size={15} /></button> : <button className="primary-btn" onClick={onNew} data-testid="button-return-selection">Assemble a new line <RotateCcw size={15} /></button>}</div></div>}
    </section>
  );
}

function CombatantCard({ side, label, name, subtitle, level, health, maxHealth, mp, maxMp, xp, xpMax, attack, defense }: {
  side: 'enemy' | 'player'; label: string; name: string; subtitle: string; level: number; health: number; maxHealth: number;
  mp?: number; maxMp?: number; xp?: number; xpMax?: number; attack: number; defense: number;
}) {
  return (
    <article className={`combatant-card ${side}`} data-testid={`combatant-${side}`}>
      <div className="combatant-top"><div><div className="combatant-label">{label}</div><h2>{name}</h2><div className="combatant-label combatant-subtitle">{subtitle}</div></div><span className="level-pill">LVL {level}</span></div>
      <div className="portrait-well"><div className="portrait-glyph">{initials(name)}</div></div>
      <div className="combatant-stats">
        <div className="bar-meta"><span>Vitality</span><b data-testid={`value-health-${side}`}>{health} / {maxHealth}</b></div><div className="health-bar"><div className="health-fill" style={{ width: barWidth(health, maxHealth) }} /></div>
        {side === 'player' && <><div className="bar-meta stat-bar-meta"><span>Experience</span><b>{xp} / {xpMax}</b></div><div className="xp-bar"><div className="xp-fill" style={{ width: barWidth(xp ?? 0, xpMax ?? 100) }} /></div><div className="bar-meta stat-bar-meta"><span>Power reserve</span><b data-testid="value-mp-player">{mp} / {maxMp} MP</b></div><div className="mp-bar"><div className="mp-fill" style={{ width: barWidth(mp ?? 0, maxMp ?? 1) }} /></div></>}
        <div className="stat-pair"><div className="mini-stat"><span>Attack</span><b>{attack}</b></div><div className="mini-stat"><span>Defense</span><b>{defense}</b></div></div>
      </div>
    </article>
  );
}

function LogCard({ logs, status }: { logs: LogEntry[]; status: GameStatus }) {
  const statusText = status === 'player' ? 'Your command' : status === 'defeat' ? 'Signal lost' : status === 'complete' ? 'Operation complete' : 'Target neutralized';
  return <article className="log-card" data-testid="panel-action-log"><div className="log-head"><h2>Action log</h2><span className="live-dot">{statusText}</span></div><div className="combat-log">{logs.slice(-12).map((entry) => <div className={`log-entry ${entry.kind}`} key={entry.id}><div><strong>{entry.text}</strong><small>{entry.meta}</small></div></div>)}</div><div className={`turn-banner ${status !== 'player' ? 'complete' : ''}`} data-testid="status-turn">{status === 'player' ? 'Your turn — choose an action' : status === 'defeat' ? 'The line has gone quiet' : status === 'complete' ? 'All hostile signals cleared' : 'Target down — mission update ready'}</div></article>;
}

function ActionDock({ game, onAction }: { game: GameState; onAction: (action: 'attack' | 'defend' | 'medkit' | 'cell' | 'skill', skill?: Skill) => void }) {
  const disabled = game.status !== 'player';
  return (
    <article className="action-card" data-testid="panel-action-dock">
      <div className="action-head"><h2>Command deck</h2><span>Spend the turn wisely</span></div>
      <div className="action-grid">
        <button className="action-btn" disabled={disabled} onClick={() => onAction('attack')} data-testid="button-basic-attack"><span className="action-icon"><Swords size={17} /></span><span className="action-copy"><strong>Basic attack</strong><span>Reliable damage. No cost.</span></span></button>
        <button className="action-btn defend" disabled={disabled} onClick={() => onAction('defend')} data-testid="button-defend"><span className="action-icon"><Shield size={17} /></span><span className="action-copy"><strong>Defend</strong><span>Halve the next hit. +4 MP.</span></span></button>
        <div className="skill-actions">{game.hero.skills.map((skill) => <button className="skill-btn" key={skill.name} disabled={disabled || game.hero.mp < skill.mpCost} onClick={() => onAction('skill', skill)} data-testid={`button-skill-${skill.name.toLowerCase().replaceAll(' ', '-')}`}><strong>{skill.name}</strong><span>{skill.power} power / {skill.mpCost} MP</span></button>)}</div>
      </div>
      <div className="item-actions">
        <button className="action-btn item" disabled={disabled || game.medkits < 1 || game.hero.health >= game.hero.maxHealth} onClick={() => onAction('medkit')} data-testid="button-use-medkit"><span className="action-icon"><HeartPulse size={16} /></span><span className="action-copy"><strong>Medkit ×{game.medkits}</strong><span>Restore up to 34 HP</span></span></button>
        <button className="action-btn item" disabled={disabled || game.cells < 1 || game.hero.mp >= game.hero.maxMp} onClick={() => onAction('cell')} data-testid="button-use-energy-cell"><span className="action-icon"><Zap size={16} /></span><span className="action-copy"><strong>Energy cell ×{game.cells}</strong><span>Restore up to 18 MP</span></span></button>
      </div>
    </article>
  );
}

export default App;
