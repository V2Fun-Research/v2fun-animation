# -*- coding: utf-8 -*-
#!/usr/bin/env python3
"""Compatibility entry point; prefer scripts/v2fun.py for shared commands."""
import runpy
from pathlib import Path
if __name__ == '__main__':
    runpy.run_path(str(Path(__file__).resolve().with_name('v2fun.py')), run_name='__main__')
