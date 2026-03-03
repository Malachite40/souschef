import json
import logging
import re
from concurrent.futures import ThreadPoolExecutor, as_completed

import httpx
from lxml import html

from .config import settings

logger = logging.getLogger(__name__)

_client = httpx.Client(
    follow_redirects=True,
    timeout=settings.scrape_timeout,
    headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
)


def _extract_json_ld(tree) -> str | None:
    """Try to extract recipe content from JSON-LD structured data."""
    scripts = tree.xpath('//script[@type="application/ld+json"]')
    for script in scripts:
        try:
            text = script.text_content()
            if not text:
                continue
            data = json.loads(text)
            # Handle @graph arrays
            items = data if isinstance(data, list) else data.get("@graph", [data])
            for item in items:
                item_type = item.get("@type", "")
                if item_type == "Recipe" or (isinstance(item_type, list) and "Recipe" in item_type):
                    parts = []
                    if name := item.get("name"):
                        parts.append(f"# {name}")
                    if desc := item.get("description"):
                        parts.append(desc)
                    if ingredients := item.get("recipeIngredient"):
                        parts.append("## Ingredients")
                        parts.extend(f"- {i}" for i in ingredients)
                    instructions = item.get("recipeInstructions", [])
                    if instructions:
                        parts.append("## Instructions")
                        for i, step in enumerate(instructions, 1):
                            text = step.get("text", step) if isinstance(step, dict) else str(step)
                            parts.append(f"{i}. {text}")
                    if parts:
                        return "\n".join(parts)
        except (json.JSONDecodeError, TypeError, AttributeError):
            continue
    return None


def _extract_recipe_selectors(tree) -> str | None:
    """Try common recipe-specific CSS class patterns via XPath."""
    selectors = [
        '//*[contains(@class, "recipe-body")]',
        '//*[contains(@class, "wprm-recipe")]',
        '//*[contains(@class, "tasty-recipes")]',
        '//*[contains(@class, "recipe-content")]',
        '//*[contains(@itemtype, "Recipe")]',
        '//*[contains(@class, "recipe-card")]',
    ]
    for xpath in selectors:
        elements = tree.xpath(xpath)
        for el in elements:
            text = el.text_content().strip()
            if text:
                return text
    return None


def _extract_image(tree) -> str | None:
    """Try to extract a preview image URL from the page."""
    # 1. JSON-LD image field
    scripts = tree.xpath('//script[@type="application/ld+json"]')
    for script in scripts:
        try:
            text = script.text_content()
            if not text:
                continue
            data = json.loads(text)
            items = data if isinstance(data, list) else data.get("@graph", [data])
            for item in items:
                item_type = item.get("@type", "")
                if item_type == "Recipe" or (isinstance(item_type, list) and "Recipe" in item_type):
                    img = item.get("image")
                    if isinstance(img, str) and img:
                        return img
                    if isinstance(img, list) and img:
                        first = img[0]
                        if isinstance(first, str) and first:
                            return first
                        if isinstance(first, dict):
                            url = first.get("url", "")
                            if url:
                                return url
                    if isinstance(img, dict):
                        url = img.get("url", "")
                        if url:
                            return url
        except (json.JSONDecodeError, TypeError, AttributeError):
            continue

    # 2. og:image meta tag
    og = tree.xpath('//meta[@property="og:image"]/@content')
    if og and og[0]:
        return og[0]

    # 3. twitter:image meta tag
    twitter = tree.xpath('//meta[@name="twitter:image"]/@content')
    if twitter and twitter[0]:
        return twitter[0]

    return None


def _extract_calories(tree) -> int | None:
    """Try to extract calorie count from JSON-LD nutrition data."""
    scripts = tree.xpath('//script[@type="application/ld+json"]')
    for script in scripts:
        try:
            text = script.text_content()
            if not text:
                continue
            data = json.loads(text)
            items = data if isinstance(data, list) else data.get("@graph", [data])
            for item in items:
                item_type = item.get("@type", "")
                if item_type == "Recipe" or (isinstance(item_type, list) and "Recipe" in item_type):
                    nutrition = item.get("nutrition")
                    if not nutrition or not isinstance(nutrition, dict):
                        continue
                    cal_str = nutrition.get("calories", "")
                    if not cal_str:
                        continue
                    match = re.search(r"(\d+)", str(cal_str))
                    if match:
                        return int(match.group(1))
        except (json.JSONDecodeError, TypeError, AttributeError):
            continue
    return None


def _extract_generic(tree) -> str:
    """Fallback: extract all paragraph text."""
    paragraphs = tree.xpath("//p")
    texts = [p.text_content().strip() for p in paragraphs if p.text_content().strip()]
    return "\n\n".join(texts)


def scrape_url(url: str) -> dict[str, str | None] | None:
    """Scrape a single URL and extract recipe content and image."""
    try:
        response = _client.get(url)
        if response.status_code != 200:
            return None

        tree = html.fromstring(response.content)

        # Try extraction strategies in order
        content = _extract_json_ld(tree)
        if not content:
            content = _extract_recipe_selectors(tree)
        if not content:
            content = _extract_generic(tree)

        image = _extract_image(tree)
        calories = _extract_calories(tree)

        if content:
            return {"content": content[: settings.max_content_length], "image": image, "calories": calories}
        return None
    except Exception as e:
        logger.warning(f"Failed to scrape {url}: {e}")
        return None


def scrape_urls(urls: list[str]) -> dict[str, dict[str, str | None] | None]:
    """Scrape multiple URLs concurrently. Returns {url: {content, image} or None}."""
    results: dict[str, dict[str, str | None] | None] = {}
    with ThreadPoolExecutor(max_workers=settings.max_workers) as executor:
        future_to_url = {executor.submit(scrape_url, url): url for url in urls}
        for future in as_completed(future_to_url, timeout=settings.overall_timeout):
            url = future_to_url[future]
            try:
                results[url] = future.result()
            except Exception as e:
                logger.warning(f"Scrape future failed for {url}: {e}")
                results[url] = None
    return results
