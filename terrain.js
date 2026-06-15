let seed = 1000;

let noiseScale = 0.05;
let heightScale = 100;
let octaves = 4;
let persistence = 0.5;

let noiseMode = "perlin";

function setup() {
    let canvas = createCanvas(800, 600, WEBGL);
    canvas.parent("canvas-container");

    setupButtons();
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
    background(10, 20, 35);

    orbitControl();

    updateSliders();

    // 🌫️ Fog layer (depth atmosphere)
    drawFog();

    translate(-450, 0, -450);

    // 🌊 Water animation
    drawWater();

    // 🏔️ Terrain
    drawTerrain();
}

function updateSliders() {
    const scaleSlider = document.getElementById("scaleSlider");
    const heightSlider = document.getElementById("heightSlider");
    const octaveSlider = document.getElementById("octaveSlider");
    const persistenceSlider = document.getElementById("persistanceSlider");

    noiseScale = scaleSlider ? Number(scaleSlider.value) : noiseScale;
    heightScale = heightSlider ? Number(heightSlider.value) : heightScale;
    octaves = octaveSlider ? Number(octaveSlider.value) : octaves;
    persistence = persistenceSlider ? Number(persistenceSlider.value) : persistence;

    setText("noiseTypeValue", noiseMode);
    setText("scaleValue", noiseScale);
    setText("heightValue", heightScale);
    setText("octaveValue", octaves);
    setText("persistanceValue", persistence);
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function drawFog() {
    push();
    noStroke();
    fill(200, 220, 255, 20);

    translate(0, -40 + sin(frameCount * 0.01) * 5, 0);
    rotateX(HALF_PI);
    plane(6000, 6000);

    pop();
}

function drawWater() {
    let wave = sin(frameCount * 0.05) * 2;
    let waterLevel = 90 + sin(frameCount * 0.02) * 5;

    push();
    noStroke();
    fill(0, 140, 255, 140);

    translate(0, waterLevel + wave, 0);
    rotateX(HALF_PI);
    plane(5000, 5000);

    pop();
}

function drawTerrain() {
    let waterLevel = 90 + sin(frameCount * 0.02) * 5;

    stroke(0);

    for (let z = 0; z < 30; z++) {
        beginShape(TRIANGLE_STRIP);

        for (let x = 0; x < 30; x++) {

            let h1 = getHeight(x, z);
            let h2 = getHeight(x, z + 1);

            drawColor(h1, waterLevel);
            vertex(x * 30, -h1, z * 30);

            drawColor(h2, waterLevel);
            vertex(x * 30, -h2, (z + 1) * 30);
        }

        endShape();
    }
}

function drawColor(h, waterLevel) {
    if (h < waterLevel - 5) {
        fill(0, 70, 180); // deep water
    } 
    else if (h < waterLevel + 5) {
        fill(194, 178, 128); // beach
    } 
    else if (h < 120) {
        fill(34, 139, 34); // grass
    } 
    else if (h < 150) {
        fill(120); // rock
    } 
    else {
        fill(245); // snow
    }
}

function getHeight(x, z) {
    let height = 0;
    let amplitude = heightScale;
    let frequency = noiseScale;

    for (let i = 0; i < octaves; i++) {

        let value;

        if (noiseMode === "perlin") {
            value = noise(x * frequency + seed, z * frequency + seed);
        } 
        else if (noiseMode === "terraced") {
            value = noise(x * frequency + seed, z * frequency + seed);
            value = Math.floor(value * 4) / 4;
        } 
        else {
            value = whiteNoise(x * frequency + seed, z * frequency + seed);
        }

        height += value * amplitude;

        amplitude *= persistence;
        frequency *= 2;
    }

    return height;
}

function whiteNoise(x, z) {
    let n = x * 374761 + z * 668265;
    n = Math.sin(n) * 43758.5453;
    return n - Math.floor(n);
}
