import { PlayByPlayEvent } from '../types';

export interface WinProbabilityPoint {
  playId: number;
  quarter: number;
  timeRemaining: string;
  gameSecond: number; // 0 (start) to 3600 (end regulation) or >3600 for OT
  displayTime: string;
  homeScore: number;
  awayScore: number;
  scoreDiff: number; // homeScore - awayScore
  homeWinPct: number; // 0 to 100
  awayWinPct: number; // 0 to 100
  deltaHomeWp: number; // Change in home win probability on this play (+/- %)
  possession: string;
  down: number;
  distance: number;
  yardLine: number;
  yardLineSide: string;
  playType: string;
  description: string;
  epa: number;
  cumulativeHomeEpa: number;
  isBigPlay: boolean;
  isScoringPlay: boolean;
  isTurnover: boolean;
  leverageIndex: number; // 1.0 = neutral average play, >2.5 = critical
  playConceptName?: string;
  ballCarrierOrPasser?: string;
}

export interface GameWinProbSummary {
  currentHomeWinPct: number;
  currentAwayWinPct: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  leadChanges: number;
  homeTimeInLeadPct: number;
  awayTimeInLeadPct: number;
  tiedTimePct: number;
  gameExcitementIndex: number; // Total absolute win prob movement
  currentLeverageIndex: number;
  biggestHomeSwing: WinProbabilityPoint | null;
  biggestAwaySwing: WinProbabilityPoint | null;
  topTurningPoints: WinProbabilityPoint[];
  impliedOdds: {
    homeAmerican: string;
    awayAmerican: string;
    homeDecimal: number;
    awayDecimal: number;
  };
}

// Standard normal cumulative distribution approximation
function standardNormalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

/**
 * Empirical Expected Points model based on yardline, down and distance
 */
export function estimateExpectedPoints(yardLine: number, down: number, distance: number): number {
  // yardline from 1 (own goal line) to 99 (opponent 1yd line)
  const distToEndzone = 100 - Math.max(1, Math.min(99, yardLine));
  let baseEp = 0;

  if (distToEndzone <= 10) {
    baseEp = 5.2 - distToEndzone * 0.15;
  } else if (distToEndzone <= 30) {
    baseEp = 4.0 - (distToEndzone - 10) * 0.1;
  } else if (distToEndzone <= 50) {
    baseEp = 2.0 - (distToEndzone - 30) * 0.06;
  } else if (distToEndzone <= 80) {
    baseEp = 0.8 - (distToEndzone - 50) * 0.05;
  } else {
    baseEp = -0.5 - (distToEndzone - 80) * 0.06;
  }

  // Down penalty
  const downPenalty = (down - 1) * (0.6 + (distance > 7 ? 0.3 : 0));
  return Math.round((baseEp - downPenalty) * 100) / 100;
}

/**
 * Real-time Win Probability Calculator
 * Based on score difference, seconds remaining, possession, field position, and historical NFL variance.
 */
export function calculateWinProbability({
  homeScore,
  awayScore,
  quarter,
  timeRemaining,
  possession,
  homeTeam,
  yardLine = 50,
  down = 1,
  distance = 10,
  preGameSpread = 0
}: {
  homeScore: number;
  awayScore: number;
  quarter: number;
  timeRemaining: string; // e.g. "08:45"
  possession: string;
  homeTeam: string;
  yardLine?: number;
  down?: number;
  distance?: number;
  preGameSpread?: number;
}): { homeWinPct: number; awayWinPct: number } {
  // Parse clock to seconds remaining in the game
  const parts = timeRemaining.split(':');
  const mins = parseInt(parts[0], 10) || 0;
  const secs = parseInt(parts[1], 10) || 0;
  const qtrSecsRemaining = Math.max(0, mins * 60 + secs);

  let totalSecsRemaining = 0;
  if (quarter <= 4) {
    totalSecsRemaining = (4 - quarter) * 900 + qtrSecsRemaining;
  } else {
    // Overtime (typically 600s or 900s)
    totalSecsRemaining = qtrSecsRemaining;
  }

  // If game is over
  if (totalSecsRemaining <= 0) {
    if (homeScore > awayScore) return { homeWinPct: 100, awayWinPct: 0 };
    if (awayScore > homeScore) return { homeWinPct: 0, awayWinPct: 100 };
    return { homeWinPct: 50, awayWinPct: 50 };
  }

  const scoreDiff = homeScore - awayScore;

  // Expected Points from current drive
  const isHomePossession = possession === homeTeam;
  const ep = estimateExpectedPoints(yardLine, down, distance);
  const possessionAdvantage = isHomePossession ? ep : -ep;

  // Pre-game baseline adjustment decaying towards end of game
  const timeWeight = totalSecsRemaining / 3600;
  const spreadAdjustment = -preGameSpread * 0.3 * timeWeight;

  // Total adjusted expected point differential
  const adjustedLead = scoreDiff + (possessionAdvantage * 0.7) + spreadAdjustment;

  // NFL standard deviation of score margin shrinks with sqrt of remaining time
  // Baseline ~13.8 pts over 60 minutes
  const sigma = Math.max(1.8, 13.5 * Math.sqrt(totalSecsRemaining / 3600));

  // Z-Score
  const z = adjustedLead / sigma;
  let homeWin = standardNormalCdf(z) * 100;

  // Bound to 0.1% - 99.9% during active play
  homeWin = Math.max(0.1, Math.min(99.9, homeWin));
  const awayWin = Math.round((100 - homeWin) * 10) / 10;
  const roundedHome = Math.round(homeWin * 10) / 10;

  return { homeWinPct: roundedHome, awayWinPct: awayWin };
}

/**
 * Leverage Index (LI) represents the swing potential of the next play
 */
export function calculateLeverageIndex(
  homeWinPct: number,
  timeRemainingSec: number,
  scoreDiff: number
): number {
  // Plays close to 50% late in the game have immense leverage
  const closeness = 1 - Math.abs(homeWinPct - 50) / 50; // 1 at 50%, 0 at extremes
  const lateness = 1 - Math.min(3600, timeRemainingSec) / 3600; // 0 at kickoff, 1 at end

  // High leverage formula
  const baseLI = 0.5 + closeness * 1.5 + (closeness * lateness * 3.5);
  const oneScoreGameBonus = Math.abs(scoreDiff) <= 8 ? 0.6 : 0;

  return Math.round((baseLI + oneScoreGameBonus) * 10) / 10;
}

/**
 * Converts win probability to American and Decimal Odds
 */
export function convertProbabilityToOdds(winPct: number): {
  american: string;
  decimal: number;
} {
  const p = Math.max(0.01, Math.min(0.99, winPct / 100));
  const decimal = Math.round((1 / p) * 100) / 100;

  let american = '+100';
  if (p >= 0.5) {
    const us = Math.round((p / (1 - p)) * -100);
    american = `${us}`;
  } else {
    const us = Math.round(((1 - p) / p) * 100);
    american = `+${us}`;
  }

  return { american, decimal };
}

/**
 * Convert raw PlayByPlay events and Game data into high-resolution Win Probability trend points
 */
export function processGameFeedToWinProbPoints(
  plays: PlayByPlayEvent[],
  homeTeam: string,
  awayTeam: string,
  currentHomeScore: number = 0,
  currentAwayScore: number = 0,
  preGameSpread: number = -3.5
): WinProbabilityPoint[] {
  if (!plays || plays.length === 0) {
    // Generate kickoff and current point baseline
    return [
      {
        playId: 1001,
        quarter: 1,
        timeRemaining: '15:00',
        gameSecond: 0,
        displayTime: 'Q1 15:00',
        homeScore: 0,
        awayScore: 0,
        scoreDiff: 0,
        homeWinPct: 54.5,
        awayWinPct: 45.5,
        deltaHomeWp: 0,
        possession: awayTeam,
        down: 1,
        distance: 10,
        yardLine: 35,
        yardLineSide: homeTeam,
        playType: 'Kickoff',
        description: `Opening Kickoff from ${homeTeam} 35 to endzone. Touchback.`,
        epa: 0,
        cumulativeHomeEpa: 0,
        isBigPlay: false,
        isScoringPlay: false,
        isTurnover: false,
        leverageIndex: 1.0
      },
      {
        playId: 1002,
        quarter: 4,
        timeRemaining: '00:00',
        gameSecond: 3600,
        displayTime: 'Q4 00:00',
        homeScore: currentHomeScore,
        awayScore: currentAwayScore,
        scoreDiff: currentHomeScore - currentAwayScore,
        homeWinPct: currentHomeScore >= currentAwayScore ? 99.9 : 0.1,
        awayWinPct: currentAwayScore > currentHomeScore ? 99.9 : 0.1,
        deltaHomeWp: currentHomeScore >= currentAwayScore ? 45.4 : -54.4,
        possession: homeTeam,
        down: 4,
        distance: 1,
        yardLine: 1,
        yardLineSide: awayTeam,
        playType: 'End of Game',
        description: `Final whistle. Final score: ${homeTeam} ${currentHomeScore}, ${awayTeam} ${currentAwayScore}.`,
        epa: 0.5,
        cumulativeHomeEpa: 8.4,
        isBigPlay: true,
        isScoringPlay: false,
        isTurnover: false,
        leverageIndex: 1.0
      }
    ];
  }

  let runningHomeScore = 0;
  let runningAwayScore = 0;
  let prevHomeWinPct = 52.0; // Initial pregame coin-flip with home field advantage
  let cumulativeHomeEpa = 0;

  return plays.map((p, idx) => {
    const qtr = typeof p.Quarter === 'number' ? p.Quarter : parseInt(String(p.Quarter)) || 1;
    const timeStr = p.TimeRemaining || '15:00';
    const clockParts = timeStr.split(':');
    const mins = parseInt(clockParts[0], 10) || 0;
    const secs = parseInt(clockParts[1], 10) || 0;
    const qtrRemainingSeconds = mins * 60 + secs;
    const qtrElapsedSeconds = Math.max(0, 900 - qtrRemainingSeconds);
    const totalElapsedSeconds = Math.min(3600, (qtr - 1) * 900 + qtrElapsedSeconds);

    const descLower = (p.Description || '').toLowerCase();
    const isTouchdown = p.PlayType === 'Touchdown' || descLower.includes('touchdown');
    const isFieldGoal = p.PlayType === 'Field Goal' || (descLower.includes('field goal') && descLower.includes('is good'));
    const isInterception = descLower.includes('intercepted') || descLower.includes('interception');
    const isFumble = descLower.includes('fumble') && descLower.includes('recovered by');
    const isTurnoverOnDowns = descLower.includes('turnover on downs') || descLower.includes('failed 4th down');
    const isTurnover = isInterception || isFumble || isTurnoverOnDowns;

    // Track running score if play is scoring
    if (isTouchdown) {
      const scoringTeam = p.Possession || homeTeam;
      if (scoringTeam === homeTeam) runningHomeScore += 7;
      else runningAwayScore += 7;
    } else if (isFieldGoal) {
      const scoringTeam = p.Possession || homeTeam;
      if (scoringTeam === homeTeam) runningHomeScore += 3;
      else runningAwayScore += 3;
    }

    // Determine win probability from play record or calculate dynamic curve
    let calculatedHomeWp: number;
    if (typeof p.WinProbabilityPct === 'number' && p.WinProbabilityPct > 0) {
      calculatedHomeWp = p.Possession === homeTeam ? p.WinProbabilityPct : (100 - p.WinProbabilityPct);
    } else {
      const res = calculateWinProbability({
        homeScore: runningHomeScore,
        awayScore: runningAwayScore,
        quarter: qtr,
        timeRemaining: timeStr,
        possession: p.Possession || homeTeam,
        homeTeam,
        yardLine: p.YardLine || 50,
        down: p.Down || 1,
        distance: p.Distance || 10,
        preGameSpread
      });
      calculatedHomeWp = res.homeWinPct;
    }

    // Ensure smooth bounded range
    calculatedHomeWp = Math.max(0.2, Math.min(99.8, Math.round(calculatedHomeWp * 10) / 10));
    const awayWinPct = Math.round((100 - calculatedHomeWp) * 10) / 10;

    const deltaHomeWp = Math.round((calculatedHomeWp - prevHomeWinPct) * 10) / 10;
    prevHomeWinPct = calculatedHomeWp;

    const playEpa = typeof p.epa === 'number' ? p.epa : (deltaHomeWp / 10);
    const homePlayEpa = p.Possession === homeTeam ? playEpa : -playEpa;
    cumulativeHomeEpa = Math.round((cumulativeHomeEpa + homePlayEpa) * 100) / 100;

    const isBig = Boolean(p.IsBigPlay || Math.abs(deltaHomeWp) >= 7.5 || Math.abs(p.YardsGained || 0) >= 20 || isTurnover);
    const leverageIndex = calculateLeverageIndex(calculatedHomeWp, 3600 - totalElapsedSeconds, runningHomeScore - runningAwayScore);

    return {
      playId: p.PlayID || 5000 + idx,
      quarter: qtr,
      timeRemaining: timeStr,
      gameSecond: totalElapsedSeconds,
      displayTime: `Q${qtr} ${timeStr}`,
      homeScore: runningHomeScore,
      awayScore: runningAwayScore,
      scoreDiff: runningHomeScore - runningAwayScore,
      homeWinPct: calculatedHomeWp,
      awayWinPct,
      deltaHomeWp,
      possession: p.Possession || homeTeam,
      down: p.Down || 1,
      distance: p.Distance || 10,
      yardLine: p.YardLine || 50,
      yardLineSide: p.YardLineSide || '50',
      playType: p.PlayType || 'Play',
      description: p.Description || `Play ${idx + 1}`,
      epa: playEpa,
      cumulativeHomeEpa,
      isBigPlay: isBig,
      isScoringPlay: isTouchdown || isFieldGoal,
      isTurnover,
      leverageIndex,
      playConceptName: p.playConceptName,
      ballCarrierOrPasser: p.ballCarrier || p.targetPlayer
    };
  });
}

/**
 * Synthesizes deep statistical telemetry for the game trend
 */
export function computeGameWinProbSummary(
  points: WinProbabilityPoint[],
  homeTeam: string,
  awayTeam: string
): GameWinProbSummary {
  if (points.length === 0) {
    return {
      currentHomeWinPct: 50,
      currentAwayWinPct: 50,
      homeTeam,
      awayTeam,
      homeScore: 0,
      awayScore: 0,
      leadChanges: 0,
      homeTimeInLeadPct: 50,
      awayTimeInLeadPct: 50,
      tiedTimePct: 0,
      gameExcitementIndex: 1.0,
      currentLeverageIndex: 1.0,
      biggestHomeSwing: null,
      biggestAwaySwing: null,
      topTurningPoints: [],
      impliedOdds: {
        homeAmerican: '+100',
        awayAmerican: '+100',
        homeDecimal: 2.0,
        awayDecimal: 2.0
      }
    };
  }

  const latest = points[points.length - 1];

  let leadChanges = 0;
  let homeLeadCount = 0;
  let awayLeadCount = 0;
  let tiedCount = 0;
  let totalDeltaSum = 0;

  let biggestHomeSwing: WinProbabilityPoint | null = null;
  let biggestAwaySwing: WinProbabilityPoint | null = null;

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const prev = i > 0 ? points[i - 1] : null;

    if (pt.homeWinPct > 50.5) homeLeadCount++;
    else if (pt.homeWinPct < 49.5) awayLeadCount++;
    else tiedCount++;

    if (prev) {
      if ((prev.homeWinPct >= 50 && pt.homeWinPct < 50) || (prev.homeWinPct <= 50 && pt.homeWinPct > 50)) {
        leadChanges++;
      }
      totalDeltaSum += Math.abs(pt.deltaHomeWp);
    }

    if (!biggestHomeSwing || pt.deltaHomeWp > biggestHomeSwing.deltaHomeWp) {
      biggestHomeSwing = pt;
    }
    if (!biggestAwaySwing || pt.deltaHomeWp < biggestAwaySwing.deltaHomeWp) {
      biggestAwaySwing = pt;
    }
  }

  const totalPoints = points.length;
  const homeTimeInLeadPct = Math.round((homeLeadCount / totalPoints) * 100);
  const awayTimeInLeadPct = Math.round((awayLeadCount / totalPoints) * 100);
  const tiedTimePct = Math.max(0, 100 - homeTimeInLeadPct - awayTimeInLeadPct);

  // Normalize excitement index: ~100% total swings = 2.5 excitement
  const gameExcitementIndex = Math.round((totalDeltaSum / 25) * 10) / 10;

  // Top 5 turning points sorted by absolute win probability change
  const topTurningPoints = [...points]
    .filter((p) => Math.abs(p.deltaHomeWp) >= 3.0)
    .sort((a, b) => Math.abs(b.deltaHomeWp) - Math.abs(a.deltaHomeWp))
    .slice(0, 5);

  const homeOdds = convertProbabilityToOdds(latest.homeWinPct);
  const awayOdds = convertProbabilityToOdds(latest.awayWinPct);

  return {
    currentHomeWinPct: latest.homeWinPct,
    currentAwayWinPct: latest.awayWinPct,
    homeTeam,
    awayTeam,
    homeScore: latest.homeScore,
    awayScore: latest.awayScore,
    leadChanges,
    homeTimeInLeadPct,
    awayTimeInLeadPct,
    tiedTimePct,
    gameExcitementIndex,
    currentLeverageIndex: latest.leverageIndex,
    biggestHomeSwing,
    biggestAwaySwing,
    topTurningPoints,
    impliedOdds: {
      homeAmerican: homeOdds.american,
      awayAmerican: awayOdds.american,
      homeDecimal: homeOdds.decimal,
      awayDecimal: awayOdds.decimal
    }
  };
}
