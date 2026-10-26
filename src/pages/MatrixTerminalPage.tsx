import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Terminal,
  Radio,
  Skull,
  ArrowRight,
  Sliders,
  Copy,
  Check,
  Zap,
  Volume2,
  VolumeX,
  Code2,
} from 'lucide-react';
import { MatrixCanvas } from '../components/MatrixCanvas.tsx';
import type { MatrixTerminalMode, TerminalSettings, GraveyardFragment } from '../types/index.ts';
import { GRAVEYARD_FRAGMENTS, GHOST_SIGNALS } from '../data/graveyard.ts';
import {
  getDiscoveryStats,
  recordDiscoveryStat,
} from '../utils/storage.ts';

interface MatrixTerminalPageProps {
  settings: TerminalSettings;
  onOpenSettings: () => void;
  onToggleSound: () => void;
}

export const MatrixTerminalPage: React.FC<MatrixTerminalPageProps> = ({
  settings,
  onOpenSettings,
  onToggleSound,
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<MatrixTerminalMode>('matrix');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeSignalIndex, setActiveSignalIndex] = useState<number>(0);
  const [selectedFragment, setSelectedFragment] = useState<GraveyardFragment | null>(null);
  const [copiedFragment, setCopiedFragment] = useState<boolean>(false);
  const [stats, setStats] = useState(() => getDiscoveryStats());

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused(p => !p);
      } else if (e.code === 'KeyR') {
        // Reset
        handleResetCanvas();
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Track ripples
  const handleRipple = () => {
    const updated = recordDiscoveryStat('ripplesTriggered', prev => prev + 1);
    setStats({ ...updated });
  };

  // Signal switching & tracking
  const handleNextSignal = () => {
    const nextIdx = (activeSignalIndex + 1) % GHOST_SIGNALS.length;
    setActiveSignalIndex(nextIdx);
    const updated = recordDiscoveryStat('signalsIntercepted', prev => prev + 1);
    setStats({ ...updated });
  };

  // Fragment inspection & tracking
  const handleInspectFragment = (frag: GraveyardFragment) => {
    setSelectedFragment(frag);
    const updated = recordDiscoveryStat('fragmentsFound', prev => {
      if (!prev.includes(frag.id)) {
        return [...prev, frag.id];
      }
      return prev;
    });
    setStats({ ...updated });
  };

  const handleCopyFragmentCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedFragment(true);
    setTimeout(() => setCopiedFragment(false), 2000);
  };

  const handleSendToWorkspace = (frag: GraveyardFragment) => {
    // Jump straight to workspace with this code pre-loaded
    navigate('/session', {
      state: {
        code: frag.code,
        language: frag.language,
        title: frag.title,
        context: `Salvaged from The Forgotten System: ${frag.lore}`,
      },
    });
  };

  const handleResetCanvas = () => {
    // Toggle pause back and trigger reset
    setIsPaused(false);
  };

  const activeSignal = GHOST_SIGNALS[activeSignalIndex];

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex-1 flex flex-col bg-[#07090D] overflow-hidden page-transition select-none ${
        isFullscreen ? 'h-screen fixed inset-0 z-50' : 'min-h-[calc(100vh-4rem)]'
      }`}
    >
      {/* Background Interactive Matrix Canvas Engine */}
      <div className="absolute inset-0 z-0">
        <MatrixCanvas
          mode={mode}
          settings={{
            ...settings,
            speed: isPaused ? 0.0001 : settings.speed,
          }}
          interactive={!isPaused}
          onRipple={handleRipple}
          opacity={0.85}
        />
      </div>

      {/* Subtle CRT Overlay over canvas */}
      {settings.crtScanlines && (
        <div className="absolute inset-0 crt-overlay pointer-events-none z-10 opacity-70" />
      )}
      <div className="absolute inset-0 crt-vignette pointer-events-none z-10" />

      {/* Terminal HUD & Controls Bar */}
      <div className="relative z-20 p-4 sm:p-6 flex flex-col justify-between flex-1 pointer-events-none">
        {/* Top Control Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0D1118]/90 backdrop-blur-md rounded border border-[#273142]">
            <button
              type="button"
              onClick={() => setMode('matrix')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-all flex items-center gap-1.5 ${
                mode === 'matrix'
                  ? 'bg-[#29F06B]/20 text-[#8DFF9B] border border-[#29F06B]/50 shadow-[0_0_12px_rgba(41,240,107,0.25)]'
                  : 'text-[#929DAD] hover:text-[#E8EDF4]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Matrix Rain</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('ghost_signal')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-all flex items-center gap-1.5 ${
                mode === 'ghost_signal'
                  ? 'bg-[#70E8F2]/20 text-[#70E8F2] border border-[#70E8F2]/50 shadow-[0_0_12px_rgba(112,232,242,0.25)]'
                  : 'text-[#929DAD] hover:text-[#E8EDF4]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Ghost Signal</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('graveyard')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-all flex items-center gap-1.5 ${
                mode === 'graveyard'
                  ? 'bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/50 shadow-[0_0_12px_rgba(167,139,250,0.25)]'
                  : 'text-[#929DAD] hover:text-[#E8EDF4]'
              }`}
            >
              <Skull className="w-3.5 h-3.5" />
              <span>Code Graveyard</span>
            </button>
          </div>

          {/* Player controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPaused(p => !p)}
              title={isPaused ? 'Resume Matrix (Space)' : 'Pause Matrix (Space)'}
              className={`px-3 py-1.5 text-xs font-mono rounded border flex items-center gap-1.5 transition-colors ${
                isPaused
                  ? 'border-[#F0B76D] bg-[#F0B76D]/20 text-[#F0B76D]'
                  : 'border-[#273142] bg-[#0D1118]/90 text-[#929DAD] hover:text-[#E8EDF4]'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'PAUSED' : 'ACTIVE'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetCanvas}
              title="Reset Streams (R)"
              className="p-2 text-xs font-mono rounded border border-[#273142] bg-[#0D1118]/90 text-[#929DAD] hover:text-[#E8EDF4] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onToggleSound}
              title={settings.soundEnabled ? 'Mute Audio' : 'Enable Retro Ambience'}
              className="p-2 text-xs font-mono rounded border border-[#273142] bg-[#0D1118]/90 text-[#929DAD] hover:text-[#29F06B] transition-colors"
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[#29F06B]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              title="Engine Calibration"
              className="p-2 text-xs font-mono rounded border border-[#273142] bg-[#0D1118]/90 text-[#929DAD] hover:text-[#70E8F2] transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen Terminal (F)'}
              className="p-2 text-xs font-mono rounded border border-[#273142] bg-[#0D1118]/90 text-[#929DAD] hover:text-[#E8EDF4] transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => navigate('/session')}
              className="px-3 py-1.5 text-xs font-mono font-medium rounded bg-[#29F06B] text-[#07090D] hover:bg-[#8DFF9B] transition-colors shadow-[0_0_12px_rgba(41,240,107,0.3)] flex items-center gap-1.5"
            >
              <span>Workspace</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Center Overlay Content Depending on Mode */}
        <div className="my-auto max-w-2xl mx-auto w-full pointer-events-auto">
          {/* Mode A: Matrix Rain Interactive Overlay */}
          {mode === 'matrix' && (
            <div className="p-4 rounded border border-[#273142]/80 bg-[#0D1118]/75 backdrop-blur-md text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#8DFF9B] mb-1">
                <span className="w-2 h-2 rounded-full bg-[#29F06B] animate-pulse" />
                <span>INTERACTIVE_RESONANCE // CANVAS_LIVE</span>
              </div>
              <p className="text-xs text-[#929DAD] font-mono leading-relaxed">
                Click or touch anywhere on the canvas to trigger energy ripples. Move cursor to part falling code.
              </p>
            </div>
          )}

          {/* Mode B: Ghost Signal Transmissions */}
          {mode === 'ghost_signal' && (
            <div className="p-5 sm:p-6 rounded border border-[#70E8F2]/40 bg-[#0D1118]/90 backdrop-blur-md shadow-[0_0_32px_rgba(112,232,242,0.15)] animate-glitch">
              <div className="flex items-center justify-between text-xs font-mono text-[#70E8F2] mb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>TRANSMISSION: {activeSignal.source}</span>
                </div>
                <span>HEX: {activeSignal.timestamp}</span>
              </div>

              <blockquote className="text-sm sm:text-base italic text-[#E8EDF4] font-serif leading-relaxed mb-4">
                {activeSignal.message}
              </blockquote>

              <div className="flex items-center justify-between pt-3 border-t border-[#273142] text-xs font-mono">
                <span className="text-[11px] text-[#929DAD]">
                  Atmospheric Fiction · Signal {activeSignalIndex + 1} of {GHOST_SIGNALS.length}
                </span>

                <button
                  type="button"
                  onClick={handleNextSignal}
                  className="px-3 py-1 rounded bg-[#70E8F2]/10 text-[#70E8F2] border border-[#70E8F2]/40 hover:bg-[#70E8F2]/20 transition-colors flex items-center gap-1.5"
                >
                  <span>Intercept Next Signal</span>
                  <Zap className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Mode C: Code Graveyard Artifacts */}
          {mode === 'graveyard' && (
            <div className="p-5 rounded border border-[#A78BFA]/40 bg-[#0D1118]/90 backdrop-blur-md shadow-[0_0_32px_rgba(167,139,250,0.15)]">
              <div className="flex items-center justify-between text-xs font-mono text-[#A78BFA] mb-3">
                <div className="flex items-center gap-2">
                  <Skull className="w-4 h-4" />
                  <span>THE CODE GRAVEYARD // ANCIENT ARTIFACTS</span>
                </div>
                <span className="text-[11px] text-[#929DAD]">
                  {stats.fragmentsFound.length} / {GRAVEYARD_FRAGMENTS.length} Discovered
                </span>
              </div>

              <p className="text-xs text-[#929DAD] mb-4">
                Select an ancient code fragment salvaged from decommissioned systems to inspect its lore:
              </p>

              {/* Fragment Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {GRAVEYARD_FRAGMENTS.map(frag => {
                  const isFound = stats.fragmentsFound.includes(frag.id);
                  return (
                    <button
                      key={frag.id}
                      type="button"
                      onClick={() => handleInspectFragment(frag)}
                      className={`p-2.5 rounded border text-left transition-all font-mono text-xs ${
                        selectedFragment?.id === frag.id
                          ? 'border-[#A78BFA] bg-[#A78BFA]/15 text-[#E8EDF4]'
                          : 'border-[#273142] bg-[#07090D] text-[#929DAD] hover:border-[#A78BFA]/50 hover:text-[#E8EDF4]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#8DFF9B] font-semibold text-[11px]">{frag.language}</span>
                        <span className="text-[10px] text-[#929DAD]">{frag.era}</span>
                      </div>
                      <div className="truncate text-[#E8EDF4] font-medium">{frag.title}</div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Fragment Modal / Detail Pane */}
              {selectedFragment && (
                <div className="p-4 rounded border border-[#273142] bg-[#07090D] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#A78BFA] font-bold">
                      {selectedFragment.title}
                    </span>
                    <span className="text-[10px] font-mono text-[#929DAD]">{selectedFragment.era}</span>
                  </div>

                  <pre className="p-3 rounded bg-[#07090D] border border-[#273142] text-xs font-mono text-[#8DFF9B] overflow-x-auto max-h-36">
                    <code>{selectedFragment.code}</code>
                  </pre>

                  <p className="text-xs text-[#929DAD] leading-relaxed">
                    <strong className="text-[#E8EDF4]">Lore: </strong>{selectedFragment.lore}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#273142]">
                    <button
                      type="button"
                      onClick={() => handleCopyFragmentCode(selectedFragment.code)}
                      className="px-2.5 py-1 text-xs font-mono rounded border border-[#273142] text-[#929DAD] hover:text-[#E8EDF4] transition-colors flex items-center gap-1"
                    >
                      {copiedFragment ? <Check className="w-3 h-3 text-[#29F06B]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedFragment ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendToWorkspace(selectedFragment)}
                      className="px-3 py-1 text-xs font-mono font-medium rounded bg-[#A78BFA] text-[#07090D] hover:bg-[#C4B5FD] transition-colors flex items-center gap-1.5"
                    >
                      <span>Analyze in Workspace</span>
                      <Code2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Discovery Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#929DAD] pointer-events-auto bg-[#0D1118]/80 backdrop-blur-md px-4 py-2.5 rounded border border-[#273142]">
          <div className="flex items-center gap-4">
            <span>Ripples Triggered: <strong className="text-[#8DFF9B]">{stats.ripplesTriggered}</strong></span>
            <span>Signals Intercepted: <strong className="text-[#70E8F2]">{stats.signalsIntercepted}</strong></span>
            <span>Fragments Salvaged: <strong className="text-[#A78BFA]">{stats.fragmentsFound.length}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#929DAD]">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[#141A24] text-[#E8EDF4]">Space</kbd> to Pause</span>
            <span>·</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-[#141A24] text-[#E8EDF4]">F</kbd> for Fullscreen</span>
          </div>
        </div>
      </div>
    </div>
  );
};
