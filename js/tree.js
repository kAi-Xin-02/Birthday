(function(window) {

    function Tree(canvas, options) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.options = options || {};
        
        this.branches = [];
        this.blooms = [];
        this.bloomsCache = [];
        this.fallingHearts = [];
        this.records = {};
        
        this.animationId = null;
        this.isGrowing = false;
        this.growthComplete = false;
        this.bloomsComplete = false;
        
        this.events = new EventEmitter();
        
        this.initialize();
    }

    Tree.prototype = {
        constructor: Tree,

      initialize: function() {
    this.setupColors();   // gandu errorr
    this.setupSeed();
    this.setupFooter();
    this.setupBranches();
    this.setupBlooms();
},


        setupColors: function() {
            this.colors = {
                trunk: this.options.trunkColor || '#8B4513',
                trunkDark: this.options.trunkDarkColor || '#654321',
                branch: this.options.branchColor || '#A0522D',
                leaf: this.options.leafColor || '#228B22',
                leafLight: this.options.leafLightColor || '#32CD32',
                heart: this.options.heartColor || '#FF69B4',
                heartColors: this.options.heartColors || [
                    '#FF69B4',
                    '#FF1493',
                    '#FF6B95',
                    '#FF8FAB',
                    '#FFB6C1',
                    '#FFC0CB',
                    '#FF85A2',
                    '#FF99AC',
                    '#FFB3C6',
                    '#FFCCD5'
                ]
            };
        },

        setupSeed: function() {
            var seedOptions = this.options.seed || {};
            var x = seedOptions.x || this.width / 2;
            var y = seedOptions.y || this.height - 50;
            
            this.seed = {
                point: new Point(x, y),
                scale: seedOptions.scale || 1,
                color: seedOptions.color || '#FF69B4'
            };
        },

        setupFooter: function() {
            var footerOptions = this.options.footer || {};
            this.footer = {
                width: footerOptions.width || this.width * 0.6,
                height: footerOptions.height || 8,
                speed: footerOptions.speed || 3,
                length: 0,
                point: new Point(this.seed.point.x, this.height - 20),
                color: footerOptions.color || '#8B4513'
            };
        },

        setupBranches: function() {
            var branchConfigs = this.options.branches || this.getDefaultBranches();
            this.branchConfigs = branchConfigs;
            this.branches = [];
            
            for (var i = 0; i < branchConfigs.length; i++) {
                var config = branchConfigs[i];
                this.addBranch(config);
            }
        },

        getDefaultBranches: function() {
            var centerX = this.width / 2;
            var baseY = this.height - 50;
            
            return [
                {
                    start: new Point(centerX, baseY),
                    control: new Point(centerX - 20, baseY - 150),
                    end: new Point(centerX, baseY - 280),
                    radius: 12,
                    length: 120,
                    children: [
                        {
                            start: new Point(centerX, baseY - 150),
                            control: new Point(centerX - 80, baseY - 200),
                            end: new Point(centerX - 120, baseY - 180),
                            radius: 6,
                            length: 80,
                            children: []
                        },
                        {
                            start: new Point(centerX, baseY - 150),
                            control: new Point(centerX + 80, baseY - 200),
                            end: new Point(centerX + 120, baseY - 180),
                            radius: 6,
                            length: 80,
                            children: []
                        },
                        {
                            start: new Point(centerX, baseY - 200),
                            control: new Point(centerX - 100, baseY - 260),
                            end: new Point(centerX - 150, baseY - 250),
                            radius: 5,
                            length: 70,
                            children: []
                        },
                        {
                            start: new Point(centerX, baseY - 200),
                            control: new Point(centerX + 100, baseY - 260),
                            end: new Point(centerX + 150, baseY - 250),
                            radius: 5,
                            length: 70,
                            children: []
                        },
                        {
                            start: new Point(centerX, baseY - 250),
                            control: new Point(centerX - 60, baseY - 320),
                            end: new Point(centerX - 100, baseY - 350),
                            radius: 4,
                            length: 60,
                            children: []
                        },
                        {
                            start: new Point(centerX, baseY - 250),
                            control: new Point(centerX + 60, baseY - 320),
                            end: new Point(centerX + 100, baseY - 350),
                            radius: 4,
                            length: 60,
                            children: []
                        },
                        {
                            start: new Point(centerX, baseY - 280),
                            control: new Point(centerX - 30, baseY - 350),
                            end: new Point(centerX - 50, baseY - 380),
                            radius: 3,
                            length: 50,
                            children: []
                        },
                        {
                            start: new Point(centerX, baseY - 280),
                            control: new Point(centerX + 30, baseY - 350),
                            end: new Point(centerX + 50, baseY - 380),
                            radius: 3,
                            length: 50,
                            children: []
                        }
                    ]
                }
            ];
        },

        addBranch: function(config) {
            var branch = new Branch(this, config);
            this.branches.push(branch);
            return branch;
        },

        removeBranch: function(branch) {
            var index = this.branches.indexOf(branch);
            if (index > -1) {
                this.branches.splice(index, 1);
            }
        },

        setupBlooms: function() {
            var bloomOptions = this.options.bloom || {};
            var numBlooms = bloomOptions.num || 300;
            var heartRadius = bloomOptions.radius || 200;
            
            this.bloomsCache = [];
            
            for (var i = 0; i < numBlooms; i++) {
                var bloom = this.createRandomBloom(heartRadius);
                if (bloom) {
                    this.bloomsCache.push(bloom);
                }
            }
        },

        createRandomBloom: function(heartRadius) {
            var attempts = 0;
            var maxAttempts = 100;
            var centerX = this.width / 2;
            var centerY = this.height / 2 - 50;
            
            while (attempts < maxAttempts) {
                var x = random(centerX - heartRadius, centerX + heartRadius);
                var y = random(centerY - heartRadius, centerY + heartRadius);
                
                var relX = x - centerX;
                var relY = centerY - y;
                
                if (inHeart(relX, relY, heartRadius * 0.8)) {
                    return new Bloom(this, {
                        point: new Point(x, y),
                        color: this.colors.heartColors[random(0, this.colors.heartColors.length - 1)],
                        alpha: randomFloat(0.4, 1),
                        angle: randomFloat(0, Math.PI * 2),
                        scale: 0,
                        targetScale: randomFloat(0.3, 0.8)
                    });
                }
                
                attempts++;
            }
            
            return null;
        },

        addBloom: function(bloom) {
            this.blooms.push(bloom);
        },

        removeBloom: function(bloom) {
            var index = this.blooms.indexOf(bloom);
            if (index > -1) {
                this.blooms.splice(index, 1);
            }
        },

        start: function() {
            if (this.isGrowing) return;
            
            this.isGrowing = true;
            this.events.emit('start');
            this.grow();
        },

        grow: function() {
            var self = this;
            
            function animate() {
                if (!self.isGrowing) return;
                
                self.ctx.clearRect(0, 0, self.width, self.height);
                
                self.drawFooter();
                
                var allBranchesComplete = true;
                for (var i = 0; i < self.branches.length; i++) {
                    var branch = self.branches[i];
                    if (!branch.isComplete) {
                        branch.grow();
                        allBranchesComplete = false;
                    } else {
                        branch.draw();
                    }
                }
                
                if (allBranchesComplete && !self.growthComplete) {
                    self.growthComplete = true;
                    self.events.emit('growthComplete');
                    self.startBlooming();
                }
                
                for (var j = 0; j < self.blooms.length; j++) {
                    self.blooms[j].draw();
                }
                
                self.updateFallingHearts();
                
                self.animationId = requestAnimFrame(animate);
            }
            
            animate();
        },

        startBlooming: function() {
            var self = this;
            var bloomIndex = 0;
            var bloomsPerFrame = 3;
            
            function addBlooms() {
                if (bloomIndex >= self.bloomsCache.length) {
                    self.bloomsComplete = true;
                    self.events.emit('bloomsComplete');
                    self.startFallingHearts();
                    return;
                }
                
                for (var i = 0; i < bloomsPerFrame && bloomIndex < self.bloomsCache.length; i++) {
                    self.addBloom(self.bloomsCache[bloomIndex]);
                    bloomIndex++;
                }
                
                setTimeout(addBlooms, 50);
            }
            
            setTimeout(addBlooms, 500);
        },

        startFallingHearts: function() {
            var self = this;
            
            setInterval(function() {
                if (self.fallingHearts.length < 20) {
                    self.createFallingHeart();
                }
            }, 300);
        },

        createFallingHeart: function() {
            var heart = new FallingHeart(this, {
                x: random(50, this.width - 50),
                y: -50,
                size: randomFloat(0.3, 0.8),
                speed: randomFloat(1, 3),
                rotation: randomFloat(0, Math.PI * 2),
                rotationSpeed: randomFloat(-0.05, 0.05),
                swayAmount: randomFloat(20, 50),
                swaySpeed: randomFloat(0.02, 0.05),
                color: this.colors.heartColors[random(0, this.colors.heartColors.length - 1)]
            });
            
            this.fallingHearts.push(heart);
        },

        updateFallingHearts: function() {
            for (var i = this.fallingHearts.length - 1; i >= 0; i--) {
                var heart = this.fallingHearts[i];
                heart.update();
                heart.draw();
                
                if (heart.y > this.height + 50) {
                    this.fallingHearts.splice(i, 1);
                }
            }
        },

        drawFooter: function() {
            var ctx = this.ctx;
            var footer = this.footer;
            
            if (footer.length < footer.width) {
                footer.length += footer.speed;
            }
            
            var halfLength = footer.length / 2;
            
            ctx.save();
            ctx.strokeStyle = footer.color;
            ctx.lineWidth = footer.height;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(footer.point.x - halfLength, footer.point.y);
            ctx.lineTo(footer.point.x + halfLength, footer.point.y);
            ctx.stroke();
            
            ctx.restore();
        },

        stop: function() {
            this.isGrowing = false;
            if (this.animationId) {
                cancelAnimFrame(this.animationId);
                this.animationId = null;
            }
            this.events.emit('stop');
        },

        reset: function() {
            this.stop();
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            this.branches = [];
            this.blooms = [];
            this.fallingHearts = [];
            this.growthComplete = false;
            this.bloomsComplete = false;
            this.footer.length = 0;
            
            this.setupBranches();
            this.setupBlooms();
            
            this.events.emit('reset');
        },

        resize: function(width, height) {
            this.width = width;
            this.height = height;
            this.canvas.width = width;
            this.canvas.height = height;
            
            this.reset();
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

    function Branch(tree, config) {
        this.tree = tree;
        this.ctx = tree.ctx;
        
        this.start = config.start.clone();
        this.control = config.control.clone();
        this.end = config.end.clone();
        this.radius = config.radius || 8;
        this.length = config.length || 100;
        this.children = config.children || [];
        
        this.currentLength = 0;
        this.currentRadius = this.radius;
        this.radiusDecay = 0.985;
        this.isComplete = false;
        
        this.color = config.color || tree.colors.trunk;
        this.shadowColor = config.shadowColor || 'rgba(0, 0, 0, 0.2)';
        this.shadowBlur = config.shadowBlur || 3;
    }

    Branch.prototype = {
        constructor: Branch,

        grow: function() {
            if (this.isComplete) return;
            
            if (this.currentLength < this.length) {
                var t = this.currentLength / this.length;
                var point = bezier([this.start, this.control, this.end], t);
                
                this.drawSegment(point);
                
                this.currentLength++;
                this.currentRadius *= this.radiusDecay;
            } else {
                this.isComplete = true;
                this.spawnChildren();
            }
        },

        draw: function() {
            var steps = this.length;
            for (var i = 0; i <= steps; i++) {
                var t = i / steps;
                var point = bezier([this.start, this.control, this.end], t);
                var radius = this.radius * Math.pow(this.radiusDecay, i);
                
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.fillStyle = this.color;
                this.ctx.shadowColor = this.shadowColor;
                this.ctx.shadowBlur = this.shadowBlur;
                this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        },

        drawSegment: function(point) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.fillStyle = this.color;
            this.ctx.shadowColor = this.shadowColor;
            this.ctx.shadowBlur = this.shadowBlur;
            this.ctx.arc(point.x, point.y, this.currentRadius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        },

        spawnChildren: function() {
            for (var i = 0; i < this.children.length; i++) {
                var childConfig = this.children[i];
                var child = new Branch(this.tree, childConfig);
                this.tree.addBranch(child);
            }
        }
    };

    function Bloom(tree, config) {
        this.tree = tree;
        this.ctx = tree.ctx;
        
        this.point = config.point.clone();
        this.color = config.color || '#FF69B4';
        this.alpha = config.alpha || 1;
        this.angle = config.angle || 0;
        this.scale = config.scale || 0;
        this.targetScale = config.targetScale || 0.5;
        
        this.growSpeed = config.growSpeed || 0.02;
        this.isComplete = false;
        
        this.heartPoints = generateHeartPoints(1, 0.1);
    }

    Bloom.prototype = {
        constructor: Bloom,

        draw: function() {
            if (this.scale < this.targetScale) {
                this.scale += this.growSpeed;
                if (this.scale > this.targetScale) {
                    this.scale = this.targetScale;
                    this.isComplete = true;
                }
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = this.alpha;
            this.ctx.fillStyle = this.color;
            this.ctx.translate(this.point.x, this.point.y);
            this.ctx.scale(this.scale, this.scale);
            this.ctx.rotate(this.angle);
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            
            for (var i = 0; i < this.heartPoints.length; i++) {
                var p = this.heartPoints[i];
                this.ctx.lineTo(p.x, p.y);
            }
            
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
        }
    };

    function FallingHeart(tree, config) {
        this.tree = tree;
        this.ctx = tree.ctx;
        
        this.x = config.x;
        this.y = config.y;
        this.size = config.size || 0.5;
        this.speed = config.speed || 2;
        this.rotation = config.rotation || 0;
        this.rotationSpeed = config.rotationSpeed || 0.02;
        this.swayAmount = config.swayAmount || 30;
        this.swaySpeed = config.swaySpeed || 0.03;
        this.color = config.color || '#FF69B4';
        this.alpha = config.alpha || randomFloat(0.5, 1);
        
        this.initialX = this.x;
        this.time = random(0, 1000);
        
        this.heartPoints = generateHeartPoints(1, 0.1);
    }

    FallingHeart.prototype = {
        constructor: FallingHeart,

        update: function() {
            this.y += this.speed;
            this.rotation += this.rotationSpeed;
            this.time += this.swaySpeed;
            this.x = this.initialX + Math.sin(this.time) * this.swayAmount;
        },

        draw: function() {
            this.ctx.save();
            this.ctx.globalAlpha = this.alpha;
            this.ctx.fillStyle = this.color;
            this.ctx.translate(this.x, this.y);
            this.ctx.scale(this.size, this.size);
            this.ctx.rotate(this.rotation);
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            
            for (var i = 0; i < this.heartPoints.length; i++) {
                var p = this.heartPoints[i];
                this.ctx.lineTo(p.x, p.y);
            }
            
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
        }
    };

    function Seed(tree, config) {
        this.tree = tree;
        this.ctx = tree.ctx;
        
        this.point = config.point.clone();
        this.scale = config.scale || 1;
        this.color = config.color || '#FF69B4';
        
        this.heartPoints = generateHeartPoints(1, 0.1);
    }

    Seed.prototype = {
        constructor: Seed,

        draw: function() {
            this.ctx.save();
            this.ctx.fillStyle = this.color;
            this.ctx.translate(this.point.x, this.point.y);
            this.ctx.scale(this.scale, this.scale);
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            
            for (var i = 0; i < this.heartPoints.length; i++) {
                var p = this.heartPoints[i];
                this.ctx.lineTo(p.x, p.y);
            }
            
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
        }
    };

    window.Tree = Tree;
    window.Branch = Branch;
    window.Bloom = Bloom;
    window.FallingHeart = FallingHeart;
    window.Seed = Seed;

})(window);