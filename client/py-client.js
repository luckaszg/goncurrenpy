import { pointsPerBeat, tickMs, ekgValue, createHeartbeatChart, SERVER_INTERVAL_MS } from './utils.js';

const FAST_API_URL = `${process.env.PUBLIC_FAST_API_URL}`

const pythonHeartbeat = createHeartbeatChart('pythonChart', 'Python heartbeat', 'rgb(55, 118, 171)'); // Python blue

const evtSource = new EventSource(`${FAST_API_URL}/heartbeat`);

let lastBeatAt = -Infinity;
evtSource.addEventListener('heartbeat', (event) => { lastBeatAt = performance.now() });

let sample = 0;
setInterval(() => {
    const alive = performance.now() - lastBeatAt < SERVER_INTERVAL_MS * 2;
    const t = alive ? (sample % pointsPerBeat) / pointsPerBeat : 0;
    const { chart: pythonChart, yValues: pythonYValues } = pythonHeartbeat;
    pythonYValues.shift();
    pythonYValues.push(ekgValue(t));
    pythonChart.update('none');
    sample++;
}, tickMs);


// Python's CPU hog button click event
const pythonCpuHogButton = document.getElementById('python-cpu-hog');
pythonCpuHogButton.addEventListener('click', () => {
    pythonHog();
});

// Python's CPU hog call
function pythonHog() {
    console.log('Calling python hog...');
    const pythonHogSource = new EventSource(`${FAST_API_URL}/hog`);
    pythonHogSource.addEventListener('python_hog', (event) => {
        console.log('Result of super expensive computation:', event.data);
    });
}
