import pandas as pd
from rapidfuzz import process, fuzz

# Load CSV once at startup
print("Loading medicines.csv ...")
# NOTE: Ensure the CSV file 'A_Z_medicines_dataset_of_India.csv' is in the same directory
medicine_df = pd.read_csv("A_Z_medicines_dataset_of_India.csv")

# Normalize column names
medicine_df.columns = [c.strip().lower() for c in medicine_df.columns]

# Fill null values with empty string to avoid crashes
medicine_df.fillna("", inplace=True)

# Create list for fuzzy matching
medicine_names = medicine_df["name"].astype(str).tolist()


def find_best_medicine_match(query: str, limit: int = 5, threshold: int = 70):
    """
    Given OCR text (query), find top medicine matches from dataset.
    Returns list of dicts with all relevant metadata.
    """
    if not query or len(query.strip()) < 3:
        return []

    # Split text into lines in case multiple medicines in one prescription
    lines = [line.strip() for line in query.split("\n") if line.strip()]

    results = []

    for line in lines:
        # Fuzzy match each line against medicine names
        # Using fuzz.token_sort_ratio is good for minor reordering/typos
        matches = process.extract(
            line,
            medicine_names,
            scorer=fuzz.token_sort_ratio,
            limit=limit
        )

        for match_name, score, _ in matches:
            if score < threshold:
                continue  # ignore low confidence matches

            # Retrieve the full row for the matched medicine
            row = medicine_df.loc[medicine_df["name"] == match_name].iloc[0]

            results.append({
                "input_line": line,
                "matched_name": match_name,
                "score": score,
                "price": row.get("price(₹)", None),
                "manufacturer": row.get("manufacturer_name", None),
                "type": row.get("type", None),
                "pack_size": row.get("pack_size_label", None),
                "short_composition1": row.get("short_composition1", None),
                "short_composition2": row.get("short_composition2", None),
                "is_discontinued": row.get("is_discontinued", None)
            })

    return results