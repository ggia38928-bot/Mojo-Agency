import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { KpiMetrics } from './components/KpiMetrics';
import { AgentPipelineVisualizer } from './components/AgentPipelineVisualizer';
import { SkuTable } from './components/SkuTable';
import { AuditFeed } from './components/AuditFeed';
import { MegaSaleModal } from './components/MegaSaleModal';
import { checkBackendHealth, fetchDemoReport, runCustomSimulation } from './api';
import type { OrchestratorReport, OrderTelemetry } from './types';

export const App: React.FC = () => {
  const [report, setReport] = useState<OrchestratorReport | null>(null);
  const [isBackendLive, setIsBackendLive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Initialize and check backend
  const loadData = async (useCsv: boolean = false) => {
    setLoading(true);
    try {
      const live = await checkBackendHealth();
      setIsBackendLive(live);

      const { data } = await fetchDemoReport(useCsv);
      setReport(data);

      if (data.totalEstimatedSavings > 0) {
        // Fire confetti when money is saved
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#EF4444', '#10B981', '#6366F1', '#F59E0B'],
        });
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);
    // Periodic check
    const interval = setInterval(async () => {
      const live = await checkBackendHealth();
      setIsBackendLive(live);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCustomSimulation = async (items: OrderTelemetry[]) => {
    setLoading(true);
    try {
      const { data } = await runCustomSimulation(items);
      setReport(data);
      if (data.totalEstimatedSavings > 0) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#EF4444', '#F59E0B', '#10B981'],
        });
      }
    } catch (err) {
      console.error('Custom simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <Navbar
        isBackendLive={isBackendLive}
        loading={loading}
        onRunDemo={loadData}
        onOpenMegaSaleModal={() => setIsModalOpen(true)}
      />

      {/* Main Content Container */}
      <main style={{ maxWidth: 1400, width: '100%', margin: '0 auto', padding: '24px 20px', flex: 1 }}>
        {report ? (
          <>
            {/* Top KPI Metrics Cards */}
            <KpiMetrics report={report} />

            {/* Agent Pipeline Visualizer */}
            <AgentPipelineVisualizer />

            {/* Sku Table */}
            <SkuTable analyses={report.analyses} actions={report.actions} />

            {/* Audit Feed */}
            <AuditFeed
              actions={report.actions}
              analyses={report.analyses}
              executedAt={report.executedAt}
            />
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <div className="pulse-dot" style={{ backgroundColor: '#6366F1', width: 14, height: 14, margin: '0 auto 16px' }} />
            <div>Đang tải bảng điều khiển MarginGuard AI...</div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '18px 24px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-dim)',
      }}>
        MarginGuard AI — Sea × OpenAI Codex Hackathon 2026 • Chuẩn Shopee 2026 P&amp;L Protection
      </footer>

      {/* Mega Sale Simulation Modal */}
      <MegaSaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRunSimulation={handleCustomSimulation}
      />
    </div>
  );
};

export default App;
