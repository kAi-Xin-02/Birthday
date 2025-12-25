(function(window) {

    function ParticleSystem(container, options) {
        this.container = container;
        this.options = options || {};
        
        this.particles = [];
        this.isRunning = false;
        this.animationId = null;
        
        this.maxParticles = this.options.maxParticles || 100;
        this.spawnRate = this.options.spawnRate || 100;
        this.lastSpawn = 0;
        
        this.colors = this.options.colors || [
            '#FF6B95', '#FFD700', '#00CED1', '#FF69B4',
            '#7B68EE', '#98FB98', '#FF7F50', '#87CEEB'
        ];
    }

    ParticleSystem.prototype = {
        constructor: ParticleSystem,

        start: function() {
            if (this.isRunning) return;
            this.isRunning = true;
            this.animate();
        },

        stop: function() {
            this.isRunning = false;
            if (this.animationId) {
                cancelAnimFrame(this.animationId);
                this.animationId = null;
            }
        },

        animate: function() {
            var self = this;
            
            function loop(timestamp) {
                if (!self.isRunning) return;
                
                if (timestamp - self.lastSpawn > self.spawnRate) {
                    if (self.particles.length < self.maxParticles) {
                        self.spawnParticle();
                    }
                    self.lastSpawn = timestamp;
                }
                
                self.updateParticles();
                
                self.animationId = requestAnimFrame(loop);
            }
            
            requestAnimFrame(loop);
        },

        spawnParticle: function() {
            var particle = document.createElement('div');
            var size = randomFloat(3, 8);
            var x = random(0, window.innerWidth);
            var color = this.colors[random(0, this.colors.length - 1)];
            
            particle.style.cssText = 
                'position:fixed;' +
                'width:' + size + 'px;' +
                'height:' + size + 'px;' +
                'background:' + color + ';' +
                'border-radius:50%;' +
                'left:' + x + 'px;' +
                'top:-10px;' +
                'pointer-events:none;' +
                'box-shadow:0 0 ' + (size * 2) + 'px ' + color + ';' +
                'z-index:999;';
            
            var data = {
                element: particle,
                x: x,
                y: -10,
                vx: randomFloat(-1, 1),
                vy: randomFloat(1, 3),
                size: size,
                opacity: 1,
                fadeSpeed: randomFloat(0.005, 0.015)
            };
            
            this.container.appendChild(particle);
            this.particles.push(data);
        },

        updateParticles: function() {
            for (var i = this.particles.length - 1; i >= 0; i--) {
                var p = this.particles[i];
                
                p.x += p.vx;
                p.y += p.vy;
                p.opacity -= p.fadeSpeed;
                
                p.element.style.left = p.x + 'px';
                p.element.style.top = p.y + 'px';
                p.element.style.opacity = p.opacity;
                
                if (p.opacity <= 0 || p.y > window.innerHeight) {
                    if (p.element.parentNode) {
                        p.element.parentNode.removeChild(p.element);
                    }
                    this.particles.splice(i, 1);
                }
            }
        },

        clear: function() {
            for (var i = 0; i < this.particles.length; i++) {
                if (this.particles[i].element.parentNode) {
                    this.particles[i].element.parentNode.removeChild(this.particles[i].element);
                }
            }
            this.particles = [];
        }
    };

    function ConfettiSystem(container, options) {
        this.container = container;
        this.options = options || {};
        
        this.confetti = [];
        this.isRunning = false;
        this.animationId = null;
        
        this.colors = this.options.colors || [
            '#FF6B95', '#FFD700', '#00CED1', '#FF69B4',
            '#7B68EE', '#98FB98', '#FF7F50', '#87CEEB',
            '#FF4500', '#32CD32', '#FF1493', '#4169E1'
        ];
        
        this.shapes = ['square', 'rectangle', 'circle'];
    }

    ConfettiSystem.prototype = {
        constructor: ConfettiSystem,

        start: function() {
            if (this.isRunning) return;
            this.isRunning = true;
            this.animate();
        },

        stop: function() {
            this.isRunning = false;
            if (this.animationId) {
                cancelAnimFrame(this.animationId);
                this.animationId = null;
            }
        },

        animate: function() {
            var self = this;
            
            function loop() {
                if (!self.isRunning) return;
                
                if (self.confetti.length < 50 && Math.random() > 0.9) {
                    self.spawnConfetti();
                }
                
                self.updateConfetti();
                
                self.animationId = requestAnimFrame(loop);
            }
            
            loop();
        },

        burst: function(x, y, count) {
            count = count || 50;
            
            for (var i = 0; i < count; i++) {
                this.spawnConfettiAt(x, y);
            }
        },

        spawnConfetti: function() {
            this.spawnConfettiAt(random(0, window.innerWidth), -20);
        },

        spawnConfettiAt: function(x, y) {
            var confetti = document.createElement('div');
            var shape = this.shapes[random(0, this.shapes.length - 1)];
            var color = this.colors[random(0, this.colors.length - 1)];
            var width, height, borderRadius;
            
            switch (shape) {
                case 'square':
                    width = height = randomFloat(8, 15);
                    borderRadius = '0';
                    break;
                case 'rectangle':
                    width = randomFloat(5, 10);
                    height = randomFloat(15, 25);
                    borderRadius = '0';
                    break;
                case 'circle':
                    width = height = randomFloat(8, 12);
                    borderRadius = '50%';
                    break;
            }
            
            confetti.style.cssText = 
                'position:fixed;' +
                'width:' + width + 'px;' +
                'height:' + height + 'px;' +
                'background:' + color + ';' +
                'border-radius:' + borderRadius + ';' +
                'left:' + x + 'px;' +
                'top:' + y + 'px;' +
                'pointer-events:none;' +
                'z-index:9999;';
            
            var data = {
                element: confetti,
                x: x,
                y: y,
                vx: randomFloat(-5, 5),
                vy: randomFloat(2, 8),
                rotation: random(0, 360),
                rotationSpeed: randomFloat(-15, 15),
                gravity: 0.1,
                friction: 0.99,
                opacity: 1,
                wobble: random(0, 10),
                wobbleSpeed: randomFloat(0.05, 0.15)
            };
            
            this.container.appendChild(confetti);
            this.confetti.push(data);
        },

        updateConfetti: function() {
            for (var i = this.confetti.length - 1; i >= 0; i--) {
                var c = this.confetti[i];
                
                c.vx *= c.friction;
                c.vy += c.gravity;
                c.x += c.vx + Math.sin(c.wobble) * 2;
                c.y += c.vy;
                c.rotation += c.rotationSpeed;
                c.wobble += c.wobbleSpeed;
                
                if (c.y > window.innerHeight - 100) {
                    c.opacity -= 0.02;
                }
                
                c.element.style.left = c.x + 'px';
                c.element.style.top = c.y + 'px';
                c.element.style.transform = 'rotate(' + c.rotation + 'deg)';
                c.element.style.opacity = c.opacity;
                
                if (c.opacity <= 0 || c.y > window.innerHeight + 50) {
                    if (c.element.parentNode) {
                        c.element.parentNode.removeChild(c.element);
                    }
                    this.confetti.splice(i, 1);
                }
            }
        },

        clear: function() {
            for (var i = 0; i < this.confetti.length; i++) {
                if (this.confetti[i].element.parentNode) {
                    this.confetti[i].element.parentNode.removeChild(this.confetti[i].element);
                }
            }
            this.confetti = [];
        }
    };

    function SparkleSystem(container, options) {
        this.container = container;
        this.options = options || {};
        
        this.sparkles = [];
        this.isRunning = false;
        this.spawnInterval = null;
        
        this.spawnRate = this.options.spawnRate || 200;
        this.maxSparkles = this.options.maxSparkles || 30;
    }

    SparkleSystem.prototype = {
        constructor: SparkleSystem,

        start: function() {
            if (this.isRunning) return;
            this.isRunning = true;
            
            var self = this;
            this.spawnInterval = setInterval(function() {
                if (self.sparkles.length < self.maxSparkles) {
                    self.spawnSparkle();
                }
            }, this.spawnRate);
        },

        stop: function() {
            this.isRunning = false;
            if (this.spawnInterval) {
                clearInterval(this.spawnInterval);
                this.spawnInterval = null;
            }
        },

        spawnSparkle: function() {
            var x = random(50, window.innerWidth - 50);
            var y = random(50, window.innerHeight - 50);
            
            var sparkle = document.createElement('div');
            var size = randomFloat(4, 10);
            
            sparkle.innerHTML = '✨';
            sparkle.style.cssText = 
                'position:fixed;' +
                'font-size:' + size * 3 + 'px;' +
                'left:' + x + 'px;' +
                'top:' + y + 'px;' +
                'pointer-events:none;' +
                'z-index:999;' +
                'opacity:0;';
            
            this.container.appendChild(sparkle);
            this.sparkles.push(sparkle);
            
            var self = this;
            
            sparkle.animate([
                { opacity: 0, transform: 'scale(0) rotate(0deg)' },
                { opacity: 1, transform: 'scale(1.2) rotate(180deg)', offset: 0.5 },
                { opacity: 0, transform: 'scale(0) rotate(360deg)' }
            ], {
                duration: randomFloat(1000, 2000),
                easing: 'ease-in-out',
                fill: 'forwards'
            }).onfinish = function() {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
                var idx = self.sparkles.indexOf(sparkle);
                if (idx > -1) {
                    self.sparkles.splice(idx, 1);
                }
            };
        },

        clear: function() {
            for (var i = 0; i < this.sparkles.length; i++) {
                if (this.sparkles[i].parentNode) {
                    this.sparkles[i].parentNode.removeChild(this.sparkles[i]);
                }
            }
            this.sparkles = [];
        }
    };

    function StarField(container, options) {
        this.container = container;
        this.options = options || {};
        
        this.stars = [];
        this.count = this.options.count || 100;
        
        this.createStars();
    }

    StarField.prototype = {
        constructor: StarField,

        createStars: function() {
            for (var i = 0; i < this.count; i++) {
                this.createStar();
            }
        },

        createStar: function() {
            var star = document.createElement('div');
            var size = randomFloat(1, 4);
            var x = random(0, 100);
            var y = random(0, 100);
            var duration = randomFloat(2, 5);
            var delay = randomFloat(0, 3);
            
            star.style.cssText = 
                'position:absolute;' +
                'width:' + size + 'px;' +
                'height:' + size + 'px;' +
                'background:#fff;' +
                'border-radius:50%;' +
                'left:' + x + '%;' +
                'top:' + y + '%;' +
                'box-shadow:0 0 ' + (size * 2) + 'px #fff;' +
                'animation:twinkle ' + duration + 's ease-in-out infinite;' +
                'animation-delay:' + delay + 's;';
            
            this.container.appendChild(star);
            this.stars.push(star);
        },

        clear: function() {
            for (var i = 0; i < this.stars.length; i++) {
                if (this.stars[i].parentNode) {
                    this.stars[i].parentNode.removeChild(this.stars[i]);
                }
            }
            this.stars = [];
        }
    };

    function BalloonSystem(container, options) {
        this.container = container;
        this.options = options || {};
        
        this.balloons = [];
        this.isRunning = false;
        this.spawnInterval = null;
        
        this.spawnRate = this.options.spawnRate || 3000;
        this.maxBalloons = this.options.maxBalloons || 10;
        
        this.colors = this.options.colors || [
            'linear-gradient(135deg, #FF6B95, #FF8FAB)',
            'linear-gradient(135deg, #FFD700, #FFA500)',
            'linear-gradient(135deg, #00CED1, #20B2AA)',
            'linear-gradient(135deg, #9370DB, #BA55D3)',
            'linear-gradient(135deg, #87CEEB, #4682B4)',
            'linear-gradient(135deg, #98FB98, #32CD32)'
        ];
    }

    BalloonSystem.prototype = {
        constructor: BalloonSystem,

        start: function() {
            if (this.isRunning) return;
            this.isRunning = true;
            
            var self = this;
            
            for (var i = 0; i < 3; i++) {
                setTimeout(function() {
                    self.spawnBalloon();
                }, i * 500);
            }
            
            this.spawnInterval = setInterval(function() {
                if (self.balloons.length < self.maxBalloons) {
                    self.spawnBalloon();
                }
            }, this.spawnRate);
        },

        stop: function() {
            this.isRunning = false;
            if (this.spawnInterval) {
                clearInterval(this.spawnInterval);
                this.spawnInterval = null;
            }
        },

        spawnBalloon: function() {
            var balloon = document.createElement('div');
            var x = random(50, window.innerWidth - 100);
            var size = randomFloat(40, 70);
            var duration = randomFloat(10000, 20000);
            var swayAmount = randomFloat(30, 80);
            var color = this.colors[random(0, this.colors.length - 1)];
            
            balloon.innerHTML = '<div class="balloon-body"></div><div class="balloon-string"></div>';
            
            balloon.style.cssText = 
                'position:fixed;' +
                'left:' + x + 'px;' +
                'bottom:-150px;' +
                'pointer-events:none;' +
                'z-index:50;';
            
            var body = balloon.querySelector('.balloon-body');
            body.style.cssText = 
                'width:' + size + 'px;' +
                'height:' + (size * 1.3) + 'px;' +
                'background:' + color + ';' +
                'border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;' +
                'position:relative;' +
                'box-shadow:inset -10px -10px 20px rgba(0,0,0,0.1), inset 5px 5px 10px rgba(255,255,255,0.3);';
            
            var string = balloon.querySelector('.balloon-string');
            string.style.cssText = 
                'width:2px;' +
                'height:50px;' +
                'background:rgba(255,255,255,0.5);' +
                'position:absolute;' +
                'left:50%;' +
                'top:100%;' +
                'transform:translateX(-50%);';
            
            this.container.appendChild(balloon);
            this.balloons.push(balloon);
            
            var self = this;
            var startX = x;
            var currentTime = 0;
            var swaySpeed = randomFloat(0.001, 0.003);
            
            function animateBalloon() {
                if (!balloon.parentNode) return;
                
                currentTime += 16;
                var progress = currentTime / duration;
                
                if (progress >= 1) {
                    if (balloon.parentNode) {
                        balloon.parentNode.removeChild(balloon);
                    }
                    var idx = self.balloons.indexOf(balloon);
                    if (idx > -1) {
                        self.balloons.splice(idx, 1);
                    }
                    return;
                }
                
                var y = -150 + (window.innerHeight + 300) * progress;
                var swayX = Math.sin(currentTime * swaySpeed) * swayAmount;
                
                balloon.style.bottom = (-y) + 'px';
                balloon.style.left = (startX + swayX) + 'px';
                balloon.style.transform = 'rotate(' + (Math.sin(currentTime * swaySpeed * 0.5) * 10) + 'deg)';
                
                requestAnimFrame(animateBalloon);
            }
            
            requestAnimFrame(animateBalloon);
        },

        clear: function() {
            for (var i = 0; i < this.balloons.length; i++) {
                if (this.balloons[i].parentNode) {
                    this.balloons[i].parentNode.removeChild(this.balloons[i]);
                }
            }
            this.balloons = [];
        }
    };

    function FireworkSystem(container, options) {
        this.container = container;
        this.options = options || {};
        
        this.fireworks = [];
        this.isRunning = false;
        this.launchInterval = null;
        
        this.launchRate = this.options.launchRate || 2000;
        
        this.colors = this.options.colors || [
            '#FF6B95', '#FFD700', '#00CED1', '#FF69B4',
            '#7B68EE', '#FF4500', '#00FF7F', '#FF1493',
            '#4169E1', '#FF8C00', '#9400D3', '#00BFFF'
        ];
    }

    FireworkSystem.prototype = {
        constructor: FireworkSystem,

        start: function() {
            if (this.isRunning) return;
            this.isRunning = true;
            
            var self = this;
            
            this.launch();
            
            this.launchInterval = setInterval(function() {
                self.launch();
            }, this.launchRate);
        },

        stop: function() {
            this.isRunning = false;
            if (this.launchInterval) {
                clearInterval(this.launchInterval);
                this.launchInterval = null;
            }
        },

        launch: function() {
            var x = random(100, window.innerWidth - 100);
            var targetY = random(100, window.innerHeight * 0.4);
            var color = this.colors[random(0, this.colors.length - 1)];
            
            var rocket = document.createElement('div');
            rocket.style.cssText = 
                'position:fixed;' +
                'width:4px;' +
                'height:15px;' +
                'background:linear-gradient(to top, ' + color + ', #fff);' +
                'left:' + x + 'px;' +
                'bottom:0;' +
                'pointer-events:none;' +
                'z-index:9999;' +
                'border-radius:2px;' +
                'box-shadow:0 0 10px ' + color + ';';
            
            this.container.appendChild(rocket);
            
            var self = this;
            var startTime = Date.now();
            var duration = randomFloat(800, 1200);
            
            function animateRocket() {
                var elapsed = Date.now() - startTime;
                var progress = elapsed / duration;
                
                if (progress >= 1) {
                    if (rocket.parentNode) {
                        rocket.parentNode.removeChild(rocket);
                    }
                    self.explode(x, window.innerHeight - targetY, color);
                    return;
                }
                
                var y = easeOutQuad(progress) * targetY;
                rocket.style.bottom = y + 'px';
                rocket.style.opacity = 1 - progress * 0.3;
                
                requestAnimFrame(animateRocket);
            }
            
            requestAnimFrame(animateRocket);
        },

        explode: function(x, y, baseColor) {
            var particleCount = random(30, 60);
            var type = random(0, 3);
            
            for (var i = 0; i < particleCount; i++) {
                this.createExplosionParticle(x, y, i, particleCount, baseColor, type);
            }
        },

        createExplosionParticle: function(x, y, index, total, baseColor, type) {
            var particle = document.createElement('div');
            var size = randomFloat(3, 7);
            var angle, speed, color;
            
            switch (type) {
                case 0:
                    angle = (index / total) * Math.PI * 2;
                    speed = randomFloat(80, 150);
                    color = baseColor;
                    break;
                case 1:
                    angle = randomFloat(0, Math.PI * 2);
                    speed = randomFloat(50, 200);
                    color = this.colors[random(0, this.colors.length - 1)];
                    break;
                case 2:
                    angle = (index / total) * Math.PI * 2 + randomFloat(-0.2, 0.2);
                    speed = randomFloat(100, 180);
                    color = index % 2 === 0 ? baseColor : '#FFD700';
                    break;
                default:
                    angle = randomFloat(0, Math.PI * 2);
                    speed = randomFloat(60, 140);
                    color = baseColor;
            }
            
            particle.style.cssText = 
                'position:fixed;' +
                'width:' + size + 'px;' +
                'height:' + size + 'px;' +
                'background:' + color + ';' +
                'border-radius:50%;' +
                'left:' + x + 'px;' +
                'top:' + y + 'px;' +
                'pointer-events:none;' +
                'z-index:9999;' +
                'box-shadow:0 0 ' + (size * 3) + 'px ' + color + ';';
            
            this.container.appendChild(particle);
            
            var vx = Math.cos(angle) * speed;
            var vy = Math.sin(angle) * speed;
            var gravity = 80;
            var friction = 0.98;
            var startTime = Date.now();
            var duration = randomFloat(1000, 2000);
            var currentX = x;
            var currentY = y;
            var lastTime = startTime;
            
            function animateParticle() {
                var now = Date.now();
                var dt = (now - lastTime) / 1000;
                lastTime = now;
                
                var elapsed = now - startTime;
                var progress = elapsed / duration;
                
                if (progress >= 1) {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                    return;
                }
                
                vx *= friction;
                vy *= friction;
                vy += gravity * dt;
                
                currentX += vx * dt;
                currentY += vy * dt;
                
                particle.style.left = currentX + 'px';
                particle.style.top = currentY + 'px';
                particle.style.opacity = 1 - easeInQuad(progress);
                particle.style.transform = 'scale(' + (1 - progress * 0.5) + ')';
                
                requestAnimFrame(animateParticle);
            }
            
            requestAnimFrame(animateParticle);
        },

        clear: function() {
            var particles = this.container.querySelectorAll('[style*="z-index:9999"]');
            for (var i = 0; i < particles.length; i++) {
                if (particles[i].parentNode) {
                    particles[i].parentNode.removeChild(particles[i]);
                }
            }
        }
    };

    function GlowingText(element, options) {
        this.element = element;
        this.options = options || {};
        
        this.colors = this.options.colors || ['#FF6B95', '#FFD700', '#00CED1', '#FF69B4'];
        this.duration = this.options.duration || 3000;
        
        this.initialize();
    }

    GlowingText.prototype = {
        constructor: GlowingText,

        initialize: function() {
            this.element.style.transition = 'text-shadow ' + (this.duration / 1000) + 's ease-in-out';
            this.animate();
        },

        animate: function() {
            var self = this;
            var colorIndex = 0;
            
            function updateGlow() {
                var color = self.colors[colorIndex];
                self.element.style.textShadow = 
                    '0 0 10px ' + color + ',' +
                    '0 0 20px ' + color + ',' +
                    '0 0 30px ' + color + ',' +
                    '0 0 40px ' + color;
                
                colorIndex = (colorIndex + 1) % self.colors.length;
            }
            
            updateGlow();
            setInterval(updateGlow, this.duration);
        }
    };

    function TypewriterEffect(element, text, options) {
        this.element = element;
        this.text = text;
        this.options = options || {};
        
        this.speed = this.options.speed || 50;
        this.delay = this.options.delay || 0;
        this.cursor = this.options.cursor !== false;
        this.onComplete = this.options.onComplete || null;
        
        this.currentIndex = 0;
        this.isTyping = false;
    }

    TypewriterEffect.prototype = {
        constructor: TypewriterEffect,

        start: function() {
            if (this.isTyping) return;
            this.isTyping = true;
            
            var self = this;
            
            setTimeout(function() {
                self.type();
            }, this.delay);
        },

        type: function() {
            var self = this;
            
            if (this.currentIndex < this.text.length) {
                var char = this.text.charAt(this.currentIndex);
                
                if (char === '<') {
                    var endIndex = this.text.indexOf('>', this.currentIndex);
                    if (endIndex !== -1) {
                        this.element.innerHTML += this.text.substring(this.currentIndex, endIndex + 1);
                        this.currentIndex = endIndex + 1;
                    } else {
                        this.element.innerHTML += char;
                        this.currentIndex++;
                    }
                } else {
                    this.element.innerHTML += char;
                    this.currentIndex++;
                }
                
                setTimeout(function() {
                    self.type();
                }, this.speed);
            } else {
                this.isTyping = false;
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        },

        reset: function() {
            this.currentIndex = 0;
            this.element.innerHTML = '';
            this.isTyping = false;
        }
    };

    function RippleEffect(container) {
        this.container = container;
        this.isActive = false;
        
        this.handleClick = this.handleClick.bind(this);
    }

    RippleEffect.prototype = {
        constructor: RippleEffect,

        activate: function() {
            if (this.isActive) return;
            this.isActive = true;
            this.container.addEventListener('click', this.handleClick);
        },

        deactivate: function() {
            this.isActive = false;
            this.container.removeEventListener('click', this.handleClick);
        },

        handleClick: function(event) {
            this.createRipple(event.clientX, event.clientY);
        },

        createRipple: function(x, y) {
            var ripple = document.createElement('div');
            var size = 20;
            
            ripple.style.cssText = 
                'position:fixed;' +
                'width:' + size + 'px;' +
                'height:' + size + 'px;' +
                'background:radial-gradient(circle, rgba(255,107,149,0.6) 0%, transparent 70%);' +
                'border-radius:50%;' +
                'left:' + (x - size / 2) + 'px;' +
                'top:' + (y - size / 2) + 'px;' +
                'pointer-events:none;' +
                'z-index:99999;';
            
            this.container.appendChild(ripple);
            
            ripple.animate([
                { transform: 'scale(1)', opacity: 1 },
                { transform: 'scale(20)', opacity: 0 }
            ], {
                duration: 800,
                easing: 'ease-out',
                fill: 'forwards'
            }).onfinish = function() {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            };
        }
    };

    function ScrollReveal(elements, options) {
        this.elements = typeof elements === 'string' ? document.querySelectorAll(elements) : elements;
        this.options = options || {};
        
        this.threshold = this.options.threshold || 0.1;
        this.rootMargin = this.options.rootMargin || '0px';
        
        this.initialize();
    }

    ScrollReveal.prototype = {
        constructor: ScrollReveal,

        initialize: function() {
            var self = this;
            
            if ('IntersectionObserver' in window) {
                this.observer = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('revealed');
                            self.observer.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: this.threshold,
                    rootMargin: this.rootMargin
                });
                
                for (var i = 0; i < this.elements.length; i++) {
                    this.observer.observe(this.elements[i]);
                }
            } else {
                for (var j = 0; j < this.elements.length; j++) {
                    this.elements[j].classList.add('revealed');
                }
            }
        }
    };

    window.ParticleSystem = ParticleSystem;
    window.ConfettiSystem = ConfettiSystem;
    window.SparkleSystem = SparkleSystem;
    window.StarField = StarField;
    window.BalloonSystem = BalloonSystem;
    window.FireworkSystem = FireworkSystem;
    window.GlowingText = GlowingText;
    window.TypewriterEffect = TypewriterEffect;
    window.RippleEffect = RippleEffect;
    window.ScrollReveal = ScrollReveal;

})(window);