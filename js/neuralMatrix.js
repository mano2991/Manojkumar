/**
 * Matrix Digital Rain Canvas Background
 * Computational Biology, Multi-Omics & Coder Theme for Dr. Manojkumar Kumaran
 * Pure Matrix digital rain with genomic tokens, sequencing modalities, and binary streams.
 */

(function () {
    'use strict';

    const canvas = document.getElementById('neuralMatrixCanvas');
    const homeSection = document.getElementById('home');
    if (!canvas || !homeSection) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId = null;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isRunning = false;

    // Mouse coordinates for subtle interactive illumination
    const mouse = {
        x: null,
        y: null,
        radius: 120,
        active: false,
        lastMoved: 0
    };

    // Matrix tokens: Multi-omics sequencing, genomic nucleotides, binary, neural math
    const matrixTokens = [
        '0', '1', '0', '1', '1', '0', '0', '1',
        'A', 'T', 'C', 'G', 'A', 'T', 'C', 'G',
        'snRNA', 'snATAC', 'Hi-C', 'CUT&RUN', 'RiboSeq', 'Spatial', 'MassSpec', 'BulkRNA',
        'KiMA', 'DeNAT', 'SCI', 'CST', 'TAD', 'SNP',
        'λ', 'σ', '∂', '∇', '∫', '∑', 'θ', 'μ', 'Ω', 'β', 'α'
    ];

    let columns = [];
    const baseFontSize = 13;

    class MatrixStream {
        constructor(x, isDeep) {
            this.x = x;
            this.isDeep = isDeep; // true = background layer (dimmer, smaller, slower)
            this.fontSize = isDeep ? baseFontSize - 2 : baseFontSize;
            this.speed = isDeep ? (0.45 + Math.random() * 0.5) : (0.7 + Math.random() * 0.8);
            this.y = Math.random() * -120;
            this.length = isDeep ? Math.floor(8 + Math.random() * 10) : Math.floor(10 + Math.random() * 14);
            this.changeFrequency = Math.floor(3 + Math.random() * 6);
            this.tick = 0;
            this.chars = [];
            this.initChars();
        }

        initChars() {
            this.chars = [];
            for (let i = 0; i < this.length; i++) {
                this.chars.push(matrixTokens[Math.floor(Math.random() * matrixTokens.length)]);
            }
        }

        update() {
            this.y += this.speed;
            this.tick++;

            // Mutate random characters as rain falls
            if (this.tick % this.changeFrequency === 0) {
                const randIndex = Math.floor(Math.random() * this.length);
                this.chars[randIndex] = matrixTokens[Math.floor(Math.random() * matrixTokens.length)];
            }

            // Reset when the entire tail has moved off-screen
            const totalHeight = this.length * (this.fontSize + 4);
            if (this.y - totalHeight > height) {
                this.y = Math.random() * -80 - 20;
                this.speed = this.isDeep ? (0.45 + Math.random() * 0.5) : (0.7 + Math.random() * 0.8);
                this.length = this.isDeep ? Math.floor(8 + Math.random() * 10) : Math.floor(10 + Math.random() * 14);
                this.initChars();
            }
        }

        draw(ctx, isDark) {
            const charSpacing = this.fontSize + 4;

            for (let i = 0; i < this.length; i++) {
                const charY = this.y - i * charSpacing;
                if (charY < -30 || charY > height + 30) continue;

                const isHead = (i === 0);
                const fadeRatio = 1 - (i / this.length);

                // Mouse proximity effect: slightly brighten glyphs near cursor
                let mouseBoost = 0;
                if (mouse.active && mouse.x !== null) {
                    const dx = this.x - mouse.x;
                    const dy = charY - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        mouseBoost = (1 - dist / mouse.radius) * 0.45;
                    }
                }

                let fillStyle;

                if (isDark) {
                    if (isHead) {
                        const alpha = Math.min(1, 0.85 + mouseBoost);
                        fillStyle = `rgba(204, 251, 241, ${alpha})`; // luminous white-teal head
                    } else {
                        const baseAlpha = this.isDeep ? (0.12 * fadeRatio) : (0.24 * fadeRatio);
                        const alpha = Math.min(1, Math.max(0.02, baseAlpha + mouseBoost));
                        fillStyle = `rgba(45, 212, 191, ${alpha})`; // matrix emerald-teal
                    }
                } else {
                    if (isHead) {
                        const alpha = Math.min(1, 0.65 + mouseBoost);
                        fillStyle = `rgba(13, 148, 136, ${alpha})`; // dark teal head
                    } else {
                        const baseAlpha = this.isDeep ? (0.06 * fadeRatio) : (0.13 * fadeRatio);
                        const alpha = Math.min(1, Math.max(0.015, baseAlpha + mouseBoost));
                        fillStyle = `rgba(15, 118, 110, ${alpha})`; // subtle forest teal
                    }
                }

                ctx.font = isHead
                    ? `700 ${this.fontSize}px var(--font-mono, monospace)`
                    : `400 ${this.fontSize}px var(--font-mono, monospace)`;

                // Soft glow on leading character
                if (isHead && isDark) {
                    ctx.shadowColor = 'rgba(94, 234, 212, 0.8)';
                    ctx.shadowBlur = 8;
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.fillStyle = fillStyle;
                ctx.fillText(this.chars[i], this.x, charY);
                ctx.shadowBlur = 0;
            }
        }
    }

    function initStreams() {
        columns = [];
        const spacing = 28; // spacing between streams
        const totalCols = Math.floor(width / spacing);

        for (let i = 0; i < totalCols; i++) {
            const streamX = i * spacing + (spacing / 2);
            // Alternate between depth layers for a multi-layered matrix aesthetic
            const isDeep = (i % 2 === 0);
            const stream = new MatrixStream(streamX, isDeep);
            // Stagger initial vertical positions
            stream.y = Math.random() * height;
            columns.push(stream);
        }
    }

    // ==========================================
    // Resize & Setup
    // ==========================================
    function resize() {
        const rect = homeSection.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        initStreams();
    }

    // ==========================================
    // Main Render Loop
    // ==========================================
    function render() {
        if (!isRunning) return;

        const isDark = document.body.classList.contains('dark');

        // Clear canvas cleanly
        ctx.clearRect(0, 0, width, height);

        // Draw matrix streams
        for (let i = 0; i < columns.length; i++) {
            columns[i].update();
            columns[i].draw(ctx, isDark);
        }

        // Mouse idle timeout
        if (mouse.active && Date.now() - mouse.lastMoved > 2500) {
            mouse.active = false;
        }

        animationFrameId = requestAnimationFrame(render);
    }

    // ==========================================
    // Lifecycle & Visibility Controls
    // ==========================================
    function start() {
        if (isRunning) return;
        isRunning = true;
        animationFrameId = requestAnimationFrame(render);
    }

    function stop() {
        if (!isRunning) return;
        isRunning = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    function checkActiveState() {
        const isHomeActive = homeSection.classList.contains('active');
        const isPageVisible = !document.hidden;

        if (isHomeActive && isPageVisible) {
            start();
        } else {
            stop();
        }
    }

    // Interactive mouse track
    homeSection.addEventListener('mousemove', function (e) {
        const rect = homeSection.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
        mouse.lastMoved = Date.now();
    }, { passive: true });

    homeSection.addEventListener('mouseleave', function () {
        mouse.active = false;
        mouse.x = null;
        mouse.y = null;
    });

    homeSection.addEventListener('touchmove', function (e) {
        if (e.touches.length > 0) {
            const rect = homeSection.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;
            mouse.active = true;
            mouse.lastMoved = Date.now();
        }
    }, { passive: true });

    homeSection.addEventListener('touchend', function () {
        mouse.active = false;
    });

    // Window events
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', checkActiveState);

    // Watch for section navigation changes (when #home gains/loses .active class)
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === 'class') {
                checkActiveState();
            }
        });
    });
    observer.observe(homeSection, { attributes: true });

    // Initialize
    resize();
    checkActiveState();
})();
