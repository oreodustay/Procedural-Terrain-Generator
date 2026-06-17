let seed = 1000;

let noiseScale = 0.05;
let heightScale = 100;
let octaves = 4;
let persistence = 0.5;

let noiseMode = "perlin";

function setup() {
    function windowResized() {
    let canvasWidth = min(windowWidth * 0.9, 800);
    let canvasHeight = min(windowHeight * 0.6, 600);

        resizeCanvas(canvasWidth, canvasHeight);
    }
    
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
    background(135, 190, 255); // simple sky (no effects)

    orbitControl();

    updateValues();

    translate(-450, 0, -450);

    drawTerrain();
    drawWater();
}

/* ---------------- UI ---------------- */

function updateValues() {
    noiseScale = getVal("scaleSlider", noiseScale);
    heightScale = getVal("heightSlider", heightScale);
    octaves = getVal("octaveSlider", octaves);
    persistence = getVal("persistanceSlider", persistence);

    setText("noiseTypeValue", noiseMode);
    setText("scaleValue", noiseScale);
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
    stroke(0);
    
    for (let z = 0; z < 30; z++) {
        beginShape(TRIANGLE_STRIP);

        for (let x = 0; x < 30; x++) {

            let h1 = getHeight(x, z);
            let h2 = getHeight(x, z + 1);

            setColor(h1);
            vertex(x * 30, -h1, z * 30);

            setColor(h2);
            vertex(x * 30, -h2, (z + 1) * 30);
        }

        endShape();
    }
}

/* ---------------- WATER ---------------- */

function drawWater() {
    let waterLevel = 90;

    push();
    noStroke();
    fill(0, 120, 255, 160);

    translate(0, waterLevel, 0);
    rotateX(HALF_PI);
    plane(2000, 2000);

    pop();
}

/* ---------------- COLORS ---------------- */

function setColor(h) {
    let waterLevel = 90;

    if (h < waterLevel - 5) fill(0, 70, 180);
    else if (h < waterLevel + 5) fill(194, 178, 128);
    else if (h < 120) fill(34, 139, 34);
    else if (h < 150) fill(120);
    else fill(245);
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

/* ---------------- WHITE NOISE ---------------- */

function whiteNoise(x, z) {
    let n = x * 374761 + z * 668265;
    n = Math.sin(n) * 43758.5453;
    return n - Math.floor(n);
}
