import { useEffect } from 'react';
import { ViewMode } from '../types';

interface GlobalShortcutsConfig {
  onViewChange: (view: ViewMode) => void;
  onToggleGameSwitcher: () => void;
  onToggleShortcutsModal: () => void;
  onToggleUiModal: () => void;
  onRefresh?: () => void;
  onCloseModals: () => void;
}

export function useGlobalShortcuts({
  onViewChange,
  onToggleGameSwitcher,
  onToggleShortcutsModal,
  onToggleUiModal,
  onRefresh,
  onCloseModals
}: GlobalShortcutsConfig) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when the user is focused on an input, textarea, or contentEditable element
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Check if command or ctrl key is held for browser actions
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case '1':
          e.preventDefault();
          onViewChange('plays');
          break;
        case '2':
          e.preventDefault();
          onViewChange('red_zone');
          break;
        case '3':
          e.preventDefault();
          onViewChange('possession');
          break;
        case '4':
          e.preventDefault();
          onViewChange('win_probability');
          break;
        case '5':
          e.preventDefault();
          onViewChange('betting');
          break;
        case '6':
          e.preventDefault();
          onViewChange('scoreboard');
          break;
        case '7':
          e.preventDefault();
          onViewChange('standings');
          break;
        case '8':
          e.preventDefault();
          onViewChange('dashboard');
          break;
        case 'g':
          e.preventDefault();
          onToggleGameSwitcher();
          break;
        case '?':
          e.preventDefault();
          onToggleShortcutsModal();
          break;
        case 'u':
          e.preventDefault();
          onToggleUiModal();
          break;
        case 'r':
          if (onRefresh) {
            e.preventDefault();
            onRefresh();
          }
          break;
        case 'escape':
          e.preventDefault();
          onCloseModals();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onViewChange,
    onToggleGameSwitcher,
    onToggleShortcutsModal,
    onToggleUiModal,
    onRefresh,
    onCloseModals
  ]);
}
