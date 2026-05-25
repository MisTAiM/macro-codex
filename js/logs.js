// ══════════════════════════════════════════════════════════════════
// logs.js — Game log storage + pattern-based coaching analysis engine
// ══════════════════════════════════════════════════════════════════

const LOG_KEY = 'macro-codex-logs-v1';

// ── Storage helpers ──────────────────────────────────────────────
export function loadLogs() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); }
  catch { return []; }
}
function saveLogs(logs) {
  try { localStorage.setItem(LOG_KEY, JSON.stringify(logs)); }
  catch { /* quota */ }
}
export function addLog(entry) {
  const logs = loadLogs();
  logs.unshift({ ...entry, id: Date.now(), date: new Date().toISOString().slice(0, 10) });
  saveLogs(logs);
  return logs;
}
export function deleteLog(id) {
  const logs = loadLogs().filter(l => l.id !== id);
  saveLogs(logs);
  return logs;
}
export function clearAllLogs() {
  saveLogs([]);
}

// ── Field definitions for the log form ──────────────────────────
export const LOG_FIELDS = {
  // Game meta
  result:               { label: 'Result',               type: 'select',  options: ['win', 'loss'] },
  role:                 { label: 'Role',                  type: 'select',  options: ['top', 'jungle', 'mid', 'bot', 'support'] },
  champion:             { label: 'Champion',              type: 'text',    placeholder: 'Aatrox...' },
  gameDuration:         { label: 'Game duration (min)',   type: 'number',  min: 15, max: 70 },

  // Core macro stats
  csPerMin:             { label: 'CS per minute',         type: 'number',  min: 0, max: 14,  step: 0.1 },
  visionPerMin:         { label: 'Vision score / min',    type: 'number',  min: 0, max: 5,   step: 0.1 },
  deaths:               { label: 'Total deaths',          type: 'number',  min: 0, max: 20 },
  deathsInFog:          { label: 'Deaths in fog (unseen enemies)', type: 'number', min: 0, max: 15 },

  // Wave management
  crashedBeforeObj:     { label: 'Crashed wave before each objective?', type: 'select', options: ['always', 'usually', 'sometimes', 'rarely', 'never'] },
  rotatedAt14:          { label: 'Rotated out of lane by 14:00?', type: 'select', options: ['yes', 'no'] },

  // Objective control
  firstDragonMin:       { label: 'First Dragon taken (min, 0 = lost it)', type: 'number', min: 0, max: 25 },
  baronVisionBy1830:    { label: 'Baron vision set by 18:30?', type: 'select', options: ['yes', 'no', 'na'] },
  postFightObjectives:  { label: 'Objectives taken after winning a fight', type: 'number', min: 0, max: 10 },
  postFightFarmed:      { label: 'Times you recalled/farmed after a fight win instead of taking obj', type: 'number', min: 0, max: 10 },

  // Economy
  recallTiming:         { label: 'Recall discipline', type: 'select', options: ['always good', 'usually good', 'often bad', 'always bad'] },
  platesCollected:      { label: 'Plate collection (est)', type: 'select', options: ['aggressive (800g+)', 'moderate (400-800g)', 'ignored (<400g)'] },

  // Notes
  biggestMistake:       { label: 'Biggest macro mistake this game', type: 'textarea', placeholder: 'e.g. Farmed top lane at 15 min while team lost Dragon 4v5' },
};

// ── Stat benchmarks (Challenger-level targets) ──────────────────
const BENCHMARKS = {
  csPerMin:    { good: 8.0,  ok: 6.5,  bad: 5.0  },
  visionPerMin:{ good: 1.5,  ok: 1.0,  bad: 0.6  },
  deathFogPct: { good: 0.1,  ok: 0.3,  bad: 0.5  }, // deaths in fog / total deaths
};

// ── Cost tables: what each error actually costs ──────────────────
const COSTS = {
  missedDragon: {
    goldLost: 150,      // approximate global gold
    stackLost: 1,       // one drake stack
    xpLost: 0,
    note: 'Each missed drake stack compounds. A 3-0 drake lead is worth ~450g + permanent stacking bonuses that scale all game.'
  },
  missedWaveCrash: {
    goldLost: 177,      // one normal wave
    xpLost: 500,
    note: 'That\'s one full wave (~177g + ~500 XP). Miss 3 waves in a game = ~531g and ~1,500 XP lost — roughly half an item component and half a level at level 5.'
  },
  fogDeath: {
    goldGiven: 300,     // approximate bounty
    devalLoss: 120,     // at 0.4x devaluation
    note: 'Under 2026\'s doubled devaluation, dying and giving 300g removes 120g from your next kill value. Dying twice like this costs more than an entire component item in kill gold.'
  },
  badRecall: {
    goldLost: 350,      // avg of 1-2 waves
    note: 'A recall timed mid-wave loses 1-2 waves (300-440g) and returns you to a pushed wave you can\'t freeze — compounding the mistake with another 1-2 waves of denied CS.'
  },
  missedRotation: {
    goldLost: 0,
    objectiveLost: 1,
    note: 'Playing 4v5 on an objective fight reduces win rate on that fight by roughly 30-40%. Over a game, missing 2 objective fights as a 4v5 is worth one Dragon stack and 150-300g in objective gold.'
  },
};

// ── Analysis engine ─────────────────────────────────────────────
export function analyzeGameLog(log) {
  const issues = [];

  // 1. Vision score
  if (log.visionPerMin != null) {
    const v = parseFloat(log.visionPerMin);
    const role = log.role;
    const target = (role === 'support') ? 2.0 : (role === 'jungle') ? 1.2 : 1.0;
    if (v < target) {
      const deficit = (target - v).toFixed(1);
      const wardsMissed = Math.round(deficit * (parseFloat(log.gameDuration || 25)));
      issues.push({
        severity: v < 0.6 ? 'critical' : 'major',
        category: 'vision',
        title: 'Vision Score Below Threshold',
        stat: `${v} / ${target}+ target`,
        math: `
You scored ${v} vision/min vs the ${target}+ target for ${role}.
Gap: ${deficit} vision/min × ${log.gameDuration || 25} min = ~${wardsMissed} fewer wards placed this game.

WHAT THOSE WARDS COST YOU:
• Every unplaced ward is ~1 "information unit" — a potential gank, pick, or Baron fight you walked into blind.
• Your ${log.deathsInFog || 0} fog deaths at ~300g average bounty given = ${(log.deathsInFog || 0) * 300}g handed to the enemy.
• Under 2026 devaluation: each fog death also costs you ${(log.deathsInFog || 0) * 120}g in your own kill value reduction.
• Total invisible cost: ~${(log.deathsInFog || 0) * 420}g from vision failure alone.`,
        why: `Low vision score means you are playing with a permanently dark map. Every time you walk forward without knowing enemy positions, you are making a 50/50 gamble with your death timer (${Math.round(25 + (parseFloat(log.gameDuration || 25) * 0.8))}s at mid-game levels). You are paying full price to gamble with negative expected value.`,
        fix: `
IMMEDIATE FIX (do this every single game):
1. Buy a Control Ward on EVERY recall. 75g. Non-negotiable.
2. Ward river bush BEFORE you push past the center line. Not after.
3. At 18:30 STOP what you are doing and plant Baron river wards. Set a mental clock.

DRILL: After each recall, before you walk back to lane, check your item slots. If you don't have a Control Ward in your inventory, you made a mistake. Buy one. Always.`,
      });
    }
  }

  // 2. Wave crash discipline
  if (log.crashedBeforeObj) {
    const map = { always: 5, usually: 4, sometimes: 3, rarely: 2, never: 1 };
    const score = map[log.crashedBeforeObj] || 3;
    if (score <= 2) {
      issues.push({
        severity: score === 1 ? 'critical' : 'major',
        category: 'waves',
        title: 'Wave Not Crashed Before Objectives',
        stat: `Crash discipline: ${log.crashedBeforeObj}`,
        math: `
Each missed crash before an objective costs you BOTH the wave AND tempo:

WAVE LOSS: ~177g + ~500 XP per normal wave you leave behind.
TEMPO LOSS: Arriving late to the objective = you contest at a disadvantage or don't contest at all.

OBJECTIVE COST BREAKDOWN:
• Dragon worth ~150g global + permanent drake stack
• If your team loses Dragon because you arrived late: that's 150g + stack value lost per person (×5) = 750g+ in team economy
• The crash takes 15-20 seconds. Arriving 20 seconds early = you DICTATE the setup.
• Arriving 20 seconds LATE = they have vision planted and you engage into their position.

CRASH TIMING FORMULA:
Objective spawns at T.
Start crashing your wave at T - 40 seconds.
Begin rotating at T - 25 seconds.
Arrive at T - 10 seconds.
This gives you setup time. Anything later = reactive, not proactive.`,
        why: `When you don't crash the wave before rotating, one of two things happens: (1) you don't rotate at all and your team fights 4v5, or (2) you rotate but leave a cannon wave crashing into your tower, handing the enemy free CS while you're away. Both lose you resources. Crashing the wave solves both problems simultaneously.`,
        fix: `
THE CRASH-BEFORE-OBJECTIVE HABIT:
Start asking yourself every 2 minutes: "When is the next objective?" 
If it's within 2 minutes, your ONLY job is crashing this wave, not CS'ing it.

DRILL: Play one game where your only rule is "I will never be at an objective fight with a wave still alive in my lane." Accept the CS loss if needed. The habit is worth more than the minions.`,
      });
    }
  }

  // 3. Lane rotation timing
  if (log.rotatedAt14 === 'no') {
    issues.push({
      severity: 'major',
      category: 'rotation',
      title: 'Failed to Rotate Out of Lane by 14:00',
      stat: 'Stayed in lane past the transition window',
      math: `
WHAT STAYING IN LANE PAST 14:00 COSTS:

Your team played 4v5 during the critical mid-game objective window (14-20 min).

Dragon #2 spawn window: ~11:00 (if taken at 5:00)
Rift Herald despawn: ~19:45
Baron spawn: 20:00 (new 2026 timing)

In those 6 minutes (14:00-20:00), the following objectives are live:
• Dragon stack (worth 150g global + permanent buff compounding)
• Herald eye usage (worth ~320-480g in plates)
• Baron vision setup

Each of these fought 4v5 instead of 5v5 reduces win probability by ~30-40%.
If you fight 3 objective contests 4v5 by staying in lane, that's roughly 3 × 35% worse odds = you nearly GAVE AWAY 1 full objective to the enemy through absence alone.

CS MATH: You can earn ~177g/min in lane (8 CS/min × ~22g avg). 
But an objective fight is worth 150-750g and potentially changes the game state permanently.
You cannot buy a Dragon stack with farm. You can only take it.`,
      why: `The lane phase ends at roughly 14 minutes because that's when the game transitions to objective control. Staying in lane past this point is playing the early game in a mid-game world. You're winning a battle (lane CS) while losing the war (objective control).`,
      fix: `
THE 14-MINUTE ALARM:
When your game clock hits 13:30, ask: "Is my wave crashed or crashing?" 
If yes: start rotating to Dragon or Herald right now.
If no: use the next 30 seconds to crash it, then immediately rotate.

RULE: After 14:00, you should not be farming alone in a side lane unless you are the designated split pusher AND are drawing 2+ enemies. If you're not drawing attention, group immediately.`,
    });
  }

  // 4. Baron vision
  if (log.baronVisionBy1830 === 'no') {
    issues.push({
      severity: 'major',
      category: 'vision',
      title: 'Baron Vision Not Established by 18:30',
      stat: 'Late vision setup on Baron',
      math: `
BARON SPAWNS AT 20:00. That is 5 minutes earlier than last season.

Your vision must be planted by 18:30 — 90 seconds before spawn.

WHY 90 SECONDS?
• Walking to Baron pit from mid: ~10-15 seconds
• Sweeping enemy wards in pit: ~10 seconds  
• Planting your wards: ~10 seconds
• Positioning your team: ~20-30 seconds
• Detecting enemy approach before they get there: needs 20+ seconds of ward visibility

If you plant wards at 19:45 instead of 18:30:
• You have 15 seconds of information instead of 90 seconds
• Enemy has likely already warded the pit with a Control Ward you cannot sweep in time
• They see your HP at all times during the Baron fight
• They know your Smite timing and can counter-smite perfectly

SMITE MATH:
Smite base damage at level 18: ~900
Baron HP at 20:00: ~8,690
Contested steal window: when Baron is between 800-1,200 HP (1 Smite range)
If they have a pit ward: they counter-Smite the moment yours would fire. You lose Baron.
If you have vision AND they don't: you set the Smite timing. You win Baron.`,
      why: `Vision is not just about seeing. It's about information asymmetry. The team with vision before the objective spawns is the team setting up the fight on their terms. You arrived to an information fight unarmed.`,
      fix: `
THE 18:30 RULE:
Set a mental trigger: when your clock hits 17:30, say "I need to be at Baron river in 1 minute."
At 18:30: your entire team should have stopped farming. No exceptions.

SUPPORT: This is your highest-priority job from 18:00 onward. Everything else waits.
JUNGLE: Your last camp before Baron must end by 18:00 so you can path to Baron river.
MID: Clear wave fast at 18:00 and walk directly to Baron. Do not farm under their tower.`,
    });
  }

  // 5. Post-fight conversion
  if (log.postFightFarmed != null && log.postFightObjectives != null) {
    const bad = parseInt(log.postFightFarmed || 0);
    const good = parseInt(log.postFightObjectives || 0);
    if (bad > 0) {
      issues.push({
        severity: bad >= 2 ? 'critical' : 'major',
        category: 'conversion',
        title: 'Missed Post-Fight Objective Windows',
        stat: `Farmed/recalled instead of converting: ${bad} times`,
        math: `
You won a fight ${bad} time(s) and chose to farm or recall instead of taking an objective.

WHAT YOU LEFT ON THE TABLE:
Level 13 enemy death timer: ~40 seconds.
Level 15 enemy death timer: ~47 seconds.

In 40 seconds you can:
• Take a full Dragon (requires ~30 seconds uncontested)
• Take 2-3 tower plates (160g split × 2-3 = 240-480g total)
• Take an outer tower (150-300g split + 50g global)
• Place 4-6 deep wards in their jungle

If you recalled instead:
• You gave up ~40 seconds of uncontested map control
• The enemy respawned before you returned from base
• The window is permanently closed

GOLD OPPORTUNITY COST:
Dragon global gold: 150g × 5 players = 750g total team value
+ permanent drake stack bonus (compounds every drake)
VS. what you farmed during that recall: ~177g × 1-2 waves = 177-354g for YOU alone.

Math: 750g team opportunity cost vs 177-354g personal gain.
You made a trade that costs your team more than it gains you.`,
        why: `The post-fight window is the highest-leverage moment in the game. Your enemies are dead and cannot stop you. Every second they're dead is free equity. Farming or recalling converts that equity into the smallest possible gain (your CS) and discards the largest possible gain (objectives).`,
        fix: `
THE POST-FIGHT PROTOCOL (do this in order, every time):
1. Count how many enemies died and what level they are. Set a mental timer.
2. Ask: "Can we end right now?" If yes, walk to Nexus immediately.
3. Ask: "Is Baron or Dragon up or within 90 seconds?" If yes, go directly there.
4. Ask: "Is there a tower in our path?" If yes, push it before recalling.
5. ONLY THEN consider recalling — and only if you're within 300g of a major item.

DRILL: In your next 5 games, commit to this rule: you are not allowed to recall for 45 seconds after winning a teamfight. Use those 45 seconds. Find something to take.`,
      });
    }
  }

  // 6. Deaths in fog
  if (log.deathsInFog != null && log.deaths != null) {
    const fog = parseInt(log.deathsInFog || 0);
    const total = parseInt(log.deaths || 1);
    const pct = total > 0 ? fog / total : 0;
    if (fog >= 1) {
      const goldGiven = fog * 300;
      const devalCost = fog * 120;
      issues.push({
        severity: fog >= 3 ? 'critical' : fog >= 2 ? 'major' : 'minor',
        category: 'vision',
        title: `${fog} Death${fog > 1 ? 's' : ''} to Unseen Enemies`,
        stat: `${fog} of ${total} deaths (${Math.round(pct * 100)}%) were avoidable with wards`,
        math: `
EACH FOG DEATH FULL COST BREAKDOWN:

1. BOUNTY GIVEN: ~300g per death to the enemy (varies by bounty)
   ${fog} fog deaths = ~${goldGiven}g given to enemy

2. YOUR OWN KILL GOLD DEVALUATION (2026 doubled system):
   Per 1g you give on death: -0.4g from your own base kill value
   300g given × 0.4 = ${Math.round(300 * 0.4)}g reduction to your next kill value
   ${fog} fog deaths = ~${devalCost}g in your own kill value permanently reduced this game

3. DEATH TIMER COST:
   At level 13: ~40 seconds dead
   ${fog} deaths × 40s = ${fog * 40} seconds where you are LITERALLY doing nothing
   Potential objectives in that time: ${fog >= 2 ? '1 Dragon per 2 deaths' : 'tower plates at minimum'}

4. TOTAL ECONOMIC DAMAGE FROM FOG DEATHS:
   ${goldGiven}g given + ${devalCost}g kill value lost = ~${goldGiven + devalCost}g swing against you
   
VISIBILITY RULE: If you cannot see 3 or more enemy champions on the minimap, you must not walk forward. This is not optional — it is math. You are betting your death timer and ~${Math.round((goldGiven + devalCost) / fog)}g against the probability that nobody is there.`,
        why: `Fog deaths are 100% preventable. Every single one is a ward placement decision that wasn't made. The enemy didn't outplay you — you gave them the ambush by removing information from your own decision-making. These deaths feel like bad luck. They are not.`,
        fix: `
THE VISIBILITY CHECK (before every forward step in fog):
1. Open your minimap. Count visible enemy champions.
2. If you see fewer than 4 enemies and your river is dark: STOP. Do not walk forward.
3. Place a ward or ping your team before moving through fog.

CONTROL WARD MATH: A Control Ward costs 75g. It prevents a ~${Math.round((goldGiven + devalCost) / fog)}g economic swing. The return on investment is ${Math.round(((goldGiven + devalCost) / fog) / 75)}x. No item in the game has better ROI than a placed Control Ward.

DRILL: For one game, make a rule: you cannot walk into fog-covered terrain without a ward there first or a teammate present. If it slows you down, that's the habit forming.`,
      });
    }
  }

  // 7. CS per minute
  if (log.csPerMin != null && log.role !== 'support') {
    const cs = parseFloat(log.csPerMin);
    const dur = parseFloat(log.gameDuration || 25);
    if (cs < BENCHMARKS.csPerMin.ok) {
      const goldLost = Math.round((BENCHMARKS.csPerMin.good - cs) * dur * 21);
      issues.push({
        severity: cs < BENCHMARKS.csPerMin.bad ? 'major' : 'minor',
        category: 'waves',
        title: 'CS Per Minute Below Threshold',
        stat: `${cs} CS/min vs ${BENCHMARKS.csPerMin.good}+ target`,
        math: `
CS/MIN GOLD VALUE:
Average CS value: ~21g per minion (melee ~21g, casters ~17g, cannons ~60g)
Your rate: ${cs} CS/min = ${Math.round(cs * 21)}g/min
Target rate: ${BENCHMARKS.csPerMin.good} CS/min = ${Math.round(BENCHMARKS.csPerMin.good * 21)}g/min

GOLD DEFICIT OVER ${dur} MINUTES:
(${BENCHMARKS.csPerMin.good} - ${cs}) CS/min × ${dur} min × 21g = ${goldLost}g left on the table

${goldLost}g is equivalent to:
• ${Math.round(goldLost / 400)} completed component items
• ${Math.round(goldLost / 1300)} half-legendary items  
• ${Math.round(goldLost / 3200)} full legendary items

WAVE MATH: A full wave is ~177g. Your CS deficit implies you missed roughly ${Math.round(goldLost / 177)} full waves this game. Each missed wave is a missed crash — which is a missed objective rotation opportunity.`,
        why: `Low CS/min almost always means one of two things: (1) you're leaving waves to go roam without priority, missing both the roam impact AND the wave gold, or (2) you're dying during the wave cycle and respawning into a dead wave. Both are fixable with wave management discipline.`,
        fix: `
CS IMPROVEMENT PROTOCOL:
1. Identify WHERE you're losing CS: in lane (poor last-hitting), or in rotation (missing waves entirely)?
2. In lane: last-hit only. Never push the wave unless you have a plan for that push.
3. In rotation: only leave lane when your wave is crashing (so the tower eats it). You lose 0 CS.

TARGET: 7.0+ CS/min as a floor. 8.0+ is the Challenger baseline.
The gap between 6.0 and 8.0 CS/min over a 30-minute game is ~1,260g. That's a full item component.`,
      });
    }
  }

  return issues.sort((a, b) => {
    const order = { critical: 0, major: 1, minor: 2 };
    return order[a.severity] - order[b.severity];
  });
}

// ── Multi-game pattern analysis ──────────────────────────────────
export function analyzePatterns(logs) {
  if (logs.length < 2) return [];

  const n = logs.length;
  const patterns = [];

  // Vision pattern
  const lowVision = logs.filter(l => l.visionPerMin != null && parseFloat(l.visionPerMin) < 1.0);
  if (lowVision.length / n >= 0.5) {
    patterns.push({
      type: 'recurring',
      title: 'Chronic Vision Problem',
      frequency: `${lowVision.length} of ${n} games`,
      message: `Your vision score is below 1.0/min in ${Math.round(lowVision.length / n * 100)}% of logged games. This is your highest-priority fix. Every other macro decision depends on information that you are consistently not generating.`,
    });
  }

  // Rotation pattern
  const missedRotation = logs.filter(l => l.rotatedAt14 === 'no');
  if (missedRotation.length / n >= 0.4) {
    patterns.push({
      type: 'recurring',
      title: 'Consistent Late Transition',
      frequency: `${missedRotation.length} of ${n} games`,
      message: `You fail to rotate out of lane by 14:00 in ${Math.round(missedRotation.length / n * 100)}% of games. This is a mechanical habit, not a situational mistake. Set a 13:30 alarm in your head every game without exception.`,
    });
  }

  // Wave crash pattern
  const poorCrash = logs.filter(l => ['rarely', 'never', 'sometimes'].includes(l.crashedBeforeObj));
  if (poorCrash.length / n >= 0.4) {
    patterns.push({
      type: 'recurring',
      title: 'Wave Management Before Objectives',
      frequency: `${poorCrash.length} of ${n} games`,
      message: `You are inconsistently crashing your wave before objectives in ${Math.round(poorCrash.length / n * 100)}% of games. This means you either arrive late or abandon the wave — both cost you gold and tempo simultaneously.`,
    });
  }

  // Post-fight conversion
  const poorConversion = logs.filter(l => parseInt(l.postFightFarmed || 0) > 0);
  if (poorConversion.length / n >= 0.4) {
    patterns.push({
      type: 'recurring',
      title: 'Post-Fight Conversion Failures',
      frequency: `${poorConversion.length} of ${n} games`,
      message: `You are missing post-fight conversion windows in ${Math.round(poorConversion.length / n * 100)}% of games. Winning fights and not taking objectives is the most common way to win battles and lose games. The death timer is your resource — spend it on objectives.`,
    });
  }

  // Win/loss rate
  const wins = logs.filter(l => l.result === 'win').length;
  const losses = logs.filter(l => l.result === 'loss').length;
  const winRate = Math.round(wins / n * 100);

  patterns.push({
    type: 'summary',
    title: 'Win Rate',
    frequency: `${wins}W ${losses}L`,
    message: `${winRate}% win rate across ${n} logged games. ${
      winRate >= 60 ? 'Strong win rate. Focus on eliminating your recurring mistakes to push it higher.' :
      winRate >= 50 ? 'Positive win rate. Fixing your top 2 recurring issues should move this significantly.' :
      winRate >= 40 ? 'Below 50%. Your macro mistakes are directly costing you games. Prioritize the critical issues.' :
      'The recurring issues identified above are almost certainly the primary driver of these losses. Fix the highest-severity issue first before addressing anything else.'
    }`,
  });

  return patterns;
}

// ── Render helpers ───────────────────────────────────────────────
export function severityColor(sev) {
  return { critical: 'var(--r)', major: 'var(--g)', minor: 'var(--bl)' }[sev] || 'var(--td)';
}
export function severityLabel(sev) {
  return { critical: 'CRITICAL', major: 'MAJOR', minor: 'MINOR' }[sev] || sev.toUpperCase();
}
export function categoryIcon(cat) {
  return { vision: '👁', waves: '🌊', rotation: '🔄', conversion: '⚡', economy: '💰' }[cat] || '⚠';
}
