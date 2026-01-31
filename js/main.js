// Lenis Smooth Scroll Setup
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Sticky Header
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mouse Cursor Glow Effect
const cursorGlow = document.createElement('div');
cursorGlow.classList.add('cursor-glow');
document.body.appendChild(cursorGlow);

document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});


// Anti-Gravity Tilt Effect for Service Cards
const cards = document.querySelectorAll('.service-card, .float-card');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate rotation based on mouse position
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        card.style.zIndex = 10;
        card.style.borderColor = 'var(--primary-color)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        card.style.zIndex = 1;
        card.style.borderColor = 'rgba(255, 255, 255, 0.05)';
    });
});

// Canvas Scroll Animation (Image Sequence)
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const heroSection = document.querySelector('.hero'); // Or wherever it should go
// If you want it as background for the whole page or just hero. 
// Let's make it fixed background for now or part of hero.
canvas.id = 'scroll-animation';
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.zIndex = '-1'; // Behind everything
canvas.style.objectFit = 'cover';
canvas.style.opacity = '0.4'; // Subtle blend
document.body.prepend(canvas);

const frameCount = 192;
const currentFrame = index => (
    `animation/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`
);

const images = [];
const animationState = {
    frame: 0
};

// Preload images
for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
}

const img = new Image();
img.src = currentFrame(1);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

img.onload = function () {
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
}

const updateImage = index => {
    if (images[index] && images[index].complete) {
        // Center Crop / Cover logic
        const hRatio = canvas.width / images[index].width;
        const vRatio = canvas.height / images[index].height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - images[index].width * ratio) / 2;
        const centerShift_y = (canvas.height - images[index].height * ratio) / 2;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(images[index], 0, 0, images[index].width, images[index].height,
            centerShift_x, centerShift_y, images[index].width * ratio, images[index].height * ratio);
    }
}

// Sync with Lenis Scroll
// Sync with Lenis Scroll
lenis.on('scroll', (e) => {
    const scrollProgress = e.scroll / (document.body.scrollHeight - window.innerHeight);
    const frameIndex = Math.min(
        frameCount - 1,
        Math.ceil(scrollProgress * frameCount)
    );

    // Only update canvas if visible to save resources (optional optimization)
    requestAnimationFrame(() => updateImage(frameIndex));

    // Hero Parallax Effect
    const scrolled = e.scroll;
    const heroText = document.querySelector('.hero-text');
    const heroVisuals = document.querySelector('.hero-visuals');

    if (heroText && heroVisuals) {
        // Text moves slower (0.5x speed) and fades out
        heroText.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroText.style.opacity = 1 - (scrolled / 700);

        // Visuals move faster for depth
        heroVisuals.style.transform = `translateY(${scrolled * -0.2}px)`; // Negative for floating up
    }
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateImage(Math.floor(lenis.scroll / (document.body.scrollHeight - window.innerHeight) * frameCount));
});

// Motion One Animations (Framer-like)
const { animate, inView, stagger } = Motion;

// Hero Animations on Load
animate(".hero-text h1", { opacity: [0, 1], y: [50, 0] }, { duration: 1, easing: "ease-out" });
animate(".hero-text p", { opacity: [0, 1], y: [30, 0] }, { duration: 1, delay: 0.3, easing: "ease-out" });
animate(".cta-group", { opacity: [0, 1], y: [20, 0] }, { duration: 1, delay: 0.5, easing: "ease-out" });

// Scroll Reveals
inView(".section-title", ({ target }) => {
    animate(target, { opacity: [0, 1], y: [50, 0] }, { duration: 0.8 });
});

inView(".services-grid", ({ target }) => {
    animate(
        target.querySelectorAll(".service-card"),
        { opacity: [0, 1], y: [50, 0] },
        { delay: stagger(0.1), duration: 0.6, easing: "ease-out" }
    );
});

inView(".features-grid", ({ target }) => {
    animate(
        target.querySelectorAll(".feature-box"),
        { opacity: [0, 1], scale: [0.8, 1] },
        { delay: stagger(0.1), duration: 0.5, easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" }
    );
});

inView(".location-container", ({ target }) => {
    animate(target, { opacity: [0, 1], x: [-50, 0] }, { duration: 1 });
});

inView(".gallery-grid", ({ target }) => {
    animate(
        target.querySelectorAll(".gallery-card"),
        { opacity: [0, 1], scale: [0.8, 1] },
        { delay: stagger(0.1), duration: 0.5 }
    );
});
