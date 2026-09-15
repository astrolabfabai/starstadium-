/**
 * Comprehensive NFL Team SVG Logo Lookup Dictionary
 * 
 * Provides official vector SVG logo asset endpoints for all 32 NFL franchises,
 * supporting dynamic prop-mapping overrides and flexible key/name resolution.
 */
import { normalizeTeamKey } from '../utils/teamUtils';

export const NFL_TEAM_SVG_LOGOS: Record<string, string> = {
  // AFC East
  BUF: 'https://upload.wikimedia.org/wikipedia/en/7/77/Buffalo_Bills_logo.svg',
  MIA: 'https://upload.wikimedia.org/wikipedia/en/3/37/Miami_Dolphins_logo.svg',
  NE: 'https://upload.wikimedia.org/wikipedia/en/b/b9/New_England_Patriots_logo.svg',
  NYJ: 'https://upload.wikimedia.org/wikipedia/en/6/6b/New_York_Jets_logo.svg',

  // AFC North
  BAL: 'https://upload.wikimedia.org/wikipedia/en/1/16/Baltimore_Ravens_logo.svg',
  CIN: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Cincinnati_Bengals_logo.svg',
  CLE: 'https://upload.wikimedia.org/wikipedia/en/d/d9/Cleveland_Browns_logo.svg',
  PIT: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Pittsburgh_Steelers_logo.svg',

  // AFC South
  HOU: 'https://upload.wikimedia.org/wikipedia/en/2/28/Houston_Texans_logo.svg',
  IND: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Indianapolis_Colts_logo.svg',
  JAX: 'https://upload.wikimedia.org/wikipedia/en/7/74/Jacksonville_Jaguars_logo.svg',
  TEN: 'https://upload.wikimedia.org/wikipedia/en/c/c1/Tennessee_Titans_logo.svg',

  // AFC West
  DEN: 'https://upload.wikimedia.org/wikipedia/en/4/44/Denver_Broncos_logo.svg',
  KC: 'https://upload.wikimedia.org/wikipedia/en/e/e1/Kansas_City_Chiefs_logo.svg',
  LV: 'https://upload.wikimedia.org/wikipedia/en/4/48/Las_Vegas_Raiders_logo.svg',
  LAC: 'https://upload.wikimedia.org/wikipedia/en/7/72/Los_Angeles_Chargers_logo.svg',

  // NFC East
  DAL: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Dallas_Cowboys.svg',
  NYG: 'https://upload.wikimedia.org/wikipedia/commons/1/14/New_York_Giants_logo.svg',
  PHI: 'https://upload.wikimedia.org/wikipedia/en/8/8e/Philadelphia_Eagles_logo.svg',
  WAS: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Washington_Commanders_logo.svg',

  // NFC North
  CHI: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Chicago_Bears_logo.svg',
  DET: 'https://upload.wikimedia.org/wikipedia/en/7/71/Detroit_Lions_logo.svg',
  GB: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Green_Bay_Packers_logo.svg',
  MIN: 'https://upload.wikimedia.org/wikipedia/en/4/48/Minnesota_Vikings_logo.svg',

  // NFC South
  ATL: 'https://upload.wikimedia.org/wikipedia/en/c/c5/Atlanta_Falcons_logo.svg',
  CAR: 'https://upload.wikimedia.org/wikipedia/en/1/1c/Carolina_Panthers_logo.svg',
  NO: 'https://upload.wikimedia.org/wikipedia/commons/5/50/New_Orleans_Saints_logo.svg',
  TB: 'https://upload.wikimedia.org/wikipedia/en/a/a2/Tampa_Bay_Buccaneers_logo.svg',

  // NFC West
  ARI: 'https://upload.wikimedia.org/wikipedia/en/7/72/Arizona_Cardinals_logo.svg',
  LAR: 'https://upload.wikimedia.org/wikipedia/en/8/8a/Los_Angeles_Rams_logo.svg',
  SF: 'https://upload.wikimedia.org/wikipedia/commons/6/60/San_Francisco_49ers_logo.svg',
  SEA: 'https://upload.wikimedia.org/wikipedia/en/8/8e/Seattle_Seahawks_logo.svg',

  // League Shield Fallback
  NFL: 'https://upload.wikimedia.org/wikipedia/en/a/a2/National_Football_League_logo.svg'
};

/**
 * Resolves a team-specific SVG logo asset using:
 * 1. Custom prop-mappings (teamSvgLogos / teamLogoMap)
 * 2. The NFL_TEAM_SVG_LOGOS lookup dictionary
 * 3. Standard transparent PNG/SVG team identity fallbacks
 *
 * @param teamKeyOrName The team abbreviation, city, or mascot name (e.g. 'KC', 'Chiefs', 'Kansas City Chiefs')
 * @param customMappings Optional prop-mapping overrides passed to the football field component
 * @returns The resolved SVG logo URL string
 */
export function resolveTeamSvgLogo(
  teamKeyOrName?: any,
  customMappings?: Record<string, string> | null
): string {
  if (!teamKeyOrName) return NFL_TEAM_SVG_LOGOS.NFL;

  let inputStr = '';
  if (typeof teamKeyOrName === 'string') {
    inputStr = teamKeyOrName;
  } else if (typeof teamKeyOrName === 'object' && teamKeyOrName !== null) {
    inputStr =
      teamKeyOrName.abbreviation ||
      teamKeyOrName.abbr ||
      teamKeyOrName.Key ||
      teamKeyOrName.key ||
      teamKeyOrName.teamKey ||
      teamKeyOrName.name ||
      teamKeyOrName.fullName ||
      '';
  } else {
    inputStr = String(teamKeyOrName || '');
  }

  if (!inputStr || typeof inputStr !== 'string' || typeof inputStr.trim !== 'function') {
    return NFL_TEAM_SVG_LOGOS.NFL;
  }

  const rawUpper = inputStr.trim().toUpperCase();
  const normalizedKey = normalizeTeamKey(inputStr);

  // 1. Check custom prop-mappings first (exact key or normalized key)
  if (customMappings) {
    if (customMappings[inputStr]) return customMappings[inputStr];
    if (customMappings[rawUpper]) return customMappings[rawUpper];
    if (customMappings[normalizedKey]) return customMappings[normalizedKey];

    // Check case-insensitive entries
    const foundKey = Object.keys(customMappings).find(
      (k) => k.toUpperCase() === rawUpper || k.toUpperCase() === normalizedKey
    );
    if (foundKey && customMappings[foundKey]) {
      return customMappings[foundKey];
    }
  }

  // 2. Check NFL_TEAM_SVG_LOGOS lookup dictionary
  if (NFL_TEAM_SVG_LOGOS[normalizedKey]) {
    return NFL_TEAM_SVG_LOGOS[normalizedKey];
  }
  if (NFL_TEAM_SVG_LOGOS[rawUpper]) {
    return NFL_TEAM_SVG_LOGOS[rawUpper];
  }

  // 3. Fallback: ESPN logo or NFL shield
  if (normalizedKey && normalizedKey.length >= 2 && normalizedKey.length <= 4) {
    return `https://a.espncdn.com/i/teamlogos/nfl/500/${normalizedKey.toLowerCase()}.png`;
  }

  return NFL_TEAM_SVG_LOGOS.NFL;
}
