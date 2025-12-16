"""Data processing utilities."""


def clean_column_names(columns):
    """Normalize column names: lowercase, replace spaces with underscores."""
    return [col.lower().strip().replace(" ", "_") for col in columns]


def filter_outliers(values, threshold=2.0):
    """Remove values more than `threshold` standard deviations from mean."""
    if not values:
        return []
    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    std = variance ** 0.5
    return [x for x in values if abs(x - mean) <= threshold * std]
