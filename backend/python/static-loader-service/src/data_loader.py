import pandas as pd
from src.config import SPI_CSV_PATH, STATIC_FEATURES_CSV_PATH

try:
    spldf = pd.read_csv(SPI_CSV_PATH)
except FileNotFoundError:
    print(f"Warning: {SPI_CSV_PATH} not found.")
    spldf = pd.DataFrame()

try:
    df = pd.read_csv(STATIC_FEATURES_CSV_PATH)
except FileNotFoundError:
    print(f"Warning: {STATIC_FEATURES_CSV_PATH} not found.")
    df = pd.DataFrame()