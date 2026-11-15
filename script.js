// Fixed target: 90 days from Nov 13, 2026 22:29 local = Feb 11, 2027 22:29 local
const targetDate = new Date('2027-02-11T22:29:00');
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

    // Color shift - more intense red/orange as time runs out
    const hueShift = intensity * 30; // 0 to 30 degrees (red to orange)
    const saturation = 100;
    const lightness = 50 - intensity * 20;
    document.documentElement.style.setProperty('--anomaly-color', `hsl(${hueShift}, ${saturation}%, ${lightness}%)`);
    document.documentElement.style.setProperty('--anomaly-glow', `hsl(${hueShift}, ${saturation}%, ${lightness + 20}%)`);

    // Screen shake
    if (intensity > 0.3 && Math.random() < intensity * 0.1) {
        const shakeX = (Math.random() - 0.5) * intensity * 20;
        const shakeY = (Math.random() - 0.5) * intensity * 10;
        container.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        setTimeout(() => container.style.transform = '', 50);
    }

    // Random segment flickering
    allSegments.forEach(seg => {
        const flickerChance = intensity * 0.02;
        if (Math.random() < flickerChance) {
            seg.classList.toggle('on');
            setTimeout(() => {
                // Restore correct state
                const digit = seg.closest('.digit');
                const parentSeg = digit.querySelector(`.segment.${seg.classList[1]}`);
                if (parentSeg) {
                    // Will be corrected on next updateDisplay call
                }
            }, Math.random() * 100 + 50);
        }
    });

    // Ghost segments - random segments briefly light up
    if (intensity > 0.5 && Math.random() < intensity * 0.05) {
        const randomSeg = allSegments[Math.floor(Math.random() * allSegments.length)];
        randomSeg.classList.add('ghost');
        setTimeout(() => randomSeg.classList.remove('ghost'), Math.random() * 200 + 100);
    }

    // Digit displacement
    if (intensity > 0.6) {
        digits.forEach(digit => {
            if (Math.random() < intensity * 0.03) {
                const offsetX = (Math.random() - 0.5) * intensity * 8;
                const offsetY = (Math.random() - 0.5) * intensity * 4;
                digit.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                setTimeout(() => digit.style.transform = '', 100);
            }
        });
    }

    // Scanline effect
    if (intensity > 0.4) {
        countdown.style.setProperty('--scanline-opacity', intensity * 0.3);
    } else {
        countdown.style.setProperty('--scanline-opacity', 0);
    }

    // Static noise overlay
    if (intensity > 0.7 && Math.random() < intensity * 0.1) {
        container.classList.add('static');
        setTimeout(() => container.classList.remove('static'), 50);
    }

    // Time dilation - numbers briefly show wrong values
    if (intensity > 0.8 && Math.random() < intensity * 0.03) {
        const timeUnits = ['days', 'hours', 'minutes', 'seconds'];
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
        setTimeout(() => updateCountdown(), 100);
    }
}

function updateCountdown() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
        document.getElementById('countdown').innerHTML = '<p style="font-size: 2rem; color: #ff0000;">Time\'s up!</p>';
        document.querySelector('.container').classList.add('final');
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