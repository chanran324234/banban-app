import type {
  ChatMessage,
  MemoryItem,
  SetupState,
  TaskItem
} from "../types/domain";

export const storageKeys = {
  tasks: "banban.tasks",
  memories: "banban.memories",
  chatMessages: "banban.chat.messages",
  reminders: "banban.reminders",
  setup: "banban.setup"
} as const;

export const initialSetupState: SetupState = {
  hasCompletedIntro: false,
  hasRunWorkflow: false
};

export const initialTasks: TaskItem[] = [
  {
    id: "task-1",
    title: "确定伴办第一版体验边界",
    description: "聚焦陪伴聊天、任务拆解、每日复盘、用户自带 Key。",
    status: "in_progress",
    priority: "high"
  },
  {
    id: "task-2",
    title: "跑通 DeepSeek V4 聊天接口",
    description: "设置页保存 Key 后，在聊天页进行真实调用。",
    status: "todo",
    priority: "high"
  },
  {
    id: "task-3",
    title: "准备应用商城基础合规材料",
    description: "隐私政策、用户协议、删除数据入口、AI 内容说明。",
    status: "todo",
    priority: "medium"
  }
];

export const initialMemories: MemoryItem[] = [
  {
    id: "memory-1",
    type: "goal",
    title: "正在做免费开源 AIGC App",
    content: "目标是做一个 AI 陪伴 + 工作流自动化软件，并准备上架应用商城。"
  },
  {
    id: "memory-2",
    type: "preference",
    title: "产品方向",
    content: "优先做能推进任务的陪伴感，不做虚拟恋人和成人陪聊。"
  }
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: "assistant-seed",
    role: "assistant",
    content:
      "燃哥，今天我们可以先抓一个最小推进点。你把脑子里那团事直接丢给我，我来帮你拆。"
  }
];
