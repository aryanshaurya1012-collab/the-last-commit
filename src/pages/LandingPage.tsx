import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, ShieldAlert, Sparkles, ArrowRight, Code2, Radio, Play, ExternalLink } from 'lucide-react';
import { MatrixCanvas } from '../components/MatrixCanvas.tsx';
import type { TerminalSettings } from '../types/index.ts';
import { SAMPLE_SNIPPETS } from '../data/samples.ts';

interface LandingPageProps {
  settings: TerminalSettings;
}

export const LandingPage: React.FC<LandingPageProps> = ({ settings }) => {
  const navigate = useNavigate();
  const [activeSnippetIdx, setActiveSnippetIdx] = useState<number>(0);
  const activeSnippet = SAMPLE_SNIPPETS[activeSnippetIdx];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] relative page-transition">
      {/* Background Matrix Rain Field */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <MatrixCanvas
          mode="matrix"
          settings={{
            ...settings,
            density: 0.8,
            speed: 0.7,
            brightness: 0.7,
          }}
          interactive={false}
          opacity={0.16}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090D]/50 via-[#07090D]/80 to-[#07090D]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Status Display Kicker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-6 text-xs font-mono rounded border border-[#273142] bg-[#0D1118]/90 text-[#8DFF9B] shadow-[0_0_12px_rgba(41,240,107,0.15)] animate-glitch">
            <span className="w-2 h-2 rounded-full bg-[#F06F73] animate-pulse" />
            <span className="text-[#F06F73] font-semibold">ARCHIVE STATUS: UNSTABLE</span>
            <span className="text-[#273142]">|</span>
            <span className="text-[#929DAD]">SECTOR // 7F</span>
          </div>

          {/* Title with subtle glitch effect */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#E8EDF4] font-mono [text-wrap:balance] leading-[1.08] mb-4">
            THE LAST COMMIT<span className="text-[#29F06B] cursor-blink">_</span>
          </h1>

          {/* Tagline */}
          <p className="text-base sm:text-xl text-[#8DFF9B] font-serif italic max-w-2xl mx-auto [text-wrap:balance] mb-4 glow-phosphor">
            “Every codebase leaves a trace. Some refuse to disappear.”
          </p>

          <p className="text-xs sm:text-base text-[#929DAD] max-w-2xl mx-auto [text-wrap:balance] leading-relaxed mb-8">
            Summon an open-weight AI code archaeologist to explain forgotten legacy routines,
            investigate dormant vulnerabilities, and resurrect abandoned software.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <Link
              to="/session"
              className="w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base font-semibold font-mono rounded bg-[#29F06B] text-[#07090D] hover:bg-[#8DFF9B] transition-all whitespace-nowrap shadow-[0_0_24px_rgba(41,240,107,0.35)] flex items-center justify-center gap-2"
            >
              <span>ENTER THE TERMINAL</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/terminal"
              className="w-full sm:w-auto px-6 py-3.5 text-sm sm:text-base font-mono font-medium rounded border border-[#273142] bg-[#0D1118] text-[#70E8F2] hover:border-[#70E8F2]/60 hover:bg-[#141A24] transition-all whitespace-nowrap flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4 text-[#70E8F2]" />
              <span>THE FORGOTTEN SYSTEM</span>
            </Link>
          </div>

          {/* Secondary Subtext with Gemma AI Indicator */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#929DAD] font-mono">
            <span>Powered by Google Gemma 4 (gemma-4-26b-a4b-it)</span>
            <span aria-hidden="true">·</span>
            <Link to="/archive" className="text-[#929DAD] hover:text-[#8DFF9B] underline decoration-[#273142]">
              View Archive
            </Link>
          </div>
        </div>
      </section>

      {/* Terminal Live Preview Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="rounded border border-[#273142] bg-[#0D1118] shadow-[0_12px_48px_rgba(0,0,0,0.7)] overflow-hidden">
            {/* Terminal Title Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#07090D] border-b border-[#273142] text-xs font-mono text-[#929DAD]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#273142]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#273142]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#273142]" />
                <span className="ml-2 text-[#E8EDF4]">SEANCE_CRT_TERMINAL // GEMMA-4-OPEN-WEIGHT</span>
              </div>
              <div className="flex items-center gap-2 text-[#8DFF9B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#29F06B] animate-pulse" />
                <span>INFERENCE: ACTIVE</span>
              </div>
            </div>

            {/* Split Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#273142]">
              {/* Left Column: Code Sample */}
              <div className="lg:col-span-6 p-5 flex flex-col justify-between bg-[#07090D]/80">
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs font-mono text-[#929DAD]">
                    <span className="text-[#70E8F2]">EXAMINED SOURCE BUFFER</span>
                    <span>{activeSnippet.language}</span>
                  </div>
                  <pre className="p-3.5 rounded bg-[#07090D] border border-[#273142] text-xs font-mono text-[#E8EDF4] overflow-x-auto max-h-64 leading-relaxed">
                    <code>{activeSnippet.code}</code>
                  </pre>
                </div>

                <div className="mt-4 pt-3 border-t border-[#273142] flex items-center justify-between">
                  <span className="text-xs text-[#929DAD] font-mono">Select archival snippet:</span>
                  <div className="flex gap-1.5">
                    {SAMPLE_SNIPPETS.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setActiveSnippetIdx(idx)}
                        className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                          activeSnippetIdx === idx
                            ? 'bg-[#29F06B]/20 text-[#8DFF9B] border border-[#29F06B]/50'
                            : 'bg-[#0D1118] text-[#929DAD] border border-[#273142] hover:text-[#E8EDF4]'
                        }`}
                      >
                        {s.language}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Ghost Findings */}
              <div className="lg:col-span-6 p-5 flex flex-col justify-between bg-[#0D1118]">
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs font-mono">
                    <span className="text-[#A78BFA] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      SPECTRAL RECONSTRUCTION
                    </span>
                    <span className="text-[#F0B76D]">SEVERITY: HIGH</span>
                  </div>

                  {/* Ghost Whisper Quote */}
                  <div className="p-3.5 rounded border border-[#A78BFA]/30 bg-[#A78BFA]/5 mb-4">
                    <p className="text-xs italic text-[#A78BFA] leading-relaxed font-serif">
                      {activeSnippet.sampleResult.ghostWhisper}
                    </p>
                  </div>

                  {/* Findings */}
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-[#929DAD] mb-1">AUTOPSY FINDINGS:</div>
                    {activeSnippet.sampleResult.findings?.slice(0, 2).map((f, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded border border-[#273142] bg-[#07090D] text-xs flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-[#E8EDF4] font-medium">{f.title}</span>
                          <span className="text-[#F0B76D] uppercase text-[10px]">[{f.severity}]</span>
                        </div>
                        <p className="text-[#929DAD] text-[11px] leading-normal">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#273142] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#929DAD] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8DFF9B] animate-pulse" />
                    <span>Archival trace verified</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/session?sample=${activeSnippet.id}`)}
                    className="px-3.5 py-1.5 text-xs font-mono font-medium rounded bg-[#70E8F2]/10 text-[#70E8F2] border border-[#70E8F2]/40 hover:bg-[#70E8F2]/20 transition-colors flex items-center gap-1"
                  >
                    <span>Summon Ghost in Workspace</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Playable Matrix Mini-Experience Callout Card */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
        <div className="max-w-5xl mx-auto rounded border border-[#29F06B]/40 bg-[#0D1118] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_36px_rgba(41,240,107,0.12)]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#8DFF9B]">
              <Radio className="w-4 h-4 animate-pulse text-[#29F06B]" />
              <span>INTERACTIVE EXPERIENCE AVAILABLE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-[#E8EDF4]">
              The Forgotten System: Playable Matrix Terminal
            </h2>
            <p className="text-xs sm:text-sm text-[#929DAD] max-w-xl leading-relaxed">
              Step into an interactive CRT canvas with physical ripples, atmospheric ghost signals, and a code graveyard of ancient recovered fragments.
            </p>
          </div>

          <Link
            to="/terminal"
            className="px-6 py-3 rounded font-mono text-xs font-semibold bg-[#29F06B] text-[#07090D] hover:bg-[#8DFF9B] transition-colors whitespace-nowrap shadow-[0_0_16px_rgba(41,240,107,0.3)] flex items-center gap-2 shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Matrix Experience</span>
          </Link>
        </div>
      </section>

      {/* 3 Rituals of Archaeology */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 border-t border-[#273142] bg-[#07090D]/90 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#E8EDF4] font-mono">
              Three Rituals of Code Archaeology
            </h2>
            <p className="mt-3 text-sm text-[#929DAD]">
              Grounded in technical reality, wrapped in the voice of forgotten software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded border border-[#273142] bg-[#0D1118] hover:border-[#8DFF9B]/40 transition-colors flex flex-col">
              <div className="w-10 h-10 rounded border border-[#29F06B]/30 bg-[#29F06B]/10 flex items-center justify-center text-[#8DFF9B] mb-5">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#E8EDF4] mb-2 font-mono">
                1. Listen to the Code's Story
              </h3>
              <p className="text-xs sm:text-sm text-[#929DAD] leading-relaxed mb-4 flex-1">
                Séance mode channels the legacy snippet’s fictional spirit. Hear an atmospheric explanation of what the routine was intended to do, alongside a disciplined technical breakdown of its architecture and missing environment dependencies.
              </p>
              <div className="text-xs font-mono text-[#8DFF9B]">MODE: SÉANCE</div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded border border-[#273142] bg-[#0D1118] hover:border-[#F0B76D]/40 transition-colors flex flex-col">
              <div className="w-10 h-10 rounded border border-[#F0B76D]/30 bg-[#F0B76D]/10 flex items-center justify-center text-[#F0B76D] mb-5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#E8EDF4] mb-2 font-mono">
                2. Investigate What Might Be Broken
              </h3>
              <p className="text-xs sm:text-sm text-[#929DAD] leading-relaxed mb-4 flex-1">
                Autopsy mode scrutinizes the code for deprecated APIs, security vulnerabilities (like SQL injection or raw DOM evaluation), concurrency races, and error-handling gaps—without hallucinating line numbers or false claims.
              </p>
              <div className="text-xs font-mono text-[#F0B76D]">MODE: AUTOPSY</div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded border border-[#273142] bg-[#0D1118] hover:border-[#70E8F2]/40 transition-colors flex flex-col">
              <div className="w-10 h-10 rounded border border-[#70E8F2]/30 bg-[#70E8F2]/10 flex items-center justify-center text-[#70E8F2] mb-5">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#E8EDF4] mb-2 font-mono">
                3. Give Forgotten Code a New Life
              </h3>
              <p className="text-xs sm:text-sm text-[#929DAD] leading-relaxed mb-4 flex-1">
                Resurrection mode produces modern, readable replacement code using current language idioms, type safety, and async patterns. It provides clear migration explanations and concrete unit tests to run before deployment.
              </p>
              <div className="text-xs font-mono text-[#70E8F2]">MODE: RESURRECTION</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
