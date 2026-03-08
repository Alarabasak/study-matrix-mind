/**
 * Puzzle Generation Diagnostics Page
 * 
 * Runs multi-seed analysis to identify topology vs dataset mismatches.
 * Navigate to /diagnostics to run.
 */
import React, { useState, useEffect } from 'react';
import { getWordsForDifficulty } from '@/utils/wordDatabase';
import { WordItem } from '@/types/crossword';
import { normalizeAnswer } from '@/utils/crossword/normalizer';
import { SeededRandom } from '@/utils/crossword/seededRandom';
import { buildSlotTopology } from '@/utils/crossword/topologyBuilder';
import { assignAnswersWithCSP } from '@/utils/crossword/solver';
import { GRID_FAMILIES, getTopologyConfig, getSolverConfig } from '@/utils/crossword/config';
import { AnswerCandidate } from '@/utils/crossword/types';

interface LengthBucket {
  length: number;
  count: number;
  pct: string;
}

interface SeedResult {
  seed: number;
  gridLabel: string;
  topologyOk: boolean;
  feasible: boolean;
  solverOk: boolean;
  slotCount: number;
  slotLenProfile: Record<number, number>;
  failReason: string;
  backtracks: number;
}

function prepareCandidates(words: WordItem[]): AnswerCandidate[] {
  const seen = new Set<string>();
  const candidates: AnswerCandidate[] = [];
  for (const w of words) {
    const normalized = normalizeAnswer(w.word);
    if (normalized.length < 3 || normalized.length > 15) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    candidates.push({
      id: `${normalized}_${candidates.length}`,
      rawAnswer: w.word,
      normalizedAnswer: normalized,
      clueText: w.clue,
      clueType: 'text',
      category: w.category,
      topic: w.topic,
      difficulty: w.difficulty,
      frequencyScore: w.frequency_score,
    });
  }
  return candidates;
}

function buildLengthHistogram(candidates: AnswerCandidate[]): Map<number, number> {
  const hist = new Map<number, number>();
  for (const c of candidates) {
    const len = c.normalizedAnswer.length;
    hist.set(len, (hist.get(len) || 0) + 1);
  }
  return hist;
}

const Diagnostics: React.FC = () => {
  const [words, setWords] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [datasetReport, setDatasetReport] = useState<LengthBucket[]>([]);
  const [seedResults, setSeedResults] = useState<SeedResult[]>([]);
  const [summary, setSummary] = useState('');
  const [bottleneckReport, setBottleneckReport] = useState('');
  const seedCount = 100;

  useEffect(() => {
    getWordsForDifficulty('shuffle', 'all', Date.now()).then(w => {
      setWords(w);
      setLoading(false);
    });
  }, []);

  const runAnalysis = () => {
    setRunning(true);
    setTimeout(() => {
      const candidates = prepareCandidates(words);
      const candidateLenHist = buildLengthHistogram(candidates);

      // 1) Dataset report
      const buckets: LengthBucket[] = [];
      for (let len = 2; len <= 15; len++) {
        const count = candidateLenHist.get(len) || 0;
        buckets.push({
          length: len,
          count,
          pct: candidates.length > 0 ? ((count / candidates.length) * 100).toFixed(1) : '0',
        });
      }
      setDatasetReport(buckets);

      // Stats
      const lengths = candidates.map(c => c.normalizedAnswer.length).sort((a, b) => a - b);
      const avg = (lengths.reduce((s, l) => s + l, 0) / lengths.length).toFixed(1);
      const median = lengths[Math.floor(lengths.length / 2)];

      // 2) Multi-seed topology + solver analysis
      const results: SeedResult[] = [];
      const slotLenAgg: Record<number, number> = {};
      const failReasons: Record<string, number> = {};
      const bottleneckLens: Record<number, number> = {}; // how often a length causes feasibility failure

      const solverConfig = getSolverConfig();

      for (let i = 0; i < seedCount; i++) {
        const seed = 1000 + i * 7919;
        let bestResult: SeedResult | null = null;

        for (const gridConfig of GRID_FAMILIES) {
          const topoConfig = getTopologyConfig(gridConfig);
          const topoRng = new SeededRandom(seed * 7919 + 104729);
          const topology = buildSlotTopology(gridConfig, topoConfig, topoRng, candidateLenHist);

          if (!topology) {
            if (!bestResult) {
              bestResult = {
                seed, gridLabel: gridConfig.label,
                topologyOk: false, feasible: false, solverOk: false,
                slotCount: 0, slotLenProfile: {}, failReason: 'topology_null', backtracks: 0,
              };
            }
            continue;
          }

          // Slot length profile
          const slotLenProfile: Record<number, number> = {};
          for (const slot of topology.slots) {
            slotLenProfile[slot.length] = (slotLenProfile[slot.length] || 0) + 1;
          }

          // Feasibility check
          let feasible = true;
          let bottleneckLen = -1;
          for (const [len, count] of Object.entries(slotLenProfile)) {
            const numLen = parseInt(len);
            const available = candidateLenHist.get(numLen) || 0;
            if (count > available) {
              feasible = false;
              bottleneckLen = numLen;
              bottleneckLens[numLen] = (bottleneckLens[numLen] || 0) + 1;
              break;
            }
          }

          if (!feasible) {
            if (!bestResult || bestResult.failReason === 'topology_null') {
              bestResult = {
                seed, gridLabel: gridConfig.label,
                topologyOk: true, feasible: false, solverOk: false,
                slotCount: topology.slots.length, slotLenProfile,
                failReason: `feasibility_len_${bottleneckLen}`, backtracks: 0,
              };
            }
            continue;
          }

          // Try solver (with reduced backtracks for speed)
          const solverRng = new SeededRandom(seed * 6271 + 31);
          const quickConfig = { maxBacktracks: 20000 };
          const solverResult = assignAnswersWithCSP(topology.slots, candidates, solverRng, quickConfig);

          // Aggregate slot lengths
          for (const [len, count] of Object.entries(slotLenProfile)) {
            slotLenAgg[parseInt(len)] = (slotLenAgg[parseInt(len)] || 0) + count;
          }

          bestResult = {
            seed, gridLabel: gridConfig.label,
            topologyOk: true, feasible: true, solverOk: !!solverResult,
            slotCount: topology.slots.length, slotLenProfile,
            failReason: solverResult ? 'none' : 'solver_exhausted',
            backtracks: solverResult?.backtrackCount || 5000,
          };

          if (solverResult) break; // success, stop trying other grids
        }

        if (bestResult) {
          results.push(bestResult);
          if (bestResult.failReason !== 'none') {
            failReasons[bestResult.failReason] = (failReasons[bestResult.failReason] || 0) + 1;
          }
        }
      }

      setSeedResults(results);

      // Summary
      const success = results.filter(r => r.solverOk).length;
      const topoFail = results.filter(r => !r.topologyOk).length;
      const feasFail = results.filter(r => r.topologyOk && !r.feasible).length;
      const solverFail = results.filter(r => r.feasible && !r.solverOk).length;

      setSummary(
        `Total: ${candidates.length} unique candidates, min=${Math.min(...lengths)}, max=${Math.max(...lengths)}, avg=${avg}, median=${median}\n\n` +
        `Seeds tested: ${seedCount}\n` +
        `✅ Success: ${success} (${((success/seedCount)*100).toFixed(0)}%)\n` +
        `❌ Topology null: ${topoFail}\n` +
        `❌ Feasibility reject: ${feasFail}\n` +
        `❌ Solver exhausted: ${solverFail}\n\n` +
        `Fail reasons:\n${Object.entries(failReasons).sort((a,b) => b[1]-a[1]).map(([r,c]) => `  ${r}: ${c}`).join('\n')}`
      );

      setBottleneckReport(
        `Bottleneck lengths (how often a length causes feasibility failure):\n` +
        Object.entries(bottleneckLens).sort((a,b) => b[1]-a[1]).map(([len, count]) => {
          const avail = candidateLenHist.get(parseInt(len)) || 0;
          return `  Length ${len}: failed ${count} times (only ${avail} candidates available)`;
        }).join('\n') +
        `\n\nAggregated slot length demand (across feasible topologies):\n` +
        Object.entries(slotLenAgg).sort((a,b) => parseInt(a[0]) - parseInt(b[0])).map(([len, total]) => {
          const avail = candidateLenHist.get(parseInt(len)) || 0;
          return `  Length ${len}: ${total} slots demanded, ${avail} candidates available`;
        }).join('\n')
      );

      setRunning(false);
    }, 100);
  };

  if (loading) return <div className="p-8 font-mono">Loading words from database...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto font-mono text-sm">
      <h1 className="text-2xl font-bold mb-4">🔬 Puzzle Generation Diagnostics</h1>
      <p className="mb-4">Words loaded: {words.length}</p>

      <button
        onClick={runAnalysis}
        disabled={running}
        className="px-4 py-2 bg-blue-600 text-white rounded mb-6 disabled:opacity-50"
      >
        {running ? 'Running analysis...' : `Run ${seedCount}-seed analysis`}
      </button>

      {datasetReport.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">1. Dataset Length Distribution</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto whitespace-pre">
{summary}
          </pre>
          <table className="mt-4 border-collapse border border-gray-300 w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-3 py-1">Length</th>
                <th className="border border-gray-300 px-3 py-1">Count</th>
                <th className="border border-gray-300 px-3 py-1">%</th>
                <th className="border border-gray-300 px-3 py-1">Bar</th>
              </tr>
            </thead>
            <tbody>
              {datasetReport.map(b => (
                <tr key={b.length} className={b.count === 0 ? 'text-gray-400' : ''}>
                  <td className="border border-gray-300 px-3 py-1 text-center">{b.length}</td>
                  <td className="border border-gray-300 px-3 py-1 text-center">{b.count}</td>
                  <td className="border border-gray-300 px-3 py-1 text-center">{b.pct}%</td>
                  <td className="border border-gray-300 px-3 py-1">
                    <div className="bg-blue-500 h-4" style={{ width: `${Math.min(100, b.count * 3)}%` }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {bottleneckReport && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">2. Bottleneck Analysis</h2>
          <pre className="bg-red-50 p-4 rounded overflow-x-auto whitespace-pre">{bottleneckReport}</pre>
        </div>
      )}

      {seedResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">3. Per-Seed Results (first 20)</h2>
          <table className="border-collapse border border-gray-300 w-full text-xs">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-2 py-1">Seed</th>
                <th className="border border-gray-300 px-2 py-1">Grid</th>
                <th className="border border-gray-300 px-2 py-1">Topo</th>
                <th className="border border-gray-300 px-2 py-1">Feasible</th>
                <th className="border border-gray-300 px-2 py-1">Solver</th>
                <th className="border border-gray-300 px-2 py-1">Slots</th>
                <th className="border border-gray-300 px-2 py-1">Profile</th>
                <th className="border border-gray-300 px-2 py-1">Reason</th>
              </tr>
            </thead>
            <tbody>
              {seedResults.slice(0, 20).map(r => (
                <tr key={r.seed}>
                  <td className="border border-gray-300 px-2 py-1">{r.seed}</td>
                  <td className="border border-gray-300 px-2 py-1">{r.gridLabel}</td>
                  <td className="border border-gray-300 px-2 py-1">{r.topologyOk ? '✅' : '❌'}</td>
                  <td className="border border-gray-300 px-2 py-1">{r.feasible ? '✅' : '❌'}</td>
                  <td className="border border-gray-300 px-2 py-1">{r.solverOk ? '✅' : '❌'}</td>
                  <td className="border border-gray-300 px-2 py-1">{r.slotCount}</td>
                  <td className="border border-gray-300 px-2 py-1">
                    {Object.entries(r.slotLenProfile).sort((a,b) => parseInt(a[0])-parseInt(b[0])).map(([l,c]) => `${l}:${c}`).join(' ')}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-red-600">{r.failReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Diagnostics;
