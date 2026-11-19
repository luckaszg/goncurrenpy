import asyncio
import logging
import time

from itertools import count


sleeping_time = 5  # seconds

HOG_LIMIT = 9_000_000

def is_prime(n):
    if n < 2:
        return False
    if n % 2 == 0:
        return n == 2
    i = 3
    while i * i <= n:
        if n % i == 0:
            return False
        i += 2
    return True

def super_expensive_computation():
    count = 0
    for n in range(HOG_LIMIT):
        if is_prime(n):
            count += 1
    return count

async def cpu_hog():
    logging.info(f"Task 1 is running...{' (intensive)'}")
    start = time.perf_counter()
    count = super_expensive_computation()
    elapsed_ms = round((time.perf_counter() - start) * 1000)
    return {"count": count, "limit": HOG_LIMIT, "elapsed_ms": elapsed_ms}

async def heartbeat():
    for i in count():
        logging.info("Heartbeat...")
        await asyncio.sleep(sleeping_time)
        yield i
