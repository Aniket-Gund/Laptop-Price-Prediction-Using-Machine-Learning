from dotenv import load_dotenv
import os
from pathlib import Path

# Load .env file (make sure this file exists at project root)
load_dotenv()

# MySQL Configuration
MYSQL = {
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "database": os.getenv("DB_NAME", "laptop_data"),
    "table": os.getenv("DB_TABLE", "laptop_price"),
}

# Directories (paths used in pipeline)
ARTIFACTS_DIR = Path("artifacts")
RAW_DATA_DIR = ARTIFACTS_DIR / "raw"
TRANSFORMED_DATA_DIR = ARTIFACTS_DIR / "transformed"
MODEL_DIR = ARTIFACTS_DIR / "model"
PREDICTION_MODEL_DIR = Path("prediction") / "models"

# Ensure directories exist
for d in [RAW_DATA_DIR, TRANSFORMED_DATA_DIR, MODEL_DIR, PREDICTION_MODEL_DIR]:
    d.mkdir(parents=True, exist_ok=True)
