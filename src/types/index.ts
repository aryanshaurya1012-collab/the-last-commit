/**
 * Types for The Last Commit - Open-Weight AI Code Archaeologist
 */

export type AnalysisMode = 'seance' | 'autopsy' | 'resurrection';

export type FindingSeverity = 'informational' | 'low' | 'medium' | 'high';

export interface Finding {
  title: string;
  severity: FindingSeverity;
  excerpt?: string;
  description: string;
  remediation?: string;
}

export interface AnalysisResult {
  id: string;
  title: string;
  timestamp: number;
  language: string;
  mode: AnalysisMode;
  originalCode: string;
  summary: string;
  ghostWhisper?: string;
  findings?: Finding[];
  modernizedCode?: string;
  explanations?: string[];
  caveats?: string[];
  suggestedTests?: string[];
  confidence: 'high' | 'medium' | 'low';
  isSample?: boolean;
  modelUsed?: string;
}

export interface AnalyzeCodeRequest {
  code: string;
  language?: string;
  mode: AnalysisMode;
  context?: string;
  title?: string;
}

export interface AnalyzeCodeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
  isFallback?: boolean;
}

export interface SampleSnippet {
  id: string;
  label: string;
  title: string;
  language: string;
  code: string;
  description: string;
  sampleResult: AnalysisResult;
}

export type MatrixTerminalMode = 'matrix' | 'ghost_signal' | 'graveyard';

export type FpsCap = 'auto' | '30' | '60' | '120' | '144';

export type MatrixColorTheme = 'matrix_green' | 'ghost_cyan' | 'spectral_violet' | 'amber_relic';

export interface TerminalSettings {
  speed: number;          // 0.5 - 3.0
  density: number;        // 0.5 - 2.0
  brightness: number;     // 0.4 - 1.5
  colorTheme: MatrixColorTheme;
  fpsCap: FpsCap;
  crtScanlines: boolean;
  reducedEffects: boolean;
  soundEnabled: boolean;
  soundVolume: number;    // 0.0 - 1.0
}

export interface GraveyardFragment {
  id: string;
  title: string;
  era: string;
  language: string;
  code: string;
  lore: string;
  hints: string;
}

export interface TerminalDiscoveryStats {
  signalsIntercepted: number;
  fragmentsFound: string[];
  ripplesTriggered: number;
}
