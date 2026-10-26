/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { CrtAtmosphere } from './components/CrtAtmosphere.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { SessionPage } from './pages/SessionPage.tsx';
import { ArchivePage } from './pages/ArchivePage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { MatrixTerminalPage } from './pages/MatrixTerminalPage.tsx';
import type { TerminalSettings } from './types/index.ts';
import {
  getTerminalSettings,
  saveTerminalSettings,
} from './utils/storage.ts';
import { ambientAudio } from './utils/ambientAudio.ts';

export default function App() {
  const [settings, setSettings] = useState<TerminalSettings>(() => getTerminalSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Sync ambient audio engine with soundEnabled & volume settings
  useEffect(() => {
    if (settings.soundEnabled) {
      ambientAudio.start(settings.soundVolume);
    } else {
      ambientAudio.stop();
    }
  }, [settings.soundEnabled, settings.soundVolume]);

  const handleUpdateSettings = (newSettings: TerminalSettings) => {
    setSettings(newSettings);
    saveTerminalSettings(newSettings);
  };

  const handleToggleSound = () => {
    const nextSound = !settings.soundEnabled;
    const updated = {
      ...settings,
      soundEnabled: nextSound,
    };
    handleUpdateSettings(updated);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#07090D] text-[#E8EDF4] flex flex-col font-sans selection:bg-[#29F06B]/30 selection:text-[#8DFF9B]">
        {/* Atmospheric CRT scanline and vignette overlay */}
        <CrtAtmosphere
          enabled={settings.crtScanlines}
          reducedEffects={settings.reducedEffects}
        />

        {/* Global 3-Zone Navigation */}
        <Navbar
          settings={settings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleSound={handleToggleSound}
        />

        {/* Main Routed Content */}
        <main className="flex-1 flex flex-col relative z-10">
          <Routes>
            <Route path="/" element={<LandingPage settings={settings} />} />
            <Route
              path="/terminal"
              element={
                <MatrixTerminalPage
                  settings={settings}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onToggleSound={handleToggleSound}
                />
              }
            />
            <Route path="/session" element={<SessionPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Clean Footer */}
        <Footer />

        {/* Global Engine Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      </div>
    </BrowserRouter>
  );
}
