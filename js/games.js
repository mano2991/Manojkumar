/**
 * Manojkumar's Reflex & Brain Games
 * Integrated seamlessly with personal webpage theme & controls
 */

(function () {
    const area = document.querySelector("#test-area");
    if (!area) return;

    const promptEl = document.querySelector("#prompt");
    const subEl = document.querySelector("#sub-prompt");
    const labelEl = document.querySelector("#state-label");
    const latestEl = document.querySelector("#latest");
    const bestEl = document.querySelector("#best");
    const attemptsEl = document.querySelector("#attempts");
    const tipEl = document.querySelector("#tip span");
    const tabs = document.querySelectorAll(".game-card .tab");
    const resetStatsBtn = document.querySelector("#reset-stats");
    const mindControls = document.querySelector("#mind-controls");
    const gamesSection = document.getElementById("games");

    let mode = "classic"; // classic, f1, timing, mind, memory
    let state = "idle"; // idle, waiting, go, f1-building, f1-go, timing-running, mind-go, memory-show, memory-input, too-soon, complete
    let timer = null;
    let frame = null;
    let started = 0;
    let target = 5000;
    let lastTarget = 0;
    let direction = ""; // 'odd' or 'even'
    let memorySequence = [];
    let memoryIndex = 0;
    let count = 0;
    let record = 0;

    const copy = {
        classic: [
            "READY WHEN YOU ARE",
            "Wait for the panel to turn green, then hit Space or click as quickly as you can."
        ],
        f1: [
            "STARTING GRID",
            "Watch the 5 red lights turn on. When they extinguish / turn green, react immediately."
        ],
        timing: [
            "PRECISION STOP",
            "Start the stopwatch, then stop it as close to the target time as you can."
        ],
        mind: [
            "ODD / EVEN REFLEX",
            "Wait for the number to appear, then decide if it is Odd (O) or Even (E)."
        ],
        memory: [
            "MEMORY SEQUENCE",
            "Watch the flashing sequence carefully, then repeat it using keys 1–4 or by tapping the pads."
        ]
    };

    // Synthesized Audio Feedback (subtle, tactile tone feedback)
    function playTone(freq = 440, type = 'sine', duration = 0.08) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            if (!window._gameAudioCtx) window._gameAudioCtx = new AudioCtx();
            const ctx = window._gameAudioCtx;
            if (ctx.state === 'suspended') ctx.resume();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio optional, fallback silently
        }
    }

    const set = (el, val) => { if (el) el.textContent = val; };
    const ms = val => `${val} ms`;

    function cancel() {
        clearTimeout(timer);
        cancelAnimationFrame(frame);
    }

    function stateTo(next) {
        state = next;
        area.className = `test-area ${mode} ${next}`;
    }

    function load() {
        count = Number(localStorage.getItem(`reaction-${mode}-attempts`) || 0);
        record = Number(localStorage.getItem(`reaction-${mode}-best`) || 0);
        set(attemptsEl, count);

        if (mode === "timing") {
            set(bestEl, record ? `${record} ms off` : "—");
        } else if (mode === "memory") {
            set(bestEl, record ? `Level ${record}` : "—");
        } else {
            set(bestEl, record ? ms(record) : "—");
        }
    }

    function save(score, display) {
        count++;
        localStorage.setItem(`reaction-${mode}-attempts`, count);
        set(latestEl, display);

        let newBest = false;
        if (mode === "memory") {
            newBest = !record || score > record;
        } else {
            newBest = !record || score < record;
        }

        if (newBest) {
            record = score;
            localStorage.setItem(`reaction-${mode}-best`, score);
            playTone(880, 'sine', 0.2);
        }

        load();
        return newBest;
    }

    function reset() {
        cancel();
        stateTo("idle");
        set(labelEl, copy[mode][0]);
        set(tipEl, copy[mode][1]);

        area.querySelectorAll(".f1-lights i").forEach(light => light.classList.remove("active"));
        area.querySelectorAll(".memory-pad").forEach(pad => pad.classList.remove("flash"));

        if (mode === "classic") {
            promptEl.innerHTML = "Press <strong>Space</strong> or Click to start";
            set(subEl, "Keep your eyes on the screen.");
        } else if (mode === "f1") {
            promptEl.innerHTML = "Press <strong>Space</strong> or Click to line up";
            set(subEl, "React the instant all red lights extinguish / turn green.");
        } else if (mode === "timing") {
            const choices = [3000, 4000, 5000, 6000, 8000].filter(v => v !== lastTarget);
            target = choices[Math.floor(Math.random() * choices.length)];
            lastTarget = target;
            promptEl.innerHTML = `Stop at <strong>${(target / 1000).toFixed(1)} seconds</strong>`;
            set(subEl, "Press Space or click to start the stopwatch.");
        } else if (mode === "mind") {
            promptEl.innerHTML = "Press <strong>Space</strong> or Click to begin";
            set(subEl, "Then press O for odd, or E for even (or tap buttons below).");
        } else {
            promptEl.innerHTML = "Press <strong>Space</strong> or Click to begin";
            set(subEl, "Watch the colors, then repeat them using keys 1–4 or by tapping.");
        }
    }

    function classicStart() {
        stateTo("waiting");
        set(labelEl, "GET READY");
        set(promptEl, "Wait for green…");
        set(subEl, "Do not react too soon.");

        timer = setTimeout(() => {
            stateTo("go");
            set(labelEl, "GO! GO! GO!");
            set(promptEl, "PRESS SPACE OR CLICK!");
            set(subEl, "Now!");
            playTone(700, 'sine', 0.12);
            started = performance.now();
        }, 1500 + Math.random() * 3000);
    }

    function f1Start() {
        clearTimeout(timer);
        area.querySelectorAll(".f1-lights i").forEach(light => light.classList.remove("active"));
        stateTo("f1-building");
        set(labelEl, "LIGHTS SEQUENCE");
        set(promptEl, "Hold steady…");
        set(subEl, "Five red lights incoming.");

        let lightCount = 0;
        const nextLight = () => {
            lightCount++;
            const light = area.querySelectorAll(".f1-lights i")[lightCount - 1];
            if (light) light.classList.add("active");
            playTone(280 + lightCount * 40, 'triangle', 0.07);

            if (lightCount < 5) {
                timer = setTimeout(nextLight, 650);
            } else {
                timer = setTimeout(() => {
                    stateTo("f1-go");
                    set(labelEl, "GREEN LIGHT / LIGHTS OUT");
                    set(promptEl, "");
                    set(subEl, "REACT NOW!");
                    playTone(660, 'sine', 0.16);
                    started = performance.now();
                }, 900 + Math.random() * 1800);
            }
        };

        timer = setTimeout(nextLight, 500);
    }

    function mindStart() {
        stateTo("waiting");
        set(labelEl, "GET READY");
        set(promptEl, "Wait for the number…");
        set(subEl, "Do not guess too soon.");

        timer = setTimeout(() => {
            const number = 1 + Math.floor(Math.random() * 9);
            direction = (number % 2 !== 0) ? "odd" : "even";
            stateTo("mind-go");
            set(labelEl, "ODD OR EVEN?");
            set(promptEl, String(number));
            set(subEl, "Press O for odd · E for even (or tap below)");
            playTone(520, 'sine', 0.1);
            started = performance.now();
        }, 1200 + Math.random() * 2500);
    }

    function mindAnswer(choice) {
        if (state === "waiting") {
            falseStart();
            return;
        }
        if (state !== "mind-go") return;

        if (choice !== direction) {
            playTone(180, 'sawtooth', 0.18);
            stateTo("too-soon");
            set(labelEl, "NOT QUITE");
            set(promptEl, "Wrong choice!");
            set(subEl, "Press Space or click to try again.");
            return;
        }

        finishReaction();
    }

    const padFreqs = { 1: 261.63, 2: 329.63, 3: 392.00, 4: 523.25 };

    function memoryStart() {
        memorySequence = [1 + Math.floor(Math.random() * 4)];
        memoryIndex = 0;
        playMemory();
    }

    function playMemory() {
        stateTo("memory-show");
        set(labelEl, "WATCH CAREFULLY");
        set(promptEl, `Level ${memorySequence.length}`);
        set(subEl, "Memorize the color sequence.");

        let flashIndex = 0;
        const flash = () => {
            if (flashIndex >= memorySequence.length) {
                stateTo("memory-input");
                set(labelEl, "YOUR TURN");
                set(promptEl, `Level ${memorySequence.length}`);
                set(subEl, "Repeat the sequence using keys 1–4 or tap the pads.");
                return;
            }

            const step = memorySequence[flashIndex];
            const pad = area.querySelector(`.memory-pad[data-memory="${step}"]`);
            if (pad) {
                pad.classList.add("flash");
                playTone(padFreqs[step] || 440, 'sine', 0.22);
            }

            timer = setTimeout(() => {
                if (pad) pad.classList.remove("flash");
                flashIndex++;
                timer = setTimeout(flash, 200);
            }, 500);
        };

        timer = setTimeout(flash, 450);
    }

    function memoryAnswer(val) {
        if (state !== "memory-input") return;

        const pad = area.querySelector(`.memory-pad[data-memory="${val}"]`);
        if (pad) {
            pad.classList.add("flash");
            playTone(padFreqs[val] || 440, 'sine', 0.15);
            setTimeout(() => pad.classList.remove("flash"), 160);
        }

        if (val !== memorySequence[memoryIndex]) {
            playTone(180, 'sawtooth', 0.2);
            stateTo("too-soon");
            set(labelEl, "SEQUENCE ENDED");
            set(promptEl, `Level ${memorySequence.length}`);
            set(subEl, "Press Space or click to start a new sequence.");
            return;
        }

        memoryIndex++;
        if (memoryIndex === memorySequence.length) {
            const currentLvl = memorySequence.length;
            count++;
            localStorage.setItem("reaction-memory-attempts", count);
            set(latestEl, `Level ${currentLvl}`);

            if (currentLvl > record) {
                record = currentLvl;
                localStorage.setItem("reaction-memory-best", record);
                playTone(880, 'sine', 0.25);
            }
            load();

            memorySequence.push(1 + Math.floor(Math.random() * 4));
            memoryIndex = 0;
            timer = setTimeout(playMemory, 750);
        }
    }

    function falseStart() {
        cancel();
        playTone(180, 'sawtooth', 0.18);
        stateTo("too-soon");
        set(labelEl, "FALSE START");
        set(promptEl, "Too soon!");
        set(subEl, mode === "f1" ? "Resetting the starting grid…" : "Press Space or click to try again.");

        if (mode === "f1") {
            timer = setTimeout(() => {
                reset();
                f1Start();
            }, 1200);
        }
    }

    function finishReaction() {
        const time = Math.round(performance.now() - started);
        const newBest = save(time, ms(time));
        stateTo("complete");
        set(labelEl, newBest ? "★ NEW PERSONAL BEST ★" : "RESULT RECORDED");
        set(promptEl, ms(time));
        set(subEl, "Press Space or click to go again.");
    }

    function tick() {
        const elapsed = (performance.now() - started) / 1000;
        set(promptEl, `${elapsed.toFixed(3)} s`);
        frame = requestAnimationFrame(tick);
    }

    function startTiming() {
        started = performance.now();
        stateTo("timing-running");
        set(labelEl, `TARGET: ${(target / 1000).toFixed(1)} SECONDS`);
        set(subEl, "Press Space or click to stop!");
        tick();
    }

    function finishTiming() {
        cancelAnimationFrame(frame);
        const elapsed = Math.round(performance.now() - started);
        const off = Math.abs(elapsed - target);
        const newBest = save(off, `${off} ms off`);
        stateTo("complete");
        set(labelEl, newBest ? "★ NEW PERSONAL BEST ★" : "TIME RECORDED");
        set(promptEl, `${(elapsed / 1000).toFixed(3)} s`);
        set(subEl, `${off} ms from target (${(target / 1000).toFixed(1)}s). Press Space or click for a new target.`);
    }

    function action() {
        if (mode === "timing") {
            if (state === "timing-running") finishTiming();
            else if (state === "complete") reset();
            else startTiming();
            return;
        }

        if (mode === "memory") {
            if (["idle", "complete", "too-soon"].includes(state)) memoryStart();
            else if (state === "memory-input") {
                set(labelEl, "USE KEYS 1–4 OR TAP PADS");
                set(subEl, "Repeat the sequence by tapping the pads or using keys 1–4.");
            }
            return;
        }

        if (["idle", "complete", "too-soon"].includes(state)) {
            if (mode === "classic") classicStart();
            else if (mode === "f1") f1Start();
            else mindStart();
        } else if (["waiting", "f1-building"].includes(state)) {
            falseStart();
        } else if (mode === "mind") {
            set(labelEl, "USE O OR E");
            set(subEl, "Press O for odd, E for even, or tap buttons.");
        } else {
            finishReaction();
        }
    }

    // Tabs switching
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            mode = tab.dataset.mode;
            tabs.forEach(item => {
                const active = item === tab;
                item.classList.toggle("active", active);
                item.setAttribute("aria-selected", active ? "true" : "false");
            });
            reset();
            load();
        });
    });

    // Reset stats button
    if (resetStatsBtn) {
        resetStatsBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (confirm(`Reset your best score and attempts for the ${mode.toUpperCase()} game?`)) {
                localStorage.removeItem(`reaction-${mode}-attempts`);
                localStorage.removeItem(`reaction-${mode}-best`);
                set(latestEl, "—");
                load();
            }
        });
    }

    // Test area click
    area.addEventListener("click", (e) => {
        // Prevent click when user clicked on memory pad, mind button, or reset stats button
        if (e.target.closest(".memory-pad") || e.target.closest(".mind-btn") || e.target.closest(".reset-stats-btn")) {
            return;
        }
        action();
    });

    // Mind buttons click
    if (mindControls) {
        mindControls.querySelectorAll(".mind-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                mindAnswer(btn.dataset.choice);
            });
        });
    }

    // Memory pads click
    area.querySelectorAll(".memory-pad").forEach(pad => {
        pad.addEventListener("click", (e) => {
            e.stopPropagation();
            if (state === "memory-input") {
                memoryAnswer(Number(pad.dataset.memory));
            }
        });
    });

    // Keyboard support - scoped so it does NOT interfere with form typing or other sections
    document.addEventListener("keydown", (event) => {
        // Never intercept keyboard events while user is typing in form inputs
        if (event.target.matches("input, textarea, select") || event.target.isContentEditable) {
            return;
        }

        // Only handle key shortcuts if the Games section is currently visible / active
        if (gamesSection && !gamesSection.classList.contains("active")) {
            return;
        }

        if (event.code === "Space" && !event.repeat) {
            event.preventDefault();
            action();
        } else if (mode === "mind" && !event.repeat && ["KeyO", "KeyE"].includes(event.code)) {
            event.preventDefault();
            mindAnswer(event.code === "KeyO" ? "odd" : "even");
        } else if (mode === "memory" && !event.repeat) {
            const digitMap = {
                Digit1: 1, Numpad1: 1,
                Digit2: 2, Numpad2: 2,
                Digit3: 3, Numpad3: 3,
                Digit4: 4, Numpad4: 4
            };
            if (digitMap[event.code]) {
                event.preventDefault();
                memoryAnswer(digitMap[event.code]);
            }
        }
    });

    // Initial setup
    reset();
    load();
})();
