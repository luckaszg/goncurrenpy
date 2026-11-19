import { pointsPerBeat, tickMs, ekgValue, createHeartbeatChart, SERVER_INTERVAL_MS, setHogRunning, createHogStatus } from './utils.js';

const GIN_URL = `${process.env.PUBLIC_GIN_URL}`

const golangHeartbeat = createHeartbeatChart('goChart', 'Golang heartbeat', 'rgb(211, 23, 10)'); // Golang blue

const evtSource = new EventSource(`${GIN_URL}/heartbeat`);

let lastBeatAt = -Infinity;
evtSource.addEventListener('heartbeat', (event) => { lastBeatAt = performance.now() });

let sample = 0;
setInterval(() => {
    const alive = performance.now() - lastBeatAt < SERVER_INTERVAL_MS * 1.5;
    const t = alive ? (sample % pointsPerBeat) / pointsPerBeat : 0;
    const { chart: golangChart, yValues: golangYValues } = golangHeartbeat;
    golangYValues.shift();
    golangYValues.push(ekgValue(t));
    golangChart.update('none');
    sample++;
}, tickMs);


// Golang's CPU hog button click event
const golangCpuHogButton = document.getElementById('golang-cpu-hog');
const setGolangHogRunning = (running) => setHogRunning(golangCpuHogButton, running);
const golangHogStatus = createHogStatus(document.getElementById('status-Go'));

golangCpuHogButton.addEventListener('click', () => {
    setGolangHogRunning(true);
    golangHog();
});

// Golang's CPU hog call
async function golangHog() {
    golangHogStatus.start();
    try {
        const response = await fetch(`${GIN_URL}/hog`);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        golangHogStatus.finish(data);
    } catch (e) {
        console.error(e);
        golangHogStatus.fail(e);
    } finally {
        setGolangHogRunning(false);
    }
}
