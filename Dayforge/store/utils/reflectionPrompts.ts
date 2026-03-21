type ReflectionPrompt = {
  question: string;
  placeholder: string;
};

export type DailyReflectionPrompts = {
  wentWellPrompt: ReflectionPrompt;
  gratefulForPrompt: ReflectionPrompt;
};

const WENT_WELL_PROMPTS: ReflectionPrompt[] = [
  {
    question: 'What gave you energy today?',
    placeholder: 'Name a moment that gave you momentum...',
  },
  {
    question: 'What gave you the biggest sense of progress today?',
    placeholder: 'Name one concrete step that moved you forward...',
  },
  {
    question: 'What challenge did you handle better than before?',
    placeholder: 'Describe what happened and how you responded...',
  },
  {
    question: 'What is one small win you do not want to overlook?',
    placeholder: 'Capture the small thing that mattered...',
  },
  {
    question: 'Where were you most focused today?',
    placeholder: 'Note the time, context, and what helped...',
  },
  {
    question: 'What decision today made tomorrow easier?',
    placeholder: 'Write the decision and why it helped...',
  },
  {
    question: 'What did you finish that you are proud of?',
    placeholder: 'Summarize the completion and impact...',
  },
  {
    question: 'When did you show discipline today?',
    placeholder: 'Reflect on one moment you stayed consistent...',
  },
  {
    question: 'What worked in your routine today?',
    placeholder: 'Highlight one routine detail to keep...',
  },
  {
    question: 'What would make tomorrow better?',
    placeholder: 'Write one practical tweak for tomorrow...',
  },
];

const GRATEFUL_PROMPTS: ReflectionPrompt[] = [
  {
    question: 'What drained you today?',
    placeholder: 'Capture it briefly so you can respond better tomorrow...',
  },
  {
    question: 'Who or what supported you today?',
    placeholder: 'Name someone or something that helped...',
  },
  {
    question: 'What moment today made you feel grounded?',
    placeholder: 'Describe the moment and why it mattered...',
  },
  {
    question: 'What are you thankful to have right now?',
    placeholder: 'Think relationships, health, tools, or opportunities...',
  },
  {
    question: 'What comfort did you notice today?',
    placeholder: 'Capture a simple comfort you appreciated...',
  },
  {
    question: 'What did you receive today that you value?',
    placeholder: 'A kind word, insight, break, or support...',
  },
  {
    question: 'What experience today do you want to remember?',
    placeholder: 'Write the experience so you can revisit it...',
  },
  {
    question: 'What made you smile today?',
    placeholder: 'Record the small bright moment...',
  },
  {
    question: 'What part of your life feels meaningful today?',
    placeholder: 'Reflect on what felt most meaningful...',
  },
];

function hashDateKey(dateKey: string) {
  let hash = 0;

  for (let index = 0; index < dateKey.length; index += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getPromptByIndex(prompts: ReflectionPrompt[], index: number) {
  const safeIndex = Math.abs(index) % prompts.length;
  return prompts[safeIndex];
}

export function getDailyReflectionPrompts(date = new Date()): DailyReflectionPrompts {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;
  const hash = hashDateKey(dateKey);

  return {
    wentWellPrompt: getPromptByIndex(WENT_WELL_PROMPTS, hash),
    gratefulForPrompt: getPromptByIndex(GRATEFUL_PROMPTS, hash >> 1),
  };
}
