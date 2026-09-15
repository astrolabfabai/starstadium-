import React, { useState } from 'react';
import { HighlightVideoItem } from '../../types';
import { SCHEDULES_DATA } from '../../data/sportsDataMock';
import { parseYouTubeUrl } from '../../data/highlightVideosData';
import { 
  X, 
  Upload, 
  Check, 
  AlertCircle, 
  Youtube, 
  Plus, 
  FileText, 
  ListPlus,
  Play
} from 'lucide-react';
import { TeamLogo } from '../TeamLogo';

interface ImportYouTubeVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportVideo: (video: HighlightVideoItem) => void;
  onBatchImportVideos?: (videos: HighlightVideoItem[]) => void;
}

export const ImportYouTubeVideoModal: React.FC<ImportYouTubeVideoModalProps> = ({
  isOpen,
  onClose,
  onImportVideo,
  onBatchImportVideos
}) => {
  const [importMode, setImportMode] = useState<'single' | 'batch'>('single');
  const [urlInput, setUrlInput] = useState<string>('');
  const [titleInput, setTitleInput] = useState<string>('');
  const [selectedGameKey, setSelectedGameKey] = useState<string>(SCHEDULES_DATA[0]?.GameKey || '202610101');
  const [category, setCategory] = useState<'PREVIEW' | 'HIGHLIGHTS'>('HIGHLIGHTS');
  const [batchTextInput, setBatchTextInput] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    const { videoId, playlistId } = parseYouTubeUrl(val);
    
    // Auto infer category if URL or title has preview/highlight
    if (/preview/i.test(val)) {
      setCategory('PREVIEW');
    } else if (/highlight/i.test(val) || playlistId) {
      setCategory('HIGHLIGHTS');
    }

    if (videoId && !titleInput) {
      const game = SCHEDULES_DATA.find((g) => g.GameKey === selectedGameKey);
      if (game) {
        setTitleInput(`${game.AwayTeam} vs ${game.HomeTeam} 2026 Week ${game.Week} ${category === 'PREVIEW' ? 'Game Preview' : 'Game Highlights'}`);
      }
    }
  };

  const handleImportSingle = (e: React.FormEvent) => {
    e.preventDefault();
    const url = urlInput.trim();
    if (!url) {
      setFeedback({ type: 'error', message: 'Please enter a valid YouTube URL.' });
      return;
    }

    const { videoId, playlistId } = parseYouTubeUrl(url);
    if (!videoId && !playlistId) {
      setFeedback({ type: 'error', message: 'Could not extract a valid YouTube video ID or playlist ID.' });
      return;
    }

    const game = SCHEDULES_DATA.find((g) => g.GameKey === selectedGameKey) || SCHEDULES_DATA[0];
    const resolvedVideoId = videoId || 'hyEng1b5j8o';
    const effectiveTitle = titleInput.trim() || `${game.AwayTeam} vs ${game.HomeTeam} 2026 Week ${game.Week} ${category === 'PREVIEW' ? 'Game Preview' : 'Game Highlights'}`;
    const seasonStr = `${game.Season}_Season`;
    const weekStr = `Week_${String(game.Week).padStart(2, '0')}`;

    const newVideo: HighlightVideoItem = {
      id: `imported-${Date.now()}-${resolvedVideoId}`,
      gameKey: game.GameKey,
      season: seasonStr,
      week: weekStr,
      homeTeam: game.HomeTeam,
      awayTeam: game.AwayTeam,
      title: effectiveTitle,
      youtubeUrl: url,
      videoId: resolvedVideoId,
      playlistId: playlistId || (category === 'HIGHLIGHTS' ? 'PLOq0V4m8a5Y0' : 'PL_2026_PREVIEWS_NFL'),
      playlistTitle: category === 'PREVIEW' 
        ? `2026 Week ${game.Week} Game Previews - Official NFL` 
        : `2026 Week ${game.Week} Game Highlights & Full Drives - Official NFL`,
      videoType: category,
      thumbnailUrl: `https://img.youtube.com/vi/${resolvedVideoId}/hqdefault.jpg`,
      duration: '12:00',
      category: category,
      viewsCount: 'Imported by User',
      publishedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      fileSizeMb: 350.0,
      downloadFormat: 'mp4_1080p',
      matchConfidence: 100,
      matchedPlayer: `${game.AwayTeam} vs ${game.HomeTeam}`,
      ytdlpCommand: `yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "~/NFL/downloads/${seasonStr}/${weekStr}/%(title)s.%(ext)s" "${url}"`,
      status: 'READY'
    };

    onImportVideo(newVideo);
    setFeedback({ type: 'success', message: `Successfully imported "${effectiveTitle}"!` });
    setUrlInput('');
    setTitleInput('');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleImportBatch = () => {
    const lines = batchTextInput.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      setFeedback({ type: 'error', message: 'Please enter one or more YouTube URLs (one per line).' });
      return;
    }

    const importedList: HighlightVideoItem[] = [];
    lines.forEach((line, idx) => {
      const { videoId, playlistId } = parseYouTubeUrl(line);
      if (!videoId && !playlistId) return;

      const game = SCHEDULES_DATA[idx % SCHEDULES_DATA.length];
      const isPreview = /preview/i.test(line) || idx % 2 === 0;
      const cat = isPreview ? 'PREVIEW' : 'HIGHLIGHTS';
      const resolvedVid = videoId || 'fXx6KX_xAdQ';

      importedList.push({
        id: `batch-${Date.now()}-${idx}`,
        gameKey: game.GameKey,
        season: `${game.Season}_Season`,
        week: `Week_${String(game.Week).padStart(2, '0')}`,
        homeTeam: game.HomeTeam,
        awayTeam: game.AwayTeam,
        title: `${game.AwayTeam} vs ${game.HomeTeam} 2026 Week ${game.Week} ${cat === 'PREVIEW' ? 'Game Preview' : 'Game Highlights'}`,
        youtubeUrl: line,
        videoId: resolvedVid,
        playlistId: playlistId || (cat === 'HIGHLIGHTS' ? 'PLOq0V4m8a5Y0' : 'PL_2026_PREVIEWS_NFL'),
        playlistTitle: cat === 'PREVIEW' 
          ? `2026 Week ${game.Week} Game Previews - Official NFL` 
          : `2026 Week ${game.Week} Game Highlights & Full Drives - Official NFL`,
        videoType: cat,
        thumbnailUrl: `https://img.youtube.com/vi/${resolvedVid}/hqdefault.jpg`,
        duration: '14:20',
        category: cat,
        viewsCount: 'Imported Batch',
        publishedDate: '2026 Season',
        fileSizeMb: 400.0,
        downloadFormat: 'mp4_1080p',
        matchConfidence: 98,
        matchedPlayer: `${game.AwayTeam} & ${game.HomeTeam}`,
        ytdlpCommand: `yt-dlp -f "bv*+ba/b" --merge-output-format mp4 "${line}"`,
        status: 'READY'
      });
    });

    if (importedList.length === 0) {
      setFeedback({ type: 'error', message: 'No valid YouTube URLs found in the text.' });
      return;
    }

    if (onBatchImportVideos) {
      onBatchImportVideos(importedList);
    } else {
      importedList.forEach(onImportVideo);
    }

    setFeedback({ type: 'success', message: `Imported ${importedList.length} NFL YouTube videos successfully!` });
    setBatchTextInput('');
    setTimeout(() => {
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#0f0f14] border border-white/15 rounded-3xl overflow-hidden shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 bg-[#14141c] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono">
                Import NFL YouTube Videos & Playlists
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Add official previews or game highlights to any matchup
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 flex items-center gap-2">
          <button
            onClick={() => setImportMode('single')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
              importMode === 'single'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Single Video / Playlist URL</span>
          </button>

          <button
            onClick={() => setImportMode('batch')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
              importMode === 'batch'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <ListPlus className="w-3.5 h-3.5" />
            <span>Batch Multi-URL Import</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mx-6 p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}>
            {feedback.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="px-6 pb-6 space-y-4 text-xs font-mono">
          {importMode === 'single' ? (
            <form onSubmit={handleImportSingle} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-400" /> YouTube Video or Playlist URL:
                </label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=fXx6KX_xAdQ or https://www.youtube.com/playlist?list=..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141c] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
                <div className="flex gap-2 text-[10px] text-slate-400">
                  <span>Quick demo links:</span>
                  <button
                    type="button"
                    onClick={() => handleUrlChange('https://www.youtube.com/watch?v=fXx6KX_xAdQ')}
                    className="text-amber-400 hover:underline"
                  >
                    Preview (fXx6KX_xAdQ)
                  </button>
                  <span>&bull;</span>
                  <button
                    type="button"
                    onClick={() => handleUrlChange('https://www.youtube.com/watch?v=hyEng1b5j8o&list=PLOq0V4m8a5Y0')}
                    className="text-amber-400 hover:underline"
                  >
                    Highlights (hyEng1b5j8o)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">Target 2026 NFL Matchup:</label>
                  <select
                    value={selectedGameKey}
                    onChange={(e) => setSelectedGameKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#14141c] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                  >
                    {SCHEDULES_DATA.map((g) => (
                      <option key={g.GameKey} value={g.GameKey}>
                        Week {g.Week}: {g.AwayTeam} @ {g.HomeTeam} ({g.Date})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">Video Type:</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCategory('PREVIEW')}
                      className={`flex-1 py-2 rounded-xl font-bold transition text-xs ${
                        category === 'PREVIEW'
                          ? 'bg-blue-600 text-white border border-blue-400'
                          : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      Game Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory('HIGHLIGHTS')}
                      className={`flex-1 py-2 rounded-xl font-bold transition text-xs ${
                        category === 'HIGHLIGHTS'
                          ? 'bg-amber-500 text-slate-950 border border-amber-400'
                          : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      Game Highlights
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">Custom Title (Optional):</label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="Leave blank to auto-generate from matchup and category"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141c] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/25 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import to 2026 Vault</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">Paste Multiple YouTube URLs (one per line):</label>
                <textarea
                  rows={6}
                  value={batchTextInput}
                  onChange={(e) => setBatchTextInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=fXx6KX_xAdQ&#10;https://www.youtube.com/watch?v=hyEng1b5j8o&list=PLOq0V4m8a5Y0&#10;https://youtu.be/..."
                  className="w-full p-3 rounded-xl bg-[#14141c] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 font-mono resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportBatch}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/25 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Batch Import URLs</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
