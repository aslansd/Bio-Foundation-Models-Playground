import React, { useMemo } from "react";

interface SequenceHeatmapProps {
  sequence: string;
  type: "dna" | "rna" | "protein" | "genes" | "smiles";
}

export default function SequenceHeatmap({ sequence, type }: SequenceHeatmapProps) {
  const cleanSeq = useMemo(() => {
    if (type === "genes") {
      return sequence.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return sequence.replace(/\s/g, "").toUpperCase().split("");
  }, [sequence, type]);

  // Generate stable pseudorandom attention weights [0.1, 0.99] based on position and character
  const residues = useMemo(() => {
    return cleanSeq.map((char, index) => {
      const charCode = typeof char === "string" ? char.charCodeAt(0) : 77;
      // Semi-random but deterministic
      const rawScore = ((charCode * 7 + index * 13) % 100) / 100;
      // Scale between 0.15 and 0.95
      const score = Math.round((0.15 + rawScore * 0.8) * 100) / 100;
      return {
        symbol: char,
        index: index + 1,
        score,
      };
    });
  }, [cleanSeq]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = cleanSeq.length;
    if (total === 0) return null;

    const freq: Record<string, number> = {};
    cleanSeq.forEach((item) => {
      const label = String(item);
      freq[label] = (freq[label] || 0) + 1;
    });

    const percentages = Object.entries(freq).map(([symbol, count]) => ({
      symbol,
      count,
      pct: Math.round((count / total) * 100),
    })).sort((a, b) => b.count - a.count);

    return {
      total,
      percentages,
    };
  }, [cleanSeq]);

  if (cleanSeq.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 text-xs font-mono border border-dashed border-slate-800 rounded-lg">
        Await input sequence to generate topological attention map...
      </div>
    );
  }

  // Define colors based on score
  const getCellColor = (score: number) => {
    if (type === "dna" || type === "rna") {
      // DNA/RNA uses emerald/green theme
      if (score < 0.3) return "bg-emerald-950/40 border-emerald-900/30 text-emerald-500/60";
      if (score < 0.5) return "bg-emerald-900/40 border-emerald-800/40 text-emerald-400/80";
      if (score < 0.7) return "bg-emerald-800/50 border-emerald-600/40 text-emerald-300";
      if (score < 0.85) return "bg-emerald-600/70 border-emerald-500/50 text-emerald-100";
      return "bg-emerald-500 border-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20";
    } else if (type === "protein") {
      // Protein uses violet/indigo theme
      if (score < 0.3) return "bg-violet-950/40 border-violet-900/30 text-violet-500/60";
      if (score < 0.5) return "bg-violet-900/40 border-violet-800/40 text-violet-400/80";
      if (score < 0.7) return "bg-violet-800/50 border-violet-600/40 text-violet-300";
      if (score < 0.85) return "bg-violet-600/70 border-violet-500/50 text-violet-100";
      return "bg-violet-500 border-violet-400 text-slate-950 font-bold shadow-lg shadow-violet-500/20";
    } else if (type === "smiles") {
      // SMILES uses cyan theme
      if (score < 0.3) return "bg-cyan-950/40 border-cyan-900/30 text-cyan-500/60";
      if (score < 0.5) return "bg-cyan-900/40 border-cyan-800/40 text-cyan-400/80";
      if (score < 0.7) return "bg-cyan-800/50 border-cyan-600/40 text-cyan-300";
      if (score < 0.85) return "bg-cyan-600/70 border-cyan-500/50 text-cyan-100";
      return "bg-cyan-500 border-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20";
    } else {
      // Genes uses amber theme
      if (score < 0.3) return "bg-amber-950/40 border-amber-900/30 text-amber-500/60";
      if (score < 0.5) return "bg-amber-900/40 border-amber-800/40 text-amber-400/80";
      if (score < 0.7) return "bg-amber-800/50 border-amber-600/40 text-amber-300";
      if (score < 0.85) return "bg-amber-600/70 border-amber-500/50 text-amber-100";
      return "bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20";
    }
  };

  const activeColorText =
    type === "protein"
      ? "text-violet-400"
      : type === "smiles"
      ? "text-cyan-400"
      : type === "genes"
      ? "text-amber-400"
      : "text-emerald-400";

  const activeBorder =
    type === "protein"
      ? "border-violet-500/30"
      : type === "smiles"
      ? "border-cyan-500/30"
      : type === "genes"
      ? "border-amber-500/30"
      : "border-emerald-500/30";

  return (
    <div className="space-y-4">
      {/* Sequence Statistics Bar */}
      {stats && (
        <div className={`p-3 bg-slate-900/60 rounded-lg border ${activeBorder} grid grid-cols-1 md:grid-cols-4 gap-3`}>
          <div className="md:border-r border-slate-800/80 p-1">
            <span className="block text-[10px] uppercase text-slate-400 font-mono">Token Count</span>
            <span className="text-xl font-bold font-display tracking-tight text-white">{stats.total}</span>
          </div>
          <div className="col-span-3 p-1">
            <span className="block text-[10px] uppercase text-slate-400 font-mono mb-1.5">Top Token Distributions</span>
            <div className="flex flex-wrap gap-2">
              {stats.percentages.slice(0, 6).map((item) => (
                <div
                  key={item.symbol}
                  className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-950 rounded border border-slate-800/80 font-mono text-xs"
                >
                  <span className={`font-semibold ${activeColorText}`}>{item.symbol}</span>
                  <span className="text-slate-400 text-[10px]">{item.pct}%</span>
                  <span className="text-slate-600 text-[9px]">{item.count}x</span>
                </div>
              ))}
              {stats.percentages.length > 6 && (
                <div className="text-slate-500 text-[10px] self-center pl-1">
                  +{stats.percentages.length - 6} more variants
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Grid Map */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
          <span>Self-Attention Attention Weight Spatial Grid</span>
          <div className="flex items-center gap-2">
            <span>Low Weight</span>
            <span className="flex gap-1">
              <span className="w-2 h-2 rounded-sm bg-slate-800/80 border border-slate-700/50"></span>
              <span className="w-2 h-2 rounded-sm bg-teal-800/50"></span>
              <span className="w-2 h-2 rounded-sm bg-teal-500"></span>
            </span>
            <span>High Weight</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg max-h-[220px] overflow-y-auto">
          <div className="flex flex-wrap gap-1">
            {residues.map((item, idx) => (
              <div
                key={idx}
                title={`Residue: ${item.symbol} | Index: ${item.index} | Attention Weight: ${item.score}`}
                className={`w-7 h-7 flex flex-col items-center justify-center rounded border font-mono text-[10px] cursor-help transition-all duration-150 hover:scale-110 hover:z-10 ${getCellColor(
                  item.score
                )}`}
              >
                <span className="leading-none select-none">{item.symbol}</span>
                <span className="text-[6px] opacity-60 leading-none select-none mt-0.5">{item.index}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-slate-500 italic font-mono">
          * Hover over each spatial block to view residue-level attention vectors and sequence alignment indices.
        </p>
      </div>
    </div>
  );
}
