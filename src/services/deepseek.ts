import type { ChatMessage } from "../types/domain";

type DeepSeekModelKind = "chat" | "reasoning";

type DeepSeekChoice = {
  message?: {
    content?: string;
  };
};

type DeepSeekResponse = {
  choices?: DeepSeekChoice[];
  error?: {
    message?: string;
  };
};

export type CompanionTurnResult = {
  reply: string;
  tasks: Array<{
    title: string;
    description: string;
  }>;
  memories: Array<{
    title: string;
    content: string;
  }>;
};

const baseUrl =
  process.env.EXPO_PUBLIC_DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";

const modelByKind: Record<DeepSeekModelKind, string> = {
  chat: process.env.EXPO_PUBLIC_DEEPSEEK_MODEL_CHAT ?? "deepseek-v4-flash",
  reasoning:
    process.env.EXPO_PUBLIC_DEEPSEEK_MODEL_REASONING ?? "deepseek-v4-pro"
};

export async function sendDeepSeekChat({
  apiKey,
  messages,
  kind = "chat"
}: {
  apiKey: string;
  messages: ChatMessage[];
  kind?: DeepSeekModelKind;
}): Promise<string> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelByKind[kind],
      temperature: kind === "reasoning" ? 0.35 : 0.7,
      messages: [
        {
          role: "system",
          content:
            "你是伴办，一个免费开源的 AI 执行搭子。你要温和、直接、可执行。优先帮助用户把模糊想法变成下一步行动，不制造情感依赖，不假装真人。"
        },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content
        }))
      ]
    })
  });

  const data = (await response.json()) as DeepSeekResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? `DeepSeek 请求失败：${response.status}`);
  }

  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("DeepSeek 返回为空");
  }

  return content;
}

export async function sendCompanionTurn({
  apiKey,
  messages
}: {
  apiKey: string;
  messages: ChatMessage[];
}): Promise<CompanionTurnResult> {
  const responseText = await sendDeepSeekChat({
    apiKey,
    messages: [
      {
        id: "format-instruction",
        role: "user",
        content:
          "请只返回 JSON，不要 Markdown。格式：{\"reply\":\"给用户的自然语言回复\",\"tasks\":[{\"title\":\"待办标题\",\"description\":\"待办说明\"}],\"memories\":[{\"title\":\"记忆标题\",\"content\":\"值得长期记住的信息\"}]}。如果没有任务或记忆，用空数组。"
      },
      ...messages
    ],
    kind: "reasoning"
  });

  return parseCompanionTurn(responseText);
}

export function buildLocalFallback(userText: string): CompanionTurnResult {
  const reply = [
    "我先按本地模式帮你收束一下。",
    "",
    `你刚才说：「${userText}」`,
    "",
    "下一步可以这样做：",
    "1. 把这件事命名成一个具体目标。",
    "2. 写下今天只需要完成的最小动作。",
    "3. 如果超过 20 分钟还没开始，就把任务再切小一半。"
  ].join("\n");

  return {
    reply,
    tasks: [
      {
        title: userText.slice(0, 28) || "推进当前事项",
        description: "本地模式从聊天内容生成的下一步行动。"
      }
    ],
    memories: []
  };
}

function parseCompanionTurn(rawText: string): CompanionTurnResult {
  const jsonText = extractJsonObject(rawText);
  const parsed = JSON.parse(jsonText) as Partial<CompanionTurnResult>;

  return {
    reply:
      typeof parsed.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : rawText,
    tasks: normalizeTaskList(parsed.tasks),
    memories: normalizeMemoryList(parsed.memories)
  };
}

function extractJsonObject(rawText: string): string {
  const trimmed = rawText.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("模型没有返回可解析 JSON");
  }

  return trimmed.slice(start, end + 1);
}

function normalizeTaskList(
  value: unknown
): Array<{ title: string; description: string }> {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const action = item as Record<string, unknown>;
      const title = typeof action.title === "string" ? action.title.trim() : "";
      const description =
        typeof action.description === "string"
          ? action.description.trim()
          : typeof action.content === "string"
            ? action.content.trim()
            : "";

      if (!title) return null;

      return {
        title,
        description
      };
    })
    .filter((item): item is { title: string; description: string } => Boolean(item));
}

function normalizeMemoryList(
  value: unknown
): Array<{ title: string; content: string }> {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const memory = item as Record<string, unknown>;
      const title = typeof memory.title === "string" ? memory.title.trim() : "";
      const content =
        typeof memory.content === "string"
          ? memory.content.trim()
          : typeof memory.description === "string"
            ? memory.description.trim()
            : "";

      if (!title || !content) return null;

      return {
        title,
        content
      };
    })
    .filter((item): item is { title: string; content: string } => Boolean(item));
}
