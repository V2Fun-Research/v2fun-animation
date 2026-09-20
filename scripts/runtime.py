# -*- coding: utf-8 -*-
"""Resolve this standalone skill root; shared helpers live in scripts/."""
from pathlib import Path
SKILL = Path(__file__).resolve().parents[1]
# Compatibility alias for callers that previously imported SETUP.
SETUP = SKILL
