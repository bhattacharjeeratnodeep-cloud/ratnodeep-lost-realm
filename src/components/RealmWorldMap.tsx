import React from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, MapPin } from 'lucide-react';
import { CONTENT, ChapterId, RealmLandmark } from '../content';
import { PixelMenuIcon, PixelTravelerSprite } from './RealmArt';

interface RealmWorldMapProps {
  playerPos: { x: number; y: number };
  facing: 'left' | 'right';
  isWalking: boolean;
  activeChapter: ChapterId;
  discoveredChapters: Set<ChapterId>;
  nearbyLandmark: RealmLandmark | null;
  onMove: (dx: number, dy: number) => void;
  onSelectLandmark: (landmark: RealmLandmark) => void;
}

export function RealmWorldMap({
  playerPos,
  facing,
  isWalking,
  activeChapter,
  discoveredChapters,
  nearbyLandmark,
  onMove,
  onSelectLandmark,
}: RealmWorldMapProps) {
  return (
    <div className="pixel-panel-dark p-3 sm:p-4 space-y-3">
      {/* Map Header */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-pixel text-[10px] sm:text-[11px] text-[#D4A44A] tracking-wide truncate">
          THE LOST REALM · MAP
        </span>
        <span className="text-xs text-[#E6DEC8] tabular-nums shrink-0">
          {discoveredChapters.size}/{CONTENT.landmarks.length} regions
        </span>
      </div>

      {/* Interactive Pixel World Stage */}
      <div
        className="relative w-full h-[270px] sm:h-[310px] rounded-lg border-2 border-[#181818] overflow-hidden bg-pixel-masonry select-none"
        role="region"
        aria-label="Interactive pixel world map"
      >
        {/* Horizon Sky & Pixel Scenery Layer */}
        <svg
          viewBox="0 0 320 200"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
          shapeRendering="crispEdges"
          aria-hidden="true"
        >
          {/* Warm Sky Strip */}
          <rect x="0" y="0" width="320" height="44" fill="#E3BC78" />
          <rect x="256" y="10" width="18" height="18" fill="#F6DF96" />
          <rect x="260" y="14" width="10" height="10" fill="#D4A44A" />
          <g className="animate-cloud-glide">
            <rect x="34" y="14" width="28" height="6" fill="#FBF5E9" />
            <rect x="42" y="10" width="12" height="4" fill="#FBF5E9" />
          </g>

          {/* Mountain Range Horizon */}
          <polygon
            points="0,54 34,26 68,46 112,20 156,48 206,24 250,46 290,22 320,44 320,58 0,58"
            fill="#C17A5A"
          />
          <polygon points="112,20 102,29 122,29" fill="#F2E8D5" />
          <polygon points="290,22 281,31 299,31" fill="#F2E8D5" />

          {/* Winding Cobble Paths Connecting Landmarks */}
          <path
            d="M 58 148 Q 88 104 108 68 Q 160 54 212 56 Q 186 94 160 108 Q 214 114 256 112 Q 248 148 236 156"
            fill="none"
            stroke="#D9C8A9"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 58 148 Q 72 122 78 104 Q 116 108 160 108"
            fill="none"
            stroke="#D9C8A9"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 58 148 Q 150 162 236 156"
            fill="none"
            stroke="#C9B694"
            strokeWidth="8"
            strokeDasharray="6 6"
          />

          {/* Pixel Pine Tree Clusters */}
          <g>
            <rect x="14" y="54" width="12" height="10" fill="#46573B" />
            <rect x="18" y="64" width="4" height="6" fill="#4E3829" />
            <rect x="292" y="56" width="14" height="10" fill="#46573B" />
            <rect x="297" y="66" width="4" height="6" fill="#4E3829" />
            <rect x="130" y="156" width="14" height="10" fill="#46573B" />
            <rect x="135" y="166" width="4" height="6" fill="#4E3829" />
            <rect x="284" y="148" width="12" height="10" fill="#46573B" />
            <rect x="288" y="158" width="4" height="6" fill="#4E3829" />
          </g>

          {/* Subtle Decorative Lanterns */}
          <rect x="94" y="128" width="4" height="4" fill="#D4A44A" className="animate-lantern" />
          <rect x="194" y="84" width="4" height="4" fill="#D4A44A" className="animate-lantern" />
        </svg>

        {/* Interactive Landmark Buildings / Nodes */}
        {CONTENT.landmarks.map((landmark) => {
          const isCurrent = activeChapter === landmark.id;
          const isVisited = discoveredChapters.has(landmark.id);
          return (
            <button
              key={landmark.id}
              type="button"
              onClick={() => onSelectLandmark(landmark)}
              style={{
                left: `${landmark.x}%`,
                top: `${landmark.y}%`,
              }}
              aria-label={`Visit ${landmark.title}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D4A44A] rounded p-0.5 transition-transform ${
                isCurrent ? 'scale-110 z-20' : 'hover:scale-105 z-10'
              }`}
            >
              <span
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg border-2 flex items-center justify-center shadow-[0_3px_0_#181818] transition-colors ${
                  isCurrent
                    ? 'bg-[#D4A44A] border-[#181818]'
                    : isVisited
                    ? 'bg-[#F2E8D5] border-[#D4A44A]'
                    : 'bg-[#F2E8D5] border-[#2B2B2B]'
                }`}
              >
                <PixelMenuIcon id={landmark.id} className="w-6 h-6" />
              </span>
              <span
                className={`mt-1 px-1.5 py-0.5 rounded text-[9px] font-pixel leading-none whitespace-nowrap border ${
                  isCurrent
                    ? 'bg-[#D4A44A] text-[#2B2B2B] border-[#181818]'
                    : 'bg-[#2B2B2B]/90 text-[#F2E8D5] border-[#4A4A4A]'
                }`}
              >
                {landmark.shortLabel}
              </span>
            </button>
          );
        })}

        {/* Playable Pixel Traveler Character */}
        <div
          style={{
            left: `${playerPos.x}%`,
            top: `${playerPos.y}%`,
            transition: 'left 130ms linear, top 130ms linear',
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
        >
          <PixelTravelerSprite facing={facing} walking={isWalking} className="w-10 h-10" />
        </div>
      </div>

      {/* Controls Row: Mobile Touch D-Pad + Nearby Landmark Prompt */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        {/* Touch D-Pad (comfortable 44-48px tap targets + keyboard hint) */}
        <div className="flex items-center gap-3">
          <div className="grid grid-cols-3 gap-1 w-[138px]" aria-label="Movement controls">
            <div />
            <button
              type="button"
              onClick={() => onMove(0, -8)}
              aria-label="Move up"
              className="pixel-btn bg-[#6B7F5E] hover:bg-[#7A906C] text-[#F2E8D5] h-11 flex items-center justify-center cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <div />
            <button
              type="button"
              onClick={() => onMove(-8, 0)}
              aria-label="Move left"
              className="pixel-btn bg-[#6B7F5E] hover:bg-[#7A906C] text-[#F2E8D5] h-11 flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onMove(0, 8)}
              aria-label="Move down"
              className="pixel-btn bg-[#6B7F5E] hover:bg-[#7A906C] text-[#F2E8D5] h-11 flex items-center justify-center cursor-pointer"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onMove(8, 0)}
              aria-label="Move right"
              className="pixel-btn bg-[#6B7F5E] hover:bg-[#7A906C] text-[#F2E8D5] h-11 flex items-center justify-center cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#D7CEBB] leading-snug max-w-[140px]">
            Use D-Pad, Arrow Keys, or tap any landmark.
          </p>
        </div>

        {/* Nearby Landmark Action Button */}
        {nearbyLandmark ? (
          <button
            type="button"
            onClick={() => onSelectLandmark(nearbyLandmark)}
            className="pixel-btn w-full sm:w-auto bg-[#D4A44A] hover:bg-[#E0B35B] text-[#2B2B2B] px-4 min-h-[48px] flex items-center justify-center gap-2 font-pixel text-[10px] cursor-pointer shrink-0"
          >
            <MapPin className="w-4 h-4 shrink-0" />
            <span>ENTER {nearbyLandmark.shortLabel}</span>
          </button>
        ) : (
          <div className="text-xs text-[#B6AD9B] text-center sm:text-right">
            Walk near a landmark or tap to enter
          </div>
        )}
      </div>
    </div>
  );
}
