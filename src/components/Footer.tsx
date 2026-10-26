import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#293140] bg-[#090B10] py-10 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-[#9AA3B2]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & tagline */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="text-sm font-semibold text-[#E7EAF0] tracking-wide">
            The Last Commit
          </div>
          <p className="text-[#9AA3B2] italic font-serif">
            “Every codebase leaves a trace. Some refuse to disappear.”
          </p>
        </div>

        {/* Clean unboxed metadata separators (No pills!) */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#9AA3B2]">
          <span>Gemma 4 (gemma-4-26b-a4b-it)</span>
          <span aria-hidden="true">·</span>
          <span>Hacktoberfest: Ghost in the Machine</span>
          <span aria-hidden="true">·</span>
          <span>Zero Code Execution Policy</span>
          <span aria-hidden="true">·</span>
          <span>Local Device Storage</span>
        </div>

        {/* Navigation links */}
        <div className="flex items-center gap-5">
          <Link to="/session" className="hover:text-[#8DFF9B] transition-colors">
            Workspace
          </Link>
          <Link to="/archive" className="hover:text-[#8DFF9B] transition-colors">
            Archive
          </Link>
          <Link to="/about" className="hover:text-[#8DFF9B] transition-colors">
            Open AI & Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
};
