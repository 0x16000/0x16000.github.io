// Cyberpunk Interactive JavaScript
class CyberpunkEffects {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.createParticles();
        this.setupMatrixRain();
        this.initGlitchEffect();
        this.setupScrollEffects();
        this.createHackerTerminal();
    }

    init() {
        // Create canvas for particle effects
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particle-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '0';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // Particles array
        this.particles = [];
        this.mouseParticles = [];
        this.mouse = { x: 0, y: 0 };

        // Matrix rain setup
        this.matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;':\",./<>?`~";
        this.matrixDrops = [];

        // Glitch variables
        this.glitchActive = false;
        this.glitchElements = [];

        // Audio context for sound effects
        this.setupAudioContext();
    }

    setupAudioContext() {
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playBeep(frequency = 800, duration = 100, type = 'sine') {
        if (!this.audioCtx) return;
        
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration / 1000);
        
        oscillator.start(this.audioCtx.currentTime);
        oscillator.stop(this.audioCtx.currentTime + duration / 1000);
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        // Mouse tracking for particle effects
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.createMouseParticle(e.clientX, e.clientY);
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });

        // Keyboard effects
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        // Click effects
        document.addEventListener('click', (e) => {
            this.createClickRipple(e.clientX, e.clientY);
            this.playBeep(Math.random() * 400 + 400, 150, 'square');
        });

        // Hover effects for interactive elements
        document.querySelectorAll('.skill, .contact, h2').forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.playBeep(600, 80, 'triangle');
                this.triggerGlitch(element, 200);
            });
        });

        // Scroll effects
        let ticking = false;
        document.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollEffects();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    createParticles() {
        // Create ambient particles
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                color: this.getRandomNeonColor(),
                opacity: Math.random() * 0.5 + 0.2,
                pulse: Math.random() * Math.PI * 2
            });
        }

        this.animateParticles();
    }

    createMouseParticle(x, y) {
        if (this.mouseParticles.length > 20) {
            this.mouseParticles.shift();
        }

        this.mouseParticles.push({
            x: x,
            y: y,
            size: Math.random() * 4 + 2,
            speedX: (Math.random() - 0.5) * 4,
            speedY: (Math.random() - 0.5) * 4,
            color: this.getRandomNeonColor(),
            opacity: 1,
            life: 60,
            maxLife: 60
        });
    }

    createClickRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 20px;
            height: 20px;
            border: 2px solid #00ffff;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            transform: translate(-50%, -50%);
            animation: rippleExpand 1s ease-out forwards;
        `;
        
        document.body.appendChild(ripple);
        
        // Add CSS animation if not already defined
        if (!document.getElementById('ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes rippleExpand {
                    0% {
                        width: 20px;
                        height: 20px;
                        opacity: 1;
                        box-shadow: 0 0 20px #00ffff;
                    }
                    100% {
                        width: 200px;
                        height: 200px;
                        opacity: 0;
                        box-shadow: 0 0 100px #00ffff;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            document.body.removeChild(ripple);
        }, 1000);
    }

    getRandomNeonColor() {
        const colors = ['#b388ff', '#7c4dff', '#00ffff', '#ff0080', '#536dfe'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    animateParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Animate ambient particles
        this.particles.forEach((particle, index) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.pulse += 0.1;
            
            // Wrap around screen
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;

            // Draw particle with pulsing effect
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity * (Math.sin(particle.pulse) * 0.3 + 0.7);
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });

        // Animate mouse particles
        this.mouseParticles.forEach((particle, index) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.speedX *= 0.98;
            particle.speedY *= 0.98;
            particle.life--;
            particle.opacity = particle.life / particle.maxLife;

            if (particle.life <= 0) {
                this.mouseParticles.splice(index, 1);
            } else {
                this.ctx.save();
                this.ctx.globalAlpha = particle.opacity;
                this.ctx.fillStyle = particle.color;
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        });

        requestAnimationFrame(() => this.animateParticles());
    }

    setupMatrixRain() {
        // Create matrix rain overlay
        const matrixCanvas = document.createElement('canvas');
        matrixCanvas.id = 'matrix-rain';
        matrixCanvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            opacity: 0.1;
        `;
        document.body.appendChild(matrixCanvas);

        const matrixCtx = matrixCanvas.getContext('2d');
        
        const resizeMatrix = () => {
            matrixCanvas.width = window.innerWidth;
            matrixCanvas.height = window.innerHeight;
            
            const columns = matrixCanvas.width / 20;
            this.matrixDrops = Array(Math.floor(columns)).fill(1);
        };

        resizeMatrix();
        window.addEventListener('resize', resizeMatrix);

        const drawMatrix = () => {
            matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.04)';
            matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            matrixCtx.fillStyle = '#7c4dff';
            matrixCtx.font = '15px monospace';

            for (let i = 0; i < this.matrixDrops.length; i++) {
                const text = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
                matrixCtx.fillText(text, i * 20, this.matrixDrops[i] * 20);

                if (this.matrixDrops[i] * 20 > matrixCanvas.height && Math.random() > 0.975) {
                    this.matrixDrops[i] = 0;
                }
                this.matrixDrops[i]++;
            }
        };

        setInterval(drawMatrix, 50);
    }

    initGlitchEffect() {
        this.glitchElements = document.querySelectorAll('h1, h2, .highlight');
        
        // Random glitch effect
        setInterval(() => {
            if (Math.random() < 0.1) {
                const element = this.glitchElements[Math.floor(Math.random() * this.glitchElements.length)];
                this.triggerGlitch(element, 100);
            }
        }, 5000);
    }

    triggerGlitch(element, duration = 200) {
        const originalText = element.textContent;
        const glitchChars = '!@#$%^&*()_+-=[]{}|;\':",./<>?`~';
        
        let glitchInterval = setInterval(() => {
            let glitchedText = '';
            for (let i = 0; i < originalText.length; i++) {
                if (Math.random() < 0.1) {
                    glitchedText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
                } else {
                    glitchedText += originalText[i];
                }
            }
            element.textContent = glitchedText;
        }, 50);

        setTimeout(() => {
            clearInterval(glitchInterval);
            element.textContent = originalText;
        }, duration);
    }

    handleKeyPress(e) {
        // Konami code easter egg
        if (!this.konamiCode) {
            this.konamiCode = [];
        }
        
        const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
        
        this.konamiCode.push(e.code);
        if (this.konamiCode.length > konamiSequence.length) {
            this.konamiCode.shift();
        }
        
        if (this.konamiCode.length === konamiSequence.length && 
            this.konamiCode.every((key, index) => key === konamiSequence[index])) {
            this.activateHackerMode();
        }

        // Play typing sounds
        this.playBeep(Math.random() * 200 + 300, 30, 'square');
        
        // Create typing particles
        if (document.activeElement.tagName !== 'INPUT') {
            this.createMouseParticle(
                Math.random() * window.innerWidth,
                Math.random() * 100 + 50
            );
        }
    }

    activateHackerMode() {
        // Easter egg: Matrix-style text transformation
        document.body.style.fontFamily = 'Courier New, monospace';
        document.body.style.background = '#000';
        
        const elements = document.querySelectorAll('p, li, .subtitle');
        elements.forEach(element => {
            const originalText = element.textContent;
            let index = 0;
            
            const typeWriter = () => {
                if (index < originalText.length) {
                    element.textContent = originalText.substring(0, index + 1) + '█';
                    index++;
                    setTimeout(typeWriter, 50);
                } else {
                    element.textContent = originalText;
                }
            };
            
            element.textContent = '';
            setTimeout(typeWriter, Math.random() * 2000);
        });

        // Play success sound
        this.playBeep(800, 100);
        this.playBeep(1200, 100);
        
        // Show hacker message
        setTimeout(() => {
            alert('🚀 HACKER MODE ACTIVATED! 🚀\nSystem compromised... Just kidding! You found the easter egg!');
        }, 1000);
    }

    setupScrollEffects() {
        // Parallax effect for background elements
        this.updateScrollEffects();
    }

    updateScrollEffects() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercent = scrollTop / (document.documentElement.scrollHeight - window.innerHeight);
        
        // Update particle movement based on scroll
        this.particles.forEach(particle => {
            particle.speedX += (scrollPercent - 0.5) * 0.01;
            particle.speedY += scrollPercent * 0.02;
        });

        // Parallax effect on sections
        document.querySelectorAll('section').forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                const parallaxSpeed = (index + 1) * 0.1;
                const yPos = -(scrollTop * parallaxSpeed);
                section.style.transform = `translateY(${yPos}px)`;
            }
        });
    }

    createHackerTerminal() {
        // Create a hidden terminal that can be activated with Ctrl+Shift+T
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyT') {
                this.showTerminal();
            }
        });
    }

    showTerminal() {
        // Create terminal overlay
        const terminal = document.createElement('div');
        terminal.id = 'hacker-terminal';
        terminal.style.cssText = `
            position: fixed;
            top: 10%;
            left: 10%;
            width: 80%;
            height: 80%;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #00ffff;
            border-radius: 10px;
            z-index: 10000;
            padding: 20px;
            font-family: 'Courier New', monospace;
            color: #00ffff;
            overflow-y: auto;
            box-shadow: 0 0 50px #00ffff;
        `;

        const output = document.createElement('div');
        output.style.cssText = 'margin-bottom: 20px; line-height: 1.4;';
        
        const input = document.createElement('input');
        input.style.cssText = `
            width: 100%;
            background: transparent;
            border: none;
            color: #00ffff;
            font-family: inherit;
            font-size: 14px;
            outline: none;
        `;
        input.placeholder = 'Enter command...';

        terminal.appendChild(output);
        terminal.appendChild(document.createTextNode('> '));
        terminal.appendChild(input);
        document.body.appendChild(terminal);

        // Terminal commands
        const commands = {
            help: 'Available commands: help, matrix, glitch, particles, sound, close',
            matrix: 'Matrix rain intensity increased!',
            glitch: 'Glitch mode activated!',
            particles: 'Particle system boosted!',
            sound: 'Playing cyberpunk sounds...',
            close: 'Terminal closed.'
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = input.value.trim().toLowerCase();
                output.innerHTML += `> ${input.value}\n`;
                
                if (commands[command]) {
                    output.innerHTML += `${commands[command]}\n\n`;
                    
                    // Execute command effects
                    switch(command) {
                        case 'matrix':
                            document.getElementById('matrix-rain').style.opacity = '0.3';
                            break;
                        case 'glitch':
                            this.glitchElements.forEach(el => this.triggerGlitch(el, 500));
                            break;
                        case 'particles':
                            for (let i = 0; i < 20; i++) {
                                this.createMouseParticle(
                                    Math.random() * window.innerWidth,
                                    Math.random() * window.innerHeight
                                );
                            }
                            break;
                        case 'sound':
                            this.playBeep(400, 200);
                            setTimeout(() => this.playBeep(600, 200), 300);
                            setTimeout(() => this.playBeep(800, 200), 600);
                            break;
                        case 'close':
                            document.body.removeChild(terminal);
                            return;
                    }
                } else if (command) {
                    output.innerHTML += `Command not found: ${command}\nType 'help' for available commands.\n\n`;
                }
                
                input.value = '';
                output.scrollTop = output.scrollHeight;
            }
        });

        // Close terminal with Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('hacker-terminal')) {
                document.body.removeChild(terminal);
            }
        });

        input.focus();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CyberpunkEffects();
    console.log('%c🚀 CYBERPUNK SYSTEM ONLINE 🚀', 'color: #00ffff; font-size: 16px; font-weight: bold;');
    console.log('%cEaster eggs available:', 'color: #b388ff;');
    console.log('%c- Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A', 'color: #7c4dff;');
    console.log('%c- Terminal: Ctrl+Shift+T', 'color: #7c4dff;');
});

// Add global effects
window.addEventListener('load', () => {
    // Startup animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 1s ease-in';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Add loading text effect
    const loadingTexts = [
        'INITIALIZING NEURAL NETWORK...',
        'CONNECTING TO MAINFRAME...',
        'LOADING CYBERPUNK PROTOCOLS...',
        'SYSTEM READY.'
    ];
    
    let textIndex = 0;
    const showLoadingText = () => {
        if (textIndex < loadingTexts.length) {
            console.log(`%c${loadingTexts[textIndex]}`, 'color: #00ffff;');
            textIndex++;
            setTimeout(showLoadingText, 300);
        }
    };
    
    showLoadingText();
});
