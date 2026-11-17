# Goncurrenpy

**A live, side-by-side view of how Go and Python schedule concurrent work.**

A Go (Gin) server and a Python (FastAPI) server each stream a heartbeat to the browser over **Server-Sent Events**, drawn as an EKG trace. Put CPU load on one of them and watch whether it keeps beating or **flatlines**.

<!-- TODO: add a GIF of the dashboard here, e.g. ![demo](docs/demo.gif) -->

| | Python `asyncio` | Go goroutines |
|---|---|---|
| Scheduling | Cooperative (yields only at `await`) | Preemptive, M:N across cores |
| CPU loop that never yields | Blocks the event loop, so the heartbeat flatlines | Runs on another core, so the heartbeat keeps beating |

## What it shows

- **Real-time streaming with SSE:** long-lived `text/event-stream` responses read in the browser with the native `EventSource` API.
- **Concurrent Go design:** an SSE broker built from goroutines and channels. One goroutine owns the client registry through a `select` loop, so no locks are needed.
- **Async Python:** FastAPI endpoints that stream from async generators, plus a CPU-bound `/hog` endpoint that deliberately blocks the event loop.
- **Containerized multi-service setup:** a multi-stage Dockerfile and Docker Compose running Go 1.26, Python 3.12 (uv) and a Bun front end with Chart.js.

## Run it

```sh
docker compose up --build
```

Open **http://localhost:9000**. You can also watch a raw stream with `curl -N localhost:8085/heartbeat`.

## More

Architecture diagram, debugging lessons (timer races, `EventSource` auto-reconnect, channel fan-out) and the roadmap: **[docs/ENGINEERING.md](docs/ENGINEERING.md)**.
