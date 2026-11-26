import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  FlaskConical,
  Github,
  Hammer,
  HelpCircle,
  Mail,
  Map as MapIcon,
  Music,
  RotateCcw,
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { BgmTheme, realmAudio, SfxKind } from './audio/realmAudio';
import { QuickPortfolioView } from './components/QuickPortfolioView';
import {
  AlchemyVesselSprite,
  PixelMenuIcon,
  PixelMessengerOwl,
  PixelPortrait,
  QuestEnvironmentArt,
  SkillArtifactSprite,
} from './components/RealmArt';
import { RealmWorldMap } from './components/RealmWorldMap';
import { ChapterId, CONTENT, RealmLandmark } from './content';

type AppMode = 'story' | 'quick';

interface MenuItem {
  id: ChapterId;
  label: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'academy', label: 'BIO' },
  { id: 'spellbook', label: 'SKILLS' },
  { id: 'quests', label: 'PROJECTS' },
  { id: 'arrival', label: 'STORY' },
  { id: 'owlpost', label: 'CONTACT' },
  ...(CONTENT.alchemy.enabled ? [{ id: 'alchemy' as ChapterId, label: 'LAB' }] : []),
  { id: 'achievement', label: 'CARD' },
];

function computePlayerTitle(
  skillsCount: number,
  questsCount: number,
  regionsCount: number
): string {
  const totalSkills = CONTENT.spellbook.skills.length;
  const totalQuests = CONTENT.quests.items.length;

  if (skillsCount === totalSkills && questsCount === totalQuests) {
    return CONTENT.achievement.titles.master;
  }
  const score = skillsCount + questsCount * 2 + Math.min(regionsCount, 5);
  if (score >= 10) return CONTENT.achievement.titles.discoverer;
  if (score >= 4) return CONTENT.achievement.titles.apprentice;
  return CONTENT.achievement.titles.novice;
}

const AUDIO_STORAGE_KEY = 'lost_realm_audio_v1';

interface AudioPrefs {
  musicPreferred: boolean;
  sfxEnabled: boolean;
  volume: number;
  explicitlyMuted: boolean;
}

function loadSessionAudioPrefs(): AudioPrefs {
  try {
    const raw = window.sessionStorage.getItem(AUDIO_STORAGE_KEY);
    if (!raw) {
      return {
        musicPreferred: false,
        sfxEnabled: true,
        volume: 0.5,
        explicitlyMuted: false,
      };
    }
    const parsed = JSON.parse(raw) as Partial<AudioPrefs>;
    return {
      musicPreferred: Boolean(parsed.musicPreferred),
      sfxEnabled: parsed.sfxEnabled !== undefined ? Boolean(parsed.sfxEnabled) : true,
      volume:
        typeof parsed.volume === 'number' && parsed.volume >= 0 && parsed.volume <= 1
          ? parsed.volume
          : 0.5,
      explicitlyMuted: Boolean(parsed.explicitlyMuted),
    };
  } catch {
    return {
      musicPreferred: false,
      sfxEnabled: true,
      volume: 0.5,
      explicitlyMuted: false,
    };
  }
}

function getThemeForState(mode: AppMode, chapter: ChapterId): BgmTheme {
  if (mode === 'quick') return 'quests';
  if (chapter === 'arrival') return 'overworld';
  if (chapter === 'quests') return 'quests';
  if (chapter === 'achievement') return 'achievement';
  return 'story';
}

export default function App() {
  const [mode, setMode] = useState<AppMode>('story');
  const [activeChapter, setActiveChapter] = useState<ChapterId>('arrival');
  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const [introSkipped, setIntroSkipped] = useState<boolean>(false);

  // Real gameplay state tracked cleanly in Sets
  const [discoveredChapters, setDiscoveredChapters] = useState<Set<ChapterId>>(
    () => new Set(['arrival'])
  );
  const [collectedSkills, setCollectedSkills] = useState<Set<string>>(() => new Set());
  const [exploredQuests, setExploredQuests] = useState<Set<string>>(() => new Set());
  const [activeExperiments, setActiveExperiments] = useState<Set<string>>(
    () => new Set()
  );

  // Playable traveler state on the overworld map
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({
    x: 18,
    y: 74,
  });
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [isWalking, setIsWalking] = useState(false);

  const [dialogueText, setDialogueText] = useState<string>(
    CONTENT.meta.greetingSpeech
  );
  const [toast, setToast] = useState<string | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const [shareLabelOverride, setShareLabelOverride] = useState<string | null>(null);

  // Audio controls (never autoplays before explicit user interaction)
  const initialAudio = useMemo(() => loadSessionAudioPrefs(), []);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(false);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(initialAudio.sfxEnabled);
  const [volume, setVolume] = useState<number>(initialAudio.volume);
  const [explicitlyMuted, setExplicitlyMuted] = useState<boolean>(
    initialAudio.explicitlyMuted
  );
  const [musicPreferredInSession, setMusicPreferredInSession] = useState<boolean>(
    initialAudio.musicPreferred
  );
  const [showAudioPanel, setShowAudioPanel] = useState<boolean>(false);

  const chapterPanelRef = useRef<HTMLDivElement | null>(null);
  const walkTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const totalSkills = CONTENT.spellbook.skills.length;
  const totalQuests = CONTENT.quests.items.length;

  const playerTitle = computePlayerTitle(
    collectedSkills.size,
    exploredQuests.size,
    discoveredChapters.size
  );

  const showFeedbackToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 2300);
  }, []);

  // Determine if the traveler stands near any realm landmark
  const nearbyLandmark = useMemo<RealmLandmark | null>(() => {
    let closest: RealmLandmark | null = null;
    let minDist = Infinity;
    for (const lm of CONTENT.landmarks) {
      if (lm.id === 'alchemy' && !CONTENT.alchemy.enabled) continue;
      const dist = Math.hypot(lm.x - playerPos.x, lm.y - playerPos.y);
      if (dist <= 13 && dist < minDist) {
        minDist = dist;
        closest = lm;
      }
    }
    return closest;
  }, [playerPos]);

  // Sync audio preferences with Web Audio engine & sessionStorage
  useEffect(() => {
    realmAudio.configure({ musicEnabled, sfxEnabled, volume });
    try {
      window.sessionStorage.setItem(
        AUDIO_STORAGE_KEY,
        JSON.stringify({
          musicPreferred: musicPreferredInSession,
          sfxEnabled,
          volume,
          explicitlyMuted,
        })
      );
    } catch {
      // Ignore storage errors in restricted environments
    }
  }, [musicEnabled, sfxEnabled, volume, musicPreferredInSession, explicitlyMuted]);

  // Smoothly transition BGM when active environment or music toggle changes
  useEffect(() => {
    if (!musicEnabled) return;
    const theme = getThemeForState(mode, activeChapter);
    realmAudio.playTheme(theme);
  }, [musicEnabled, mode, activeChapter]);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      realmAudio.stopMusic(true);
    };
  }, []);

  const playSfx = useCallback((kind: SfxKind) => {
    realmAudio.playSfx(kind);
  }, []);

  const activateSessionMusicIfAllowed = useCallback(
    (targetTheme?: BgmTheme) => {
      if (explicitlyMuted) return;
      if (!musicEnabled) {
        setMusicEnabled(true);
        setMusicPreferredInSession(true);
        realmAudio.configure({ musicEnabled: true, sfxEnabled, volume });
        realmAudio.unlockAndStartMusic(
          targetTheme ?? getThemeForState(mode, activeChapter)
        );
      }
    },
    [explicitlyMuted, musicEnabled, sfxEnabled, volume, mode, activeChapter]
  );

  const navigateToChapter = useCallback(
    (chapterId: ChapterId, shouldScroll = true) => {
      // Resume session-preferred music on first interaction if visitor enabled it earlier
      if (musicPreferredInSession && !explicitlyMuted && !musicEnabled) {
        setMusicEnabled(true);
        realmAudio.configure({ musicEnabled: true, sfxEnabled, volume });
        realmAudio.unlockAndStartMusic(getThemeForState('story', chapterId));
      }

      if (chapterId === 'quests') {
        playSfx('openProject');
      } else if (chapterId === 'achievement') {
        playSfx('playerCard');
      } else {
        playSfx('selectLocation');
      }

      setMode('story');
      setActiveChapter(chapterId);
      setDiscoveredChapters((prev) => {
        if (prev.has(chapterId)) return prev;
        const next = new Set(prev);
        next.add(chapterId);
        return next;
      });

      const landmark = CONTENT.landmarks.find((l) => l.id === chapterId);
      if (landmark) {
        setPlayerPos((prev) => {
          setFacing(landmark.x < prev.x ? 'left' : 'right');
          return { x: landmark.x, y: landmark.y };
        });
        setDialogueText(landmark.prompt);
      }

      if (shouldScroll) {
        window.requestAnimationFrame(() => {
          chapterPanelRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        });
      }
    },
    [
      musicPreferredInSession,
      explicitlyMuted,
      musicEnabled,
      sfxEnabled,
      volume,
      playSfx,
    ]
  );

  const moveTraveler = useCallback(
    (dx: number, dy: number) => {
      playSfx('step');
      setPlayerPos((prev) => {
        const nextX = Math.max(8, Math.min(92, prev.x + dx));
        const nextY = Math.max(22, Math.min(86, prev.y + dy));
        if (dx < 0) setFacing('left');
        if (dx > 0) setFacing('right');
        return { x: nextX, y: nextY };
      });
      setIsWalking(true);
      if (walkTimerRef.current) window.clearTimeout(walkTimerRef.current);
      walkTimerRef.current = window.setTimeout(() => setIsWalking(false), 260);
    },
    [playSfx]
  );

  // Keyboard exploration support in Story Mode
  useEffect(() => {
    if (mode !== 'story') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'Escape' && showTutorial) {
        setShowTutorial(false);
        return;
      }

      if (showTutorial) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        moveTraveler(0, -7);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        moveTraveler(0, 7);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        moveTraveler(-7, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        moveTraveler(7, 0);
      } else if ((e.key === 'e' || e.key === 'E') && nearbyLandmark) {
        e.preventDefault();
        navigateToChapter(nearbyLandmark.id, true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, showTutorial, moveTraveler, nearbyLandmark, navigateToChapter]);

  useEffect(() => {
    return () => {
      if (walkTimerRef.current) window.clearTimeout(walkTimerRef.current);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleCollectSkill = (skillId: string, skillName: string) => {
    if (collectedSkills.has(skillId)) return;
    playSfx('collectSkill');
    const next = new Set(collectedSkills);
    next.add(skillId);
    setCollectedSkills(next);
    setDialogueText(`Collected ${skillName}! (${next.size}/${totalSkills})`);
    showFeedbackToast(`+ ${skillName} (${next.size}/${totalSkills})`);
  };

  const handleExploreQuest = (questId: string, questTitle: string) => {
    if (exploredQuests.has(questId)) return;
    playSfx('completeQuest');
    const next = new Set(exploredQuests);
    next.add(questId);
    setExploredQuests(next);
    setDialogueText(`Quest logged: ${questTitle}!`);
    showFeedbackToast(`Quest Explored (${next.size}/${totalQuests})`);
  };

  const handleToggleExperiment = (expId: string, expTitle: string) => {
    setActiveExperiments((prev) => {
      const next = new Set(prev);
      if (next.has(expId)) {
        next.delete(expId);
        playSfx('menuClose');
      } else {
        next.add(expId);
        playSfx('unlockSecret');
        showFeedbackToast(`Activated: ${expTitle}`);
      }
      return next;
    });
  };

  const handleCopyEmail = async () => {
    playSfx('click');
    try {
      await navigator.clipboard.writeText(CONTENT.owlPost.email);
      setEmailCopied(true);
      showFeedbackToast('Email copied to clipboard');
      window.setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${CONTENT.owlPost.email}`;
    }
  };

  const handleShareCard = async () => {
    playSfx('click');
    const url = window.location.href;
    const title = `${CONTENT.meta.playerName}: ${CONTENT.meta.realmName}`;
    const text = `I earned the rank "${playerTitle}" (${collectedSkills.size}/${totalSkills} skills, ${exploredQuests.size}/${totalQuests} quests) in ${CONTENT.meta.playerName}'s interactive portfolio!`;

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareLabelOverride('Link Copied!');
      showFeedbackToast('Portfolio URL copied!');
      window.setTimeout(() => setShareLabelOverride(null), 2200);
    } catch {
      showFeedbackToast('Copy URL from your browser');
    }
  };

  const handleReplay = () => {
    playSfx('click');
    setCollectedSkills(new Set());
    setExploredQuests(new Set());
    setActiveExperiments(new Set());
    setDiscoveredChapters(new Set(['arrival']));
    setActiveChapter('arrival');
    setPlayerPos({ x: 18, y: 74 });
    setFacing('right');
    setDialogueText(CONTENT.meta.greetingSpeech);
    setShareLabelOverride(null);
    setToast(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenContact = () => {
    playSfx('selectLocation');
    setShowAudioPanel(false);
    if (mode === 'quick') {
      const el = document.getElementById('qp-contact');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setShowTutorial(false);
      navigateToChapter('owlpost', true);
    }
  };

  const toggleMusic = () => {
    const next = !musicEnabled;
    if (next) {
      setExplicitlyMuted(false);
      setMusicPreferredInSession(true);
      setMusicEnabled(true);
      realmAudio.configure({ musicEnabled: true, sfxEnabled, volume });
      realmAudio.unlockAndStartMusic(getThemeForState(mode, activeChapter));
      playSfx('click');
    } else {
      setExplicitlyMuted(true);
      setMusicPreferredInSession(false);
      setMusicEnabled(false);
      realmAudio.stopMusic(true);
      playSfx('menuClose');
    }
  };

  const toggleSfx = () => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    realmAudio.configure({ musicEnabled, sfxEnabled: next, volume });
    if (next) {
      realmAudio.playSfx('click');
    }
  };

  const muteAllAudio = () => {
    setMusicEnabled(false);
    setSfxEnabled(false);
    setExplicitlyMuted(true);
    setMusicPreferredInSession(false);
    realmAudio.configure({ musicEnabled: false, sfxEnabled: false, volume });
    realmAudio.stopMusic(true);
    showFeedbackToast('Audio muted');
  };

  return (
    <div className="min-h-screen flex flex-col bg-realm-bricks text-[#2B2B2B]">
      {/* =====================================================================
          PERSISTENT GAME HUD HEADER (Compact for 360px+ mobile)
         ===================================================================== */}
      <header className="sticky top-0 z-40 w-full bg-[#2B2B2B] text-[#F2E8D5] border-b-4 border-[#161616]">
        <div className="max-w-5xl mx-auto px-2.5 sm:px-5 h-14 flex items-center justify-between gap-2">
          {/* Left: Brand & Mode Switch */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => {
                setMode('story');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="font-pixel text-[10px] sm:text-xs text-[#F2E8D5] hover:text-[#D4A44A] transition-colors whitespace-nowrap shrink-0 min-h-[44px] flex items-center cursor-pointer"
            >
              {CONTENT.meta.playerName}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode((prev) => (prev === 'story' ? 'quick' : 'story'));
                setShowTutorial(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-2 py-1 rounded border-2 border-[#D4A44A] bg-[#3A3A3A] hover:bg-[#4A4A4A] text-[#D4A44A] font-pixel text-[8px] sm:text-[9px] whitespace-nowrap shrink-0 min-h-[34px] cursor-pointer"
              title="Switch between Story Mode and Quick Portfolio"
            >
              {mode === 'story' ? 'QUICK VIEW' : 'STORY MODE'}
            </button>
          </div>

          {/* Right: Progress + Audio + Help + Always-Accessible Contact */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-[#3A3A3A] border border-[#555555] text-[#D4A44A] font-pixel text-[9px] sm:text-[10px] tabular-nums whitespace-nowrap"
              aria-label={`Progress: ${collectedSkills.size} of ${totalSkills} skills`}
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>
                {collectedSkills.size}/{totalSkills}
              </span>
            </div>

            {/* Permanent Audio Controls Trigger in HUD */}
            <button
              type="button"
              onClick={() => {
                const nextOpen = !showAudioPanel;
                setShowAudioPanel(nextOpen);
                playSfx(nextOpen ? 'menuOpen' : 'menuClose');
              }}
              aria-expanded={showAudioPanel}
              aria-label="Audio settings"
              className={`h-10 px-2 sm:px-2.5 rounded-lg border-2 flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
                musicEnabled
                  ? 'border-[#D4A44A] bg-[#3A3A3A] text-[#D4A44A]'
                  : 'border-[#555555] bg-[#3A3A3A] hover:border-[#D4A44A] text-[#F2E8D5]'
              }`}
            >
              {musicEnabled || sfxEnabled ? (
                <Volume2 className="w-4 h-4 shrink-0" />
              ) : (
                <VolumeX className="w-4 h-4 shrink-0" />
              )}
              <span className="hidden md:inline font-pixel text-[8px]">
                {musicEnabled ? 'AUDIO ON' : 'AUDIO'}
              </span>
            </button>

            {mode === 'story' && (
              <button
                type="button"
                onClick={() => {
                  setShowAudioPanel(false);
                  setShowTutorial(true);
                  playSfx('menuOpen');
                }}
                aria-label="How to Play"
                className="w-10 h-10 rounded-lg border-2 border-[#555555] bg-[#3A3A3A] hover:border-[#D4A44A] text-[#F2E8D5] flex items-center justify-center cursor-pointer shrink-0"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenContact}
              className="pixel-btn bg-[#D4A44A] hover:bg-[#E0B35B] text-[#2B2B2B] font-pixel text-[8px] sm:text-[9px] px-2.5 sm:px-3 min-h-[40px] flex items-center justify-center whitespace-nowrap cursor-pointer shrink-0"
            >
              CONTACT
            </button>
          </div>
        </div>

        {/* Permanent Collapsible Audio Mixer Drawer inside HUD */}
        {showAudioPanel && (
          <div className="border-t-2 border-[#444444] bg-[#222222] text-[#F2E8D5]">
            <div className="max-w-5xl mx-auto px-3 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMusic}
                  className={`pixel-btn px-3 min-h-[42px] flex items-center gap-1.5 font-pixel text-[9px] cursor-pointer ${
                    musicEnabled
                      ? 'bg-[#D4A44A] text-[#2B2B2B]'
                      : 'bg-[#3A3A3A] text-[#F2E8D5] border-[#555555]'
                  }`}
                >
                  <Music className="w-3.5 h-3.5 shrink-0" />
                  <span>MUSIC: {musicEnabled ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleSfx}
                  className={`pixel-btn px-3 min-h-[42px] flex items-center gap-1.5 font-pixel text-[9px] cursor-pointer ${
                    sfxEnabled
                      ? 'bg-[#6B7F5E] text-[#F2E8D5]'
                      : 'bg-[#3A3A3A] text-[#B7AD9B] border-[#555555]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>SFX: {sfxEnabled ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={muteAllAudio}
                  className="pixel-btn px-3 min-h-[42px] bg-[#C17A5A] hover:bg-[#B26B4C] text-[#F2E8D5] font-pixel text-[9px] cursor-pointer"
                >
                  MUTE ALL
                </button>
              </div>

              <div className="flex items-center gap-3">
                <label
                  htmlFor="realm-volume"
                  className="font-pixel text-[8px] text-[#D4A44A] whitespace-nowrap"
                >
                  VOL {Math.round(volume * 100)}%
                </label>
                <input
                  id="realm-volume"
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(volume * 100)}
                  onChange={(e) => setVolume(Number(e.target.value) / 100)}
                  className="w-28 sm:w-32 accent-[#D4A44A] cursor-pointer"
                />
                <span className="hidden md:inline text-[11px] text-[#B7AD9B]">
                  Original CC0 Web Audio
                </span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Non-blocking Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-[#2B2B2B] text-[#F2E8D5] border-2 border-[#D4A44A] shadow-[0_4px_0_#141414] flex items-center gap-2 max-w-[92vw]"
        >
          <Sparkles className="w-4 h-4 text-[#D4A44A] shrink-0" />
          <span className="font-pixel text-[9px] sm:text-[10px] text-[#D4A44A] truncate">
            {toast}
          </span>
        </div>
      )}

      {/* =====================================================================
          FIRST-VISIT GAME TUTORIAL OVERLAY (Reference-inspired panel)
         ===================================================================== */}
      {mode === 'story' && showTutorial && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="tutorial-title"
          className="fixed inset-0 z-50 bg-[#1B1B1B]/70 flex items-center justify-center p-4"
        >
          <div className="pixel-panel animate-modal-pop w-full max-w-md p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#D3C4A8] pb-3">
              <h2
                id="tutorial-title"
                className="font-pixel text-sm sm:text-base text-[#2B2B2B]"
              >
                {CONTENT.tutorial.title}
              </h2>
              <span className="font-pixel text-[9px] text-[#C17A5A]">
                STORY MODE
              </span>
            </div>

            <ol className="space-y-2.5 text-base text-[#2B2B2B]">
              {CONTENT.tutorial.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 leading-snug">
                  <span className="font-pixel text-[10px] text-[#C17A5A] mt-1 shrink-0">
                    {i + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowTutorial(false);
                  playSfx('menuClose');
                  activateSessionMusicIfAllowed('overworld');
                }}
                className="pixel-btn flex-1 bg-[#D4A44A] hover:bg-[#E0B35B] text-[#2B2B2B] font-pixel text-[10px] sm:text-xs px-4 min-h-[48px] cursor-pointer"
              >
                {CONTENT.tutorial.continueLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTutorial(false);
                  playSfx('menuClose');
                }}
                className="pixel-btn flex-1 bg-[#E9DEC7] hover:bg-[#DFD0B2] text-[#2B2B2B] font-semibold text-base px-4 min-h-[48px] cursor-pointer"
              >
                {CONTENT.tutorial.skipLabel}
              </button>
            </div>

            <div className="pt-1 border-t-2 border-dashed border-[#D3C4A8] text-center">
              <button
                type="button"
                onClick={() => {
                  playSfx('click');
                  setShowTutorial(false);
                  setMode('quick');
                }}
                className="min-h-[44px] text-sm font-semibold text-[#56694A] underline underline-offset-4 cursor-pointer"
              >
                Or jump straight to Quick Portfolio →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MAIN BODY: QUICK PORTFOLIO OR STORY MODE
         ===================================================================== */}
      <main className="flex-1 w-full">
        {mode === 'quick' ? (
          <QuickPortfolioView
            onSwitchToStory={() => {
              playSfx('click');
              setMode('story');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onCopyEmail={handleCopyEmail}
            emailCopied={emailCopied}
            onPlaySfx={playSfx}
          />
        ) : (
          <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6">
            {/* ---------------------------------------------------------------
                TOP HUB: REFERENCE-INSPIRED RPG PROFILE + SIDE MENU + WORLD MAP
               --------------------------------------------------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Speech Box + Docked Menu Buttons + Charcoal Profile Panel */}
              <div className="lg:col-span-5 flex flex-col items-center lg:items-stretch">
                {/* Floating Dialogue Speech Box */}
                <div className="pixel-dialogue w-full px-4 py-3 mb-3">
                  <p className="font-pixel text-[10px] sm:text-[11px] leading-relaxed text-[#F2E8D5]">
                    {dialogueText}
                  </p>
                </div>

                {/* Profile + Left-Docked Menu (Desktop) / Stacked Menu (Mobile) */}
                <div className="w-full flex flex-col md:flex-row lg:flex-row items-stretch gap-3">
                  {/* Left-Docked Game Menu Tabs (Desktop/Tablet) */}
                  <nav
                    aria-label="Game sections"
                    className="hidden md:flex flex-col gap-2 w-[112px] shrink-0"
                  >
                    {MENU_ITEMS.map((item) => {
                      const active = activeChapter === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigateToChapter(item.id, true)}
                          className={`pixel-btn px-2.5 min-h-[48px] flex items-center gap-2 text-left cursor-pointer ${
                            active
                              ? 'bg-[#D4A44A] text-[#2B2B2B]'
                              : 'bg-[#F2E8D5] hover:bg-[#FFF9ED] text-[#2B2B2B]'
                          }`}
                        >
                          <PixelMenuIcon id={item.id} className="w-5 h-5 shrink-0" />
                          <span className="font-pixel text-[9px] truncate">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </nav>

                  {/* Dark Charcoal RPG Profile Panel (Inspired by Reference Screenshot) */}
                  <div className="pixel-panel-dark flex-1 p-5 flex flex-col items-center text-center justify-between gap-4">
                    <div className="w-full flex flex-col items-center gap-3">
                      <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-lg border-4 border-[#F2E8D5] overflow-hidden bg-[#F2E8D5] shadow-[0_4px_0_#141414]">
                        <PixelPortrait className="w-full h-full" />
                      </div>

                      <div className="space-y-1.5">
                        <p className="font-pixel text-[9px] text-[#D4A44A] tracking-widest">
                          {CONTENT.meta.realmName}
                        </p>
                        <h1 className="font-pixel text-base sm:text-lg text-[#F2E8D5] leading-snug">
                          {CONTENT.meta.playerName}
                        </h1>
                        <p className="text-base font-medium text-[#E5D7BC]">
                          {CONTENT.meta.roleLine}
                        </p>
                      </div>
                    </div>

                    {/* Live Progress Pill-Free Readout inside Profile */}
                    <div className="w-full pt-3 border-t-2 border-[#444444] grid grid-cols-2 gap-2 text-xs tabular-nums">
                      <div className="bg-[#383838] rounded p-2 border border-[#505050]">
                        <div className="text-[#B7AD9B]">Skills</div>
                        <div className="font-pixel text-[11px] text-[#D4A44A] mt-1">
                          {collectedSkills.size}/{totalSkills}
                        </div>
                      </div>
                      <div className="bg-[#383838] rounded p-2 border border-[#505050]">
                        <div className="text-[#B7AD9B]">Quests</div>
                        <div className="font-pixel text-[11px] text-[#D4A44A] mt-1">
                          {exploredQuests.size}/{totalQuests}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Game Menu Grid (Compact & Thumb-Friendly >= 48px) */}
                <nav
                  aria-label="Mobile game navigation"
                  className="md:hidden w-full grid grid-cols-3 gap-2 mt-3"
                >
                  {MENU_ITEMS.map((item) => {
                    const active = activeChapter === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateToChapter(item.id, true)}
                        className={`pixel-btn px-2 min-h-[48px] flex items-center justify-center gap-1.5 cursor-pointer ${
                          active
                            ? 'bg-[#D4A44A] text-[#2B2B2B]'
                            : 'bg-[#F2E8D5] hover:bg-[#FFF9ED] text-[#2B2B2B]'
                        }`}
                      >
                        <PixelMenuIcon id={item.id} className="w-4 h-4 shrink-0" />
                        <span className="font-pixel text-[8px] truncate">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Right Column: Interactive Pixel World Map + Playable Traveler */}
              <div className="lg:col-span-7">
                <RealmWorldMap
                  playerPos={playerPos}
                  facing={facing}
                  isWalking={isWalking}
                  activeChapter={activeChapter}
                  discoveredChapters={discoveredChapters}
                  nearbyLandmark={nearbyLandmark}
                  onMove={moveTraveler}
                  onSelectLandmark={(lm) => navigateToChapter(lm.id, true)}
                />
              </div>
            </div>

            {/* ---------------------------------------------------------------
                ACTIVE CHAPTER PANEL (Story Mode Interactive Rooms)
               --------------------------------------------------------------- */}
            <section
              ref={chapterPanelRef}
              aria-live="polite"
              className="pixel-panel p-5 sm:p-7 space-y-6 scroll-mt-18"
            >
              {/* Chapter Breadcrumb & Return to World */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#D3C4A8] pb-3">
                <div className="flex items-center gap-2">
                  <PixelMenuIcon id={activeChapter} className="w-5 h-5 shrink-0" />
                  <span className="font-pixel text-[10px] sm:text-xs text-[#C17A5A]">
                    {activeChapter === 'arrival' && 'CHAPTER 1 · THE ARRIVAL'}
                    {activeChapter === 'academy' && CONTENT.academy.chapterTitle.toUpperCase()}
                    {activeChapter === 'spellbook' && CONTENT.spellbook.chapterTitle.toUpperCase()}
                    {activeChapter === 'quests' && CONTENT.quests.chapterTitle.toUpperCase()}
                    {activeChapter === 'alchemy' && CONTENT.alchemy.chapterTitle.toUpperCase()}
                    {activeChapter === 'owlpost' && CONTENT.owlPost.chapterTitle.toUpperCase()}
                    {activeChapter === 'achievement' && CONTENT.achievement.chapterTitle.toUpperCase()}
                  </span>
                </div>

                {activeChapter !== 'arrival' && (
                  <button
                    type="button"
                    onClick={() => navigateToChapter('arrival', false)}
                    className="text-sm font-semibold text-[#56694A] hover:text-[#2B2B2B] underline underline-offset-4 cursor-pointer min-h-[40px] px-1 flex items-center gap-1"
                  >
                    <MapIcon className="w-4 h-4" />
                    <span>Realm Gate</span>
                  </button>
                )}
              </div>

              {/* =============================================================
                  CHAPTER 1: THE ARRIVAL
                 ============================================================= */}
              {activeChapter === 'arrival' && (
                <div className="space-y-6">
                  {!introSkipped && (
                    <div className="p-4 rounded-lg bg-[#2B2B2B] text-[#F2E8D5] border-2 border-[#D4A44A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-base leading-relaxed">
                        {CONTENT.arrival.introBannerText}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIntroSkipped(true)}
                        className="text-xs font-pixel text-[#D4A44A] hover:underline shrink-0 min-h-[40px] px-2 cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  <div className="space-y-2 text-center sm:text-left">
                    <h2 className="font-pixel text-lg sm:text-2xl text-[#2B2B2B] leading-snug">
                      {CONTENT.arrival.headline}
                    </h2>
                    <p className="text-lg font-semibold text-[#56694A]">
                      {CONTENT.arrival.subline}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        activateSessionMusicIfAllowed('story');
                        navigateToChapter('academy', true);
                      }}
                      className="pixel-btn bg-[#D4A44A] hover:bg-[#E0B35B] text-[#2B2B2B] font-pixel text-[10px] sm:text-xs px-6 min-h-[52px] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{CONTENT.arrival.storyButton}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playSfx('click');
                        setShowTutorial(false);
                        setMode('quick');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="pixel-btn bg-[#6B7F5E] hover:bg-[#5E7152] text-[#F2E8D5] font-semibold text-base px-5 min-h-[52px] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Compass className="w-4 h-4 shrink-0" />
                      <span>{CONTENT.arrival.quickButton}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playSfx('menuOpen');
                        setShowTutorial(true);
                      }}
                      className="pixel-btn bg-[#E9DEC7] hover:bg-[#DFD0B2] text-[#2B2B2B] font-semibold text-base px-5 min-h-[52px] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 shrink-0" />
                      <span>{CONTENT.arrival.howToPlayButton}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* =============================================================
                  CHAPTER 2: THE ACADEMY (ABOUT ME)
                 ============================================================= */}
              {activeChapter === 'academy' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-2xl font-bold text-[#2B2B2B]">
                        {CONTENT.meta.playerName}
                      </h2>
                      <p className="text-base font-semibold text-[#56694A]">
                        {CONTENT.meta.roleLine} · {CONTENT.academy.characterClass}
                      </p>
                    </div>
                    <span className="font-pixel text-[10px] px-3 py-1.5 rounded bg-[#2B2B2B] text-[#D4A44A] border-2 border-[#D4A44A]">
                      {CONTENT.academy.levelLabel}
                    </span>
                  </div>

                  {/* RPG Character Sheet Attributes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {CONTENT.academy.attributes.map((attr) => (
                      <div
                        key={attr.label}
                        className="p-3.5 rounded-lg bg-[#E9DEC7] border-2 border-[#2B2B2B]"
                      >
                        <p className="font-pixel text-[9px] text-[#C17A5A] mb-1">
                          {attr.label.toUpperCase()}
                        </p>
                        <p className="text-base font-bold text-[#2B2B2B]">
                          {attr.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-pixel text-[10px] text-[#56694A] mb-2">
                        CHARACTER BIO
                      </h3>
                      <p className="text-base text-[#2B2B2B] leading-relaxed">
                        {CONTENT.academy.bio}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t-2 border-dashed border-[#D3C4A8]">
                      <div>
                        <h3 className="font-pixel text-[10px] text-[#56694A] mb-2">
                          THE JOURNEY
                        </h3>
                        <p className="text-base text-[#3D372E] leading-relaxed">
                          {CONTENT.academy.journey}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-pixel text-[10px] text-[#56694A] mb-2">
                          INTERESTS
                        </h3>
                        <ul className="space-y-1.5 text-base text-[#2B2B2B]">
                          {CONTENT.academy.interests.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <span className="text-[#C17A5A] font-bold">▸</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => navigateToChapter('spellbook', true)}
                      className="pixel-btn bg-[#D4A44A] hover:bg-[#E0B35B] text-[#2B2B2B] font-semibold text-base px-5 min-h-[48px] flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Next: Open Spellbook →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* =============================================================
                  CHAPTER 3: THE SPELLBOOK (SKILLS)
                 ============================================================= */}
              {activeChapter === 'spellbook' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-base text-[#3D372E] max-w-2xl">
                      {CONTENT.spellbook.subtitle}
                    </p>
                    <span className="font-pixel text-[10px] text-[#8C641C] tabular-nums shrink-0">
                      {collectedSkills.size}/{totalSkills} Collected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CONTENT.spellbook.skills.map((skill) => {
                      const isCollected = collectedSkills.has(skill.id);
                      return (
                        <div
                          key={skill.id}
                          className={`p-4 rounded-xl border-2 flex flex-col justify-between gap-3 transition-colors ${
                            isCollected
                              ? 'bg-[#FFF9ED] border-[#D4A44A]'
                              : 'bg-[#E9DEC7] border-[#2B2B2B]'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-11 h-11 rounded-lg border-2 border-[#2B2B2B] flex items-center justify-center shrink-0 ${
                                    isCollected
                                      ? 'bg-[#2B2B2B] animate-float-artifact'
                                      : 'bg-[#F2E8D5]'
                                  }`}
                                >
                                  <SkillArtifactSprite
                                    icon={skill.icon}
                                    collected={isCollected}
                                    className="w-8 h-8"
                                  />
                                </div>
                                <div>
                                  <p className="font-pixel text-[9px] text-[#C17A5A]">
                                    {skill.metaphor.toUpperCase()}
                                  </p>
                                  <h3 className="text-base font-bold text-[#2B2B2B]">
                                    {skill.name}
                                  </h3>
                                </div>
                              </div>
                            </div>

                            <p className="text-sm sm:text-base text-[#3D372E] leading-snug">
                              {skill.description}
                            </p>

                            {isCollected && (
                              <p className="text-sm font-medium text-[#56694A] bg-[#F2E8D5] p-2.5 rounded border border-[#D4A44A]">
                                {skill.arcaneNote}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCollectSkill(skill.id, skill.name)}
                            disabled={isCollected}
                            className={`min-h-[48px] px-4 rounded-lg border-2 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 ${
                              isCollected
                                ? 'bg-[#E5D7BC] border-[#D4A44A] text-[#6B4F19] cursor-default'
                                : 'pixel-btn bg-[#D4A44A] hover:bg-[#E0B35B] border-[#2B2B2B] text-[#2B2B2B] cursor-pointer'
                            }`}
                          >
                            {isCollected ? (
                              <>
                                <Check className="w-4 h-4 shrink-0" />
                                <span>Artifact Collected</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 shrink-0" />
                                <span>Collect Artifact</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => navigateToChapter('quests', true)}
                      className="pixel-btn bg-[#6B7F5E] hover:bg-[#5E7152] text-[#F2E8D5] font-semibold text-base px-5 min-h-[48px] flex items-center gap-2 cursor-pointer"
                    >
                      <span>Next: Enter Quest Rooms →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* =============================================================
                  CHAPTER 4: THE QUEST ROOMS (PROJECTS)
                 ============================================================= */}
              {activeChapter === 'quests' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-base text-[#3D372E] max-w-2xl">
                      {CONTENT.quests.subtitle}
                    </p>
                    <span className="font-pixel text-[10px] text-[#8C641C] tabular-nums shrink-0">
                      {exploredQuests.size}/{totalQuests} Logged
                    </span>
                  </div>

                  <div className="space-y-6">
                    {CONTENT.quests.items.map((quest) => {
                      const explored = exploredQuests.has(quest.id);
                      const hasLiveUrl = Boolean(quest.liveUrl && quest.liveUrl.trim());
                      const hasGithubUrl = Boolean(quest.githubUrl && quest.githubUrl.trim());
                      const isComingSoon = quest.status === 'COMING SOON';

                      return (
                        <article
                          key={quest.id}
                          className="p-4 sm:p-6 rounded-xl bg-[#FFF9ED] border-2 border-[#2B2B2B] space-y-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-pixel text-[10px] text-[#C17A5A]">
                              {quest.questCode} · {quest.environmentLabel}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border-2 font-pixel text-[8px] sm:text-[9px] ${
                                hasLiveUrl || hasGithubUrl
                                  ? 'bg-[#6B7F5E] text-[#F2E8D5] border-[#2B2B2B]'
                                  : 'bg-[#2B2B2B] text-[#D4A44A] border-[#2B2B2B]'
                              }`}
                            >
                              {isComingSoon ? (
                                <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                              ) : (
                                <Hammer className="w-3 h-3 shrink-0" aria-hidden="true" />
                              )}
                              <span>{quest.status}</span>
                            </span>
                          </div>

                          <QuestEnvironmentArt variant={quest.environment} />

                          <div className="space-y-2.5">
                            <h3 className="text-xl sm:text-2xl font-bold text-[#2B2B2B]">
                              {quest.title}
                            </h3>
                            <p className="text-base text-[#3D372E] leading-relaxed">
                              {quest.description}
                            </p>

                            <p className="text-sm font-semibold text-[#56694A]">
                              {quest.technologies.join(' · ')}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                              <div className="p-3.5 rounded-lg bg-[#F2E8D5] border border-[#CBBBA0]">
                                <p className="font-pixel text-[9px] text-[#C17A5A] mb-1">
                                  PROBLEM SOLVED
                                </p>
                                <p className="text-sm sm:text-base text-[#2B2B2B]">
                                  {quest.problemSolved}
                                </p>
                              </div>
                              <div className="p-3.5 rounded-lg bg-[#F2E8D5] border border-[#CBBBA0]">
                                <p className="font-pixel text-[9px] text-[#56694A] mb-1">
                                  MY CONTRIBUTION
                                </p>
                                <p className="text-sm sm:text-base text-[#2B2B2B]">
                                  {quest.contribution}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-1">
                            {hasLiveUrl && quest.liveUrl && (
                              <a
                                href={quest.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => playSfx('openProject')}
                                className="pixel-btn bg-[#6B7F5E] hover:bg-[#5E7152] text-[#F2E8D5] font-pixel text-[10px] px-5 min-h-[48px] flex items-center justify-center gap-2"
                              >
                                <span>LIVE DEMO</span>
                                <ExternalLink className="w-4 h-4 shrink-0" />
                              </a>
                            )}

                            {hasGithubUrl && quest.githubUrl && (
                              <a
                                href={quest.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => playSfx('openProject')}
                                className="pixel-btn bg-[#2B2B2B] hover:bg-[#3A3A3A] text-[#F2E8D5] font-pixel text-[10px] px-5 min-h-[48px] flex items-center justify-center gap-2"
                              >
                                <Github className="w-4 h-4 shrink-0" />
                                <span>VIEW SOURCE</span>
                              </a>
                            )}

                            {!hasLiveUrl && !hasGithubUrl && (
                              <div className="min-h-[48px] px-4 rounded-lg border-2 border-dashed border-[#C17A5A] bg-[#F2E8D5] text-[#5A4B3C] font-pixel text-[9px] sm:text-[10px] flex items-center justify-center gap-2 select-none">
                                {isComingSoon ? (
                                  <Clock className="w-4 h-4 text-[#C17A5A] shrink-0" aria-hidden="true" />
                                ) : (
                                  <Hammer className="w-4 h-4 text-[#C17A5A] shrink-0" aria-hidden="true" />
                                )}
                                <span>{quest.status} · REPO NOT YET PUBLISHED</span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handleExploreQuest(quest.id, quest.title)}
                              disabled={explored}
                              className={`min-h-[48px] px-5 rounded-lg border-2 font-semibold text-base flex items-center justify-center gap-2 ${
                                explored
                                  ? 'bg-[#E5D7BC] border-[#D4A44A] text-[#6B4F19] cursor-default'
                                  : 'pixel-btn bg-[#D4A44A] hover:bg-[#E0B35B] border-[#2B2B2B] text-[#2B2B2B] cursor-pointer'
                              }`}
                            >
                              <Check className="w-4 h-4 shrink-0" />
                              <span>
                                {explored ? 'Quest Logged' : 'Mark Quest Explored'}
                              </span>
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        navigateToChapter(
                          CONTENT.alchemy.enabled ? 'alchemy' : 'achievement',
                          true
                        )
                      }
                      className="pixel-btn bg-[#D4A44A] hover:bg-[#E0B35B] text-[#2B2B2B] font-semibold text-base px-5 min-h-[48px] flex items-center gap-2 cursor-pointer"
                    >
                      <span>
                        {CONTENT.alchemy.enabled
                          ? 'Next: Alchemy Laboratory →'
                          : 'Final Chapter: Player Card →'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* =============================================================
                  CHAPTER 5: THE ALCHEMY LABORATORY (OPTIONAL EXPERIMENTS)
                 ============================================================= */}
              {activeChapter === 'alchemy' && CONTENT.alchemy.enabled && (
                <div className="space-y-5">
                  <p className="text-base text-[#3D372E]">{CONTENT.alchemy.subtitle}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CONTENT.alchemy.experiments.map((exp) => {
                      const active = activeExperiments.has(exp.id);
                      return (
                        <div
                          key={exp.id}
                          className={`p-4 rounded-xl border-2 flex flex-col justify-between gap-3 transition-colors ${
                            active
                              ? 'bg-[#2B2B2B] text-[#F2E8D5] border-[#D4A44A]'
                              : 'bg-[#E9DEC7] text-[#2B2B2B] border-[#2B2B2B]'
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                                  active
                                    ? 'bg-[#3C3C3C] border-[#D4A44A]'
                                    : 'bg-[#F2E8D5] border-[#2B2B2B]'
                                }`}
                              >
                                <AlchemyVesselSprite
                                  vessel={exp.vessel}
                                  active={active}
                                  className="w-9 h-9"
                                />
                              </div>
                              <div>
                                <h3 className="text-base font-bold leading-snug">
                                  {exp.title}
                                </h3>
                                <p
                                  className={`text-xs font-semibold mt-0.5 ${
                                    active ? 'text-[#D4A44A]' : 'text-[#56694A]'
                                  }`}
                                >
                                  {exp.tags.join(' · ')}
                                </p>
                              </div>
                            </div>

                            <p
                              className={`text-sm sm:text-base leading-snug ${
                                active ? 'text-[#E6DEC8]' : 'text-[#3D372E]'
                              }`}
                            >
                              {exp.summary}
                            </p>

                            {active && (
                              <div className="p-2.5 rounded bg-[#3A3A3A] border border-[#D4A44A] text-sm text-[#FFF3C4]">
                                Outcome: {exp.outcome}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleExperiment(exp.id, exp.title)}
                            className={`pixel-btn min-h-[48px] px-4 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer ${
                              active
                                ? 'bg-[#D4A44A] text-[#2B2B2B]'
                                : 'bg-[#FFF9ED] hover:bg-[#F9EBC8] text-[#2B2B2B]'
                            }`}
                          >
                            <FlaskConical className="w-4 h-4 shrink-0" />
                            <span>
                              {active ? 'Deactivate Apparatus' : 'Activate Experiment'}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => navigateToChapter('achievement', true)}
                      className="pixel-btn bg-[#D4A44A] hover:bg-[#E0B35B] text-[#2B2B2B] font-semibold text-base px-5 min-h-[48px] flex items-center gap-2 cursor-pointer"
                    >
                      <span>Final Chapter: Claim Player Card →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* =============================================================
                  CHAPTER 6: OWL POST (CONTACT — Always Accessible)
                 ============================================================= */}
              {activeChapter === 'owlpost' && (
                <div className="space-y-5">
                  <div className="p-4 sm:p-5 rounded-xl bg-[#E9DEC7] border-2 border-[#2B2B2B] flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[#2B2B2B] border-2 border-[#D4A44A] flex items-center justify-center shrink-0">
                      <PixelMessengerOwl className="w-12 h-12" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="font-pixel text-[10px] text-[#C17A5A]">
                        ENCHANTED MESSENGER LETTER
                      </p>
                      <p className="text-base text-[#2B2B2B] leading-relaxed">
                        {CONTENT.owlPost.subtitle}
                      </p>
                      <p className="text-sm font-semibold text-[#56694A]">
                        {CONTENT.owlPost.messengerNote}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <a
                        href={`mailto:${CONTENT.owlPost.email}`}
                        className="pixel-btn flex-1 bg-[#C17A5A] hover:bg-[#B26B4C] text-[#F2E8D5] font-semibold text-base px-4 min-h-[50px] flex items-center justify-center gap-2.5"
                      >
                        <Mail className="w-4 h-4 shrink-0" />
                        <span className="truncate">{CONTENT.owlPost.email}</span>
                      </a>

                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="pixel-btn bg-[#E9DEC7] hover:bg-[#DFD0B2] text-[#2B2B2B] font-semibold text-base px-5 min-h-[50px] flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        {emailCopied ? (
                          <Check className="w-4 h-4 text-[#56694A]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span>{emailCopied ? 'Copied' : 'Copy Email'}</span>
                      </button>
                    </div>

                    <a
                      href={CONTENT.owlPost.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pixel-btn w-full bg-[#2B2B2B] hover:bg-[#3A3A3A] text-[#F2E8D5] font-semibold text-base px-4 min-h-[50px] flex items-center justify-center gap-2.5"
                    >
                      <Github className="w-4 h-4 shrink-0" />
                      <span className="truncate">
                        GitHub · {CONTENT.owlPost.githubUrl.replace(/^https?:\/\//, '')}
                      </span>
                    </a>
                  </div>
                </div>
              )}

              {/* =============================================================
                  FINAL CHAPTER: THE ACHIEVEMENT (PLAYER CARD)
                 ============================================================= */}
              {activeChapter === 'achievement' && (
                <div className="space-y-5">
                  <div className="p-5 sm:p-7 rounded-xl bg-[#FFF9ED] border-[3px] border-[#2B2B2B] ring-4 ring-[#D4A44A]/85 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#D3C4A8] pb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-16 h-16 rounded-lg border-2 border-[#2B2B2B] overflow-hidden shrink-0">
                          <PixelPortrait className="w-full h-full" />
                        </div>
                        <div>
                          <p className="font-pixel text-[9px] text-[#C17A5A] mb-1">
                            REALM ACHIEVEMENT CARD
                          </p>
                          <h2 className="font-pixel text-base sm:text-lg text-[#2B2B2B]">
                            {CONTENT.meta.playerName}
                          </h2>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#6B5F4E]">
                          Earned Title
                        </p>
                        <p className="text-xl font-bold text-[#8C641C]">{playerTitle}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 tabular-nums">
                      <div className="p-3.5 rounded-lg bg-[#E9DEC7] border-2 border-[#2B2B2B]">
                        <p className="font-pixel text-[9px] text-[#56694A] mb-1">
                          SKILLS DISCOVERED
                        </p>
                        <p className="text-xl font-bold text-[#2B2B2B]">
                          {collectedSkills.size} / {totalSkills}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-lg bg-[#E9DEC7] border-2 border-[#2B2B2B]">
                        <p className="font-pixel text-[9px] text-[#C17A5A] mb-1">
                          PROJECTS EXPLORED
                        </p>
                        <p className="text-xl font-bold text-[#2B2B2B]">
                          {exploredQuests.size} / {totalQuests}
                        </p>
                      </div>
                    </div>

                    {/* Skill Artifact Trophy Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CONTENT.spellbook.skills.map((skill) => {
                        const owned = collectedSkills.has(skill.id);
                        return (
                          <div
                            key={skill.id}
                            className={`p-2 rounded-lg border-2 flex items-center gap-2 ${
                              owned
                                ? 'bg-[#F2E8D5] border-[#D4A44A] text-[#2B2B2B]'
                                : 'bg-[#EAE0CB] border-[#CBBBA0] text-[#7F7564] opacity-75'
                            }`}
                          >
                            <SkillArtifactSprite
                              icon={skill.icon}
                              collected={owned}
                              className="w-5 h-5 shrink-0"
                            />
                            <span className="text-xs font-bold truncate">
                              {skill.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-base text-[#3D372E] italic border-t-2 border-dashed border-[#D3C4A8] pt-4">
                      “{CONTENT.achievement.signOff}”
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={handleShareCard}
                        className="pixel-btn flex-1 bg-[#D4A44A] hover:bg-[#E0B35B] text-[#2B2B2B] font-semibold text-base px-5 min-h-[48px] flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 shrink-0" />
                        <span>
                          {shareLabelOverride ?? CONTENT.achievement.shareLabel}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleReplay}
                        className="pixel-btn flex-1 bg-[#F2E8D5] hover:bg-[#E5D7BC] text-[#2B2B2B] font-semibold text-base px-5 min-h-[48px] flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 shrink-0" />
                        <span>{CONTENT.achievement.replayLabel}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Clean Retro Footer */}
      <footer className="w-full bg-[#2B2B2B] text-[#E6DEC8] border-t-4 border-[#161616] py-4 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <span>
            © {new Date().getFullYear()} {CONTENT.meta.playerName} · {CONTENT.meta.realmName}
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleOpenContact}
              className="text-[#D4A44A] hover:underline font-medium min-h-[40px] px-1 cursor-pointer"
            >
              Owl Post
            </button>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-[#F2E8D5] hover:underline font-medium min-h-[40px] px-1 cursor-pointer"
            >
              Top ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
