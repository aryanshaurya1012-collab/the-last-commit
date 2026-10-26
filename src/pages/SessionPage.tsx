import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  Terminal,
  Sparkles,
  ShieldAlert,
  Code2,
  Copy,
  Check,
  Download,
  Bookmark,
  RefreshCw,
  AlertTriangle,
  FileCode,
  Info,
  ChevronRight,
  Send,
  Zap,
} from 'lucide-react';
import type { AnalysisMode, AnalysisResult } from '../types/index.ts';
import { SAMPLE_SNIPPETS } from '../data/samples.ts';
import { saveResultToArchive } from '../utils/storage.ts';
import { generateMarkdownReport, downloadMarkdownFile } from '../utils/markdownExport.ts';

const SUPPORTED_LANGUAGES = [
  'Auto-detect',
  'JavaScript',
  'TypeScript',
  'Python',
  'PHP',
  'Java',
  'C',
  'C++',
  'SQL',
  'COBOL',
  'HTML/CSS',
];

const LOADING_STATUSES = [
  'Reading the archival traces...',
  'Probing syntax and memory leaks...',
  'Consulting the ghost in the machine...',
  'Reconstructing lost semantics with Gemma 4...',
  'Formulating archaeology report...',
];

export const SessionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Form Inputs
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('Auto-detect');
  const [mode, setMode] = useState<AnalysisMode>('seance');
  const [title, setTitle] = useState<string>('');
  const [context, setContext] = useState<string>('');

  // Execution State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [canUseSampleFallback, setCanUseSampleFallback] = useState<boolean>(false);

  // Result State
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'overview' | 'findings' | 'modernized' | 'tests'>('overview');
  const [hasCopiedReport, setHasCopiedReport] = useState<boolean>(false);
  const [hasCopiedCode, setHasCopiedCode] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Check URL params and router state for quick snippet loading
  useEffect(() => {
    // 1. Check router state (e.g. from Code Graveyard)
    if (location.state && typeof location.state === 'object') {
      const stateObj = location.state as any;
      if (stateObj.code) setCode(stateObj.code);
      if (stateObj.language) setLanguage(stateObj.language);
      if (stateObj.title) setTitle(stateObj.title);
      if (stateObj.context) setContext(stateObj.context);
      setError(null);
      return;
    }

    // 2. Check searchParams (e.g. ?sample=jquery-dom)
    const sampleParam = searchParams.get('sample');
    if (sampleParam) {
      const match = SAMPLE_SNIPPETS.find(s => s.id === sampleParam);
      if (match) {
        setCode(match.code);
        setLanguage(match.language);
        setTitle(match.title);
        setResult(match.sampleResult);
        setMode(match.sampleResult.mode);
        setError(null);
      }
    }
  }, [searchParams, location.state]);

  // Loading animation stepper
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % LOADING_STATUSES.length);
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_SNIPPETS.find(s => s.id === sampleId);
    if (!sample) return;
    setCode(sample.code);
    setLanguage(sample.language);
    setTitle(sample.title);
    setError(null);
  };

  const handleSummonGhost = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!code || code.trim().length === 0) {
      setError('Please provide code to analyze. You can paste a snippet or pick a sample above.');
      return;
    }

    if (code.length > 50000) {
      setError('Code snippet exceeds the maximum limit of 50,000 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCanUseSampleFallback(false);
    setSavedSuccess(false);

    try {
      const response = await fetch('/api/analyze-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          mode,
          context: context.trim() || undefined,
          title: title.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Server rejected archaeology analysis.');
      }

      setResult(data.data);
      // Auto-switch tab based on mode
      if (mode === 'autopsy') {
        setActiveResultTab('findings');
      } else if (mode === 'resurrection') {
        setActiveResultTab('modernized');
      } else {
        setActiveResultTab('overview');
      }

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(err.message || 'Communication with the AI model failed.');
      setCanUseSampleFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFallbackToSample = () => {
    // Find closest language sample or default to jQuery
    const match = SAMPLE_SNIPPETS.find(s => s.language.toLowerCase() === language.toLowerCase()) || SAMPLE_SNIPPETS[0];
    setCode(match.code);
    setLanguage(match.language);
    setTitle(match.title);
    setResult(match.sampleResult);
    setMode(match.sampleResult.mode);
    setError(null);
    setCanUseSampleFallback(false);
  };

  const handleCopyReport = async () => {
    if (!result) return;
    const report = generateMarkdownReport(result);
    await navigator.clipboard.writeText(report);
    setHasCopiedReport(true);
    setTimeout(() => setHasCopiedReport(false), 2000);
  };

  const handleCopyModernizedCode = async () => {
    if (!result?.modernizedCode) return;
    await navigator.clipboard.writeText(result.modernizedCode);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2000);
  };

  const handleDownloadReport = () => {
    if (!result) return;
    const report = generateMarkdownReport(result);
    const sanitizedTitle = result.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    downloadMarkdownFile(`the-last-commit-${sanitizedTitle || 'analysis'}.md`, report);
  };

  const handleSaveToArchive = () => {
    if (!result) return;
    const success = saveResultToArchive(result);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      {/* Workspace Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#293140] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8DFF9B] mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>SESSION_WORKSPACE // HOSTED_INFERENCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#E7EAF0]">
            The Code Séance
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA3B2] mt-0.5">
            Submit legacy code to summon Gemma 4. Static text analysis only—code is never executed.
          </p>
        </div>

        {/* Quick Sample Selector Bar */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          <span className="text-xs text-[#9AA3B2] mr-1 hidden lg:inline">Quick Samples:</span>
          {SAMPLE_SNIPPETS.map(sample => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample.id)}
              className="px-2.5 py-1 text-xs font-mono rounded border border-[#293140] bg-[#121620] text-[#9AA3B2] hover:text-[#75E5E8] hover:border-[#75E5E8]/40 transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Grid: Controls + Editor */}
      <form onSubmit={handleSummonGhost} className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        {/* Left Column: Analysis Configuration (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Analysis Mode Selector */}
          <div className="p-4 rounded border border-[#293140] bg-[#121620]">
            <label className="block text-xs font-mono text-[#8DFF9B] uppercase mb-3">
              1. Select Archaeology Ritual
            </label>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setMode('seance')}
                className={`w-full text-left p-3 rounded border transition-all flex items-start gap-3 ${
                  mode === 'seance'
                    ? 'border-[#A78BFA] bg-[#A78BFA]/10 text-[#E7EAF0]'
                    : 'border-[#293140] bg-[#090B10]/60 text-[#9AA3B2] hover:border-[#293140]/80 hover:text-[#E7EAF0]'
                }`}
              >
                <Sparkles className={`w-4 h-4 mt-0.5 shrink-0 ${mode === 'seance' ? 'text-[#A78BFA]' : 'text-[#9AA3B2]'}`} />
                <div>
                  <div className="text-xs font-semibold text-[#E7EAF0]">Séance Mode</div>
                  <div className="text-[11px] text-[#9AA3B2] leading-tight mt-0.5">
                    Fictional ghost whisper + technical explanation + assumptions.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('autopsy')}
                className={`w-full text-left p-3 rounded border transition-all flex items-start gap-3 ${
                  mode === 'autopsy'
                    ? 'border-[#F2B46D] bg-[#F2B46D]/10 text-[#E7EAF0]'
                    : 'border-[#293140] bg-[#090B10]/60 text-[#9AA3B2] hover:border-[#293140]/80 hover:text-[#E7EAF0]'
                }`}
              >
                <ShieldAlert className={`w-4 h-4 mt-0.5 shrink-0 ${mode === 'autopsy' ? 'text-[#F2B46D]' : 'text-[#9AA3B2]'}`} />
                <div>
                  <div className="text-xs font-semibold text-[#E7EAF0]">Autopsy Mode</div>
                  <div className="text-[11px] text-[#9AA3B2] leading-tight mt-0.5">
                    Potential bugs, security holes, deprecated APIs & gaps.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('resurrection')}
                className={`w-full text-left p-3 rounded border transition-all flex items-start gap-3 ${
                  mode === 'resurrection'
                    ? 'border-[#75E5E8] bg-[#75E5E8]/10 text-[#E7EAF0]'
                    : 'border-[#293140] bg-[#090B10]/60 text-[#9AA3B2] hover:border-[#293140]/80 hover:text-[#E7EAF0]'
                }`}
              >
                <Code2 className={`w-4 h-4 mt-0.5 shrink-0 ${mode === 'resurrection' ? 'text-[#75E5E8]' : 'text-[#9AA3B2]'}`} />
                <div>
                  <div className="text-xs font-semibold text-[#E7EAF0]">Resurrection Mode</div>
                  <div className="text-[11px] text-[#9AA3B2] leading-tight mt-0.5">
                    Modernized replacement code, migration guide & test cases.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Language & Metadata */}
          <div className="p-4 rounded border border-[#293140] bg-[#121620] space-y-4">
            <div>
              <label htmlFor="language-select" className="block text-xs font-mono text-[#9AA3B2] uppercase mb-1.5">
                Target Language
              </label>
              <select
                id="language-select"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded border border-[#293140] bg-[#090B10] text-[#E7EAF0] focus:outline-none focus:border-[#38B86B]"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="snippet-title" className="block text-xs font-mono text-[#9AA3B2] uppercase mb-1.5">
                Snippet Title (Optional)
              </label>
              <input
                id="snippet-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Legacy Customer Parser"
                className="w-full px-3 py-2 text-xs rounded border border-[#293140] bg-[#090B10] text-[#E7EAF0] placeholder-[#9AA3B2]/40 focus:outline-none focus:border-[#38B86B]"
              />
            </div>

            <div>
              <label htmlFor="snippet-context" className="block text-xs font-mono text-[#9AA3B2] uppercase mb-1.5">
                Context / Rumors (Optional)
              </label>
              <textarea
                id="snippet-context"
                value={context}
                onChange={e => setContext(e.target.value)}
                rows={2}
                placeholder="e.g. Found in a 2011 repository, handles authentication cookies..."
                className="w-full px-3 py-2 text-xs rounded border border-[#293140] bg-[#090B10] text-[#E7EAF0] placeholder-[#9AA3B2]/40 focus:outline-none focus:border-[#38B86B] resize-none"
              />
            </div>
          </div>

          {/* Summon Button */}
          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className={`w-full py-3.5 px-4 rounded text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              isLoading || !code.trim()
                ? 'bg-[#181E2C] text-[#9AA3B2] border border-[#293140] cursor-not-allowed'
                : 'bg-[#38B86B] text-[#090B10] hover:bg-[#8DFF9B] shadow-[0_0_20px_rgba(56,184,107,0.35)]'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#090B10]" />
                <span>Séance In Progress...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Summon the Ghost</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Code Editor (8 cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="rounded border border-[#293140] bg-[#090B10] flex-1 flex flex-col shadow-inner overflow-hidden">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#121620] border-b border-[#293140] text-xs font-mono text-[#9AA3B2]">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#75E5E8]" />
                <span className="text-[#E7EAF0] font-medium">SNIPPET_BUFFER</span>
                <span className="text-[#9AA3B2]">({language})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] tabular-nums">
                  {code.length} / 50,000 chars
                </span>
                {code.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCode('')}
                    className="hover:text-[#F2B46D] transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Editor Textarea with Line Numbers aesthetic */}
            <div className="relative flex-1 min-h-[360px] bg-[#090B10]">
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="// Paste unfamiliar legacy code here...&#10;// JavaScript, PHP, Python, COBOL, SQL, Java, C/C++...&#10;// Click 'Summon the Ghost' to conduct a séance."
                spellCheck={false}
                className="w-full h-full min-h-[360px] p-4 bg-transparent text-[#E7EAF0] font-mono text-xs sm:text-sm leading-relaxed placeholder-[#9AA3B2]/30 focus:outline-none resize-y selection:bg-[#38B86B]/30"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Loading Modal / In-Flight Animation */}
      {isLoading && (
        <div className="my-8 p-8 rounded border border-[#38B86B]/40 bg-[#121620] shadow-[0_0_32px_rgba(56,184,107,0.15)] text-center max-w-xl mx-auto flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border border-[#38B86B] bg-[#38B86B]/10 flex items-center justify-center text-[#8DFF9B] mb-4 relative">
            <Sparkles className="w-6 h-6 animate-pulse" />
            <span className="absolute inset-0 rounded-full border border-[#8DFF9B] animate-ping opacity-25" />
          </div>

          <div className="text-xs font-mono text-[#8DFF9B] mb-2">SÉANCE ACTIVATED // COMMUNICATING WITH GEMMA 4</div>
          <p className="text-sm font-medium text-[#E7EAF0] mb-4 font-mono">
            {LOADING_STATUSES[loadingStep]}
          </p>

          <div className="w-full bg-[#090B10] h-1.5 rounded-full overflow-hidden border border-[#293140]">
            <div
              className="bg-gradient-to-r from-[#38B86B] via-[#75E5E8] to-[#A78BFA] h-full transition-all duration-300"
              style={{ width: `${((loadingStep + 1) / LOADING_STATUSES.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Banner with Graceful Fallback Option */}
      {error && !isLoading && (
        <div className="my-6 p-4 rounded border border-[#F2B46D]/50 bg-[#F2B46D]/10 text-xs text-[#E7EAF0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#F2B46D] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#F2B46D] font-mono">Investigation Notice</div>
              <p className="text-[#9AA3B2] mt-0.5">{error}</p>
            </div>
          </div>

          {canUseSampleFallback && (
            <button
              type="button"
              onClick={handleFallbackToSample}
              className="px-3 py-1.5 rounded font-mono text-xs font-medium bg-[#121620] border border-[#75E5E8]/40 text-[#75E5E8] hover:bg-[#75E5E8]/10 transition-colors whitespace-nowrap shrink-0"
            >
              Explore Archival Sample Instead
            </button>
          )}
        </div>
      )}

      {/* Analysis Results View */}
      {result && !isLoading && (
        <div ref={resultsRef} className="pt-4 pb-16">
          <div className="rounded border border-[#293140] bg-[#121620] shadow-[0_12px_40px_rgba(0,0,0,0.4)] overflow-hidden">
            {/* Header: Title, Tags & Action Buttons */}
            <div className="p-5 bg-[#0D1017] border-b border-[#293140] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#9AA3B2] mb-1.5">
                  <span className="text-[#8DFF9B] font-semibold">{result.language}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{result.mode} Mode</span>
                  <span aria-hidden="true">·</span>
                  <span>Confidence: {result.confidence.toUpperCase()}</span>
                  <span aria-hidden="true">·</span>
                  <span>{result.modelUsed}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#E7EAF0]">
                  {result.title}
                </h2>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveToArchive}
                  className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors flex items-center gap-1.5 ${
                    savedSuccess
                      ? 'border-[#38B86B] bg-[#38B86B]/20 text-[#8DFF9B]'
                      : 'border-[#293140] bg-[#121620] text-[#9AA3B2] hover:text-[#E7EAF0] hover:border-[#9AA3B2]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{savedSuccess ? 'Saved to Archive' : 'Save Session'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="px-3 py-1.5 text-xs font-mono rounded border border-[#293140] bg-[#121620] text-[#9AA3B2] hover:text-[#E7EAF0] hover:border-[#9AA3B2] transition-colors flex items-center gap-1.5"
                >
                  {hasCopiedReport ? <Check className="w-3.5 h-3.5 text-[#8DFF9B]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{hasCopiedReport ? 'Report Copied' : 'Copy Report'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="px-3 py-1.5 text-xs font-mono rounded border border-[#293140] bg-[#121620] text-[#9AA3B2] hover:text-[#75E5E8] hover:border-[#75E5E8]/40 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#75E5E8]" />
                  <span>Export .MD</span>
                </button>
              </div>
            </div>

            {/* Sample Demonstration Notice */}
            {result.isSample && (
              <div className="px-5 py-2.5 bg-[#75E5E8]/10 border-b border-[#75E5E8]/20 flex items-center gap-2 text-xs text-[#75E5E8] font-mono">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Archival Demonstration Sample — This analysis illustrates verified findings and modernization patterns.
                </span>
              </div>
            )}

            {/* Ghost Whisper Card (Atmospheric Storytelling) */}
            {result.ghostWhisper && (
              <div className="p-5 sm:p-6 bg-gradient-to-r from-[#A78BFA]/10 via-[#121620] to-[#121620] border-b border-[#293140] relative">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded border border-[#A78BFA]/40 bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA] shrink-0 mt-0.5 shadow-[0_0_12px_rgba(167,139,250,0.3)]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#A78BFA] mb-1">THE GHOST'S WHISPER</div>
                    <blockquote className="text-sm sm:text-base italic text-[#E7EAF0] leading-relaxed font-serif">
                      {result.ghostWhisper}
                    </blockquote>
                  </div>
                </div>
              </div>
            )}

            {/* Result Navigation Tabs */}
            <div className="flex border-b border-[#293140] bg-[#090B10]/80 px-4 gap-2 overflow-x-auto text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveResultTab('overview')}
                className={`py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeResultTab === 'overview'
                    ? 'border-[#8DFF9B] text-[#8DFF9B]'
                    : 'border-transparent text-[#9AA3B2] hover:text-[#E7EAF0]'
                }`}
              >
                Overview & Architecture
              </button>

              <button
                type="button"
                onClick={() => setActiveResultTab('findings')}
                className={`py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeResultTab === 'findings'
                    ? 'border-[#F2B46D] text-[#F2B46D]'
                    : 'border-transparent text-[#9AA3B2] hover:text-[#E7EAF0]'
                }`}
              >
                <span>Autopsy Findings</span>
                {result.findings && result.findings.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-[#F2B46D]/20 text-[#F2B46D] rounded text-[10px]">
                    {result.findings.length}
                  </span>
                )}
              </button>

              {result.modernizedCode && (
                <button
                  type="button"
                  onClick={() => setActiveResultTab('modernized')}
                  className={`py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeResultTab === 'modernized'
                      ? 'border-[#75E5E8] text-[#75E5E8]'
                      : 'border-transparent text-[#9AA3B2] hover:text-[#E7EAF0]'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Resurrected Code</span>
                </button>
              )}

              {result.suggestedTests && result.suggestedTests.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveResultTab('tests')}
                  className={`py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    activeResultTab === 'tests'
                      ? 'border-[#8DFF9B] text-[#8DFF9B]'
                      : 'border-transparent text-[#9AA3B2] hover:text-[#E7EAF0]'
                  }`}
                >
                  Recommended Tests ({result.suggestedTests.length})
                </button>
              )}
            </div>

            {/* Tab Contents */}
            <div className="p-6">
              {/* Tab 1: Overview */}
              {activeResultTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-mono text-[#8DFF9B] uppercase mb-2">Technical Summary</h3>
                    <p className="text-sm text-[#E7EAF0] leading-relaxed">
                      {result.summary}
                    </p>
                  </div>

                  {result.explanations && result.explanations.length > 0 && (
                    <div className="pt-4 border-t border-[#293140]/60">
                      <h3 className="text-xs font-mono text-[#75E5E8] uppercase mb-3">
                        Key Behaviors & Architectural Observations
                      </h3>
                      <ul className="space-y-2">
                        {result.explanations.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#E7EAF0]">
                            <ChevronRight className="w-3.5 h-3.5 text-[#38B86B] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.caveats && result.caveats.length > 0 && (
                    <div className="pt-4 border-t border-[#293140]/60">
                      <h3 className="text-xs font-mono text-[#F2B46D] uppercase mb-3">
                        Missing Context & Runtime Assumptions
                      </h3>
                      <ul className="space-y-2">
                        {result.caveats.map((cav, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#9AA3B2]">
                            <span className="text-[#F2B46D] shrink-0">⚠️</span>
                            <span>{cav}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Autopsy Findings */}
              {activeResultTab === 'findings' && (
                <div className="space-y-4">
                  {!result.findings || result.findings.length === 0 ? (
                    <div className="text-center py-8 text-[#9AA3B2] text-sm">
                      No explicit high-risk vulnerabilities or fatal anomalies detected in this snippet.
                    </div>
                  ) : (
                    result.findings.map((finding, idx) => {
                      const severityColors = {
                        high: 'border-[#F87171]/40 bg-[#F87171]/5 text-[#F87171]',
                        medium: 'border-[#F2B46D]/40 bg-[#F2B46D]/5 text-[#F2B46D]',
                        low: 'border-[#75E5E8]/40 bg-[#75E5E8]/5 text-[#75E5E8]',
                        informational: 'border-[#9AA3B2]/40 bg-[#9AA3B2]/5 text-[#9AA3B2]',
                      }[finding.severity];

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded border border-[#293140] bg-[#090B10]/70 flex flex-col gap-2.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold text-sm text-[#E7EAF0]">
                              {idx + 1}. {finding.title}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${severityColors}`}>
                              {finding.severity}
                            </span>
                          </div>

                          {finding.excerpt && (
                            <pre className="p-2.5 rounded bg-[#121620] border border-[#293140]/80 text-xs font-mono text-[#8DFF9B] overflow-x-auto">
                              <code>{finding.excerpt}</code>
                            </pre>
                          )}

                          <p className="text-xs sm:text-sm text-[#9AA3B2] leading-relaxed">
                            {finding.description}
                          </p>

                          {finding.remediation && (
                            <div className="mt-1 pt-2 border-t border-[#293140]/50 text-xs text-[#75E5E8]">
                              <span className="font-mono font-medium text-[#8DFF9B]">Remediation: </span>
                              <span>{finding.remediation}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Tab 3: Resurrected Code */}
              {activeResultTab === 'modernized' && result.modernizedCode && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#75E5E8]">
                      PROPOSED MODERNIZED IMPLEMENTATION
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyModernizedCode}
                      className="px-3 py-1 text-xs font-mono rounded border border-[#293140] bg-[#090B10] text-[#9AA3B2] hover:text-[#8DFF9B] hover:border-[#8DFF9B]/40 transition-colors flex items-center gap-1.5"
                    >
                      {hasCopiedCode ? <Check className="w-3.5 h-3.5 text-[#8DFF9B]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{hasCopiedCode ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <pre className="p-4 rounded border border-[#293140] bg-[#090B10] text-xs sm:text-sm font-mono text-[#E7EAF0] overflow-x-auto leading-relaxed">
                    <code>{result.modernizedCode}</code>
                  </pre>

                  {result.explanations && result.explanations.length > 0 && (
                    <div className="p-4 rounded border border-[#293140] bg-[#121620]">
                      <h4 className="text-xs font-mono text-[#8DFF9B] mb-2 uppercase">Why these changes were made:</h4>
                      <ul className="space-y-1.5 text-xs text-[#9AA3B2]">
                        {result.explanations.map((exp, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#38B86B]">·</span>
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Recommended Tests */}
              {activeResultTab === 'tests' && result.suggestedTests && (
                <div className="space-y-3">
                  <div className="text-xs text-[#9AA3B2]">
                    Run these test cases to verify backward compatibility before replacing the original implementation in production:
                  </div>
                  <div className="space-y-2">
                    {result.suggestedTests.map((testCase, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded border border-[#293140] bg-[#090B10] flex items-start gap-3 text-xs sm:text-sm text-[#E7EAF0]"
                      >
                        <div className="w-5 h-5 rounded border border-[#38B86B]/40 bg-[#38B86B]/10 flex items-center justify-center text-[#8DFF9B] text-xs font-mono shrink-0">
                          {idx + 1}
                        </div>
                        <span className="leading-relaxed">{testCase}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
