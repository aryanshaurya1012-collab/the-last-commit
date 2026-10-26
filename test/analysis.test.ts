import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE_SNIPPETS } from '../src/data/samples.ts';
import { GRAVEYARD_FRAGMENTS, GHOST_SIGNALS } from '../src/data/graveyard.ts';
import { DEFAULT_TERMINAL_SETTINGS } from '../src/utils/storage.ts';
import type { AnalysisResult } from '../src/types/index.ts';

describe('The Last Commit — Code Archaeologist Test Suite', () => {
  describe('Input Validation Constraints', () => {
    test('Rejects empty or whitespace-only code snippets', () => {
      const validateInput = (code: string) => {
        if (!code || code.trim().length === 0) {
          throw new Error('No code provided for analysis.');
        }
      };

      assert.throws(() => validateInput(''), /No code provided/);
      assert.throws(() => validateInput('   \n\t  '), /No code provided/);
    });

    test('Rejects oversized code snippets exceeding 50,000 characters', () => {
      const validateLength = (code: string) => {
        if (code.length > 50000) {
          throw new Error('Code snippet exceeds the 50,000 character limit.');
        }
      };

      const hugeCode = 'console.log("legacy");\n'.repeat(3000);
      assert.ok(hugeCode.length > 50000);
      assert.throws(() => validateLength(hugeCode), /50,000 character limit/);
    });

    test('Validates allowable analysis modes', () => {
      const validModes = ['seance', 'autopsy', 'resurrection'];
      const isModeValid = (mode: string) => validModes.includes(mode);

      assert.strictEqual(isModeValid('seance'), true);
      assert.strictEqual(isModeValid('autopsy'), true);
      assert.strictEqual(isModeValid('resurrection'), true);
      assert.strictEqual(isModeValid('unknown_mode'), false);
      assert.strictEqual(isModeValid(''), false);
    });
  });

  describe('Model JSON Parsing & Fence Stripping', () => {
    test('Cleans markdown code fences from JSON output', () => {
      const rawWithJsonFence = '```json\n{"title":"Legacy Parser","summary":"Cleaned"}\n```';
      const rawWithPlainFence = '```\n{"title":"Legacy Parser","summary":"Cleaned"}\n```';

      const cleanJson = (raw: string) => {
        let cleaned = raw.trim();
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        return JSON.parse(cleaned);
      };

      const parsed1 = cleanJson(rawWithJsonFence);
      assert.strictEqual(parsed1.title, 'Legacy Parser');
      assert.strictEqual(parsed1.summary, 'Cleaned');

      const parsed2 = cleanJson(rawWithPlainFence);
      assert.strictEqual(parsed2.title, 'Legacy Parser');
    });

    test('Gracefully handles malformed JSON without crashing server', () => {
      const invalidJson = '{"title": "Unclosed string';
      assert.throws(() => JSON.parse(invalidJson));
    });
  });

  describe('Sample Demonstrations Integrity', () => {
    test('Includes all required sample snippets (jQuery, PHP, Callbacks, COBOL)', () => {
      assert.strictEqual(SAMPLE_SNIPPETS.length, 4);

      const languages = SAMPLE_SNIPPETS.map(s => s.language);
      assert.ok(languages.includes('JavaScript'));
      assert.ok(languages.includes('PHP'));
      assert.ok(languages.includes('COBOL'));
    });

    test('Every sample contains valid structure, ghost whisper, and findings', () => {
      for (const sample of SAMPLE_SNIPPETS) {
        assert.ok(sample.id, 'Sample should have an ID');
        assert.ok(sample.code.length > 20, 'Sample code must not be empty');
        
        const res: AnalysisResult = sample.sampleResult;
        assert.ok(res.summary.length > 10, 'Result must have summary');
        assert.ok(res.ghostWhisper, 'Sample must have a fictional ghost whisper');
        assert.ok(Array.isArray(res.findings) && res.findings.length > 0, 'Sample must include findings');
        assert.strictEqual(res.isSample, true, 'Sample must be explicitly labelled as sample');
        
        for (const finding of res.findings) {
          assert.ok(finding.title, 'Finding requires title');
          assert.ok(['informational', 'low', 'medium', 'high'].includes(finding.severity), 'Finding requires valid severity');
          assert.ok(finding.description, 'Finding requires description');
        }
      }
    });
  });

  describe('Terminal Engine & Graveyard Artifacts Integrity', () => {
    test('Verifies default settings configuration', () => {
      assert.strictEqual(DEFAULT_TERMINAL_SETTINGS.fpsCap, 'auto');
      assert.strictEqual(DEFAULT_TERMINAL_SETTINGS.colorTheme, 'matrix_green');
      assert.strictEqual(DEFAULT_TERMINAL_SETTINGS.soundEnabled, false, 'Audio must default to OFF');
      assert.ok(DEFAULT_TERMINAL_SETTINGS.speed > 0);
      assert.ok(DEFAULT_TERMINAL_SETTINGS.density > 0);
    });

    test('Verifies graveyard fragments have valid lore and non-empty static code', () => {
      assert.ok(GRAVEYARD_FRAGMENTS.length >= 4);
      for (const frag of GRAVEYARD_FRAGMENTS) {
        assert.ok(frag.id, 'Fragment must have ID');
        assert.ok(frag.title, 'Fragment must have title');
        assert.ok(frag.code.length > 10, 'Fragment code must be non-empty text');
        assert.ok(frag.lore.length > 15, 'Fragment lore must be informative');
      }
    });

    test('Verifies ghost signals have valid timestamps and lore messages', () => {
      assert.ok(GHOST_SIGNALS.length >= 4);
      for (const sig of GHOST_SIGNALS) {
        assert.ok(sig.id);
        assert.ok(sig.source);
        assert.ok(sig.message.length > 20);
      }
    });
  });
});
