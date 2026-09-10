"use client";
import { useCallback, useEffect, useState } from "react";
import type { Repository } from "@/types";
import { errorMessage } from "@/lib/utils";

export function useResource<T extends { id: string }>(repository: Repository<T>, initial?: T[]) {
  const [data, setData] = useState<T[]>(initial ?? []);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    try { const result = await repository.list(); setData(result); setError(null); }
    catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  }, [repository]);
  useEffect(() => {
    let active = true;
    const read = async () => {
      try { const result = await repository.list(); if (active) { setData(result); setError(null); } }
      catch (err) { if (active) setError(errorMessage(err)); }
      finally { if (active) setLoading(false); }
    };
    void read(); const unsubscribe = repository.subscribe(() => void read());
    return () => { active = false; unsubscribe(); };
  }, [repository]);
  return { data, loading, error, reload };
}
