import { useEffect, useCallback } from "react";
import { usePlannerStore } from "../../store/plannerStore";
import { getWeekendWeather } from "../../utils/api";
import type { PlanType } from "../../types";
import { Calendar, MapPin, Cloud, Sun } from "lucide-react";

const CITIES = ["杭州", "北京", "上海", "广州", "深圳", "成都", "南京", "苏州"];

export function SelectionPanel() {
  const {
    city,
    planType,
    weekendInfo,
    isLoadingWeather,
    setCity,
    setPlanType,
    setWeekendInfo,
    setLoadingWeather,
  } = usePlannerStore();

  const loadWeekendWeather = useCallback(async () => {
    setLoadingWeather(true);
    try {
      const weatherData = await getWeekendWeather(city);
      setWeekendInfo({
        city: weatherData.city,
        currentDate: weatherData.currentDate,
        currentWeather: weatherData.currentWeather,
        weekendDates: weatherData.weekendDates,
        weekendWeather: weatherData.weekendWeather,
      });
    } catch (error) {
      console.error("Failed to load weather:", error);
    } finally {
      setLoadingWeather(false);
    }
  }, [city, setLoadingWeather, setWeekendInfo]);

  // Load weekend weather when city changes
  useEffect(() => {
    if (city) {
      loadWeekendWeather();
    }
  }, [city, loadWeekendWeather]);

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
  };

  const handlePlanTypeChange = (type: PlanType) => {
    setPlanType(type);
  };

  return (
    <div className="w-full space-y-6">
      {/* Selection Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* City Selection */}
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <select
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-100"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Plan Type Selection */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            出行类别：
          </span>
          <div className="flex gap-2">
            {(["旅游", "运动"] as PlanType[]).map((type) => (
              <button
                key={type}
                onClick={() => handlePlanTypeChange(type)}
                className={`rounded-xl px-6 py-2 text-sm font-semibold transition-all ${
                  planType === type
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Weather Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Current Date & Weather */}
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-lg dark:border-gray-700 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              今天
            </h3>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {weekendInfo?.currentDate || new Date().toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {weekendInfo?.currentWeather && (
            <div className="mt-3 flex items-center gap-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {weekendInfo.currentWeather.temperature} {weekendInfo.currentWeather.condition}
              </span>
            </div>
          )}
        </div>

        {/* Saturday Weather */}
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-lg dark:border-gray-700 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3 mb-3">
            <Cloud className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              周六
            </h3>
          </div>
          {isLoadingWeather ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
              <span className="text-sm text-gray-600 dark:text-gray-400">加载中...</span>
            </div>
          ) : weekendInfo?.weekendWeather?.saturday ? (
            <>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {weekendInfo.weekendDates.saturday}
              </p>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {weekendInfo.weekendWeather.saturday.temperature}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {weekendInfo.weekendWeather.saturday.condition}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">暂无数据</p>
          )}
        </div>

        {/* Sunday Weather */}
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-pink-50 to-pink-100 p-6 shadow-lg dark:border-gray-700 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3 mb-3">
            <Cloud className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              周日
            </h3>
          </div>
          {isLoadingWeather ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-pink-600 border-t-transparent" />
              <span className="text-sm text-gray-600 dark:text-gray-400">加载中...</span>
            </div>
          ) : weekendInfo?.weekendWeather?.sunday ? (
            <>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {weekendInfo.weekendDates.sunday}
              </p>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {weekendInfo.weekendWeather.sunday.temperature}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {weekendInfo.weekendWeather.sunday.condition}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">暂无数据</p>
          )}
        </div>
      </div>
    </div>
  );
}

