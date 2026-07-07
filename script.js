
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


// Image Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');
const gridImages = document.querySelectorAll('.grid-item img');

window.openLightbox = function (src) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
};

window.closeLightbox = function () {
    if (!lightbox) return;
    lightbox.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
};

gridImages.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
        window.openLightbox(img.src);
    });
});

if (lightboxClose) {
    lightboxClose.addEventListener('click', window.closeLightbox);
}

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            window.closeLightbox();
        }
    });
}

/* ─── Image Reveal Logic (GSAP Pinning & Bidirectional) ────────── */
gsap.registerPlugin(ScrollTrigger);

/* ─── Image Reveal Logic (GSAP Pinning Loop) ─────────────────── */
const revealSteps = document.querySelectorAll('.image-reveal-step');

revealSteps.forEach((step) => {
    const colorImg = step.querySelector('.color-reveal-image');
    const scanLine = step.querySelector('.reveal-scan-line');
    const percentTxt = step.querySelector('.percent-text');

    if (colorImg && scanLine) {
        // 显式设置初始状态
        gsap.set(colorImg, { clipPath: "inset(0 100% 0 0)" });
        gsap.set(scanLine, { left: "0%", display: "none" });

        const revealTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: step,
                start: "top top",
                end: "+=1500", // 增加深度感
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
                anticipatePin: 1
            }
        });

        // 绑定同步动画
        revealTimeline.to(colorImg, {
            clipPath: "inset(0 0% 0 0)",
            ease: "none"
        }, 0);

        revealTimeline.to(scanLine, {
            left: "100%",
            ease: "none"
        }, 0);

        revealTimeline.set(scanLine, { display: "block" }, 0.01);
        revealTimeline.set(scanLine, { display: "none" }, 0.99);

        revealTimeline.to({}, {
            duration: 1,
            onUpdate: function () {
                if (percentTxt) {
                    percentTxt.innerText = Math.round(this.progress() * 100);
                }
            },
            ease: "none"
        }, 0);
    }
});

/* ─── Video Sequence Logic ─────────────────────────────── */
const runCanvas = document.getElementById("run-canvas");
if (runCanvas) {
    const context = runCanvas.getContext("2d");
    runCanvas.width = 1280;
    runCanvas.height = 720;

    const frameCount = 60;
    const currentFrame = index => (
        `image/frames2/frame_${(index + 1).toString().padStart(4, '0')}.png`
    );

    const images = [];
    const runFrames = { frame: 0 };

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
    }

    images[0].onload = renderRunFrame;

    function renderRunFrame() {
        if (images[runFrames.frame]) {
            context.clearRect(0, 0, runCanvas.width, runCanvas.height);
            context.drawImage(images[runFrames.frame], 0, 0, runCanvas.width, runCanvas.height);
        }
    }

    gsap.to(runFrames, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
            trigger: "#run-video-scroll",
            start: "center center",
            end: "+=1500",
            scrub: 1,
            pin: true
        },
        onUpdate: renderRunFrame
    });
}

// 确保刷新，避免布局偏移
ScrollTrigger.refresh();

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (lightbox.style.display === 'block' || lightbox.style.display === 'flex')) {
        window.closeLightbox();
    }
});
