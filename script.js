
// Reveal animations on scroll
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, {
    threshold: 0.1
});

revealElements.forEach(el => {
    revealObserver.observe(el);
});

// Smooth scrolling for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Close mobile menu if open
            const navLinks = document.getElementById('nav-links');
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }

            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Hero Background Carousel
const slides = document.querySelectorAll('.carousel-slide');
let currentSlide = 0;

function nextSlide() {
    if (slides.length === 0) return;
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

if (slides.length > 0) {
    setInterval(nextSlide, 5000); // Switch every 5 seconds
}

// Sticky Navbar
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Contact Form AJAX Submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.textContent = '发送中...';

        try {
            const response = await fetch(contactForm.action, {
                method: contactForm.method,
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                alert('消息发送成功！');
                contactForm.reset();
            } else {
                alert('发送失败，请稍后再试。');
            }
        } catch (error) {
            alert('发生错误，请检查网络连接。');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
}


gsap.registerPlugin(ScrollTrigger);

/* ─── Hero Video Sequence Logic ──────────────────────────── */
const heroCanvas = document.getElementById("hero-canvas");
if (heroCanvas) {
    const context = heroCanvas.getContext("2d");
    heroCanvas.width = 1920;
    heroCanvas.height = 1080;

    const frameCount = 80;
    const currentFrame = index => (
        `image/frames_hero/frame_${(index + 1).toString().padStart(4, '0')}.webp`
    );

    const images = [];
    const heroFrames = { frame: 0 };

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
    }

    images[0].onload = renderHeroFrame;

    function renderHeroFrame() {
        if (images[heroFrames.frame]) {
            context.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
            context.drawImage(images[heroFrames.frame], 0, 0, heroCanvas.width, heroCanvas.height);
        }
    }

    gsap.to(heroFrames, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "+=2000",
            scrub: 1,
            pin: true
        },
        onUpdate: renderHeroFrame
    });
}

/* ─── One Video Sequence Logic ─────────────────────────────── */
const oneCanvas = document.getElementById("one-canvas");
if (oneCanvas) {
    const context = oneCanvas.getContext("2d");
    oneCanvas.width = 1920;
    oneCanvas.height = 1080;

    const frameCount = 90;
    const currentFrame = index => (
        `image/frames_one/frame_${(index + 1).toString().padStart(4, '0')}.webp`
    );

    const images = [];
    const oneFrames = { frame: 0 };

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
    }

    images[0].onload = renderOneFrame;

    function renderOneFrame() {
        if (images[oneFrames.frame]) {
            context.clearRect(0, 0, oneCanvas.width, oneCanvas.height);
            context.drawImage(images[oneFrames.frame], 0, 0, oneCanvas.width, oneCanvas.height);
        }
    }

    gsap.to(oneFrames, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
            trigger: "#one-video-scroll",
            start: "top top",
            end: "+=2500",
            scrub: 1,
            pin: true
        },
        onUpdate: renderOneFrame
    });
}

/* ─── Specs Video Sequence Logic ───────────────────────────── */
const specsCanvas = document.getElementById("specs-canvas");
if (specsCanvas) {
    const context = specsCanvas.getContext("2d");
    specsCanvas.width = 1920;
    specsCanvas.height = 1080;

    const frameCount = 90;
    const currentFrame = index => (
        `image/frames_zhanshi/frame_${(index + 1).toString().padStart(4, '0')}.webp`
    );

    const images = [];
    const specsFrames = { frame: 0 };

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
    }

    images[0].onload = renderSpecsFrame;

    function renderSpecsFrame() {
        if (images[specsFrames.frame]) {
            context.clearRect(0, 0, specsCanvas.width, specsCanvas.height);
            context.drawImage(images[specsFrames.frame], 0, 0, specsCanvas.width, specsCanvas.height);
        }
    }

    gsap.to(specsFrames, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
            trigger: "#specs-step",
            start: "top top",
            end: "+=2000",
            scrub: 1,
            pin: true
        },
        onUpdate: renderSpecsFrame
    });
}

/* ─── Liuti Video Sequence Logic ───────────────────────────── */
const liutiCanvas = document.getElementById("liuti-canvas");
if (liutiCanvas) {
    const context = liutiCanvas.getContext("2d");
    liutiCanvas.width = 1920;
    liutiCanvas.height = 1080;

    const frameCount = 90;
    const currentFrame = index => (
        `image/frames_liuti/frame_${(index + 1).toString().padStart(4, '0')}.webp`
    );

    const images = [];
    const liutiFrames = { frame: 0 };

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
    }

    images[0].onload = renderLiutiFrame;

    function renderLiutiFrame() {
        if (images[liutiFrames.frame]) {
            context.clearRect(0, 0, liutiCanvas.width, liutiCanvas.height);
            context.drawImage(images[liutiFrames.frame], 0, 0, liutiCanvas.width, liutiCanvas.height);
        }
    }

    gsap.to(liutiFrames, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
            trigger: "#liuti-video-scroll",
            start: "top top",
            end: "+=2500",
            scrub: 1,
            pin: true
        },
        onUpdate: renderLiutiFrame
    });
}

// 确保刷新，避免布局偏移
ScrollTrigger.refresh();

// /* ─── Pointer Mask Reveal Interactive Logic (#tech-passive) ─── */
// const techPassiveSection = document.getElementById('tech-passive', 'tech-active');
// if (techPassiveSection) {
//     const fgImg = techPassiveSection.querySelector('.mask-img-fg');
//     if (fgImg) {
//         techPassiveSection.addEventListener('pointermove', (e) => {
//             const rect = techPassiveSection.getBoundingClientRect();
//             const x = e.clientX - rect.left;
//             const y = e.clientY - rect.top;

//             fgImg.style.setProperty('--mouse-x', `${x}px`);
//             fgImg.style.setProperty('--mouse-y', `${y}px`);
//         });

//         techPassiveSection.addEventListener('pointerleave', () => {
//             fgImg.style.setProperty('--mouse-x', `-1000px`);
//             fgImg.style.setProperty('--mouse-y', `-1000px`);
//         });
//     }
// }

/* ─── Pointer Mask Reveal Interactive Logic (#tech-passive & #tech-active) ─── */
// 使用 querySelectorAll 匹配多个 ID
const revealSections = document.querySelectorAll('#tech-passive, #tech-active');

revealSections.forEach((section) => {
    const fgImg = section.querySelector('.mask-img-fg');
    if (!fgImg) return;

    let rafId = null;

    section.addEventListener('pointermove', (e) => {
        const rect = section.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 使用 requestAnimationFrame 优化性能，避免高刷屏掉帧
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            fgImg.style.setProperty('--mouse-x', `${x}px`);
            fgImg.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    section.addEventListener('pointerleave', () => {
        if (rafId) cancelAnimationFrame(rafId);
        fgImg.style.setProperty('--mouse-x', `-1000px`);
        fgImg.style.setProperty('--mouse-y', `-1000px`);
    });
});




