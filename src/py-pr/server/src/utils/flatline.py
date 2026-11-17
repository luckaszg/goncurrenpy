import asyncio
import logging
import time

from itertools import count


sleeping_time = 5  # seconds

HOG_SECONDS = 15


def super_expensive_computation():
    # Simulate a CPU-intensive task
    deadline = time.perf_counter() + HOG_SECONDS
    n = 0
    while time.perf_counter() < deadline:
        n += 1
    return n

async def cpu_hog(intensive=False):
    logging.info(f"Task 1 is running...{' (intensive)' if intensive else ''}")
    if intensive:
        yield super_expensive_computation()

    await asyncio.sleep(10)
    logging.info("Task 1 is completed.")
    yield 1

async def heartbeat():
    for i in count():
        logging.info("Heartbeat...")
        await asyncio.sleep(sleeping_time)
        yield i
