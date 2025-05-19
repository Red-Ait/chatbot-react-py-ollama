export interface Message  {
    role: 'user' | 'assistant';
    content: string;
    duration?: number;
    provider?: string;
    status?: 'success' | 'error'
  };
  