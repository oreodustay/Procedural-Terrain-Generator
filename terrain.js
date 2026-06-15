let seed = 1000;

let noiseScale = 0.05;
let heightScale = 100;
let octaves = 4;
let persistance = 0.5;

let noiseMode = "perlin";

function setup() {
    let canvas = createCanvas(800, 600, WEBGL);
    canvas.parent("canvas-container");

    setupButtons();
}

    function setupButtons() {
        //buttons here
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

    background(220);

    orbitControl();

    let fogY = -40 + sin(frameCount * 0.01) * 5;

    push();
    noStroke();
    fill(200, 220, 255, 18);
    translate(0, fogY, 0);
    rotateX(HALF_PI);
    plane(5000, 5000);
    pop();

    // sliders first
    noiseScale = Number(document.getElementById("scaleSlider").value);
    heightScale = Number(document.getElementById("heightSlider").value);
    octaves = Number(document.getElementById("octaveSlider").value);
    persistance = Number(document.getElementById("persistanceSlider").value);

    document.getElementById("noiseTypeValue").textContent = noiseMode;
    document.getElementById("scaleValue").textContent = noiseScale;
    document.getElementById("heightValue").textContent = heightScale;
    document.getElementById("octaveValue").textContent = octaves;
    document.getElementById("persistanceValue").textContent = persistance;

    translate(-450, 0, -450);
    let wave = sin(frameCount * 0.05) * 2;
    let waterLevel = 90 + sin(frameCount * 0.02) * 5;

    push();
    noStroke();
    fill(0, 140, 255, 140);

    translate(450, waterLevel + wave, 450);
    rotateX(HALF_PI);
    plane(3000, 3000);
    pop();

    stroke(0);

    for (let z = 0; z < 30; z++) {
        beginShape(TRIANGLE_STRIP);

        for (let x = 0; x < 30; x++) {

            let h1 = getHeight(x, z);
            let h2 = getHeight(x, z + 1);

            if (h1 < waterLevel - 5) {
        fill(0, 80, 200); 
        }
        else if (h1 < waterLevel + 5) {
        fill(194, 178, 128); 
        }
        else if (h1 < 120) {
        fill(34, 139, 34); 
        }
        else if (h1 < 150) {
        fill(120); 
        }
        else {
        fill(245); 
        }

            vertex(x * 30, -h1, z * 30);
            vertex(x * 30, -h2, (z + 1) * 30);
        }

        endShape();
    }
}

    push();

    fill(0, 80, 200, 150);
    noStroke();

    translate(0, 90, 0);

    rotateX(HALF_PI);
    plane(2000, 2000);

    pop();
}

function getHeight(x, z) {

let height = 0;

let amplitude = heightScale;
let frequency = noiseScale;

for(let octave = 0; octave < octaves; octave++) {

    let noiseValue;

    if(noiseMode === "perlin") {

        noiseValue = noise(x * frequency + seed, z * frequency + seed);

    } else if(noiseMode === "terraced") {

        noiseValue = noise(x * frequency + seed, z * frequency + seed);

        noiseValue = Math.floor(noiseValue * 3) / 3;

    } else {
        noiseValue = whiteNoise(
            x * frequency + seed, z * frequency + seed
        );
    }


    height += noiseValue * amplitude;

    amplitude *= persistance;
    frequency *= 2;

}

return height;
}

function whiteNoise(x,z) {
    let n = x * 374761 + z * 668265;
    n = Math.sin(n) * 43758.5453;

    return n - Math.floor(n);
}
