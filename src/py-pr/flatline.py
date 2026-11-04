import asyncio
import logging


sleeping_time = 1  # seconds


def super_expensive_computation():
    # Simulate a CPU-intensive task
    total = 0
    for i in range(10**9):
        total += i
    return total

async def task1fn(intensive=False):
    logging.info(f"Task 1 is running...{' (intensive)' if intensive else ''}")
    if intensive:
        result = super_expensive_computation()
        logging.info(f"Result of super expensive computation: {result}")
    else:
        await asyncio.sleep(10)
    logging.info("Task 1 is completed.")
    return 1

async def task2fn():
    logging.info("Task 2 is running...")
    await asyncio.sleep(5)
    logging.info("Task 2 is completed.")
    return 2

async def heartbeat():
    while True:
        logging.info("Heartbeat...")
        await asyncio.sleep(sleeping_time)

async def main():
    task1 = None
    task2 = None

    async with asyncio.TaskGroup() as tg:
        heartbeat_task = tg.create_task(heartbeat())
        task1 = tg.create_task(task1fn(intensive=True))
        task2 = tg.create_task(task2fn())
    

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())