from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str
    max_results: int = 5


class SearchResult(BaseModel):
    title: str
    url: str
    content: str
    image: str | None = None
    calories: int | None = None


class SearchResponse(BaseModel):
    results: list[SearchResult]
