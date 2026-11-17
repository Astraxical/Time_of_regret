// Countdown Timer with anomaly effects
// Target: 90 days from Nov 13, 2026 22:29 local = Feb 11, 2027 22:29 local

const TARGET_DATE = new Date('2027-02-11T22:29:00');
const START_DATE = new Date('2026-11-13T22:29:00');
const TOTAL_DURATION = TARGET_DATE - START_DATE;

// Seven-segment digit map: which segments light up for each digit 0-9
const SEGMENT_MAP = {
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

const TIME_UNITS = [
    { id: 'days', digitCount: 3, maxDigits: 3 },
    { id: 'hours', digitCount: 2, maxDigits: 2 },
    { id: 'minutes', digitCount: 2, maxDigits: 2 },
    { id: 'seconds', digitCount: 2, maxDigits: 2 },
    { id: 'milliseconds', digitCount: 3, maxDigits: 3 }
];

// Anomaly intensity thresholds (0 to 1, higher = closer to target)
const ANOMALY = {
    shake: 0.3,
    scanline: 0.4,
    ghost: 0.5,
    displacement: 0.6,
    static: 0.7,
    dilation: 0.8
};

class CountdownTimer {
    constructor() {
        this.rafId = null;
        this.isRunning = true;
        this.initDOM();
        this.initStyles();
        this.start();
    }

    initDOM() {
        this.container = document.querySelector('.container');
        this.countdown = document.getElementById('countdown');
        this.glitch = document.querySelector('.glitch');

        TIME_UNITS.forEach(unit => {
            const el = document.getElementById(unit.id);
            el.innerHTML = '';
            el.classList.add('seven-seg');
            for (let i = 0; i < unit.digitCount; i++) {
                const digit = document.createElement('div');
                digit.className = 'digit';
                digit.innerHTML = this.createDigitHTML();
                el.appendChild(digit);
            }
        });
    }

    initStyles() {
        document.documentElement.style.setProperty('--anomaly-color', '#ff0000');
        document.documentElement.style.setProperty('--anomaly-glow', '#ff3333');
        document.documentElement.style.setProperty('--scanline-opacity', '0');
        document.documentElement.style.setProperty('--corruption', '0');
    }

    createDigitHTML() {
        const segments = 'abcdefg'.map(letter =>
            `<div class="segment ${letter}" data-seg="${letter}"></div>`
        ).join('');
        return segments;
    }

    setSegments(digitEl, num) {
        const active = new Set(SEGMENT_MAP[num]);
        let anyOn = false;

        digitEl.querySelectorAll('.segment').forEach(seg => {
            if (active.has(seg.dataset.seg)) {
                seg.classList.add('on');
                anyOn = true;
            } else {
                seg.classList.remove('on');
            }
        });

        digitEl.classList.toggle('on-glow', anyOn);
    }

    updateDisplay(id, value, digitCount) {
        const el = document.getElementById(id);
        const digits = el.querySelectorAll('.digit');
        const str = String(value).padStart(digitCount, '0');

        digits.forEach((digit, i) => {
            this.setSegments(digit, parseInt(str[i], 10));
        });
    }

    getAnomalyIntensity(diff) {
        const progress = 1 - diff / TOTAL_DURATION;
        return Math.max(0, Math.min(1, progress));
    }

    applyAnomalies(intensity) {
        if (intensity <= 0) return;

        const allSegments = document.querySelectorAll('.segment');
        const digits = document.querySelectorAll('.digit');
        const labels = document.querySelectorAll('.label');

        // Color shift: red to orange as time runs out
        const hueShift = intensity * 30;
        const lightness = 50 - intensity * 20;
        document.documentElement.style.setProperty(
            '--anomaly-color', `hsl(${hueShift}, 100%, ${lightness}%)`
        );
        document.documentElement.style.setProperty(
            '--anomaly-glow', `hsl(${hueShift}, 100%, ${lightness + 20}%)`
        );
        document.documentElement.style.setProperty('--corruption', intensity);

        labels.forEach(label => {
            label.style.color = `hsl(${hueShift}, 100%, ${40 + intensity * 20}%)`;
        });

        // Screen shake
        if (intensity > ANOMALY.shake && Math.random() < intensity * 0.15) {
            const shakeX = (Math.random() - 0.5) * intensity * 25;
            const shakeY = (Math.random() - 0.5) * intensity * 12;
            this.container.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
            setTimeout(() => { this.container.style.transform = ''; }, 40);
        }

        // Random segment flickering (with state restore)
        allSegments.forEach(seg => {
            if (Math.random() < intensity * 0.03) {
                const wasOn = seg.classList.contains('on');
                seg.classList.toggle('on');
                setTimeout(() => {
                    if (wasOn) seg.classList.add('on');
                    else seg.classList.remove('on');
                }, Math.random() * 80 + 30);
            }
        });

        // Ghost segments
        if (intensity > ANOMALY.ghost && Math.random() < intensity * 0.08) {
            const randomSeg = allSegments[Math.floor(Math.random() * allSegments.length)];
            randomSeg.classList.add('ghost');
            setTimeout(() => randomSeg.classList.remove('ghost'), Math.random() * 150 + 60);
        }

        // Digit displacement + rotation
        if (intensity > ANOMALY.displacement) {
            digits.forEach(digit => {
                if (Math.random() < intensity * 0.05) {
                    const offsetX = (Math.random() - 0.5) * intensity * 10;
                    const offsetY = (Math.random() - 0.5) * intensity * 5;
                    const rot = (Math.random() - 0.5) * intensity * 4;
                    digit.classList.add('digit-rotate');
                    digit.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rot}deg)`;
                    setTimeout(() => {
                        digit.classList.remove('digit-rotate');
                        digit.style.transform = '';
                    }, 80);
                }
            });
        }

        // Label jitter
        if (intensity > 0.5) {
            labels.forEach(label => {
                if (Math.random() < intensity * 0.1) {
                    label.classList.add('label-jitter');
                    setTimeout(() => label.classList.remove('label-jitter'), 60);
                }
            });
        }

        // Container blur
        if (intensity > ANOMALY.static) {
            this.container.style.filter = `blur(${intensity * 2}px)`;
            setTimeout(() => { this.container.style.filter = ''; }, 60);
        }

        // Body contrast flash at peak anomaly
        if (intensity > 0.75 && Math.random() < intensity * 0.05) {
            document.body.classList.add('body-contrast');
            setTimeout(() => document.body.classList.remove('body-contrast'), 40);
        }

        // Chromatic aberration glitch overlay
        this.glitch.style.opacity = intensity > 0.15 ? intensity * 0.6 : 0;

        // Scanline effect
        this.countdown.style.setProperty(
            '--scanline-opacity',
            intensity > ANOMALY.scanline ? intensity * 0.35 : 0
        );

        // Static noise overlay
        if (intensity > ANOMALY.static && Math.random() < intensity * 0.15) {
            this.container.classList.add('static');
            setTimeout(() => this.container.classList.remove('static'), 40);
        }

        // Time dilation - wrong values flash briefly
        if (intensity > ANOMALY.dilation && Math.random() < intensity * 0.05) {
            const randomUnit = ['days', 'hours', 'minutes', 'seconds'][
                Math.floor(Math.random() * 4)
            ];
            const el = document.getElementById(randomUnit);
            el.querySelectorAll('.digit').forEach(d => {
                this.setSegments(d, Math.floor(Math.random() * 10));
            });
            setTimeout(() => this.update(), 80);
        }
    }

    computeUnits(diff) {
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
            milliseconds: diff % 1000
        };
    }

    update() {
        const now = Date.now();
        const diff = TARGET_DATE - now;

        if (diff <= 0) {
            this.countdown.innerHTML = '<p style="font-size: 2rem; color: var(--anomaly-color);">Time\'s up!</p>';
            this.container.classList.add('final');
            this.isRunning = false;
            if (this.rafId) cancelAnimationFrame(this.rafId);
            return;
        }

        const values = this.computeUnits(diff);
        this.updateDisplay('days', values.days, 3);
        this.updateDisplay('hours', values.hours, 2);
        this.updateDisplay('minutes', values.minutes, 2);
        this.updateDisplay('seconds', values.seconds, 2);
        this.updateDisplay('milliseconds', values.milliseconds, 3);

        this.applyAnomalies(this.getAnomalyIntensity(diff));
    }

    start() {
        this.update();
        const loop = () => {
            this.update();
            this.rafId = requestAnimationFrame(loop);
        };
        this.rafId = requestAnimationFrame(loop);

        window.addEventListener('pagehide', () => {
            if (this.rafId) cancelAnimationFrame(this.rafId);
        });
    }
}

// Start the timer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new CountdownTimer());
} else {
    new CountdownTimer();
}
