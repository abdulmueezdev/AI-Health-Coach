'use client';
import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/notifications/register-sw';

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  return null;
}
