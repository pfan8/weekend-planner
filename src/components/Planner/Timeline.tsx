import { usePlannerStore } from "../../store/plannerStore";
import { MapPin, Navigation, Car, Bus, Train, Footprints, Trash2, RotateCcw } from "lucide-react";

export function Timeline() {
  const { timeline, reset, selectedPlanIndex, planOptions } = usePlannerStore();

  if (timeline.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white/50 dark:border-gray-700 dark:bg-slate-800/50">
        <p className="text-gray-500 dark:text-gray-400">暂无行程安排</p>
      </div>
    );
  }

  const getRouteIcon = (type?: string) => {
    switch (type) {
      case "公交":
        return <Bus className="h-4 w-4" />;
      case "驾驶":
        return <Car className="h-4 w-4" />;
      case "地铁":
        return <Train className="h-4 w-4" />;
      case "步行":
        return <Footprints className="h-4 w-4" />;
      default:
        return <Navigation className="h-4 w-4" />;
    }
  };

  const getRouteColor = (type?: string) => {
    switch (type) {
      case "公交":
        return "text-blue-600 dark:text-blue-400";
      case "驾驶":
        return "text-green-600 dark:text-green-400";
      case "地铁":
        return "text-purple-600 dark:text-purple-400";
      case "步行":
        return "text-orange-600 dark:text-orange-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const handleReset = () => {
    if (confirm("确定要重置所有方案和行程吗？此操作将清除所有已保存的数据。")) {
      reset();
    }
  };

  const handleClearTimeline = () => {
    if (confirm("确定要清除当前行程安排吗？")) {
      usePlannerStore.getState().setTimeline([]);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            详细行程安排
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClearTimeline}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
            title="清除当前行程"
          >
            <Trash2 className="h-4 w-4" />
            清除行程
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/20"
            title="重置所有数据"
          >
            <RotateCcw className="h-4 w-4" />
            重置全部
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400" />

        <div className="space-y-6">
          {timeline.map((item, index) => (
            <div key={item.id} className="relative flex items-start gap-6">
              {/* Time circle - 只显示时间，不显示 icon */}
              <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50 dark:from-blue-600 dark:to-purple-700">
                <span className="text-sm font-bold text-white">{item.time}</span>
              </div>

              {/* Action card */}
              <div className="flex-1 rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-lg dark:border-gray-700 dark:bg-slate-800">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {item.action}
                    </p>
                    {/* Route information */}
                    {item.route && (
                      <div className={`flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-slate-700/50 ${getRouteColor(item.route.type)}`}>
                        {getRouteIcon(item.route.type)}
                        <span className="text-sm font-medium">
                          {item.route.type}：{item.route.description}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

