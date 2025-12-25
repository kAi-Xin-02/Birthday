(function(window) {

    function HeartSystem(container, options) {
        this.container = container;
        this.options = options || {};
        
        this.hearts = [];
        this.floatingHearts = [];
        this.burstHearts = [];
        this.trailHearts = [];
        
        this.isRunning = false;
        this.animationId = null;
        
        this.maxHearts = this.options.maxHearts || 50;
        this.spawnRate = this.options.spawnRate || 500;
        this.lastSpawn = 0;
        
        this.heartEmojis = ['❤️', '💖', '💗', '💝', '💕', '💓', '💞', '💘', '💟', '♥️'];
        this.heartColors = [
            '#FF6B95',
            '#FF8FAB',
            '#FFB3C6',
            '#FF69B4',
            '#FF1493',
            '#DB7093',
            '#FFB6C1',
            '#FFC0CB',
            '#FF85A2',
            '#FF99AC',
            '#E91E63',
            '#F06292',
            '#F48FB1',
            '#FF4081'
        ];
        
        this.events = new EventEmitter();
        this.initialize();
    }

    HeartSystem.prototype = {
        constructor: HeartSystem,

        initialize: function() {
            this.setupContainer();
        },

        setupContainer: function() {
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'heart-system-container';
                this.container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1000;overflow:hidden;';
                document.body.appendChild(this.container);
            }
        },

        start: function() {
            if (this.isRunning) return;
            
            this.isRunning = true;
            this.animate();
            this.startAutoSpawn();
            this.events.emit('start');
        },

        stop: function() {
            this.isRunning = false;
            if (this.animationId) {
                cancelAnimFrame(this.animationId);
                this.animationId = null;
            }
            if (this.spawnInterval) {
                clearInterval(this.spawnInterval);
                this.spawnInterval = null;
            }
            this.events.emit('stop');
        },

        animate: function() {
            var self = this;
            
            function loop() {
                if (!self.isRunning) return;
                
                self.updateFloatingHearts();
                self.updateBurstHearts();
                self.updateTrailHearts();
                
                self.animationId = requestAnimFrame(loop);
            }
            
            loop();
        },

        startAutoSpawn: function() {
            var self = this;
            
            this.spawnInterval = setInterval(function() {
                if (self.floatingHearts.length < self.maxHearts) {
                    self.spawnFloatingHeart();
                }
            }, this.spawnRate);
        },

        spawnFloatingHeart: function(options) {
            options = options || {};
            
            var heart = new FloatingHeart(this, {
                x: options.x || random(50, window.innerWidth - 50),
                y: options.y || window.innerHeight + 50,
                size: options.size || randomFloat(20, 40),
                speed: options.speed || randomFloat(1, 3),
                rotation: options.rotation || randomFloat(-30, 30),
                rotationSpeed: options.rotationSpeed || randomFloat(-2, 2),
                swayAmount: options.swayAmount || randomFloat(30, 80),
                swaySpeed: options.swaySpeed || randomFloat(0.01, 0.03),
                color: options.color || this.heartColors[random(0, this.heartColors.length - 1)],
                emoji: options.emoji || (random(0, 10) > 7 ? this.heartEmojis[random(0, this.heartEmojis.length - 1)] : null),
                opacity: options.opacity || randomFloat(0.6, 1),
                scale: options.scale || randomFloat(0.8, 1.2)
            });
            
            this.floatingHearts.push(heart);
            this.container.appendChild(heart.element);
            
            return heart;
        },

        updateFloatingHearts: function() {
            for (var i = this.floatingHearts.length - 1; i >= 0; i--) {
                var heart = this.floatingHearts[i];
                heart.update();
                
                if (heart.y < -100 || heart.opacity <= 0) {
                    heart.destroy();
                    this.floatingHearts.splice(i, 1);
                }
            }
        },

        createHeartBurst: function(x, y, count) {
            count = count || 10;
            
            for (var i = 0; i < count; i++) {
                var angle = (i / count) * Math.PI * 2;
                var speed = randomFloat(3, 8);
                var vx = Math.cos(angle) * speed;
                var vy = Math.sin(angle) * speed;
                
                var heart = new BurstHeart(this, {
                    x: x,
                    y: y,
                    vx: vx,
                    vy: vy,
                    size: randomFloat(15, 30),
                    color: this.heartColors[random(0, this.heartColors.length - 1)],
                    rotation: randomFloat(0, 360),
                    rotationSpeed: randomFloat(-10, 10),
                    gravity: 0.15,
                    friction: 0.98,
                    opacity: 1,
                    fadeSpeed: 0.015
                });
                
                this.burstHearts.push(heart);
                this.container.appendChild(heart.element);
            }
            
            this.events.emit('burst', { x: x, y: y, count: count });
        },

        updateBurstHearts: function() {
            for (var i = this.burstHearts.length - 1; i >= 0; i--) {
                var heart = this.burstHearts[i];
                heart.update();
                
                if (heart.opacity <= 0) {
                    heart.destroy();
                    this.burstHearts.splice(i, 1);
                }
            }
        },

        createHeartTrail: function(x, y) {
            var heart = new TrailHeart(this, {
                x: x,
                y: y,
                size: randomFloat(10, 20),
                color: this.heartColors[random(0, this.heartColors.length - 1)],
                opacity: 0.8,
                fadeSpeed: 0.03,
                scale: 1,
                scaleSpeed: -0.02
            });
            
            this.trailHearts.push(heart);
            this.container.appendChild(heart.element);
            
            return heart;
        },

        updateTrailHearts: function() {
            for (var i = this.trailHearts.length - 1; i >= 0; i--) {
                var heart = this.trailHearts[i];
                heart.update();
                
                if (heart.opacity <= 0 || heart.scale <= 0) {
                    heart.destroy();
                    this.trailHearts.splice(i, 1);
                }
            }
        },

        clearAll: function() {
            for (var i = 0; i < this.floatingHearts.length; i++) {
                this.floatingHearts[i].destroy();
            }
            for (var j = 0; j < this.burstHearts.length; j++) {
                this.burstHearts[j].destroy();
            }
            for (var k = 0; k < this.trailHearts.length; k++) {
                this.trailHearts[k].destroy();
            }
            
            this.floatingHearts = [];
            this.burstHearts = [];
            this.trailHearts = [];
        },

        on: function(event, callback) {
            this.events.on(event, callback);
            return this;
        },

        off: function(event, callback) {
            this.events.off(event, callback);
            return this;
        }
    };

    function FloatingHeart(system, config) {
        this.system = system;
        
        this.x = config.x;
        this.y = config.y;
        this.initialX = config.x;
        this.size = config.size;
        this.speed = config.speed;
        this.rotation = config.rotation;
        this.rotationSpeed = config.rotationSpeed;
        this.swayAmount = config.swayAmount;
        this.swaySpeed = config.swaySpeed;
        this.color = config.color;
        this.emoji = config.emoji;
        this.opacity = config.opacity;
        this.scale = config.scale;
        
        this.time = random(0, 1000);
        this.element = null;
        
        this.createElement();
    }

    FloatingHeart.prototype = {
        constructor: FloatingHeart,

        createElement: function() {
            this.element = document.createElement('div');
            this.element.className = 'floating-heart-element';
            
            if (this.emoji) {
                this.element.textContent = this.emoji;
                this.element.style.cssText = 
                    'position:absolute;' +
                    'font-size:' + this.size + 'px;' +
                    'left:' + this.x + 'px;' +
                    'top:' + this.y + 'px;' +
                    'opacity:' + this.opacity + ';' +
                    'transform:rotate(' + this.rotation + 'deg) scale(' + this.scale + ');' +
                    'pointer-events:none;' +
                    'transition:none;' +
                    'will-change:transform,top,left,opacity;';
            } else {
                this.element.innerHTML = this.createSVGHeart();
                this.element.style.cssText = 
                    'position:absolute;' +
                    'width:' + this.size + 'px;' +
                    'height:' + this.size + 'px;' +
                    'left:' + this.x + 'px;' +
                    'top:' + this.y + 'px;' +
                    'opacity:' + this.opacity + ';' +
                    'transform:rotate(' + this.rotation + 'deg) scale(' + this.scale + ');' +
                    'pointer-events:none;' +
                    'transition:none;' +
                    'will-change:transform,top,left,opacity;';
            }
        },

        createSVGHeart: function() {
            return '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
                '<path fill="' + this.color + '" d="M16 28.7l-1.4-1.3C6.5 20.2 2 16.1 2 11.2 2 7.1 5.2 4 9.3 4c2.3 0 4.5 1.1 6 2.8C16.8 5.1 19 4 21.3 4 25.4 4 28.6 7.1 28.6 11.2c0 4.9-4.5 9-12.6 16.2L16 28.7z"/>' +
                '</svg>';
        },

        update: function() {
            this.y -= this.speed;
            this.rotation += this.rotationSpeed;
            this.time += this.swaySpeed;
            this.x = this.initialX + Math.sin(this.time) * this.swayAmount;
            
            if (this.y < window.innerHeight * 0.3) {
                this.opacity -= 0.01;
            }
            
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
            this.element.style.opacity = this.opacity;
            this.element.style.transform = 'rotate(' + this.rotation + 'deg) scale(' + this.scale + ')';
        },

        destroy: function() {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            this.element = null;
        }
    };

    function BurstHeart(system, config) {
        this.system = system;
        
        this.x = config.x;
        this.y = config.y;
        this.vx = config.vx;
        this.vy = config.vy;
        this.size = config.size;
        this.color = config.color;
        this.rotation = config.rotation;
        this.rotationSpeed = config.rotationSpeed;
        this.gravity = config.gravity;
        this.friction = config.friction;
        this.opacity = config.opacity;
        this.fadeSpeed = config.fadeSpeed;
        
        this.element = null;
        this.createElement();
    }

    BurstHeart.prototype = {
        constructor: BurstHeart,

        createElement: function() {
            this.element = document.createElement('div');
            this.element.className = 'burst-heart-element';
            this.element.innerHTML = this.createSVGHeart();
            
            this.element.style.cssText = 
                'position:absolute;' +
                'width:' + this.size + 'px;' +
                'height:' + this.size + 'px;' +
                'left:' + this.x + 'px;' +
                'top:' + this.y + 'px;' +
                'opacity:' + this.opacity + ';' +
                'transform:rotate(' + this.rotation + 'deg);' +
                'pointer-events:none;' +
                'transition:none;' +
                'will-change:transform,top,left,opacity;';
        },

        createSVGHeart: function() {
            return '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
                '<path fill="' + this.color + '" d="M16 28.7l-1.4-1.3C6.5 20.2 2 16.1 2 11.2 2 7.1 5.2 4 9.3 4c2.3 0 4.5 1.1 6 2.8C16.8 5.1 19 4 21.3 4 25.4 4 28.6 7.1 28.6 11.2c0 4.9-4.5 9-12.6 16.2L16 28.7z"/>' +
                '</svg>';
        },

        update: function() {
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vy += this.gravity;
            
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
            this.opacity -= this.fadeSpeed;
            
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
            this.element.style.opacity = Math.max(0, this.opacity);
            this.element.style.transform = 'rotate(' + this.rotation + 'deg)';
        },

        destroy: function() {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            this.element = null;
        }
    };

    function TrailHeart(system, config) {
        this.system = system;
        
        this.x = config.x;
        this.y = config.y;
        this.size = config.size;
        this.color = config.color;
        this.opacity = config.opacity;
        this.fadeSpeed = config.fadeSpeed;
        this.scale = config.scale;
        this.scaleSpeed = config.scaleSpeed;
        
        this.element = null;
        this.createElement();
    }

    TrailHeart.prototype = {
        constructor: TrailHeart,

        createElement: function() {
            this.element = document.createElement('div');
            this.element.className = 'trail-heart-element';
            this.element.innerHTML = this.createSVGHeart();
            
            this.element.style.cssText = 
                'position:absolute;' +
                'width:' + this.size + 'px;' +
                'height:' + this.size + 'px;' +
                'left:' + (this.x - this.size / 2) + 'px;' +
                'top:' + (this.y - this.size / 2) + 'px;' +
                'opacity:' + this.opacity + ';' +
                'transform:scale(' + this.scale + ');' +
                'pointer-events:none;' +
                'transition:none;' +
                'will-change:transform,opacity;';
        },

        createSVGHeart: function() {
            return '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
                '<path fill="' + this.color + '" d="M16 28.7l-1.4-1.3C6.5 20.2 2 16.1 2 11.2 2 7.1 5.2 4 9.3 4c2.3 0 4.5 1.1 6 2.8C16.8 5.1 19 4 21.3 4 25.4 4 28.6 7.1 28.6 11.2c0 4.9-4.5 9-12.6 16.2L16 28.7z"/>' +
                '</svg>';
        },

        update: function() {
            this.opacity -= this.fadeSpeed;
            this.scale += this.scaleSpeed;
            
            this.element.style.opacity = Math.max(0, this.opacity);
            this.element.style.transform = 'scale(' + Math.max(0, this.scale) + ')';
        },

        destroy: function() {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            this.element = null;
        }
    };

    function HeartCanvas(canvas, options) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.options = options || {};
        
        this.hearts = [];
        this.isRunning = false;
        this.animationId = null;
        
        this.colors = this.options.colors || [
            '#FF6B95',
            '#FF8FAB',
            '#FFB3C6',
            '#FF69B4',
            '#FF1493',
            '#DB7093',
            '#FFB6C1',
            '#FFC0CB'
        ];
    }

    HeartCanvas.prototype = {
        constructor: HeartCanvas,

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
                
                self.ctx.clearRect(0, 0, self.width, self.height);
                self.update();
                self.draw();
                
                self.animationId = requestAnimFrame(loop);
            }
            
            loop();
        },

        update: function() {
            if (this.hearts.length < 30 && Math.random() > 0.95) {
                this.spawnHeart();
            }
            
            for (var i = this.hearts.length - 1; i >= 0; i--) {
                var heart = this.hearts[i];
                heart.y -= heart.speed;
                heart.x += Math.sin(heart.time) * heart.swayAmount;
                heart.time += heart.swaySpeed;
                heart.rotation += heart.rotationSpeed;
                
                if (heart.y < this.height * 0.3) {
                    heart.opacity -= 0.01;
                }
                
                if (heart.y < -50 || heart.opacity <= 0) {
                    this.hearts.splice(i, 1);
                }
            }
        },

        draw: function() {
            for (var i = 0; i < this.hearts.length; i++) {
                var heart = this.hearts[i];
                this.drawHeart(heart);
            }
        },

        spawnHeart: function() {
            this.hearts.push({
                x: random(50, this.width - 50),
                y: this.height + 50,
                size: randomFloat(0.3, 0.8),
                speed: randomFloat(1, 3),
                rotation: randomFloat(0, Math.PI * 2),
                rotationSpeed: randomFloat(-0.05, 0.05),
                swayAmount: randomFloat(0.5, 2),
                swaySpeed: randomFloat(0.02, 0.05),
                time: random(0, 1000),
                color: this.colors[random(0, this.colors.length - 1)],
                opacity: randomFloat(0.6, 1)
            });
        },

        drawHeart: function(heart) {
            var ctx = this.ctx;
            var points = generateHeartPoints(heart.size * 20, 0.1);
            
            ctx.save();
            ctx.globalAlpha = heart.opacity;
            ctx.fillStyle = heart.color;
            ctx.translate(heart.x, heart.y);
            ctx.rotate(heart.rotation);
            
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            
            for (var i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },

        resize: function(width, height) {
            this.width = width;
            this.height = height;
            this.canvas.width = width;
            this.canvas.height = height;
        }
    };

    function HeartExplosion(container, x, y, options) {
        this.container = container;
        this.x = x;
        this.y = y;
        this.options = options || {};
        
        this.particles = [];
        this.count = this.options.count || 20;
        this.colors = this.options.colors || [
            '#FF6B95', '#FF8FAB', '#FFB3C6', '#FF69B4',
            '#FF1493', '#DB7093', '#FFB6C1', '#FFC0CB'
        ];
        
        this.createExplosion();
    }

    HeartExplosion.prototype = {
        constructor: HeartExplosion,

        createExplosion: function() {
            for (var i = 0; i < this.count; i++) {
                this.createParticle(i);
            }
        },

        createParticle: function(index) {
            var angle = (index / this.count) * Math.PI * 2;
            var speed = randomFloat(100, 300);
            var size = randomFloat(15, 35);
            var color = this.colors[random(0, this.colors.length - 1)];
            
            var particle = document.createElement('div');
            particle.innerHTML = '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
                '<path fill="' + color + '" d="M16 28.7l-1.4-1.3C6.5 20.2 2 16.1 2 11.2 2 7.1 5.2 4 9.3 4c2.3 0 4.5 1.1 6 2.8C16.8 5.1 19 4 21.3 4 25.4 4 28.6 7.1 28.6 11.2c0 4.9-4.5 9-12.6 16.2L16 28.7z"/>' +
                '</svg>';
            
            particle.style.cssText = 
                'position:absolute;' +
                'width:' + size + 'px;' +
                'height:' + size + 'px;' +
                'left:' + this.x + 'px;' +
                'top:' + this.y + 'px;' +
                'pointer-events:none;' +
                'transform-origin:center;' +
                'z-index:9999;';
            
            this.container.appendChild(particle);
            this.particles.push(particle);
            
            var endX = this.x + Math.cos(angle) * speed;
            var endY = this.y + Math.sin(angle) * speed;
            var rotation = randomFloat(-720, 720);
            var duration = randomFloat(800, 1500);
            
            var self = this;
            
            particle.animate([
                {
                    left: this.x + 'px',
                    top: this.y + 'px',
                    opacity: 1,
                    transform: 'scale(0) rotate(0deg)'
                },
                {
                    left: (this.x + endX) / 2 + 'px',
                    top: (this.y + endY) / 2 - 50 + 'px',
                    opacity: 1,
                    transform: 'scale(1.5) rotate(' + (rotation / 2) + 'deg)',
                    offset: 0.3
                },
                {
                    left: endX + 'px',
                    top: endY + 'px',
                    opacity: 0,
                    transform: 'scale(0.5) rotate(' + rotation + 'deg)'
                }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fill: 'forwards'
            }).onfinish = function() {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
                var idx = self.particles.indexOf(particle);
                if (idx > -1) {
                    self.particles.splice(idx, 1);
                }
            };
        }
    };

    function HeartRain(container, options) {
        this.container = container;
        this.options = options || {};
        
        this.hearts = [];
        this.isRunning = false;
        this.spawnInterval = null;
        
        this.intensity = this.options.intensity || 5;
        this.spawnRate = this.options.spawnRate || 200;
        
        this.colors = this.options.colors || [
            '#FF6B95', '#FF8FAB', '#FFB3C6', '#FF69B4',
            '#FF1493', '#DB7093', '#FFB6C1', '#FFC0CB'
        ];
    }

    HeartRain.prototype = {
        constructor: HeartRain,

        start: function() {
            if (this.isRunning) return;
            
            this.isRunning = true;
            var self = this;
            
            this.spawnInterval = setInterval(function() {
                for (var i = 0; i < self.intensity; i++) {
                    self.spawnHeart();
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

        spawnHeart: function() {
            var size = randomFloat(15, 40);
            var x = random(0, window.innerWidth);
            var duration = randomFloat(3000, 6000);
            var rotation = randomFloat(-360, 360);
            var swayAmount = randomFloat(50, 150);
            var color = this.colors[random(0, this.colors.length - 1)];
            
            var heart = document.createElement('div');
            heart.innerHTML = '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
                '<path fill="' + color + '" d="M16 28.7l-1.4-1.3C6.5 20.2 2 16.1 2 11.2 2 7.1 5.2 4 9.3 4c2.3 0 4.5 1.1 6 2.8C16.8 5.1 19 4 21.3 4 25.4 4 28.6 7.1 28.6 11.2c0 4.9-4.5 9-12.6 16.2L16 28.7z"/>' +
                '</svg>';
            
            heart.style.cssText = 
                'position:fixed;' +
                'width:' + size + 'px;' +
                'height:' + size + 'px;' +
                'left:' + x + 'px;' +
                'top:-50px;' +
                'pointer-events:none;' +
                'z-index:9998;';
            
            this.container.appendChild(heart);
            this.hearts.push(heart);
            
            var self = this;
            var endX = x + randomFloat(-swayAmount, swayAmount);
            
            heart.animate([
                {
                    top: '-50px',
                    left: x + 'px',
                    opacity: randomFloat(0.5, 1),
                    transform: 'rotate(0deg) scale(0.5)'
                },
                {
                    top: (window.innerHeight / 3) + 'px',
                    left: (x + endX) / 2 + 'px',
                    opacity: 1,
                    transform: 'rotate(' + (rotation / 2) + 'deg) scale(1)',
                    offset: 0.3
                },
                {
                    top: (window.innerHeight + 50) + 'px',
                    left: endX + 'px',
                    opacity: 0,
                    transform: 'rotate(' + rotation + 'deg) scale(0.8)'
                }
            ], {
                duration: duration,
                easing: 'linear',
                fill: 'forwards'
            }).onfinish = function() {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
                var idx = self.hearts.indexOf(heart);
                if (idx > -1) {
                    self.hearts.splice(idx, 1);
                }
            };
        },

        clear: function() {
            for (var i = 0; i < this.hearts.length; i++) {
                if (this.hearts[i].parentNode) {
                    this.hearts[i].parentNode.removeChild(this.hearts[i]);
                }
            }
            this.hearts = [];
        }
    };

    function ClickHeart(container) {
        this.container = container || document.body;
        this.isActive = false;
        
        this.colors = [
            '#FF6B95', '#FF8FAB', '#FFB3C6', '#FF69B4',
            '#FF1493', '#DB7093', '#FFB6C1', '#FFC0CB',
            '#E91E63', '#F06292', '#FF4081', '#FF80AB'
        ];
        
        this.emojis = ['❤️', '💖', '💗', '💝', '💕', '💓', '💞', '💘'];
        
        this.handleClick = this.handleClick.bind(this);
    }

    ClickHeart.prototype = {
        constructor: ClickHeart,

        activate: function() {
            if (this.isActive) return;
            this.isActive = true;
            document.addEventListener('click', this.handleClick);
        },

        deactivate: function() {
            this.isActive = false;
            document.removeEventListener('click', this.handleClick);
        },

        handleClick: function(event) {
            this.createHeart(event.clientX, event.clientY);
        },

        createHeart: function(x, y) {
            var useEmoji = random(0, 10) > 6;
            var color = this.colors[random(0, this.colors.length - 1)];
            var emoji = this.emojis[random(0, this.emojis.length - 1)];
            var size = randomFloat(25, 45);
            
            var heart = document.createElement('div');
            
            if (useEmoji) {
                heart.textContent = emoji;
                heart.style.cssText = 
                    'position:fixed;' +
                    'font-size:' + size + 'px;' +
                    'left:' + x + 'px;' +
                    'top:' + y + 'px;' +
                    'pointer-events:none;' +
                    'z-index:99999;' +
                    'transform-origin:center;';
            } else {
                heart.innerHTML = '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
                    '<path fill="' + color + '" d="M16 28.7l-1.4-1.3C6.5 20.2 2 16.1 2 11.2 2 7.1 5.2 4 9.3 4c2.3 0 4.5 1.1 6 2.8C16.8 5.1 19 4 21.3 4 25.4 4 28.6 7.1 28.6 11.2c0 4.9-4.5 9-12.6 16.2L16 28.7z"/>' +
                    '</svg>';
                heart.style.cssText = 
                    'position:fixed;' +
                    'width:' + size + 'px;' +
                    'height:' + size + 'px;' +
                    'left:' + x + 'px;' +
                    'top:' + y + 'px;' +
                    'pointer-events:none;' +
                    'z-index:99999;' +
                    'transform-origin:center;';
            }
            
            this.container.appendChild(heart);
            
            var endY = y - randomFloat(80, 150);
            var endX = x + randomFloat(-40, 40);
            var rotation = randomFloat(-60, 60);
            
            heart.animate([
                {
                    left: x + 'px',
                    top: y + 'px',
                    opacity: 1,
                    transform: 'scale(0) rotate(0deg)'
                },
                {
                    left: (x + endX) / 2 + 'px',
                    top: (y + endY) / 2 + 'px',
                    opacity: 1,
                    transform: 'scale(1.5) rotate(' + (rotation / 2) + 'deg)',
                    offset: 0.4
                },
                {
                    left: endX + 'px',
                    top: endY + 'px',
                    opacity: 0,
                    transform: 'scale(1) rotate(' + rotation + 'deg)'
                }
            ], {
                duration: 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fill: 'forwards'
            }).onfinish = function() {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            };
        }
    };

    window.HeartSystem = HeartSystem;
    window.FloatingHeart = FloatingHeart;
    window.BurstHeart = BurstHeart;
    window.TrailHeart = TrailHeart;
    window.HeartCanvas = HeartCanvas;
    window.HeartExplosion = HeartExplosion;
    window.HeartRain = HeartRain;
    window.ClickHeart = ClickHeart;

})(window);