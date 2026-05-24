// ══════════════════════════════════════════════════
// DATA.JS — All game data. Edit here, not in HTML.
// Patch 26.7 / Season 2026 S1
// ══════════════════════════════════════════════════

export const OBJECTIVES = [
  { name: 'Dragon',                firstSpawn: '5:00',      respawn: '+6:00 after death',  special: '4th drake triggers Elder Dragon',            setupBy: '3:30'   },
  { name: 'Elder Dragon',          firstSpawn: 'After drake 4', respawn: '+6:00 after death', special: 'Execute + all drake buffs active',        setupBy: 'T − 1:30' },
  { name: 'Void Grubs (Wave 1)',   firstSpawn: '6:00',      respawn: 'Wave 2 @ 10:00',     special: 'Killed before 9:45 triggers Wave 2',         setupBy: '4:30'   },
  { name: 'Rift Herald',           firstSpawn: '6:00',      respawn: 'No respawn',          special: 'Despawns ~19:45 if untouched',               setupBy: '4:30'   },
  { name: 'Baron Nashor ⚠ 2026',  firstSpawn: '20:00',     respawn: '+6-7 min after death', special: 'Was 25:00. 650 global XP new reward.',       setupBy: '18:30', highlight: true },
];

export const CAMPS = [
  { name: 'Red / Blue Buff',     spawn: '5:00',    respawn: '+5:00' },
  { name: 'Small Camps',         spawn: '1:30',    respawn: '+2:15' },
  { name: 'Scuttle Crab',        spawn: '3:30',    respawn: '+2:30' },
  { name: 'Buff Invade Windows', spawn: '6:30 / 11:30 / 16:30', respawn: '' },
  { name: 'Minions (2026 new)',  spawn: '0:30',    respawn: 'was 1:05', highlight: true },
];

export const DEATH_TIMERS = [
  { level: 6,  seconds: 12,  color: 'green' },
  { level: 8,  seconds: 20,  color: 'gold'  },
  { level: 9,  seconds: 25,  color: 'gold'  },
  { level: 11, seconds: 32,  color: 'gold'  },
  { level: 13, seconds: 40,  color: 'red'   },
  { level: 16, seconds: 50,  color: 'red'   },
  { level: 18, seconds: 55,  color: 'red'   },
];

export const SUMMONER_SPELLS = [
  { name: 'Flash',              cd: '5:00',  note: 'highest priority'  },
  { name: 'Teleport → Tower',   cd: '4:00',  note: ''                  },
  { name: 'Teleport → Non-tower', cd: '5:00', note: ''                 },
  { name: 'Teleport Cancelled', cd: '3:20',  note: ''                  },
  { name: 'Ghost / Ignite / Exhaust', cd: '3:30', note: ''             },
  { name: 'Smite',              cd: '~15s',  note: 'track for Baron'   },
];

export const OBJECTIVE_GOLD = [
  { name: 'Baron Nashor',    kill: '100g', global: '150g global', xp: '650 XP global', value: 'Minion buff + team level spike', priority: 'S' },
  { name: 'Elder Dragon',    kill: '~300g', global: 'small', xp: '—', value: 'Execute + all drake buffs combined', priority: 'S+' },
  { name: 'Elemental Drake', kill: '100-150g', global: 'small', xp: '—', value: 'Stack bonuses compound per drake taken', priority: 'S' },
  { name: 'Rift Herald',     kill: '100g', global: '—', xp: '—', value: 'Eye → 2-3 plates (~480g value)', priority: 'A' },
  { name: 'Tower Plate',     kill: '160g split', global: '—', xp: '—', value: 'Permanent now — even base towers', priority: 'B' },
  { name: 'Outer Tower',     kill: '150-300g split', global: '50g global', xp: '—', value: 'Map access + sustained dominance', priority: 'A' },
  { name: 'Inhibitor',       kill: '50g', global: '25g global', xp: '—', value: 'Super minions = perpetual siege', priority: 'S' },
];

export const WAVE_STATES = [
  {
    type: 'freeze', name: 'Freeze',
    desc: '3-5 more enemy minions near your tower. Enemy must walk into danger to farm. You are safe. They bleed gold and XP.',
    when: 'Won lane, their jungler nearby, protecting a lead, or baiting a dive.',
    how:  'Kill only enough to maintain the ratio. Never over-kill. Cannon waves break freezes — kill cannon early.',
  },
  {
    type: 'slow', name: 'Slow Push',
    desc: 'Kill casters first. Let melee minions stack. Wave grows large automatically, creating a crashing window.',
    when: 'Before an objective spawn, before a roam, or to create a crash timing window.',
    how:  'Kill casters early each wave cycle. Last-hit only. Wave inflates over 30-60 seconds.',
  },
  {
    type: 'crash', name: 'Crash',
    desc: 'Full-clear everything into their tower. Tower kills their minions. Enemy loses CS if absent. You gain free tempo.',
    when: '30-40s before objective, before recalling, after kills, before roaming, to deny TP value.',
    how:  'Hard clear every minion. Push to tower. Leave as it crashes. Every crash = tempo window.',
  },
  {
    type: 'bounce', name: 'Bounce',
    desc: 'After a crash, enemy wave rebuilds and pushes toward you naturally. Safe setup for a freeze or farm window.',
    when: 'Automatically happens after any crash. Use the window (recall, ward, roam).',
    how:  'Nothing — wave handles itself. Return in time to collect the incoming wave.',
  },
];

export const WIN_CONDITIONS = {
  scale: {
    name: 'Scale and 5v5', peak: '25-35 min', deny: 'Early fights before spike',
    plan: 'Farm safely to your two-item spike. Avoid 5v5 fights before two full items. Play defensive waves if behind. At 20+ min group and force fights on YOUR terms around objectives. Never let them split-push you apart before your power window opens.',
  },
  pick: {
    name: 'Pick Comp', peak: 'All game with vision', deny: 'Enemy grouping as 5',
    plan: 'Deep ward their jungle constantly. Bait with one player, collapse with four from multiple angles. Always move in groups of 3-5 — never alone in fog. Every pick converts directly to a 5v4 objective. Win condition dies if they always have all five grouped.',
  },
  split: {
    name: 'Split Push', peak: 'When your 1v1 wins', deny: 'Enemy forcing 5v5',
    plan: 'One champion splits constantly and must draw 2 enemies or the pattern fails. Group only for Baron, Elder, or when split draws zero response. Never give up the side lane without gaining something concrete on the other side of the map.',
  },
  engage: {
    name: 'Hard Engage', peak: '15-25 min', deny: 'Enemy peeling your engage',
    plan: 'Force fights at 15-25 min before their scaling comes online. Establish vision so your engage is not wasted into fog. Use Dragon fights as engage opportunities — your AoE wins there. Commit the moment your setup lands — never poke for 10 min then engage.',
  },
  siege: {
    name: 'Siege and Poke', peak: 'Around objectives', deny: 'Enemy diving you',
    plan: 'Push towers at every objective — never 5v5 when you can siege instead. Position at max range. Use waves and minion advantage to prevent them walking up safely. Save burst for when they advance. Disengage immediately if they hard-engage and re-siege from safety.',
  },
};

export const MAP_PATTERNS = [
  {
    name: '1-3-1 Split',
    desc: 'One splits top, one splits bot, three control mid and vision. Side laners must draw attention or the pattern fails. Group only for Baron, Elder, or a decisive fight.',
    use:  'Use when: Two champions who can 1v1/1v2 in side lanes and disengage safely.',
    math: 'Drawing 2 enemies + 4 take Baron = net win. Drawing 0 = group immediately.',
  },
  {
    name: '4-1 Death Push',
    desc: 'One splits drawing a response, four group mid to siege or wait for picks. The solo player must create a 2v1 or threaten a tower or the pattern accomplishes nothing.',
    use:  'Use when: Fed tank or bruiser who can split endlessly and TP back to big fights.',
    math: '1 draws 2 = 4v3 mid advantage. 1 draws 0 = group immediately.',
  },
  {
    name: '5v5 Grouping',
    desc: 'Everyone pushes mid together to force a fight, siege, or objective. Works when you\'re decisively ahead or your comp needs all five to activate its win condition.',
    use:  'Use when: AoE teamfight comp, or so far ahead individual plays carry no risk.',
    math: 'Every second grouped without taking a tower = wasted GPM across all five players.',
  },
  {
    name: 'Pick and Flank',
    desc: 'Deep vision, bait with one player, collapse with four on an isolated target. Requires excellent vision control around the bait point and reliable CC to lock the target.',
    use:  'Use when: Assassins, engage supports, any comp whose win condition is "kill one, take everything."',
    math: '1 pick = 5v4 for 25-40s = guaranteed objective if you convert immediately.',
  },
];

// ── CHECKLISTS ──
// Each item: { id, text, sub, numColor? }

export const CHECKLISTS = {
  pregame: {
    title: 'Pre-Game Decisions',
    items: [
      { id: 'pg1', num: '01', text: 'What is OUR win condition?', sub: 'Scale / Pick / Split / Engage / Siege. One answer. Commit. If you cannot name it, you do not have one.' },
      { id: 'pg2', num: '02', text: 'What is THEIR win condition?', sub: 'Scale = force early fights. Engage = deny their vision. Pick = group up and never roam solo.' },
      { id: 'pg3', num: '03', text: 'When does our comp peak vs theirs?', sub: 'Peak before them = fight on your timeline. Peak after = stall to your window, deny their early fights.' },
      { id: 'pg4', num: '04', text: 'What is my matchup expectation?', sub: 'Favored = aggressive for kills and priority. Unfavored = safe farm and scale, deny their pressure.' },
      { id: 'pg5', num: '05', text: 'Do I know my Role Quest objective?', sub: 'Season 2026 — every role has a lane-phase quest with a real power spike. Know what yours requires.' },
    ],
  },
  laning: {
    title: '2-Minute Lane Scan',
    items: [
      { id: 'ln1', num: '→', text: 'What is my wave state and is it where I want it?', sub: 'Pushed = roam priority open. Frozen = denying them. Crashing = tempo window. Bouncing = collect safely.' },
      { id: 'ln2', num: '→', text: 'Where is the enemy jungler right now?', sub: 'Unseen for 90s and river dark = respect the gank. Pull back. Do not be greedy for one more CS.' },
      { id: 'ln3', num: '→', text: 'Is an objective spawning in the next 2 minutes?', sub: 'If yes: crash wave now. Arriving with priority 30s before spawn = you control the objective fight.' },
      { id: 'ln4', num: '→', text: 'What are the enemy summoner spell cooldowns?', sub: 'No Flash (5 min) = you can all-in, dive, or roam safely. Track from the moment it gets burned.' },
      { id: 'ln5', num: '→', text: 'Should I recall — healthy and at a gold threshold?', sub: 'Below 40% HP with wave crashed = recall. Staying low for 2 more CS is a false economy every time.' },
      { id: 'ln6', num: '→', text: 'Am I progressing my Role Quest objective?', sub: '2026 quest spike is real. Play actively toward completing it — and track when the enemy completes theirs.' },
      { id: 'ln7', num: '→', text: 'What am I doing with my next wave crash?', sub: 'Every crash needs a plan: recall / roam / objective / vision / dive. "Nothing" is not acceptable.' },
    ],
  },
  postfight: {
    title: 'Post-Fight Conversion',
    items: [
      { id: 'pf1', num: '1', text: 'Count enemy death timers — how long is the window?', sub: 'Level 13 = ~40s. Level 15 = ~47s. Start counting from the kill. That is your conversion window.' },
      { id: 'pf2', num: '2', text: 'Can we end the game right now?', sub: 'If yes: go. Skip everything else. Nothing matters more than the game ending immediately.' },
      { id: 'pf3', num: '3', text: 'Highest priority objective in reach?', sub: 'Order: End the game → Baron → Dragon → Tower. Take the highest thing you can reach in time.' },
      { id: 'pf4', num: '4', text: 'Is there a tower in our direct path?', sub: 'Always push in the direction of the fight. Never regroup across the whole map empty-handed.' },
      { id: 'pf5', num: '5', text: 'Within 300 gold of a major item spike?', sub: 'If objectives are clear and you are 300g from a spike: recall, buy, return before the next window.' },
      { id: 'pf6', num: '6', text: 'Side waves building up unattended?', sub: 'Crash side waves before regrouping. Lost side waves compound against you silently every minute.' },
    ],
  },
  behind: {
    title: 'Deficit Playbook',
    items: [
      { id: 'bh1', num: '✕', numColor: 'red', text: 'Stop fighting in fog of war', sub: 'All-ins when behind = feeding bounties. Every blind fight compounds the deficit through doubled devaluation.' },
      { id: 'bh2', num: '✕', numColor: 'red', text: 'Do not 5v5 fight for Baron — zone with threat only', sub: 'Stand at pit entrance. Force their early smite. One steal flip beats five lost Baron fights.' },
      { id: 'bh3', num: '✓', numColor: 'green', text: 'Freeze lanes under your towers and farm back in', sub: 'Deny them free farm while safely scaling. Freezing is strategic denial — not passive play.' },
      { id: 'bh4', num: '✓', numColor: 'green', text: 'Look for picks with deep vision — not straight fights', sub: 'Deep ward → wait for isolated target → collapse → 5v4 objective. That is your path back in.' },
      { id: 'bh5', num: '✓', numColor: 'green', text: 'Remember comeback XP is linear and aggressive in 2026', sub: 'You close level gaps faster now. A stolen Baron + 650 XP + buff can flip unwinnable games.' },
      { id: 'bh6', num: '✓', numColor: 'green', text: 'Identify who can still win and protect them', sub: 'Even when behind, someone has the smallest deficit. Fund them, protect them, stop soloing.' },
    ],
  },
  endgame: {
    title: 'Game Closer',
    items: [
      { id: 'eg1', num: '1', text: 'After Baron: push nearest inhibitor lane with empowered minions now', sub: 'Do not group in jungle. Do not look for fights. Buff is a siege tool — apply it to a tower.' },
      { id: 'eg2', num: '2', text: 'After inhibitor: use super minion pressure to force a favorable fight', sub: 'Super minions force them to defend. Pick the fight angle you want — not the one they choose.' },
      { id: 'eg3', num: '3', text: 'Two inhibitors = Elder Dragon is absolute top priority', sub: 'Two inhibs + Elder buff = the game is over. Rotate to Elder immediately and take it.' },
      { id: 'eg4', num: '✕', numColor: 'red', text: 'Do NOT recall with Baron buff still ticking', sub: 'Every second in base with buff active is tempo thrown away. Fountain only if no other option.' },
      { id: 'eg5', num: '✕', numColor: 'red', text: 'Do NOT look for fights in fog just because you have buff', sub: 'Baron buff wins sieges not fights. Push the tower. Do not brawl in their jungle.' },
    ],
  },
  baron: {
    title: 'Baron Setup Checklist',
    items: [
      { id: 'bn1', num: '✓', numColor: 'green', text: 'Vision on both river entrances and pit flanks established', sub: 'Missing any entrance = they engage from an angle you cannot defend. No exceptions.' },
      { id: 'bn2', num: '✓', numColor: 'green', text: 'Enemy wards inside the pit have been swept clean', sub: 'Their pit ward = perfect smite counter info. Sweep before starting or you gift the steal.' },
      { id: 'bn3', num: '✓', numColor: 'green', text: 'Side waves are pushed into their towers', sub: 'Makes contesting costly — they lose CS and plates simultaneously if they leave to fight.' },
      { id: 'bn4', num: '✓', numColor: 'green', text: 'We have a numbers advantage (they are 1-2 down)', sub: '5v5 Baron fights are coin flips. Numbers advantages make them executes.' },
      { id: 'bn5', num: '✓', numColor: 'green', text: 'Smite is available or Baron is at 30% HP', sub: 'No smite when contested = gifting the steal. Have smite or start early enough to finish uncontested.' },
      { id: 'bn6', num: '✕', numColor: 'red', text: 'Our waves are NOT currently crashing into our towers', sub: 'Waves crashing into your towers while contesting Baron = losing both Baron AND structures.' },
    ],
  },
  roam: {
    title: 'Roam Readiness — All 5 Must Be True',
    items: [
      { id: 'rm1', num: '✓', numColor: 'green', text: 'Wave is crashing or already crashed into their tower', sub: 'If wave is pushing TO you → stay. ~200g and 500 XP lost per missed wave.' },
      { id: 'rm2', num: '✓', numColor: 'green', text: 'You have lane priority — enemy pushed in or recalled', sub: 'No priority = you arrive late and the fight is already decided. Wasted wave for zero impact.' },
      { id: 'rm3', num: '✓', numColor: 'green', text: 'There is a confirmed objective or kill opportunity', sub: 'Roaming to "see what happens" is not a plan. Know your destination before leaving lane.' },
      { id: 'rm4', num: '✓', numColor: 'green', text: 'You have enough HP to fight when you arrive', sub: '60% HP roam = two kills fed instead of one. Recall first if needed — wave will still be there.' },
      { id: 'rm5', num: '✓', numColor: 'green', text: 'You can physically walk there in time to matter', sub: 'Bot to top = ~20s walk. Calculate it. Fight ends before you arrive: TP or don\'t go.' },
    ],
  },
  mistakes: {
    title: 'Common Mistakes — Check If You Did This',
    items: [
      { id: 'er01', num: '!', numColor: 'red', text: 'Did not crash wave before an objective spawn', sub: 'Arrived late without wave priority — gave enemy free setup time.' },
      { id: 'er02', num: '!', numColor: 'red', text: 'Farmed in lane past 14 min while team fought objectives', sub: 'Failed to transition out of laning phase — left team 4v5.' },
      { id: 'er03', num: '!', numColor: 'red', text: 'Did not set up Baron vision before 18:30', sub: 'Lost the vision war on Baron before it spawned — enemy had perfect info advantage.' },
      { id: 'er04', num: '!', numColor: 'red', text: 'Took Baron but did not siege immediately', sub: 'Grouped in jungle or looked for fights — bled entire buff timer into nothing.' },
      { id: 'er05', num: '!', numColor: 'red', text: 'Won a fight but converted nothing from it', sub: 'Walked empty-handed from a winning teamfight — wasted the entire death timer window.' },
      { id: 'er06', num: '!', numColor: 'red', text: 'Recalled on a bad wave state and lost CS or XP', sub: 'Recalled when wave was pushing toward me — lost incoming gold and experience.' },
      { id: 'er07', num: '!', numColor: 'red', text: 'Did not know where 3+ enemies were before walking forward', sub: 'Died to an ambush one ward placed 90s earlier would have prevented.' },
      { id: 'er08', num: '!', numColor: 'red', text: 'Took a 5v5 Baron fight while behind instead of zoning', sub: 'Should have zoned and threatened a smite steal — not fought head-on from disadvantage.' },
      { id: 'er09', num: '!', numColor: 'red', text: 'Roamed without wave priority and the roam failed', sub: 'Left lane when wave was pushing toward me — lost wave gold and the roam both.' },
      { id: 'er10', num: '!', numColor: 'red', text: 'Did not track enemy death timers after winning a fight', sub: 'Did not know how long the window was — missed the available objective from slow reaction.' },
    ],
  },

  // Role checklists
  top: {
    title: 'Top Lane Macro Order',
    items: [
      { id: 'tp1', num: '01', text: 'At 14:00: crash top wave and rotate to Herald or Dragon', sub: 'Sitting in top lane past 14 min while team contests objectives = you are a liability, not a player.' },
      { id: 'tp2', num: '02', text: 'After every objective: TP back to top and continue split pressure', sub: 'The single biggest thing Challenger top laners do that Gold players miss. TP creates a second self.' },
      { id: 'tp3', num: '03', text: 'Decide: am I the split threat or the teamfighter?', sub: 'Split: 1-3-1 all game, only group for Baron/Elder. Teamfight: group at 15 min and anchor frontline.' },
      { id: 'tp4', num: '04', text: 'Teleport math: use it for real value, not ego saves', sub: 'TP to tower = ~160g + crash + rotate. TP to a dying fight = two people fed and a 4-min CD wasted.' },
      { id: 'tp5', num: '05', text: 'Collect tower plates constantly — permanent in 2026', sub: 'Plates are permanent now including base towers. Farm them all game: 800-1200g advantage vs. those who ignore them.' },
      { id: 'tp6', num: '06', text: 'Check: how many enemies are responding to my split?', sub: 'Two or more responding: stay and draw them. Zero responding: stop splitting. You are useless. Group.' },
    ],
  },
  bot: {
    title: 'ADC Macro Order',
    items: [
      { id: 'bt1', num: '01', text: 'At 14:00: crash bot wave and rotate to Dragon', sub: 'Bot lane is Dragon side. You set up nearly every Dragon fight. This is your macro role after laning.' },
      { id: 'bt2', num: '02', text: 'After Dragon: never sit in bot lane farming alone', sub: 'Group at mid or apply top pressure. Farming bot solo when the map is active = you are irrelevant.' },
      { id: 'bt3', num: '03', text: 'Siege play: use range advantage to chip towers, not to duel', sub: 'Your job in sieges is hitting the tower while your team zones. Hitting their frontline = you die.' },
      { id: 'bt4', num: '04', text: 'Teamfights: max range, hit the nearest valid target', sub: 'Nearest target is the correct target. Repositioning to reach their carry = you die before one auto.' },
      { id: 'bt5', num: '05', text: 'When you are the win condition: survive first, play second', sub: 'Most gold on team = your job is dealing damage and not dying. You are the weapon, not the trigger.' },
      { id: 'bt6', num: '06', text: 'Kite every fight — auto then move, auto then move', sub: 'Every ADC who dies in teamfights stopped moving. Auto-attack then move back. Never stand still.' },
    ],
  },
  jungle: {
    title: 'Jungle Macro Loop',
    items: [
      { id: 'jg1', num: '01', text: 'Void Grubs at 6:00 — route your first clear to arrive there', sub: 'Six Grubs = maximum Voidmite tower push pressure. Missing them is a significant macro error.' },
      { id: 'jg2', num: '02', text: 'Track enemy jungler position at all times', sub: 'Enemy seen top side = Dragon and bot are free. Ping bot immediately. Enemy seen bot = top is free.' },
      { id: 'jg3', num: '03', text: 'Set up objectives 60 seconds early — Smite must be ready', sub: 'Smite on cooldown when Baron spawns = you auto-lose all contested Baron fights.' },
      { id: 'jg4', num: '04', text: 'Baron vision established by 18:30 — not at 19:45', sub: '5 minutes earlier than last season. Routing to Baron at 19:30 means you are already late.' },
      { id: 'jg5', num: '05', text: 'Path toward the next objective — not the easiest camp', sub: 'Easy camp is a trap. Clear camps that position you correctly — not camps that are convenient.' },
      { id: 'jg6', num: '06', text: 'After every gank: what objective can I take with this advantage?', sub: 'Gank → kill → take the nearby objective immediately. Never gank and farm without converting tempo.' },
    ],
  },
  support: {
    title: 'Support Macro Order',
    items: [
      { id: 'sp1', num: '01', text: 'Vision score 2.0+ per minute — this is your primary job', sub: 'Vision score under 1.0/min means you are not doing your job regardless of assists or healing.' },
      { id: 'sp2', num: '02', text: 'At 14:00: roam to Dragon setup with your jungler', sub: 'Your ADC loses one wave. Dragon is worth multiple waves. This trade is always correct.' },
      { id: 'sp3', num: '03', text: 'After any fight win: deep ward their jungle immediately', sub: 'Dead enemies = free warding window. This is your single most valuable action in that moment.' },
      { id: 'sp4', num: '04', text: 'Keep your carry alive through peel — not by engaging first', sub: 'Dying "for your carry" = no peel and they die anyway. Stand behind them. Peel what reaches them.' },
      { id: 'sp5', num: '05', text: 'Buy one Control Ward every single recall without exception', sub: '75 gold. Highest gold efficiency in the game. Not buying one = playing without available information.' },
      { id: 'sp6', num: '06', text: 'Baron river wards placed by 18:30 on every game', sub: 'Baron spawns at 20:00. Planting at 19:45 = you already lost the vision war before it started.' },
    ],
  },
  mid: {
    title: 'Mid Lane Macro Order',
    items: [
      { id: 'md1', num: '01', text: 'Slow push mid then crash then roam with priority', sub: 'Core mid-lane macro pattern. Repeat every 2-3 minutes throughout the laning phase without deviation.' },
      { id: 'md2', num: '02', text: 'Roam window: levels 6-14 around your ultimate cooldown', sub: 'After 14 min, staying in lane has diminishing returns unless you have TP. Roam around ult timing.' },
      { id: 'md3', num: '03', text: 'Hold mid priority so your team can set up objectives safely', sub: 'Mid priority = your jungle and support can set up Dragon without fear of enemy mid roaming.' },
      { id: 'md4', num: '04', text: 'Enemy mid roamed? Push their mid tower — do not follow', sub: 'Enemy mid left for bot: push mid tower. If you follow, you both lose your lanes for no gain.' },
      { id: 'md5', num: '05', text: 'Post-14: become the team\'s objective anchor and shotcaller', sub: 'Mid is central geographically. Use that position to call rotations and set up every objective play.' },
    ],
  },
};
