"""Run the --migrate-slugs logic standalone, with UTF-8 stdout."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# Pull everything we need from the scraper module.
import importlib.util, pathlib

spec = importlib.util.spec_from_file_location(
    "scrape_prices",
    pathlib.Path(__file__).parent / "scrape_prices.py",
)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

mod.migrate_to_slugs()
