let seed = 1000;

let noiseScale = 0.05;
let heightScale = 100;
let octaves = 4;
let persistence = 0.5;

let noiseMode = "perlin";

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

    document.getElementById("perlinBtn").onclick = () => {
        noiseMode = "perlin";
    };

    document.getElementById("terraceBtn").onclick = () => {
        noiseMode = "terraced";
    };

    document.getElementById("valueBtn").onclick = () => {
        noiseMode = "white";
    };
}

function draw() {

    background(135, 190, 255);

    updateValues();

    camera(
        450, -500, 1200,
        450, 0, 450,
        0, 1, 0
    );

    ambientLight(180);
    directionalLight(255, 255, 255, -1, 1, -1);

    drawWater();
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

    stroke(40);

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

function drawWater() {

    push();

    noStroke();

    fill(0, 120, 255, 120);

    let wave = sin(frameCount * 0.05) * 4;

    translate(450, -90 + wave, 450);

    rotateX(HALF_PI);

    plane(2500, 2500);

    pop();
}

function setTerrainColor(h) {

    if (h < 90) {
        fill(0, 70, 180);
    }
    else if (h < 105) {
        fill(194, 178, 128);
    }
    else if (h < 140) {
        fill(50, 170, 70);
    }
    else if (h < 190) {
        fill(120);
    }
    else {
        fill(250);
    }
}

function getHeight(x, z) {

    let height = 0;

    let amplitude = heightScale;
    let frequency = noiseScale;

    for (let i = 0; i < octaves; i++) {

        let value;

        if (noiseMode === "perlin") {

            value = noise(
                x * frequency + seed,
                z * frequency + seed
            );

        } else if (noiseMode === "terraced") {

            value = noise(
                x * frequency + seed,
                z * frequency + seed
            );

            value = floor(value * 4) / 4;

        } else {

            value = whiteNoise(
                x * frequency + seed,
                z * frequency + seed
            );
        }

        height += value * amplitude;

        amplitude *= persistence;
        frequency *= 2;
    }

    return height;
}

function whiteNoise(x, z) {

    let n = x * 374761 + z * 668265;

    n = sin(n) * 43758.5453;

    return n - floor(n);
}
