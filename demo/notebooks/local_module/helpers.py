"""Helper functions demonstrating local module imports in Voici."""


def greet(name: str) -> str:
    """Return a greeting message."""
    return f"Hello, {name}!"


def calculate_stats(numbers: list) -> dict:
    """Calculate basic statistics for a list of numbers."""
    if not numbers:
        return {"count": 0, "sum": 0, "mean": 0, "min": None, "max": None}

    return {
        "count": len(numbers),
        "sum": sum(numbers),
        "mean": sum(numbers) / len(numbers),
        "min": min(numbers),
        "max": max(numbers),
    }
