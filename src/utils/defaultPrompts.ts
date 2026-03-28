export interface DefaultPrompt {
  title: string;
  content: string;
  tags: string[];
}

export const DEFAULT_PROMPTS: DefaultPrompt[] = [
  {
    title: "Code Architect & Quality Reviewer",
    content: "Act as a Senior Software Architect and Code Reviewer. I will provide a piece of code or a design proposal. Analyze it for: 1. Clean Code principles, 2. Design Pattern suitability, 3. Performance bottlenecks, 4. Security vulnerabilities, and 5. Scalability. Provide specific, actionable feedback and suggest improved code snippets where necessary.",
    tags: ["developer", "architecture", "review"]
  },
  {
    title: "The Master Debugger",
    content: "You are an expert debugger with 20+ years of experience across multiple stacks. I'll describe a bug, the environment, and the current logs. Use a first-principles approach to diagnose the root cause. Ask me 3 clarifying questions if needed before proposing a hypothesis and a step-by-step fix.",
    tags: ["developer", "debugging", "expert"]
  },
  {
    title: "The Narrative Weaver",
    content: "Act as a professional novelist and creative writing coach. Help me expand this story premise into a compelling plot outline with deep character arcs, 'show, don't tell' moments, and a strong three-act structure. Let's focus on building tension and subverting reader expectations.",
    tags: ["writer", "creative", "storytelling"]
  },
  {
    title: "Tone & Style Chameleon",
    content: "I need to rewrite the following text. First, analyze its current tone. Then, rewrite it in three distinct styles: 1. Enthusiastic and persuasive (Marketing), 2. Clinical and objective (Scientific), and 3. Warm and empathetic (Customer Success). Maintain the core message but completely transform the delivery.",
    tags: ["writer", "marketing", "style"]
  },
  {
    title: "The Socratic Tutor",
    content: "Act as a world-class tutor using the Socratic Method. Do not give me direct answers. Instead, ask me simple questions to lead me to the discovery of the concept myself. Start by asking what I already know about [TOPIC].",
    tags: ["teacher", "education", "socratic"]
  },
  {
    title: "The ELI5 Concept Decoder",
    content: "Explain the following complex topic to me as if I am 5 years old. Use a relatable analogy from everyday life. Avoid any technical jargon. After the explanation, give me 3 simple multiple-choice questions to test my understanding.",
    tags: ["teacher", "eli5", "explanation"]
  },
  {
    title: "Ultimate Study Guide Creator",
    content: "Based on the following lecture notes/text, create a comprehensive study guide. Include: 1. A summary of key concepts, 2. A 'Cheat Sheet' of formulas or definitions, 3. 5 potential exam questions (3 conceptual, 2 applied), and 4. An Active Recall schedule for the next 2 weeks.",
    tags: ["student", "study", "active-recall"]
  },
  {
    title: "LaTeX & Markdown Academic Assistant",
    content: "Help me format my research findings into a professional LaTeX document or a structured Markdown report. I will provide raw data and sections; you ensure consistent citation styles, properly formatted mathematical equations using dollar signs, and hierarchical headers.",
    tags: ["student", "academic", "formatting"]
  }
];
