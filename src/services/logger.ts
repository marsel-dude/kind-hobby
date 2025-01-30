import { supabase } from '../lib/supabase';

export type LogLevel = 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error_details?: Record<string, any>;
  user_id?: string;
  session_id?: string;
  component?: string;
  stack_trace?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private static instance: Logger;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second
  
  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async retryOperation(operation: () => Promise<any>, retries = this.maxRetries): Promise<any> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.retryOperation(operation, retries - 1);
      }
      throw error;
    }
  }

  private formatError(error: Error): Record<string, any> {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    };
  }

  async log(entry: LogEntry) {
    const logData = {
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
      environment: import.meta.env.MODE,
      version: import.meta.env.VITE_APP_VERSION,
      error_details: entry.error_details ? this.formatError(entry.error_details as any) : undefined,
      metadata: {
        ...entry.metadata,
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
    };

    // Console logging with proper formatting
    const logPrefix = `[${entry.level}] ${entry.timestamp}`;
    const logColor = this.getLogColor(entry.level);
    
    console.log(
      `%c${logPrefix}`,
      `color: ${logColor}; font-weight: bold`,
      {
        ...logData,
        component: entry.component,
        context: entry.context,
      }
    );

    // Store in Supabase if configured
    if (supabase) {
      try {
        await this.retryOperation(async () => {
          const { error } = await supabase
            .from('error_logs')
            .insert([logData]);

          if (error) throw error;
        });
      } catch (err) {
        console.error('Failed to persist log to Supabase after retries:', err);
        // Fallback to localStorage if Supabase fails
        this.saveToLocalStorage(logData);
      }
    }
  }

  private getLogColor(level: LogLevel): string {
    switch (level) {
      case 'ERROR': return '#FF0000';
      case 'WARNING': return '#FFA500';
      case 'INFO': return '#0000FF';
      case 'DEBUG': return '#808080';
    }
  }

  private saveToLocalStorage(logData: any) {
    try {
      const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      logs.push(logData);
      // Keep only last 100 logs to prevent storage overflow
      if (logs.length > 100) logs.shift();
      localStorage.setItem('error_logs', JSON.stringify(logs));
    } catch (err) {
      console.error('Failed to save log to localStorage:', err);
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>, component?: string) {
    this.log({
      level: 'ERROR',
      message,
      timestamp: new Date().toISOString(),
      error_details: error ? this.formatError(error) : undefined,
      context,
      component,
      user_id: supabase.auth.getUser()?.data?.user?.id,
      session_id: supabase.auth.getSession()?.data?.session?.id,
      stack_trace: error?.stack,
    });
  }

  warn(message: string, context?: Record<string, any>, component?: string) {
    this.log({
      level: 'WARNING',
      message,
      timestamp: new Date().toISOString(),
      context,
      component,
      user_id: supabase.auth.getUser()?.data?.user?.id,
      session_id: supabase.auth.getSession()?.data?.session?.id,
    });
  }

  info(message: string, context?: Record<string, any>, component?: string) {
    this.log({
      level: 'INFO',
      message,
      timestamp: new Date().toISOString(),
      context,
      component,
      user_id: supabase.auth.getUser()?.data?.user?.id,
      session_id: supabase.auth.getSession()?.data?.session?.id,
    });
  }

  debug(message: string, context?: Record<string, any>, component?: string) {
    if (import.meta.env.MODE === 'development') {
      this.log({
        level: 'DEBUG',
        message,
        timestamp: new Date().toISOString(),
        context,
        component,
        user_id: supabase.auth.getUser()?.data?.user?.id,
        session_id: supabase.auth.getSession()?.data?.session?.id,
      });
    }
  }

  async syncLocalLogs() {
    if (!supabase) return;

    try {
      const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      if (logs.length === 0) return;

      await this.retryOperation(async () => {
        const { error } = await supabase
          .from('error_logs')
          .insert(logs);

        if (error) throw error;
        
        // Clear synced logs from localStorage
        localStorage.removeItem('error_logs');
      });
    } catch (err) {
      console.error('Failed to sync local logs:', err);
    }
  }
}

export const logger = Logger.getInstance();

// Sync local logs when online
window.addEventListener('online', () => {
  logger.syncLocalLogs();
});