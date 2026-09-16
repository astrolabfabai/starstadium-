import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HighlightVideoItem, HighlightDownloadQueueItem, YtPlaylistScraperConfig } from '../../types';
import { 
  MOCK_HIGHLIGHT_VIDEOS, 
  DEFAULT_SCRAPER_CONFIG,
  VALIDATED_2026_PLAYLISTS,
  isPlaylistEligible
} from '../../data/highlightVideosData';
import {
  parseYouTubeVideoTitle,
  generateYtdlpBashScript,
  generatePythonScraperScript,
  generateN8nWorkflowJson,
  generateWebExtensionFiles
} from '../../utils/highlightMatcher';
import { NFL_TEAMS, SCHEDULES_DATA } from '../../data/sportsDataMock';
import { YouTubePlayerModal } from '../video/YouTubePlayerModal';
import { ImportYouTubeVideoModal } from '../video/ImportYouTubeVideoModal';
import { AddToPlaylistPlanModal } from '../video/AddToPlaylistPlanModal';
import { TeamLogo } from '../TeamLogo';
import {
  Play,
  Download,
  Terminal,
  Search,
  RefreshCw,
  Copy,
  Check,
  Radio,
  FileDown,
  X,
  Plus,
  ListPlus,
  Youtube,
  Tv,
  Filter,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowUpDown
} from 'lucide-react';

interface GameHighlightsAutomationViewProps {
  selectedSeason?: string;
  selectedGameKey?: string;
  onSelectGameKey?: (key: string) => void;
  onNavigateToGame?: (gameKey: string) => void;
}

export const GameHighlightsAutomationView: React.FC<GameHighlightsAutomationViewProps> = ({
  selectedSeason = '2026REG',
  selectedGameKey,
  onSelectGameKey,
  onNavigateToGame
}) => {
  // Load initial videos (MOCK_HIGHLIGHT_VIDEOS contains Previews and Highlights for every 2026 game)
  const [videos, setVideos] = useState<HighlightVideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('nfl_custom_imported_videos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...MOCK_HIGHLIGHT_VIDEOS];
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved videos', e);
    }
    return MOCK_HIGHLIGHT_VIDEOS;
  });

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('ALL');
  const [selectedPlaylistFilter, setSelectedPlaylistFilter] = useState<string>('ALL');
  
  // Modals
  const [activeModalVideo, setActiveModalVideo] = useState<HighlightVideoItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isPlaylistPlanModalOpen, setIsPlaylistPlanModalOpen] = useState<boolean>(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState<boolean>(false);
  const [activeScriptTab, setActiveScriptTab] = useState<'bash' | 'python' | 'n8n' | 'extension'>('bash');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Scraper Engine Config State
  const [config, setConfig] = useState<YtPlaylistScraperConfig>(DEFAULT_SCRAPER_CONFIG);
  const [isMatchingRunning, setIsMatchingRunning] = useState<boolean>(false);
  const [matchStatusLog, setMatchStatusLog] = useState<string>('Ready. Previews and Highlights indexed for every 2026 matchup.');
  const [manualTitleInput, setManualTitleInput] = useState<string>(
    'Ravens vs. Chiefs 2026 Week 1 Game Highlights & Full Drives'
  );
  const [parsedPreview, setParsedPreview] = useState<any>(null);

  // Active Download Queue State
  const [downloadQueue, setDownloadQueue] = useState<HighlightDownloadQueueItem[]>([
    {
      id: 'q-1',
      videoId: 'hyEng1b5j8o',
      title: 'Packers vs Eagles Week 1 Game Highlights & Full Drives',
      gameMatchup: 'GB @ PHI',
      playlistTitle: '2026 Week 1 Game Highlights & Full Drives - Official NFL',
      url: 'https://www.youtube.com/watch?v=hyEng1b5j8o&list=PLOq0V4m8a5Y0',
      format: 'mp4',
      status: 'COMPLETED',
      progress: 100,
      speed: '14.2 MB/s',
      eta: '00:00',
      addedAt: Date.now() - 1000 * 60 * 12,
      downloadPath: '~/NFL/downloads/2026_Season/Week_01/PHI_vs_GB/'
    }
  ]);

  // Save imported videos
  const handleImportVideo = (newVideo: HighlightVideoItem) => {
    setVideos((prev) => {
      const updated = [newVideo, ...prev];
      try {
        const userOnly = updated.filter((v) => v.id.startsWith('imported-') || v.id.startsWith('batch-'));
        localStorage.setItem('nfl_custom_imported_videos', JSON.stringify(userOnly));
      } catch (e) {
        console.warn('LocalStorage save failed', e);
      }
      return updated;
    });
  };

  const handleBatchImport = (newVideos: HighlightVideoItem[]) => {
    setVideos((prev) => {
      const updated = [...newVideos, ...prev];
      try {
        const userOnly = updated.filter((v) => v.id.startsWith('imported-') || v.id.startsWith('batch-'));
        localStorage.setItem('nfl_custom_imported_videos', JSON.stringify(userOnly));
      } catch (e) {
        console.warn('LocalStorage save failed', e);
      }
      return updated;
    });
  };

  // Rule enforcement: Keep all playlists that have this year (2026) in the title AND have Preview OR Highlights
  const eligiblePlaylists = VALIDATED_2026_PLAYLISTS.filter((pl) => 
    isPlaylistEligible(pl.title, '2026')
  );

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadFileBlob = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTestParse = () => {
    const res = parseYouTubeVideoTitle(manualTitleInput);
    setParsedPreview(res);
  };

  const handleRunAutoMatcher = () => {
    setIsMatchingRunning(true);
    setMatchStatusLog('Connecting to YouTube Data API & NFL Official Playlists...');

    setTimeout(() => {
      setMatchStatusLog('Harvesting playlists from https://www.youtube.com/@NFL/playlists...');
    }, 600);

    setTimeout(() => {
      setMatchStatusLog('Applying filter rule: [Year == 2026] && [Title has "Preview" OR "Highlights"]...');
    }, 1200);

    setTimeout(() => {
      setIsMatchingRunning(false);
      setMatchStatusLog(`✅ Synchronized: All ${SCHEDULES_DATA.length} games mapped to Preview & Highlights video streams.`);
    }, 1800);
  };

  const handleStartDownload = (video: HighlightVideoItem) => {
    const newItem: HighlightDownloadQueueItem = {
      id: `q-${Date.now()}`,
      videoId: video.videoId,
      title: video.title,
      gameMatchup: `${video.awayTeam} @ ${video.homeTeam}`,
      playlistTitle: video.playlistTitle,
      url: video.youtubeUrl,
      format: String(video.downloadFormat || '').startsWith('mp3') ? 'mp3' : 'mp4',
      status: 'ACTIVE',
      progress: 15,
      speed: '11.8 MB/s',
      eta: '00:14',
      addedAt: Date.now(),
      downloadPath: `~/NFL/downloads/${video.season}/${video.week}/${video.homeTeam}_vs_${video.awayTeam}/`
    };

    setDownloadQueue((prev) => [newItem, ...prev]);

    let currentProg = 15;
    const interval = setInterval(() => {
      currentProg += 25;
      if (currentProg >= 100) {
        clearInterval(interval);
        setDownloadQueue((prev) =>
          prev.map((it) =>
            it.id === newItem.id
              ? { ...it, status: 'COMPLETED', progress: 100, eta: '00:00', speed: 'Finished' }
              : it
          )
        );
      } else {
        setDownloadQueue((prev) =>
          prev.map((it) =>
            it.id === newItem.id ? { ...it, progress: currentProg } : it
          )
        );
      }
    }, 400);
  };

  // Filter video collection
  const filteredVideos = videos.filter((video) => {
    // Category filter
    if (activeCategory === 'PREVIEW' && video.category !== 'PREVIEW' && video.videoType !== 'PREVIEW') {
      return false;
    }
    if (activeCategory === 'HIGHLIGHTS' && video.category !== 'HIGHLIGHTS' && video.videoType !== 'HIGHLIGHTS') {
      return false;
    }
    if (activeCategory !== 'ALL' && activeCategory !== 'PREVIEW' && activeCategory !== 'HIGHLIGHTS') {
      if (video.category !== activeCategory) return false;
    }

    // Playlist filter
    if (selectedPlaylistFilter !== 'ALL') {
      if (video.playlistId !== selectedPlaylistFilter) return false;
    }

    // Team filter
    if (selectedTeamFilter !== 'ALL') {
      if (video.homeTeam !== selectedTeamFilter && video.awayTeam !== selectedTeamFilter) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = video.title.toLowerCase().includes(q);
      const matchHome = video.homeTeam.toLowerCase().includes(q);
      const matchAway = video.awayTeam.toLowerCase().includes(q);
      const matchWeek = video.week.toLowerCase().includes(q);
      if (!matchTitle && !matchHome && !matchAway && !matchWeek) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121218] via-[#101016] to-[#09090d] border border-white/10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
              <Youtube className="w-3.5 h-3.5" />
              <span>YouTube Video Integration</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
              2026 Regular Season
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
              Previews & Highlights Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white font-serif italic tracking-tight">
            NFL Video Vault & Playlist Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-mono">
            Every 2026 game is outfitted with official <strong>Previews</strong> and <strong>Highlights</strong>. 
            All playlists are strictly filtered to this year with Preview or Highlights.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 z-10 shrink-0">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-black transition flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Import YouTube Video</span>
          </button>

          <button
            onClick={() => setIsPlaylistPlanModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-mono text-xs font-black transition flex items-center gap-2 shadow-lg shadow-amber-500/25"
          >
            <ListPlus className="w-4 h-4 text-slate-950" />
            <span>Add to My YouTube Playlist</span>
          </button>

          <button
            onClick={() => setIsScriptModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-[#1c1c24] hover:bg-[#252530] text-amber-400 hover:text-white border border-amber-500/30 text-xs font-mono font-bold transition flex items-center gap-1.5"
          >
            <Terminal className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Export Scripts</span>
          </button>
        </div>
      </div>

      {/* Playlist Rule Enforcement Bar */}
      <div className="p-4 rounded-2xl bg-[#0f0f15] border border-white/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-white">
              Strict Playlist Filter Rule:
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-mono text-amber-300">
              Year: &ldquo;2026&rdquo; AND Title: (&ldquo;Preview&rdquo; OR &ldquo;Highlights&rdquo;)
            </span>
          </div>

          <span className="text-xs font-mono text-slate-400">
            {eligiblePlaylists.length} Verified Playlists Retained
          </span>
        </div>

        {/* Playlist selector chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setSelectedPlaylistFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
              selectedPlaylistFilter === 'ALL'
                ? 'bg-white/20 text-white border border-white/30'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            All Playlists ({videos.length} videos)
          </button>

          {eligiblePlaylists.map((pl) => (
            <button
              key={pl.playlistId}
              onClick={() => setSelectedPlaylistFilter(pl.playlistId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                selectedPlaylistFilter === pl.playlistId
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Youtube className="w-3.5 h-3.5 text-red-400" />
              <span className="truncate max-w-[240px]">{pl.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
          {[
            { id: 'ALL', label: `All Videos (${videos.length})` },
            { id: 'PREVIEW', label: '⚡ Game Previews' },
            { id: 'HIGHLIGHTS', label: '🏆 Game Highlights' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? cat.id === 'PREVIEW'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-[#141418] text-slate-400 hover:text-white hover:bg-[#1f1f26] border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Team Selector & Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            aria-label="Filter highlights by team"
            className="px-3 py-2 rounded-xl bg-[#141418] border border-white/10 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All 32 NFL Teams</option>
            {NFL_TEAMS.map((t) => (
              <option key={t.Key} value={t.Key}>
                {t.FullName} ({t.Key})
              </option>
            ))}
          </select>

          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search matchup or week..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#141418] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVideos.map((video) => {
          const isPreview = video.category === 'PREVIEW' || video.videoType === 'PREVIEW';
          return (
            <div
              key={video.id}
              className="rounded-2xl bg-[#111116] border border-white/10 overflow-hidden hover:border-white/20 transition-all flex flex-col group shadow-lg"
            >
              {/* Thumbnail Header */}
              <div 
                className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer" 
                onClick={() => setActiveModalVideo(video)}
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase shadow-md ${
                    isPreview 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-amber-500 text-slate-950'
                  }`}>
                    {isPreview ? '⚡ Game Preview' : '🏆 Game Highlights'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-slate-300 border border-white/10 text-[10px] font-mono font-bold">
                    Week {video.week.replace('Week_', '')}
                  </span>
                </div>

                {/* Duration Chip */}
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 font-mono text-[11px] font-bold text-white">
                  {video.duration}
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform ${
                    isPreview ? 'bg-blue-500 text-white' : 'bg-amber-500 text-slate-950'
                  }`}>
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Video Body Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <TeamLogo teamKey={video.awayTeam} size="xs" shape="circle" />
                      <span className="text-xs font-mono font-bold text-white">{video.awayTeam}</span>
                      <span className="text-slate-500 text-xs">@</span>
                      <TeamLogo teamKey={video.homeTeam} size="xs" shape="circle" />
                      <span className="text-xs font-mono font-bold text-white">{video.homeTeam}</span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400">
                      {video.viewsCount}
                    </span>
                  </div>

                  <h3
                    onClick={() => setActiveModalVideo(video)}
                    className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-2 cursor-pointer leading-snug font-mono"
                  >
                    {video.title}
                  </h3>

                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    Playlist: <span className="text-slate-300">{video.playlistTitle}</span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveModalVideo(video)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1.5 ${
                      isPreview
                        ? 'bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Watch {isPreview ? 'Preview' : 'Highlights'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyToClipboard(video.ytdlpCommand, video.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                      title="Copy yt-dlp command"
                    >
                      {copiedKey === video.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleStartDownload(video)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                      title="Download MP4"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Download Queue Section */}
      <div className="p-6 rounded-3xl bg-[#101014] border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono uppercase">
                Active yt-dlp Video Download Queue
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Real-time transcoding & progress pipeline from YouTube playlists
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                downloadFileBlob(
                  generateYtdlpBashScript(videos, config),
                  'download_all_nfl_highlights.sh',
                  'text/x-sh'
                )
              }
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono font-bold transition flex items-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Download Batch .sh</span>
            </button>
          </div>
        </div>

        {/* Queue Items List */}
        <div className="space-y-2">
          {downloadQueue.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-[#14141a] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      item.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-white font-bold">{item.gameMatchup}</span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-slate-300 truncate max-w-xs">{item.title}</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  Path: <code className="text-slate-400">{item.downloadPath}</code>
                </div>
              </div>

              <div className="flex items-center gap-4 min-w-[200px] justify-between sm:justify-end">
                <div className="space-y-1 w-28">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{item.speed}</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>

                <span className="text-[11px] text-slate-400">{item.eta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded YouTube IFrame API Player Modal */}
      {activeModalVideo && (
        <YouTubePlayerModal
          video={activeModalVideo}
          onClose={() => setActiveModalVideo(null)}
          onSwitchVideo={(newVid) => setActiveModalVideo(newVid)}
          availableVideos={videos}
          onAddToPlaylist={() => setIsPlaylistPlanModalOpen(true)}
        />
      )}

      {/* Import YouTube Video & Playlist Modal */}
      <ImportYouTubeVideoModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportVideo={handleImportVideo}
        onBatchImportVideos={handleBatchImport}
      />

      {/* Plan How to Add Videos to YouTube Playlist Modal */}
      <AddToPlaylistPlanModal
        isOpen={isPlaylistPlanModalOpen}
        onClose={() => setIsPlaylistPlanModalOpen(false)}
        videos={videos}
      />

      {/* Automation Script Modal */}
      {isScriptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-[#0f0f13] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#141419]">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  Automation & Downloader Script Generator
                </h3>
              </div>
              <button
                onClick={() => setIsScriptModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-2.5 bg-[#0a0a0d] border-b border-white/10 flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'bash', label: '📜 yt-dlp Smart Bash (ytdl.sh)' },
                { id: 'python', label: '🐍 Python Scraper (scraper.py)' },
                { id: 'n8n', label: '🔄 n8n Workflow JSON' },
                { id: 'extension', label: '🧩 Browser Add-on (WebExtension)' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveScriptTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap ${
                    activeScriptTab === tab.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 p-5 overflow-y-auto bg-[#070709] font-mono text-xs text-slate-300">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {activeScriptTab === 'bash' && generateYtdlpBashScript(videos, config)}
                {activeScriptTab === 'python' && generatePythonScraperScript(config)}
                {activeScriptTab === 'n8n' && generateN8nWorkflowJson(config)}
                {activeScriptTab === 'extension' && generateWebExtensionFiles(config).popupJs}
              </pre>
            </div>

            <div className="p-4 bg-[#141419] border-t border-white/10 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-mono">
                Supports YouTube IFrame API and batch yt-dlp harvesting
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    let code = '';
                    if (activeScriptTab === 'bash') code = generateYtdlpBashScript(videos, config);
                    if (activeScriptTab === 'python') code = generatePythonScraperScript(config);
                    if (activeScriptTab === 'n8n') code = generateN8nWorkflowJson(config);
                    if (activeScriptTab === 'extension') code = generateWebExtensionFiles(config).popupJs;
                    copyToClipboard(code, 'modal-code');
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold font-mono transition flex items-center gap-1.5"
                >
                  {copiedKey === 'modal-code' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>Copy Code</span>
                </button>

                <button
                  onClick={() => {
                    if (activeScriptTab === 'bash') {
                      downloadFileBlob(generateYtdlpBashScript(videos, config), 'ytdl.sh', 'text/x-sh');
                    } else if (activeScriptTab === 'python') {
                      downloadFileBlob(generatePythonScraperScript(config), 'scraper.py', 'text/x-python');
                    } else if (activeScriptTab === 'n8n') {
                      downloadFileBlob(generateN8nWorkflowJson(config), 'nfl_yt_dlp_workflow.json', 'application/json');
                    } else {
                      downloadFileBlob(generateWebExtensionFiles(config).popupJs, 'popup.js', 'text/javascript');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black font-mono hover:bg-amber-400 transition flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
