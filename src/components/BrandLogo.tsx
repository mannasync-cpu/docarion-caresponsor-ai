'use client';

import React, { useId } from 'react';

export interface BrandLogoMarkProps {
  className?: string;
  variant?: 'emerald' | 'pro' | 'transparent' | 'mono-white' | 'mono-dark';
  rx?: number;
}

/**
 * BrandLogoMark — Docarion's official "Vital Horizon D" vector emblem.
 */
export function BrandLogoMark({
  className = 'w-9 h-9',
  variant = 'emerald',
  rx = 228,
}: BrandLogoMarkProps) {
  const rawId = useId().replace(/:/g, '');
  const idPrefix = `dc-${rawId}`;

  const isMonoWhite = variant === 'mono-white';
  const isMonoDark = variant === 'mono-dark';
  const isMono = isMonoWhite || isMonoDark;
  const monoColor = isMonoWhite ? '#FFFFFF' : '#062C19';

  const dStroke = isMono ? monoColor : `url(#${idPrefix}-dframe)`;
  const pillFill = isMono ? monoColor : `url(#${idPrefix}-pill)`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      className={`inline-block flex-shrink-0 select-none ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {variant === 'emerald' && (
          <radialGradient id={`${idPrefix}-bg`} cx="50%" cy="42%" r="68%">
            <stop offset="0%" stopColor="#0B2E1D" />
            <stop offset="60%" stopColor="#061E13" />
            <stop offset="100%" stopColor="#03120B" />
          </radialGradient>
        )}
        {variant === 'pro' && (
          <radialGradient id={`${idPrefix}-bg`} cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#132240" />
            <stop offset="60%" stopColor="#0B1426" />
            <stop offset="100%" stopColor="#050A14" />
          </radialGradient>
        )}
        {!isMono && (
          <>
            <linearGradient id={`${idPrefix}-dframe`} x1="300" y1="244" x2="720" y2="780" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF5A5F" />
              <stop offset="50%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            <linearGradient id={`${idPrefix}-pill`} x1="500" y1="336" x2="500" y2="688" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <filter id={`${idPrefix}-ecg-glow`} x="-25%" y="-35%" width="150%" height="170%">
              <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#FFFFFF" floodOpacity="0.65" />
            </filter>
          </>
        )}
      </defs>

      {(variant === 'emerald' || variant === 'pro') && (
        <rect x="0" y="0" width="1024" height="1024" rx={rx} fill={`url(#${idPrefix}-bg)`} />
      )}

      <g transform="translate(-61.44, -61.44) scale(1.12) translate(-4, 0)">
        <path
          d="M 356 264 L 468 264 C 632 264 736 368 736 512 C 736 656 632 760 468 760 L 356 760 C 318 760 296 738 296 700 L 296 324 C 296 286 318 264 356 264 Z"
          fill="none"
          stroke={dStroke}
          strokeWidth="36"
          strokeLinejoin="round"
        />
        <rect
          x="454"
          y="336"
          width="92"
          height="352"
          rx="46"
          fill={pillFill}
          opacity={isMono ? 0.45 : 1}
        />
        <path
          d="M 366 512 L 434 512 L 452 478 L 474 538 L 498 436 L 520 582 L 542 512 L 642 512"
          fill="none"
          stroke={isMono ? monoColor : '#FFFFFF'}
          strokeWidth="22"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={isMono ? undefined : `url(#${idPrefix}-ecg-glow)`}
        />
      </g>
    </svg>
  );
}

export default BrandLogoMark;
