import { WidgetConfig, ViewMode } from '../types';

export const STORAGE_KEY_WIDGET_LAYOUT = 'starstadium_widget_layout_v2';

export const DEFAULT_WIDGET_CONFIGS: WidgetConfig[] = [
  {
    id: '1',
    title: 'Standings & Win-Loss Radar',
    icon: '🏆',
    type: 'standings',
    category: 'Competition',
    w: 12,
    visible: true,
    order: 1,
    collapsed: false
  },
  {
    id: '2',
    title: 'Teams, Rosters & Schemes',
    icon: '👥',
    type: 'teams',
    category: 'Roster',
    w: 12,
    visible: true,
    order: 2,
    collapsed: false
  },
  {
    id: '3',
    title: 'Schedules, Venues & Weather',
    icon: '📅',
    type: 'schedule',
    category: 'Schedules',
    w: 12,
    visible: true,
    order: 3,
    collapsed: false
  },
  {
    id: '4',
    title: 'Live Scoreboard & Game Flow',
    icon: '📻',
    type: 'scoreboard',
    category: 'Live Events',
    w: 12,
    visible: true,
    order: 4,
    collapsed: false
  },
  {
    id: '5',
    title: 'Game Highlights & Video Matcher',
    icon: '🎬',
    type: 'highlights',
    category: 'Live Events',
    w: 12,
    visible: true,
    order: 5,
    collapsed: false
  },
  {
    id: '6',
    title: 'Player Leaderboards & Multi-Stat Scatter',
    icon: '🎯',
    type: 'stats',
    category: 'Player Stats',
    w: 12,
    visible: true,
    order: 6,
    collapsed: false
  },
  {
    id: '7',
    title: 'Play-By-Play Drive Sequence Flow',
    icon: '⚡',
    type: 'playbyplay',
    category: 'Play by Play',
    w: 12,
    visible: true,
    order: 7,
    collapsed: false
  },
  {
    id: '8',
    title: 'Depth Chart & Injury Availability Matrix',
    icon: '🩹',
    type: 'depth_injuries',
    category: 'Lineups',
    w: 12,
    visible: true,
    order: 8,
    collapsed: false
  },
  {
    id: '9',
    title: 'Live Betting Lines & Odds Shift',
    icon: '💰',
    type: 'betting',
    category: 'Odds',
    w: 12,
    visible: true,
    order: 9,
    collapsed: false
  },
  {
    id: '10',
    title: 'Fantasy Projections & DFS Value Matrix',
    icon: '✨',
    type: 'fantasy',
    category: 'Fantasy',
    w: 12,
    visible: true,
    order: 10,
    collapsed: false
  },
  {
    id: '11',
    title: 'Draft Pick & Trade Value Analyzer',
    icon: '⚖️',
    type: 'draft_analyzer',
    category: 'Draft',
    w: 12,
    visible: true,
    order: 11,
    collapsed: false
  },
  {
    id: '12',
    title: 'NFL Draft Mock Simulator',
    icon: '🏈',
    type: 'draft_simulator',
    category: 'Draft',
    w: 12,
    visible: true,
    order: 12,
    collapsed: false
  },
  {
    id: '13',
    title: 'Win Probability Engine',
    icon: '📈',
    type: 'win_probability',
    category: 'Live Events',
    w: 12,
    visible: true,
    order: 13,
    collapsed: false
  },
  {
    id: '14',
    title: 'RotoBaller News & Transaction Wire',
    icon: '📰',
    type: 'news',
    category: 'News',
    w: 12,
    visible: true,
    order: 14,
    collapsed: false
  },
  {
    id: '15',
    title: 'Live Database Core & SQL Sandbox',
    icon: '🗄️',
    type: 'db_viewer',
    category: 'Database',
    w: 12,
    visible: true,
    order: 15,
    collapsed: false
  }
];

export interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  orderedTypes: ViewMode[];
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'gameday',
    name: 'Game Day Live Action',
    description: 'Prioritizes live scoreboards, game play-by-play, win probability charts, and highlights.',
    badge: '⚡ LIVE',
    orderedTypes: [
      'scoreboard',
      'playbyplay',
      'win_probability',
      'highlights',
      'betting',
      'schedule',
      'standings',
      'depth_injuries',
      'stats',
      'fantasy',
      'news',
      'teams',
      'draft_simulator',
      'draft_analyzer',
      'db_viewer'
    ]
  },
  {
    id: 'fantasy',
    name: 'Fantasy & Wagering Command',
    description: 'Brings fantasy projections, DFS pricing, betting odds shifts, injuries, and leaders to the forefront.',
    badge: '💰 FANTASY',
    orderedTypes: [
      'fantasy',
      'betting',
      'stats',
      'depth_injuries',
      'news',
      'scoreboard',
      'playbyplay',
      'schedule',
      'standings',
      'win_probability',
      'teams',
      'highlights',
      'draft_analyzer',
      'draft_simulator',
      'db_viewer'
    ]
  },
  {
    id: 'front_office',
    name: 'GM & Front Office Scouting',
    description: 'Spotlights the NFL Draft simulator, pick value calculator, team depth rosters, and database.',
    badge: '📋 SCOUTING',
    orderedTypes: [
      'draft_simulator',
      'draft_analyzer',
      'teams',
      'standings',
      'depth_injuries',
      'stats',
      'news',
      'schedule',
      'scoreboard',
      'db_viewer',
      'fantasy',
      'betting',
      'highlights',
      'playbyplay',
      'win_probability'
    ]
  },
  {
    id: 'canonical',
    name: 'Default 1-15 Comprehensive',
    description: 'The standard chronological StarStadium workspace sequence from Standings to Database Core.',
    badge: '🏆 DEFAULT',
    orderedTypes: DEFAULT_WIDGET_CONFIGS.map((w) => w.type)
  }
];

/**
 * Loads saved layout configuration from localStorage with robust fallback & migration.
 */
export function loadSavedWidgetLayout(): WidgetConfig[] {
  if (typeof window === 'undefined') {
    return DEFAULT_WIDGET_CONFIGS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_WIDGET_LAYOUT);
    if (!raw) {
      return DEFAULT_WIDGET_CONFIGS;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_WIDGET_CONFIGS;
    }

    // Merge saved configs with default definitions to ensure no missing fields
    const defaultMap = new Map<string, WidgetConfig>(
      DEFAULT_WIDGET_CONFIGS.map((w) => [w.type, w])
    );

    const mergedList: WidgetConfig[] = [];
    const seenTypes = new Set<string>();

    // Add valid saved widgets
    parsed.forEach((savedItem: any, idx: number) => {
      const defaultItem = defaultMap.get(savedItem.type);
      if (defaultItem) {
        seenTypes.add(savedItem.type);
        mergedList.push({
          ...defaultItem,
          visible: typeof savedItem.visible === 'boolean' ? savedItem.visible : defaultItem.visible,
          collapsed: typeof savedItem.collapsed === 'boolean' ? savedItem.collapsed : false,
          order: idx + 1
        });
      }
    });

    // Append any default widgets that weren't in saved list
    DEFAULT_WIDGET_CONFIGS.forEach((defaultItem) => {
      if (!seenTypes.has(defaultItem.type)) {
        mergedList.push({
          ...defaultItem,
          order: mergedList.length + 1
        });
      }
    });

    return mergedList.map((item, index) => ({
      ...item,
      order: index + 1
    }));
  } catch (err) {
    console.warn('Failed to parse saved widget layout:', err);
    return DEFAULT_WIDGET_CONFIGS;
  }
}

/**
 * Saves widget layout to localStorage.
 */
export function saveWidgetLayout(widgets: WidgetConfig[]): void {
  if (typeof window === 'undefined') return;
  try {
    const minimal = widgets.map((w, idx) => ({
      id: w.id,
      type: w.type,
      visible: w.visible,
      collapsed: !!w.collapsed,
      order: idx + 1
    }));
    localStorage.setItem(STORAGE_KEY_WIDGET_LAYOUT, JSON.stringify(minimal));
  } catch (err) {
    console.warn('Failed to save widget layout:', err);
  }
}

/**
 * Immutably moves a widget from source index to target index and reindexes `order`.
 */
export function reorderWidgets(
  list: WidgetConfig[],
  sourceIndex: number,
  targetIndex: number
): WidgetConfig[] {
  if (
    sourceIndex < 0 ||
    sourceIndex >= list.length ||
    targetIndex < 0 ||
    targetIndex >= list.length ||
    sourceIndex === targetIndex
  ) {
    return list;
  }

  const result = [...list];
  const [removed] = result.splice(sourceIndex, 1);
  result.splice(targetIndex, 0, removed);

  return result.map((item, index) => ({
    ...item,
    order: index + 1
  }));
}

/**
 * Reorders list by matching an element's ID and inserting it before or after target element ID.
 */
export function reorderWidgetsById(
  list: WidgetConfig[],
  sourceId: string,
  targetId: string,
  insertBefore: boolean = true
): WidgetConfig[] {
  const sourceIndex = list.findIndex((w) => w.id === sourceId);
  const targetIndex = list.findIndex((w) => w.id === targetId);

  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
    return list;
  }

  const result = [...list];
  const [removed] = result.splice(sourceIndex, 1);

  // Re-calculate target index after removal
  let newTargetIndex = result.findIndex((w) => w.id === targetId);
  if (!insertBefore) {
    newTargetIndex += 1;
  }

  result.splice(newTargetIndex, 0, removed);

  return result.map((item, index) => ({
    ...item,
    order: index + 1
  }));
}

/**
 * Moves a widget by direction ('up', 'down', 'top', 'bottom').
 */
export function moveWidget(
  list: WidgetConfig[],
  widgetId: string,
  direction: 'up' | 'down' | 'top' | 'bottom'
): WidgetConfig[] {
  const index = list.findIndex((w) => w.id === widgetId);
  if (index === -1) return list;

  if (direction === 'top') {
    return reorderWidgets(list, index, 0);
  }
  if (direction === 'bottom') {
    return reorderWidgets(list, index, list.length - 1);
  }
  if (direction === 'up' && index > 0) {
    return reorderWidgets(list, index, index - 1);
  }
  if (direction === 'down' && index < list.length - 1) {
    return reorderWidgets(list, index, index + 1);
  }

  return list;
}

/**
 * Applies a preset ordering to existing widgets while preserving individual custom states.
 */
export function applyLayoutPreset(
  currentWidgets: WidgetConfig[],
  preset: LayoutPreset
): WidgetConfig[] {
  const widgetMap = new Map<ViewMode, WidgetConfig>(
    currentWidgets.map((w) => [w.type, w])
  );

  const reordered: WidgetConfig[] = [];
  const addedTypes = new Set<ViewMode>();

  preset.orderedTypes.forEach((type) => {
    const existing = widgetMap.get(type);
    if (existing) {
      reordered.push({ ...existing, visible: true });
      addedTypes.add(type);
    }
  });

  // Append any remaining widgets not in preset
  currentWidgets.forEach((w) => {
    if (!addedTypes.has(w.type)) {
      reordered.push(w);
    }
  });

  return reordered.map((w, idx) => ({
    ...w,
    order: idx + 1
  }));
}
