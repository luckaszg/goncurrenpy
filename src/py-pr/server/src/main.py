import asyncio

from fastapi import FastAPI
from fastapi.sse import EventSourceResponse, ServerSentEvent
from fastapi.middleware.cors import CORSMiddleware

from utils import flatline

app = FastAPI()

origins = [
    "http://localhost:9000",
]

app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])


@app.get("/heartbeat", response_class=EventSourceResponse)
async def heartbeat():
    async for beat in flatline.heartbeat():
        yield ServerSentEvent(data={"message": "heartbeat", "beat": beat}, event="heartbeat", retry=5000)


@app.get("/python/hog", response_class=EventSourceResponse)
async def python_hog():
    results = flatline.cpu_hog(intensive=True)
    async for result in results:
        yield ServerSentEvent(data={"message": "success", "result": result}, event="python_hog", retry=5000)
