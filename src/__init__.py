import sys
from src.agents import risk_agent, action_agent, telemetry_agent

# Backward-compatibility aliases for legacy imports in test_pnl_engine.py & external consumers
sys.modules["src.risk_agent"] = risk_agent
sys.modules["src.action_agent"] = action_agent
sys.modules["src.telemetry_agent"] = telemetry_agent

__all__ = ["risk_agent", "action_agent", "telemetry_agent"]
