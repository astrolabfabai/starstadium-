import React, { useState } from 'react';
import { HighlightVideoItem } from '../../types';
import { generateYouTubePlaylistPlan } from '../../data/highlightVideosData';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Code, 
  Terminal, 
  ListPlus, 
  Sparkles, 
  FileText,
  Youtube,
  ShieldCheck,
  Play
} from 'lucide-react';

interface AddToPlaylistPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  videos: HighlightVideoItem[];
}

export const AddToPlaylistPlanModal: React.FC<AddToPlaylistPlanModalProps> = ({
  isOpen,
  onClose,
  videos
}) => {
  const [activeTab, setActiveTab] = useState<'quick-queue' | 'api-script' | 'ytdlp' | 'export-list'>('quick-queue');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [playlistTitle, setPlaylistTitle] = useState<string>('2026 NFL Game Previews & Highlights');

  if (!isOpen) return null;

  const plan = generateYouTubePlaylistPlan(videos, playlistTitle);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-[#0f0f15] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#14141c] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                Plan: Add All {plan.videoIds.length} Videos to Your YouTube Playlist
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Four verified ways to transfer game previews and highlights into your personal YouTube library
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

        {/* Tab Selection */}
        <div className="p-3 bg-[#111118] border-b border-white/5 flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('quick-queue')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
              activeTab === 'quick-queue'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Method 1: 1-Click Instant YouTube Queue</span>
          </button>

          <button
            onClick={() => setActiveTab('api-script')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
              activeTab === 'api-script'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Method 2: YouTube API v3 Script</span>
          </button>

          <button
            onClick={() => setActiveTab('ytdlp')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
              activeTab === 'ytdlp'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Method 3: yt-dlp Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('export-list')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
              activeTab === 'export-list'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Method 4: Raw Links / CSV</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4 text-xs font-mono">
          {activeTab === 'quick-queue' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Easiest Method: YouTube Watch Queue Deep Link
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  YouTube supports a special URL format (<code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">https://www.youtube.com/watch_videos?video_ids=...</code>) 
                  that loads all your selected videos directly into an active playlist queue in your browser. 
                  Once opened, just click the <strong>&ldquo;+ Save playlist&rdquo;</strong> button under the video title to permanently add it to your YouTube channel!
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-bold">Custom Playlist Name:</label>
                <input
                  type="text"
                  value={playlistTitle}
                  onChange={(e) => setPlaylistTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141c] border border-white/10 text-white text-xs font-mono"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#14141c] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Queue URL:</span>
                  <p className="text-[11px] text-white truncate max-w-md">
                    {plan.quickQueueUrl}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(plan.quickQueueUrl, 'queue-url')}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold flex items-center gap-1.5 transition"
                  >
                    {copiedKey === 'queue-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'queue-url' ? 'Copied' : 'Copy Link'}</span>
                  </button>

                  <a
                    href={plan.quickQueueUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Open YouTube Queue</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#101017] border border-white/5 space-y-2">
                <h5 className="font-bold text-slate-300">Step-by-Step Instructions:</h5>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>Click <strong className="text-white">&ldquo;Open YouTube Queue&rdquo;</strong> above to launch YouTube with all videos queued.</li>
                  <li>In YouTube, look at the right playlist sidebar and click the <strong className="text-white">&ldquo;Save to playlist&rdquo;</strong> icon (or &ldquo;+&rdquo;).</li>
                  <li>Select <strong className="text-white">&ldquo;+ Create new playlist&rdquo;</strong> and name it <code className="text-amber-400 font-bold">&ldquo;{playlistTitle}&rdquo;</code>.</li>
                  <li>Done! All preview and highlight clips are now securely saved in your YouTube library.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'api-script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">YouTube Data API v3 Automation Script</h4>
                  <p className="text-slate-400 text-[11px]">
                    Uses Google OAuth 2.0 to programmatically insert all video items via <code className="text-amber-400">playlistItems.insert</code>
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(plan.pythonScript, 'py-script')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center gap-1.5 hover:bg-amber-400 transition"
                >
                  {copiedKey === 'py-script' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'py-script' ? 'Copied Script' : 'Copy Python Code'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-black border border-white/10 text-[11px] text-emerald-400 overflow-x-auto max-h-[380px] font-mono leading-relaxed">
                {plan.pythonScript}
              </pre>
            </div>
          )}

          {activeTab === 'ytdlp' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">yt-dlp Local Archive Sync</h4>
                  <p className="text-slate-400 text-[11px]">
                    Downloads all matching videos in 1080p with embedded metadata to your hard drive
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(plan.ytdlpBatchCommand, 'ytdlp-cmd')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center gap-1.5 hover:bg-amber-400 transition"
                >
                  {copiedKey === 'ytdlp-cmd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'ytdlp-cmd' ? 'Copied Command' : 'Copy Shell Command'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-black border border-white/10 font-mono text-[11px] text-amber-300 break-all">
                {plan.ytdlpBatchCommand}
              </div>
            </div>
          )}

          {activeTab === 'export-list' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">Raw Video URLs & Matchups</h4>
                  <p className="text-slate-400 text-[11px]">
                    {videos.length} items formatted for clipboard or CSV import
                  </p>
                </div>

                <button
                  onClick={() => {
                    const csvContent = videos.map((v) => `"${v.awayTeam} vs ${v.homeTeam}","${v.category}","${v.youtubeUrl}"`).join('\n');
                    handleCopy(`Matchup,Category,URL\n${csvContent}`, 'csv-copy');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold flex items-center gap-1.5 transition"
                >
                  {copiedKey === 'csv-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'csv-copy' ? 'Copied CSV' : 'Copy as CSV'}</span>
                </button>
              </div>

              <div className="max-h-[340px] overflow-y-auto space-y-1.5 pr-1">
                {videos.map((v, i) => (
                  <div key={v.id || i} className="p-2.5 rounded-xl bg-[#14141c] border border-white/5 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-white font-bold truncate">
                      {v.awayTeam} vs {v.homeTeam} &bull; <span className="text-amber-400">{v.category}</span>
                    </span>
                    <a
                      href={v.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-white flex items-center gap-1 shrink-0 font-mono"
                    >
                      <span>{v.videoId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
