// Fixed target: 90 days from Nov 13, 2026 22:29 local = Feb 11, 2027 22:29 local
const TARGET_DATE = new Date('2027-02-11T22:29:00');
const START_DATE = new Date('2026-11-13T22:29:00');
const TOTAL_DURATION = TARGET_DATE - START_DATE;

const SEGMENTS = {
    0: ['a', 'b', 'c', 'd', 'e', 'f'],
    1: ['b', 'c'],
    2: ['a', 'b', 'g', 'e', 'd'],
    3: ['a', 'b', 'g', 'c', 'd'],
    4: ['f', 'g', 'b', 'c'],
    5: ['a', 'f', 'g', 'c', 'd'],
    6: ['a', 'f', 'g', 'e', 'c', 'd'],
    7: ['a', 'b', 'c'],
    8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    9: ['a', 'b', 'c', 'd', 'f', 'g']
};

const UNITS = [
    { id: 'days', digitCount: 3 },
    { id: 'hours', digitCount: 2 },
    { id: 'minutes', digitCount: 2 },
    { id: 'seconds', digitCount: 2 },
    { id: 'milliseconds', digitCount: 3 },
];

const ANOMALY_THRESHOLDS = {
    shake: 0.3,
    scanline: 0.4,
    ghost: 0.5,
    displacement: 0.6,
    static: 0.7,
    dilation: 0.8,
};

function createDigit() {
    return `
        <div class="segment" data-seg="a"></div>
        <div class="segment" data-seg="b"></div>
        <div class="segment" data-seg="c"></div>
        <div class="segment" data-seg="d"></div>
        <div class="segment" data-seg="e"></div>
        <div class="segment" data-seg="f"></div>
        <div class="segment" data-seg="g"></div>
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

function setSegments(digit, num) {
    const active = new Set(SEGMENTS[num]);
    digit.querySelectorAll('.segment').forEach(seg => {
        if (active.has(seg.dataset.seg)) {
            seg.classList.add('on');
        } else {
            seg.classList.remove('on');
        }
    });
}

function updateDisplay(id, value, digitCount) {
    const el = document.getElementById(id);
    const digits = el.querySelectorAll('.digit');
    const str = String(value).padStart(digitCount, '0');
    digits.forEach((digit, i) => {
        setSegments(digit, parseInt(str[i], 10));
    });
}

UNITS.forEach(({ id, digitCount }) => initDisplay(id, digitCount));

function getAnomalyIntensity(diff) {
    const progress = 1 - diff / TOTAL_DURATION;
    return Math.max(0, Math.min(1, progress));
}

function applyAnomalies(intensity) {
    if (intensity <= 0) return;

    const container = document.querySelector('.container');
    const countdown = document.getElementById('countdown');
    const allSegments = document.querySelectorAll('.segment');
    const digits = document.querySelectorAll('.digit');

    // Color shift - more intense red/orange as time runs out
    const hueShift = intensity * 30; // 0 to 30 degrees (red to orange)
    const lightness = 50 - intensity * 20;
    document.documentElement.style.setProperty('--anomaly-color', `hsl(${hueShift}, 100%, ${lightness}%)`);
    document.documentElement.style.setProperty('--anomaly-glow', `hsl(${hueShift}, 100%, ${lightness + 20}%)`);

    // Labels shift color with anomaly
    document.querySelectorAll('.label').forEach(label => {
        label.style.color = `hsl(${hueShift}, 100%, ${40 + intensity * 20}%)`;
    });

    // Screen shake
    if (intensity > ANOMALY_THRESHOLDS.shake && Math.random() < intensity * 0.1) {
        const shakeX = (Math.random() - 0.5) * intensity * 20;
        const shakeY = (Math.random() - 0.5) * intensity * 10;
        container.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        setTimeout(() => { container.style.transform = ''; }, 50);
    }

    // Random segment flickering (with proper state restore)
    allSegments.forEach(seg => {
        if (Math.random() < intensity * 0.02) {
            const wasOn = seg.classList.contains('on');
            seg.classList.toggle('on');
            setTimeout(() => {
                if (wasOn) seg.classList.add('on');
                else seg.classList.remove('on');
            }, Math.random() * 100 + 50);
        }
    });

    // Ghost segments - random segments briefly light up
    if (intensity > ANOMALY_THRESHOLDS.ghost && Math.random() < intensity * 0.05) {
        const randomSeg = allSegments[Math.floor(Math.random() * allSegments.length)];
        randomSeg.classList.add('ghost');
        setTimeout(() => randomSeg.classList.remove('ghost'), Math.random() * 200 + 100);
    }

    // Digit displacement
    if (intensity > ANOMALY_THRESHOLDS.displacement) {
        digits.forEach(digit => {
            if (Math.random() < intensity * 0.03) {
                const offsetX = (Math.random() - 0.5) * intensity * 8;
                const offsetY = (Math.random() - 0.5) * intensity * 4;
                digit.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                setTimeout(() => { digit.style.transform = ''; }, 100);
            }
        });
    }

    // Scanline effect
    countdown.style.setProperty('--scanline-opacity', intensity > ANOMALY_THRESHOLDS.scanline ? intensity * 0.3 : 0);

    // Static noise overlay
    if (intensity > ANOMALY_THRESHOLDS.static && Math.random() < intensity * 0.1) {
        container.classList.add('static');
        setTimeout(() => container.classList.remove('static'), 50);
    }

    // Time dilation - numbers briefly show wrong values
    if (intensity > ANOMALY_THRESHOLDS.dilation && Math.random() < intensity * 0.03) {
        const timeUnits = ['days', 'hours', 'minutes', 'seconds'];
        const randomUnit = timeUnits[Math.floor(Math.random() * timeUnits.length)];
        const el = document.getElementById(randomUnit);
        el.querySelectorAll('.digit').forEach(d => {
            setSegments(d, Math.floor(Math.random() * 10));
        });
    }
}

function computeUnits(diff) {
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        milliseconds: diff % 1000,
    };
}

function updateCountdown() {
    const now = Date.now();
    const diff = TARGET_DATE - now;

    if (diff <= 0) {
        document.getElementById('countdown').innerHTML = '<p style="font-size: 2rem; color: var(--anomaly-color);">Time\'s up!</p>';
        document.querySelector('.container').classList.add('final');
        return;
    }

    const values = computeUnits(diff);
    updateDisplay('days', values.days, 3);
    updateDisplay('hours', values.hours, 2);
    updateDisplay('minutes', values.minutes, 2);
    updateDisplay('seconds', values.seconds, 2);
    updateDisplay('milliseconds', values.milliseconds, 3);

    applyAnomalies(getAnomalyIntensity(diff));
}

let rafId;
function loop() {
    updateCountdown();
    rafId = requestAnimationFrame(loop);
}

loop();

window.addEventListener('pagehide', () => cancelAnimationFrame(rafId));
