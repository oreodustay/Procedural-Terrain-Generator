let seed = 1000;

let noiseScale = 0.05;
let heightScale = 120;
let octaves = 4;
let persistence = 0.5;

let noiseMode = "perlin";

const SIZE = 40;
const TILE = 20;

function setup() {

    let canvas = createCanvas(
        min(windowWidth * 0.95, 800),
        min(windowHeight * 0.6, 600),
        WEBGL
    );

    canvas.parent("canvas-container");

    setupButtons();
}

function windowResized() {
    resizeCanvas(
        min(windowWidth * 0.95, 800),
        min(windowHeight * 0.6, 600)
    );
}


function setupButtons() {

    const perlinBtn = document.getElementById("perlinBtn");
    const terraceBtn = document.getElementById("terraceBtn");
    const valueBtn = document.getElementById("valueBtn");

    if (perlinBtn) perlinBtn.onclick = () => noiseMode = "perlin";
    if (terraceBtn) terraceBtn.onclick = () => noiseMode = "terraced";
    if (valueBtn) valueBtn.onclick = () => noiseMode = "white";
}


function draw() {

    background(135, 190, 255);

    orbitControl();

    updateValues();

    ambientLight(120);
    directionalLight(255, 255, 255, -0.6, 1, -0.3);

    translate(-SIZE * TILE / 2, 80, -SIZE * TILE / 2);

    drawTerrain();
}

function updateValues() {

    noiseScale = Number(document.getElementById("scaleSlider").value);
    heightScale = Number(document.getElementById("heightSlider").value);
    octaves = Number(document.getElementById("octaveSlider").value);
    persistence = Number(document.getElementById("persistanceSlider").value);

    document.getElementById("noiseTypeValue").textContent = noiseMode;
    document.getElementById("scaleValue").textContent = noiseScale;
    document.getElementById("heightValue").textContent = heightScale;
    document.getElementById("octaveValue").textContent = octaves;
    document.getElementById("persistanceValue").textContent = persistence;
}


function drawTerrain() {

    stroke(30);

    let heights = [];

    for (let z = 0; z < SIZE; z++) {

        beginShape(TRIANGLE_STRIP);

        for (let x = 0; x < SIZE; x++) {

            let h1 = getHeight(x, z);
            let h2 = getHeight(x, z + 1);

            heights.push(h1);
            heights.push(h2);

            setTerrainColor(h1);
            vertex(x * TILE, -h1, z * TILE);

            setTerrainColor(h2);
            vertex(x * TILE, -h2, (z + 1) * TILE);
        }

        endShape();
    }

    drawHistogram(heights);
}


function getHeight(x, z) {

    let h = 0;
    let amp = heightScale;
    let freq = noiseScale;

    for (let i = 0; i < octaves; i++) {

        let n;

        if (noiseMode === "perlin") {
            n = noise(x * freq, z * freq);
        }

        else if (noiseMode === "terraced") {
            n = noise(x * freq, z * freq);
            n = floor(n * 4) / 4;
        }

        else {
            n = whiteNoise(x * freq, z * freq);
        }

        // smoother, more natural terrain shape
        n = (n * 2 - 1) * 0.5 + 0.5;

        h += n * amp;

        amp *= persistence;
        freq *= 2;
    }

    return h;
}


function setTerrainColor(h) {

    let water = 60;

    if (h < water) {
        fill(0, 90, 180); // deep water
    }

    else if (h < water + 15) {
        // sand blend
        let t = map(h, water, water + 15, 0, 1);
        fill(
            lerp(194, 210, t),
            lerp(178, 190, t),
            lerp(128, 150, t)
        );
    }

    else if (h < 140) {
        // grass blend
        let t = map(h, water + 15, 140, 0, 1);
        fill(
            lerp(40, 30, t),
            lerp(160, 120, t),
            lerp(60, 40, t)
        );
    }

    else if (h < 180) {
        fill(120, 120, 120); // rock
    }

    else {
        fill(240, 240, 240); // snow
    }
}


function whiteNoise(x, z) {

    let n = x * 374761 + z * 668265;
    n = sin(n) * 43758.5453;

    return n - floor(n);
}

function drawHistogram(heights) {

    const canvas = document.getElementById("histogram");
    if (!canvas) return;

    canvas.width = canvas.clientWidth;
    canvas.height = 300;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bins = 10;
    const histogram = new Array(bins).fill(0);

    const minHeight = Math.min(...heights);
    const maxHeight = Math.max(...heights);

    // Count heights into bins
    for (let h of heights) {

        let index = Math.floor(
            (h - minHeight) / (maxHeight - minHeight) * bins
        );

        if (index >= bins) index = bins - 1;
        if (index < 0) index = 0;

        histogram[index]++;
    }

    const maxCount = Math.max(...histogram);

    // Background
    ctx.fillStyle = "#10263d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const marginLeft = 60;
    const marginBottom = 45;
    const marginTop = 45;
    const marginRight = 20;

    const graphWidth = canvas.width - marginLeft - marginRight;
    const graphHeight = canvas.height - marginTop - marginBottom;

    // Draw axes
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(marginLeft, marginTop);
    ctx.lineTo(marginLeft, marginTop + graphHeight);
    ctx.lineTo(marginLeft + graphWidth, marginTop + graphHeight);
    ctx.stroke();

    // ---------- Y Axis ----------
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "right";

    const yTicks = 5;

    for (let i = 0; i <= yTicks; i++) {

        const value = Math.round(maxCount * (yTicks - i) / yTicks);

        const y = marginTop + (graphHeight / yTicks) * i;

        // Tick
        ctx.beginPath();
        ctx.moveTo(marginLeft - 5, y);
        ctx.lineTo(marginLeft, y);
        ctx.stroke();

        // Number
        ctx.fillText(value, marginLeft - 10, y + 4);
    }

    // ---------- X Axis ----------
    ctx.textAlign = "center";

    for (let i = 0; i <= bins; i++) {

        const x = marginLeft + (graphWidth / bins) * i;

        ctx.beginPath();
        ctx.moveTo(x, marginTop + graphHeight);
        ctx.lineTo(x, marginTop + graphHeight + 5);
        ctx.stroke();

        const value = Math.round(
            minHeight + (maxHeight - minHeight) * i / bins
        );

        ctx.fillText(value, x, marginTop + graphHeight + 20);
    }

    // ---------- Bars ----------
    const barWidth = graphWidth / bins;

    for (let i = 0; i < bins; i++) {

        const barHeight =
            (histogram[i] / maxCount) * graphHeight;

        ctx.fillStyle = "#4FC3F7";

        ctx.fillRect(
            marginLeft + i * barWidth + 2,
            marginTop + graphHeight - barHeight,
            barWidth - 4,
            barHeight
        );
    }

    // ---------- Title ----------
    ctx.fillStyle = "white";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Elevation Histogram", canvas.width / 2, 28);

    // ---------- X Label ----------
    ctx.font = "16px Arial";
    ctx.fillText(
        "Elevation",
        canvas.width / 2,
        canvas.height - 8
    );

    // ---------- Y Label ----------
    ctx.save();

    ctx.translate(18, canvas.height / 2);

    ctx.rotate(-Math.PI / 2);

    ctx.fillText("Number of Points", 0, 0);

    ctx.restore();
}
