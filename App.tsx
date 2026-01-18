
import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import CodeEditor from './components/CodeEditor';
import VisualizationPanel from './components/VisualizationPanel';
import InsightCard from './components/InsightCard';
import { AnalysisState } from './types';
import { analyzeF1Data, generatePythonSnippet } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AnalysisState>({
    season: '2024',
    grandPrix: 'Monaco',
    driver1: 'VER',
    driver2: 'LEC',
    sessionType: 'Q',
    pythonCode: `# Initialize FastF1 Session
import fastf1 as ff1
import matplotlib.pyplot as plt

# Hypothesis: Is LEC gaining more time in slow-speed traction zones?
# Load telemetry for qualifying
session = ff1.get_session(2024, 'Monaco', 'Q')
session.load()

# Comparative Analysis
laps_v = session.laps.pick_driver('VER').pick_fastest()
laps_l = session.laps.pick_driver('LEC').pick_fastest()

# Calculate telemetry deltas
tel_v = laps_v.get_telemetry()
tel_l = laps_l.get_telemetry()
`,
    loading: false,
    results: null,
    error: null
  });

  const handleExecute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await analyzeF1Data(state);
      setState(prev => ({ ...prev, results: result, loading: false }));
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: "Failed to execute ML simulation. Please ensure your query is valid." 
      }));
    }
  }, [state]);

  const handleAutoComplete = async () => {
    const snippet = await generatePythonSnippet(state.pythonCode);
    setState(prev => ({ ...prev, pythonCode: prev.pythonCode + "\n" + snippet }));
  };

  return (
    <div className="flex h-screen w-screen bg-[#0a0a0c] text-slate-200 overflow-hidden">
      <Sidebar state={state} setState={setState} />

      <main className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
        {/* Header Bar */}
        <header className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
              <span className="text-red-500">FastF1</span> Manipulator
            </h2>
            <p className="text-xs text-zinc-500 font-medium">Virtual Python Environment • Scikit-learn Enabled</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-red-600 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold">ML</div>
              <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold italic">ff1</div>
            </div>
            <button 
              onClick={handleExecute}
              disabled={state.loading}
              className={`bg-white text-black font-black px-6 py-2 rounded-md uppercase italic transition-all hover:bg-red-500 hover:text-white ${state.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {state.loading ? 'Simulating...' : 'Run Analysis'}
            </button>
          </div>
        </header>

        {/* Content Grid */}
        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          {/* Left Column: Code & Inputs */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 min-h-0">
            <div className="flex-1 min-h-0">
              <CodeEditor 
                code={state.pythonCode} 
                setCode={(code) => setState(prev => ({...prev, pythonCode: code}))} 
                onGenerate={handleAutoComplete}
              />
            </div>
            
            {state.error && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-xs font-mono">
                [SYSTEM ERROR]: {state.error}
              </div>
            )}
          </div>

          {/* Right Column: Insights & Charts */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            <div className="h-[400px]">
              <VisualizationPanel 
                result={state.results} 
                loading={state.loading} 
                driver1={state.driver1} 
                driver2={state.driver2} 
              />
            </div>
            
            <InsightCard result={state.results} />

            {/* Simulated Data Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <div className="text-[10px] text-zinc-500 uppercase mb-1">Session Data</div>
                <div className="text-xl font-bold font-mono">1.2GB</div>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <div className="text-[10px] text-zinc-500 uppercase mb-1">Tele-Frames</div>
                <div className="text-xl font-bold font-mono">245,000</div>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <div className="text-[10px] text-zinc-500 uppercase mb-1">Compute Latency</div>
                <div className="text-xl font-bold font-mono text-green-500">12ms</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
