let seed = 1000;

let noiseScale = 0.05;
let heightScale = 120;
let octaves = 4;
let persistence = 0.5;

let noiseMode = "perlin";

const SIZE = 60;
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

    orbitControl(); // IMPORTANT for movement

    updateValues();

    // better camera position feel
    translate(-SIZE * TILE / 2, 0, -SIZE * TILE / 2);

    drawTerrain();
}

/* ---------------- UI ---------------- */

function updateValues() {

    noiseScale = getVal("scaleSlider", noiseScale);
    heightScale = getVal("heightSlider", heightScale);
    octaves = getVal("octaveSlider", octaves);
    persistence = getVal("persistanceSlider", persistence);

    setText("noiseTypeValue", noiseMode);
    setText("scaleValue", noiseScale.toFixed(2));
    setText("heightValue", heightScale);
    setText("octaveValue", octaves);
    setText("persistanceValue", persistence);
}

function getVal(id, fallback) {
    const el = document.getElementById(id);
    return el ? Number(el.value) : fallback;
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

/* ---------------- TERRAIN ---------------- */

function drawTerrain() {

    stroke(40);
    noStroke();

    for (let z = 0; z < SIZE; z++) {

        beginShape(TRIANGLE_STRIP);

        for (let x = 0; x < SIZE; x++) {

            let h1 = getHeight(x, z);
            let h2 = getHeight(x, z + 1);

            setColor(h1);
            vertex(x * TILE, -h1, z * TILE);

            setColor(h2);
            vertex(x * TILE, -h2, (z + 1) * TILE);
        }

        endShape();
    }
}

/* ---------------- COLORS ---------------- */

function setColor(h) {

    let waterLevel = 90;

    if (h < waterLevel - 10) {
        fill(0, 70, 160); // deep water
    }
    else if (h < waterLevel + 5) {
        fill(194, 178, 128); // sand
    }
    else if (h < 140) {
        fill(50, 160, 70); // grass
    }
    else if (h < 180) {
        fill(110); // rock
    }
    else {
        fill(240); // snow
    }
}

/* ---------------- HEIGHT ---------------- */

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

        h += n * amp;

        amp *= persistence;
        freq *= 2;
    }

    return h;
}

/* ---------------- WHITE NOISE ---------------- */

function whiteNoise(x, z) {
    let n = x * 374761 + z * 668265;
    n = sin(n) * 43758.5453;
    return n - floor(n);
}
