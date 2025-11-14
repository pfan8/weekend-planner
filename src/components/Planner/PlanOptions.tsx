import { usePlannerStore } from "../../store/plannerStore";
import { CheckCircle, XCircle, Sparkles, RotateCcw, Check } from "lucide-react";

interface PlanOptionsProps {
  onGenerateTimeline: () => void;
}

export function PlanOptions({ onGenerateTimeline }: PlanOptionsProps) {
  const { planOptions, selectedPlanIndex, setSelectedPlanIndex, isLoading, reset } =
    usePlannerStore();

  if (planOptions.length === 0) {
    return null;
  }

  const handleSelectChange = (index: number) => {
    setSelectedPlanIndex(index);
  };

  const selectedPlan = selectedPlanIndex !== null ? planOptions[selectedPlanIndex] : null;

  const handleReset = () => {
    if (confirm("确定要重置所有方案和行程吗？此操作将清除所有已保存的数据。")) {
      reset();
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with reset button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          可选方案
        </h2>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/20"
          title="重置所有数据"
        >
          <RotateCcw className="h-4 w-4" />
          重置全部
        </button>
      </div>

      {/* Plan Options Display */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {planOptions.map((plan, index) => (
          <div
            key={plan.id}
            onClick={() => handleSelectChange(index)}
            className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all ${
              selectedPlanIndex === index
                ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20 dark:border-blue-400 dark:bg-blue-900/20"
                : "border-gray-200 bg-white shadow-md hover:border-blue-300 hover:shadow-lg dark:border-gray-700 dark:bg-slate-800 dark:hover:border-blue-600"
            }`}
          >
            {/* Selected indicator */}
            {selectedPlanIndex === index && (
              <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-md dark:bg-blue-500">
                <Check className="h-5 w-5" />
              </div>
            )}
            
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                方案 {index + 1}
              </h3>
            </div>
            
            <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
              {plan.name}
            </h4>

            {/* Pros */}
            <div className="mb-4">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  优点
                </span>
              </div>
              <ul className="ml-6 space-y-1">
                {plan.pros.map((pro, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    • {pro}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                  缺点
                </span>
              </div>
              <ul className="ml-6 space-y-1">
                {plan.cons.map((con, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    • {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Selection and Action */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-slate-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              选择方案
            </label>
            <select
              value={selectedPlanIndex ?? ""}
              onChange={(e) => handleSelectChange(parseInt(e.target.value))}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-slate-700 dark:text-gray-100"
            >
              <option value="">请选择一个方案</option>
              {planOptions.map((plan, index) => (
                <option key={plan.id} value={index}>
                  方案 {index + 1}: {plan.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onGenerateTimeline}
            disabled={selectedPlanIndex === null || isLoading}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                生成中...
              </span>
            ) : (
              "生成详细行程"
            )}
          </button>
        </div>

        {selectedPlan && (
          <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">已选择：</span>
              {selectedPlan.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

