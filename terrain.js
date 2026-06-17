let seed = 1000;

let noiseScale = 0.05;
let heightScale = 120;
let octaves = 4;
let persistence = 0.5;

let noiseMode = "perlin";

const SIZE = 60;
const TILE = 15;

// 🌊 river settings
let riverAngle = 0.4; // direction of river flow
let riverWidth = 0.12;
let riverDepth = 35;

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

/* ---------------- CONTROLS ---------------- */

function setupButtons() {

    const perlinBtn = document.getElementById("perlinBtn");
    const terraceBtn = document.getElementById("terraceBtn");
    const valueBtn = document.getElementById("valueBtn");

    if (perlinBtn) perlinBtn.onclick = () => noiseMode = "perlin";
    if (terraceBtn) terraceBtn.onclick = () => noiseMode = "terraced";
    if (valueBtn) valueBtn.onclick = () => noiseMode = "white";
}

/* ---------------- MAIN DRAW ---------------- */

function draw() {

    background(135, 190, 255);

    orbitControl();

    updateValues();

    ambientLight(120);
    directionalLight(255, 255, 255, -0.6, 1, -0.3);

    translate(-SIZE * TILE / 2, 80, -SIZE * TILE / 2);

    drawTerrain();
}

/* ---------------- UI ---------------- */

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

/* ---------------- TERRAIN ---------------- */

function drawTerrain() {

    stroke(25);

    for (let z = 0; z < SIZE; z++) {

        beginShape(TRIANGLE_STRIP);

        for (let x = 0; x < SIZE; x++) {

            let h1 = getHeight(x, z);
            let h2 = getHeight(x, z + 1);

            setTerrainColor(h1);
            vertex(x * TILE, -h1, z * TILE);

            setTerrainColor(h2);
            vertex(x * TILE, -h2, (z + 1) * TILE);
        }

        endShape();
    }
}

/* ---------------- HEIGHT + RIVERS ---------------- */

function getHeight(x, z) {

    let h = 0;
    let amp = heightScale;
    let freq = noiseScale;

    // base terrain
    for (let i = 0; i < octaves; i++) {

        let n = noise(x * freq, z * freq);

        if (noiseMode === "terraced") {
            n = floor(n * 4) / 4;
        }

        h += n * amp;

        amp *= persistence;
        freq *= 2;
    }

    // 🌊 RIVER CARVING
    let river = riverMask(x, z);

    if (river > 0) {
        h -= river * riverDepth;
    }

    return h;
}

/* ---------------- RIVER FUNCTION ---------------- */

function riverMask(x, z) {

    // diagonal flowing river
    let nx = x / SIZE;
    let nz = z / SIZE;

    // rotate space so river flows diagonally
    let dx = nx * cos(riverAngle) - nz * sin(riverAngle);
    let dz = nx * sin(riverAngle) + nz * cos(riverAngle);

    // noise-based river path
    let n = noise(dx * 3, dz * 3);

    // turn into thin river line
    let distToRiver = abs(n - 0.5);

    let mask = 1 - smoothstep(riverWidth, riverWidth + 0.1, distToRiver);

    return mask;
}

/* ---------------- COLORS ---------------- */

function setTerrainColor(h) {

    let water = 60;

    if (h < water) {
        fill(0, 90, 180); // water
    }

    else if (h < water + 12) {
        fill(200, 180, 140); // sand
    }

    else if (h < 140) {
        fill(40, 150, 60); // grass
    }

    else if (h < 180) {
        fill(110); // rock
    }

    else {
        fill(240); // snow
    }
}

/* ---------------- SMOOTHSTEP ---------------- */

function smoothstep(edge0, edge1, x) {
    let t = constrain((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}
