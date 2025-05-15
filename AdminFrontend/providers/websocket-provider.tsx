"use client";
import API_INFO from "@/config/api";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

// Socket context
const SocketContext = createContext<Socket | null>(null);
export const useSocket = () => useContext(SocketContext);

// Pipelines context
const PipelinesContext = createContext<{
  collectionPipelines: Record<string, string>;
  refreshPipelines: Record<string, string>;
}>({
  collectionPipelines: {},
  refreshPipelines: {},
});

// Trials context
const TrialsContext = createContext<Record<string, number>>({}); // 👈 Assuming it's {source: count}
export const useTrials = () => useContext(TrialsContext);

export const usePipelines = () => useContext(PipelinesContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);

  const [pipelines, setPipelines] = useState<{
    collectionPipelines: Record<string, string>;
    refreshPipelines: Record<string, string>;
  }>({ collectionPipelines: {}, refreshPipelines: {} });

  const [trialsPerSource, setTrialsPerSource] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const socket = io(API_INFO.BASE_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 WebSocket connected:", socket.id);
    });

    socket.on("pipelines", (data) => {
      console.log("🧪 Received pipelines:", data);
      setPipelines(data);
    });

    socket.on("totalTrialsBySource", (data) => {
      console.log("🧪 Received trials per source:", data);
      setTrialsPerSource(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      <PipelinesContext.Provider value={pipelines}>
        <TrialsContext.Provider value={trialsPerSource}>
          {children}
        </TrialsContext.Provider>
      </PipelinesContext.Provider>
    </SocketContext.Provider>
  );
};
