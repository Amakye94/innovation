let isMonitoring = false; 
let intervalId;
let dataPoints = [];
let capturedData = [];

// Buttons
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const captureBtn = document.getElementById('capture-btn');
const bpmValue = document.getElementById('bpm-value');

// Start Monitoring
startBtn.addEventListener('click', () => {
    isMonitoring = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    captureBtn.disabled = false;
    startMonitoring();
});

// Stop Monitoring
stopBtn.addEventListener('click', () => {
    isMonitoring = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    captureBtn.disabled = true;
    stopMonitoring();
});

// Capture Splines
captureBtn.addEventListener('click', () => {
    capturedData = [...dataPoints];
    alert('Splines captured successfully!');
    analyzeData();
});

// Generate Simulated Heart Rate Data
function generateHeartRate() {
    const now = Date.now();
    const amplitude = Math.sin((now / 100) % (2 * Math.PI)) * 4 + 5; // Simulated wave
    const heartRate = Math.floor(Math.random() * (120 - 60 + 1)) + 60; // 60-120 bpm

    dataPoints.push({ time: now, amplitude, heartRate });

    if (dataPoints.length > 100) dataPoints.shift(); // Keep last 100 points
    return heartRate;
}

// Start Monitoring Function
function startMonitoring() {
    intervalId = setInterval(() => {
        const heartRate = generateHeartRate();
        bpmValue.innerText = heartRate;

        updateChart();
    }, 100);
}

// Stop Monitoring Function
function stopMonitoring() {
    clearInterval(intervalId);
}

// Analyze Captured Data
function analyzeData() {
    if (capturedData.length === 0) {
        alert('No splines captured!');
        return;
    }

    const amplitudes = capturedData.map(d => d.amplitude);
    const avgAmplitude = (amplitudes.reduce((a, b) => a + b, 0) / amplitudes.length).toFixed(2);
    const maxAmplitude = Math.max(...amplitudes).toFixed(2);
    const minAmplitude = Math.min(...amplitudes).toFixed(2);

    document.getElementById('avg-amplitude').innerText = avgAmplitude;
    document.getElementById('max-amplitude').innerText = maxAmplitude;
    document.getElementById('min-amplitude').innerText = minAmplitude;
}

function updateChart() {
    const svg = d3.select('#live-chart');
    const width = svg.attr('width');
    const height = svg.attr('height');
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.selectAll('*').remove();

    const xScale = d3.scaleTime()
        .domain([d3.min(dataPoints, d => d.time), d3.max(dataPoints, d => d.time)])
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([-100, 100])
        .range([innerHeight, 0]);

    const line = d3.line()
        .x(d => xScale(d.time))
        .y(d => yScale(d.amplitude))
        .curve(d3.curveMonotoneX);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`); // Fixed template literals

    g.append('g')
        .attr('transform', `translate(0,${innerHeight})`) // Fixed template literals
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat('%H:%M:%S')));

    g.append('g')
        .call(d3.axisLeft(yScale));

    g.append('path')
        .datum(dataPoints)
        .attr('fill', 'none')
        .attr('stroke', 'black') // Spline is now black
        .attr('stroke-width', 1.5)
        .attr('d', line);
}
