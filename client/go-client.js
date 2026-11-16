import { pointsPerBeat, beatIntervalMs, tickMs, ekgValue, createHeartbeatChart } from './utils.js';

const GIN_URL = `${process.env.PUBLIC_GIN_URL}`

const golangHeartbeat = createHeartbeatChart('goChart', 'Golang heartbeat', 'rgb(211, 23, 10)'); // Golang blue

const evtSource = new EventSource(`${GIN_URL}/heartbeat`);

let heartbeatSuccess = false;
evtSource.addEventListener('heartbeat', (event) => {
    heartbeatSuccess = true;
    setTimeout(() => {
        heartbeatSuccess = false;
    }, beatIntervalMs * 10);
});

let sample = 0;
setInterval(() => {
    const t = heartbeatSuccess ? (sample % pointsPerBeat) / pointsPerBeat : 0;
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
