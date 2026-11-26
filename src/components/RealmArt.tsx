import React from 'react';
import type {
  AlchemyVessel,
  ChapterId,
  QuestEnvironment,
  SkillMetaphorIcon,
} from '../content';

export function PixelPortrait({ className = 'w-28 h-28' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      shapeRendering="crispEdges"
      aria-label="Pixel-art portrait of Ratnodeep"
    >
      {/* Warm Parchment Frame Backdrop */}
      <rect width="32" height="32" fill="#F2E8D5" />
      <rect x="0" y="0" width="32" height="2" fill="#D4A44A" opacity="0.35" />
      <rect x="0" y="30" width="32" height="2" fill="#C17A5A" opacity="0.25" />

      {/* Explorer Cloak / Tunic */}
      <rect x="7" y="23" width="18" height="9" fill="#46573B" />
      <rect x="9" y="22" width="14" height="10" fill="#6B7F5E" />
      <rect x="13" y="22" width="6" height="10" fill="#2B2B2B" />
      <rect x="14" y="24" width="4" height="2" fill="#D4A44A" />
      {/* Shoulder Scarf */}
      <rect x="9" y="21" width="14" height="3" fill="#C17A5A" />
      <rect x="11" y="21" width="10" height="2" fill="#D48B6B" />

      {/* Neck & Head */}
      <rect x="14" y="19" width="4" height="3" fill="#C98D63" />
      <rect x="10" y="8" width="12" height="12" fill="#DBA176" />
      <rect x="9" y="12" width="1" height="4" fill="#C98D63" />
      <rect x="22" y="12" width="1" height="4" fill="#C98D63" />

      {/* Hair */}
      <rect x="9" y="5" width="14" height="4" fill="#2B2B2B" />
      <rect x="8" y="7" width="3" height="6" fill="#2B2B2B" />
      <rect x="21" y="7" width="3" height="6" fill="#2B2B2B" />
      <rect x="11" y="4" width="9" height="2" fill="#3B3B3B" />
      <rect x="10" y="8" width="4" height="2" fill="#2B2B2B" />

      {/* Pixel Glasses & Eyes */}
      <rect x="11" y="12" width="4" height="3" fill="#2B2B2B" />
      <rect x="17" y="12" width="4" height="3" fill="#2B2B2B" />
      <rect x="15" y="13" width="2" height="1" fill="#2B2B2B" />
      <rect x="12" y="13" width="2" height="1" fill="#F2E8D5" />
      <rect x="18" y="13" width="2" height="1" fill="#F2E8D5" />
      <rect x="13" y="13" width="1" height="1" fill="#2B2B2B" />
      <rect x="19" y="13" width="1" height="1" fill="#2B2B2B" />

      {/* Friendly Smile */}
      <rect x="14" y="17" width="4" height="1" fill="#8C5338" />
    </svg>
  );
}

export function PixelTravelerSprite({
  facing = 'right',
  walking = false,
  className = 'w-9 h-9',
}: {
  facing?: 'left' | 'right';
  walking?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`${className} ${walking ? 'animate-walk-bob' : ''}`}
      style={{ transform: facing === 'left' ? 'scaleX(-1)' : undefined }}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Ground Shadow */}
      <rect x="4" y="14" width="8" height="2" fill="rgba(24,24,24,0.45)" />
      {/* Boots */}
      <rect x="5" y="12" width="2" height="2" fill="#2B2B2B" />
      <rect x="9" y="12" width="2" height="2" fill="#2B2B2B" />
      {/* Explorer Cloak */}
      <rect x="4" y="8" width="8" height="4" fill="#C17A5A" />
      <rect x="5" y="8" width="6" height="4" fill="#6B7F5E" />
      <rect x="7" y="9" width="2" height="2" fill="#D4A44A" />
      {/* Head & Hair */}
      <rect x="5" y="3" width="6" height="5" fill="#DBA176" />
      <rect x="4" y="2" width="8" height="2" fill="#2B2B2B" />
      <rect x="4" y="3" width="2" height="3" fill="#2B2B2B" />
      {/* Glasses */}
      <rect x="7" y="4" width="4" height="2" fill="#2B2B2B" />
      <rect x="8" y="4" width="1" height="1" fill="#F2E8D5" />
      <rect x="10" y="4" width="1" height="1" fill="#F2E8D5" />
      {/* Tiny Gold Lantern/Staff */}
      <rect x="12" y="6" width="1" height="7" fill="#4E3829" />
      <rect x="11" y="5" width="3" height="2" fill="#D4A44A" />
    </svg>
  );
}

export function PixelMenuIcon({
  id,
  className = 'w-5 h-5',
}: {
  id: ChapterId;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {id === 'arrival' && (
        <>
          <rect x="7" y="1" width="2" height="3" fill="#D4A44A" />
          <rect x="4" y="4" width="8" height="10" fill="#C17A5A" />
          <rect x="6" y="7" width="4" height="7" fill="#2B2B2B" />
          <rect x="3" y="13" width="10" height="2" fill="#6B7F5E" />
        </>
      )}
      {id === 'academy' && (
        <>
          <rect x="6" y="2" width="4" height="4" fill="#2B2B2B" />
          <rect x="7" y="3" width="2" height="2" fill="#F2E8D5" />
          <rect x="4" y="7" width="8" height="6" fill="#6B7F5E" />
          <rect x="3" y="12" width="10" height="2" fill="#2B2B2B" />
        </>
      )}
      {id === 'spellbook' && (
        <>
          <rect x="3" y="2" width="10" height="12" fill="#C17A5A" />
          <rect x="4" y="3" width="8" height="10" fill="#F2E8D5" />
          <rect x="7" y="5" width="2" height="5" fill="#D4A44A" />
          <rect x="5" y="7" width="6" height="1" fill="#D4A44A" />
          <rect x="3" y="2" width="2" height="12" fill="#2B2B2B" />
        </>
      )}
      {id === 'quests' && (
        <>
          <rect x="7" y="1" width="2" height="9" fill="#D4A44A" />
          <rect x="4" y="8" width="8" height="2" fill="#2B2B2B" />
          <rect x="7" y="10" width="2" height="4" fill="#C17A5A" />
          <rect x="6" y="14" width="4" height="1" fill="#D4A44A" />
        </>
      )}
      {id === 'alchemy' && (
        <>
          <rect x="6" y="2" width="4" height="2" fill="#2B2B2B" />
          <rect x="7" y="4" width="2" height="3" fill="#F2E8D5" />
          <rect x="4" y="7" width="8" height="6" fill="#6B7F5E" />
          <rect x="5" y="9" width="6" height="3" fill="#D4A44A" />
          <rect x="3" y="13" width="10" height="1" fill="#2B2B2B" />
        </>
      )}
      {id === 'owlpost' && (
        <>
          <rect x="2" y="4" width="12" height="8" fill="#F2E8D5" />
          <rect x="2" y="4" width="12" height="1" fill="#2B2B2B" />
          <rect x="2" y="11" width="12" height="1" fill="#2B2B2B" />
          <rect x="2" y="4" width="1" height="8" fill="#2B2B2B" />
          <rect x="13" y="4" width="1" height="8" fill="#2B2B2B" />
          <rect x="4" y="6" width="2" height="2" fill="#C17A5A" />
          <rect x="10" y="6" width="2" height="2" fill="#C17A5A" />
          <rect x="6" y="8" width="4" height="2" fill="#D4A44A" />
        </>
      )}
      {id === 'achievement' && (
        <>
          <rect x="4" y="2" width="8" height="6" fill="#D4A44A" />
          <rect x="2" y="3" width="2" height="3" fill="#B8832B" />
          <rect x="12" y="3" width="2" height="3" fill="#B8832B" />
          <rect x="6" y="8" width="4" height="3" fill="#D4A44A" />
          <rect x="4" y="11" width="8" height="3" fill="#2B2B2B" />
        </>
      )}
    </svg>
  );
}

export function SkillArtifactSprite({
  icon,
  collected = false,
  className = 'w-8 h-8',
}: {
  icon: SkillMetaphorIcon;
  collected?: boolean;
  className?: string;
}) {
  const gold = collected ? '#D4A44A' : '#B89042';
  const glow = collected ? '#FFF0B8' : '#E5D7BC';
  const moss = '#6B7F5E';
  const clay = '#C17A5A';
  const ink = '#2B2B2B';

  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {icon === 'runes' && (
        <>
          <rect x="4" y="2" width="8" height="12" fill={ink} />
          <rect x="5" y="3" width="6" height="10" fill="#46573B" />
          <rect x="7" y="4" width="2" height="8" fill={gold} />
          <rect x="6" y="6" width="4" height="2" fill={glow} />
          <rect x="8" y="9" width="2" height="2" fill={gold} />
        </>
      )}

      {icon === 'orb' && (
        <>
          <rect x="5" y="2" width="6" height="2" fill={gold} />
          <rect x="3" y="4" width="10" height="6" fill={moss} />
          <rect x="5" y="5" width="4" height="3" fill={glow} />
          <rect x="5" y="10" width="6" height="2" fill={ink} />
          <rect x="4" y="12" width="8" height="2" fill={clay} />
        </>
      )}

      {icon === 'portal' && (
        <>
          <rect x="3" y="2" width="10" height="12" fill={ink} />
          <rect x="5" y="4" width="6" height="9" fill={gold} />
          <rect x="6" y="5" width="4" height="7" fill={glow} />
          <rect x="7" y="7" width="2" height="3" fill={clay} />
        </>
      )}

      {icon === 'artifact' && (
        <>
          <rect x="6" y="1" width="4" height="2" fill={gold} />
          <rect x="6" y="13" width="4" height="2" fill={gold} />
          <rect x="1" y="6" width="2" height="4" fill={gold} />
          <rect x="13" y="6" width="2" height="4" fill={gold} />
          <rect x="3" y="3" width="10" height="10" fill={clay} />
          <rect x="5" y="5" width="6" height="6" fill={glow} />
          <rect x="7" y="7" width="2" height="2" fill={ink} />
        </>
      )}

      {icon === 'puzzle' && (
        <>
          <rect x="2" y="2" width="5" height="5" fill={moss} />
          <rect x="9" y="2" width="5" height="5" fill={gold} />
          <rect x="2" y="9" width="5" height="5" fill={clay} />
          <rect x="9" y="9" width="5" height="5" fill={ink} />
          <rect x="6" y="6" width="4" height="4" fill={glow} />
        </>
      )}

      {icon === 'scroll' && (
        <>
          <rect x="3" y="2" width="10" height="2" fill={clay} />
          <rect x="4" y="4" width="8" height="8" fill="#F2E8D5" />
          <rect x="4" y="4" width="8" height="8" fill="none" stroke={ink} strokeWidth="1" />
          <rect x="6" y="6" width="4" height="1" fill={moss} />
          <rect x="6" y="8" width="4" height="1" fill={gold} />
          <rect x="3" y="12" width="10" height="2" fill={clay} />
        </>
      )}

      {icon === 'compass' && (
        <>
          <rect x="5" y="2" width="6" height="12" fill={gold} />
          <rect x="2" y="5" width="12" height="6" fill={gold} />
          <rect x="4" y="4" width="8" height="8" fill={ink} />
          <rect x="7" y="4" width="2" height="4" fill={clay} />
          <rect x="7" y="8" width="2" height="4" fill={glow} />
        </>
      )}

      {icon === 'engine' && (
        <>
          <rect x="3" y="4" width="10" height="8" fill={ink} />
          <rect x="5" y="6" width="3" height="4" fill={gold} />
          <rect x="9" y="6" width="3" height="4" fill={moss} />
          <rect x="6" y="2" width="4" height="2" fill={clay} />
          <rect x="6" y="12" width="4" height="2" fill={clay} />
        </>
      )}
    </svg>
  );
}

export function QuestEnvironmentArt({ variant }: { variant: QuestEnvironment }) {
  return (
    <div className="w-full overflow-hidden rounded-lg border-2 border-[#2B2B2B] bg-[#DFD2B8]">
      <svg
        viewBox="0 0 240 84"
        className="w-full h-[96px] sm:h-[110px] block"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        {variant === 'forest-quest' && (
          <>
            <rect width="240" height="84" fill="#D9CBAF" />
            <rect x="0" y="52" width="240" height="32" fill="#6B7F5E" />
            <rect x="0" y="68" width="240" height="16" fill="#46573B" />
            <rect x="192" y="10" width="16" height="16" fill="#D4A44A" />
            {/* Forest Trees */}
            <rect x="22" y="38" width="4" height="18" fill="#4E3829" />
            <rect x="14" y="26" width="20" height="12" fill="#46573B" />
            <rect x="18" y="18" width="12" height="8" fill="#5D7250" />
            <rect x="168" y="40" width="4" height="16" fill="#4E3829" />
            <rect x="160" y="30" width="20" height="10" fill="#46573B" />
            {/* Enchanted Gatehouse */}
            <rect x="92" y="24" width="48" height="34" fill="#F2E8D5" />
            <rect x="92" y="24" width="48" height="34" fill="none" stroke="#2B2B2B" strokeWidth="2" />
            <rect x="88" y="18" width="56" height="6" fill="#C17A5A" />
            <rect x="108" y="38" width="16" height="20" fill="#2B2B2B" />
            <rect x="111" y="41" width="10" height="17" fill="#D4A44A" />
            <rect x="74" y="42" width="3" height="14" fill="#4E3829" />
            <rect x="72" y="38" width="7" height="4" fill="#D4A44A" className="animate-lantern" />
          </>
        )}

        {variant === 'castle-workshop' && (
          <>
            <rect width="240" height="84" fill="#E8D2B5" />
            <rect x="0" y="56" width="240" height="28" fill="#C17A5A" />
            <rect x="0" y="70" width="240" height="14" fill="#A25D40" />
            {/* Castle Battlements */}
            <rect x="54" y="20" width="132" height="40" fill="#E5D7BC" />
            <rect x="54" y="20" width="132" height="40" fill="none" stroke="#2B2B2B" strokeWidth="2" />
            <rect x="50" y="14" width="14" height="6" fill="#2B2B2B" />
            <rect x="76" y="14" width="14" height="6" fill="#2B2B2B" />
            <rect x="150" y="14" width="14" height="6" fill="#2B2B2B" />
            <rect x="176" y="14" width="14" height="6" fill="#2B2B2B" />
            {/* Forge Arch & Gear Window */}
            <rect x="108" y="36" width="24" height="24" fill="#2B2B2B" />
            <rect x="112" y="40" width="16" height="20" fill="#D4A44A" />
            <rect x="70" y="32" width="14" height="12" fill="#6B7F5E" />
            <rect x="156" y="32" width="14" height="12" fill="#6B7F5E" />
            <rect x="18" y="34" width="8" height="22" fill="#4E3829" />
            <rect x="16" y="30" width="12" height="4" fill="#D4A44A" />
          </>
        )}

        {variant === 'mountain-observatory' && (
          <>
            <rect width="240" height="84" fill="#2B2B2B" />
            <rect x="26" y="14" width="3" height="3" fill="#F2E8D5" />
            <rect x="64" y="24" width="2" height="2" fill="#D4A44A" />
            <rect x="166" y="16" width="3" height="3" fill="#F2E8D5" />
            <rect x="206" y="24" width="3" height="3" fill="#D4A44A" />
            {/* Crescent Moon */}
            <rect x="38" y="18" width="12" height="12" fill="#F4D98C" />
            <rect x="42" y="20" width="8" height="8" fill="#2B2B2B" />
            {/* Mountain Summit */}
            <polygon points="0,84 56,42 120,28 184,46 240,84" fill="#56694A" />
            <polygon points="38,84 120,44 202,84" fill="#6B7F5E" />
            {/* Observatory Dome */}
            <rect x="100" y="30" width="40" height="26" fill="#F2E8D5" />
            <rect x="104" y="20" width="32" height="10" fill="#C17A5A" />
            <rect x="114" y="14" width="12" height="6" fill="#D4A44A" />
            <rect x="114" y="38" width="12" height="18" fill="#2B2B2B" />
            <rect x="117" y="42" width="6" height="8" fill="#D4A44A" />
          </>
        )}
      </svg>
    </div>
  );
}

export function AlchemyVesselSprite({
  vessel,
  active,
  className = 'w-10 h-10',
}: {
  vessel: AlchemyVessel;
  active: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {vessel === 'potion' && (
        <>
          <rect x="6" y="2" width="4" height="2" fill="#2B2B2B" />
          <rect x="7" y="4" width="2" height="2" fill="#F2E8D5" />
          <rect x="4" y="6" width="8" height="8" fill="#6B7F5E" />
          <rect x="5" y="9" width="6" height="4" fill={active ? '#D4A44A' : '#C17A5A'} />
          {active && (
            <rect
              x="7"
              y="7"
              width="2"
              height="2"
              fill="#FFF3C4"
              className="animate-bubble"
            />
          )}
        </>
      )}

      {vessel === 'machine' && (
        <>
          <rect x="3" y="3" width="10" height="10" fill="#2B2B2B" />
          <rect x="4" y="4" width="8" height="8" fill="#C17A5A" />
          <rect x="5" y="5" width="6" height="4" fill={active ? '#FFF0B8' : '#F2E8D5'} />
          <rect x="5" y="10" width="2" height="1" fill="#D4A44A" />
          <rect x="9" y="10" width="2" height="1" fill="#6B7F5E" />
        </>
      )}

      {vessel === 'crystal' && (
        <>
          <rect x="7" y="1" width="2" height="3" fill="#D4A44A" />
          <rect x="5" y="4" width="6" height="7" fill={active ? '#F6DF96' : '#6B7F5E'} />
          <rect x="6" y="5" width="2" height="4" fill="#FFF8E2" />
          <rect x="4" y="11" width="8" height="3" fill="#2B2B2B" />
        </>
      )}

      {vessel === 'scroll' && (
        <>
          <rect x="2" y="2" width="12" height="2" fill="#C17A5A" />
          <rect x="3" y="4" width="10" height="8" fill="#F2E8D5" />
          <rect x="5" y="6" width="6" height="1" fill="#2B2B2B" />
          <rect x="5" y="8" width="6" height="1" fill={active ? '#D4A44A' : '#6B7F5E'} />
          <rect x="2" y="12" width="12" height="2" fill="#C17A5A" />
        </>
      )}
    </svg>
  );
}

export function PixelMessengerOwl({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Parchment Envelope */}
      <rect x="3" y="12" width="18" height="10" fill="#F2E8D5" />
      <rect x="3" y="12" width="18" height="1" fill="#2B2B2B" />
      <rect x="3" y="21" width="18" height="1" fill="#2B2B2B" />
      <rect x="3" y="12" width="1" height="10" fill="#2B2B2B" />
      <rect x="20" y="12" width="1" height="10" fill="#2B2B2B" />
      <rect x="5" y="14" width="3" height="2" fill="#C17A5A" />
      <rect x="16" y="14" width="3" height="2" fill="#C17A5A" />
      {/* Gold Wax Seal */}
      <rect x="10" y="15" width="4" height="4" fill="#C17A5A" />
      <rect x="11" y="16" width="2" height="2" fill="#D4A44A" />

      {/* Little Pixel Owl Perched Above */}
      <rect x="8" y="3" width="8" height="8" fill="#6B7F5E" />
      <rect x="7" y="2" width="2" height="2" fill="#2B2B2B" />
      <rect x="15" y="2" width="2" height="2" fill="#2B2B2B" />
      <rect x="9" y="5" width="2" height="2" fill="#F2E8D5" />
      <rect x="13" y="5" width="2" height="2" fill="#F2E8D5" />
      <rect x="10" y="5" width="1" height="1" fill="#2B2B2B" />
      <rect x="14" y="5" width="1" height="1" fill="#2B2B2B" />
      <rect x="11" y="7" width="2" height="2" fill="#D4A44A" />
      <rect x="9" y="11" width="2" height="1" fill="#D4A44A" />
      <rect x="13" y="11" width="2" height="1" fill="#D4A44A" />
    </svg>
  );
}

