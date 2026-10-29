import React, { useEffect, useState } from 'react';

interface BossPanicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BossPanicModal: React.FC<BossPanicModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<string[]>([
    '[INFO] Initializing service container @enterprise/mesh-gateway:2.4.19...',
    '[DEBUG] Loading configuration profile from consul:8500 [prod-cluster-east]...',
    '[INFO] ThreadPoolExecutor pool size: 32 (active: 8, queue: 0)',
    '[SUCCESS] Database connection pool initialized: 12ms (PostgreSQL 16.4-alpine)',
    '[INFO] Redis cluster master node reachable: latency 0.42ms',
    '[INFO] Synchronizing distributed raft state machine revision 104829...',
    '[TEST] Running integration test suite [38 passed, 0 failed, 100% green]',
    '[DOCKER] Container running on 127.0.0.1:8080 (healthy)',
  ]);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const now = new Date().toTimeString().split(' ')[0];
      const randomLogPool = [
        `[${now}] GET /api/v2/pipeline/stream HTTP/1.1 200 OK - 14ms`,
        `[${now}] Prometheus metrics scraped: 412 gauges, 88 counters recorded`,
        `[${now}] Kafka consumer partition 0 rebalance check: offset aligned`,
        `[${now}] Heartbeat ping from node worker-03: ack received (0.2ms)`,
        `[${now}] Garbage collector minor sweep: 14MB reclaimed in 1.2ms`,
        `[${now}] gRPC stream connection validated: keep-alive OK`,
      ];
      const nextLog = randomLogPool[Math.floor(Math.random() * randomLogPool.length)];
      setLogs((prev) => [...prev.slice(-30), nextLog]);
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-[#0d1117] text-[#58a6ff] font-mono text-xs sm:text-sm p-4 flex flex-col select-none cursor-default"
      onClick={onClose}
    >
      {/* Fake Terminal Titlebar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#30363d] text-[#8b949e]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f85149]" />
          <div className="w-3 h-3 rounded-full bg-[#e3b341]" />
          <div className="w-3 h-3 rounded-full bg-[#2ea043]" />
          <span className="ml-2 font-semibold text-slate-300">bash — zsh — 80x24</span>
        </div>
        <div className="text-[11px] text-[#8b949e] opacity-80">
          按 ESC 或任意点击立即返回工作区
        </div>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 overflow-y-auto space-y-1 font-mono leading-relaxed">
        <div className="text-[#7ee787]">
          cheerlsy@MacBook-Air:~/projects/core-gateway (main)$ cargo build --release && ./target/release/gateway
        </div>
        <div className="text-[#8b949e]">
          Compiling libc v0.2.158
          <br />
          Compiling tokio v1.40.0
          <br />
          Compiling serde v1.0.210
          <br />
          Finished `release` profile [optimized] target(s) in 3.42s
        </div>
        {logs.map((log, idx) => {
          let color = 'text-[#c9d1d9]';
          if (log.includes('[SUCCESS]') || log.includes('200 OK')) color = 'text-[#7ee787]';
          if (log.includes('[INFO]')) color = 'text-[#58a6ff]';
          if (log.includes('[DEBUG]')) color = 'text-[#8b949e]';
          if (log.includes('[TEST]')) color = 'text-[#d2a8ff]';
          return (
            <div key={idx} className={color}>
              {log}
            </div>
          );
        })}
        <div className="flex items-center gap-1 text-[#7ee787] pt-2">
          <span>● listening on port 8080</span>
          <span className="w-2 h-4 bg-[#58a6ff] animate-pulse" />
        </div>
      </div>
    </div>
  );
};
