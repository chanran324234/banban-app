import type { ChatMessage, MemoryItem, TaskItem } from "../types/domain";
import { sendDeepSeekChat } from "./deepseek";

export type WorkflowKind = "daily_plan" | "night_review" | "project_breakdown";

export type WorkflowResult = {
  title: string;
  summary: string;
  sections: Array<{
    heading: string;
    items: string[];
  }>;
  tasks: Array<{
    title: string;
    description: string;
  }>;
};

type WorkflowContext = {
  tasks: TaskItem[];
  memories: MemoryItem[];
  messages: ChatMessage[];
  projectGoal?: string;
};

const workflowLabels: Record<WorkflowKind, string> = {
  daily_plan: "每日计划",
  night_review: "晚间复盘",
  project_breakdown: "项目拆解"
};

export async function runWorkflow({
  apiKey,
  kind,
  context
}: {
  apiKey: string;
  kind: WorkflowKind;
  context: WorkflowContext;
}): Promise<WorkflowResult> {
  const responseText = await sendDeepSeekChat({
    apiKey,
    kind: "reasoning",
    messages: [
      {
        id: `workflow-${kind}`,
        role: "user",
        content: buildWorkflowPrompt(kind, context)
      }
    ]
  });

  return parseWorkflowResult(responseText);
}

export function buildLocalWorkflowResult(
  kind: WorkflowKind,
  context: WorkflowContext
): WorkflowResult {
  const openTasks = context.tasks.filter((task) => task.status !== "done");
  const doneTasks = context.tasks.filter((task) => task.status === "done");
  const projectGoal = context.projectGoal?.trim() || "把伴办做成可上架的免费开源应用";

  if (kind === "night_review") {
    return {
      title: "晚间复盘",
      summary: "今天先把已经推进的事看见，再把明天第一步放小。",
      sections: [
        {
          heading: "完成",
          items: doneTasks.length
            ? doneTasks.slice(0, 3).map((task) => task.title)
            : ["今天还没有标记完成的任务。"]
        },
        {
          heading: "卡点",
          items: openTasks.slice(0, 3).map((task) => task.title)
        },
        {
          heading: "明天第一步",
          items: [openTasks[0]?.title ?? "写下明天最重要的一件事。"]
        }
      ],
      tasks: [
        {
          title: "写下明天第一步",
          description: "晚间复盘本地模式生成的任务。"
        }
      ]
    };
  }

  if (kind === "project_breakdown") {
    return {
      title: "项目拆解",
      summary: `先把「${projectGoal}」拆成可推进的第一阶段，不追求一次做完。`,
      sections: [
        {
          heading: "目标定义",
          items: [projectGoal, "第一版重点是可演示、可验证、可继续迭代。"]
        },
        {
          heading: "里程碑",
          items: ["跑通核心体验。", "完成数据与合规底座。", "准备上架材料和开源仓库。"]
        },
        {
          heading: "风险",
          items: ["范围膨胀。", "模型 Key 和用户数据处理不清晰。", "上架合规材料不足。"]
        },
        {
          heading: "下一批任务",
          items: ["写清项目 README。", "补充真实设备测试。", "梳理 App Store 提交清单。"]
        }
      ],
      tasks: [
        {
          title: "写项目第一阶段里程碑",
          description: `围绕「${projectGoal}」列出 3 个可验收里程碑。`
        },
        {
          title: "整理上架提交清单",
          description: "列出隐私、协议、截图、应用描述、测试账号等材料。"
        },
        {
          title: "准备开源仓库 README",
          description: "说明安装、DeepSeek Key、数据存储和贡献方式。"
        }
      ]
    };
  }

  return {
    title: "今日计划",
    summary: "今天只抓三个重点，先让项目继续动起来。",
    sections: [
      {
        heading: "三个重点",
        items: openTasks.length
          ? openTasks.slice(0, 3).map((task) => task.title)
          : ["补充今天要推进的任务。"]
      },
      {
        heading: "时间块",
        items: ["先安排一个 25 分钟启动块。", "中段处理最重的任务。", "收尾时更新任务状态。"]
      },
      {
        heading: "风险提醒",
        items: ["如果卡住超过 20 分钟，就把任务再切小一半。"]
      }
    ],
    tasks: [
      {
        title: openTasks[0]?.title ?? "完成今天第一个启动块",
        description: "今日计划本地模式生成的任务。"
      }
    ]
  };
}

export function formatWorkflowForChat(result: WorkflowResult): string {
  return [
    `## ${result.title}`,
    "",
    result.summary,
    "",
    ...result.sections.flatMap((section) => [
      `### ${section.heading}`,
      ...section.items.map((item) => `- ${item}`),
      ""
    ])
  ].join("\n");
}

function buildWorkflowPrompt(
  kind: WorkflowKind,
  context: WorkflowContext
): string {
  return [
    `请为用户生成「${workflowLabels[kind]}」。`,
    "只返回 JSON，不要 Markdown，不要解释 JSON 格式。",
    "格式：{\"title\":\"标题\",\"summary\":\"摘要\",\"sections\":[{\"heading\":\"小标题\",\"items\":[\"要点\"]}],\"tasks\":[{\"title\":\"待办标题\",\"description\":\"待办说明\"}]}。",
    "要求：温和、直接、可执行；不要制造情感依赖；不要替代医疗、法律、金融等专业建议。",
    "",
    `当前任务：${JSON.stringify(context.tasks.slice(0, 20))}`,
    `长期记忆：${JSON.stringify(context.memories.slice(0, 12))}`,
    `最近聊天：${JSON.stringify(context.messages.slice(-12))}`,
    context.projectGoal ? `项目目标：${context.projectGoal}` : "",
    "",
    getWorkflowRequirements(kind)
  ].join("\n");
}

function getWorkflowRequirements(kind: WorkflowKind): string {
  if (kind === "daily_plan") {
    return "每日计划必须包含：三个重点、时间块、风险提醒。";
  }

  if (kind === "night_review") {
    return "晚间复盘必须包含：完成、卡点、明天第一步。";
  }

  return "项目拆解必须包含：目标定义、里程碑、风险、下一批任务。建议输出 3 到 6 个可执行任务。";
}

function parseWorkflowResult(rawText: string): WorkflowResult {
  const parsed = JSON.parse(extractJsonObject(rawText)) as Partial<WorkflowResult>;

  return {
    title:
      typeof parsed.title === "string" && parsed.title.trim()
        ? parsed.title.trim()
        : "工作流结果",
    summary:
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : rawText,
    sections: normalizeSections(parsed.sections),
    tasks: normalizeTasks(parsed.tasks)
  };
}

function extractJsonObject(rawText: string): string {
  const trimmed = rawText.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("工作流没有返回可解析 JSON");
  }

  return trimmed.slice(start, end + 1);
}

function normalizeSections(value: unknown): WorkflowResult["sections"] {
  if (!Array.isArray(value)) return [];

  return value
    .map((section) => {
      if (!section || typeof section !== "object") return null;
      const record = section as Record<string, unknown>;
      const heading =
        typeof record.heading === "string" ? record.heading.trim() : "";
      const items = Array.isArray(record.items)
        ? record.items.filter((item): item is string => typeof item === "string")
        : [];

      if (!heading || !items.length) return null;

      return {
        heading,
        items: items.map((item) => item.trim()).filter(Boolean)
      };
    })
    .filter((section): section is WorkflowResult["sections"][number] =>
      Boolean(section)
    );
}

function normalizeTasks(value: unknown): WorkflowResult["tasks"] {
  if (!Array.isArray(value)) return [];

  return value
    .map((task) => {
      if (!task || typeof task !== "object") return null;
      const record = task as Record<string, unknown>;
      const title = typeof record.title === "string" ? record.title.trim() : "";
      const description =
        typeof record.description === "string"
          ? record.description.trim()
          : "";

      if (!title) return null;

      return {
        title,
        description
      };
    })
    .filter((task): task is WorkflowResult["tasks"][number] => Boolean(task));
}
