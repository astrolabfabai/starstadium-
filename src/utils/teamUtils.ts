/**
 * Comprehensive NFL Team Logo, Colors, and Metadata Utilities
 * Provides robust resolution for all 32 NFL franchises, resolving
 * high-resolution transparent logos, primary/secondary colors,
 * and abbreviation fallbacks.
 */

export interface TeamIdentity {
  key: string;
  espnKey: string;
  name: string;
  city: string;
  fullName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
}

export const NFL_TEAM_IDENTITIES: Record<string, TeamIdentity> = {
  KC: {
    key: 'KC',
    espnKey: 'kc',
    name: 'Chiefs',
    city: 'Kansas City',
    fullName: 'Kansas City Chiefs',
    primaryColor: '#E31837',
    secondaryColor: '#FFB81C',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png'
  },
  SF: {
    key: 'SF',
    espnKey: 'sf',
    name: '49ers',
    city: 'San Francisco',
    fullName: 'San Francisco 49ers',
    primaryColor: '#AA0000',
    secondaryColor: '#B3995D',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png'
  },
  BAL: {
    key: 'BAL',
    espnKey: 'bal',
    name: 'Ravens',
    city: 'Baltimore',
    fullName: 'Baltimore Ravens',
    primaryColor: '#241773',
    secondaryColor: '#000000',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png'
  },
  DET: {
    key: 'DET',
    espnKey: 'det',
    name: 'Lions',
    city: 'Detroit',
    fullName: 'Detroit Lions',
    primaryColor: '#0076B6',
    secondaryColor: '#B0B7BC',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png'
  },
  PHI: {
    key: 'PHI',
    espnKey: 'phi',
    name: 'Eagles',
    city: 'Philadelphia',
    fullName: 'Philadelphia Eagles',
    primaryColor: '#004C54',
    secondaryColor: '#A5ACAF',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png'
  },
  BUF: {
    key: 'BUF',
    espnKey: 'buf',
    name: 'Bills',
    city: 'Buffalo',
    fullName: 'Buffalo Bills',
    primaryColor: '#00338D',
    secondaryColor: '#C60C30',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png'
  },
  GB: {
    key: 'GB',
    espnKey: 'gb',
    name: 'Packers',
    city: 'Green Bay',
    fullName: 'Green Bay Packers',
    primaryColor: '#203731',
    secondaryColor: '#FFB81C',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png'
  },
  DAL: {
    key: 'DAL',
    espnKey: 'dal',
    name: 'Cowboys',
    city: 'Dallas',
    fullName: 'Dallas Cowboys',
    primaryColor: '#041E42',
    secondaryColor: '#869397',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png'
  },
  CIN: {
    key: 'CIN',
    espnKey: 'cin',
    name: 'Bengals',
    city: 'Cincinnati',
    fullName: 'Cincinnati Bengals',
    primaryColor: '#FB4F14',
    secondaryColor: '#000000',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png'
  },
  HOU: {
    key: 'HOU',
    espnKey: 'hou',
    name: 'Texans',
    city: 'Houston',
    fullName: 'Houston Texans',
    primaryColor: '#03202F',
    secondaryColor: '#A71930',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png'
  },
  MIA: {
    key: 'MIA',
    espnKey: 'mia',
    name: 'Dolphins',
    city: 'Miami',
    fullName: 'Miami Dolphins',
    primaryColor: '#008E97',
    secondaryColor: '#FC4C02',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png'
  },
  LAR: {
    key: 'LAR',
    espnKey: 'lar',
    name: 'Rams',
    city: 'Los Angeles',
    fullName: 'Los Angeles Rams',
    primaryColor: '#003594',
    secondaryColor: '#FFA300',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png'
  },
  LAC: {
    key: 'LAC',
    espnKey: 'lac',
    name: 'Chargers',
    city: 'Los Angeles',
    fullName: 'Los Angeles Chargers',
    primaryColor: '#0080C6',
    secondaryColor: '#FFC20E',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png'
  },
  NYJ: {
    key: 'NYJ',
    espnKey: 'nyj',
    name: 'Jets',
    city: 'New York',
    fullName: 'New York Jets',
    primaryColor: '#125740',
    secondaryColor: '#FFFFFF',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png'
  },
  NYG: {
    key: 'NYG',
    espnKey: 'nyg',
    name: 'Giants',
    city: 'New York',
    fullName: 'New York Giants',
    primaryColor: '#0B2265',
    secondaryColor: '#A71930',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png'
  },
  PIT: {
    key: 'PIT',
    espnKey: 'pit',
    name: 'Steelers',
    city: 'Pittsburgh',
    fullName: 'Pittsburgh Steelers',
    primaryColor: '#FFB612',
    secondaryColor: '#101820',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png'
  },
  CLE: {
    key: 'CLE',
    espnKey: 'cle',
    name: 'Browns',
    city: 'Cleveland',
    fullName: 'Cleveland Browns',
    primaryColor: '#311D00',
    secondaryColor: '#FF3C00',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png'
  },
  CHI: {
    key: 'CHI',
    espnKey: 'chi',
    name: 'Bears',
    city: 'Chicago',
    fullName: 'Chicago Bears',
    primaryColor: '#0B162A',
    secondaryColor: '#C83803',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png'
  },
  MIN: {
    key: 'MIN',
    espnKey: 'min',
    name: 'Vikings',
    city: 'Minnesota',
    fullName: 'Minnesota Vikings',
    primaryColor: '#4F2683',
    secondaryColor: '#FFC62F',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png'
  },
  ATL: {
    key: 'ATL',
    espnKey: 'atl',
    name: 'Falcons',
    city: 'Atlanta',
    fullName: 'Atlanta Falcons',
    primaryColor: '#A71930',
    secondaryColor: '#000000',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png'
  },
  NO: {
    key: 'NO',
    espnKey: 'no',
    name: 'Saints',
    city: 'New Orleans',
    fullName: 'New Orleans Saints',
    primaryColor: '#D3BC8D',
    secondaryColor: '#101820',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png'
  },
  TB: {
    key: 'TB',
    espnKey: 'tb',
    name: 'Buccaneers',
    city: 'Tampa Bay',
    fullName: 'Tampa Bay Buccaneers',
    primaryColor: '#D50A0A',
    secondaryColor: '#0A0A08',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png'
  },
  CAR: {
    key: 'CAR',
    espnKey: 'car',
    name: 'Panthers',
    city: 'Carolina',
    fullName: 'Carolina Panthers',
    primaryColor: '#0085CA',
    secondaryColor: '#101820',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png'
  },
  WAS: {
    key: 'WAS',
    espnKey: 'wsh',
    name: 'Commanders',
    city: 'Washington',
    fullName: 'Washington Commanders',
    primaryColor: '#5A1414',
    secondaryColor: '#FFB612',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png'
  },
  DEN: {
    key: 'DEN',
    espnKey: 'den',
    name: 'Broncos',
    city: 'Denver',
    fullName: 'Denver Broncos',
    primaryColor: '#FB4F14',
    secondaryColor: '#002244',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png'
  },
  LV: {
    key: 'LV',
    espnKey: 'lv',
    name: 'Raiders',
    city: 'Las Vegas',
    fullName: 'Las Vegas Raiders',
    primaryColor: '#A5ACAF',
    secondaryColor: '#000000',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png'
  },
  IND: {
    key: 'IND',
    espnKey: 'ind',
    name: 'Colts',
    city: 'Indianapolis',
    fullName: 'Indianapolis Colts',
    primaryColor: '#002C5F',
    secondaryColor: '#A2AAAD',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png'
  },
  JAX: {
    key: 'JAX',
    espnKey: 'jax',
    name: 'Jaguars',
    city: 'Jacksonville',
    fullName: 'Jacksonville Jaguars',
    primaryColor: '#006778',
    secondaryColor: '#D7A22A',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png'
  },
  TEN: {
    key: 'TEN',
    espnKey: 'ten',
    name: 'Titans',
    city: 'Tennessee',
    fullName: 'Tennessee Titans',
    primaryColor: '#4B92DB',
    secondaryColor: '#0C2340',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png'
  },
  ARI: {
    key: 'ARI',
    espnKey: 'ari',
    name: 'Cardinals',
    city: 'Arizona',
    fullName: 'Arizona Cardinals',
    primaryColor: '#97233F',
    secondaryColor: '#000000',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png'
  },
  SEA: {
    key: 'SEA',
    espnKey: 'sea',
    name: 'Seahawks',
    city: 'Seattle',
    fullName: 'Seattle Seahawks',
    primaryColor: '#002244',
    secondaryColor: '#69BE28',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png'
  },
  NE: {
    key: 'NE',
    espnKey: 'ne',
    name: 'Patriots',
    city: 'New England',
    fullName: 'New England Patriots',
    primaryColor: '#002244',
    secondaryColor: '#C60C30',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png'
  }
};

// Aliases mapping for common names, cities, alternate abbreviations
const TEAM_KEY_ALIASES: Record<string, string> = {
  WSH: 'WAS',
  WASHINGTON: 'WAS',
  COMMANDERS: 'WAS',
  LA: 'LAR',
  RAMS: 'LAR',
  CHARGERS: 'LAC',
  CHIEFS: 'KC',
  RAVENS: 'BAL',
  LIONS: 'DET',
  EAGLES: 'PHI',
  BILLS: 'BUF',
  PACKERS: 'GB',
  COWBOYS: 'DAL',
  BENGALS: 'CIN',
  TEXANS: 'HOU',
  DOLPHINS: 'MIA',
  JETS: 'NYJ',
  GIANTS: 'NYG',
  STEELERS: 'PIT',
  BROWNS: 'CLE',
  BEARS: 'CHI',
  VIKINGS: 'MIN',
  FALCONS: 'ATL',
  SAINTS: 'NO',
  BUCCANEERS: 'TB',
  BUCS: 'TB',
  PANTHERS: 'CAR',
  BRONCOS: 'DEN',
  RAIDERS: 'LV',
  OAK: 'LV',
  COLTS: 'IND',
  JAGUARS: 'JAX',
  JAGS: 'JAX',
  TITANS: 'TEN',
  CARDINALS: 'ARI',
  SEAHAWKS: 'SEA',
  PATRIOTS: 'NE',
  PATS: 'NE',
  '49ERS': 'SF',
  NINERS: 'SF'
};

/**
 * Normalizes any team key, abbreviation, city, or mascot name into the standard 2-3 char key.
 * Bulletproof against objects (e.g. { abbreviation: 'KC', name: 'Chiefs' }), null/undefined, or numbers.
 */
export function normalizeTeamKey(rawInput?: any): string {
  if (!rawInput) return 'NFL';

  let str = '';
  if (typeof rawInput === 'string') {
    str = rawInput;
  } else if (typeof rawInput === 'object' && rawInput !== null) {
    // Handle team objects passed directly from component states or API feeds
    str =
      rawInput.abbreviation ||
      rawInput.abbr ||
      rawInput.Key ||
      rawInput.key ||
      rawInput.teamKey ||
      rawInput.name ||
      rawInput.fullName ||
      rawInput.FullName ||
      rawInput.team ||
      rawInput.Team ||
      '';
    if (!str && typeof rawInput.toString === 'function') {
      const s = rawInput.toString();
      if (s && s !== '[object Object]') {
        str = s;
      }
    }
  } else {
    str = String(rawInput);
  }

  if (!str || typeof str !== 'string' || typeof str.trim !== 'function') {
    return 'NFL';
  }

  const clean = str.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!clean) return 'NFL';

  if (NFL_TEAM_IDENTITIES[clean]) {
    return clean;
  }
  if (TEAM_KEY_ALIASES[clean]) {
    return TEAM_KEY_ALIASES[clean];
  }

  // Scan by fullName or Name
  for (const [key, id] of Object.entries(NFL_TEAM_IDENTITIES)) {
    const normFull = id.fullName.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const normName = id.name.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean === normFull || clean === normName || clean.includes(normName)) {
      return key;
    }
  }

  return clean;
}

/**
 * Returns the official high-resolution transparent logo URL for any team.
 */
export function getTeamLogoUrl(teamKeyOrName?: any, customFallbackUrl?: string): string {
  if (customFallbackUrl && (customFallbackUrl.startsWith('http') || customFallbackUrl.startsWith('/'))) {
    return customFallbackUrl;
  }

  const normalized = normalizeTeamKey(teamKeyOrName);
  const team = NFL_TEAM_IDENTITIES[normalized];

  if (team) {
    return team.logoUrl;
  }

  // If unknown team but valid abbreviation, default to ESPN pattern
  if (normalized && normalized.length >= 2 && normalized.length <= 4) {
    return `https://a.espncdn.com/i/teamlogos/nfl/500/${normalized.toLowerCase()}.png`;
  }

  return 'https://a.espncdn.com/i/teamlogos/nfl/500/nfl.png';
}

/**
 * Returns the primary brand color for a team.
 */
export function getTeamColor(teamKeyOrName?: any, defaultFallback = '#3b82f6'): string {
  const normalized = normalizeTeamKey(teamKeyOrName);
  return NFL_TEAM_IDENTITIES[normalized]?.primaryColor || defaultFallback;
}

/**
 * Returns the full team identity object.
 */
export function getTeamIdentity(teamKeyOrName?: any): TeamIdentity | null {
  const normalized = normalizeTeamKey(teamKeyOrName);
  return NFL_TEAM_IDENTITIES[normalized] || null;
}

export { NFL_TEAM_SVG_LOGOS, resolveTeamSvgLogo } from '../data/teamSvgLogos';
