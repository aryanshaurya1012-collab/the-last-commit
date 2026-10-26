import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Sliders, Volume2, VolumeX, Radio } from 'lucide-react';
import type { TerminalSettings } from '../types/index.ts';

interface NavbarProps {
  settings: TerminalSettings;
  onOpenSettings: () => void;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenSettings,
  onToggleSound,
}) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[#07090D]/92 backdrop-blur-md border-b border-[#273142] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-[#E8EDF4] hover:text-[#8DFF9B] transition-colors whitespace-nowrap shrink-0 group"
        >
          <div className="w-8 h-8 rounded border border-[#29F06B]/40 bg-[#0D1118] flex items-center justify-center text-[#8DFF9B] shadow-[0_0_14px_rgba(41,240,107,0.25)] group-hover:border-[#29F06B] transition-colors">
            <Terminal className="w-4 h-4" />
          </div>
          <span className="font-mono">The Last Commit</span>
        </Link>

        {/* Zone 2: Nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#929DAD]">
          <Link
            to="/session"
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#E8EDF4] ${
              isActive('/session') ? 'text-[#8DFF9B] font-semibold' : ''
            }`}
          >
            Workspace
          </Link>
          <Link
            to="/terminal"
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#E8EDF4] flex items-center gap-1.5 ${
              isActive('/terminal') ? 'text-[#8DFF9B] font-semibold' : ''
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-[#29F06B]" />
            <span>Matrix Terminal</span>
          </Link>
          <Link
            to="/archive"
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#E8EDF4] ${
              isActive('/archive') ? 'text-[#8DFF9B] font-semibold' : ''
            }`}
          >
            Archive
          </Link>
          <Link
            to="/about"
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#E8EDF4] ${
              isActive('/about') ? 'text-[#8DFF9B] font-semibold' : ''
            }`}
          >
            Open AI & Privacy
          </Link>
        </nav>

        {/* Zone 3: Primary action + Engine Calibration & Audio */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleSound}
            title={settings.soundEnabled ? 'Mute Ambient Drone' : 'Unmute Ambient Room Drone'}
            className="p-2 text-xs font-mono rounded border border-[#273142] bg-[#0D1118] text-[#929DAD] hover:text-[#29F06B] hover:border-[#29F06B]/40 transition-colors shrink-0"
            aria-label="Toggle Ambient Audio"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#29F06B]" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            title="Configure Display & Performance Engine"
            className="p-2 text-xs font-mono rounded border border-[#273142] bg-[#0D1118] text-[#929DAD] hover:text-[#70E8F2] hover:border-[#70E8F2]/40 transition-colors shrink-0 flex items-center gap-1.5"
            aria-label="Open Terminal Calibration"
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-mono">{settings.fpsCap.toUpperCase()}</span>
          </button>

          <Link
            to="/session"
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded bg-[#29F06B] text-[#07090D] hover:bg-[#8DFF9B] transition-colors whitespace-nowrap shrink-0 shadow-[0_0_16px_rgba(41,240,107,0.3)] flex items-center gap-1.5"
          >
            <span>Begin a Séance</span>
          </Link>
        </div>
      </div>

      {/* Mobile Nav row */}
      <div className="md:hidden flex items-center justify-around border-t border-[#273142] py-2 px-3 bg-[#0D1118]/85 text-xs text-[#929DAD]">
        <Link
          to="/"
          className={`hover:text-[#E8EDF4] ${isActive('/') ? 'text-[#8DFF9B] font-semibold' : ''}`}
        >
          Home
        </Link>
        <Link
          to="/terminal"
          className={`hover:text-[#E8EDF4] ${isActive('/terminal') ? 'text-[#8DFF9B] font-semibold' : ''}`}
        >
          Matrix
        </Link>
        <Link
          to="/session"
          className={`hover:text-[#E8EDF4] ${isActive('/session') ? 'text-[#8DFF9B] font-semibold' : ''}`}
        >
          Workspace
        </Link>
        <Link
          to="/archive"
          className={`hover:text-[#E8EDF4] ${isActive('/archive') ? 'text-[#8DFF9B] font-semibold' : ''}`}
        >
          Archive
        </Link>
        <Link
          to="/about"
          className={`hover:text-[#E8EDF4] ${isActive('/about') ? 'text-[#8DFF9B] font-semibold' : ''}`}
        >
          About
        </Link>
      </div>
    </header>
  );
};
