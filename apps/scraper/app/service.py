import logging

from .models import SearchResult
from .scraper import scrape_urls
from .search import search_duckduckgo

logger = logging.getLogger(__name__)


def search_and_scrape(query: str, max_results: int = 5) -> list[SearchResult]:
    """Search DuckDuckGo for recipes, scrape the results, return structured data."""
    search_results = search_duckduckgo(query, max_results=max_results)
    if not search_results:
        return []

    urls = [r["url"] for r in search_results if r["url"]]
    scraped = scrape_urls(urls)

    results: list[SearchResult] = []
    for r in search_results:
        url = r["url"]
        scrape_result = scraped.get(url)
        if scrape_result:
            content = scrape_result["content"] or r.get("snippet", "")
            image = scrape_result.get("image")
            calories = scrape_result.get("calories")
        else:
            content = r.get("snippet", "")
            image = None
            calories = None
        results.append(
            SearchResult(
                title=r["title"],
                url=url,
                content=content,
                image=image,
                calories=calories,
            )
        )

    return results
