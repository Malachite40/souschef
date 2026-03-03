import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .models import SearchRequest, SearchResponse
from .service import search_and_scrape

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SousChef Scraper")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/search", response_model=SearchResponse)
def search(request: SearchRequest):
    logger.info(f"Search request: query={request.query!r}, max_results={request.max_results}")
    results = search_and_scrape(request.query, request.max_results)
    logger.info(f"Returning {len(results)} results")
    return SearchResponse(results=results)
