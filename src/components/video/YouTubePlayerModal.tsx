import React, { useState, useRef } from 'react';
import { HighlightVideoItem } from '../../types';
import { 
  X, 
  ExternalLink, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Copy, 
  Check, 
  Tv, 
  Flame, 
  Calendar, 
  ListPlus, 
  ShieldAlert,
  Sliders,
  Maximize2
} from 'lucide-react';
import { TeamLogo } from '../TeamLogo';

interface YouTubePlayerModalProps {
  video: HighlightVideoItem | null;
  onClose: () => void;
  onSwitchVideo?: (video: HighlightVideoItem) => void;
  availableVideos?: HighlightVideoItem[];
  onAddToPlaylist?: (video: HighlightVideoItem) => void;
}

export const YouTubePlayerModal: React.FC<YouTubePlayerModalProps> = ({
  video,
  onClose,
  onSwitchVideo,
  availableVideos = [],
  onAddToPlaylist
}) => {
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [addedToPlaylist, setAddedToPlaylist] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!video) return null;

  // Determine other video for this game (e.g. if watching Preview, get Highlights; if watching Highlights, get Preview)
  const pairedVideo = availableVideos.find(
    (v) => v.gameKey === video.gameKey && v.id !== video.id
  );

  // Send YouTube IFrame API command via postMessage
  const sendIframeCommand = (func: string, args: unknown[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: func,
          args: args
        }),
        '*'
      );
    }
  };

  const handleSetSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    sendIframeCommand('setPlaybackRate', [speed]);
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(video.ytdlpCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleAddToPlaylist = () => {
    if (onAddToPlaylist) {
      onAddToPlaylist(video);
    }
    setAddedToPlaylist(true);
    setTimeout(() => setAddedToPlaylist(false), 2200);
  };

  // Embed URL respecting YouTube IFrame Player API
  // Using youtube-nocookie and standard parameters: enablejsapi=1, autoplay=1, rel=0
  const embedSrc = video.playlistId
    ? `https://www.youtube-nocookie.com/embed/${video.videoId}?list=${video.playlistId}&enablejsapi=1&autoplay=1&rel=0`
    : `https://www.youtube-nocookie.com/embed/${video.videoId}?enablejsapi=1&autoplay=1&rel=0`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-[#0d0d12] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 bg-[#14141c] border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <TeamLogo teamKey={video.awayTeam} size="xs" shape="circle" />
              <span className="text-xs font-mono font-bold text-white">{video.awayTeam}</span>
              <span className="text-slate-500 text-xs">@</span>
              <TeamLogo teamKey={video.homeTeam} size="xs" shape="circle" />
              <span className="text-xs font-mono font-bold text-white">{video.homeTeam}</span>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black uppercase shrink-0 ${
              video.category === 'PREVIEW' || video.videoType === 'PREVIEW'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {video.category === 'PREVIEW' ? 'Game Preview' : 'Game Highlights'}
            </span>

            <h3 className="text-xs sm:text-sm font-bold text-slate-200 truncate hidden sm:block font-mono">
              {video.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAddToPlaylist}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                addedToPlaylist
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
              }`}
            >
              {addedToPlaylist ? <Check className="w-3.5 h-3.5" /> : <ListPlus className="w-3.5 h-3.5" />}
              <span>{addedToPlaylist ? 'Added!' : 'Add to Playlist'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4">
          {/* 16:9 YouTube IFrame Player */}
          <div className="relative aspect-video rounded-2xl bg-black border border-white/10 overflow-hidden shadow-2xl">
            <iframe
              ref={iframeRef}
              src={embedSrc}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Player Controls Bar (YouTube IFrame API Demo style) */}
          <div className="p-3 bg-[#13131a] border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-amber-400" /> Speed:
              </span>
              {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleSetSpeed(rate)}
                  className={`px-2 py-0.5 rounded-md font-bold transition ${
                    playbackSpeed === rate
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Direct YouTube link fallback for NFL broadcast license restrictions */}
              <a
                href={video.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 shadow-md transition"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
              </a>

              <button
                onClick={handleCopyCmd}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold flex items-center gap-1.5 transition"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd ? 'Command Copied' : 'Copy yt-dlp'}</span>
              </button>
            </div>
          </div>

          {/* Paired Video Switcher (Preview vs Highlights for the game) */}
          {pairedVideo && onSwitchVideo && (
            <div className="p-3.5 bg-gradient-to-r from-blue-950/40 via-[#13131c] to-amber-950/40 border border-white/10 rounded-2xl flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Switch Game Broadcast:
                </span>
                <p className="text-xs font-bold text-white truncate">
                  {pairedVideo.category === 'PREVIEW' ? '⚡ Watch Tactical Preview' : '🏆 Watch Game Highlights'} &bull; {pairedVideo.duration}
                </p>
              </div>

              <button
                onClick={() => onSwitchVideo(pairedVideo)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-black shrink-0 flex items-center gap-1.5 transition ${
                  pairedVideo.category === 'PREVIEW'
                    ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Load {pairedVideo.category === 'PREVIEW' ? 'Preview' : 'Highlights'}</span>
              </button>
            </div>
          )}

          {/* Video Metadata & Playlist info */}
          <div className="p-4 bg-[#101017] border border-white/5 rounded-2xl space-y-2 text-xs font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
              <span className="text-slate-400">
                Matchup: <strong className="text-white">{video.awayTeam} vs {video.homeTeam}</strong> ({video.season} - {video.week})
              </span>
              <span className="text-slate-400">
                Duration: <strong className="text-amber-400">{video.duration}</strong> &bull; {video.viewsCount || 'Official'}
              </span>
            </div>

            <div className="text-slate-400 text-[11px] flex flex-wrap items-center justify-between gap-2 pt-1">
              <span>
                Official Playlist: <strong className="text-slate-300">{video.playlistTitle || '2026 NFL Highlights & Previews'}</strong>
              </span>
              <span className="text-slate-500">Video ID: {video.videoId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
