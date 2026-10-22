import sys
import os
from pathlib import Path

# Add project root and backend directory to Python sys.path so app modules import cleanly
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

# Ensure Vercel environment flag
os.environ.setdefault("VERCEL", "1")

from app.main import app
