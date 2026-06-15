let seed = 1000;

let noiseScale = 0.05;
let heightScale = 100;
let octaves = 4;
let persistence = 0.5;

let noiseMode = "perlin";

let waterLevel = 90;

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

    updateUI();

    waterLevel = 90 + sin(frameCount * 0.02) * 5;

    drawFog();
    drawTerrain();
    drawWater();
}

/* ---------------- UI SAFE UPDATE ---------------- */

function updateUI() {
    noiseScale = getSlider("scaleSlider", noiseScale);
    heightScale = getSlider("heightSlider", heightScale);
    octaves = getSlider("octaveSlider", octaves);
    persistence = getSlider("persistanceSlider", persistence);

    setText("noiseTypeValue", noiseMode);
    setText("scaleValue", noiseScale);
    setText("heightValue", heightScale);
    setText("octaveValue", octaves);
    setText("persistanceValue", persistence);
}

function getSlider(id, fallback) {
    const el = document.getElementById(id);
    return el ? Number(el.value) : fallback;
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

/* ---------------- FOG ---------------- */

function drawFog() {
    push();
    noStroke();
    fill(200, 220, 255, 18);
    translate(0, -50, 0);
    rotateX(HALF_PI);
    plane(6000, 6000);
    pop();
}

/* ---------------- WATER ---------------- */

function drawWater() {
    push();
    noStroke();
    fill(0, 140, 255, 140);

    translate(0, waterLevel, 0);
    rotateX(HALF_PI);
    plane(6000, 6000);

    pop();
}

/* ---------------- TERRAIN ---------------- */

function drawTerrain() {
    stroke(0);

    translate(-450, 0, -450);

    for (let z = 0; z < 30; z++) {
        beginShape(TRIANGLE_STRIP);

        for (let x = 0; x < 30; x++) {

            let h1 = getHeight(x, z);
            let h2 = getHeight(x, z + 1);

            setTerrainColor(h1);
            vertex(x * 30, -h1, z * 30);

            setTerrainColor(h2);
            vertex(x * 30, -h2, (z + 1) * 30);
        }

        endShape();
    }
}

/* ---------------- COLORS ---------------- */

function setTerrainColor(h) {
    if (h < waterLevel - 5) fill(0, 60, 160);
    else if (h < waterLevel + 5) fill(210, 190, 140);
    else if (h < 120) fill(40, 160, 60);
    else if (h < 150) fill(120);
    else fill(240);
}

/* ---------------- HEIGHT ---------------- */

function getHeight(x, z) {
    let h = 0;
    let amp = heightScale;
    let freq = noiseScale;

    for (let i = 0; i < octaves; i++) {

        let n;

        if (noiseMode === "perlin") {
            n = noise(x * freq + seed, z * freq + seed);
        } 
        else if (noiseMode === "terraced") {
            n = noise(x * freq + seed, z * freq + seed);
            n = Math.floor(n * 4) / 4;
        } 
        else {
            n = whiteNoise(x * freq + seed, z * freq + seed);
        }

        h += n * amp;
        amp *= persistence;
        freq *= 2;
    }

    return h;
}

function whiteNoise(x, z) {
    let n = x * 374761 + z * 668265;
    n = Math.sin(n) * 43758.5453;
    return n - Math.floor(n);
}
