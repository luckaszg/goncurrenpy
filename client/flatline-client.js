// 1. Configure the fixed X-axis resolution
const totalPoints = 300;     // Total width of your fixed X-axis
const pointsPerBeat = 100;   // Controls the heart rate (smaller = faster HR)

const xLabels = [];
const yValues = [];

// 2. Generate the EKG waveform data
for (let i = 0; i < totalPoints; i++) {
    xLabels.push(i); // Fixed X-axis coordinates (0 to 299)
    
    // Normalize t to a percentage (0.0 to 1.0) of a single heartbeat cycle
    let t = (i % pointsPerBeat) / pointsPerBeat; 
    let y = 0; // Isoelectric baseline

    // Match the standard EKG segments to percentages of the cycle
    if (t > 0.05 && t <= 0.15) {
        // P Wave (Smooth bump)
        y = Math.sin((t - 0.05) * Math.PI / 0.10) * 0.15;
    } else if (t > 0.20 && t <= 0.23) {
        // Q Wave (Sharp dip down)
        y = ((t - 0.20) / 0.03) * -0.15;
    } else if (t > 0.23 && t <= 0.27) {
        // R Spike (The massive surge up)
        y = -0.15 + ((t - 0.23) / 0.04) * 1.35; 
    } else if (t > 0.27 && t <= 0.31) {
        // S Wave (Deep plunge below baseline)
        y = 1.20 - ((t - 0.27) / 0.04) * 1.50;
    } else if (t > 0.31 && t <= 0.35) {
        // Return to baseline from S wave
        y = -0.30 + ((t - 0.31) / 0.04) * 0.30;
    } else if (t > 0.45 && t <= 0.65) {
        // T Wave (Wider, medium smooth bump)
        y = Math.sin((t - 0.45) * Math.PI / 0.20) * 0.35;
    }

    yValues.push(y);
}

// 3. Render the chart
const ctx = document.getElementById('heartRateChart').getContext('2d');
new Chart(ctx, {
    type: 'line',
    data: {
        labels: xLabels,
        datasets: [{
            label: 'Heart Rate (ECG)',
            data: yValues,
            borderColor: 'rgb(255, 45, 85)', // Medical red/pink
            borderWidth: 2,
            pointRadius: 0,                  // Removes dots for a clean line
            tension: 0.15,                   // Smooths out the peak transitions slightly
            fill: false
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                display: false // Hides the 0-300 index labels for a clean medical look
            },
            y: {
                min: -0.5,   // Lock the bounds so the spikes don't clip
                max: 1.5,
                display: false 
            }
        },
        animation: false // Disabling initial animations keeps the line crisp on load
    }
});
