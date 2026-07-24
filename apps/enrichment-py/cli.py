#!/usr/bin/env python3
"""Raccourci : `python3 cli.py …`. La logique vit dans auranote_enrich.cli_entry."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from auranote_enrich.cli_entry import main  # noqa: E402

if __name__ == "__main__":
    raise SystemExit(main())
