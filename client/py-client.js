import { pointsPerBeat, tickMs, ekgValue, createHeartbeatChart, SERVER_INTERVAL_MS, setHogRunning, createHogStatus } from './utils.js';

const FAST_API_URL = `${process.env.PUBLIC_FAST_API_URL}`

const pythonHeartbeat = createHeartbeatChart('pythonChart', 'Python heartbeat', 'rgb(55, 118, 171)'); // Python blue

const evtSource = new EventSource(`${FAST_API_URL}/heartbeat`);

let lastBeatAt = -Infinity;
evtSource.addEventListener('heartbeat', (event) => { lastBeatAt = performance.now() });

let sample = 0;
setInterval(() => {
    const alive = performance.now() - lastBeatAt < SERVER_INTERVAL_MS * 1.5;
    const t = alive ? (sample % pointsPerBeat) / pointsPerBeat : 0;
    const { chart: pythonChart, yValues: pythonYValues } = pythonHeartbeat;
    pythonYValues.shift();
    pythonYValues.push(ekgValue(t));
    pythonChart.update('none');
    sample++;
}, tickMs);


// Python's CPU hog button click event
const pythonCpuHogButton = document.getElementById('python-cpu-hog');
const setPythonHogRunning = (running) => setHogRunning(pythonCpuHogButton, running);
const pythonHogStatus = createHogStatus(document.getElementById('status-Python'));

pythonCpuHogButton.addEventListener('click', () => {
    setPythonHogRunning(true);
    pythonHog();
});

// Python's CPU hog call
async function pythonHog() {
    pythonHogStatus.start();
    try {
        const response = await fetch(`${FAST_API_URL}/hog`);
        if (!response.ok) {
            throw new Error(`HTTP error!`);
        }
        const data = await response.json();
        pythonHogStatus.finish(data);
    } catch(e) {
        console.error(e);
        pythonHogStatus.fail(e);
    } finally {
        setPythonHogRunning(false);
    }
}
