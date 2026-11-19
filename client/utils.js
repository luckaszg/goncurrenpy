const totalPoints = 300;

// Visible window width (3 seconds of signal)
export const pointsPerBeat = 100;   // Samples per heartbeat
export const beatIntervalMs = 1000; // One heartbeat every second (60 BPM)
export const tickMs = beatIntervalMs / pointsPerBeat; // 10 ms per sample

export const SERVER_INTERVAL_MS = 5_000;
// EKG waveform: returns the voltage for a position t (0.0 to 1.0) in one beat
export function ekgValue(t) {
    if (t > 0.05 && t <= 0.15) {
        // P Wave (Smooth bump)
        return Math.sin((t - 0.05) * Math.PI / 0.10) * 0.15;
    } else if (t > 0.20 && t <= 0.23) {
        // Q Wave (Sharp dip down)
        return ((t - 0.20) / 0.03) * -0.15;
    } else if (t > 0.23 && t <= 0.27) {
        // R Spike (The massive surge up)
        return -0.15 + ((t - 0.23) / 0.04) * 1.35;
    } else if (t > 0.27 && t <= 0.31) {
        // S Wave (Deep plunge below baseline)
        return 1.20 - ((t - 0.27) / 0.04) * 1.50;
    } else if (t > 0.31 && t <= 0.35) {
        // Return to baseline from S wave
        return -0.30 + ((t - 0.31) / 0.04) * 0.30;
    } else if (t > 0.45 && t <= 0.65) {
        // T Wave (Wider, medium smooth bump)
        return Math.sin((t - 0.45) * Math.PI / 0.20) * 0.35;
    }
    return 0; // Isoelectric baseline
}

// Create one heartbeat chart on the given canvas
export function createHeartbeatChart(canvasId, label, color) {
    // Start with a flat line; the signal scrolls in from the right
    const xLabels = Array.from({ length: totalPoints }, (_, i) => i);
    const yValues = new Array(totalPoints).fill(0);

    const ctx = document.getElementById(canvasId).getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xLabels,
            datasets: [{
                label: label,
                data: yValues,
                borderColor: color,
                borderWidth: 2,
                pointRadius: 0,   // Removes dots for a clean line
                tension: 0.15,    // Smooths out the peak transitions slightly
                fill: false
            }]
        },
        options: {
            animation: false, // Redraws every 10 ms; tweening would smear the trace
            interaction: {
                intersect: false,
            },
            scales: {
                x: { display: false },
                y: { min: -0.5, max: 1.5 }, // Fixed bounds so the axis doesn't jump
            },
        }
    });

    return { chart, yValues };
}

// Show a spinner on a scenario's Run button while its hog runs, and block repeat clicks
export function setHogRunning(runButton, running) {
    runButton.disabled = running;
    runButton.classList.toggle('running', running);
    runButton.textContent = running ? 'Running…' : 'Run';
}

// Drive a chart's status line through a hog run: live timer while it runs, result when done.
// Reads { count, limit, elapsed_ms } from the server; limit and elapsed_ms are optional
// (falls back to the browser's own timing), and a bare number is treated as the count.
export function createHogStatus(statusEl) {
    let startedAt = 0;
    let timer = null;

    const seconds = (ms) => `${(ms / 1000).toFixed(1)} s`;
    const stopTimer = () => { clearInterval(timer); timer = null; };

    return {
        start() {
            startedAt = performance.now();
            const render = () => {
                statusEl.textContent = `Running: counting primes… ${seconds(performance.now() - startedAt)}`;
            };
            render();
            stopTimer();
            timer = setInterval(render, 100);
        },
        finish(data) {
            stopTimer();
            const { count, limit, elapsed_ms } = typeof data === 'number' ? { count: data } : (data ?? {});
            const elapsedMs = elapsed_ms ?? performance.now() - startedAt;

            const below = limit != null ? ` below ${limit.toLocaleString()}` : '';
            const rate = limit != null && elapsedMs > 0
                ? ` (≈ ${Math.round(limit / (elapsedMs / 1000)).toLocaleString()} numbers/s)`
                : '';

            statusEl.innerHTML = '';
            statusEl.append(
                'Done: found ',
                Object.assign(document.createElement('b'), { textContent: `${Number(count).toLocaleString()} primes` }),
                `${below} in `,
                Object.assign(document.createElement('b'), { textContent: seconds(elapsedMs) }),
                rate,
            );
        },
        fail(error) {
            stopTimer();
            statusEl.textContent = `Failed: ${error?.message ?? error}`;
        },
    };
}
