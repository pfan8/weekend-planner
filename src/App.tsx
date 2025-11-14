import { useEffect } from "react";
import { usePlannerStore } from "./store/plannerStore";
import { usePlanner } from "./hooks/usePlanner";
import { SelectionPanel } from "./components/Planner/SelectionPanel";
import { PlanOptions } from "./components/Planner/PlanOptions";
import { Timeline } from "./components/Planner/Timeline";
import { AskDialog } from "./components/Planner/AskDialog";
import { ThemeToggle } from "./components/Common/ThemeToggle";
import { Sparkles, ChevronDown } from "lucide-react";
import "./index.css";

function App() {
  const { 
    loadFromStorage, 
    planType, 
    planOptions, 
    selectedPlanIndex,
    setSelectedPlanIndex,
    timeline, 
    isLoading, 
    error 
  } = usePlannerStore();
  const { generatePlans, generateTimeline, askQuestion } = usePlanner();

  useEffect(() => {
    // Load persisted state from localStorage
    loadFromStorage();
  }, [loadFromStorage]);

  const handleGeneratePlans = async () => {
    await generatePlans();
  };

  const handleGenerateTimeline = async () => {
    await generateTimeline();
  };

  const canGeneratePlans = planType !== null;
  const showPlanOptions = planOptions.length > 0 && timeline.length === 0;
  const showTimeline = timeline.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-700 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              周末规划助手
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Plan Selector */}
            {planOptions.length > 0 && (
              <div className="relative flex items-center gap-2">
                <label className="sr-only">选择方案</label>
                <select
                  value={selectedPlanIndex ?? ""}
                  onChange={(e) => {
                    const index = e.target.value === "" ? null : parseInt(e.target.value);
                    setSelectedPlanIndex(index);
                  }}
                  className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 text-sm font-medium text-gray-900 shadow-sm transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-100 dark:hover:border-blue-500 dark:focus:border-blue-400"
                  title={selectedPlanIndex !== null ? `当前方案: ${planOptions[selectedPlanIndex]?.name}` : "选择方案"}
                >
                  <option value="">
                    {selectedPlanIndex === null ? "选择方案" : "未选择"}
                  </option>
                  {planOptions.map((plan, index) => (
                    <option key={plan.id} value={index}>
                      {index === selectedPlanIndex ? "✓ " : ""}方案 {index + 1}: {plan.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              </div>
            )}
            
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="space-y-8">
          {/* Selection Panel */}
          <section className="rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-xl backdrop-blur-2xl dark:border-gray-700 dark:bg-slate-900/70">
            <SelectionPanel />
          </section>

          {/* Generate Plans Button */}
          {!showPlanOptions && !showTimeline && (
            <section className="flex justify-center">
              <button
                onClick={handleGeneratePlans}
                disabled={!canGeneratePlans || isLoading}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-12 py-4 text-lg font-semibold text-white shadow-2xl transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    正在生成方案...
                  </span>
                ) : (
                  "生成周末方案"
                )}
              </button>
            </section>
          )}

          {/* Error Message */}
          {error && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              <p className="text-sm font-medium">{error}</p>
            </section>
          )}

          {/* Plan Options */}
          {showPlanOptions && (
            <section className="rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-xl backdrop-blur-2xl dark:border-gray-700 dark:bg-slate-900/70">
              <PlanOptions onGenerateTimeline={handleGenerateTimeline} />
            </section>
          )}

          {/* Timeline */}
          {showTimeline && (
            <section className="rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-xl backdrop-blur-2xl dark:border-gray-700 dark:bg-slate-900/70">
              <Timeline />
            </section>
          )}

          {/* Empty State */}
          {!showPlanOptions && !showTimeline && canGeneratePlans && !isLoading && (
            <section className="flex h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white/50 dark:border-gray-700 dark:bg-slate-800/50">
              <div className="text-center">
                <Sparkles className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">
                  点击上方按钮开始生成周末方案
                </p>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Ask Dialog */}
      <AskDialog onSendMessage={askQuestion} isLoading={isLoading} />
    </div>
  );
}

export default App;
