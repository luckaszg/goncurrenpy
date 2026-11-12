import { pointsPerBeat, beatIntervalMs, tickMs, ekgValue, createHeartbeatChart } from './utils.js';

const pythonHeartbeat = createHeartbeatChart('pythonChart', 'Python heartbeat', 'rgb(55, 118, 171)'); // Python blue

const evtSource = new EventSource('http://localhost:8000/heartbeat');

let heartbeatSuccess = false;
evtSource.addEventListener('heartbeat', (event) => {
    const data = JSON.parse(event.data);
    heartbeatSuccess = data.message === 'heartbeat';
    setTimeout(() => {
        heartbeatSuccess = false;
    }, beatIntervalMs * 10);
});

let sample = 0;
setInterval(() => {
    const t = heartbeatSuccess ? (sample % pointsPerBeat) / pointsPerBeat : 0;
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
    const pythonHogSource = new EventSource('http://localhost:8000/python/hog');
    pythonHogSource.addEventListener('python_hog', (event) => {
        console.log('Result of super expensive computation:', event.data);
    });
}
