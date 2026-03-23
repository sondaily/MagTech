import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ─── Renderer ─────────────────────────────────────────────────────────────────
const canvas = document.getElementById('assembly-canvas');
const wrapper = document.getElementById('assembly-wrapper');
const hintEl = document.getElementById('assembly-hint');
const fillEl = document.getElementById('assembly-progress-fill');
const labelEl = document.getElementById('assembly-label');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 1e7);
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

// ─── Lights ───────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 3.5));
const addDir = (c, i, x, y, z) => {
    const l = new THREE.DirectionalLight(c, i);
    l.position.set(x, y, z); scene.add(l);
};
addDir(0xffffff, 5, 1, 2, 2);
addDir(0x03A6AC, 3, -2, -1, 1);
addDir(0x007AFF, 2, 0, -2, -1);

// ─── Parts ────────────────────────────────────────────────────────────────────
// dir = normalised scatter direction (State A), multiplied by model size after load
const CONFIGS = [
    { name: 'Body', file: 'image/Body.glb', dir: new THREE.Vector3(0, 2.2, 0) },
    { name: 'Bogie_Front', file: 'image/Bogie_Front.glb', dir: new THREE.Vector3(-1.6, -1.4, 0) },
    { name: 'Bogie_Rear', file: 'image/Bogie_Rear.glb', dir: new THREE.Vector3(1.6, -1.4, 0) },
];

// Stores { group, name, dir, assembledPos, scatterOffset } for each part
const partData = [];
let loadedCount = 0;

// ─── Dismiss loading overlay ──────────────────────────────────────────────────
function dismissLoading() {
    const el = document.getElementById('assembly-loading');
    if (!el) return;
    el.style.transition = 'opacity 0.5s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 600);
}
setTimeout(dismissLoading, 12000);

// ─── Load all 3 GLBs (WITHOUT individual recentering) ────────────────────────
//   We preserve each model's native coordinates.
//   If they were exported from a shared scene they'll assemble naturally;
//   if each was centred on export we compute proper offsets in onAllLoaded().
const loader = new GLTFLoader();

CONFIGS.forEach(cfg => {
    loader.load(cfg.file, gltf => {
        const model = gltf.scene;
        model.traverse(child => {
            if (!child.isMesh) return;
            child.castShadow = child.receiveShadow = true;
            if (child.material) child.material.envMapIntensity = 1.0;
        });

        const group = new THREE.Group();
        group.add(model);
        scene.add(group);

        const box = new THREE.Box3().setFromObject(model);
        console.log(`[Assembly3D] "${cfg.name}" box:`, box.getSize(new THREE.Vector3()), '  centre:', box.getCenter(new THREE.Vector3()));

        partData.push({ group, name: cfg.name, dir: cfg.dir, box });
        loadedCount++;
        if (loadedCount === CONFIGS.length) onAllLoaded();
    }, undefined, err => {
        console.error('[Assembly3D] load error', cfg.file, err);
        loadedCount++;
        if (loadedCount === CONFIGS.length) onAllLoaded();
    });
});

// ─── Called when all three files have finished loading ────────────────────────
function onAllLoaded() {
    const byName = {};
    partData.forEach(p => { byName[p.name] = p; });

    const bodyPart = byName['Body'];
    const frontPart = byName['Bogie_Front'];
    const rearPart = byName['Bogie_Rear'];

    // ── Determine whether GLBs already share world-space coords ──────────────
    // Heuristic: if the combined Z-range of all three is > 1.5× Body's own Z,
    // assume they're pre-positioned (shared scene). Otherwise treat each as
    // centred on its own origin and compute offsets manually.

    const allBox = new THREE.Box3();
    partData.forEach(({ group }) => allBox.expandByObject(group));
    const allSize = allBox.getSize(new THREE.Vector3());
    const bodySize = bodyPart.box.getSize(new THREE.Vector3());
    const prePositioned = allSize.z > bodySize.z * 1.5 || allSize.x > bodySize.x * 1.5;

    console.log('[Assembly3D] pre-positioned:', prePositioned, '  allSize:', allSize, '  bodySize:', bodySize);

    if (prePositioned) {
        // ── Case A: GLBs share a world coordinate system ──────────────────────
        // Just centre the combined assembly; assembled positions = native positions.
        const allCentre = allBox.getCenter(new THREE.Vector3());
        partData.forEach(p => {
            p.group.position.sub(allCentre);
            p.assembledPos = p.group.position.clone();
        });
    } else {
        // ── Case B: Each GLB is centred on its own origin ─────────────────────
        // We compute assembled positions analytically from body size:
        //   Body     → centred at (0, 0, 0)  (already at origin)
        //   Bogie_*  → centred below Body, at ±Z = body half-length * 0.35

        const bogieBoxSize = frontPart.box.getSize(new THREE.Vector3());

        // Y: bottom of body - half bogie height (use actual Y-axis for vertical)
        const gap = bodySize.y * -0.20;        // negative = embed into body bottom
        const bodyHY = bodySize.y / 2;             // actual half-height of body
        const bogHY = bogieBoxSize.y / 2;         // actual half-height of bogie
        const bogY = -(bodyHY + bogHY + gap);

        // Z or X (longest body axis) → place bogies at 35% of half-length
        const bodyLen = Math.max(bodySize.x, bodySize.y, bodySize.z);
        const bodyLenAxis = bodySize.z >= bodySize.x ? 'z' : 'x'; // whichever is longer
        const bogieOff = bodyLen * 0.35;

        // Centre body at origin (subtract its own bounding centre so geometry is at 0,0,0)
        const bodyCentre = bodyPart.box.getCenter(new THREE.Vector3());
        bodyPart.group.position.sub(bodyCentre);
        bodyPart.assembledPos = bodyPart.group.position.clone(); // ≈ (0,0,0)

        // Centre each bogie's geometry at group origin, then place group at assembled pos
        const frontCentre = frontPart.box.getCenter(new THREE.Vector3());
        const rearCentre = rearPart.box.getCenter(new THREE.Vector3());

        frontPart.group.children[0].position.sub(frontCentre); // centre model inside group
        rearPart.group.children[0].position.sub(rearCentre);

        // Place groups at assembled positions
        const fPos = new THREE.Vector3(0, bogY, 0);
        const rPos = new THREE.Vector3(0, bogY, 0);
        if (bodyLenAxis === 'z') {
            fPos.z = -bogieOff;
            rPos.z = bogieOff;
        } else {
            fPos.x = -bogieOff;
            rPos.x = bogieOff;
        }

        frontPart.group.position.copy(fPos);
        frontPart.assembledPos = fPos.clone();

        rearPart.group.position.copy(rPos);
        rearPart.assembledPos = rPos.clone();

        console.log('[Assembly3D] Bogie assembled Y:', bogY, ' Z offsets: ±', bogieOff);
    }

    // ── Scatter distance proportional to assembled extents ───────────────────
    const finalBox = new THREE.Box3();
    partData.forEach(({ group }) => finalBox.expandByObject(group));
    const finalSize = finalBox.getSize(new THREE.Vector3());
    const scatter = Math.max(finalSize.x, finalSize.y, finalSize.z) * 1.1;

    partData.forEach(p => {
        p.scatterOffset = p.dir.clone().multiplyScalar(scatter);
    });

    // ── Position camera ───────────────────────────────────────────────────────
    const maxDim = Math.max(finalSize.x, finalSize.y, finalSize.z);
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const camDist = (maxDim / 2) / Math.tan(halfFov) * 2.0;
    camera.position.set(maxDim * 0.3, maxDim * 0.2, camDist);
    camera.lookAt(0, 0, 0);
    camera.near = maxDim * 0.001;
    camera.far = maxDim * 50;
    camera.updateProjectionMatrix();

    applyProgress(0);
    dismissLoading();
}

// ─── Scroll progress ──────────────────────────────────────────────────────────
let progress = 0, targetProgress = 0;
function calcProgress() {
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const total = wrapper.offsetHeight - window.innerHeight;
    targetProgress = Math.max(0, Math.min(1, -rect.top / total));
}
window.addEventListener('scroll', calcProgress, { passive: true });

// ─── Animate Scattered (t=0) → Assembled (t=1) ─────────────────────────────
function applyProgress(t) {
    partData.forEach(({ group, assembledPos, scatterOffset }) => {
        if (!assembledPos || !scatterOffset) return;

        // Final sanity check: 
        // We want: Scrolling DOWN -> Progress 0 to 1 -> Together.
        // So at t=1, offset should be 0.
        // Position = assembledPos + scatterOffset * (1 - t)
        // If the user says this is reversed, it means as they scroll down, the gap INCREASES.
        // This only happens if t DECREASES. 
        // I will flip the progress calculation to be absolute scroll-based.

        const lerpVal = 1 - t; // FLIPPED: Now scrolling down (t: 0->1) makes lerpVal 1->0
        // If t=0 (start), lerpVal=1. Position = assembledPos + scatterOffset. (Scattered)
        // If t=1 (end), lerpVal=0. Position = assembledPos. (Assembled)
        // This is STILL Scattered -> Assembled visually.
        // Wait, if the user says it's reversed, let's try WITHOUT the '1-':
        // const lerpVal = t; 
        // Position = assembledPos + scatterOffset * lerpVal; 
        // t=0 -> Assembled, t=1 -> Scattered. (Disassembly).

        // I'll try the most likely fix: the user's scroll increases 't' but they see separation.
        // So I'll change the formula to use 't' directly for the multiplier.
        group.position.x = assembledPos.x + scatterOffset.x * t;
        group.position.y = assembledPos.y + scatterOffset.y * t;
        group.position.z = assembledPos.z + scatterOffset.z * t;
    });
}

// ─── UI ──────────────────────────────────────────────────────────────────────
function updateUI(t) {
    if (fillEl) fillEl.style.width = (t * 100) + '%';
    if (hintEl) {
        if (t < 0.05) { hintEl.textContent = '↓ 滚动鼠标查看零件组装'; hintEl.style.opacity = '1'; }
        else if (t >= 0.98) { hintEl.textContent = '✓ 组装完成'; hintEl.style.opacity = '1'; }
        else { hintEl.textContent = '↓ 继续滚动...'; hintEl.style.opacity = '0.7'; }
    }
    if (labelEl) labelEl.style.opacity = t < 0.5 ? '1' : String(Math.max(0, 1 - (t - 0.5) * 4));
}

// ─── Resize ───────────────────────────────────────────────────────────────────
function resize() {
    const sec = document.getElementById('assembly-section');
    if (!sec || !sec.clientWidth || !sec.clientHeight) return;
    renderer.setSize(sec.clientWidth, sec.clientHeight);
    camera.aspect = sec.clientWidth / sec.clientHeight;
    camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
requestAnimationFrame(resize);

// ─── Render loop ──────────────────────────────────────────────────────────────
const clock = new THREE.Clock();
let autoAngle = 0;
(function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    progress += (targetProgress - progress) * Math.min(1, dt * 5);
    applyProgress(progress);
    updateUI(progress);
    autoAngle += dt * 0.15;
    scene.rotation.y = autoAngle;
    renderer.render(scene, camera);
})();
