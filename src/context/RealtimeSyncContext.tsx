import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { playScoreChime } from '../utils/audioChimes';

export interface LiveSimGame {
  gameKey: string;
  awayTeam: string;
  homeTeam: string;
  quarter: string;
  quarterNum: number;
  clockSeconds: number;
  clockDisplay: string;
  awayScore: number;
  homeScore: number;
  down: number;
  distance: number;
  yardLine: number;
  yardLineSide: string;
  possession: string;
  isRedZone: boolean;
  marketStatus: 'LIVE' | 'SUSPENDED' | 'SETTLED';
  spread: number;
  spreadOdds: number;
  overUnder: number;
  awayML: number;
  homeML: number;
  lineMovement: 'UP' | 'DOWN' | 'STABLE';
  lastPlayDesc: string;
  lastPlayDeltaWpa: number;
  winProbHome: number;
  winProbAway: number;
  playClock: number;
}

export interface RealtimeSyncContextType {
  games: Record<string, LiveSimGame>;
  selectedGame: LiveSimGame | null;
  connectionStatus: 'connected' | 'connecting' | 'polling_fallback' | 'disconnected';
  transportMode: 'SSE Stream' | 'Smart Polling (3s)';
  latencyMs: number;
  tickCount: number;
  lastSyncTime: number;
  activeGameKey: string;
  setActiveGameKey: (key: string) => void;
  isArchitectureModalOpen: boolean;
  setIsArchitectureModalOpen: (open: boolean) => void;
  isUiModalOpen: boolean;
  setIsUiModalOpen: (open: boolean) => void;
  isShortcutsModalOpen: boolean;
  setIsShortcutsModalOpen: (open: boolean) => void;
  isGameSwitcherOpen: boolean;
  setIsGameSwitcherOpen: (open: boolean) => void;
  soundAlertsEnabled: boolean;
  setSoundAlertsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  simulatePlay: (eventType: 'TOUCHDOWN' | 'INTERCEPTION' | 'RED_ZONE' | 'RESET', gameKey?: string) => Promise<void>;
  forceSync: () => Promise<void>;
  toggleTransport: () => void;
}

const RealtimeSyncContext = createContext<RealtimeSyncContextType | undefined>(undefined);

export const RealtimeSyncProvider: React.FC<{ children: React.ReactNode; defaultGameKey?: string }> = ({
  children,
  defaultGameKey = '202610101'
}) => {
  const [games, setGames] = useState<Record<string, LiveSimGame>>({
    '202610101': {
      gameKey: '202610101',
      awayTeam: 'BAL',
      homeTeam: 'KC',
      quarter: 'Q4',
      quarterNum: 4,
      clockSeconds: 135,
      clockDisplay: '02:15',
      awayScore: 24,
      homeScore: 27,
      down: 2,
      distance: 7,
      yardLine: 18,
      yardLineSide: 'KC',
      possession: 'BAL',
      isRedZone: true,
      marketStatus: 'SUSPENDED',
      spread: -3.0,
      spreadOdds: -110,
      overUnder: 48.5,
      awayML: 140,
      homeML: -165,
      lineMovement: 'DOWN',
      lastPlayDesc: 'Lamar Jackson scramble up the middle for 6 yards to the KC 18. Tackled by Chris Jones.',
      lastPlayDeltaWpa: -0.042,
      winProbHome: 63.8,
      winProbAway: 36.2,
      playClock: 21
    },
    '202610103': {
      gameKey: '202610103',
      awayTeam: 'DAL',
      homeTeam: 'LAC',
      quarter: 'Q3',
      quarterNum: 3,
      clockSeconds: 524,
      clockDisplay: '08:44',
      awayScore: 20,
      homeScore: 17,
      down: 1,
      distance: 10,
      yardLine: 34,
      yardLineSide: 'LAC',
      possession: 'DAL',
      isRedZone: false,
      marketStatus: 'LIVE',
      spread: -1.5,
      spreadOdds: -115,
      overUnder: 44.5,
      awayML: -120,
      homeML: 100,
      lineMovement: 'UP',
      lastPlayDesc: 'Dak Prescott pass short right to CeeDee Lamb for 12 yards to the LAC 34. 1st Down.',
      lastPlayDeltaWpa: 0.038,
      winProbHome: 46.2,
      winProbAway: 53.8,
      playClock: 28
    }
  });

  const [activeGameKey, setActiveGameKey] = useState<string>(defaultGameKey);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'polling_fallback' | 'disconnected'>('connecting');
  const [transportMode, setTransportMode] = useState<'SSE Stream' | 'Smart Polling (3s)'>('SSE Stream');
  const [latencyMs, setLatencyMs] = useState<number>(14);
  const [tickCount, setTickCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);
  const [isUiModalOpen, setIsUiModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [isGameSwitcherOpen, setIsGameSwitcherOpen] = useState<boolean>(false);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(true);

  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingTimerRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const lastPacketTimestampRef = useRef<number>(Date.now());

  // Function to process received live games data
  const handleIncomingGames = useCallback((newGames: LiveSimGame[], serverTimestamp?: number) => {
    if (serverTimestamp) {
      const ping = Math.max(1, Math.min(250, Date.now() - serverTimestamp));
      setLatencyMs(ping);
    }
    setLastSyncTime(Date.now());
    lastPacketTimestampRef.current = Date.now();

    setGames((prev) => {
      const next = { ...prev };
      newGames.forEach((g) => {
        next[g.gameKey] = g;
      });
      return next;
    });
  }, []);

  // 1. Establish SSE Connection with Auto-Reconnect (inspired by The Athletic & ESPN real-time streams)
  useEffect(() => {
    if (transportMode !== 'SSE Stream') {
      return;
    }

    setConnectionStatus('connecting');

    const connectSSE = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      try {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        const es = new EventSource('/api/realtime/stream');
        eventSourceRef.current = es;

        es.onopen = () => {
          setConnectionStatus('connected');
          reconnectAttemptsRef.current = 0;
        };

        es.addEventListener('initial_state', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            if (Array.isArray(data.games)) {
              handleIncomingGames(data.games, data.timestamp);
              setTickCount(data.tickId || 0);
            }
          } catch {}
        });

        es.addEventListener('game_tick', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            if (Array.isArray(data.games)) {
              handleIncomingGames(data.games, data.timestamp);
              setTickCount(data.tickId || 0);
            }
          } catch {}
        });

        es.onerror = () => {
          // If SSE encounters an error, fall back to smart polling gracefully while scheduling reconnect
          setConnectionStatus('polling_fallback');
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }

          // Exponential backoff reconnect: 3s, 4.5s, 6.75s, up to 30s
          const delay = Math.min(30000, Math.round(3000 * Math.pow(1.5, reconnectAttemptsRef.current)));
          reconnectAttemptsRef.current += 1;

          reconnectTimeoutRef.current = setTimeout(() => {
            if (transportMode === 'SSE Stream') {
              connectSSE();
            }
          }, delay);
        };
      } catch (err) {
        setConnectionStatus('polling_fallback');
      }
    };

    connectSSE();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [transportMode, handleIncomingGames]);

  // 2. Smart Polling Fallback (runs if SSE is disabled or in fallback mode)
  useEffect(() => {
    if (transportMode === 'Smart Polling (3s)' || connectionStatus === 'polling_fallback') {
      const poll = async () => {
        const start = Date.now();
        try {
          const res = await fetch('/api/realtime/status');
          if (res.ok) {
            const data = await res.json();
            const duration = Date.now() - start;
            setLatencyMs(duration);
            if (Array.isArray(data.activeGames)) {
              handleIncomingGames(data.activeGames, Date.now());
              setTickCount(data.currentTick || 0);
            }
          }
        } catch {}
      };

      poll();
      pollingTimerRef.current = setInterval(poll, 3000);

      return () => {
        if (pollingTimerRef.current) {
          clearInterval(pollingTimerRef.current);
        }
      };
    }
  }, [transportMode, connectionStatus, handleIncomingGames]);

  // Interactive Play Simulator (Touchdown, Interception, Red Zone snap)
  const simulatePlay = useCallback(
    async (eventType: 'TOUCHDOWN' | 'INTERCEPTION' | 'RED_ZONE' | 'RESET', gameKey?: string) => {
      const target = gameKey || activeGameKey || '202610101';
      // Trigger sound alert if enabled (Flashscore & SofaScore model)
      if (soundAlertsEnabled) {
        if (eventType === 'TOUCHDOWN') playScoreChime('touchdown');
        else if (eventType === 'INTERCEPTION') playScoreChime('turnover');
        else if (eventType === 'RED_ZONE') playScoreChime('redzone');
      }

      try {
        const res = await fetch('/api/realtime/simulate-play', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameKey: target, eventType })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.updatedGame) {
            handleIncomingGames([data.updatedGame], Date.now());
          }
        }
      } catch (err) {
        console.warn('Simulation trigger warning:', err);
      }
    },
    [activeGameKey, handleIncomingGames, soundAlertsEnabled]
  );

  // Force immediate sync
  const forceSync = useCallback(async () => {
    const start = Date.now();
    try {
      const res = await fetch('/api/realtime/status');
      if (res.ok) {
        const data = await res.json();
        setLatencyMs(Date.now() - start);
        if (Array.isArray(data.activeGames)) {
          handleIncomingGames(data.activeGames, Date.now());
          setTickCount(data.currentTick || 0);
        }
      }
    } catch {}
  }, [handleIncomingGames]);

  const toggleTransport = useCallback(() => {
    setTransportMode((prev) => (prev === 'SSE Stream' ? 'Smart Polling (3s)' : 'SSE Stream'));
  }, []);

  const selectedGame = games[activeGameKey] || Object.values(games)[0] || null;

  return (
    <RealtimeSyncContext.Provider
      value={{
        games,
        selectedGame,
        connectionStatus,
        transportMode,
        latencyMs,
        tickCount,
        lastSyncTime,
        activeGameKey,
        setActiveGameKey,
        isArchitectureModalOpen,
        setIsArchitectureModalOpen,
        isUiModalOpen,
        setIsUiModalOpen,
        isShortcutsModalOpen,
        setIsShortcutsModalOpen,
        isGameSwitcherOpen,
        setIsGameSwitcherOpen,
        soundAlertsEnabled,
        setSoundAlertsEnabled,
        simulatePlay,
        forceSync,
        toggleTransport
      }}
    >
      {children}
    </RealtimeSyncContext.Provider>
  );
};

export const useRealtimeSync = () => {
  const context = useContext(RealtimeSyncContext);
  if (!context) {
    throw new Error('useRealtimeSync must be used within a RealtimeSyncProvider');
  }
  return context;
};
