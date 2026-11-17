// Fixed target: 8 days from Nov 13, 2026 22:29 local = Nov 21, 2026 22:29 local
const targetDate = new Date('2026-11-21T22:29:00');
const startDate = new Date('2026-11-13T22:29:00');
const totalDuration = targetDate - startDate;

const segments = {
    0: ['a','b','c','d','e','f'],
    1: ['b','c'],
    2: ['a','b','g','e','d'],
    3: ['a','b','g','c','d'],
    4: ['f','g','b','c'],
    5: ['a','f','g','c','d'],
    6: ['a','f','g','e','c','d'],
    7: ['a','b','c'],
    8: ['a','b','c','d','e','f','g'],
    9: ['a','b','c','d','f','g']
};

function createDigit() {
    return `
        <div class="segment a"></div>
        <div class="segment b"></div>
        <div class="segment c"></div>
        <div class="segment d"></div>
        <div class="segment e"></div>
        <div class="segment f"></div>
        <div class="segment g"></div>
    `;
}

function initDisplay(id, digitCount) {
    const el = document.getElementById(id);
    el.innerHTML = '';
    el.classList.add('seven-seg');
    for (let i = 0; i < digitCount; i++) {
        const digit = document.createElement('div');
        digit.className = 'digit';
        digit.innerHTML = createDigit();
        el.appendChild(digit);
    }
}

function updateDisplay(id, value, digitCount) {
    const el = document.getElementById(id);
    const digits = el.querySelectorAll('.digit');
    const str = String(value).padStart(digitCount, '0');
    
    digits.forEach((digit, i) => {
        const num = parseInt(str[i]);
        const activeSegments = segments[num];
        digit.querySelectorAll('.segment').forEach(seg => {
            const segClass = seg.classList[1];
            if (activeSegments.includes(segClass)) {
                seg.classList.add('on');
            } else {
                seg.classList.remove('on');
            }
        });
    });
}

initDisplay('days', 3);
initDisplay('hours', 2);
initDisplay('minutes', 2);
initDisplay('seconds', 2);
initDisplay('milliseconds', 3);

function getAnomalyIntensity(diff) {
    const progress = 1 - (diff / totalDuration);
    return Math.max(0, Math.min(1, progress));
}

function applyAnomalies(diff) {
    const intensity = getAnomalyIntensity(diff);
    if (intensity <= 0) return;

    const container = document.querySelector('.container');
    const countdown = document.getElementById('countdown');
    const allSegments = document.querySelectorAll('.segment');
    const digits = document.querySelectorAll('.digit');
    const labels = document.querySelectorAll('.label');
    const separators = document.querySelectorAll('.separator');
    const corruptionBg = document.querySelector('.corruption-bg');

    document.documentElement.style.setProperty('--corruption', intensity);
    document.documentElement.style.setProperty('--aberration', intensity);
    document.documentElement.style.setProperty('--glitch-opacity', intensity * 0.3);
    document.documentElement.style.setProperty('--scanline-sweep-opacity', intensity * 0.4);
    document.documentElement.style.setProperty('--bg-corruption', intensity);
    document.documentElement.style.setProperty('--inversion', intensity);

    if (intensity <= 0.2) {
        tier1(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg);
    } else if (intensity <= 0.4) {
        tier1(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg);
        tier2(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg);
    } else if (intensity <= 0.6) {
        tier1(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg);
        tier2(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg);
        tier3(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg);
    } else if (intensity <= 0.8) {
        tier1(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg);
        tier2(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg);
        tier3(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg);
        tier4(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg);
    } else {
        tier1(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg);
        tier2(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg);
        tier3(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg);
        tier4(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg);
        tier5(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg);
    }
}

function tier1(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg) {
    const normIntensity = intensity / 0.2;

    // 1. Scanline opacity drift
    countdown.style.setProperty('--scanline-opacity', normIntensity * 0.2);

    // 2. Segment off-color dimming (use CSS variable to avoid inline style conflicts)
    document.documentElement.style.setProperty('--segment-dim-opacity', 0.15 - normIntensity * 0.1);

    // 3. Random segment micro-flicker
    if (Math.random() < normIntensity * 0.03) {
        const randomSeg = allSegments[Math.floor(Math.random() * allSegments.length)];
        if (!randomSeg.classList.contains('on')) {
            randomSeg.style.opacity = '0.5';
            setTimeout(() => randomSeg.style.opacity = '', 50);
        }
    }

    // 4. Label opacity pulse
    labels.forEach(label => {
        label.style.opacity = 1 - normIntensity * 0.3;
    });

    // 5. Container border color shift
    container.style.borderColor = `hsl(${normIntensity * 30}, 100%, 50%)`;
}

function tier2(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg) {
    const normIntensity = (intensity - 0.2) / 0.2;

    // 6. Screen shake (translate X/Y)
    if (Math.random() < normIntensity * 0.15) {
        const shakeX = (Math.random() - 0.5) * normIntensity * 15;
        const shakeY = (Math.random() - 0.5) * normIntensity * 8;
        container.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        container.style.animation = 'screenShake 0.1s';
        setTimeout(() => {
            container.style.transform = '';
            container.style.animation = '';
        }, 100);
    }

    // 7. Color hue shift (red → orange)
    const hueShift = 30 + normIntensity * 30;
    document.documentElement.style.setProperty('--anomaly-color', `hsl(${hueShift}, 100%, ${50 - normIntensity * 10}%)`);
    document.documentElement.style.setProperty('--anomaly-glow', `hsl(${hueShift}, 100%, ${70 - normIntensity * 10}%)`);

    // 8. Segment ghost flash
    if (Math.random() < normIntensity * 0.08) {
        const randomSeg = allSegments[Math.floor(Math.random() * allSegments.length)];
        randomSeg.classList.add('ghost');
        setTimeout(() => randomSeg.classList.remove('ghost'), Math.random() * 300 + 100);
    }

    // 9. Digit position nudge
    digits.forEach(digit => {
        if (Math.random() < normIntensity * 0.05) {
            const offsetX = (Math.random() - 0.5) * normIntensity * 6;
            const offsetY = (Math.random() - 0.5) * normIntensity * 3;
            digit.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            setTimeout(() => digit.style.transform = '', 150);
        }
    });

    // 10. Label jitter
    labels.forEach(label => {
        if (Math.random() < normIntensity * 0.1) {
            label.style.transform = `translate(${(Math.random() - 0.5) * 3}px, ${(Math.random() - 0.5) * 2}px)`;
            setTimeout(() => label.style.transform = '', 50);
        }
    });
}

function tier3(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg) {
    const normIntensity = (intensity - 0.4) / 0.2;

    // 11. Chromatic aberration start
    container.classList.add('corrupt');
    document.documentElement.style.setProperty('--aberration', normIntensity * 0.5);

    // 12. Digit rotation
    digits.forEach(digit => {
        if (Math.random() < normIntensity * 0.04) {
            digit.classList.add('glitch-rotate');
            setTimeout(() => digit.classList.remove('glitch-rotate'), 200);
        }
    });

    // 13. Static overlay entry
    if (Math.random() < normIntensity * 0.15) {
        container.classList.add('static');
        setTimeout(() => container.classList.remove('static'), 100);
    }

    // 14. Segment freeze (segments stuck on)
    if (Math.random() < normIntensity * 0.03) {
        const randomSeg = allSegments[Math.floor(Math.random() * allSegments.length)];
        if (!randomSeg.classList.contains('on')) {
            randomSeg.classList.add('frozen');
            setTimeout(() => randomSeg.classList.remove('frozen'), Math.random() * 500 + 200);
        }
    }

    // 15. Scanline bar sweep
    document.documentElement.style.setProperty('--scanline-sweep-opacity', normIntensity * 0.6);
}

function tier4(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg) {
    const normIntensity = (intensity - 0.6) / 0.2;

    // 16. Digit scale pulse
    digits.forEach(digit => {
        if (Math.random() < normIntensity * 0.05) {
            digit.style.transform = `scale(${1 + normIntensity * 0.15})`;
            setTimeout(() => digit.style.transform = '', 150);
        }
    });

    // 17. Body contrast flash
    if (Math.random() < normIntensity * 0.08) {
        document.body.style.filter = `contrast(${1 + normIntensity * 2}) brightness(${1 + normIntensity})`;
        setTimeout(() => document.body.style.filter = '', 80);
    }

    // 18. Text label scramble
    labels.forEach(label => {
        if (Math.random() < normIntensity * 0.1) {
            label.classList.add('glitch');
            const originalText = label.textContent;
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
            label.textContent = chars[Math.floor(Math.random() * chars.length)].repeat(originalText.length);
            setTimeout(() => {
                label.classList.remove('glitch');
                label.textContent = originalText;
            }, 100);
        }
    });

    // 19. Background corruption gradient
    corruptionBg.style.opacity = normIntensity * 0.5;

    // 20. Glitch overlay bars
    container.style.setProperty('--glitch-opacity', normIntensity * 0.5);
}

function tier5(intensity, container, countdown, allSegments, digits, labels, separators, corruptionBg) {
    const normIntensity = (intensity - 0.8) / 0.2;

    // 21. Time value corruption (wrong digits)
    if (Math.random() < normIntensity * 0.1) {
        const timeUnits = ['days', 'hours', 'minutes', 'seconds', 'milliseconds'];
        const randomUnit = timeUnits[Math.floor(Math.random() * timeUnits.length)];
        const el = document.getElementById(randomUnit);
        const digitsEl = el.querySelectorAll('.digit');
        digitsEl.forEach(d => {
            const wrongNum = Math.floor(Math.random() * 10);
            const activeSegments = segments[wrongNum];
            d.querySelectorAll('.segment').forEach(seg => {
                const segClass = seg.classList[1];
                if (activeSegments.includes(segClass)) {
                    seg.classList.add('on');
                } else {
                    seg.classList.remove('on');
                }
            });
        });
        // Restore correct display after brief corruption
        setTimeout(() => updateDisplay(randomUnit, getTimeValue(randomUnit), getDigitCount(randomUnit)), 80);
    }

    // 22. Full body inversion flash
    if (Math.random() < normIntensity * 0.15) {
        document.body.classList.add('corrupted');
        setTimeout(() => document.body.classList.remove('corrupted'), 100);
    }

    // 23. Heavy chromatic aberration
    document.documentElement.style.setProperty('--aberration', 0.5 + normIntensity * 1.5);
    container.style.filter = `blur(${normIntensity * 2}px) contrast(${1 + normIntensity}) hue-rotate(${normIntensity * 60}deg)`;

    // 24. Rapid segment strobe
    allSegments.forEach(seg => {
        if (Math.random() < normIntensity * 0.2) {
            seg.classList.add('strobe');
            setTimeout(() => seg.classList.remove('strobe'), 200);
        }
    });

    // 25. Final system collapse at 0 - handled in updateCountdown when diff <= 0
}

function getTimeValue(unit) {
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) return 0;
    switch (unit) {
        case 'days': return Math.floor(diff / (1000 * 60 * 60 * 24));
        case 'hours': return Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        case 'minutes': return Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        case 'seconds': return Math.floor((diff % (1000 * 60)) / 1000);
        case 'milliseconds': return diff % 1000;
        default: return 0;
    }
}

function getDigitCount(unit) {
    switch (unit) {
        case 'days': return 3;
        case 'hours': return 2;
        case 'minutes': return 2;
        case 'seconds': return 2;
        case 'milliseconds': return 3;
        default: return 2;
    }
}

function updateCountdown() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
        document.getElementById('countdown').innerHTML = '<p style="font-size: 2rem; color: #ff0000;">Time\'s up!</p>';
        document.querySelector('.container').classList.add('final');
        document.body.classList.add('corrupted');
        document.documentElement.style.setProperty('--corruption', 1);
        document.documentElement.style.setProperty('--aberration', 2);
        document.documentElement.style.setProperty('--glitch-opacity', 1);
        document.documentElement.style.setProperty('--bg-corruption', 1);
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const milliseconds = diff % 1000;

    updateDisplay('days', days, 3);
    updateDisplay('hours', hours, 2);
    updateDisplay('minutes', minutes, 2);
    updateDisplay('seconds', seconds, 2);
    updateDisplay('milliseconds', milliseconds, 3);

    applyAnomalies(diff);
}

updateCountdown();
setInterval(updateCountdown, 16);