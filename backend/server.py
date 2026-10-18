#!/usr/bin/env python
import os
import sys
from pathlib import Path

# Ensure directory is on python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ats_backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable?"
        ) from exc
    # Run dev server on 8000
    args = sys.argv if len(sys.argv) > 1 else ['manage.py', 'runserver', '127.0.0.1:8000']
    execute_from_command_line(args)
