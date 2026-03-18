import { useState, useEffect, useRef } from "react";

const getStoredApiKey = () => {
  try { return localStorage.getItem("nfl-scout-api-key") || ""; } catch { return ""; }
};

const NFL_TEAMS = [
  { abbr: "ARI", name: "Arizona Cardinals", conf: "NFC", div: "West", color: "#97233F", alt: "#FFB612" },
  { abbr: "ATL", name: "Atlanta Falcons", conf: "NFC", div: "South", color: "#A71930", alt: "#000000" },
  { abbr: "BAL", name: "Baltimore Ravens", conf: "AFC", div: "North", color: "#241773", alt: "#9E7C0C" },
  { abbr: "BUF", name: "Buffalo Bills", conf: "AFC", div: "East", color: "#00338D", alt: "#C60C30" },
  { abbr: "CAR", name: "Carolina Panthers", conf: "NFC", div: "South", color: "#0085CA", alt: "#101820" },
  { abbr: "CHI", name: "Chicago Bears", conf: "NFC", div: "North", color: "#0B162A", alt: "#C83803" },
  { abbr: "CIN", name: "Cincinnati Bengals", conf: "AFC", div: "North", color: "#FB4F14", alt: "#000000" },
  { abbr: "CLE", name: "Cleveland Browns", conf: "AFC", div: "North", color: "#311D00", alt: "#FF3C00" },
  { abbr: "DAL", name: "Dallas Cowboys", conf: "NFC", div: "East", color: "#003594", alt: "#869397" },
  { abbr: "DEN", name: "Denver Broncos", conf: "AFC", div: "West", color: "#FB4F14", alt: "#002244" },
  { abbr: "DET", name: "Detroit Lions", conf: "NFC", div: "North", color: "#0076B6", alt: "#B0B7BC" },
  { abbr: "GB", name: "Green Bay Packers", conf: "NFC", div: "North", color: "#203731", alt: "#FFB612" },
  { abbr: "HOU", name: "Houston Texans", conf: "AFC", div: "South", color: "#03202F", alt: "#A71930" },
  { abbr: "IND", name: "Indianapolis Colts", conf: "AFC", div: "South", color: "#002C5F", alt: "#A2AAAD" },
  { abbr: "JAX", name: "Jacksonville Jaguars", conf: "AFC", div: "South", color: "#006778", alt: "#D7A22A" },
  { abbr: "KC", name: "Kansas City Chiefs", conf: "AFC", div: "West", color: "#E31837", alt: "#FFB81C" },
  { abbr: "LAC", name: "LA Chargers", conf: "AFC", div: "West", color: "#0080C6", alt: "#FFC20E" },
  { abbr: "LAR", name: "LA Rams", conf: "NFC", div: "West", color: "#003594", alt: "#FFA300" },
  { abbr: "LV", name: "Las Vegas Raiders", conf: "AFC", div: "West", color: "#000000", alt: "#A5ACAF" },
  { abbr: "MIA", name: "Miami Dolphins", conf: "AFC", div: "East", color: "#008E97", alt: "#FC4C02" },
  { abbr: "MIN", name: "Minnesota Vikings", conf: "NFC", div: "North", color: "#4F2683", alt: "#FFC62F" },
  { abbr: "NE", name: "New England Patriots", conf: "AFC", div: "East", color: "#002244", alt: "#C60C30" },
  { abbr: "NO", name: "New Orleans Saints", conf: "NFC", div: "South", color: "#101820", alt: "#D3BC8D" },
  { abbr: "NYG", name: "New York Giants", conf: "NFC", div: "East", color: "#0B2265", alt: "#A71930" },
  { abbr: "NYJ", name: "New York Jets", conf: "AFC", div: "East", color: "#125740", alt: "#000000" },
  { abbr: "PHI", name: "Philadelphia Eagles", conf: "NFC", div: "East", color: "#004C54", alt: "#A5ACAF" },
  { abbr: "PIT", name: "Pittsburgh Steelers", conf: "AFC", div: "North", color: "#101820", alt: "#FFB612" },
  { abbr: "SEA", name: "Seattle Seahawks", conf: "NFC", div: "West", color: "#002244", alt: "#69BE28" },
  { abbr: "SF", name: "San Francisco 49ers", conf: "NFC", div: "West", color: "#AA0000", alt: "#B3995D" },
  { abbr: "TB", name: "Tampa Bay Buccaneers", conf: "NFC", div: "South", color: "#D50A0A", alt: "#FF7900" },
  { abbr: "TEN", name: "Tennessee Titans", conf: "AFC", div: "South", color: "#0C2340", alt: "#4B92DB" },
  { abbr: "WAS", name: "Washington Commanders", conf: "NFC", div: "East", color: "#5A1414", alt: "#FFB612" },
];

const POSITIONS = [
  {
    group: "Offense",
    color: "#2563eb",
    roles: [
      { id: "QB",  label: "Quarterback",      icon: "🎯", desc: "Pass rush, blitz packages, coverage shells" },
      { id: "WR",  label: "Wide Receiver",     icon: "⚡", desc: "CB matchups, coverage tendencies, safety depth" },
      { id: "TE",  label: "Tight End",         icon: "🔗", desc: "LB/S coverage, run-force, underneath zones" },
      { id: "RB",  label: "Running Back",      icon: "🏃", desc: "Box counts, gap integrity, LB pursuit speed" },
      { id: "OL",  label: "Offensive Lineman", icon: "🧱", desc: "DL alignments, stunts, interior pass rush" },
    ]
  },
  {
    group: "Defense",
    color: "#dc2626",
    roles: [
      { id: "CB",   label: "Cornerback",       icon: "🔒", desc: "WR route trees, separation rates, targets" },
      { id: "S",    label: "Safety",            icon: "🦅", desc: "TE usage, deep ball rate, crossing patterns" },
      { id: "LB",   label: "Linebacker",        icon: "💥", desc: "RB tendencies, OL run schemes, screen game" },
      { id: "DL",   label: "Defensive Lineman", icon: "🛡️", desc: "OL pass sets, run blocking gaps, double teams" },
      { id: "EDGE", label: "Edge Rusher",       icon: "🌪️", desc: "OT pass set tendencies, QB mobility, slide protection" },
    ]
  },
  {
    group: "Coordinators & Head Coach",
    color: "#7c3aed",
    roles: [
      { id: "HC",   label: "Head Coach",           icon: "🏆", desc: "All phases, game management, situational tendencies" },
      { id: "OC",   label: "Offensive Coord.",      icon: "📋", desc: "Full defensive scheme, personnel, blitz rates, coverage shells" },
      { id: "DC",   label: "Defensive Coord.",      icon: "📊", desc: "Full offensive scheme, formations, red zone, pace of play" },
      { id: "STC",  label: "Special Teams Coord.",  icon: "⭐", desc: "Return units, coverage speed, kicker/punter NGS data" },
    ]
  },
  {
    group: "Positional Coaches",
    color: "#0369a1",
    roles: [
      { id: "QB_COACH",  label: "QB Coach",          icon: "🎯", desc: "Opp. pass rush tendencies, coverage disguises, blitz ID" },
      { id: "WR_COACH",  label: "WR Coach",           icon: "⚡", desc: "CB press rates, off-coverage tendencies, safety rotations" },
      { id: "OL_COACH",  label: "OL Coach",           icon: "🧱", desc: "DL stunts, twist games, pass rush win rates, gap schemes" },
      { id: "RB_COACH",  label: "RB Coach",           icon: "🏃", desc: "Defensive box counts, pursuit angles, blitz pickup keys" },
      { id: "TE_COACH",  label: "TE Coach",           icon: "🔗", desc: "LB/S matchups, coverage vs inline vs slot TE alignments" },
      { id: "DB_COACH",  label: "DB Coach",           icon: "🔒", desc: "Opp. WR routes, air yards targets, receiver separation data" },
      { id: "LB_COACH",  label: "LB Coach",           icon: "💥", desc: "Opp. run gap tendencies, screen usage, RB release patterns" },
      { id: "DL_COACH",  label: "DL Coach",           icon: "🛡️", desc: "OL blocking schemes, double teams, run gap assignments" },
    ]
  },
];

const POSITION_SYSTEM_PROMPT = `You are an elite NFL analytics assistant generating hyper-personalized pre-game intelligence for a specific player or coach role. You produce focused, actionable scouting data tailored exactly to what that position needs to know.

Respond ONLY with valid JSON — no markdown, no preamble. Be concise: keep each "summary" under 2 sentences, each "insight" under 20 words, each "context" under 10 words, each "relevance" under 15 words, each tip under 20 words. Limit to 3 stats and 3 players per section. Structure:

{
  "positionRole": "e.g. Wide Receiver",
  "opponentTeam": "Full team name",
  "matchupGrade": "A+|A|A-|B+|B|B-|C+|C|C-|D",
  "matchupSummary": "2-3 sentence personalized summary of what this player/coach faces",
  "topPriority": "The single most important thing to know going into this game (1-2 sentences)",
  "sections": [
    {
      "title": "Section title relevant to this position",
      "icon": "single emoji",
      "accentColor": "#hexcolor",
      "summary": "2-3 sentence analysis",
      "stats": [
        {"label": "stat name", "value": "value", "trend": "up|down|neutral", "context": "brief context", "relevance": "why this matters to THIS position specifically"}
      ],
      "players": [
        {"name": "Opponent player name", "position": "position", "insight": "specific matchup note relevant to this role", "threat": "high|medium|low"}
      ],
      "keyTips": ["Specific actionable tip 1", "Specific actionable tip 2", "Specific actionable tip 3"]
    }
  ],
  "situationalEdges": [
    {"situation": "e.g. 3rd & Long", "insight": "what this opponent tends to do in this situation that directly impacts this position"},
    {"situation": "e.g. Red Zone", "insight": "specific tendencies"},
    {"situation": "e.g. 2-Minute Drill", "insight": "specific tendencies"},
    {"situation": "e.g. Opening Drive", "insight": "specific tendencies"}
  ],
  "watchFilmFocus": ["Specific film study focus 1", "Specific film study focus 2", "Specific film study focus 3"],
  "personalGameplan": "A direct 3-4 sentence personal gameplan note written in second person ("You should...") specifically for this position vs this opponent"
}

POSITION-SPECIFIC FOCUS RULES:
- QB: Pass rush win rates, blitz packages & frequencies, coverage shells, DB athleticism, disguised pre-snap coverages
- WR: CB matchups by name, man vs zone %, press coverage rate, CB separation allowed, safety help depth over top
- TE: LB coverage grades vs TE, S matchups, underneath zone coverage, red zone DB positioning, seam vulnerability
- RB: Box count tendencies, DL gap integrity, LB pursuit speed, yards before contact allowed, blitz pickup assignments
- OL: DL alignments and techniques, pass rush stunts & twist games, interior speed rushers, sack location heatmap, line games
- CB: WR route tree breakdown, avg separation per route, target share, contested catch rate, QB air yard targeting
- S: TE target rates & routes, crossing route frequency, deep ball rate, slot WR usage, post-snap rotation reads
- LB: RB gap tendencies, screen game frequency & types, OL run blocking gaps, FB usage, third-down check-down patterns
- DL: OL pass set weaknesses, double team tendencies, run gap blocking schemes, center/guard technique matchups
- EDGE: OT pass set footwork tendencies, QB mobility & scramble rate, protection slide direction, TE chip tendencies
- HC: Full all-phases analysis — offensive scheme, defensive tendencies, special teams, game management, situational football, timeout usage
- OC: Full defensive scheme breakdown — coverage shells, blitz rates, personnel packages, red zone D, 3rd down tendencies, pressure packages
- DC: Full offensive scheme breakdown — formation tendencies, motion usage, RPO rate, red zone O, pace, 2-minute drill, personnel groupings
- STC: Return unit speed & separation data, coverage gunner win rates, kicker NGS hang time & distance, punter directional tendencies, fake tendencies
- QB_COACH: Opponent pass rush unit in full detail — individual rusher win rates, get-off times, stunt frequencies, blitz packages, coverage disguises, how to protect vs this front
- WR_COACH: All opponent CBs and their tendencies — press vs off coverage rate per CB, separation allowed per route type, safety rotation patterns, slot vs outside CB matchups, technique tendencies
- OL_COACH: Full opponent DL and pass rush analysis — individual DL techniques, stunt and twist game frequencies, interior vs edge rush balance, run gap assignments, how to scheme blocks
- RB_COACH: Opponent run defense breakdown — box count tendencies by down/distance, DL gap control, LB pursuit angles and speed, safety run support depth, screen and check-down defense
- TE_COACH: Opponent coverage of TE positions — LB athleticism vs seam routes, S coverage ability, slot vs inline TE defensive adjustments, red zone positioning, yards allowed to TEs
- DB_COACH: Full opponent WR corps breakdown — route trees by receiver, separation rates, target depth, contested catch rates, opponent QB air yard tendencies, how to scheme coverage
- LB_COACH: Opponent run game tendencies for LBs — gap attack frequencies, OL blocking schemes, RB YBC data, screen game type and rate, FB and H-back usage, pass coverage assignments vs RBs/TEs
- DL_COACH: Opponent OL run blocking schemes — gap vs zone run tendencies, double team frequency and targets, center/guard technique, pulling tendencies, how to assign gap responsibilities`;



const CHAT_SYSTEM_PROMPT = (selectedTeam, myTeam, selectedPosition, report, positionReport) => {
  const opponent = selectedTeam ? `${selectedTeam.name} (${selectedTeam.abbr})` : "no specific opponent selected";
  const myTeamStr = myTeam ? `${myTeam.name} (${myTeam.abbr})` : "unspecified";
  const posStr = selectedPosition ? `${selectedPosition.label} (${selectedPosition.id})` : "not specified";
  const reportContext = report ? `\n\nCOACH SCOUTING REPORT DATA FOR ${selectedTeam?.name?.toUpperCase()}:\n${JSON.stringify(report, null, 2)}` : "";
  const posReportContext = positionReport ? `\n\nPOSITION REPORT DATA (${posStr}):\n${JSON.stringify(positionReport, null, 2)}` : "";
  return `You are an elite NFL analytics assistant embedded in a scouting intelligence platform. Answer questions conversationally but with deep NFL expertise and NGS (Next Gen Stats) knowledge.

CONTEXT:
- User's team: ${myTeamStr}
- Opponent being scouted: ${opponent}
- User's role/position: ${posStr}
- Season: 2024 NFL Season

${reportContext}${posReportContext}

GUIDELINES:
- Be direct, confident, and specific — you are talking to a professional coach or player
- Reference NGS data concepts: separation rates, pass rush win rates, air yards, time to throw, yards before contact, completion % over expected, route depth, etc.
- Tailor answers to the user's role (${posStr}) when relevant
- If asked about a team you have scouting data for, reference that data specifically
- Keep answers focused and actionable — no fluff
- Use football terminology naturally
- If asked something outside your data, give your best analysis based on 2024 season knowledge
- Format with short paragraphs; use bullet points only when listing multiple items`;
};

const SYSTEM_PROMPT = `You are an elite NFL coaching analytics assistant with deep expertise in NFL Next Generation Stats (NGS). You generate comprehensive, actionable pre-game scouting reports for NFL coaches preparing for upcoming opponents.

When asked about a team, produce a detailed scouting report structured in exactly this JSON format (respond ONLY with valid JSON, no markdown, no extra text):

{
  "teamName": "Full team name",
  "abbr": "Team abbreviation",
  "season": "2024 Season",
  "record": "X-Y",
  "overallThreat": 1-10,
  "threatLabel": "one word descriptor",
  "headline": "One punchy 8-12 word scouting headline that captures this team's identity",
  "offense": {
    "rating": 1-10,
    "schemeLabel": "e.g. Air Raid, West Coast, RPO-Heavy, etc.",
    "passingGame": {
      "summary": "2-3 sentence NGS-informed passing game analysis",
      "keyStats": [
        {"label": "Avg Air Yards/Att", "value": "X.X yds", "trend": "up|down|neutral", "context": "brief context"},
        {"label": "Completion % Over Expected", "value": "+/-X.X%", "trend": "up|down|neutral", "context": "brief context"},
        {"label": "Time to Throw", "value": "X.Xs", "trend": "up|down|neutral", "context": "brief context"},
        {"label": "Deep Ball Rate (20+ yds)", "value": "X%", "trend": "up|down|neutral", "context": "brief context"}
      ],
      "keyPlayers": [
        {"name": "Player Name", "position": "QB", "ngsInsight": "specific NGS-based insight about this player"},
        {"name": "Player Name", "position": "WR1", "ngsInsight": "route separation and tracking insight"},
        {"name": "Player Name", "position": "WR2", "ngsInsight": "route separation and tracking insight"}
      ],
      "routeTendencies": {
        "summary": "2-3 sentences about their route tree tendencies from NGS tracking data",
        "topRoutes": ["Slant", "Crosser", "Deep Post", "Comeback", "Screen"],
        "separationRating": 1-10,
        "separationContext": "brief sentence on separation quality vs league average"
      },
      "coachingAlerts": ["Alert 1", "Alert 2", "Alert 3"]
    },
    "rushingGame": {
      "summary": "2-3 sentence rushing attack analysis using NGS gap/tracking data",
      "keyStats": [
        {"label": "Yards Before Contact", "value": "X.X yds", "trend": "up|down|neutral", "context": "brief context"},
        {"label": "Yards After Contact", "value": "X.X yds", "trend": "up|down|neutral", "context": "brief context"},
        {"label": "Breakaway Run Rate", "value": "X%", "trend": "up|down|neutral", "context": "brief context"},
        {"label": "Run Gap Tendency", "value": "Left/Right/Middle %", "trend": "neutral", "context": "brief context"}
      ],
      "keyPlayers": [
        {"name": "Player Name", "position": "RB1", "ngsInsight": "tracking-based insight on this runner"},
        {"name": "Player Name", "position": "RB2", "ngsInsight": "tracking-based insight"}
      ],
      "gapTendencies": {
        "left": 30,
        "middle": 35,
        "right": 35,
        "summary": "one sentence on their run gap distribution and what it means for your defense"
      },
      "coachingAlerts": ["Alert 1", "Alert 2", "Alert 3"]
    }
  },
  "defense": {
    "rating": 1-10,
    "schemeLabel": "e.g. 4-3 Base, 3-4 Zone, Cover-2 Tampa, Hybrid, etc.",
    "passDefense": {
      "summary": "2-3 sentence NGS-informed pass defense analysis",
      "keyStats": [
        {"label": "Pressure Rate Allowed", "value": "X%", "trend": "up|down|neutral", "context": "brief context"},
        {"label": "Coverage Snap % (Man vs Zone)", "value": "X% Man", "trend": "neutral", "context": "brief context"},
        {"label": "Avg Separation Allowed", "value": "X.X yds", "trend": "up|down|neutral", "context": "brief context"},
        {"label": "EPA/Drop Back Allowed", "value": "+/-X.XX", "trend": "up|down|neutral", "context": "brief context"}
      ],
      "keyPlayers": [
        {"name": "Player Name", "position": "CB1", "ngsInsight": "coverage grade and matchup notes"},
        {"name": "Player Name", "position": "S", "ngsInsight": "range and positioning insights from tracking"},
        {"name": "Player Name", "position": "EDGE", "ngsInsight": "pass rush win rate and get-off time"}
      ],
      "exploitableZones": ["Area 1", "Area 2", "Area 3"],
      "coachingAlerts": ["Alert 1", "Alert 2", "Alert 3"]
    },
    "rushDefense": {
      "summary": "2-3 sentence rush defense analysis",
      "keyStats": [
        {"label": "Stuff Rate", "value": "X%", "trend": "up|down|neutral", "context": "brief context"},
        {"label": "Yards Allowed Before Contact", "value": "X.X yds", "trend": "up|down|neutral", "context": "brief context"},
        {"label": "Run Stop Win Rate (DL)", "value": "X%", "trend": "up|down|neutral", "context": "brief context"},
        {"label": "Gap Vulnerabilities", "value": "Left/Middle/Right", "trend": "neutral", "context": "brief context"}
      ],
      "keyPlayers": [
        {"name": "Player Name", "position": "DT", "ngsInsight": "penetration and gap control"},
        {"name": "Player Name", "position": "LB", "ngsInsight": "pursuit speed and tackle efficiency"}
      ],
      "coachingAlerts": ["Alert 1", "Alert 2", "Alert 3"]
    },
    "passRush": {
      "summary": "2-3 sentences on their pass rush tendencies and NGS pressure data",
      "keyStats": [
        {"label": "Blitz Rate", "value": "X%", "trend": "up|down|neutral", "context": "brief context"},
        {"label": "Pass Rush Win Rate", "value": "X%", "trend": "up|down|neutral", "context": "brief context"},
        {"label": "Avg Get-Off Time", "value": "X.Xs", "trend": "up|down|neutral", "context": "brief context"},
        {"label": "Pressure-to-Sack Conv.", "value": "X%", "trend": "up|down|neutral", "context": "brief context"}
      ],
      "topRushers": [
        {"name": "Player Name", "position": "EDGE", "winRate": "X%", "getOffTime": "X.Xs", "insight": "NGS insight"},
        {"name": "Player Name", "position": "DT/EDGE", "winRate": "X%", "getOffTime": "X.Xs", "insight": "NGS insight"}
      ],
      "coachingAlerts": ["Alert 1", "Alert 2", "Alert 3"]
    }
  },
  "specialTeams": {
    "rating": 1-10,
    "summary": "2-3 sentence special teams overview with NGS-style data points",
    "keyStats": [
      {"label": "Kickoff Touchback Rate", "value": "X%", "trend": "up|down|neutral", "context": "brief context"},
      {"label": "Punt Return Avg", "value": "X.X yds", "trend": "up|down|neutral", "context": "brief context"},
      {"label": "FG% (40+ yards)", "value": "X%", "trend": "up|down|neutral", "context": "brief context"},
      {"label": "Coverage Speed Avg", "value": "X.X mph", "trend": "up|down|neutral", "context": "brief context"}
    ],
    "keyPlayers": [
      {"name": "Player Name", "position": "K", "ngsInsight": "kicker tracking and accuracy data"},
      {"name": "Player Name", "position": "PR/KR", "ngsInsight": "return speed and agility data"}
    ],
    "coachingAlerts": ["Alert 1", "Alert 2"]
  },
  "gameplanPriorities": [
    {"priority": 1, "phase": "Offense", "title": "Short title", "detail": "2 sentence actionable gameplan note"},
    {"priority": 2, "phase": "Defense", "title": "Short title", "detail": "2 sentence actionable gameplan note"},
    {"priority": 3, "phase": "Defense", "title": "Short title", "detail": "2 sentence actionable gameplan note"},
    {"priority": 4, "phase": "Offense", "title": "Short title", "detail": "2 sentence actionable gameplan note"},
    {"priority": 5, "phase": "Special Teams", "title": "Short title", "detail": "2 sentence actionable gameplan note"}
  ],
  "watchoutFactor": "One compelling sentence about the single biggest threat or wild-card this team presents"
}`;

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, trend, context }) {
  const trendColor = trend === "up" ? "#4ade80" : trend === "down" ? "#f87171" : "#94a3b8";
  const trendIcon = trend === "up" ? "▲" : trend === "down" ? "▼" : "●";
  return (
    <div style={{
      background: "rgba(0,0,0,0.04)",
      border: "1px solid rgba(0,0,0,0.1)",
      borderRadius: "8px",
      padding: "12px 14px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    }}>
      <div style={{ fontSize: "12px", color: "#7a6e5e", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
        <span style={{ fontSize: "24px", fontWeight: "700", color: "#1e1a14", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "-0.02em" }}>{value}</span>
        <span style={{ fontSize: "13px", color: trendColor, fontFamily: "'Barlow Condensed', sans-serif" }}>{trendIcon}</span>
      </div>
      <div style={{ fontSize: "13px", color: "#7a6e5e", lineHeight: 1.4 }}>{context}</div>
    </div>
  );
}

// ─── Rating Bar ───────────────────────────────────────────────────────────────
function RatingBar({ value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ flex: 1, height: "4px", background: "rgba(0,0,0,0.07)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${value * 10}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: "2px",
          transition: "width 1s ease",
        }} />
      </div>
      <span style={{ fontSize: "15px", fontWeight: "700", color, fontFamily: "'Barlow Condensed', sans-serif", minWidth: "24px" }}>{value}</span>
    </div>
  );
}

// ─── Player Row ───────────────────────────────────────────────────────────────
function PlayerRow({ name, position, ngsInsight, accentColor }) {
  return (
    <div style={{
      display: "flex",
      gap: "10px",
      alignItems: "flex-start",
      padding: "10px 0",
      borderBottom: "1px solid rgba(0,0,0,0.07)",
    }}>
      <div style={{
        minWidth: "40px",
        height: "40px",
        borderRadius: "6px",
        background: `${accentColor}22`,
        border: `1px solid ${accentColor}44`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "700",
        color: accentColor,
        fontFamily: "'Barlow Condensed', sans-serif",
        letterSpacing: "0.05em",
      }}>{position}</div>
      <div>
        <div style={{ fontSize: "15px", fontWeight: "600", color: "#1e1a14", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.02em" }}>{name}</div>
        <div style={{ fontSize: "13px", color: "#7a6e5e", lineHeight: 1.5, marginTop: "2px" }}>{ngsInsight}</div>
      </div>
    </div>
  );
}

// ─── Alert Badge ──────────────────────────────────────────────────────────────
function AlertBadge({ text, color }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
      padding: "8px 10px",
      background: `${color}11`,
      border: `1px solid ${color}33`,
      borderRadius: "6px",
      marginBottom: "6px",
    }}>
      <span style={{ color, fontSize: "14px", marginTop: "1px" }}>⚡</span>
      <span style={{ fontSize: "14px", color: "#5a5040", lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

// ─── Gap Tendency Bar ─────────────────────────────────────────────────────────
function GapTendency({ left, middle, right, accentColor }) {
  return (
    <div style={{ marginTop: "12px" }}>
      <div style={{ fontSize: "12px", color: "#7a6e5e", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontFamily: "'Barlow Condensed', sans-serif" }}>Run Gap Distribution</div>
      <div style={{ display: "flex", gap: "4px", height: "40px", alignItems: "flex-end" }}>
        {[{ label: "Left", val: left }, { label: "Mid", val: middle }, { label: "Right", val: right }].map(({ label, val }) => (
          <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "13px", color: "#1e1a14", fontWeight: "700", fontFamily: "'Barlow Condensed', sans-serif" }}>{val}%</span>
            <div style={{
              width: "100%",
              height: `${(val / 50) * 30}px`,
              background: `linear-gradient(180deg, ${accentColor}, ${accentColor}66)`,
              borderRadius: "3px 3px 0 0",
              minHeight: "6px",
            }} />
            <span style={{ fontSize: "12px", color: "#7a6e5e", fontFamily: "'Barlow Condensed', sans-serif" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section Panel ────────────────────────────────────────────────────────────
function SectionPanel({ title, icon, rating, ratingColor, children, accentColor }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{
      background: "rgba(235,228,215,0.9)",
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: "12px",
      overflow: "hidden",
      marginBottom: "16px",
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          cursor: "pointer",
          borderBottom: open ? "1px solid rgba(0,0,0,0.08)" : "none",
          background: "rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "21px" }}>{icon}</span>
          <span style={{ fontSize: "18px", fontWeight: "700", color: "#1e1a14", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>{title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {rating && <RatingBar value={rating} color={ratingColor || accentColor} />}
          <span style={{ color: "#9a8e7e", fontSize: "16px" }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && <div style={{ padding: "20px" }}>{children}</div>}
    </div>
  );
}

// ─── Gameplan Priority Card ───────────────────────────────────────────────────
function PriorityCard({ item, accentColor }) {
  const phaseColors = { Offense: "#60a5fa", Defense: "#f87171", "Special Teams": "#fbbf24" };
  const color = phaseColors[item.phase] || accentColor;
  return (
    <div style={{
      display: "flex",
      gap: "14px",
      padding: "14px",
      background: "rgba(0,0,0,0.03)",
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: "10px",
      marginBottom: "10px",
    }}>
      <div style={{
        minWidth: "36px",
        height: "36px",
        borderRadius: "50%",
        background: `${color}22`,
        border: `2px solid ${color}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "16px",
        fontWeight: "900",
        color,
        fontFamily: "'Barlow Condensed', sans-serif",
      }}>{item.priority}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e1a14", fontFamily: "'Barlow Condensed', sans-serif" }}>{item.title}</span>
          <span style={{
            fontSize: "10px",
            fontWeight: "700",
            color,
            background: `${color}22`,
            padding: "2px 6px",
            borderRadius: "4px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontFamily: "'Barlow Condensed', sans-serif",
          }}>{item.phase}</span>
        </div>
        <div style={{ fontSize: "14px", color: "#7a6e5e", lineHeight: 1.6 }}>{item.detail}</div>
      </div>
    </div>
  );
}

// ─── Loading State ────────────────────────────────────────────────────────────
function LoadingScout({ teamName, accentColor }) {
  const steps = [
    "Pulling NGS tracking data...",
    "Analyzing route tree tendencies...",
    "Computing pass rush win rates...",
    "Mapping run gap distributions...",
    "Evaluating coverage metrics...",
    "Generating gameplan priorities...",
  ];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setStep(s => (s + 1) % steps.length), 1100);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "400px",
      gap: "28px",
    }}>
      <div style={{
        width: "72px",
        height: "72px",
        border: `3px solid ${accentColor}33`,
        borderTop: `3px solid ${accentColor}`,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "26px", fontWeight: "800", color: "#1e1a14", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em", marginBottom: "8px" }}>
          SCOUTING {teamName.toUpperCase()}
        </div>
        <div style={{ fontSize: "15px", color: accentColor, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", minHeight: "20px", transition: "opacity 0.3s" }}>
          {steps[step]}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}


// ─── Matchup Grade Badge ───────────────────────────────────────────────────────
function MatchupGrade({ grade }) {
  const colors = {
    "A+": "#16a34a", "A": "#16a34a", "A-": "#22c55e",
    "B+": "#84cc16", "B": "#eab308", "B-": "#f59e0b",
    "C+": "#f97316", "C": "#ef4444", "C-": "#dc2626",
    "D": "#991b1b",
  };
  const color = colors[grade] || "#64748b";
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      background: `${color}18`, border: `2px solid ${color}44`,
      borderRadius: "12px", padding: "12px 20px", minWidth: "80px",
    }}>
      <span style={{ fontSize: "12px", color: "#7a6e5e", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>Matchup</span>
      <span style={{ fontSize: "45px", fontWeight: "900", fontFamily: "'Barlow Condensed', sans-serif", color, lineHeight: 1.1 }}>{grade}</span>
    </div>
  );
}

// ─── Threat Pill ──────────────────────────────────────────────────────────────
function ThreatPill({ threat }) {
  const map = { high: ["#ef4444", "HIGH"], medium: ["#f59e0b", "MED"], low: ["#22c55e", "LOW"] };
  const [color, label] = map[threat] || ["#94a3b8", threat?.toUpperCase()];
  return (
    <span style={{
      fontSize: "10px", fontWeight: "700", color, background: `${color}18`,
      border: `1px solid ${color}44`, padding: "2px 6px", borderRadius: "4px",
      fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em",
    }}>{label}</span>
  );
}


// ─── Print Report ─────────────────────────────────────────────────────────────


// ─── Build printable HTML string from report data ────────────────────────────
function buildReportHTML(rpt, position, team, color, sections, sitEdges, filmFocus) {
  const gradeColors = {
    "A+":"#16a34a","A":"#16a34a","A-":"#22c55e","B+":"#84cc16","B":"#eab308",
    "B-":"#f59e0b","C+":"#f97316","C":"#ef4444","C-":"#dc2626","D":"#991b1b",
  };
  const gc = gradeColors[rpt.matchupGrade] || "#64748b";
  const esc = s => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const statCards = (stats) => (stats||[]).map(s=>`
    <div class="sc"><div class="sl">${esc(s.label)}</div>
    <div class="sv">${esc(s.value)}<span class="tr ${s.trend||""}">${s.trend==="up"?"▲":s.trend==="down"?"▼":"●"}</span></div>
    <div class="sx">${esc(s.context)}</div>
    ${s.relevance?`<div class="sr" style="color:${color}">${esc(s.relevance)}</div>`:""}
    </div>`).join("");
  const playerRows = (players) => (players||[]).map(p=>{
    const tc=p.threat==="high"?"#ef4444":p.threat==="medium"?"#f59e0b":"#22c55e";
    return `<div class="pr"><div class="pp" style="color:${color};background:${color}18;border-color:${color}44">${esc(p.position)}</div>
    <div><div class="pn">${esc(p.name)}<span class="tp" style="color:${tc};background:${tc}18;border-color:${tc}44">${esc((p.threat||"").toUpperCase())}</span></div>
    <div class="pi">${esc(p.insight)}</div></div></div>`;
  }).join("");
  const tips = arr=>(arr||[]).map(t=>`<div class="tip" style="background:${color}08;border-color:${color}22"><span style="color:${color}">✓</span> ${esc(t)}</div>`).join("");
  const sectionsHTML = sections.map(s=>`
    <div class="sec">
      <div class="sh"><span>${s.icon||""}</span><span class="st">${esc(s.title)}</span></div>
      <p class="ss">${esc(s.summary)}</p>
      ${(s.stats||[]).length?`<div class="sg">${statCards(s.stats)}</div>`:""}
      ${(s.players||[]).length?`<div class="lbl">Key Opponents</div>${playerRows(s.players)}`:""}
      ${(s.keyTips||[]).length?`<div class="lbl">Key Tips</div>${tips(s.keyTips)}`:""}
    </div>`).join("");
  const sitHTML = sitEdges.length?`<div class="sec"><div class="sh"><span>🎲</span><span class="st">SITUATIONAL EDGES</span></div>
    <div class="sitg">${sitEdges.map(se=>`<div class="sitc"><div class="sitl" style="color:${color}">${esc(se.situation)}</div><div class="siti">${esc(se.insight)}</div></div>`).join("")}</div></div>`:"";
  const filmHTML = filmFocus.length?`<div class="sec"><div class="sh"><span>🎬</span><span class="st">WATCH FILM FOCUS</span></div>
    ${filmFocus.map((f,i)=>`<div class="fr"><div class="fn" style="color:${color};background:${color}18;border-color:${color}33">${i+1}</div><span>${esc(f)}</span></div>`).join("")}</div>`:"";
  const gpHTML = rpt.personalGameplan?`<div class="sec gp" style="background:${color}08;border:1.5px solid ${color}44">
    <div class="sh"><span>📌</span><span class="st">YOUR PERSONAL GAMEPLAN</span></div>
    <p class="gpt">${esc(rpt.personalGameplan)}</p></div>`:"";
  const isCoach = (position.id||"").includes("_COACH");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500&display=swap" rel="stylesheet">
  <style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Barlow',sans-serif;background:#f5f0e8;color:#1e1a14}
  @media print{body{background:#fff}@page{margin:.5in;size:letter}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}
  .page{max-width:760px;margin:0 auto;padding:28px 24px}
  .dh{border-bottom:2px solid #1e1a14;padding-bottom:12px;margin-bottom:20px}
  .dm{font-family:'Barlow Condensed',sans-serif;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:#9a8e7e;margin-bottom:4px}
  .dt{font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:900;letter-spacing:.04em;line-height:1.1}
  .ds{font-size:12px;color:#5a5040;margin-top:4px}
  .hero{background:linear-gradient(135deg,${color}14,transparent);border:1px solid ${color}33;border-radius:10px;padding:18px 20px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:flex-start;gap:14px}
  .hl{font-family:'Barlow Condensed',sans-serif;font-size:10px;color:${color};text-transform:uppercase;letter-spacing:.15em;margin-bottom:4px}
  .ht{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:900;letter-spacing:.03em}
  .hs{font-size:12px;color:#5a5040;line-height:1.7;margin-top:7px;max-width:500px}
  .gb{display:flex;flex-direction:column;align-items:center;background:${gc}18;border:2px solid ${gc}44;border-radius:9px;padding:8px 16px;min-width:64px;flex-shrink:0}
  .gl{font-family:'Barlow Condensed',sans-serif;font-size:8px;color:#7a6e5e;text-transform:uppercase;letter-spacing:.1em}
  .gv{font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:900;color:${gc};line-height:1.1}
  .prio{margin-top:12px;padding:9px 12px;background:${color}11;border:1px solid ${color}33;border-left:3px solid ${color};border-radius:0 6px 6px 0}
  .priol{font-family:'Barlow Condensed',sans-serif;font-size:9px;color:${color};text-transform:uppercase;letter-spacing:.12em;margin-bottom:2px}
  .priot{font-size:12px;line-height:1.6;font-weight:500}
  .sec{background:rgba(0,0,0,.02);border:1px solid rgba(0,0,0,.07);border-radius:9px;padding:14px 16px;margin-bottom:12px;page-break-inside:avoid}
  .sh{display:flex;align-items:center;gap:6px;margin-bottom:10px}
  .st{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
  .ss{font-size:11px;color:#5a5040;line-height:1.7;margin-bottom:12px}
  .sg{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:7px;margin-bottom:12px}
  .sc{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:6px;padding:9px 11px}
  .sl{font-family:'Barlow Condensed',sans-serif;font-size:8px;color:#9a8e7e;text-transform:uppercase;letter-spacing:.1em}
  .sv{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;margin:2px 0}
  .tr{font-size:9px}.tr.up{color:#16a34a}.tr.down{color:#dc2626}.tr.neutral{color:#9a8e7e}
  .sx{font-size:9px;color:#7a6e5e;line-height:1.4}
  .sr{margin-top:4px;font-size:8px;padding:2px 5px;border-radius:3px;font-style:italic;line-height:1.4;background:${color}11}
  .lbl{font-family:'Barlow Condensed',sans-serif;font-size:9px;color:#9a8e7e;text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px}
  .pr{display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-bottom:1px solid rgba(0,0,0,.06)}
  .pr:last-child{border-bottom:none}
  .pp{min-width:32px;height:32px;border-radius:4px;border:1px solid;display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-size:8px;font-weight:700}
  .pn{font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;display:flex;align-items:center;gap:5px;margin-bottom:2px}
  .tp{font-size:7px;font-weight:700;padding:1px 4px;border-radius:3px;border:1px solid;font-family:'Barlow Condensed',sans-serif;letter-spacing:.08em}
  .pi{font-size:10px;color:#7a6e5e;line-height:1.5}
  .tip{display:flex;gap:6px;padding:5px 8px;border:1px solid;border-radius:4px;margin-bottom:4px;font-size:10px;color:#5a5040;line-height:1.5}
  .sitg{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:7px}
  .sitc{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:6px;padding:9px 11px}
  .sitl{font-family:'Barlow Condensed',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px}
  .siti{font-size:10px;color:#5a5040;line-height:1.6}
  .fr{display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-bottom:1px solid rgba(0,0,0,.06);font-size:11px;color:#5a5040;line-height:1.6}
  .fr:last-child{border-bottom:none}
  .fn{min-width:20px;height:20px;border-radius:50%;border:1px solid;display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-size:9px;font-weight:700;flex-shrink:0;margin-top:2px}
  .gp{border:1.5px solid!important}
  .gpt{font-size:12px;line-height:1.8;font-style:italic;color:#1e1a14}
  .print-btn{display:block;margin:0 auto 20px;padding:10px 28px;background:${color};color:#fff;border:none;border-radius:8px;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;letter-spacing:.08em;cursor:pointer;text-transform:uppercase}
  @media print{.print-btn{display:none!important}}
  </style></head><body><div class="page">
  <button class="print-btn">🖨️ Print / Save as PDF</button>
  <div class="dh">
    <div class="dm">NFL Next Gen Stats · ${isCoach?"Coaching Intelligence Brief":"Personal Scouting Report"} · 2024 Season</div>
    <div class="dt">${esc(position.label).toUpperCase()} REPORT — ${esc((rpt.opponentTeam||team.name)).toUpperCase()}</div>
    <div class="ds">Matchup Grade: <strong>${esc(rpt.matchupGrade||"—")}</strong> &nbsp;|&nbsp; ${esc(position.label)} &nbsp;|&nbsp; vs <strong>${esc(rpt.opponentTeam||team.name)}</strong></div>
  </div>
  <div class="hero">
    <div style="flex:1">
      <div class="hl">${esc(position.label)} · ${isCoach?"Coaching Intelligence Brief":"Personal Scouting Report"}</div>
      <div class="ht">VS ${esc((rpt.opponentTeam||team.name)).toUpperCase()}</div>
      <p class="hs">${esc(rpt.matchupSummary||"")}</p>
      ${rpt.topPriority?`<div class="prio"><div class="priol">🎯 Top Priority</div><div class="priot">${esc(rpt.topPriority)}</div></div>`:""}
    </div>
    ${rpt.matchupGrade?`<div class="gb"><div class="gl">Matchup</div><div class="gv">${esc(rpt.matchupGrade)}</div></div>`:""}
  </div>
  ${sectionsHTML}${sitHTML}${filmHTML}${gpHTML}
  </div>
  <script>document.querySelector(".print-btn").onclick=function(){window.print()};</script>
  </body></html>`;
}

// ─── Position View Component ──────────────────────────────────────────────────
function PositionView({ selectedTeam, selectedPosition, setSelectedPosition, positionReport, positionLoading, positionError, generatePositionReport, cacheHit }) {
  const handleDownload = (rpt, position, team, color, sections, sitEdges, filmFocus) => {
    const html = buildReportHTML(rpt, position, team, color, sections, sitEdges, filmFocus);
    const encoded = "data:text/html;charset=utf-8," + encodeURIComponent(html);
    const a = document.createElement("a");
    a.href = encoded;
    a.download = `${position.id}_vs_${team.abbr}_scouting_report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePositionSelect = (pos) => {
    setSelectedPosition(pos);
    if (selectedTeam) {
      generatePositionReport(pos, selectedTeam);
    }
  };

  // ── No team selected nudge ──
  const NoTeamNudge = () => (
    <div style={{
      background: "#fbbf2418", border: "1px solid #fbbf2444",
      borderRadius: "10px", padding: "12px 16px",
      display: "flex", alignItems: "center", gap: "10px",
      marginBottom: "24px",
    }}>
      <span style={{ fontSize: "21px" }}>👈</span>
      <span style={{ fontSize: "15px", color: "#92400e", fontFamily: "'Barlow', sans-serif" }}>
        Select an opponent from the sidebar first, then choose your position for a personalized report.
      </span>
    </div>
  );

  // ── Position Selector ──
  const PositionSelector = () => (
    <div className="fade-in">
      {!selectedTeam && <NoTeamNudge />}
      <div style={{ marginBottom: "8px" }}>
        <div style={{ fontSize: "31px", fontWeight: "900", fontFamily: "'Barlow Condensed', sans-serif", color: "#1e1a14", letterSpacing: "0.05em" }}>
          WHAT'S YOUR ROLE?
        </div>
        <div style={{ fontSize: "15px", color: "#7a6e5e", marginTop: "4px" }}>
          Select your position to get a personalized opponent intelligence report built for you.
        </div>
      </div>

      {POSITIONS.map(group => (
        <div key={group.group} style={{ marginTop: "24px" }}>
          <div style={{
            fontSize: "13px", fontWeight: "700", color: group.color,
            textTransform: "uppercase", letterSpacing: "0.14em",
            fontFamily: "'Barlow Condensed', sans-serif",
            borderBottom: `2px solid ${group.color}33`, paddingBottom: "6px", marginBottom: "10px",
          }}>{group.group}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
            {group.roles.map(pos => {
              const isSelected = selectedPosition?.id === pos.id;
              return (
                <button
                  key={pos.id}
                  onClick={() => handlePositionSelect(pos)}
                  className={`pos-btn${isSelected ? " selected" : ""}`}
                  style={{
                    background: isSelected ? `${group.color}18` : undefined,
                    borderColor: isSelected ? `${group.color}88` : undefined,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "24px" }}>{pos.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{
                          fontSize: "16px", fontWeight: "700",
                          color: isSelected ? group.color : "#1e1a14",
                          fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em",
                        }}>{pos.label}</div>
                        {pos.id.includes('_COACH') && (
                          <span style={{
                            fontSize: "9px", fontWeight: "700", color: group.color,
                            background: `${group.color}18`, border: `1px solid ${group.color}33`,
                            padding: "1px 5px", borderRadius: "3px",
                            fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em",
                          }}>COACH</span>
                        )}
                      </div>
                      <div style={{ fontSize: "10px", fontWeight: "700", color: isSelected ? group.color : "#9a8e7e", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>{pos.id}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", color: "#9a8e7e", lineHeight: 1.4, marginTop: "2px" }}>{pos.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  // ── Loading ──
  if (positionLoading) {
    const groupColor = POSITIONS.find(g => g.roles.some(r => r.id === selectedPosition?.id))?.color || "#3b82f6";
    const isCoach = selectedPosition?.id?.includes('_COACH') || ['HC','OC','DC','STC'].includes(selectedPosition?.id);
    const steps2 = isCoach
      ? ["Pulling opponent unit data...", "Analyzing scheme tendencies...", "Building player matchup intel...", "Generating practice focus areas...", "Finalizing coaching brief..."]
      : ["Analyzing matchup data...", "Pulling coverage tendencies...", "Mapping opponent personnel...", "Building your gameplan...", "Finalizing position insights..."];
    return <LoadingPositionReport position={selectedPosition} teamName={selectedTeam?.name || ""} color={groupColor} steps={steps2} />;
  }

  // ── Error ──
  if (positionError) {
    return (
      <div className="fade-in">
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px",
          padding: "24px 28px", marginBottom: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <span style={{ fontSize: "22px" }}>⚠️</span>
            <span style={{ fontSize: "18px", fontWeight: "700", fontFamily: "'Barlow Condensed', sans-serif", color: "#991b1b", letterSpacing: "0.05em" }}>
              REPORT GENERATION FAILED
            </span>
          </div>
          <p style={{ fontSize: "14px", color: "#7f1d1d", lineHeight: 1.6, marginBottom: "16px", fontFamily: "monospace", background: "#fee2e2", padding: "10px 12px", borderRadius: "6px" }}>
            {positionError}
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => selectedTeam && selectedPosition && generatePositionReport(selectedPosition, selectedTeam)}
              style={{
                padding: "8px 18px", borderRadius: "7px", border: "none",
                background: "#dc2626", color: "white", cursor: "pointer",
                fontSize: "13px", fontWeight: "700", fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.06em",
              }}>↺ Try Again</button>
            <button
              onClick={() => setSelectedPosition(null)}
              style={{
                padding: "8px 18px", borderRadius: "7px", border: "1px solid rgba(0,0,0,0.12)",
                background: "rgba(0,0,0,0.04)", color: "#5a5040", cursor: "pointer",
                fontSize: "13px", fontWeight: "700", fontFamily: "'Barlow Condensed', sans-serif",
              }}>← Change Position</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Show report ──
  if (positionReport && selectedPosition && selectedTeam) {
    const groupColor = POSITIONS.find(g => g.roles.some(r => r.id === selectedPosition.id))?.color || "#3b82f6";
    // Defensive safe accessors so missing fields never crash the render
    const rpt = positionReport || {};
    const sections = Array.isArray(rpt.sections) ? rpt.sections : [];
    const sitEdges = Array.isArray(rpt.situationalEdges) ? rpt.situationalEdges : [];
    const filmFocus = Array.isArray(rpt.watchFilmFocus) ? rpt.watchFilmFocus : [];
    try { void sections.length; void sitEdges.length; void filmFocus.length; } catch { return null; }
    return (
      <div className="fade-in">
        {/* Back + reselect + print */}
        <div className="no-print" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          <button onClick={() => { setSelectedPosition(null); }} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.1)",
            background: "rgba(0,0,0,0.04)", cursor: "pointer", color: "#5a5040",
            fontSize: "14px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: "600",
          }}>← Change Position</button>
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 12px", borderRadius: "6px",
            background: `${groupColor}18`, border: `1px solid ${groupColor}44`,
          }}>
            <span style={{ fontSize: "16px" }}>{selectedPosition.icon}</span>
            <span style={{ fontSize: "14px", fontWeight: "700", color: groupColor, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}>
              {selectedPosition.label.toUpperCase()}
            </span>
            {selectedPosition.id.includes('_COACH') && (
              <span style={{
                fontSize: "10px", fontWeight: "700", color: groupColor,
                background: `${groupColor}18`, border: `1px solid ${groupColor}33`,
                padding: "2px 6px", borderRadius: "4px",
                fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em",
              }}>POSITIONAL COACH</span>
            )}
            <span style={{ fontSize: "13px", color: "#9a8e7e", fontFamily: "'Barlow Condensed', sans-serif" }}>vs {selectedTeam.name}</span>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={() => handleDownload(rpt, selectedPosition, selectedTeam, groupColor, sections, sitEdges, filmFocus)}
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "8px 18px", borderRadius: "8px", border: "none",
                background: groupColor, color: "white", cursor: "pointer",
                fontSize: "13px", fontWeight: "700",
                fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em",
                textTransform: "uppercase", boxShadow: `0 2px 8px ${groupColor}44`,
                transition: "all 0.15s",
              }}
            >
              ⬇️ Download Report
            </button>
          </div>
        </div>
        {/* Print header — only visible when printing */}
        <div className="print-only" style={{ marginBottom: "20px", borderBottom: "2px solid #1e1a14", paddingBottom: "12px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9a8e7e", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "4px" }}>
            NFL Next Gen Stats · Personal Scouting Report · 2024 Season
          </div>
          <div style={{ fontSize: "28px", fontWeight: "900", fontFamily: "'Barlow Condensed', sans-serif", color: "#1e1a14", letterSpacing: "0.04em" }}>
            {selectedPosition?.label?.toUpperCase()} SCOUTING REPORT — {positionReport?.opponentTeam?.toUpperCase()}
          </div>
          <div style={{ fontSize: "13px", color: "#5a5040", marginTop: "4px", fontFamily: "'Barlow', sans-serif" }}>
            Matchup Grade: <strong>{positionReport?.matchupGrade}</strong> &nbsp;|&nbsp; Position: <strong>{selectedPosition?.label}</strong> &nbsp;|&nbsp; Opponent: <strong>{positionReport?.opponentTeam}</strong>
          </div>
        </div>

        {/* Cache hit banner for position report */}
        {cacheHit && (
          <div className="no-print" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: "8px", padding: "8px 14px", marginBottom: "14px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px" }}>⚡</span>
              <span style={{ fontSize: "13px", color: "#15803d", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: "600", letterSpacing: "0.04em" }}>
                LOADED FROM CACHE — Instant results
              </span>
            </div>
            <button onClick={() => { setPositionReport(null); generatePositionReport(selectedPosition, selectedTeam); }} style={{
              fontSize: "11px", color: "#15803d", background: "none", border: "1px solid #86efac",
              borderRadius: "5px", padding: "3px 9px", cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: "600",
            }}>↺ Refresh</button>
          </div>
        )}
        {/* Hero card */}
        <div className="print-section" style={{
          background: `linear-gradient(135deg, ${groupColor}14 0%, rgba(245,240,232,0) 70%)`,
          border: `1px solid ${groupColor}33`, borderRadius: "16px",
          padding: "24px 28px", marginBottom: "20px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "140px", height: "140px", borderRadius: "50%", background: `${groupColor}08`, border: `50px solid ${groupColor}05` }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "12px", color: groupColor, textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "6px" }}>
                  {selectedPosition.label} · {selectedPosition.id.includes('_COACH') ? "Coaching Intelligence Brief" : "Personal Scouting Report"}
                </div>
                <div style={{ fontSize: "33px", fontWeight: "900", fontFamily: "'Barlow Condensed', sans-serif", color: "#1e1a14", letterSpacing: "0.03em", lineHeight: 1.1 }}>
                  VS {positionReport.opponentTeam?.toUpperCase()}
                </div>
                <p style={{ fontSize: "15px", color: "#5a5040", lineHeight: 1.7, marginTop: "10px", maxWidth: "600px" }}>
                  {positionReport.matchupSummary}
                </p>
              </div>
              {positionReport.matchupGrade && <MatchupGrade grade={positionReport.matchupGrade} />}
            </div>

            {/* Top priority */}
            {positionReport.topPriority && (
              <div style={{
                marginTop: "16px", padding: "12px 16px",
                background: `${groupColor}11`, border: `1px solid ${groupColor}33`,
                borderLeft: `3px solid ${groupColor}`, borderRadius: "0 8px 8px 0",
              }}>
                <div style={{ fontSize: "12px", color: groupColor, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "4px" }}>🎯 TOP PRIORITY THIS WEEK</div>
                <div style={{ fontSize: "15px", color: "#1e1a14", lineHeight: 1.6, fontWeight: "500" }}>{positionReport.topPriority}</div>
              </div>
            )}
          </div>
        </div>

        {/* Sections */}
        {sections.map((section, si) => {
          const sc = section.accentColor || groupColor;
          return (
            <div key={si} className="print-section" style={{
              background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.07)",
              borderRadius: "12px", padding: "20px", marginBottom: "16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <span style={{ fontSize: "21px" }}>{section.icon}</span>
                <span style={{ fontSize: "18px", fontWeight: "700", color: "#1e1a14", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>{section.title}</span>
              </div>
              <p style={{ fontSize: "15px", color: "#5a5040", lineHeight: 1.7, marginBottom: "16px" }}>{section.summary}</p>

              {/* Stats grid */}
              {(section.stats || []).length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px", marginBottom: "16px" }}>
                  {(section.stats || []).map((s, i) => (
                    <div key={i} style={{
                      background: "white", border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: "8px", padding: "12px 14px",
                    }}>
                      <div style={{ fontSize: "12px", color: "#9a8e7e", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif" }}>{s.label}</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "4px 0" }}>
                        <span style={{ fontSize: "24px", fontWeight: "700", color: "#1e1a14", fontFamily: "'Barlow Condensed', sans-serif" }}>{s.value}</span>
                        <span style={{ fontSize: "13px", color: s.trend === "up" ? "#16a34a" : s.trend === "down" ? "#dc2626" : "#9a8e7e" }}>
                          {s.trend === "up" ? "▲" : s.trend === "down" ? "▼" : "●"}
                        </span>
                      </div>
                      <div style={{ fontSize: "13px", color: "#7a6e5e", lineHeight: 1.4 }}>{s.context}</div>
                      {s.relevance && (
                        <div style={{ marginTop: "6px", fontSize: "12px", color: sc, background: `${sc}11`, padding: "4px 6px", borderRadius: "4px", lineHeight: 1.4, fontStyle: "italic" }}>
                          {s.relevance}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Players */}
              {(section.players || []).length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "13px", color: "#9a8e7e", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "8px" }}>Key Opponents to Know</div>
                  {(section.players || []).map((p, i) => (
                    <div key={i} style={{
                      display: "flex", gap: "10px", alignItems: "flex-start",
                      padding: "10px 0", borderBottom: i < section.players.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                    }}>
                      <div style={{
                        minWidth: "40px", height: "40px", borderRadius: "6px",
                        background: `${sc}18`, border: `1px solid ${sc}33`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", fontWeight: "700", color: sc,
                        fontFamily: "'Barlow Condensed', sans-serif",
                      }}>{p.position}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                          <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e1a14", fontFamily: "'Barlow Condensed', sans-serif" }}>{p.name}</span>
                          <ThreatPill threat={p.threat} />
                        </div>
                        <div style={{ fontSize: "14px", color: "#7a6e5e", lineHeight: 1.5 }}>{p.insight}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Key Tips */}
              {(section.keyTips || []).length > 0 && (
                <div>
                  <div style={{ fontSize: "13px", color: "#9a8e7e", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "8px" }}>Key Tips</div>
                  {(section.keyTips || []).map((tip, i) => (
                    <div key={i} style={{
                      display: "flex", gap: "8px", padding: "7px 10px",
                      background: `${sc}08`, border: `1px solid ${sc}22`,
                      borderRadius: "6px", marginBottom: "6px",
                    }}>
                      <span style={{ color: sc, fontSize: "14px", marginTop: "1px", minWidth: "14px" }}>✓</span>
                      <span style={{ fontSize: "14px", color: "#5a5040", lineHeight: 1.5 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Situational Edges */}
        {sitEdges.length > 0 && (
          <div className="print-section" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ fontSize: "21px" }}>🎲</span>
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#1e1a14", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>Situational Edges</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
              {sitEdges.map((se, i) => (
                <div key={i} style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "8px", padding: "12px 14px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: groupColor, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "6px" }}>{se.situation}</div>
                  <div style={{ fontSize: "14px", color: "#5a5040", lineHeight: 1.6 }}>{se.insight}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Film Study */}
        {filmFocus.length > 0 && (
          <div className="print-section" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ fontSize: "21px" }}>🎬</span>
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#1e1a14", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>Watch Film Focus</span>
            </div>
            {filmFocus.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: i < positionReport.watchFilmFocus.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
                <div style={{
                  minWidth: "24px", height: "24px", borderRadius: "50%",
                  background: `${groupColor}18`, border: `1px solid ${groupColor}33`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: "700", color: groupColor, fontFamily: "'Barlow Condensed', sans-serif",
                }}>{i + 1}</div>
                <span style={{ fontSize: "15px", color: "#5a5040", lineHeight: 1.6 }}>{f}</span>
              </div>
            ))}
          </div>
        )}

        {/* Personal Gameplan */}
        {positionReport.personalGameplan && (
          <div className="print-section" style={{
            background: `linear-gradient(135deg, ${groupColor}12, rgba(245,240,232,0))`,
            border: `1.5px solid ${groupColor}44`, borderRadius: "12px", padding: "20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "21px" }}>📌</span>
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#1e1a14", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>Your Personal Gameplan</span>
            </div>
            <p style={{ fontSize: "16px", color: "#1e1a14", lineHeight: 1.8, fontStyle: "italic" }}>{positionReport.personalGameplan}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Default: show selector ──
  return (
    <>
      <PositionSelector />
    </>
  );
}

// ─── Position Loading State ───────────────────────────────────────────────────
function LoadingPositionReport({ position, teamName, color, steps }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setStep(s => (s + 1) % steps.length), 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "24px" }}>
      <div style={{
        width: "64px", height: "64px",
        border: `3px solid ${color}33`, borderTop: `3px solid ${color}`,
        borderRadius: "50%", animation: "spin 0.8s linear infinite",
      }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "16px", color: "#9a8e7e", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
          {position?.icon} {position?.label}
        </div>
        <div style={{ fontSize: "26px", fontWeight: "800", color: "#1e1a14", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em", marginBottom: "8px" }}>
          BUILDING YOUR REPORT
        </div>
        <div style={{ fontSize: "15px", color, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
          {steps[step]}
        </div>
      </div>
    </div>
  );
}


// ─── Robust JSON Repair ───────────────────────────────────────────────────────
function repairJSON(raw) {
  // Strip markdown fences and find outermost {}
  let s = raw.replace(/```json|```/g, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1) throw new Error("No JSON object found");
  if (end !== -1 && end > start) s = s.slice(start, end + 1);
  else s = s.slice(start);

  // Try direct parse first
  try { return JSON.parse(s); } catch {}

  // Walk character by character tracking state, truncate at last clean boundary
  const stack = [];   // '{' or '['
  let inString = false;
  let escape = false;
  let lastSafe = 0;   // index after last complete value at root/top level

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\" && inString) { escape = true; continue; }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === "{" || ch === "[") {
      stack.push(ch);
    } else if (ch === "}" || ch === "]") {
      stack.pop();
      if (stack.length === 0) lastSafe = i + 1;
    } else if ((ch === "," || ch === ":") && stack.length <= 1) {
      // potential recovery point after a complete sibling value
    }
  }

  // If we ended inside a string, close it
  let fixed = s;
  if (inString) fixed += '"';

  // Close remaining open structures in reverse
  const remaining = [...stack].reverse();
  for (const ch of remaining) {
    fixed += ch === "{" ? "}" : "]";
  }

  // Try repaired version
  try { return JSON.parse(fixed); } catch {}

  // Last resort: truncate to last known safe boundary and close
  let truncated = s.slice(0, lastSafe);
  // Re-close from scratch
  const stack2 = [];
  let inStr2 = false, esc2 = false;
  for (let i = 0; i < truncated.length; i++) {
    const ch = truncated[i];
    if (esc2) { esc2 = false; continue; }
    if (ch === "\\" && inStr2) { esc2 = true; continue; }
    if (ch === '"') { inStr2 = !inStr2; continue; }
    if (inStr2) continue;
    if (ch === "{" || ch === "[") stack2.push(ch);
    else if (ch === "}" || ch === "]") stack2.pop();
  }
  for (const ch of [...stack2].reverse()) truncated += ch === "{" ? "}" : "]";
  return JSON.parse(truncated);
}


// ─── Chat View Component ──────────────────────────────────────────────────────
function ChatView({ messages, setMessages, input, setInput, loading, onSend, selectedTeam, selectedPosition, myTeam, report, positionReport, chatBottomRef }) {

  useEffect(() => {
    chatBottomRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  const contextColor = selectedTeam?.color || "#7c3aed";
  const hasSomeContext = selectedTeam || selectedPosition || report || positionReport;

  // Suggested starter questions
  const suggestions = selectedTeam ? [
    `What are ${selectedTeam.name}'s biggest defensive weaknesses?`,
    selectedPosition ? `How should a ${selectedPosition.label} attack ${selectedTeam.name}?` : `What's the best offensive gameplan vs ${selectedTeam.name}?`,
    `What does ${selectedTeam.name} do on 3rd and long?`,
    `Who are the key players to watch on ${selectedTeam.name}?`,
  ] : [
    "Select an opponent in the sidebar to get team-specific answers",
    "What does a high pass rush win rate mean?",
    "Explain NGS separation rate and why it matters",
    "What are the most important NGS stats for evaluating a QB?",
  ];

  const formatMessage = (content) => {
    // Convert **bold** and bullet points to styled elements
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
            <span style={{ color: contextColor, fontWeight: "700", flexShrink: 0 }}>›</span>
            <span>{line.replace(/^[-•] /, "").replace(/\*\*(.*?)\*\*/g, "$1")}</span>
          </div>
        );
      }
      if (line.trim() === "") return <div key={i} style={{ height: "8px" }} />;
      // Bold text
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={i} style={{ marginBottom: "2px" }}>
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**")
              ? <strong key={j}>{part.slice(2, -2)}</strong>
              : <span key={j}>{part}</span>
          )}
        </div>
      );
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", overflow: "hidden" }}>

      {/* ── Context banner ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap",
        padding: "10px 24px", background: "rgba(0,0,0,0.02)",
        borderBottom: "1px solid rgba(0,0,0,0.07)", flexShrink: 0,
      }}>
        <span style={{ fontSize: "11px", color: "#9a8e7e", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase" }}>Context:</span>
        {selectedTeam ? (
          <span style={{ fontSize: "12px", background: `${selectedTeam.color}18`, border: `1px solid ${selectedTeam.color}44`, color: selectedTeam.color, padding: "2px 8px", borderRadius: "4px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: "700" }}>
            🏈 vs {selectedTeam.name}
          </span>
        ) : (
          <span style={{ fontSize: "12px", color: "#9a8e7e", fontStyle: "italic" }}>No opponent selected</span>
        )}
        {selectedPosition && (
          <span style={{ fontSize: "12px", background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.1)", color: "#5a5040", padding: "2px 8px", borderRadius: "4px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: "700" }}>
            👤 {selectedPosition.label}
          </span>
        )}
        {myTeam && (
          <span style={{ fontSize: "12px", background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.1)", color: "#5a5040", padding: "2px 8px", borderRadius: "4px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: "700" }}>
            🏟️ {myTeam.name}
          </span>
        )}
        {(report || positionReport) && (
          <span style={{ fontSize: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "2px 8px", borderRadius: "4px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: "700" }}>
            ⚡ Report data loaded
          </span>
        )}
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} style={{
            marginLeft: "auto", fontSize: "11px", color: "#9a8e7e",
            background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: "4px", padding: "2px 8px", cursor: "pointer",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: "600",
          }}>✕ Clear chat</button>
        )}
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="fade-in" style={{ maxWidth: "640px", margin: "0 auto", width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ fontSize: "38px", marginBottom: "10px" }}>💬</div>
              <div style={{ fontSize: "26px", fontWeight: "900", fontFamily: "'Barlow Condensed', sans-serif", color: "#1e1a14", letterSpacing: "0.05em", marginBottom: "6px" }}>
                ASK INTEL
              </div>
              <div style={{ fontSize: "14px", color: "#7a6e5e", lineHeight: 1.6 }}>
                Ask anything about your opponent, scheme tendencies, player matchups, or NGS stats.
                {(report || positionReport) && " I have your scouting report data loaded and ready."}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => { setInput(s); }} disabled={!selectedTeam && i < 2} style={{
                  padding: "12px 14px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)",
                  background: "white", cursor: selectedTeam || i >= 2 ? "pointer" : "default",
                  textAlign: "left", fontSize: "13px", color: "#5a5040", lineHeight: 1.4,
                  fontFamily: "'Barlow', sans-serif", transition: "all 0.15s",
                  opacity: !selectedTeam && i < 2 ? 0.4 : 1,
                }}
                onMouseEnter={e => { if (selectedTeam || i >= 2) e.target.style.background = "#f5f0e8"; }}
                onMouseLeave={e => { e.target.style.background = "white"; }}
                >{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "100%",
          }}>
            {msg.role === "assistant" && (
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: contextColor, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: "700", flexShrink: 0,
                marginRight: "10px", marginTop: "2px",
                fontFamily: "'Barlow Condensed', sans-serif",
              }}>AI</div>
            )}
            <div style={{
              maxWidth: "72%",
              padding: "12px 16px",
              borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: msg.role === "user"
                ? `linear-gradient(135deg, ${contextColor}, ${contextColor}cc)`
                : "white",
              color: msg.role === "user" ? "white" : "#1e1a14",
              fontSize: "14px", lineHeight: 1.6,
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              border: msg.role === "assistant" ? "1px solid rgba(0,0,0,0.07)" : "none",
            }}>
              {msg.role === "assistant" ? formatMessage(msg.content) : msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: contextColor, color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: "700",
              fontFamily: "'Barlow Condensed', sans-serif",
            }}>AI</div>
            <div style={{
              padding: "12px 18px", borderRadius: "16px 16px 16px 4px",
              background: "white", border: "1px solid rgba(0,0,0,0.07)",
              display: "flex", gap: "5px", alignItems: "center",
            }}>
              {[0,1,2].map(j => (
                <div key={j} style={{
                  width: "7px", height: "7px", borderRadius: "50%",
                  background: contextColor, opacity: 0.7,
                  animation: "bounce 1.2s infinite",
                  animationDelay: `${j * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div style={{
        padding: "14px 20px", borderTop: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(245,240,232,0.95)", flexShrink: 0,
      }}>
        <div style={{
          display: "flex", gap: "10px", alignItems: "flex-end",
          background: "white", border: `1.5px solid ${loading ? contextColor + "44" : "rgba(0,0,0,0.12)"}`,
          borderRadius: "12px", padding: "8px 12px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          transition: "border-color 0.15s",
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={selectedTeam ? `Ask anything about ${selectedTeam.name}...` : "Select an opponent, then ask me anything..."}
            rows={1}
            style={{
              flex: 1, border: "none", outline: "none", resize: "none",
              fontSize: "14px", fontFamily: "'Barlow', sans-serif",
              color: "#1e1a14", background: "transparent", lineHeight: 1.5,
              maxHeight: "120px", overflowY: "auto",
            }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || loading}
            style={{
              width: "34px", height: "34px", borderRadius: "8px", border: "none",
              background: !input.trim() || loading ? "rgba(0,0,0,0.08)" : contextColor,
              color: !input.trim() || loading ? "#9a8e7e" : "white",
              cursor: !input.trim() || loading ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", transition: "all 0.15s", flexShrink: 0,
            }}
          >↑</button>
        </div>
        <div style={{ fontSize: "11px", color: "#b0a090", marginTop: "6px", textAlign: "center", fontFamily: "'Barlow Condensed', sans-serif" }}>
          Enter to send · Shift+Enter for new line · Answers based on 2024 NFL NGS data
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function NFLScoutApp() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [myTeam, setMyTeam] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("offense");
  const [appMode, setAppMode] = useState("coach"); // "coach" | "position"
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [positionReport, setPositionReport] = useState(null);
  const [positionLoading, setPositionLoading] = useState(false);
  const [positionError, setPositionError] = useState(null);
  const [cacheHit, setCacheHit] = useState(false);      // true when loaded from cache
  const [cachedKeys, setCachedKeys] = useState([]);     // list of stored cache keys
  const [chatMessages, setChatMessages] = useState([]);  // [{role, content}]
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [apiKey, setApiKey] = useState(getStoredApiKey);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!getStoredApiKey());
  const reportRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Load cache index on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("cache-index");
        if (result) setCachedKeys(JSON.parse(result.value));
      } catch {}
    })();
  }, []);

  const saveToCache = async (key, data) => {
    try {
      await window.storage.set(key, JSON.stringify(data));
      const newKeys = cachedKeys.includes(key) ? cachedKeys : [...cachedKeys, key];
      await window.storage.set("cache-index", JSON.stringify(newKeys));
      setCachedKeys(newKeys);
    } catch {}
  };

  const loadFromCache = async (key) => {
    try {
      const result = await window.storage.get(key);
      if (result) return JSON.parse(result.value);
    } catch {}
    return null;
  };

  const clearCache = async () => {
    try {
      for (const key of cachedKeys) {
        await window.storage.delete(key);
      }
      await window.storage.delete("cache-index");
      setCachedKeys([]);
    } catch {}
  };

  const teamColor = selectedTeam?.color || "#3b82f6";

  const filteredTeams = NFL_TEAMS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.abbr.toLowerCase().includes(search.toLowerCase())
  );

  const generateReport = async (team) => {
    setSelectedTeam(team);
    setReport(null);
    setLoading(true);
    setError(null);
    setCacheHit(false);
    setActiveTab("offense");
    setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

    const cacheKey = `coach-report:${team.abbr}`;
    try {
      // Check cache first
      const cached = await loadFromCache(cacheKey);
      if (cached) {
        setReport(cached);
        setCacheHit(true);
        setLoading(false);
        return;
      }
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          "x-api-key": apiKey,
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 8000,
          system: SYSTEM_PROMPT,
          messages: [{
            role: "user",
            content: `Generate a complete pre-game scouting report for the ${team.name} (${team.abbr}) based on their 2024 NFL season performance and NGS data tendencies. Include realistic, plausible stats that reflect their known identity and player personnel. My team is ${myTeam ? myTeam.name : "unknown"}.`
          }]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.map(b => b.text || "").join("") || "";
      const parsed = repairJSON(text);
      await saveToCache(cacheKey, parsed);
      setReport(parsed);
    } catch (e) {
      setError(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generatePositionReport = async (position, team) => {
    setPositionReport(null);
    setPositionLoading(true);
    setPositionError(null);
    setCacheHit(false);
    const posKey = `pos-report:${team.abbr}:${position.id}`;
    try {
      const cached = await loadFromCache(posKey);
      if (cached) {
        setPositionReport(cached);
        setCacheHit(true);
        setPositionLoading(false);
        return;
      }
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 16000,
          system: POSITION_SYSTEM_PROMPT,
          messages: [{
            role: "user",
            content: `Generate a personalized pre-game scouting report for a ${position.label} (role ID: ${position.id}) preparing to face the ${team.name} (${team.abbr}) in the 2024 NFL season.

${position.id.includes('_COACH') ? `This is a POSITIONAL COACH report. The ${position.label} needs to know everything about the opponent players and units that their own players will face. Generate 4-5 detailed sections covering: (1) the specific opponent unit matchup, (2) individual opponent player breakdowns with NGS stats, (3) scheme tendencies relevant to coaching this position group, (4) practice week focus areas and technique adjustments, (5) game-day situational tendencies. Make it a complete coaching intelligence brief.` : `Focus exclusively on what a ${position.label} needs to know as a player. Make it deeply specific and actionable.`}

Use realistic 2024 NGS-style statistics. Write the personalGameplan in second person directly addressing this coach/player.`
          }]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.map(b => b.text || "").join("") || "";
      const parsedPos = repairJSON(text);
      await saveToCache(posKey, parsedPos);
      setPositionReport(parsedPos);
    } catch (e) {
      setPositionError(`Error: ${e.message}`);
    } finally {
      setPositionLoading(false);
    }
  };

  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    const userMsg = { role: "user", content: text };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);
    try {
      const systemPrompt = CHAT_SYSTEM_PROMPT(selectedTeam, myTeam, selectedPosition, report, positionReport);
      // Build messages for API (keep last 20 for context window)
      const apiMessages = newMessages.slice(-20).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: systemPrompt,
          messages: apiMessages,
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.content?.map(b => b.text || "").join("") || "";
      setChatMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const saveApiKey = (key) => {
    try { localStorage.setItem("nfl-scout-api-key", key); } catch {}
    setApiKey(key);
    setShowApiKeyInput(false);
  };

  const clearApiKey = () => {
    try { localStorage.removeItem("nfl-scout-api-key"); } catch {}
    setApiKey("");
    setShowApiKeyInput(true);
  };

  const threatColor = (v) => v >= 8 ? "#f87171" : v >= 6 ? "#fbbf24" : "#4ade80";

  if (showApiKeyInput && !apiKey) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#f5f0e8",
        fontFamily: "'Barlow', sans-serif",
        color: "#1e1a14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap');`}</style>
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "48px",
          maxWidth: "480px",
          width: "90%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          textAlign: "center",
        }}>
          <div style={{
            width: "56px", height: "56px",
            background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
            borderRadius: "14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "28px",
          }}>🏈</div>
          <h1 style={{
            fontSize: "28px", fontWeight: "900", letterSpacing: "0.1em",
            textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif",
            margin: "0 0 8px",
          }}>NGS Scout</h1>
          <p style={{ color: "#9a8e7e", fontSize: "14px", margin: "0 0 28px", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
            Enter your Anthropic API key to get started
          </p>
          <form onSubmit={e => {
            e.preventDefault();
            const key = e.target.elements.apikey.value.trim();
            if (key) saveApiKey(key);
          }}>
            <input
              name="apikey"
              type="password"
              placeholder="sk-ant-..."
              autoFocus
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "15px",
                border: "2px solid rgba(0,0,0,0.12)",
                borderRadius: "10px",
                fontFamily: "'Barlow', sans-serif",
                outline: "none",
                marginBottom: "16px",
                boxSizing: "border-box",
              }}
            />
            <button type="submit" style={{
              width: "100%",
              padding: "12px",
              fontSize: "15px",
              fontWeight: "700",
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}>Connect & Launch</button>
          </form>
          <p style={{ color: "#b0a898", fontSize: "12px", marginTop: "20px", lineHeight: 1.5 }}>
            Your key is stored only in this browser's localStorage and sent directly to the Anthropic API. It is never stored on any server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f0e8",
      fontFamily: "'Barlow', sans-serif",
      color: "#1e1a14",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: #f5f0e8; }
        ::-webkit-scrollbar-thumb { background: #c9bfaa; border-radius: 3px; }
        input::placeholder { color: #475569; }
        .team-btn:hover { background: rgba(255,255,255,0.08) !important; transform: translateY(-1px); }
        .tab-btn:hover { background: rgba(255,255,255,0.05) !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
        .fade-in { animation: fadeIn 0.5s ease forwards; }
        .no-print { }
        .print-only { display: none; }
        .pos-btn {
          display: flex; flex-direction: column; gap: 4px;
          padding: 14px 16px; border-radius: 10px;
          background: rgba(0,0,0,0.03);
          border: 1.5px solid rgba(0,0,0,0.08);
          cursor: pointer; text-align: left;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
        }
        .pos-btn:hover {
          background: rgba(0,0,0,0.06) !important;
          transform: translateY(-1px);
        }
        .pos-btn.selected {
          transform: none;
        }
        @media print {
          @page { margin: 0.55in; size: letter portrait; }
          body { background: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .print-area { display: block !important; position: static !important; overflow: visible !important; height: auto !important; padding: 0 !important; }
          .print-section { page-break-inside: avoid; margin-bottom: 16pt; }
          .print-page-break { page-break-before: always; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="no-print" style={{
        background: "rgba(245,240,232,0.95)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img src="data:image/png;base64,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" width="28" height="28" style={{objectFit:"contain"}}/>
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "900", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>
              NGS Scout
            </div>
            <div style={{ fontSize: "12px", color: "#9a8e7e", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" }}>
              Next Gen Opponent Intel
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Cache indicator */}
          {cachedKeys.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "5px",
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: "6px", padding: "4px 10px",
              }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                <span style={{ fontSize: "11px", color: "#15803d", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: "700" }}>
                  {cachedKeys.length} CACHED
                </span>
              </div>
              <button onClick={clearCache} title="Clear all cached reports" style={{
                fontSize: "11px", color: "#9a8e7e", background: "rgba(0,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.1)", borderRadius: "5px",
                padding: "4px 8px", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: "600",
              }}>✕ Clear</button>
            </div>
          )}
          {/* Mode Toggle */}
          <div style={{
            display: "flex", gap: "2px", background: "rgba(0,0,0,0.07)",
            borderRadius: "8px", padding: "3px",
          }}>
            {[{ id: "coach", label: "📋 Coach View" }, { id: "position", label: "🏈 My Position" }, { id: "chat", label: "💬 Ask Intel" }].map(m => (
              <button key={m.id} onClick={() => setAppMode(m.id)} style={{
                padding: "5px 12px", borderRadius: "6px", border: "none",
                background: appMode === m.id ? "white" : "transparent",
                color: appMode === m.id ? "#1e1a14" : "#9a8e7e",
                fontSize: "13px", fontWeight: "700", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em",
                boxShadow: appMode === m.id ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                transition: "all 0.15s",
              }}>{m.label}</button>
            ))}
          </div>
          <span style={{ fontSize: "13px", color: "#9a8e7e", fontFamily: "'Barlow Condensed', sans-serif" }}>MY TEAM:</span>
          <select
            value={myTeam?.abbr || ""}
            onChange={e => setMyTeam(NFL_TEAMS.find(t => t.abbr === e.target.value) || null)}
            style={{
              background: "rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: "6px",
              color: "#1e1a14",
              fontSize: "14px",
              padding: "4px 8px",
              cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            <option value="">Select team</option>
            {NFL_TEAMS.map(t => <option key={t.abbr} value={t.abbr}>{t.abbr} – {t.name}</option>)}
          </select>
          <button onClick={clearApiKey} title="Change API key" style={{
            display: "flex", alignItems: "center", gap: "5px",
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: "6px", padding: "4px 10px", cursor: "pointer",
          }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            <span style={{ fontSize: "11px", color: "#15803d", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: "700" }}>
              API KEY
            </span>
          </button>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>

        {/* ── Team Selector Sidebar ── */}
        <div className="no-print" style={{
          width: "280px",
          minWidth: "280px",
          background: "rgba(238,232,220,0.8)",
          borderRight: "1px solid rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 64px)",
          position: "sticky",
          top: "64px",
          overflow: "hidden",
        }}>
          <div style={{ padding: "20px 16px 12px" }}>
            <div style={{ fontSize: "13px", color: "#9a8e7e", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "10px" }}>
              Select Opponent
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search teams..."
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.05)",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: "8px",
                color: "#1e1a14",
                fontSize: "15px",
                padding: "8px 12px",
                outline: "none",
                fontFamily: "'Barlow', sans-serif",
              }}
            />
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}>
            {["AFC", "NFC"].map(conf => (
              <div key={conf}>
                <div style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#b0a090",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  padding: "8px 8px 4px",
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>{conf}</div>
                {filteredTeams.filter(t => t.conf === conf).map(team => (
                  <button
                    key={team.abbr}
                    className="team-btn"
                    onClick={() => generateReport(team)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "none",
                      background: selectedTeam?.abbr === team.abbr ? "rgba(255,255,255,0.08)" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      marginBottom: "2px",
                    }}
                  >
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                      background: team.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: "900",
                      color: "white",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      letterSpacing: "0.02em",
                      border: selectedTeam?.abbr === team.abbr ? `2px solid ${team.color}` : "2px solid transparent",
                      boxShadow: selectedTeam?.abbr === team.abbr ? `0 0 12px ${team.color}66` : "none",
                    }}>{team.abbr}</div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#111111", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.03em" }}>
                        {team.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#b0a090", fontFamily: "'Barlow Condensed', sans-serif" }}>
                        {conf} {team.div}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="print-area" style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }} ref={reportRef}>
          {appMode === "position" && <PositionView selectedTeam={selectedTeam} selectedPosition={selectedPosition} setSelectedPosition={setSelectedPosition} positionReport={positionReport} positionLoading={positionLoading} positionError={positionError} generatePositionReport={generatePositionReport} cacheHit={cacheHit} />}
          {appMode === "chat" && (
            <ChatView
              messages={chatMessages}
              setMessages={setChatMessages}
              input={chatInput}
              setInput={setChatInput}
              loading={chatLoading}
              onSend={sendChatMessage}
              selectedTeam={selectedTeam}
              selectedPosition={selectedPosition}
              myTeam={myTeam}
              report={report}
              positionReport={positionReport}
              chatBottomRef={chatBottomRef}
            />
          )}
          {appMode === "coach" && <>

          {!selectedTeam && !loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "20px", opacity: 0.5 }}>
              <div style={{ fontSize: "76px" }}>
              <img src="data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCADIAMgDASIAAhEBAxEB/8QAHQAAAQQDAQEAAAAAAAAAAAAAAAMEBQYCBwgBCf/EAE0QAAECBAQCBwUFBQUDDAMAAAECAwAEBREGEiExQVEHEyJhcYGRCBQyofAVQrHB0SNSYoLhFiRykvFDY8IzNTY3RFNkdJOUorKz0uL/xAAbAQABBQEBAAAAAAAAAAAAAAAAAgMEBQYBB//EADIRAAICAgAEAwYFBAMAAAAAAAABAgMEEQUSITEiQVEGExQyYXEjgaGx8CUzUtFCkeH/2gAMAwEAAhEDEQA/AOy4IIIACCCCAAggggAIIIIACCCCAAggggAIIYVmr0ujSapuq1CVkmE7uPuhCfUxqPF/tGYOpalM0RqarbwNrtJ6tq/+JQufIGEynGPdkrGwr8l6qg2brjFa0pHaIAjkfEXTx0lVdla6ZLSFBlSLhYbC3Mv+Jeh8kiKNVatiauOK+3cWVaoJKwFNiZUlo96RcD5QxLKguxeUezGTP+5JL9Tter4twvR/+dMQ0uTPJ6aQg+hMVqc6Z+jSV+PFco5y6hC3b+GRJjjMUtlogqlWy5YhSlqzknSx122+ZjIrShkN2UlJSLBAsoC2vf8AOGpZnoi0r9ka9eKbOtJn2gejdpQSicqT19slPdF/8wENj7RGABuisC/Eylh81RyYtSVftMiiFEkZlkiGj5R8fVI0AFvK/wCcNvMn5IfXsnjLvJ/z8jr5n2jejFdi5PzzIPFcqTb0vExTOnLovqFg1iqXbP8Av2nGh6qSBHC0ytJUVFtIskac4ZLcTmISAbQLMn5oRP2VxvKTPpTQsQ0Ous9bR6vIz6f/AA76V29DEqI+Z9GqU9SJ1mp0mffp880rMh5lZSfDTh3GO4fZ66TGekHCSROvNCuyQCJ1tNh1nJ1I5K48jeJNWQrHp9DOcU4LLCXPF7j+xs4wQQRJKQ9ggggAIIIIACCCCAAgggMABBCE7NSsjKOTU5MNS8u0nM446sJSkcyToI0xivpYr+IPeKf0V0V6fSyD11XcZPVI0/2QOij4+hhMpJD9GPZc/Cunr5G0MXYtw/hWTEzXKg1LZzZpr4nHTyQgaqPhGiOkXp5xI5NrpeFaI7TFqTo9OtXmFcrNnRN++/lEtgXAcxQainGePKwucrS0kpbdWHCLi1yTppfQJsBziw1+lYZ6QaU5N0+bkxUWQlszDbgUpFtciyg6p34njDM3Jr0LKiGNRb41zpefkc31BisVqqJn8TVSaqbxClBCl9apIvcjeydL2tYRj9noYUUyjTMs2SFJUQFOEAm59Py1i3zmH1S63G35hSEtrKOqY7Cbg2Oo1+ZiHakmE15zIhI92aDaiB8S1G9r8bZRz+LbSIE9vubSi9RguTsRyafkSSR1jqr5vvE6g/ifkfJOYYf+EDKCRrbUnvA02CfIRYHGWgtK75SLacARcn8B3w3XLJypIPw2T476fXIw2ToXehVppha2ySsna6hpqbH8fzG8M1suF3q0FKQlXAd+X8x8+GkWlUq2lAzlIzAA8zolN/DU+sRc88ykAspCri4zd6rj8P0tASoT2QfUqKMoza5bXFrAp0PfxiImnpRyYCBNG/a1QklN+RI2NzaJmpVMstOuWKgmx7J1Gt7+WvpflFbnerQ+HkNFTblymxOyiCpP/EPSFRjzEbLy3VrX5/YXm2ljtJGoV2RqNt/nEa7mvkCb6AXiWlFompJttDyFupBSdd8ul+7blDF9CWpgtuOZFEEgA2Jt4xxrT0O++hOtTT7jYBSlEJF7Ra+jDFkzgPHlMxGyXFsskiaaQoJ6xlQspOvqO8CKo+QyQUDtef6QpnBOYpSbAgX7+XfvCodGmQsyKnTKLXc+mdLnZapU2WqMm6l2XmmUPNLGykKAIPoYI137MVRNQ6GaIFKuuVSuWV3ZVGw/ylMEWye1s8vthyTcfQ2bBBBChsIIIIACCCCAAMVfpBxzQcEUhU/WZiylXDMu2QXXjySPxOwiH6WekiQwVKtycuz9oV2bFpOQQbqN9AtQGoTfzOw4kalwZgHEPSBXv7U44mJjqs3ZSsZFEAnsNp+4gbX33txMNSlvpEscTDhKPvbnqK/7f2PKrIdJXS3U5Z2qy7tFw46ouMyxNm0pFrKWN3FEEWB05W1i8zdcwR0RUqVoaph91951OZhlPWPKKrAuKSPhFgNO7S5icYx3hOcxNMYRlKmszTLPadQDkBNxkS4dCsWvaNQ1zCsvSK6+j3sVBxS+sVNvHO66ebh/e3/oNIam1Bb7sn0t5f4EvDBdUi1dLOHKbXJhnFchV3H23mkoDCnbtBN9C2OB5p/S0VCiNKo6s0m840sixKDluOKdOEN6q9JyrTKX1kpQsuNMpKioqAtdKRudRwhuk1SbcQEpNPYNwtSrKdseI4J0JOpV3gQxObk9ltjY7qr903tCGf3RTsrJXmJt5xaylxRIbzX7SydRufHwhSRkW5KRal1dtYIK1HdSlEZlHnrc+cLSjTck0EMAjMq61qUSpSiCCVE8b/gIbvzGa103SrW1xroT+RhmRYVV6e/IZzKkpIBTmta52Ave/wCERs46vq3ATqL6eOu3iDw490SEwtOY5jc2PeFaa7eKvURHTAUQMi0BYJtc6aWH5Dw1hsnVkXNrdc6w5tRex1AA1Iv3DMDysnvivz7k8uqutSymrNoK0oWLlV1m1jfS17bflEzUXVJmES8s3ncWCSCbAJAy3Nhe9tOdzp3RU42JyV683ln2ypGdJvlI3AJ0ynU27knhCor1FWS2+WD6/wA6EExPNsybrakqH7VQbKrnNrYA2vxAGnA8jEMoqdKWQGgSMyik6BOwIPIeVikxLT1MCJhYYfdU47dYKibJUOJtzB1+WkeNS5Yl1vvlKDcqXYEBIvfge8/lwiQuVfKV3w91k1G75YiomkU2T7bgAHPs5iT5C/nwivuvvVGZCv2pdzgocSeyG73seXhvfuh/PpfmnC2lpa1LA6ptJuLX+LhcG41Go7rw7lpBEk2G0pyk2zXTYk2troPw9YQly9fMVY5ZM1GvpBDd1pBRZV1FIABNgfG2wjxlhLryUA2Frkbg7Qs4yvIs8DdQ0hzT0JRLqfSFDMeyTtYcRz3hMUSch9NHXPsczHWdH9TluDFSUAOQLSIIjvYqWpWFK+FG/wDfkH1R/SCLOHyo84zf78joGCCCFkYIIIIAAxrrpp6SZTAtJSzKpRN12aGWVluCATbrF8QkfMjxImuk/GkhgfDLtVnAHX1fs5WXBsp907JHdxJ4CNP9B1KnMS4jqmOsVSqZ2YdUEMuOpuhsndCEnTKkW8PWGpye+VFjiYy5HkWrwr9X6HnQPhesTmIJjH1eUmZcfStSHpoXW6tVrrTf4UgAgHyEXzG77mM8HPN4OxJLISHyiYLRBDqU3zNZgbouePLxuIzpvFeZw9KyFGaQ1RXQUTrjKylxCLDI2LbNm+tr8uMa3o8i9SpCa9xmnpRcygpUppRSO4kbG2sNSlyLlLCFEs78eLS12X0MqTSk0/NnYaSoHLlSgJAtwHmTDFcy685MydJUVHMrr5p4lSG1WGm3aVt4W1Owjx91xTqaRJPkOoZAefVYllBBsrXdR1te/EnaHMt7vJyrctLoAbQNBt4/PjvfxiNKWy7Ud9jCWkZeRWt0JU6+sKzOuEFagNbEgWy76DTQbRktSlWzHY32J4277/Pj4whMTOVJOaxPcdrf04f1hzh1lupVJSH5huUlGm1uzMw5dQabTmNzrzAGnMQlbk+VD0tQhzy7IYrKlalNgADew7uY5j5wycJKs3oOA9fP1iUrrD1OnXJGbbQhaQFJUg3Q4gi6VoI0KTwPjEJNu2QbD5X7+R5Q3JOL1ImUuM1uL2hrNqWGgArsm3PQHS+/Ds+kR77ywrMTod9NPw8RbaHKysOJKjcE7Dfn57n5QxeW3lupQUO7uH9Dt+kJJUI6IpLy3K0+VpNywjKP5jp8vnrEJVppxlcz1BKSo5r7ZgAAQNDw17onag57u+1NJGVsdhZA+EX0J02HPS1z5RqaY25UXcq0ONCxWhdyFXzXA5af6C8Ow0ntkPKU+VVwens8lULLCJiaShT4SDmSLXJFzp+kRlTmFvLLbbKVMpSc4PZvsAQRqRyItqIl5rLTUe7MOpCXSbOLR2UK3ANjsdeJtCdKp6UtpeK1Zc6lpbyZUpUTqRrf9YUly+IRbZOeqF+YjR5P3dCnVICFL1SnLfIDw217zxtBNpVnShAuAbDe2v1yh9N6i3PvuNvH8xDUpBTZR03Onf4fXrCW9vZLrgqo8qIufWpLaUJNy5w428IzfCJdpDLYFgnfvjxFnnnZlRUENDs7DXh87+kMHX1qIF9oVEiZE29yOuvYrQRhCuOnZc8gDyR/WCJL2OZYs9Gc2+Rbr6k4R4BCBBFjD5UefZb3dJm7IIIIWRwMNqlOytOkH56deQzLMNqcdcWbBKQLkmHMaH9oLEFTxFW2ejnDTa5hYAfqXVHe1lIaP/2P8ohMpaRIxcd32KPZef2IClSMz04YvqNdnZtcjR6d+wp0sLFxINznP+IC58AOEWbpTxEjDtFRgTCbqZSfVLJ610HtSrJ0BH+8Ub2PDUw4oErT+izo2fq06yV1B1KSWUfG86dENDwvrwF1GIDEWM5PE2F2J1zDz0tXC2P2RGiFX1HWDQpG9j+MMN6XXuXDfvblFLdUe2u33GAxBiVvCLVHcn2pkdWGVvvC7hQBY3OxvYDb1isVGoTUy6un08oL6Dd1xVihkW4gbrINwnz8fapOTM5PfZcootkWMy6EgllJuBYfvK7VjpYC/KMmGJeUaS00OrTbbQ377nW55635mI8pPzLynHrhvkWtmclLNSjPVt3Ot1KVqtajupR4nw7uUYTC0j71rgjXS36cISMw0h5lakB3I4CpBsAe46a6X3HKHuOcW0SlYqqdKRg+VmFS0wplpSZt0ZgNrpBh/FwrcxtV+QxncQo4ek7d9SPk5Sbn30S8rLuTL6yEhKBe9/o93hC9dUcrOAaFMszNXqbqG6jMIJLbNvhZuL8RmWRppyELYsl+kNODV1WQkJGk0hSltTbFMFnWcpKSHlElRGhvqQOMUTpDpmGqS1S1YXrTlQdfly7NfF+zVmItfKNLpIFwDx4xf8N4XCmfPN7l5fT7mU4tx2eVX7qtcsf1ZZvfXKBUFYAxlMthqVI9xqTZzmSWoC472SSQU8N7QhVZWZp06qTm2wl1FjmSQpDiT8K0EfEki1iIrmFpvCK5CuzGMzPP1dTS1SjiRdRdNwSq6hmVcggEfdOvCFaPV5+l0KRp+L5OZZoU3c0morZJXLK8Ny2eKTrY3TCeLcNhbucOkv3+w9wDjE8T8KzrB/oOJk5k5bHmNNQdN+W+2/lDBQtqNDpY3vxFuPDT0vD6oy7krMmWmAgqyBaHEKCkOJPwrSRcEG9we/bSGLgusanKDcXII2O3PflaMlKLi9M9HqsjZFSi9piazmt3bDhb6vxhnNOsSLWVlKUOKBLaANyO8eI9YerCUWsneGdQllOONzLLvUuNjKTYqCknha8LiIvcuXwdyJk5b3yfU/nSSLKdKUGyt9COCh+HgImVKS01ZKOyAQBfYRnLNpZl0NJXnyC2a2p9LwzmFqSsJSbbG438f9BfuhcnsjUU+7j17sbuqUF2vdV77nX53/1hnU5lbUtYW6xStLm1vq31weBIUpRVt8gPruiOY/vs+uYczmWlrgKGgBHz17oSPTk9aXcbT2SUp6GEkFagFKIFieURskkqfF+cOqrM9a6tatSo3jClNFyYQlO6zYeMLitvRBy3yxO8PZpkPs/odoqSLF/rHz/MtVvkBBFxwXTU0fCNIpSQAJWTaaNuYQAT6wRZRWlo8/sfNNsmIIIDHRBW+kjFMvg/B87XH8qltJysNk/8q6o2QjzJHzPCNP8As+UqqPVCo4uqTqluTmZClKAJecUrMpQPADb5cIw6bcT0yr9K9GwtUpot0SkupfqCk6pL6vgB7kgj/OeUXXpEdn6Z0azzeFJNHXqYDTJZsgMIUbKcA27IKlacQIacvF9i3hGVGPyJeKzz+hEdI7FNxLKSmJpetMvydNDqeqzBTJVfKpVxssWKde/aNb1iqtysotSBomwSkHVRJsEjvJsBEbTaVL02mN05tDglwBmRnICyDe5566w0dCpqsNsAXZlh1rhAKrqOiRextpmNtDteIttm3s0WFiyx6+RvY4p8p7u0VzJSuYcPWOrAHaUfLYWAEYPP6lQIOmo0476jX1+cKvv5OxmOYXvqR577/VuEMZeXnJyfTKSsq484sjI22kk78tzvy8TDDeycoqPV9h5QJcVCuyTC+zL9ZnmHDmAQ0nVaieACQd9Noa9HjzeKenNqoTaApt+bfnUoIuCpIU4geoEY4tqEphqjzFBlJtmYrM6nq51bdimVa0JYCgSFKP3iL2tbiYbVCYw5hNeGK7hCrrnaswrr5xsJUpGYWCkgkAgXSrcXIVe+0avhGPKimUmusuiMH7QZ0czIUIPpE6P6OeqXhyclHWUnO+vrUqbCc2YAm6ciL31+6Lxy4zVpTo+6UKk6mnN1CWkZx5hDLx7PVhZTtsTYaX0vrwjdVD6S8JUei1qoyam5VpxPvyJE9l1EyQEuNW71ZSDt21fumNTUSmSNIlHekfHo6xUy6t+nU1YsuacUb51DgjW+vjyBdqsVHPKzsV9ePZkzjXUtyFaZSqXIl7pGx3LIlW5p4vU+jIBBmVk3zlKiSE3INiflYHa9aTSsaYVS2/Lh2mTzCVpCk2Ui4uCORF9/xjVUt710mTryMZ4fnZOZbYU7IzzSC22GlHsoKTYKsduJBN9oZYLxJUujqu/2UxOSaYVZmJhIUerB2UgjdF907jeKu3KnbZzvt5GinwauNHu63u6PVr1X0Iiek5/A1Ubw7iRa38NzDhVTallK1Siidlfw6jMnwKYVqTb9PmOoeypJGdC0qCkuoPwrSR8SSLWNo2n0mztEl6LItVilOVGhVReR+aYNwwCLpWk21OoIt3+EVKRww5S35fBVQnG6lSp9ov4cqaFWKFnVKL3+FRsCngTeE2UQytyj8yW/uK4bm38OhF2rdcnpP0ZU2XM9+yU258oF9YpVwb+f9YWYaQEm9817EHgRCbpzX4XimZsnLYkySUlBHDQ84ZTSB8N7HQns3/Iw6c7IUNzfSGykpylbnZAHIaQk4RlSeEvL2RYLcOTQjS/M/XlHk6j7MpaZdKUpfWM7tje59BClKSqZmHKnMNBLDPZauPiuIi6lMqfmFOKJzK3joLrLfkRDpUTcnWNgdA9CXXuk6g09TWdv3pLzg4ZEdtV/JMa+Xq6rujp32J8OF2r1fEzyDllmhKskj7yzdRHgAP8AND9K3IpeL3clTZ1VBBBE0xIRF4qrErh/DtQrc6q0vJS63166kJBNh3naJSNG+2DiL7PwTT8PNLyu1ibGex16puyj/wDIojlj1Fsk4dHxF8a/VnPUpPzNTnqlX6koKfffXMOpt8bqjcAeBNgP0jZ2BMZ4hpEm/IzM0ao1lCloeWSppZAORKteyAQLH+ka3o6T75KskFSGwXVgjS4+H8bxJUyYqiWghEoiWcPaccmFgkKOvwg66mwuQNor3Y2zeZWLCcFDW1+xL1arli92w5NuFQSwyVAFR1sNiAOJtpCEuhMu1kzKccKitxZIOZRN9LjQcBfYAXtCEvLtSwcdcmFvPOHtuLQkqt+7YjLbc2uNgd4QcmGtOrLY569wO6SBp3E7eENyY5VU/MWmFZyerUo/u2SSBr3WHpoe+JugVP3vDz+E2Z9NGmphf91nWlJR1pIP7F5SRfIdgeB30ipuPgqKXEoSsC4zhIPnmJPrfwhEOX+8VnvVe3qSOHqO+FU3Spmpx8gysKOTU6p9mOET1DoWEqvheu4dcOIlPZA8pSUKaGYG17HQFIOu+YjQHWJpTlV6PMSyFUq9Is5kLrUvMLIC0ElOYgcCM1r6cdRvZ51Mtiuny0hPPIZrkqEpp866BlfA+Fl4nS3BJPMA6QnhR2exjixctjuYemXqFLqLNGUkIXNLTclIToLjS9txbheNjTn131OS/NHmuZwq7Fu9019mKykjT+unelLGsi3KyMxMF2n0tCSDOuG5BUCTobX5HU7bs8TUma6VqOcZyFRUxPto6pNOUvM0hSCbhCrjJmFiARud9bxlUOlqcXOLp2NsJsPUtxYcZlVy+VbKfu2SsWWAPDx4RWjUGMOVxeKsAT6pukuaz1McUQ40k8FJPayjgsDQ929HflO59X0Nnh8Mt4dWlGOrH590/p9Bw70qYhmMPf2dcZmm8TtzKGEOoSnt6jdJHxEi22t421T8Mv48wgzJYrpgkKgQoZm1hRbWNlpI0AP7t4qlbwlSulKjN4owm91VYZF7g5VFSderXrooHZXLu22D0DYySps4fxb/AHKsypydc+MvXEaEKv8ACvx3htS9ew1dj2WVu7FjqcHuS81/4aylaLjKmzK+iybebmG3ZltTYtn7F7pKVHZB+Ijhbhxu+JGKVTMeYdocisGSwfKKnJ9/ksWWoHvKggW5rtGwelWbo2EZGYxtKyjKq+80JKUdBvmKtlW2OUC9+QtxjRmJS5RaWvDq3S7U5tSZquzCjdRWe0iXB/huCrmr/DEuiPwtUr5d3tIj8Q4jPjU6cSqPKlqU/q/Nlel1FSetcNislfqbxhMqR1nYBHO4hq7MqJAvtGAWXSkJTsLGKN9TVRWkkYKFlE2teI+eDs5Nt06XJuqynTyTp+sPqrMNSMopwjtkEJF9Sfr8oaJSulyC1ulPvkwSVm98qTqBHDj6+ETq77bCG5GVBDLQsCVXJ4XivTZyOHMQVHcA7Q9edzErWdYh517O5ZGkASlpbMpdJW9mAj6CdAOF/wCyfRfSpF1vJNTDfvUyLa9Y5rY+Ayjyjj72csIHGXSTTpF1rPJSp97nCdsiCOz/ADEgeZjv0CwsNhE6ivXUxvGshzmoGUEEESCjCOOfadrX2102GmoWVsUmUbYAGwcVdaj6KSP5Y7EWoJQpRNgBcx89K/VXK9jbEVcBCvfp90tE2PZKyEjX+EcojZT8GjR+zdPNkSs/xX7k5h1AyuzC7dY8oEZj93W1rpOvh8onG15UhOU2G10ki/pb0tyIMQVPcDAQ1oCkWNgkfLb1+docOPZrpKW1H4SSlJH56cNSDwte0V2zauA7n5sCySpQ7lKULep05929xYiI1TudYOZajucqlG3huQOO2/HQQivPmz5SNe0LLGvI6gfhrwN4bOOJSbrsq+17G/rY8xffnrHeY6oCzj/3EGyATcp0BPlcf/aPQ+obr88xNvP8tTDQuIKrqOY8Sf8A+j48vwhN2YZ65DRWlK8psk2uQN7foLecArSXdkjmSdScqhtYEcLaDQ8vlEhOKViQSy2500/Eckq1PqGfL7xbZpw8FC2ij4GK+l5KHFJSLi1r6fVvG/jvDpkpKbqfve9stu88IcpulVLmiQ83BrzK+Sf5FskpiQ6Vac9hvE7X2Zi6RuEuKTYkj4lAcQTa6L9402pFGwhTWK87hLF6HKLUASJSooP7JdybZwdCk8FC1tj3WN+UbxQ3LJ94bp2I5Yj7OqKXModI+Fp1XDkFeR3izTc9I4tocvQccvNYdxHTJgdY9My6il9FiFWKdUk722Nu/S2VXxMeelbfoZzBzJ8MuWLlz1B9pen89BLB+C8cdG1dFWpbKKrIn9m4qTUXG3k/uqSBcHfnY8d42fjrCeF6nUpXFWKqt9gNPy6OuknciXVKHC99TwNgTp5RXqHiynUGnLwv0WyU5Wqk4bvTziSlltWxXlIAFvIaakxTatUKbJTz03UXBjCvq0emZl1RkmFcUotYukeSdNBDnwcK47yHpenmN5PHsnLyP6evEunOum19V1LHiSuYWr2NcF0HDD7j9IpjinFJWlYClAhVu1qb5LctY1HMz8zPuPz0wtSnn3VOuqP3lKJJMW+W6SMRycwh2XaozaUG6UIpbKUpPdZNx63iltDVRvuSbWsN4j5uTXcoxrWlEkcH4dkY07LL3tyPEtr5Q6aS3LsrmniEhIvcm0ZthAaU84UpSnU6fX4RGLJrbylqumly3ZUn/vuXiIri+7HkuA8s1ucKktIuJdtSdD36xEVOZ655byzpwEOqzUfeFBlAysosEJAAAHlEFOukDMpWnARwEhpOPhBVZWp3ENmh1j19oSfWXXrARtL2cujxzHmO2GJhsmlSJExPq4FIPZb/AJiLeF+UdhByfQhZuQqYNs6W9krAwwz0fiszjOSo1qz6gRYoZt+zT53KvMco3RGLSEtNpbQkJQkWSANAOUZRZRjyrRgbrHbNyfmewQQQoQV7pJqhonR/X6sFWXKU595B70tqI+cfPzDKFCUZGxUcy1X3Hy2jtr2nZsyfQVihxPxLlksj+dxKP+KOK6OckulAGqW9uF/Hfa2nyiDlPxI2nsrBe7nL6k0Hk5lAvJOn76T5akEeB/IxkZtZbCM1+8m2ngSR9C97iI1LyxchawDsTmB8rkD65XhRS0lsLPDXgB8rDzt4EG0QzX8gsp+/at2xxyp4245e/nx0tePHHlaJSSM2wCiL8tDr4XB8TrDJTiQkr7ByglZ0sRrrpc21Otxv6QlQq65kGXlH1NJWlQTMJX8KxslQ2FwNzuL6w5CDkMZGRXRHcu5I1CpqQ2+3LNh59tGbIB929rgf8O9t9RDKSmGVTDcwyhc1MuAZ1LABCdQDa5A0t37cdoymSD702mdlS5LNvadgghtYPaFjoQTxtYecWiQkmJVKgwhKLkk27z3/ANPKFSSj0Kin4jKs95Lov51Q/uVC6VFPIg6q+vGM2lFIvz317/8AQ+UJINlE8gddtNLb+PEQsOPffbYX+h6iGy1l0Qu05mSFZRrz17vrwi0SuNqmiTZlalKUmsIYSEMqqMmHltpFgEhdwqw5EmKgtzLfS+6h45gfzMerXmtp9afkB6w5XZOt7i9EDJx6r48tkdoslXxhW6lJmQ69iQp5OsnT2Uy7Kh/EE6q8zEDMPldgNEAWSP0hncjRJ7R2HP1j10KWQSLJ+7a9z+H1aFSslY9yexFWPVStVx0jEKUvZNxxF4dyyOrSXXFBI79oQSptgFxxYSB84astu1dRcfKmqcjtJWP9rY7D64wkeTFrrrRNnFNU5Fy4sKsVkbAfOEqrUm0MhhiyG0CwA5QnW6w2UCWlrIZRsBt9bRXZh9S1E3sCLRw4kZqUkqUEACwuSB9cbxHzr6VDJvaE3Zg2KUnY2MNxqb7wCbLFBbY9oVNm6rVJeRkZdyYmZh1LTTaBdS1qNgAI+hHQjgCU6PcEsUpAQuoPWen3wPjdI2H8Kdh4X4xrD2TOiVVEkWsbYhlyiozDd6fLuDWXaUPjI4LUNuQ8Y6KibRBpbZiuK5vv7OWPZHsEEESCpCCCCADT3thOZOgqppvYOTUqk/8ArJP5Rx9LnKhXHcd3+nhHXvtkf9SE5/56U/8AypjjVp26Sq291W3P13/hFflfPs3fsqvwJff/AEPmVoBNsuu1iBceiY8dmW2Wy44QlFwAo8STwJ48tefjEbNVD3ZvPa6lmyAD8Z47E/mfCIJ5U1OMq61S+uBHWtNjN2CRtfjpv4iGIpPuX2bnKhcsFuRPSk+3VZSZYdAQoqKA2VFRAPBQP3t9r25Q2kKUovOidbaW0lHUhOUXWBYpURsCB3cYTkpQtPImZtaS/YHs/CSPvW52sPWFqxVHWZVxEo62qay5kJVuQLA2HqbbaQ4tt6gQWoOlXZS8S/UnpYJbsEJCUIT2QARYWGgNtOIiNrNYblEWZHWO5ikpSRmGlrkDhpe3dEGziCbVLBz3dt8pcKHCOySMvZUBbT9QYUoNMfnFNustNBPWFfXkdrLc3B4kw9CrT3Ir8ri7u5asVd/0JfD1Qm0lDM2feOtI6taNMl7i3da/dwixlXd3jUeN/wAYRk5NmRaLbTWUG+5uDpfz2+r6eKcvbTZXfzv+dv6Q1NqT6Im4td1UNWvbFSq2gGnLu4/gPSBAzKCRudu832+UIqKRubctP177w4QtWa4Nspvtyt3fV4QPs9lWhqsm/aOlv0jGbm2mEl2ZcShPAabwlN1FslDUk118wogED4QeZjBltuUX188518yRbJe6UeEBwzbk1zyffKoFsyiDdDR3d05fL0hjWKwp9Pu0vZthGiUjhBVqm4+g5yUjlEKpdzBs4lo8Ur9pmUrbuhrMOkJUANed4ymXkJUBe8NVL6xyyRe/COdxNligtsStp4x0n7LfQi5VH5bGuLpXJTkEOSEk6nWZI1Dih+4NwOPhu79nX2flzS5bFWPJNSJbRyUpjqbFzkt0cE8Qk6njpoesW20NICG0BCEgBKQLAAbARMpp/wCTMnxLijs3XWZwQCCJRQBBBBAAQQQQAae9sJCldBdTWkX6ualVEcCOvQNe7WOI3HFBFkgecd3+1Ix7x0F4hbG6UsuD+V9s/lHBb67JzXy24WsPy/GK/JXiRuPZeeqJff8A0OG1BxqxGh+uNoA2313XdWkOcFW19Yby57FuUKtuAnlEc1TcX3RDVKozTy3JaVbU0tAJUhZKVOJtbs99r98MWE2mJf3WZdAWSmXWo9tlf7iuYifqFObnmx2i06g3bcA1SYTpFEQxOLm5paH3c2ZJCcoBvbaJddkIrSMrmYWVdk+J7T8/QKTR3JhSn5pPUpKgVNA3SqwGu/f84t8qlDLQbaSEIGyRpaGiVKUkKva8KtnqyF2v8vrUw1Obl3LHFxK8VeBdfUfLcUblWxvryJt+hjDOkJUE2OZRvf68OfnwauPNITmURYb3F4aKnHpuyae2FL2LhPZBv+g+UIJMpLzJJ11ppGd5eQbj1v8AX0IaIE5PAJaT7rJnRT53Ol7WhFtqWYX102oTD5vZH3WzfQjntCc5V3Hr2sB3C0c2N9X3JBTspTmOrkwbkDOviq3G/nETOzgWsgKJJ3MM35zK2bncWiNcmDmzE2vHN7DaXceTU7ZQTfaGbk0pZ7JhBQUtWx8xG4uh72fcW41U1Uai2uh0VWvXzCD1rqf92jc35mw8YVCDk9Ih5ObXQtyZrLDtFrGJKwzSqJITE/OvGyGmU3PieAHMnQR2T0Cez7TMIFiv4pDNTrgAW01a7Eqe799f8R0HAcY2b0b9HeFsAUr3HDsgGVqA66ZX2nniOKlfkLCLbaJldCi9syWdxSeR4Y9jyCAwRJKo9ggggAIIIIACCCCACq9LFGfxD0b16jygCpqZkXEsJOynALpHqBHznnUEKShYKXm1FDiVCxSU8COEfUG0aF6eugGUxfOO4jwwuXp9YXdUwytOVqaV+8SPhX32N+POI99Tl1Re8F4ksRuE+zONEqhRgKKtRbziWxRhStYWqy6ZX6e9ITSRcIdFgpN/iSdlDTcaQwL0swsJVMoC1WskG5N9tohOLXc2aza5LaY4YazX12AG3jC7TZSq5Ihj9ogN5mmXXSTxGXTzj0OT8wkZylm52T2iBy15xwQ8qHkPpiZZY1K7i1yeA+vruSbnHXypLDdk2N1qGgI28obIlw2QpYK1hOUKUbm0Djq72vewtCtDE8rfmLBplLmedX15uD1aTZItHj1Qu11bCEtp5JFhDNVzxjJmTmH3Q200txR2SkXJPhBytjDyox8xN55atLw2U6o7CNh4Z6GekbEKke54bm2WlbOzSeoRbnddr+V429g32UnipDuLMRIaB+KXkEZlf51af/EwuNEpEO3i1VfdnLAZedUEjtHgOMbT6OOgHHmMFNTTkh9kU9WvvM8kouP4UfEr5DvjsXBHRVgXBwbXRqBLe8p/7VMDrXr8wpV8vlaLwLQ9XjJPbKjJ41ZPpDoal6L+gTBOCi1OOy/2zVE2PvM2gFKFDihvZPibnvjbSRYR6YBEpRS7FPZbOx7m9nhggMEdGmewQQQHQggggAIIIIACCCCADy8EEEcOFexvgrC2NJFMniaiylRbR8BcT20H+FQ1T5GNYTvswdGrqiqUFVkv3QiZCwnu7aSfnBBCWk+6H4X21rUZNEdMey7hsn+64hn2RwzMIWfyhufZdp5P/TGc/wDZj/8AeCCOckX5C/jb/wDIzZ9lqgC3XYoqK7blLCEn8TErT/ZkwFLkGZnazNdxeQkfJN4II6q4nHl3S7yLTSOg/oypqgpvDLMwocZl1bvyJt8outGw/QqOnLSqPT5AAWtLy6W/wEEEd5Uuw1Kycu7JMWj2CCFCAgtBBAAQQQQAEEEEABBBBAAQQQQAEEEEABBBBAB//9k=" width="96" height="96" style={{objectFit:"contain"}}/>
            </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "31px", fontWeight: "800", fontFamily: "'Barlow Condensed', sans-serif", color: "#1e1a14", letterSpacing: "0.08em" }}>SELECT AN OPPONENT</div>
                <div style={{ fontSize: "16px", color: "#9a8e7e", marginTop: "6px" }}>Choose any NFL team to generate an AI-powered scouting report powered by Next Gen Stats insights</div>
              </div>
            </div>
          )}

          {loading && selectedTeam && (
            <LoadingScout teamName={selectedTeam.name} accentColor={teamColor} />
          )}

          {error && (
            <div style={{ padding: "20px", background: "#f8717122", border: "1px solid #f87171", borderRadius: "10px", color: "#f87171", fontSize: "16px" }}>
              {error}
            </div>
          )}

          {report && !loading && (
            <div className="fade-in">
              {/* Cache hit banner */}
              {cacheHit && (
                <div className="no-print" style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "#f0fdf4", border: "1px solid #bbf7d0",
                  borderRadius: "8px", padding: "8px 14px", marginBottom: "14px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px" }}>⚡</span>
                    <span style={{ fontSize: "13px", color: "#15803d", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: "600", letterSpacing: "0.04em" }}>
                      LOADED FROM CACHE — Instant results
                    </span>
                  </div>
                  <button onClick={() => { setReport(null); generateReport(selectedTeam); }} style={{
                    fontSize: "11px", color: "#15803d", background: "none", border: "1px solid #86efac",
                    borderRadius: "5px", padding: "3px 9px", cursor: "pointer",
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: "600",
                  }}>↺ Refresh</button>
                </div>
              )}
              {/* ── Report Header ── */}
              <div style={{
                background: `linear-gradient(135deg, ${teamColor}22 0%, rgba(8,12,24,0) 60%)`,
                border: `1px solid ${teamColor}33`,
                borderRadius: "16px",
                padding: "28px 32px",
                marginBottom: "24px",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: "-30px", right: "-30px",
                  width: "180px", height: "180px",
                  borderRadius: "50%",
                  background: `${teamColor}11`,
                  border: `60px solid ${teamColor}08`,
                }} />
                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                      <div style={{ fontSize: "13px", color: teamColor, textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "6px" }}>
                        OPPONENT SCOUTING REPORT · {report.season}
                      </div>
                      <div style={{ fontSize: "43px", fontWeight: "900", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em", lineHeight: 1, color: "#1e1a14" }}>
                        {report.teamName?.toUpperCase()}
                      </div>
                      <div style={{ fontSize: "19px", color: "#7a6e5e", marginTop: "6px", fontStyle: "italic" }}>
                        "{report.headline}"
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                      <div style={{ fontSize: "16px", color: "#5a5040", fontFamily: "'Barlow Condensed', sans-serif" }}>
                        RECORD: <span style={{ color: "#1e1a14", fontWeight: "700" }}>{report.record}</span>
                      </div>
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: `${threatColor(report.overallThreat)}22`,
                        border: `1px solid ${threatColor(report.overallThreat)}44`,
                        borderRadius: "10px",
                        padding: "10px 18px",
                      }}>
                        <span style={{ fontSize: "12px", color: "#7a6e5e", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>Threat Level</span>
                        <span style={{ fontSize: "40px", fontWeight: "900", fontFamily: "'Barlow Condensed', sans-serif", color: threatColor(report.overallThreat), lineHeight: 1.1 }}>
                          {report.overallThreat}/10
                        </span>
                        <span style={{ fontSize: "13px", color: threatColor(report.overallThreat), fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                          {report.threatLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Phase ratings */}
                  <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
                    {[
                      { label: "Offense", val: report.offense?.rating, color: "#60a5fa" },
                      { label: "Defense", val: report.defense?.rating, color: "#f87171" },
                      { label: "Special Teams", val: report.specialTeams?.rating, color: "#fbbf24" },
                    ].map(({ label, val, color }) => (
                      <div key={label} style={{
                        flex: "1", minWidth: "120px",
                        background: "rgba(0,0,0,0.04)",
                        border: "1px solid rgba(0,0,0,0.1)",
                        borderRadius: "8px",
                        padding: "10px 14px",
                      }}>
                        <div style={{ fontSize: "12px", color: "#7a6e5e", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "6px" }}>{label}</div>
                        <RatingBar value={val} color={color} />
                      </div>
                    ))}
                  </div>

                  {/* Watchout */}
                  <div style={{
                    marginTop: "16px",
                    padding: "12px 16px",
                    background: "#fbbf2411",
                    border: "1px solid #fbbf2433",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}>
                    <span style={{ fontSize: "19px" }}>⚠️</span>
                    <div>
                      <span style={{ fontSize: "12px", color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'Barlow Condensed', sans-serif" }}>WATCHOUT FACTOR · </span>
                      <span style={{ fontSize: "15px", color: "#5a5040", lineHeight: 1.5 }}>{report.watchoutFactor}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Tab Nav ── */}
              <div style={{
                display: "flex",
                gap: "4px",
                marginBottom: "20px",
                background: "rgba(0,0,0,0.03)",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "10px",
                padding: "4px",
              }}>
                {[
                  { id: "offense", label: "⚔️  Offense" },
                  { id: "defense", label: "🛡️  Defense" },
                  { id: "special", label: "⭐  Special Teams" },
                  { id: "gameplan", label: "📋  Gameplan" },
                ].map(tab => (
                  <button
                    key={tab.id}
                    className="tab-btn"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      padding: "9px 12px",
                      borderRadius: "7px",
                      border: "none",
                      background: activeTab === tab.id ? teamColor : "transparent",
                      color: activeTab === tab.id ? "white" : "#64748b",
                      fontSize: "14px",
                      fontWeight: "700",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >{tab.label}</button>
                ))}
              </div>

              {/* ── OFFENSE TAB ── */}
              {activeTab === "offense" && report.offense && (
                <div className="fade-in">
                  <div style={{
                    display: "inline-block",
                    background: "#60a5fa22",
                    border: "1px solid #60a5fa44",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    fontSize: "13px",
                    color: "#60a5fa",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                  }}>Scheme: {report.offense.schemeLabel}</div>

                  {/* Passing Game */}
                  <SectionPanel title="Passing Game" icon="🎯" rating={null} accentColor="#60a5fa">
                    <p style={{ fontSize: "15px", color: "#5a5040", lineHeight: 1.7, marginBottom: "16px" }}>{report.offense.passingGame?.summary}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px", marginBottom: "20px" }}>
                      {report.offense.passingGame?.keyStats?.map((s, i) => <StatCard key={i} {...s} />)}
                    </div>
                    <div style={{ fontSize: "14px", color: "#9a8e7e", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "8px" }}>Key Players</div>
                    {report.offense.passingGame?.keyPlayers?.map((p, i) => <PlayerRow key={i} {...p} accentColor="#60a5fa" />)}
                    {report.offense.passingGame?.routeTendencies && (
                      <div style={{ marginTop: "20px", padding: "14px", background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)", borderRadius: "8px" }}>
                        <div style={{ fontSize: "14px", color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "8px" }}>Route Tree Analysis</div>
                        <p style={{ fontSize: "14px", color: "#5a5040", lineHeight: 1.6, marginBottom: "10px" }}>{report.offense.passingGame.routeTendencies.summary}</p>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                          {report.offense.passingGame.routeTendencies.topRoutes?.map(r => (
                            <span key={r} style={{ fontSize: "13px", background: "#60a5fa22", color: "#60a5fa", padding: "3px 8px", borderRadius: "4px", fontFamily: "'Barlow Condensed', sans-serif" }}>{r}</span>
                          ))}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "13px", color: "#7a6e5e", fontFamily: "'Barlow Condensed', sans-serif" }}>Separation Rating:</span>
                          <RatingBar value={report.offense.passingGame.routeTendencies.separationRating} color="#60a5fa" />
                        </div>
                        <div style={{ fontSize: "13px", color: "#7a6e5e", marginTop: "6px" }}>{report.offense.passingGame.routeTendencies.separationContext}</div>
                      </div>
                    )}
                    <div style={{ marginTop: "16px" }}>
                      <div style={{ fontSize: "14px", color: "#9a8e7e", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "8px" }}>Coaching Alerts</div>
                      {report.offense.passingGame?.coachingAlerts?.map((a, i) => <AlertBadge key={i} text={a} color="#60a5fa" />)}
                    </div>
                  </SectionPanel>

                  {/* Rushing Game */}
                  <SectionPanel title="Rushing Attack" icon="🏃" accentColor="#34d399">
                    <p style={{ fontSize: "15px", color: "#5a5040", lineHeight: 1.7, marginBottom: "16px" }}>{report.offense.rushingGame?.summary}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px", marginBottom: "20px" }}>
                      {report.offense.rushingGame?.keyStats?.map((s, i) => <StatCard key={i} {...s} />)}
                    </div>
                    {report.offense.rushingGame?.gapTendencies && (
                      <GapTendency
                        left={report.offense.rushingGame.gapTendencies.left}
                        middle={report.offense.rushingGame.gapTendencies.middle}
                        right={report.offense.rushingGame.gapTendencies.right}
                        accentColor="#34d399"
                      />
                    )}
                    {report.offense.rushingGame?.gapTendencies?.summary && (
                      <p style={{ fontSize: "14px", color: "#7a6e5e", marginTop: "10px", lineHeight: 1.6 }}>{report.offense.rushingGame.gapTendencies.summary}</p>
                    )}
                    <div style={{ marginTop: "16px" }}>
                      <div style={{ fontSize: "14px", color: "#9a8e7e", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "8px" }}>Key Players</div>
                      {report.offense.rushingGame?.keyPlayers?.map((p, i) => <PlayerRow key={i} {...p} accentColor="#34d399" />)}
                    </div>
                    <div style={{ marginTop: "16px" }}>
                      <div style={{ fontSize: "14px", color: "#9a8e7e", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "8px" }}>Coaching Alerts</div>
                      {report.offense.rushingGame?.coachingAlerts?.map((a, i) => <AlertBadge key={i} text={a} color="#34d399" />)}
                    </div>
                  </SectionPanel>
                </div>
              )}

              {/* ── DEFENSE TAB ── */}
              {activeTab === "defense" && report.defense && (
                <div className="fade-in">
                  <div style={{
                    display: "inline-block",
                    background: "#f8717122",
                    border: "1px solid #f8717144",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    fontSize: "13px",
                    color: "#f87171",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                  }}>Scheme: {report.defense.schemeLabel}</div>

                  <SectionPanel title="Pass Defense" icon="🚫" accentColor="#f87171">
                    <p style={{ fontSize: "15px", color: "#5a5040", lineHeight: 1.7, marginBottom: "16px" }}>{report.defense.passDefense?.summary}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px", marginBottom: "20px" }}>
                      {report.defense.passDefense?.keyStats?.map((s, i) => <StatCard key={i} {...s} />)}
                    </div>
                    <div style={{ fontSize: "14px", color: "#9a8e7e", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "8px" }}>Key Players</div>
                    {report.defense.passDefense?.keyPlayers?.map((p, i) => <PlayerRow key={i} {...p} accentColor="#f87171" />)}
                    {report.defense.passDefense?.exploitableZones && (
                      <div style={{ marginTop: "16px", padding: "12px", background: "#f8717111", border: "1px solid #f8717133", borderRadius: "8px" }}>
                        <div style={{ fontSize: "13px", color: "#f87171", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "8px" }}>Exploitable Coverage Zones</div>
                        {report.defense.passDefense.exploitableZones.map((z, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                            <span style={{ color: "#f87171", fontSize: "14px" }}>▶</span>
                            <span style={{ fontSize: "14px", color: "#5a5040" }}>{z}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ marginTop: "16px" }}>
                      <div style={{ fontSize: "14px", color: "#9a8e7e", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "8px" }}>Coaching Alerts</div>
                      {report.defense.passDefense?.coachingAlerts?.map((a, i) => <AlertBadge key={i} text={a} color="#f87171" />)}
                    </div>
                  </SectionPanel>

                  <SectionPanel title="Rush Defense" icon="🧱" accentColor="#c084fc">
                    <p style={{ fontSize: "15px", color: "#5a5040", lineHeight: 1.7, marginBottom: "16px" }}>{report.defense.rushDefense?.summary}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px", marginBottom: "20px" }}>
                      {report.defense.rushDefense?.keyStats?.map((s, i) => <StatCard key={i} {...s} />)}
                    </div>
                    <div style={{ fontSize: "14px", color: "#9a8e7e", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "8px" }}>Key Players</div>
                    {report.defense.rushDefense?.keyPlayers?.map((p, i) => <PlayerRow key={i} {...p} accentColor="#c084fc" />)}
                    <div style={{ marginTop: "16px" }}>
                      <div style={{ fontSize: "14px", color: "#9a8e7e", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "8px" }}>Coaching Alerts</div>
                      {report.defense.rushDefense?.coachingAlerts?.map((a, i) => <AlertBadge key={i} text={a} color="#c084fc" />)}
                    </div>
                  </SectionPanel>

                  <SectionPanel title="Pass Rush" icon="💨" accentColor="#fb923c">
                    <p style={{ fontSize: "15px", color: "#5a5040", lineHeight: 1.7, marginBottom: "16px" }}>{report.defense.passRush?.summary}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px", marginBottom: "20px" }}>
                      {report.defense.passRush?.keyStats?.map((s, i) => <StatCard key={i} {...s} />)}
                    </div>
                    <div style={{ fontSize: "14px", color: "#9a8e7e", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "8px" }}>Top Pass Rushers</div>
                    {report.defense.passRush?.topRushers?.map((r, i) => (
                      <div key={i} style={{
                        display: "flex", gap: "12px", alignItems: "flex-start",
                        padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.07)",
                      }}>
                        <div style={{
                          minWidth: "40px", height: "40px", borderRadius: "6px",
                          background: "#fb923c22", border: "1px solid #fb923c44",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "12px", fontWeight: "700", color: "#fb923c",
                          fontFamily: "'Barlow Condensed', sans-serif",
                        }}>{r.position}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <span style={{ fontSize: "15px", fontWeight: "600", color: "#1e1a14", fontFamily: "'Barlow Condensed', sans-serif" }}>{r.name}</span>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <span style={{ fontSize: "13px", background: "#fb923c22", color: "#fb923c", padding: "2px 6px", borderRadius: "4px", fontFamily: "'Barlow Condensed', sans-serif" }}>Win Rate: {r.winRate}</span>
                              <span style={{ fontSize: "13px", background: "rgba(0,0,0,0.05)", color: "#5a5040", padding: "2px 6px", borderRadius: "4px", fontFamily: "'Barlow Condensed', sans-serif" }}>Get-off: {r.getOffTime}</span>
                            </div>
                          </div>
                          <div style={{ fontSize: "13px", color: "#7a6e5e", lineHeight: 1.5 }}>{r.insight}</div>
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: "16px" }}>
                      <div style={{ fontSize: "14px", color: "#9a8e7e", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "8px" }}>Coaching Alerts</div>
                      {report.defense.passRush?.coachingAlerts?.map((a, i) => <AlertBadge key={i} text={a} color="#fb923c" />)}
                    </div>
                  </SectionPanel>
                </div>
              )}

              {/* ── SPECIAL TEAMS TAB ── */}
              {activeTab === "special" && report.specialTeams && (
                <div className="fade-in">
                  <SectionPanel title="Special Teams Overview" icon="⭐" rating={report.specialTeams.rating} ratingColor="#fbbf24" accentColor="#fbbf24">
                    <p style={{ fontSize: "15px", color: "#5a5040", lineHeight: 1.7, marginBottom: "16px" }}>{report.specialTeams.summary}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px", marginBottom: "20px" }}>
                      {report.specialTeams.keyStats?.map((s, i) => <StatCard key={i} {...s} />)}
                    </div>
                    <div style={{ fontSize: "14px", color: "#9a8e7e", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "8px" }}>Key Personnel</div>
                    {report.specialTeams.keyPlayers?.map((p, i) => <PlayerRow key={i} {...p} accentColor="#fbbf24" />)}
                    <div style={{ marginTop: "16px" }}>
                      <div style={{ fontSize: "14px", color: "#9a8e7e", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: "8px" }}>Coaching Alerts</div>
                      {report.specialTeams.coachingAlerts?.map((a, i) => <AlertBadge key={i} text={a} color="#fbbf24" />)}
                    </div>
                  </SectionPanel>
                </div>
              )}

              {/* ── GAMEPLAN TAB ── */}
              {activeTab === "gameplan" && report.gameplanPriorities && (
                <div className="fade-in">
                  <div style={{
                    background: `linear-gradient(135deg, ${teamColor}11, rgba(8,12,24,0))`,
                    border: `1px solid ${teamColor}22`,
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "20px",
                  }}>
                    <div style={{ fontSize: "15px", fontWeight: "700", fontFamily: "'Barlow Condensed', sans-serif", color: teamColor, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
                      AI-Generated Gameplan Priorities
                    </div>
                    <div style={{ fontSize: "14px", color: "#7a6e5e", lineHeight: 1.6 }}>
                      Based on NGS tracking data, tendencies, and schematic matchup analysis. These are your top 5 focus areas entering this game.
                    </div>
                  </div>
                  {report.gameplanPriorities.map((item, i) => <PriorityCard key={i} item={item} accentColor={teamColor} />)}
                </div>
              )}
            </div>
          )}
          </>}
        </div>
      </div>
    </div>
  );
}
