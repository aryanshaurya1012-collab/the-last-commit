import React from 'react';
import { X, RotateCcw, Volume2, VolumeX, Sparkles, Monitor, Zap, Sliders } from 'lucide-react';
import type { TerminalSettings, FpsCap, MatrixColorTheme } from '../types/index.ts';
import { DEFAULT_TERMINAL_SETTINGS } from '../utils/storage.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TerminalSettings;
  onUpdateSettings: (newSettings: TerminalSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const updateField = <K extends keyof TerminalSettings>(key: K, value: TerminalSettings[K]) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleReset = () => {
    onUpdateSettings({ ...DEFAULT_TERMINAL_SETTINGS });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090D]/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0D1118] border border-[#273142] rounded shadow-[0_24px_64px_rgba(0,0,0,0.85)] flex flex-col max-h-[90vh] overflow-hidden page-transition">
        {/* Header */}
        <div className="px-5 py-4 bg-[#07090D] border-b border-[#273142] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#29F06B]" />
            <h2 className="text-sm font-bold font-mono text-[#E8EDF4] tracking-wide uppercase">
              Terminal Engine Calibration
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#929DAD] hover:text-[#E8EDF4] p-1 font-mono text-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#E8EDF4]">
          {/* Color Palette Themes */}
          <div>
            <label className="block font-mono text-[#29F06B] uppercase mb-2">
              Color Resonance
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'matrix_green', label: 'Matrix Phosphor', color: 'bg-[#29F06B]', border: 'border-[#29F06B]' },
                { id: 'ghost_cyan', label: 'Ghostly Cyan', color: 'bg-[#70E8F2]', border: 'border-[#70E8F2]' },
                { id: 'spectral_violet', label: 'Spectral Violet', color: 'bg-[#A78BFA]', border: 'border-[#A78BFA]' },
                { id: 'amber_relic', label: 'Distressed Amber', color: 'bg-[#F0B76D]', border: 'border-[#F0B76D]' },
              ].map(theme => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => updateField('colorTheme', theme.id as MatrixColorTheme)}
                  className={`p-2.5 rounded border flex items-center gap-2.5 transition-all text-left ${
                    settings.colorTheme === theme.id
                      ? `${theme.border} bg-[#141A24] text-[#E8EDF4]`
                      : 'border-[#273142] bg-[#07090D] text-[#929DAD] hover:border-[#273142]/80 hover:text-[#E8EDF4]'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${theme.color} shrink-0`} />
                  <span className="font-mono text-xs">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Performance: Frame Rate Cap */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-[#70E8F2] uppercase">
                Display Refresh Sync (FPS Cap)
              </label>
              <span className="text-[11px] font-mono text-[#929DAD]">
                {settings.fpsCap === 'auto' ? 'Display Native (Auto)' : `${settings.fpsCap} FPS`}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 p-1 bg-[#07090D] rounded border border-[#273142]">
              {(['auto', '30', '60', '120', '144'] as FpsCap[]).map(cap => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => updateField('fpsCap', cap)}
                  className={`py-1.5 text-xs font-mono rounded transition-colors uppercase ${
                    settings.fpsCap === cap
                      ? 'bg-[#29F06B]/20 text-[#29F06B] font-semibold border border-[#29F06B]/40'
                      : 'text-[#929DAD] hover:text-[#E8EDF4]'
                  }`}
                >
                  {cap}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#929DAD] mt-1.5 leading-normal">
              Time-based delta rendering prevents motion distortion across 60Hz, 120Hz, and 144Hz displays.
            </p>
          </div>

          {/* Rain Sliders: Speed, Density, Brightness */}
          <div className="space-y-4 pt-2 border-t border-[#273142]">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-[#929DAD]">Rain Velocity</span>
                <span className="font-mono text-xs text-[#8DFF9B]">{settings.speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={settings.speed}
                onChange={e => updateField('speed', parseFloat(e.target.value))}
                className="w-full accent-[#29F06B] bg-[#07090D]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-[#929DAD]">Matrix Column Density</span>
                <span className="font-mono text-xs text-[#8DFF9B]">{settings.density.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.density}
                onChange={e => updateField('density', parseFloat(e.target.value))}
                className="w-full accent-[#29F06B] bg-[#07090D]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-[#929DAD]">Phosphor Luminance</span>
                <span className="font-mono text-xs text-[#8DFF9B]">{Math.round(settings.brightness * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.5"
                step="0.1"
                value={settings.brightness}
                onChange={e => updateField('brightness', parseFloat(e.target.value))}
                className="w-full accent-[#29F06B] bg-[#07090D]"
              />
            </div>
          </div>

          {/* Atmosphere Toggles */}
          <div className="pt-2 border-t border-[#273142] space-y-3">
            <label className="flex items-center justify-between p-2.5 rounded bg-[#07090D] border border-[#273142] cursor-pointer">
              <span className="flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5 text-[#29F06B]" />
                <span className="font-mono text-xs">CRT Scanlines & Vignette</span>
              </span>
              <input
                type="checkbox"
                checked={settings.crtScanlines}
                onChange={e => updateField('crtScanlines', e.target.checked)}
                className="w-4 h-4 accent-[#29F06B] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded bg-[#07090D] border border-[#273142] cursor-pointer">
              <span className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#F0B76D]" />
                <span className="font-mono text-xs">Reduced Motion / Energy Saver</span>
              </span>
              <input
                type="checkbox"
                checked={settings.reducedEffects}
                onChange={e => updateField('reducedEffects', e.target.checked)}
                className="w-4 h-4 accent-[#F0B76D] rounded"
              />
            </label>

            {/* Ambient Sound Toggle & Volume */}
            <div className="p-2.5 rounded bg-[#07090D] border border-[#273142] space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-[#29F06B]" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-[#929DAD]" />
                  )}
                  <span className="font-mono text-xs">Analog Computer Room Drone</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={e => updateField('soundEnabled', e.target.checked)}
                  className="w-4 h-4 accent-[#29F06B] rounded"
                />
              </div>

              {settings.soundEnabled && (
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-[11px] text-[#929DAD] font-mono shrink-0">Volume</span>
                  <input
                    type="range"
                    min="0.05"
                    max="0.8"
                    step="0.05"
                    value={settings.soundVolume}
                    onChange={e => updateField('soundVolume', parseFloat(e.target.value))}
                    className="w-full accent-[#29F06B]"
                  />
                  <span className="text-[11px] font-mono text-[#8DFF9B] shrink-0">
                    {Math.round(settings.soundVolume * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#07090D] border-t border-[#273142] flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-mono text-[#929DAD] hover:text-[#E8EDF4] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restore Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-semibold rounded bg-[#29F06B] text-[#07090D] hover:bg-[#8DFF9B] transition-colors shadow-[0_0_12px_rgba(41,240,107,0.3)]"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
