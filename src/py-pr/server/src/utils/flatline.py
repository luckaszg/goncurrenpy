import asyncio
import logging

from itertools import count


sleeping_time = 5  # seconds


def super_expensive_computation():
    # Simulate a CPU-intensive task
    total = [0]
    for i in range(10**9):
        total.append(i+total[i - 1])
    return total

async def cpu_hog(intensive=False):
    logging.info(f"Task 1 is running...{' (intensive)' if intensive else ''}")
    if intensive:
        yield super_expensive_computation()

    await asyncio.sleep(10)
    logging.info("Task 1 is completed.")
    yield 1

async def task2fn():
    logging.info("Task 2 is running...")
    await asyncio.sleep(5)
    logging.info("Task 2 is completed.")
    return 2

async def heartbeat():
    for i in count():
        logging.info("Heartbeat...")
        await asyncio.sleep(sleeping_time)
        yield i

async def main():
    task1 = None
    task2 = None

    async with asyncio.TaskGroup() as tg:
        heartbeat_task = tg.create_task(heartbeat())
        task1 = tg.create_task(cpu_hog(intensive=True))
        task2 = tg.create_task(task2fn())
    

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())