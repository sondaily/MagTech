import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

let scene, camera, renderer, controls, composer;
let magnetGroup, coilL, coilR;
let mouseX = 0;
const container = document.getElementById('sim-container');

const CONFIG = {
    targetX: 0,
    maxOffset: 4.5,
    currentScale: 4.5,
    emissiveIntensity: 15.0,
    modelScale: 45,
    envMapIntensity: 0.4
};

if (container) {
    init();
}

function init() {
    console.log('Initializing maglev simulation...');

    // Scene & Camera
    scene = new THREE.Scene();
    scene.background = null; // Transparent background to show container background

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 10000);
    camera.position.set(300, 250, 500);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(200, 400, 100);
    scene.add(dirLight);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;

    // Post-processing (Bloom)
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.95;
    bloomPass.strength = 1.8;
    bloomPass.radius = 0.3;

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    const loader = new GLTFLoader();

    // 1. Load Rail Model
    loader.load('image/轨道组.glb',
        (gltf) => {
            const rail = gltf.scene;
            rail.scale.setScalar(CONFIG.modelScale);
            rail.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.envMapIntensity = CONFIG.envMapIntensity;
                }
            });
            scene.add(rail);
        },
        undefined,
        (error) => console.error('Error loading rail model:', error)
    );

    // 2. Load Magnet Model
    loader.load('image/磁体组.glb',
        (gltf) => {
            magnetGroup = gltf.scene;
            magnetGroup.scale.setScalar(CONFIG.modelScale);

            magnetGroup.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.envMapIntensity = CONFIG.envMapIntensity;

                    const name = child.name.toLowerCase();
                    if (name.includes('coil_l')) {
                        coilL = child;
                    }
                    if (name.includes('coil_r')) {
                        coilR = child;
                    }
                }
            });

            [coilL, coilR].forEach(c => {
                if (c) {
                    c.material = c.material.clone();
                    c.material.emissive = new THREE.Color(0x03A6AC); // Use site primary color
                    c.material.emissiveIntensity = 0;
                }
            });
            scene.add(magnetGroup);
        },
        undefined,
        (error) => console.error('Error loading magnet model:', error)
    );

    container.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();
        mouseX = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
    });

    window.addEventListener('resize', onWindowResize);
    animate();
}

function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    composer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if (magnetGroup) {
        const targetPosX = mouseX * CONFIG.maxOffset;
        magnetGroup.position.x += (targetPosX - magnetGroup.position.x) * 0.1;

        const offset = magnetGroup.position.x;

        let currentL = 0;
        let currentR = 0;

        if (offset > 0.01) {
            currentL = (offset / CONFIG.maxOffset) * 20;
            currentR = 0;
        } else if (offset < -0.01) {
            currentR = (Math.abs(offset) / CONFIG.maxOffset) * 20;
            currentL = 0;
        }

        const valOffset = document.getElementById('val-offset');
        const valL = document.getElementById('val-l');
        const valR = document.getElementById('val-r');

        if (valOffset) valOffset.innerText = (offset * 100).toFixed(2);
        if (valL) valL.innerText = currentL.toFixed(2);
        if (valR) valR.innerText = currentR.toFixed(2);

        if (coilL) coilL.material.emissiveIntensity = currentL * 2.5;
        if (coilR) coilR.material.emissiveIntensity = currentR * 2.5;
    }

    controls.update();
    composer.render();
}
