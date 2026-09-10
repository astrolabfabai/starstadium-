import React from 'react';
import { Bell, BellOff, Flame } from 'lucide-react';
import { useScoringNotifications } from '../../context/ScoringNotificationContext';

interface NotificationBellButtonProps {
  className?: string;
  showLabel?: boolean;
}

export const NotificationBellButton: React.FC<NotificationBellButtonProps> = ({
  className = '',
  showLabel = false
}) => {
  const {
    unreadCount,
    isNotificationCenterOpen,
    setIsNotificationCenterOpen,
    isSoundEnabled,
    isNotificationsEnabled
  } = useScoringNotifications();

  return (
    <button
      id="btn-scoring-notification-bell"
      onClick={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
      className={`relative p-2 rounded-xl transition-all border flex items-center gap-2 group ${
        !isNotificationsEnabled
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
          : unreadCount > 0
          ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25 shadow-lg shadow-amber-500/10'
          : 'bg-[#18181b] border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
      } ${className}`}
      title={
        !isNotificationsEnabled
          ? 'Scoring Drive Alerts - Pop-ups [OFF] (Click to open settings)'
          : `Scoring Drive Alerts (${unreadCount} unread) - Pop-ups [ON]`
      }
      aria-label="Open Scoring Drive Alerts"
    >
      <div className="relative">
        {!isNotificationsEnabled ? (
          <BellOff className="w-4 h-4 text-rose-400 transition-transform group-hover:scale-110" />
        ) : (
          <Bell className="w-4 h-4 transition-transform group-hover:scale-110" />
        )}
        {isNotificationsEnabled && unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-mono text-[10px] font-black flex items-center justify-center border-2 border-[#09090b] animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {!isNotificationsEnabled && (
          <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border border-black" />
        )}
      </div>

      {showLabel && (
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
          <span>Alerts</span>
          {!isNotificationsEnabled ? (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500/25 text-rose-300 text-[10px] font-black border border-rose-500/30">
              [OFF]
            </span>
          ) : unreadCount > 0 ? (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
              {unreadCount} NEW
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/30">
              [ON]
            </span>
          )}
        </div>
      )}
    </button>
  );
};
