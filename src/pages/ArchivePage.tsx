import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  Search,
  Trash2,
  ExternalLink,
  Download,
  Copy,
  Check,
  Filter,
  Sparkles,
  ShieldAlert,
  Code2,
  AlertOctagon,
  Clock,
  Layers,
} from 'lucide-react';
import type { AnalysisResult, AnalysisMode } from '../types/index.ts';
import {
  getSavedArchive,
  removeResultFromArchive,
  clearEntireArchive,
} from '../utils/storage.ts';
import { generateMarkdownReport, downloadMarkdownFile } from '../utils/markdownExport.ts';

export const ArchivePage: React.FC = () => {
  const navigate = useNavigate();
  const [archive, setArchive] = useState<AnalysisResult[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    setArchive(getSavedArchive());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeResultFromArchive(id);
    setArchive(updated);
    if (selectedResult?.id === id) {
      setSelectedResult(null);
    }
  };

  const handleClearAll = () => {
    clearEntireArchive();
    setArchive([]);
    setSelectedResult(null);
    setShowClearConfirm(false);
  };

  const handleCopy = async (item: AnalysisResult, e: React.MouseEvent) => {
    e.stopPropagation();
    const md = generateMarkdownReport(item);
    await navigator.clipboard.writeText(md);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (item: AnalysisResult, e: React.MouseEvent) => {
    e.stopPropagation();
    const md = generateMarkdownReport(item);
    const sanitizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    downloadMarkdownFile(`the-last-commit-${sanitizedTitle}.md`, md);
  };

  const handleReopenInWorkspace = (item: AnalysisResult) => {
    // Navigate to session with encoded ID or direct session injection
    navigate(`/session?sample=${item.id}`);
  };

  const filteredArchive = archive.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMode = filterMode === 'all' || item.mode === filterMode;
    return matchesSearch && matchesMode;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#293140] pb-5 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8DFF9B] mb-1">
            <Archive className="w-3.5 h-3.5" />
            <span>LOCAL_ARCHIVE_STORAGE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#E7EAF0]">
            Archaeological Archive
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA3B2] mt-0.5">
            Preserved reports stored securely in your browser's localStorage. No remote tracking.
          </p>
        </div>

        {archive.length > 0 && (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-mono rounded border border-[#293140] bg-[#121620] text-[#9AA3B2] hover:text-[#F87171] hover:border-[#F87171]/40 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Archive</span>
          </button>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="mb-6 p-4 rounded border border-[#F87171]/50 bg-[#F87171]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-5 h-5 text-[#F87171] shrink-0" />
            <div className="text-xs sm:text-sm text-[#E7EAF0]">
              Are you sure you want to purge all {archive.length} saved analyses from this device?
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1 text-xs font-mono rounded border border-[#293140] bg-[#121620] text-[#9AA3B2] hover:text-[#E7EAF0]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1 text-xs font-mono rounded bg-[#F87171] text-[#090B10] font-semibold hover:bg-[#F87171]/80"
            >
              Confirm Purge
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9AA3B2] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search saved analyses by title, language, or keyword..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded border border-[#293140] bg-[#121620] text-[#E7EAF0] placeholder-[#9AA3B2]/50 focus:outline-none focus:border-[#38B86B]"
          />
        </div>

        {/* Mode Filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#121620] rounded border border-[#293140]">
          {['all', 'seance', 'autopsy', 'resurrection'].map(modeKey => (
            <button
              key={modeKey}
              type="button"
              onClick={() => setFilterMode(modeKey)}
              className={`px-3 py-1 text-xs font-mono uppercase rounded transition-colors whitespace-nowrap ${
                filterMode === modeKey
                  ? 'bg-[#38B86B]/20 text-[#8DFF9B] border border-[#38B86B]/40'
                  : 'text-[#9AA3B2] hover:text-[#E7EAF0]'
              }`}
            >
              {modeKey}
            </button>
          ))}
        </div>
      </div>

      {/* Archive Grid */}
      {filteredArchive.length === 0 ? (
        <div className="p-12 text-center rounded border border-[#293140] bg-[#121620]/60 max-w-xl mx-auto my-8">
          <div className="w-12 h-12 rounded-full border border-[#293140] bg-[#090B10] flex items-center justify-center text-[#9AA3B2] mx-auto mb-4">
            <Archive className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[#E7EAF0] mb-2">No Saved Analyses Found</h3>
          <p className="text-xs sm:text-sm text-[#9AA3B2] leading-relaxed mb-6">
            {archive.length === 0
              ? 'When you conduct a séance in the workspace and click "Save Session", your findings will appear here.'
              : 'No saved records match your current search query or mode filter.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/session')}
            className="px-5 py-2 text-xs font-semibold rounded bg-[#38B86B] text-[#090B10] hover:bg-[#8DFF9B] transition-colors"
          >
            Launch Séance Workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArchive.map(item => {
            const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            const modeIcon = {
              seance: <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />,
              autopsy: <ShieldAlert className="w-3.5 h-3.5 text-[#F2B46D]" />,
              resurrection: <Code2 className="w-3.5 h-3.5 text-[#75E5E8]" />,
            }[item.mode];

            return (
              <div
                key={item.id}
                onClick={() => setSelectedResult(item)}
                className="p-5 rounded border border-[#293140] bg-[#121620] hover:border-[#38B86B]/50 transition-all flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
              >
                <div>
                  {/* Metadata Row */}
                  <div className="flex items-center justify-between text-xs font-mono text-[#9AA3B2] mb-2">
                    <span className="flex items-center gap-1.5 text-[#E7EAF0] font-semibold">
                      {modeIcon}
                      <span className="capitalize">{item.mode}</span>
                    </span>
                    <span className="text-[#8DFF9B]">{item.language}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#E7EAF0] group-hover:text-[#8DFF9B] transition-colors line-clamp-1 mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#9AA3B2] line-clamp-3 leading-relaxed mb-4">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#293140]/60 flex items-center justify-between text-xs font-mono text-[#9AA3B2]">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{dateStr}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title="Copy report markdown"
                      onClick={e => handleCopy(item, e)}
                      className="p-1 hover:text-[#8DFF9B] transition-colors"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-[#8DFF9B]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      title="Download Markdown"
                      onClick={e => handleDownload(item, e)}
                      className="p-1 hover:text-[#75E5E8] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Delete record"
                      onClick={e => handleDelete(item.id, e)}
                      className="p-1 hover:text-[#F87171] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Slide-over for Selected Analysis Record */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 bg-[#090B10]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] bg-[#121620] border border-[#293140] rounded shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-[#0B0E14] border-b border-[#293140] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#8DFF9B]">
                  <span>{selectedResult.language}</span>
                  <span>·</span>
                  <span className="capitalize">{selectedResult.mode} Mode</span>
                </div>
                <h2 className="text-lg font-bold text-[#E7EAF0]">{selectedResult.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="text-[#9AA3B2] hover:text-[#E7EAF0] p-1.5 font-mono text-sm"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              {selectedResult.ghostWhisper && (
                <div className="p-4 rounded border border-[#A78BFA]/30 bg-[#A78BFA]/5">
                  <div className="text-xs font-mono text-[#A78BFA] mb-1">GHOST WHISPER</div>
                  <p className="italic text-[#E7EAF0] font-serif leading-relaxed">
                    {selectedResult.ghostWhisper}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-mono text-[#8DFF9B] uppercase text-xs mb-1">Summary</h4>
                <p className="text-[#E7EAF0] leading-relaxed">{selectedResult.summary}</p>
              </div>

              {selectedResult.findings && selectedResult.findings.length > 0 && (
                <div>
                  <h4 className="font-mono text-[#F2B46D] uppercase text-xs mb-2">Findings ({selectedResult.findings.length})</h4>
                  <div className="space-y-2">
                    {selectedResult.findings.map((f, i) => (
                      <div key={i} className="p-3 rounded border border-[#293140] bg-[#090B10]">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#E7EAF0] mb-1">
                          <span>{f.title}</span>
                          <span className="font-mono text-[#F2B46D] uppercase text-[10px]">[{f.severity}]</span>
                        </div>
                        <p className="text-[#9AA3B2] text-xs">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedResult.modernizedCode && (
                <div>
                  <h4 className="font-mono text-[#75E5E8] uppercase text-xs mb-2">Resurrected Code</h4>
                  <pre className="p-3 rounded bg-[#090B10] border border-[#293140] font-mono text-xs text-[#E7EAF0] overflow-x-auto">
                    <code>{selectedResult.modernizedCode}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#293140] bg-[#0B0E14] flex items-center justify-between">
              <span className="text-xs text-[#9AA3B2] font-mono">
                Preserved {new Date(selectedResult.timestamp).toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={e => handleCopy(selectedResult, e)}
                  className="px-3 py-1.5 text-xs font-mono rounded border border-[#293140] bg-[#121620] text-[#9AA3B2] hover:text-[#E7EAF0]"
                >
                  {copiedId === selectedResult.id ? 'Copied' : 'Copy Report'}
                </button>
                <button
                  type="button"
                  onClick={e => handleDownload(selectedResult, e)}
                  className="px-3 py-1.5 text-xs font-mono rounded border border-[#293140] bg-[#121620] text-[#75E5E8]"
                >
                  Export .MD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
