import { useCallback } from "react";
import { usePlannerStore } from "../store/plannerStore";
import { sendChatMessage } from "../utils/api";
import { parsePlanOptions, parseTimeline } from "../utils/parser";
import type { Message } from "../types";

export function usePlanner() {
  const {
    city,
    planType,
    weekendInfo,
    selectedPlanIndex,
    planOptions,
    setPlanOptions,
    setTimeline,
    setLoading,
    setError,
    addAskMessage,
  } = usePlannerStore();

  const generatePlans = useCallback(async () => {
    if (!city || !planType) {
      setError("请先选择城市和出行类别");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build prompt for generating plans
      const weekendDates = weekendInfo?.weekendDates;
      const weatherInfo = weekendInfo?.weekendWeather;

      let prompt = `请为我在${city}制定${planType}的周末计划。`;
      
      if (weekendDates) {
        prompt += `\n周末日期：${weekendDates.saturday} 和 ${weekendDates.sunday}。`;
      }

      if (weatherInfo) {
        prompt += `\n天气信息：`;
        prompt += `\n周六：${weatherInfo.saturday.temperature}，${weatherInfo.saturday.condition}；`;
        prompt += `\n周日：${weatherInfo.sunday.temperature}，${weatherInfo.sunday.condition}。`;
      }

      prompt += `\n\n请提供3-5个不同的方案，每个方案需要包含：`;
      prompt += `\n1. 方案名称`;
      prompt += `\n2. 优点（至少3条）`;
      prompt += `\n3. 缺点（至少2条）`;
      prompt += `\n\n请按照以下格式输出：`;
      prompt += `\n方案1: [方案名称]`;
      prompt += `\n优点: [优点1]，[优点2]，[优点3]`;
      prompt += `\n缺点: [缺点1]，[缺点2]`;
      prompt += `\n\n方案2: [方案名称]`;
      prompt += `\n...`;

      const messages: Array<{ role: "user" | "assistant"; content: string }> = [
        {
          role: "user",
          content: prompt,
        },
      ];

      const response = await sendChatMessage(messages);

      // Parse the response to extract plan options
      const options = parsePlanOptions(response);
      setPlanOptions(options);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "生成方案失败";
      setError(errorMessage);
      console.error("Error generating plans:", error);
    } finally {
      setLoading(false);
    }
  }, [city, planType, weekendInfo, setLoading, setError, setPlanOptions]);

  const generateTimeline = useCallback(async () => {
    if (selectedPlanIndex === null || !planOptions[selectedPlanIndex]) {
      setError("请先选择一个方案");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedPlan = planOptions[selectedPlanIndex];
      const weekendDates = weekendInfo?.weekendDates;

      let prompt = `我已经选择了以下方案：`;
      prompt += `\n方案名称：${selectedPlan.name}`;
      prompt += `\n优点：${selectedPlan.pros.join("，")}`;
      prompt += `\n缺点：${selectedPlan.cons.join("，")}`;
      
      if (weekendDates) {
        prompt += `\n\n请为我在${weekendDates.saturday}和${weekendDates.sunday}制定详细的行程安排。`;
      } else {
        prompt += `\n\n请为我制定详细的周末行程安排。`;
      }

      prompt += `\n\n要求：`;
      prompt += `\n1. 按时间顺序安排活动（从早上开始到晚上结束）`;
      prompt += `\n2. 时间格式使用24小时制（如：09:00、14:30）`;
      prompt += `\n3. 时间安排要符合实际情况，不要固定间隔（比如9点到游泳馆，下一个活动可能是12点，根据实际活动时长安排）`;
      prompt += `\n4. 每天至少安排5-8个活动`;
      prompt += `\n5. 包含具体的行动项描述`;
      prompt += `\n6. 如果活动涉及地点转换，请提供交通路线推荐（公交、地铁、驾驶或步行）`;
      prompt += `\n\n请按照以下格式输出：`;
      prompt += `\n09:00 [行动项描述]`;
      prompt += `\n路线：公交/地铁/驾驶/步行 - [具体路线描述，如：乘坐地铁1号线从A站到B站，约30分钟]`;
      prompt += `\n12:00 [行动项描述]`;
      prompt += `\n路线：驾驶 - [具体路线描述，如：驾车前往，约20分钟]`;
      prompt += `\n...`;

      const messages: Array<{ role: "user" | "assistant"; content: string }> = [
        {
          role: "user",
          content: prompt,
        },
      ];

      const response = await sendChatMessage(messages);

      // Parse the response to extract timeline
      const timeline = parseTimeline(response);
      setTimeline(timeline);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "生成行程失败";
      setError(errorMessage);
      console.error("Error generating timeline:", error);
    } finally {
      setLoading(false);
    }
  }, [
    selectedPlanIndex,
    planOptions,
    weekendInfo,
    setLoading,
    setError,
    setTimeline,
  ]);

  const askQuestion = useCallback(
    async (question: string) => {
      setLoading(true);
      setError(null);

      try {
        // Check if user wants to adjust the plan or timeline
        const isAdjustmentRequest = 
          /(调整|修改|更改|更新|重新|优化|改进|添加|删除|移除|替换)/.test(question) ||
          /(方案|计划|行程|时间线|安排)/.test(question);
        
        const isTimelineRequest = 
          /(时间线|行程|时间安排|详细安排|日程)/.test(question);
        
        const isPlanRequest = 
          /(方案|计划|选项)/.test(question) && !isTimelineRequest;

        // Build context from current state
        let contextPrompt = `你是一个周末规划助手。用户想要在当前方案基础上进行调整。\n\n`;
        
        if (selectedPlanIndex !== null && planOptions[selectedPlanIndex]) {
          const selectedPlan = planOptions[selectedPlanIndex];
          contextPrompt += `当前选择的方案信息：\n`;
          contextPrompt += `方案名称：${selectedPlan.name}\n`;
          contextPrompt += `优点：${selectedPlan.pros.join("，")}\n`;
          contextPrompt += `缺点：${selectedPlan.cons.join("，")}\n\n`;
        } else if (planOptions.length > 0) {
          contextPrompt += `当前有 ${planOptions.length} 个可选方案，但用户尚未选择。\n\n`;
        }

        if (weekendInfo) {
          contextPrompt += `城市：${weekendInfo.city}\n`;
          if (weekendInfo.weekendDates) {
            contextPrompt += `周末日期：${weekendInfo.weekendDates.saturday} 和 ${weekendInfo.weekendDates.sunday}\n`;
          }
          if (weekendInfo.weekendWeather) {
            contextPrompt += `天气信息：\n`;
            contextPrompt += `周六：${weekendInfo.weekendWeather.saturday.temperature}，${weekendInfo.weekendWeather.saturday.condition}\n`;
            contextPrompt += `周日：${weekendInfo.weekendWeather.sunday.temperature}，${weekendInfo.weekendWeather.sunday.condition}\n`;
          }
        }

        // Add instructions based on request type
        if (isAdjustmentRequest) {
          if (isTimelineRequest) {
            contextPrompt += `\n用户想要调整时间线/行程安排。请根据用户的要求生成新的时间线。`;
            contextPrompt += `\n\n要求：`;
            contextPrompt += `\n1. 按时间顺序安排活动（从早上开始到晚上结束）`;
            contextPrompt += `\n2. 时间格式使用24小时制（如：09:00、14:30）`;
            contextPrompt += `\n3. 时间安排要符合实际情况，不要固定间隔`;
            contextPrompt += `\n4. 每天至少安排5-8个活动`;
            contextPrompt += `\n5. 包含具体的行动项描述`;
            contextPrompt += `\n6. 如果活动涉及地点转换，请提供交通路线推荐（公交、地铁、驾驶或步行）`;
            contextPrompt += `\n\n请按照以下格式输出：`;
            contextPrompt += `\n09:00 [行动项描述]`;
            contextPrompt += `\n路线：公交/地铁/驾驶/步行 - [具体路线描述]`;
            contextPrompt += `\n12:00 [行动项描述]`;
            contextPrompt += `\n...`;
          } else if (isPlanRequest) {
            contextPrompt += `\n用户想要调整方案。请根据用户的要求生成新的方案选项。`;
            contextPrompt += `\n\n请提供3-5个不同的方案，每个方案需要包含：`;
            contextPrompt += `\n1. 方案名称`;
            contextPrompt += `\n2. 优点（至少3条）`;
            contextPrompt += `\n3. 缺点（至少2条）`;
            contextPrompt += `\n\n请按照以下格式输出：`;
            contextPrompt += `\n方案1: [方案名称]`;
            contextPrompt += `\n优点: [优点1]，[优点2]，[优点3]`;
            contextPrompt += `\n缺点: [缺点1]，[缺点2]`;
            contextPrompt += `\n\n方案2: [方案名称]`;
            contextPrompt += `\n...`;
          }
        }

        contextPrompt += `\n\n用户问题：${question}`;

        const messages: Array<{ role: "user" | "assistant"; content: string }> = [
          {
            role: "user",
            content: contextPrompt,
          },
        ];

        const response = await sendChatMessage(messages);

        // Add assistant response to messages
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          timestamp: Date.now(),
        };

        addAskMessage(assistantMessage);

        // If it's an adjustment request, try to parse and update the state
        if (isAdjustmentRequest) {
          if (isTimelineRequest) {
            // Try to parse as timeline
            const timeline = parseTimeline(response);
            if (timeline.length > 0) {
              setTimeline(timeline);
            }
          } else if (isPlanRequest) {
            // Try to parse as plan options
            const options = parsePlanOptions(response);
            if (options.length > 0) {
              setPlanOptions(options);
            }
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "发送问题失败";
        setError(errorMessage);
        console.error("Error asking question:", error);
      } finally {
        setLoading(false);
      }
    },
    [
      selectedPlanIndex,
      planOptions,
      weekendInfo,
      setLoading,
      setError,
      addAskMessage,
      setTimeline,
      setPlanOptions,
    ]
  );

  return {
    generatePlans,
    generateTimeline,
    askQuestion,
  };
}

