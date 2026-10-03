import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Announcement } from '../types';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description?: string;
  duration?: number;
}

interface RealtimeContextType {
  isConnected: boolean;
  onlineCount: number;
  latencyMs: number;
  announcements: Announcement[];
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  lastEvent: { event: string; payload: any; timestamp: string } | null;
  triggerRefresh: () => void;
  refreshTrigger: number;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [latencyMs, setLatencyMs] = useState(4);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastEvent, setLastEvent] = useState<{ event: string; payload: any; timestamp: string } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { ...toast, id }]);

    const duration = toast.duration || 4500;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let pingInterval: any = null;
    let isMounted = true;

    function connectWs() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (!isMounted) return;
          setIsConnected(true);
          console.log('[Realtime] Connected to NexusHost Global WebSocket');
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'PONG') {
              const rtt = Date.now() - data.time;
              setLatencyMs(Math.max(2, rtt));
              return;
            }

            setLastEvent(data);
            triggerRefresh();

            switch (data.event) {
              case 'PRESENCE_UPDATE':
                if (data.payload?.count) setOnlineCount(data.payload.count);
                break;

              case 'PROJECT_DEPLOYED':
                addToast({
                  type: 'success',
                  title: 'New Deployment Live Worldwide',
                  description: `Project "${data.payload?.title}" synced to edge nodes.`
                });
                break;

              case 'PROJECT_UPDATED':
                addToast({
                  type: 'info',
                  title: 'Project Updated in Real-Time',
                  description: `Version ${data.payload?.activeVersion} synced for ${data.payload?.slug}.`
                });
                break;

              case 'PAYMENT_SUBMITTED':
                addToast({
                  type: 'info',
                  title: 'Payment Verification Queued',
                  description: `TrxID ${data.payload?.trxId} is now under manual admin review.`
                });
                break;

              case 'PAYMENT_STATUS_CHANGED':
                if (data.payload?.status === 'approved') {
                  addToast({
                    type: 'success',
                    title: 'bKash/Nagad Payment Approved!',
                    description: `Account upgraded to ${data.payload?.plan?.toUpperCase()} Plan.`
                  });
                } else {
                  addToast({
                    type: 'warning',
                    title: 'Payment Submission Flagged',
                    description: data.payload?.reason || 'Transaction ID unverified.'
                  });
                }
                break;

              case 'GLOBAL_ANNOUNCEMENT':
                setAnnouncements(prev => [data.payload, ...prev]);
                addToast({
                  type: 'info',
                  title: `Broadcast: ${data.payload?.title}`,
                  description: data.payload?.message,
                  duration: 8000
                });
                break;

              case 'SETTINGS_UPDATED':
                if (data.payload?.maintenanceMode) {
                  addToast({
                    type: 'error',
                    title: 'Platform Maintenance Mode Activated',
                    description: data.payload?.maintenanceMessage
                  });
                }
                break;
            }
          } catch (err) {
            console.error('Failed to parse WebSocket message', err);
          }
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setIsConnected(false);
          // Auto reconnect after 2 seconds
          setTimeout(connectWs, 2000);
        };

        ws.onerror = () => {
          if (ws) ws.close();
        };
      } catch (e) {
        console.warn('WebSocket connection error, retrying...', e);
        setTimeout(connectWs, 2000);
      }
    }

    connectWs();

    // Ping every 5 seconds for live latency gauge
    pingInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'PING', time: Date.now() }));
      }
    }, 5000);

    return () => {
      isMounted = false;
      if (pingInterval) clearInterval(pingInterval);
      if (ws) ws.close();
    };
  }, [addToast, triggerRefresh]);

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        onlineCount,
        latencyMs,
        announcements,
        toasts,
        addToast,
        removeToast,
        lastEvent,
        triggerRefresh,
        refreshTrigger
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) throw new Error('useRealtime must be used within RealtimeProvider');
  return context;
};
