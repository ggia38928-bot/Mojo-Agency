"""
Multi-Agent Orchestrator — Bước 1.1
=====================================
Hệ thống điều phối theo mô hình Agent Delegation Pattern.

Luồng phân quyền:
    Telemetry Agent  →  Risk Threshold Agent  →  Action Agent
         ↓                      ↓                      ↓
   Load & Stream          Phân tích P&L          Ra lệnh can thiệp
   OrderTelemetry         Classify Risk          KILL / LOWER / MAINTAIN

Orchestrator không trực tiếp xử lý logic nghiệp vụ mà ủy quyền
cho từng Agent chuyên biệt, thu thập kết quả và tổng hợp báo cáo.
"""

from __future__ import annotations

import datetime
import time
from dataclasses import dataclass, field
from typing import List, Optional

from src.schemas import (
    OrderTelemetrySchema,
    PnLAnalysisResult,
    ActionCommandSchema,
    ActionCommand,
    RiskLevel,
)
from src.telemetry_agent import get_inline_mock_data, load_telemetry_from_csv
from src.risk_agent import analyze_risk, _print_analysis
from src.action_agent import decide_action, _print_action


# ---------------------------------------------------------------------------
# Orchestrator State
# ---------------------------------------------------------------------------

@dataclass
class OrchestratorReport:
    """Báo cáo tổng hợp sau một chu kỳ xử lý của Orchestrator."""
    total_skus: int = 0
    normal_count: int = 0
    warning_count: int = 0
    critical_count: int = 0
    campaigns_killed: int = 0
    bids_lowered: int = 0
    maintained: int = 0
    total_estimated_savings: float = 0.0
    actions: List[ActionCommandSchema] = field(default_factory=list)
    analyses: List[PnLAnalysisResult] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Orchestrator Core
# ---------------------------------------------------------------------------

class MultiAgentOrchestrator:
    """
    Orchestrator điều phối luồng Multi-Agent theo Agent Delegation Pattern.

    Vai trò:
      - Khởi tạo và điều phối toàn bộ pipeline
      - Ủy quyền từng nhiệm vụ cho Agent chuyên biệt
      - Thu thập kết quả, tổng hợp báo cáo cuối
    """

    def __init__(self, use_csv: bool = False, csv_path: Optional[str] = None):
        self.use_csv = use_csv
        self.csv_path = csv_path

    def run(self) -> OrchestratorReport:
        """
        Thực thi toàn bộ pipeline Multi-Agent.

        Returns:
            OrchestratorReport — báo cáo tổng hợp đầy đủ
        """
        self._print_header()

        # ── AGENT 1: Telemetry Agent ──────────────────────────────────────
        print("\n📡 [AGENT 1 — Telemetry Agent] Đang nhận luồng dữ liệu Shopee...")
        telemetry_records = self._load_telemetry()
        print(f"   → Đã tải {len(telemetry_records)} SKU từ Shopee telemetry stream\n")
        time.sleep(0.3)

        # ── AGENT 2: Risk Threshold Agent ─────────────────────────────────
        print("🔍 [AGENT 2 — Risk Threshold Agent] Đang phân tích P&L Shopee 2026...\n")
        analyses: List[PnLAnalysisResult] = []
        for telemetry in telemetry_records:
            analysis = analyze_risk(telemetry)
            _print_analysis(analysis)
            analyses.append(analysis)
            print()
            time.sleep(0.15)

        # ── AGENT 3: Action Agent ─────────────────────────────────────────
        print("\n🤖 [AGENT 3 — Action Agent] Đang thực thi can thiệp tự trị...")
        actions: List[ActionCommandSchema] = []
        for analysis in analyses:
            action = decide_action(analysis)
            _print_action(action)
            actions.append(action)
            time.sleep(0.1)

        # ── Tổng hợp báo cáo ─────────────────────────────────────────────
        report = self._build_report(analyses, actions)
        self._print_report(report)

        return report

    # ── Private helpers ───────────────────────────────────────────────────

    def _load_telemetry(self) -> List[OrderTelemetrySchema]:
        """Ủy quyền cho Telemetry Agent để tải dữ liệu."""
        if self.use_csv and self.csv_path:
            return load_telemetry_from_csv(self.csv_path)
        return get_inline_mock_data()

    def _build_report(
        self,
        analyses: List[PnLAnalysisResult],
        actions: List[ActionCommandSchema],
    ) -> OrchestratorReport:
        """Tổng hợp kết quả thành OrchestratorReport."""
        report = OrchestratorReport(
            total_skus=len(analyses),
            analyses=analyses,
            actions=actions,
        )
        for analysis in analyses:
            if analysis.risk_level == RiskLevel.NORMAL:
                report.normal_count += 1
            elif analysis.risk_level == RiskLevel.WARNING:
                report.warning_count += 1
            else:
                report.critical_count += 1

        for action in actions:
            if action.command == ActionCommand.KILL_CAMPAIGN:
                report.campaigns_killed += 1
                report.total_estimated_savings += action.estimated_savings or 0.0
            elif action.command == ActionCommand.LOWER_BID_50:
                report.bids_lowered += 1
            else:
                report.maintained += 1

        return report

    def _print_header(self) -> None:
        """In header banner."""
        print("\n" + "=" * 60)
        print("="  + " " * 58 + "=")
        print("=   MarginGuard AI -- Multi-Agent P&L Protection System  =")
        print("=        Sea x OpenAI Codex Hackathon 2026               =")
        print("="  + " " * 58 + "=")
        print("=" * 60)
        print(f"\n[*] Khoi dong Orchestrator -- {_timestamp()}")
        print("    Pipeline: Telemetry -> Risk Analysis -> Autonomous Action\n")

    def _print_report(self, report: OrchestratorReport) -> None:
        """In báo cáo tổng hợp cuối chu kỳ."""
        print("\n\n" + "═" * 60)
        print("  📋 ORCHESTRATOR FINAL REPORT")
        print("═" * 60)
        print(f"  Tổng SKU được phân tích:  {report.total_skus}")
        print(f"  ✅ NORMAL  (an toàn):     {report.normal_count}")
        print(f"  ⚠️  WARNING (biên mỏng):  {report.warning_count}")
        print(f"  🚨 CRITICAL (đang lỗ):   {report.critical_count}")
        print("─" * 60)
        print(f"  🛑 Chiến dịch bị KILL:   {report.campaigns_killed}")
        print(f"  📉 Giá thầu hạ 50%:      {report.bids_lowered}")
        print(f"  ✅ Giữ nguyên:           {report.maintained}")
        print("─" * 60)
        if report.total_estimated_savings > 0:
            print(
                f"  💰 Tổng tiền CẮT LỖ được: "
                f"{report.total_estimated_savings:,.0f} VNĐ"
            )
        print("═" * 60)
        print("\n  🎯 MarginGuard AI đã bảo vệ biên lợi nhuận thành công!")
        print(f"  ⏱  Hoàn thành — {_timestamp()}\n")


def _timestamp() -> str:
    """Trả về timestamp hiện tại dạng string."""
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
