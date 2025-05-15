export type Message = {
    role: 'user' | 'assistant';
    content: string;
    duration: number;
    provider: string;
  };
  