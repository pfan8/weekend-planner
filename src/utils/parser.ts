import type { PlanOption, TimelineItem } from "../types";

/**
 * Parse plan options from AI response text
 * Handles various formats like:
 * - 方案1: [名称]
 *   优点: ...
 *   缺点: ...
 * - 方案一: [名称]
 *   优点：...
 *   缺点：...
 */
export function parsePlanOptions(text: string): PlanOption[] {
  const options: PlanOption[] = [];
  
  // Split by common plan separators
  const planPatterns = [
    /方案[一二三四五六七八九十\d]+[:：]\s*([^\n]+)/g,
    /方案\s*[1-5][:：]\s*([^\n]+)/g,
    /^([^\n]+方案[^\n]*)$/gm,
  ];
  
  let matches: RegExpMatchArray[] = [];
  
  // Try different patterns
  for (const pattern of planPatterns) {
    const found = Array.from(text.matchAll(pattern));
    if (found.length > 0) {
      matches = found;
      break;
    }
  }
  
  // If no structured format found, try to split by numbered items
  if (matches.length === 0) {
    // Try to find numbered sections
    const numberedPattern = /(?:^|\n)(?:方案|选项|方案)[\s]*([1-5])[:：]\s*([^\n]+)/g;
    matches = Array.from(text.matchAll(numberedPattern));
  }
  
  // Extract plan names
  const planNames: string[] = [];
  matches.forEach((match) => {
    const name = match[1] || match[2] || "";
    if (name.trim()) {
      planNames.push(name.trim());
    }
  });
  
  // If we found plan names, extract pros and cons for each
  if (planNames.length > 0) {
    const sections = text.split(/(?:方案[一二三四五六七八九十\d]+|方案\s*[1-5])[:：]/);
    
    planNames.forEach((name, index) => {
      const sectionIndex = index + 1;
      if (sectionIndex < sections.length) {
        const section = sections[sectionIndex];
        
        // Extract pros
        const prosPattern = /优点[:：]\s*([^\n]+(?:\n(?!缺点|方案)[^\n]+)*)/i;
        const prosMatch = section.match(prosPattern);
        const pros = prosMatch
          ? prosMatch[1]
              .split(/[，,、\n]/)
              .map((p) => p.trim())
              .filter((p) => p.length > 0)
          : [];
        
        // Extract cons
        const consPattern = /缺点[:：]\s*([^\n]+(?:\n(?!方案|优点)[^\n]+)*)/i;
        const consMatch = section.match(consPattern);
        const cons = consMatch
          ? consMatch[1]
              .split(/[，,、\n]/)
              .map((c) => c.trim())
              .filter((c) => c.length > 0)
          : [];
        
        options.push({
          id: `plan-${index + 1}`,
          name: name,
          pros: pros.length > 0 ? pros : ["暂无优点信息"],
          cons: cons.length > 0 ? cons : ["暂无缺点信息"],
        });
      } else {
        // Fallback: create option with just name
        options.push({
          id: `plan-${index + 1}`,
          name: name,
          pros: ["暂无优点信息"],
          cons: ["暂无缺点信息"],
        });
      }
    });
  } else {
    // Fallback: try to extract any structured information
    // Split by lines and look for patterns
    const lines = text.split("\n");
    let currentPlan: Partial<PlanOption> | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this is a plan name line
      if (line.match(/^(方案|选项)[\s\d一二三四五六七八九十]+[:：]/)) {
        if (currentPlan && currentPlan.name) {
          options.push({
            id: `plan-${options.length + 1}`,
            name: currentPlan.name,
            pros: currentPlan.pros || ["暂无优点信息"],
            cons: currentPlan.cons || ["暂无缺点信息"],
          });
        }
        
        const nameMatch = line.match(/[:：]\s*(.+)/);
        currentPlan = {
          name: nameMatch ? nameMatch[1].trim() : line,
          pros: [],
          cons: [],
        };
      } else if (currentPlan) {
        // Check for pros/cons
        if (line.match(/^优点[:：]/i)) {
          const prosText = line.replace(/^优点[:：]\s*/i, "");
          if (prosText) {
            currentPlan.pros = prosText.split(/[，,、]/).map((p) => p.trim());
          }
        } else if (line.match(/^缺点[:：]/i)) {
          const consText = line.replace(/^缺点[:：]\s*/i, "");
          if (consText) {
            currentPlan.cons = consText.split(/[，,、]/).map((c) => c.trim());
          }
        }
      }
    }
    
    // Add last plan
    if (currentPlan && currentPlan.name) {
      options.push({
        id: `plan-${options.length + 1}`,
        name: currentPlan.name,
        pros: currentPlan.pros && currentPlan.pros.length > 0 ? currentPlan.pros : ["暂无优点信息"],
        cons: currentPlan.cons && currentPlan.cons.length > 0 ? currentPlan.cons : ["暂无缺点信息"],
      });
    }
  }
  
  // If still no options found, create a default one
  if (options.length === 0) {
    options.push({
      id: "plan-1",
      name: "默认方案",
      pros: ["请查看AI返回的完整内容"],
      cons: ["无法解析方案结构"],
    });
  }
  
  return options;
}

/**
 * Parse timeline from AI response text
 * Handles various time formats:
 * - 09:00
 * - 9点
 * - 上午9点
 * - 9:00 AM
 * Also parses route information if available
 */
export function parseTimeline(text: string): TimelineItem[] {
  const timeline: TimelineItem[] = [];
  
  // Split text into lines for better parsing
  const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
  
  // Time patterns to match
  const timePatterns = [
    /^(\d{1,2}):(\d{2})\s*(.+)$/, // 09:00 format
    /^(\d{1,2})点\s*(.+)$/, // 9点 format
    /^(上午|下午|晚上|凌晨)(\d{1,2})点\s*(.+)$/, // 上午9点 format
    /^(\d{1,2}):(\d{2})\s*(AM|PM|上午|下午|晚上|凌晨)\s*(.+)$/i, // 9:00 AM format
  ];
  
  // Route pattern
  const routePattern = /^路线[：:]\s*(公交|地铁|驾驶|步行)[\s-]*(.+)$/i;
  
  const allMatches: Array<{ 
    time: string; 
    action: string; 
    route?: { type: "公交" | "驾驶" | "步行" | "地铁"; description: string };
    order: number;
    lineIndex: number;
  }> = [];
  
  // Parse each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let matched = false;
    
    // Try time patterns
    for (const pattern of timePatterns) {
      const match = line.match(pattern);
      if (match) {
        let timeStr = "";
        let action = "";
        
        if (pattern === timePatterns[0]) {
          // 09:00 format
          const hours = match[1].padStart(2, "0");
          const minutes = match[2];
          timeStr = `${hours}:${minutes}`;
          action = match[3]?.trim() || "";
        } else if (pattern === timePatterns[1]) {
          // 9点 format
          const hour = parseInt(match[1]);
          timeStr = `${hour.toString().padStart(2, "0")}:00`;
          action = match[2]?.trim() || "";
        } else if (pattern === timePatterns[2]) {
          // 上午9点 format
          const period = match[1];
          const hour = parseInt(match[2]);
          let hour24 = hour;
          
          if (period === "下午" || period === "晚上") {
            hour24 = hour === 12 ? 12 : hour + 12;
          } else if (period === "凌晨" && hour === 12) {
            hour24 = 0;
          }
          
          timeStr = `${hour24.toString().padStart(2, "0")}:00`;
          action = match[3]?.trim() || "";
        } else if (pattern === timePatterns[3]) {
          // 9:00 AM format
          const hours = parseInt(match[1]);
          const minutes = match[2];
          const period = match[3]?.toUpperCase() || "";
          
          let hour24 = hours;
          if (period === "PM" || period === "下午" || period === "晚上") {
            hour24 = hours === 12 ? 12 : hours + 12;
          } else if (period === "AM" || period === "上午" || period === "凌晨") {
            hour24 = hours === 12 ? 0 : hours;
          }
          
          timeStr = `${hour24.toString().padStart(2, "0")}:${minutes}`;
          action = match[4]?.trim() || "";
        }
        
        if (timeStr && action) {
          // Calculate order for sorting
          const [h, m] = timeStr.split(":").map(Number);
          const order = h * 60 + m;
          
          // Check if next line is a route
          let route: { type: "公交" | "驾驶" | "步行" | "地铁"; description: string } | undefined;
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1];
            const routeMatch = nextLine.match(routePattern);
            if (routeMatch) {
              const routeType = routeMatch[1] as "公交" | "驾驶" | "步行" | "地铁";
              const routeDesc = routeMatch[2]?.trim() || "";
              if (routeDesc) {
                route = { type: routeType, description: routeDesc };
                i++; // Skip the route line
              }
            }
          }
          
          allMatches.push({ 
            time: timeStr, 
            action, 
            route,
            order,
            lineIndex: i 
          });
          matched = true;
          break;
        }
      }
    }
    
    // If no time pattern matched, check if it's a route line (might be standalone)
    if (!matched) {
      const routeMatch = line.match(routePattern);
      if (routeMatch && allMatches.length > 0) {
        // Attach route to the last timeline item
        const lastItem = allMatches[allMatches.length - 1];
        if (!lastItem.route) {
          const routeType = routeMatch[1] as "公交" | "驾驶" | "步行" | "地铁";
          const routeDesc = routeMatch[2]?.trim() || "";
          if (routeDesc) {
            lastItem.route = { type: routeType, description: routeDesc };
          }
        }
      }
    }
  }
  
  // Sort by time and remove duplicates (keep first occurrence)
  const uniqueMatches = Array.from(
    new Map(allMatches.map((m) => [m.time, m])).values()
  ).sort((a, b) => a.order - b.order);
  
  // Convert to TimelineItem format
  uniqueMatches.forEach((match, index) => {
    timeline.push({
      id: `timeline-${index + 1}`,
      time: match.time,
      action: match.action,
      route: match.route,
    });
  });
  
  // If no structured timeline found, try to extract from list format
  if (timeline.length === 0) {
    // Look for numbered or bulleted lists
    const listPattern = /(?:^|\n)[\s]*[•\-\d\.]+[\s]*([^\n]+)/g;
    const listMatches = Array.from(text.matchAll(listPattern));
    
    listMatches.forEach((match, index) => {
      const action = match[1]?.trim() || "";
      if (action) {
        // Try to extract time from action text
        const timeMatch = action.match(/(\d{1,2}):(\d{2})|(\d{1,2})点/);
        let timeStr = "";
        
        if (timeMatch) {
          if (timeMatch[1] && timeMatch[2]) {
            timeStr = `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
          } else if (timeMatch[3]) {
            timeStr = `${timeMatch[3].padStart(2, "0")}:00`;
          }
        }
        
        // Only add if we found a time, don't use fixed intervals
        if (timeStr) {
          timeline.push({
            id: `timeline-${index + 1}`,
            time: timeStr,
            action: action.replace(/(\d{1,2}):(\d{2})|(\d{1,2})点/, "").trim() || action,
          });
        }
      }
    });
  }
  
  return timeline;
}

