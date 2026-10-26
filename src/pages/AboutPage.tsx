import React from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  Shield,
  Database,
  Lock,
  ExternalLink,
  Code2,
  AlertTriangle,
  ArrowRight,
  Terminal,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-transition">
      {/* Header */}
      <div className="border-b border-[#293140] pb-6 mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-[#8DFF9B] mb-2">
          <Terminal className="w-3.5 h-3.5" />
          <span>MANIFESTO_AND_PRIVACY_SPEC</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#E7EAF0]">
          Open-Weight AI & Privacy Methodology
        </h1>
        <p className="text-sm sm:text-base text-[#9AA3B2] mt-2 leading-relaxed">
          How The Last Commit operates, why open weights matter for code archaeology, and our explicit data boundaries.
        </p>
      </div>

      <div className="space-y-12">
        {/* Section 1: The Model Architecture */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-[#8DFF9B]">
            <Cpu className="w-5 h-5" />
            <h2 className="text-xl font-bold text-[#E7EAF0]">
              1. Powered by Google Gemma 4
            </h2>
          </div>
          <p className="text-sm text-[#9AA3B2] leading-relaxed">
            The technical intelligence of The Last Commit is driven by{' '}
            <strong className="text-[#E7EAF0]">Google Gemma 4</strong> (specifically the{' '}
            <code className="text-[#8DFF9B] font-mono text-xs bg-[#121620] px-1.5 py-0.5 rounded border border-[#293140]">
              gemma-4-26b-a4b-it
            </code>{' '}
            instruction-tuned checkpoint). Gemma is Google’s state-of-the-art family of lightweight, open-weight models built from the same research and technology used to create Gemini.
          </p>
          <div className="p-4 rounded border border-[#293140] bg-[#121620] text-xs space-y-2">
            <div className="font-mono text-[#75E5E8] uppercase">Current Operational Setup:</div>
            <p className="text-[#9AA3B2] leading-relaxed">
              In this deployment, inference is served via Google’s hosted Gemini API gateway. We explicitly do <strong className="text-[#E7EAF0]">not</strong> claim the current instance runs offline on your local CPU/GPU. Pasted source code is transmitted to the hosted endpoint strictly to fulfill the archaeology request.
            </p>
          </div>
        </section>

        {/* Section 2: Why Open Weights Matter */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-[#75E5E8]">
            <Code2 className="w-5 h-5" />
            <h2 className="text-xl font-bold text-[#E7EAF0]">
              2. Why Open Weights Matter for Developers
            </h2>
          </div>
          <p className="text-sm text-[#9AA3B2] leading-relaxed">
            Proprietary developer tools create platform lock-in and opaque evaluation criteria. Open-weight models transform how software teams inspect and audit their systems:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded border border-[#293140] bg-[#121620]">
              <h3 className="text-xs font-mono font-semibold text-[#8DFF9B] mb-1">
                Inspectable & Verifiable
              </h3>
              <p className="text-xs text-[#9AA3B2] leading-relaxed">
                Developers can inspect published architecture, tokenizer logic, training checkpoints, and license specifications.
              </p>
            </div>
            <div className="p-4 rounded border border-[#293140] bg-[#121620]">
              <h3 className="text-xs font-mono font-semibold text-[#8DFF9B] mb-1">
                Local Self-Hosting Future
              </h3>
              <p className="text-xs text-[#9AA3B2] leading-relaxed">
                Because weights are open, teams can download and deploy Gemma on air-gapped on-premise infrastructure via Ollama, vLLM, or llama.cpp without API fees.
              </p>
            </div>
            <div className="p-4 rounded border border-[#293140] bg-[#121620]">
              <h3 className="text-xs font-mono font-semibold text-[#8DFF9B] mb-1">
                Adaptable Domain Prompts
              </h3>
              <p className="text-xs text-[#9AA3B2] leading-relaxed">
                Open-weight archaeology pipelines can be fine-tuned or customized for obscure legacy dialects (such as Fortran, COBOL, or proprietary internal frameworks).
              </p>
            </div>
            <div className="p-4 rounded border border-[#293140] bg-[#121620]">
              <h3 className="text-xs font-mono font-semibold text-[#8DFF9B] mb-1">
                Zero Vendor Lock-In
              </h3>
              <p className="text-xs text-[#9AA3B2] leading-relaxed">
                You are never trapped by sudden vendor pricing changes, discontinued endpoints, or unilateral terms of service alterations.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Zero Code Execution Safety Guarantee */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-[#F2B46D]">
            <Shield className="w-5 h-5" />
            <h2 className="text-xl font-bold text-[#E7EAF0]">
              3. Zero Code Execution & Injection Defense
            </h2>
          </div>
          <div className="p-4 rounded border border-[#293140] bg-[#121620] space-y-3 text-xs sm:text-sm text-[#9AA3B2]">
            <p className="leading-relaxed">
              <strong className="text-[#E7EAF0]">Absolute Execution Boundary:</strong> The Last Commit <strong className="text-[#E7EAF0]">never executes, evals, runs, or compiles</strong> user-submitted code snippets. No virtual machines, container sandboxes, or shell runtimes are spawned.
            </p>
            <p className="leading-relaxed">
              <strong className="text-[#E7EAF0]">Static Semantic Analysis Only:</strong> The submitted source text is transmitted strictly as static material for reasoning. System prompts enforce strict separation between model instructions and the untrusted code snippet to protect against prompt injection.
            </p>
          </div>
        </section>

        {/* Section 4: Privacy & Data Hygiene */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-[#A78BFA]">
            <Lock className="w-5 h-5" />
            <h2 className="text-xl font-bold text-[#E7EAF0]">
              4. Data Hygiene & Local Browser Storage
            </h2>
          </div>
          <p className="text-sm text-[#9AA3B2] leading-relaxed">
            We believe in honest, minimal telemetry:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-[#9AA3B2]">
            <li className="flex items-start gap-2">
              <span className="text-[#8DFF9B]">✓</span>
              <span>
                <strong className="text-[#E7EAF0]">No Remote Database:</strong> Saved reports live entirely in your device's browser <code className="text-[#8DFF9B] font-mono text-xs">localStorage</code>. We maintain no user accounts, database tables, or cross-device sync.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#8DFF9B]">✓</span>
              <span>
                <strong className="text-[#E7EAF0]">No Third-Party Analytics:</strong> No tracking pixels, Google Tag Manager scripts, or marketing telemetry are embedded in this application.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F87171]">⚠️</span>
              <span>
                <strong className="text-[#E7EAF0]">Sensitive Data Warning:</strong> Because code snippets are transmitted to the hosted inference API, <strong className="text-[#F87171]">do not paste production passwords, API tokens, cryptographic private keys, or proprietary secrets</strong>. Sanitize snippets prior to summoning the ghost.
              </span>
            </li>
          </ul>
        </section>

        {/* Bottom CTA to return to Session */}
        <div className="pt-6 border-t border-[#293140] flex items-center justify-between">
          <Link
            to="/session"
            className="px-5 py-2.5 rounded bg-[#38B86B] text-[#090B10] font-semibold text-xs sm:text-sm hover:bg-[#8DFF9B] transition-colors flex items-center gap-2"
          >
            <span>Proceed to Séance Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/archive"
            className="text-xs text-[#9AA3B2] hover:text-[#8DFF9B] font-mono"
          >
            View Local Archive →
          </Link>
        </div>
      </div>
    </div>
  );
};
