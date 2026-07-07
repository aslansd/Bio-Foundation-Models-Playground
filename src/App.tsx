import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dna,
  FileSpreadsheet,
  Activity,
  Hexagon,
  MessageSquare,
  Search,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Send,
  Trash2,
  Play,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Info,
  Terminal,
  FlaskConical,
  Database,
  Cpu,
  RefreshCw,
  Clock
} from "lucide-react";
import { MODELS, CATEGORIES, ModelInfo, CategoryInfo, validateInput } from "./modelsData";
import SequenceHeatmap from "./components/SequenceHeatmap";
import CustomMarkdown from "./components/CustomMarkdown";

// Type definitions
interface ChatMessage {
  role: "user" | "model";
  parts: [{ text: string }];
}

export default function App() {
  // Navigation & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedModelId, setSelectedModelId] = useState<string>("dnabert2");

  // Interaction States (keyed by model ID to preserve progress)
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});

  // UI state for single prediction request
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Retrieve current active model metadata
  const currentModel = useMemo(() => {
    return MODELS.find((m) => m.id === selectedModelId) || MODELS[0];
  }, [selectedModelId]);

  // Filter models based on category and search query
  const filteredModels = useMemo(() => {
    return MODELS.filter((m) => {
      const matchesCategory = selectedCategoryId === "all" || m.category === selectedCategoryId;
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.oneLiner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.developer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategoryId, searchQuery]);

  // Scroll to bottom of chat when new message arrives
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistories, selectedModelId]);

  // Pre-fill model input with example on mount if empty
  useEffect(() => {
    const modelId = currentModel.id;
    if (!inputs[modelId]) {
      setInputs((prev) => ({
        ...prev,
        [modelId]: currentModel.exampleInput,
      }));
    }
  }, [currentModel, inputs]);

  // Current active input sequence
  const currentInput = inputs[currentModel.id] || "";

  // Validate the current sequence input in real-time
  const validation = useMemo(() => {
    return validateInput(currentModel.inputType, currentInput);
  }, [currentModel.inputType, currentInput]);

  const handleInputChange = (val: string) => {
    setInputs((prev) => ({
      ...prev,
      [currentModel.id]: val,
    }));
  };

  // Helper to load example input
  const loadExample = () => {
    handleInputChange(currentModel.exampleInput);
    setServerError(null);
  };

  // Clear current input or chat
  const clearInput = () => {
    if (currentModel.inputType === "chat") {
      setChatHistories((prev) => ({
        ...prev,
        [currentModel.id]: [],
      }));
    } else {
      handleInputChange("");
    }
    setServerError(null);
  };

  // Trigger sequence model prediction simulation
  const runPrediction = async () => {
    if (!validation.isValid) return;
    setServerError(null);
    setIsLoading(true);
    setPipelineStep(0);

    const steps = [
      `[1/4] Tokenizing raw sequence of length ${currentInput.replace(/\s/g, "").length} bases...`,
      `[2/4] Mapping inputs to positional embeddings (${currentModel.architecture})...`,
      `[3/4] Running multi-head attention weights computation over ${currentModel.parameters} params...`,
      `[4/4] Completing multi-dimensional structural & property prediction...`
    ];

    setPipelineLogs([steps[0]]);

    // Step-by-step pipeline visualizer
    for (let i = 1; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setPipelineStep(i);
      setPipelineLogs((prev) => [...prev, steps[i]]);
    }

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: currentModel.id,
          input: currentInput,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to contact simulation API server.");
      }

      const data = await response.json();
      setPredictions((prev) => ({
        ...prev,
        [currentModel.id]: data.text,
      }));
    } catch (err: any) {
      console.error(err);
      setServerError(err.message || "An error occurred while emulating model results.");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger chat model prompt submission
  const sendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const prompt = chatInput.trim();
    if (!prompt || isLoading) return;

    setServerError(null);
    setChatInput("");
    setIsLoading(true);

    const modelId = currentModel.id;
    const currentHistory = chatHistories[modelId] || [];

    // Append user message
    const userMsg: ChatMessage = {
      role: "user",
      parts: [{ text: prompt }],
    };
    const updatedHistory = [...currentHistory, userMsg];

    setChatHistories((prev) => ({
      ...prev,
      [modelId]: updatedHistory,
    }));

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: modelId,
          input: prompt,
          history: currentHistory, // send previous logs to preserve context
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to reach model simulation api.");
      }

      const data = await response.json();

      // Append model response
      const modelMsg: ChatMessage = {
        role: "model",
        parts: [{ text: data.text }],
      };

      setChatHistories((prev) => ({
        ...prev,
        [modelId]: [...updatedHistory, modelMsg],
      }));
    } catch (err: any) {
      console.error(err);
      setServerError(err.message || "Failed to transmit message to biomedical assistant.");
      // Rollback user message if error occurs
    } finally {
      setIsLoading(false);
    }
  };

  // Icon switcher helper for Categories
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Dna":
        return <Dna className="w-4 h-4 text-emerald-400" />;
      case "FileSpreadsheet":
        return <FileSpreadsheet className="w-4 h-4 text-amber-400" />;
      case "Activity":
        return <Activity className="w-4 h-4 text-violet-400" />;
      case "Hexagon":
        return <Hexagon className="w-4 h-4 text-cyan-400" />;
      case "MessageSquare":
        return <MessageSquare className="w-4 h-4 text-teal-400" />;
      default:
        return <Dna className="w-4 h-4 text-slate-400" />;
    }
  };

  // Get short badge based on category or input type
  const getInputBadgeColor = (type: string) => {
    switch (type) {
      case "dna":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-850";
      case "rna":
        return "bg-green-950/60 text-green-300 border-green-850";
      case "protein":
        return "bg-violet-950/60 text-violet-300 border-violet-850";
      case "smiles":
        return "bg-cyan-950/60 text-cyan-300 border-cyan-850";
      case "genes":
        return "bg-amber-950/60 text-amber-300 border-amber-850";
      case "chat":
        return "bg-teal-950/60 text-teal-300 border-teal-850";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans selection:bg-teal-500/20 selection:text-teal-300">
      
      {/* Upper Navigation / Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-4 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand Block */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/30 rounded-xl relative shadow-inner">
              <FlaskConical className="w-6 h-6 text-teal-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950"></span>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white font-display flex items-center gap-2">
                Bio Foundation Models Playground
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">
                Unified Inference Sandbox & Exploration Portal for Life Sciences (v1.0.0)
              </p>
            </div>
          </div>

          {/* Quick status bar */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-slate-900/60 border border-slate-800 rounded-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400">Simulation Engine:</span>
              <span className="text-emerald-400">Online</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/60 border border-slate-800 rounded-md">
              <Database className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-400">Sourced:</span>
              <span className="text-teal-400">13 Models</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Model Registry Directory (col-span-4) */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by keyword, developer, gene..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 font-sans transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-xs text-slate-500 hover:text-slate-300 font-mono"
              >
                Clear
              </button>
            )}
          </div>

          {/* Categories Horizontal/Vertical list */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase text-slate-400 tracking-wider font-mono px-1">
              Filter by Biological Domain
            </span>
            <div className="flex flex-row lg:flex-col overflow-x-auto gap-1 pb-2 lg:pb-0 scrollbar-none">
              
              <button
                onClick={() => setSelectedCategoryId("all")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left whitespace-nowrap ${
                  selectedCategoryId === "all"
                    ? "bg-slate-900 border border-slate-800 text-teal-300"
                    : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent"
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>All Life Science Models ({MODELS.length})</span>
              </button>

              {CATEGORIES.map((cat) => {
                const count = MODELS.filter((m) => m.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left whitespace-nowrap ${
                      selectedCategoryId === cat.id
                        ? "bg-slate-900 border border-slate-800 text-teal-300"
                        : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(cat.iconName)}
                      <span>{cat.name}</span>
                    </div>
                    <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-500 font-mono font-normal">
                      {count}
                    </span>
                  </button>
                );
              })}

            </div>
          </div>

          {/* Model Registry List Grid */}
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[350px] lg:max-h-[580px] pr-1">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] uppercase text-slate-400 tracking-wider font-mono">
                Model Registry ({filteredModels.length})
              </span>
              {selectedCategoryId !== "all" && (
                <button
                  onClick={() => setSelectedCategoryId("all")}
                  className="text-[9px] font-mono text-slate-500 hover:text-teal-400"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {filteredModels.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/30 border border-dashed border-slate-900 rounded-xl">
                <p className="text-slate-500 text-xs font-mono">No bio models found matching the criteria.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredModels.map((model) => {
                  const isActive = model.id === selectedModelId;
                  const isChat = model.inputType === "chat";
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModelId(model.id);
                        setServerError(null);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all relative flex flex-col gap-2 hover:scale-[1.01] ${
                        isActive
                          ? "bg-slate-900/90 border-teal-500/40 shadow-lg shadow-teal-950/20"
                          : "bg-slate-950/60 border-slate-900 hover:bg-slate-900/40 hover:border-slate-800"
                      }`}
                    >
                      {/* Badge and Param */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded border ${getInputBadgeColor(
                            model.inputType
                          )}`}
                        >
                          {model.inputType}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                          <Cpu className="w-2.5 h-2.5" />
                          {model.parameters} params
                        </span>
                      </div>

                      {/* Name and Developer */}
                      <div>
                        <h3 className={`text-sm font-semibold tracking-tight ${isActive ? "text-teal-300" : "text-white"}`}>
                          {model.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{model.developer}</p>
                      </div>

                      {/* OneLiner snippet */}
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{model.oneLiner}</p>

                      {isActive && (
                        <span className="absolute right-3 top-8 w-1.5 h-1.5 bg-teal-400 rounded-full shadow-lg shadow-teal-400/50"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </section>

        {/* Right Column: Active Model Inspection and Sandbox (col-span-8) */}
        <section className="lg:col-span-8 flex flex-col gap-5">
          
          {/* Active Model Meta Block */}
          <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-4">
            
            {/* Header Block */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-3 border-b border-slate-900">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-teal-400 uppercase tracking-widest">
                    {CATEGORIES.find((c) => c.id === currentModel.category)?.name || "Biomedical Module"}
                  </span>
                  <span className="text-slate-600 font-mono text-xs">|</span>
                  <a
                    href={currentModel.paperUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-slate-500 font-mono flex items-center gap-1 hover:text-teal-400 transition-colors"
                  >
                    <BookOpen className="w-3 h-3" />
                    Read Paper <ExternalLink className="w-2 h-2" />
                  </a>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white font-display mt-0.5">
                  {currentModel.name}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Developed by <span className="text-slate-300">{currentModel.developer}</span>
                </p>
              </div>

              {/* Status parameters indicator block */}
              <div className="flex flex-wrap gap-2 sm:self-center">
                <div className="px-3 py-1 bg-slate-900 rounded-lg border border-slate-800 text-center">
                  <span className="block text-[8px] uppercase font-mono text-slate-500">Architecture</span>
                  <span className="text-xs font-medium font-mono text-slate-300">{currentModel.architecture}</span>
                </div>
                <div className="px-3 py-1 bg-slate-900 rounded-lg border border-slate-800 text-center">
                  <span className="block text-[8px] uppercase font-mono text-slate-500">Inference Size</span>
                  <span className="text-xs font-semibold font-mono text-teal-400">{currentModel.parameters}</span>
                </div>
              </div>
            </div>

            {/* Description & Application bullet grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              <div className="md:col-span-7 space-y-2">
                <h3 className="text-xs uppercase font-mono text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  Foundation Architecture & Purpose
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/30 p-3 rounded-xl border border-slate-900">
                  {currentModel.description}
                </p>
              </div>

              <div className="md:col-span-5 space-y-2">
                <h3 className="text-xs uppercase font-mono text-slate-400 tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                  Practical Biomedical Uses
                </h3>
                <ul className="space-y-1.5 bg-slate-900/30 p-3 rounded-xl border border-slate-900">
                  {currentModel.applications.map((app, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5 leading-normal">
                      <span className="text-teal-400 font-bold font-mono text-[10px] mt-0.5">•</span>
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>

          {/* Interactive Playground Interface Panel */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl overflow-hidden flex flex-col min-h-[450px]">
            
            {/* Tab header */}
            <div className="px-4 py-3 bg-slate-900/40 border-b border-slate-900 flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-mono font-medium text-slate-200">
                  Interactive Sandbox Console
                </span>
                <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                  Format: {currentModel.inputType.toUpperCase()}
                </span>
              </div>

              {/* Utility actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={loadExample}
                  disabled={isLoading}
                  className="text-[11px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md font-mono text-slate-300 hover:text-teal-300 flex items-center gap-1.5 disabled:opacity-50 transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset to Example
                </button>
                <button
                  onClick={clearInput}
                  disabled={isLoading}
                  className="text-[11px] px-2.5 py-1 bg-slate-900 hover:bg-red-950 hover:text-red-300 border border-slate-800 hover:border-red-900 rounded-md font-mono text-slate-400 flex items-center gap-1.5 disabled:opacity-50 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>
            </div>

            {/* Error notifications */}
            {serverError && (
              <div className="m-4 p-3.5 bg-red-950/40 border border-red-900/60 rounded-xl flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-semibold text-red-200 font-mono uppercase">Simulation Error</span>
                  <p className="text-xs text-red-300 mt-1">{serverError}</p>
                </div>
              </div>
            )}

            {/* Render proper layout based on input type */}
            <div className="flex-1 p-4 flex flex-col gap-4">
              
              {currentModel.inputType !== "chat" ? (
                /* Sequence Mode layout (DNA, Protein, RNA, SMILES, Genes) */
                <div className="space-y-4 flex-1 flex flex-col">
                  
                  {/* Sequence Inputs Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 flex justify-between">
                      <span>{currentModel.inputLabel}</span>
                      <span className="text-[10px] text-slate-500">
                        Length: {currentInput.length} bases/characters
                      </span>
                    </label>
                    <textarea
                      value={currentInput}
                      onChange={(e) => handleInputChange(e.target.value)}
                      disabled={isLoading}
                      placeholder={currentModel.inputPlaceholder}
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-slate-200 font-mono tracking-wider focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 leading-relaxed resize-none disabled:opacity-75"
                    />
                    
                    {/* Real-time Verification Bar */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono">
                        {validation.isValid ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Sequence validated against chemical taxonomy criteria.</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-amber-400">{validation.message}</span>
                          </>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 italic font-mono">
                        * Supports uppercase or standard spacing formatting.
                      </span>
                    </div>
                  </div>

                  {/* Attention Vector Topology (Heatmap) */}
                  <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-900">
                    <SequenceHeatmap sequence={currentInput} type={currentModel.inputType} />
                  </div>

                  {/* Core Action triggering prediction */}
                  <div className="pt-2 flex justify-between items-center border-t border-slate-900 gap-4">
                    <div className="text-xs text-slate-400 max-w-[70%]">
                      <span className="font-semibold text-slate-300">Sandbox Mode:</span> Emulates full embeddings, attention weight distribution maps, and structural reports utilizing high-precision Gemini LLMs.
                    </div>
                    <button
                      onClick={runPrediction}
                      disabled={isLoading || !validation.isValid}
                      className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium text-xs font-mono rounded-xl shadow-lg hover:shadow-teal-500/10 disabled:opacity-50 disabled:hover:scale-100 active:scale-95 flex items-center gap-2 transition-all cursor-pointer shrink-0"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Simulating...
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Run Model Inference
                        </>
                      )}
                    </button>
                  </div>

                  {/* Inference Output Report Block */}
                  <AnimatePresence mode="wait">
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 font-mono"
                      >
                        <div className="flex items-center gap-3">
                          <RefreshCw className="w-4 h-4 text-teal-400 animate-spin" />
                          <span className="text-xs font-semibold text-slate-200">Executing Deep Tensor Networks...</span>
                        </div>
                        <div className="space-y-1.5 pl-7 border-l border-slate-850 ml-2">
                          {pipelineLogs.map((log, index) => (
                            <div
                              key={index}
                              className={`text-[10px] leading-relaxed flex items-center gap-2 ${
                                index === pipelineStep ? "text-teal-400" : "text-slate-500"
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              <span>{log}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {!isLoading && predictions[currentModel.id] && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border border-slate-850 bg-slate-950 rounded-2xl overflow-hidden mt-2"
                      >
                        <div className="bg-slate-900/60 border-b border-slate-850 px-4 py-2.5 flex items-center justify-between">
                          <span className="text-xs font-mono text-teal-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Model Inference Prediction Report
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Status: Prediction Complete
                          </span>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[350px]">
                          <CustomMarkdown content={predictions[currentModel.id]} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              ) : (
                /* Chat Mode layout (BioGPT, BioMedLM, Meditron, PMC-LLaMA) */
                <div className="flex-1 flex flex-col gap-4 min-h-[420px]">
                  
                  {/* Chat logs scroll area */}
                  <div className="flex-1 bg-slate-950/80 border border-slate-900 rounded-2xl p-4 overflow-y-auto max-h-[320px] lg:max-h-[380px] flex flex-col gap-4">
                    
                    {/* Welcome indicator */}
                    <div className="p-3.5 bg-slate-900/40 border border-slate-850 rounded-xl space-y-1.5 max-w-xl mx-auto text-center">
                      <MessageSquare className="w-5 h-5 text-teal-400 mx-auto" />
                      <span className="block text-xs font-semibold text-slate-200 uppercase font-mono">
                        Biomedical QA Chat Established
                      </span>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        You are connected to a simulated chatbot server of <span className="text-teal-300 font-semibold">{currentModel.name}</span>. Try asking specialized biological, biochemical, or clinical practice questions.
                      </p>
                    </div>

                    {/* Render message logs */}
                    {(chatHistories[currentModel.id] || []).map((msg, idx) => {
                      const isUser = msg.role === "user";
                      return (
                        <div
                          key={idx}
                          className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2.5`}
                        >
                          {/* Bot Avatar */}
                          {!isUser && (
                            <div className="w-7 h-7 rounded-lg bg-teal-950/50 border border-teal-850 flex items-center justify-center shrink-0">
                              <FlaskConical className="w-3.5 h-3.5 text-teal-400" />
                            </div>
                          )}

                          <div
                            className={`p-3.5 rounded-2xl max-w-[85%] border text-xs leading-relaxed ${
                              isUser
                                ? "bg-slate-900 border-slate-800 text-slate-100 rounded-tr-none"
                                : "bg-slate-950 border-slate-850 text-slate-200 rounded-tl-none"
                            }`}
                          >
                            <span className="block text-[9px] uppercase font-mono text-slate-500 mb-1">
                              {isUser ? "You" : currentModel.name}
                            </span>
                            <div className="prose prose-invert max-w-none">
                              <CustomMarkdown content={msg.parts[0]?.text} />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isLoading && (
                      <div className="flex justify-start items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-teal-950/50 border border-teal-850 flex items-center justify-center shrink-0">
                          <FlaskConical className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                        </div>
                        <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl rounded-tl-none">
                          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                            <Clock className="w-3 h-3 animate-spin text-teal-400" />
                            <span>{currentModel.name} is calculating literature attention graphs...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Input form */}
                  <form onSubmit={sendChatMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={isLoading}
                      placeholder={`Ask ${currentModel.name} anything... (e.g., Click 'Reset to Example' above)`}
                      className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 disabled:opacity-75"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !chatInput.trim()}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow hover:shadow-teal-500/10 disabled:opacity-50 flex items-center justify-center cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>

                </div>
              )}

            </div>

          </div>

        </section>

      </main>

      {/* Page Footer */}
      <footer className="mt-8 border-t border-slate-900 bg-slate-950 py-5 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>
            Powered by standard Node.js/Express + React/Vite + Gemini-3.5-Flash emulation model layers.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/apeterswu/Awesome-Bio-Foundation-Models"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 flex items-center gap-1"
            >
              <Database className="w-3 h-3" /> Awesome Bio Foundation Models
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
