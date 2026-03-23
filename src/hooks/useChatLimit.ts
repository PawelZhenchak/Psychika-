import { useState, useEffect, useCallback } from 'react';
import { useUserPlan } from './useUserPlan';

const FREE_LIMIT = 10;
const STORAGE_KEY = 'psychika_chat_usage';

interface Usage {
  date: string;
  count: number;
}

const today = () => new Date().toISOString().slice(0, 10);

export function useChatLimit() {
  const { isPremium, loading: planLoading } = useUserPlan();
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const usage: Usage = JSON.parse(raw);
      if (usage.date === today()) {
        setCount(usage.count);
      } else {
        // New day — reset
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today(), count: 0 }));
        setCount(0);
      }
    }
    setLoaded(true);
  }, []);

  const increment = useCallback(() => {
    setCount((prev) => {
      const newCount = prev + 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today(), count: newCount }));
      return newCount;
    });
  }, []);

  const canSend = isPremium || count < FREE_LIMIT;
  const remaining = Math.max(0, FREE_LIMIT - count);
  const isLoading = planLoading || !loaded;

  return { canSend, remaining, count, increment, isLoading, limit: FREE_LIMIT };
}
