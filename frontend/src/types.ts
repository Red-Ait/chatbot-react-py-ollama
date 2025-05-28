export interface Message  {
    role: 'user' | 'assistant';
    content: string;
    duration?: number;
    provider?: string;
    status?: 'success' | 'error'
  };
  
export  type Metric = {
    id: number;
    executed_at: string;
    provider: string;
    user_input: string;
    generated_sql_status: string;
    generated_interpretation_status: string;
    generated_sql_duration_ms: number;
    generated_interpretation_duration_ms: number;
  };
  