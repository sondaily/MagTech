import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ─── 核心变量 ─────────────────────────────────────────────────────────────────
const canvas = document.getElementById('main-canvas');
const loadingEl = document.getElementById('assembly-loading');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 20);

// 用于平滑插值的对象，由 GSAP 控制
const scrollState = {
    progress: 0,
    rotationY: 0,
    camX: 0,
    camY: 5,
    camZ: 25,
    targetX: 0,
    targetY: 0,
    targetZ: 0,
    modelScale: 1.5 // 极大提升初始缩放
};

// ─── 灯光 ───────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 2.5));
const addDir = (c, i, x, y, z) => {
    const l = new THREE.DirectionalLight(c, i);
    l.position.set(x, y, z); scene.add(l);
};
addDir(0xffffff, 4, 10, 10, 10);
addDir(0x03A6AC, 3, -10, -5, 5);
addDir(0x007AFF, 2, 0, -10, -5);

// ─── 模型加载 ─────────────────────────────────────────────────────────────────
const CONFIGS = [
    { name: 'Body', file: 'image/Body.glb', dir: new THREE.Vector3(0, 5, 0) },
    { name: 'Bogie_Front', file: 'image/Bogie_Front.glb', dir: new THREE.Vector3(-10, -5, 0) },
    { name: 'Bogie_Rear', file: 'image/Bogie_Rear.glb', dir: new THREE.Vector3(10, -5, 0) },
    { name: 'Bogie_Standalone', file: 'image/zhuanxiangjia.glb', isStandalone: true }
];

const partData = [];
const mainGroup = new THREE.Group();
scene.add(mainGroup);

let loadedCount = 0;
const loader = new GLTFLoader();

// 兜底方案：10秒后强制移除加载层，防止卡死
const loadTimeout = setTimeout(() => {
    if (loadingEl) {
        console.warn('[MagTech3D] Loading timed out. Forcing start.');
        onAllLoaded();
    }
}, 10000);

function onAllLoaded() {
    clearTimeout(loadTimeout);
    console.log('[MagTech3D] All models loaded or skipped.');
    setupAnimations();
    if (loadingEl) {
        loadingEl.style.opacity = '0';
        setTimeout(() => loadingEl.remove(), 1000);
    }
    animate();
}

CONFIGS.forEach(cfg => {
    loader.load(cfg.file, gltf => {
        const model = gltf.scene;
        model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        const group = new THREE.Group();
        group.add(model);
        mainGroup.add(group);

        // 恢复：获取每个模型的原始包围盒中心，用于重置到局部原点
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        console.info(`[3D Loader] ${cfg.name} size:`, size);
        model.position.sub(center); // 重置到 group 中心

        // 记录组装位置 (根据模型原始轴向校准，长度沿 X 轴)
        let assembledPos = new THREE.Vector3(0, 0, 0);
        if (cfg.name === 'Bogie_Front') assembledPos.set(-3, -1, 0);
        if (cfg.name === 'Bogie_Rear') assembledPos.set(3, -1, 0);

        // 直接设置为组装后的位置
        group.position.copy(assembledPos);

        // 如果是独立展示模型，初始设为不可见
        if (cfg.isStandalone) group.visible = false;

        partData.push({
            group,
            name: cfg.name,
            assembledPos,
            isStandalone: !!cfg.isStandalone // 标记为独立资产
        });

        loadedCount++;
        if (loadedCount === CONFIGS.length) onAllLoaded();
    }, undefined, error => {
        console.error(`[MagTech3D] Failed to load ${cfg.name}:`, error);
        loadedCount++; // 即使失败也推进进度
        if (loadedCount === CONFIGS.length) onAllLoaded();
    });
});

// ─── GSAP ScrollAnimations ──────────────────────────────────────────────────
function setupAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // 主时间轴
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#story-content",
            start: "top top",
            end: "bottom bottom",
            scrub: 1, // 平滑跟随滚动条
        }
    });

    // 状态 1: Hero -> Intro Video (平滑进入视频区，模型略微后移)
    tl.to(scrollState, {
        camZ: 30,
        rotationY: Math.PI * 0.2,
        duration: 1
    }, 0);

    // 状态 2: Intro Video -> Bogie Exhibit (背景模型略微前移并模糊/暗化)
    tl.to(scrollState, {
        camZ: 40,
        camY: 10,
        rotationY: Math.PI * 1.2,
        duration: 1
    }, 1);

    // 状态 3: Bogie Exhibit -> Structure (整车组装展示，快速拉近)
    tl.to(scrollState, {
        progress: 1,
        camZ: 12,
        camY: 2,
        modelScale: 2.2,
        rotationY: Math.PI * 1.5,
        duration: 1
    }, 2);

    // 状态 4: Structure -> Tech Passive (移动相机到左侧特写)
    tl.to(scrollState, {
        camX: -8,
        camZ: 12,
        camY: -1,
        targetX: -2,
        duration: 1
    }, 3);

    // 状态 5: Tech Passive -> Tech Active
    tl.to(scrollState, {
        camX: 8,
        camZ: 14,
        camY: 0,
        targetX: 2,
        rotationY: Math.PI * 1.8,
        duration: 1
    }, 4);

    // 状态 6: Tech Active -> Interaction
    tl.to(scrollState, {
        camX: 0,
        camZ: 20,
        camY: 10,
        targetX: 0,
        modelScale: 0.3,
        rotationY: Math.PI * 2.0,
        duration: 1
    }, 5);

    // 状态 7: Interaction -> Benefits
    tl.to(scrollState, {
        camX: 15,
        camZ: 15,
        camY: 2,
        targetX: 0,
        targetY: 0,
        modelScale: 0.9,
        rotationY: Math.PI * 2.5,
        duration: 1
    }, 6);

    // ─── 独立内容淡入动画（不依赖 scrub 时间轴）──────────────────────────────
    const fadeTargets = [
        '#tech-passive .animate-text h2',
        '#tech-passive .animate-text p',
        '#tech-passive .reveal-img',
        '#tech-active .animate-text h2',
        '#tech-active .animate-text p',
        '#tech-active .reveal-img',
        '#benefits .glass-card',
        '#apps .container > div',
        '#apps .video-preview-card',
        '#contact .container',
        '#bogie-step .animate-text h2',
        '#bogie-step .animate-text p',
        '#bogie-step .parts-list'
    ];

    fadeTargets.forEach(selector => {
        const els = document.querySelectorAll(selector);
        if (!els.length) return;
        gsap.set(els, { opacity: 0, y: 20 });
        ScrollTrigger.create({
            trigger: els[0].closest('section') || els[0],
            start: 'top 80%',
            onEnter: () => {
                gsap.to(els, { opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: 'power2.out', overwrite: true });
            },
            once: true
        });
    });

    // 状态 8 (3D背景): Benefits -> Gallery
    tl.to(scrollState, {
        camX: 0,
        camZ: 30,
        camY: 12,
        rotationY: Math.PI * 2.8,
        duration: 1
    }, 7);

    // 状态 9 (3D背景): Gallery -> Apps
    tl.to(scrollState, {
        camX: 0,
        camZ: 25,
        camY: 15,
        rotationY: Math.PI * 3.2,
        duration: 1
    }, 8);

    // 2D: 应用场景视频容器位移与文字浮现
    tl.to("#apps .container > div", { opacity: 1, y: 0, duration: 0.8 }, 8.2);
    tl.to("#apps .video-preview-card", {
        scale: 1,
        opacity: 1,
        x: 0,
        duration: 1
    }, 8.4);

    // 状态 10: Apps -> Contact (模型退场/虚化)
    tl.to(scrollState, {
        camZ: 40,
        camY: 20,
        modelScale: 0.5,
        rotationY: Math.PI * 3.8,
        duration: 1
    }, 9);

    // 2D: 联系表单入场
    tl.to("#contact .container", { opacity: 1, y: 0, duration: 1 }, 9.2);

    // 激活文字层显示 (Active Class 切换)
    const steps = document.querySelectorAll('.story-step');
    steps.forEach((step, i) => {
        ScrollTrigger.create({
            trigger: step,
            start: "top center",
            end: "bottom center",
            onToggle: self => {
                const video = step.querySelector('video');
                if (self.isActive) {
                    steps.forEach(s => s.classList.remove('active'));
                    step.classList.add('active');
                    if (video) video.play().catch(e => console.warn("[MagTech] Video play blocked:", e));
                } else {
                    if (video) video.pause();
                }
            }
        });
    });

}

// ─── 每一帧更新 ──────────────────────────────────────────────────────────────
function animate() {
    requestAnimationFrame(animate);

    // 1. 仅对模型组进行旋转和缩放
    mainGroup.rotation.y = scrollState.rotationY;
    mainGroup.scale.setScalar(scrollState.modelScale);

    // 2. 更新相机位置与注视点
    camera.position.set(scrollState.camX, scrollState.camY, scrollState.camZ);
    camera.lookAt(scrollState.targetX, scrollState.targetY, scrollState.targetZ);

    renderer.render(scene, camera);
}

// ─── 窗口自适应 ──────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
renderer.setSize(window.innerWidth, window.innerHeight);
