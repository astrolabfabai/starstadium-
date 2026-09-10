import React, { useState, useEffect } from 'react';
import { getTeamLogoUrl, getTeamColor, normalizeTeamKey } from '../utils/teamUtils';

export type TeamLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

interface TeamLogoProps {
  teamKey?: string;
  teamName?: string;
  logoUrl?: string;
  size?: TeamLogoSize;
  className?: string;
  alt?: string;
  showBackground?: boolean;
  shape?: 'circle' | 'rounded' | 'square';
}

const SIZE_MAP: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', { box: string; img: string; text: string }> = {
  xs: { box: 'w-4 h-4', img: 'w-3.5 h-3.5', text: 'text-[9px]' },
  sm: { box: 'w-5 h-5', img: 'w-4.5 h-4.5', text: 'text-[10px]' },
  md: { box: 'w-7 h-7', img: 'w-6 h-6', text: 'text-xs' },
  lg: { box: 'w-9 h-9', img: 'w-8 h-8', text: 'text-sm' },
  xl: { box: 'w-12 h-12', img: 'w-10 h-10', text: 'text-base' }
};

export const TeamLogo: React.FC<TeamLogoProps> = ({
  teamKey,
  teamName,
  logoUrl: customLogoUrl,
  size = 'md',
  className = '',
  alt,
  showBackground = true,
  shape = 'circle'
}) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const normalizedKey = normalizeTeamKey(teamKey || teamName);
  const resolvedUrl = getTeamLogoUrl(teamKey || teamName, customLogoUrl);
  const teamColor = getTeamColor(teamKey || teamName);

  // Reset error state if key or logoUrl changes
  useEffect(() => {
    setHasError(false);
  }, [teamKey, teamName, customLogoUrl, resolvedUrl]);

  const sizeConfig = typeof size === 'string' ? SIZE_MAP[size] : null;
  const customDimensions = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : undefined;

  const shapeClasses =
    shape === 'circle' ? 'rounded-full' : shape === 'rounded' ? 'rounded-lg' : 'rounded-none';

  const altText = alt || `${teamName || normalizedKey} logo`;

  return (
    <div
      style={customDimensions}
      className={`relative inline-flex items-center justify-center shrink-0 select-none overflow-hidden transition-all ${
        sizeConfig ? sizeConfig.box : ''
      } ${shapeClasses} ${
        showBackground ? 'bg-[#18181f]/90 border border-white/10 shadow-xs' : ''
      } ${className}`}
      title={`${teamName || normalizedKey}`}
    >
      {!hasError ? (
        <img
          src={resolvedUrl}
          alt={altText}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
          className={`object-contain pointer-events-none p-0.5 filter drop-shadow-xs transition-opacity duration-200 ${
            sizeConfig ? sizeConfig.img : 'w-full h-full'
          }`}
        />
      ) : (
        // High-contrast fallback monogram badge with team primary color
        <div
          className={`w-full h-full flex items-center justify-center font-mono font-black text-white ${shapeClasses}`}
          style={{ backgroundColor: teamColor }}
        >
          <span className={sizeConfig ? sizeConfig.text : 'text-xs'}>
            {normalizedKey.slice(0, 3)}
          </span>
        </div>
      )}
    </div>
  );
};
