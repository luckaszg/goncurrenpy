import { pointsPerBeat, tickMs, ekgValue, createHeartbeatChart, SERVER_INTERVAL_MS } from './utils.js';

const GIN_URL = `${process.env.PUBLIC_GIN_URL}`

const golangHeartbeat = createHeartbeatChart('goChart', 'Golang heartbeat', 'rgb(211, 23, 10)'); // Golang blue

const evtSource = new EventSource(`${GIN_URL}/heartbeat`);

let lastBeatAt = -Infinity;
evtSource.addEventListener('heartbeat', (event) => { lastBeatAt = performance.now() });

let sample = 0;
setInterval(() => {
    const alive = performance.now() - lastBeatAt < SERVER_INTERVAL_MS * 2;
    const t = alive ? (sample % pointsPerBeat) / pointsPerBeat : 0;
    const { chart: golangChart, yValues: golangYValues } = golangHeartbeat;
    golangYValues.shift();
    golangYValues.push(ekgValue(t));
    golangChart.update('none');
    sample++;
}, tickMs);


// Golang's CPU hog button click event
const golangCpuHogButton = document.getElementById('golang-cpu-hog');
golangCpuHogButton.addEventListener('click', () => {
    golangHog();
});

// Golang's CPU hog call
function golangHog() {
    console.log('Calling golang hog...');
    const golangHogSource = new EventSource(`${GIN_URL}/hog`);
    golangHogSource.addEventListener('hog', (event) => {
        console.log('Result of super expensive computation:', event.data);
    });
}
