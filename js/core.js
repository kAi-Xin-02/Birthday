(function(window) {

    var requestAnimFrame = (function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    var cancelAnimFrame = (function() {
        return window.cancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            window.oCancelAnimationFrame ||
            window.msCancelAnimationFrame ||
            function(id) {
                window.clearTimeout(id);
            };
    })();

    function random(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    function randomFloat(min, max) {
        return min + Math.random() * (max - min);
    }

    function randomColor() {
        var colors = [
            '#ff6b95',
            '#ff8fab',
            '#ffb3c6',
            '#ffc2d1',
            '#ff69b4',
            '#ff1493',
            '#db7093',
            '#ff85a2',
            '#ff9eb5',
            '#ffb6c1',
            '#ffa07a',
            '#ff7f50',
            '#ff6347',
            '#ff4500'
        ];
        return colors[random(0, colors.length - 1)];
    }

    function randomHeartColor() {
        var colors = [
            'rgb(255, 107, 149)',
            'rgb(255, 143, 171)',
            'rgb(255, 179, 198)',
            'rgb(255, 105, 180)',
            'rgb(255, 182, 193)',
            'rgb(255, 192, 203)',
            'rgb(255, 174, 185)',
            'rgb(255, 130, 171)',
            'rgb(255, 110, 157)',
            'rgb(255, 99, 132)'
        ];
        return colors[random(0, colors.length - 1)];
    }

    function lerp(start, end, t) {
        return start + (end - start) * t;
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function distance(x1, y1, x2, y2) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    function radToDeg(radians) {
        return radians * 180 / Math.PI;
    }

    function easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function easeOutQuad(t) {
        return t * (2 - t);
    }

    function easeInQuad(t) {
        return t * t;
    }

    function easeOutCubic(t) {
        return (--t) * t * t + 1;
    }

    function easeInCubic(t) {
        return t * t * t;
    }

    function easeOutElastic(t) {
        var p = 0.3;
        return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    }

    function easeOutBounce(t) {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    }

    function bezier(controlPoints, t) {
        var p1 = controlPoints[0].multiply((1 - t) * (1 - t));
        var p2 = controlPoints[1].multiply(2 * t * (1 - t));
        var p3 = controlPoints[2].multiply(t * t);
        return p1.add(p2).add(p3);
    }

    function bezierCubic(controlPoints, t) {
        var p0 = controlPoints[0];
        var p1 = controlPoints[1];
        var p2 = controlPoints[2];
        var p3 = controlPoints[3];
        
        var t2 = t * t;
        var t3 = t2 * t;
        var mt = 1 - t;
        var mt2 = mt * mt;
        var mt3 = mt2 * mt;
        
        var x = mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x;
        var y = mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y;
        
        return new Point(x, y);
    }

    function inHeart(x, y, r) {
        var xx = x / r;
        var yy = y / r;
        var result = (xx * xx + yy * yy - 1);
        result = result * result * result - xx * xx * yy * yy * yy;
        return result < 0;
    }

    function heartShape(t, scale) {
        scale = scale || 1;
        var x = 16 * Math.pow(Math.sin(t), 3);
        var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        return new Point(x * scale, -y * scale);
    }

    function generateHeartPoints(scale, step) {
        scale = scale || 1;
        step = step || 0.1;
        var points = [];
        for (var t = 0; t < Math.PI * 2; t += step) {
            points.push(heartShape(t, scale));
        }
        return points;
    }

    function Point(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    Point.prototype = {
        constructor: Point,

        clone: function() {
            return new Point(this.x, this.y);
        },

        add: function(point) {
            var p = this.clone();
            p.x += point.x;
            p.y += point.y;
            return p;
        },

        subtract: function(point) {
            var p = this.clone();
            p.x -= point.x;
            p.y -= point.y;
            return p;
        },

        sub: function(point) {
            return this.subtract(point);
        },

        multiply: function(scalar) {
            var p = this.clone();
            p.x *= scalar;
            p.y *= scalar;
            return p;
        },

        mul: function(scalar) {
            return this.multiply(scalar);
        },

        divide: function(scalar) {
            var p = this.clone();
            if (scalar !== 0) {
                p.x /= scalar;
                p.y /= scalar;
            }
            return p;
        },

        div: function(scalar) {
            return this.divide(scalar);
        },

        magnitude: function() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        },

        length: function() {
            return this.magnitude();
        },

        normalize: function() {
            var mag = this.magnitude();
            if (mag > 0) {
                return this.divide(mag);
            }
            return this.clone();
        },

        distance: function(point) {
            var dx = this.x - point.x;
            var dy = this.y - point.y;
            return Math.sqrt(dx * dx + dy * dy);
        },

        angle: function() {
            return Math.atan2(this.y, this.x);
        },

        rotate: function(angle) {
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);
            var x = this.x * cos - this.y * sin;
            var y = this.x * sin + this.y * cos;
            return new Point(x, y);
        },

        lerp: function(point, t) {
            return new Point(
                lerp(this.x, point.x, t),
                lerp(this.y, point.y, t)
            );
        },

        equals: function(point) {
            return this.x === point.x && this.y === point.y;
        },

        toString: function() {
            return 'Point(' + this.x + ', ' + this.y + ')';
        }
    };

    function Vector2(x, y) {
        Point.call(this, x, y);
    }

    Vector2.prototype = Object.create(Point.prototype);
    Vector2.prototype.constructor = Vector2;

    Vector2.prototype.dot = function(vector) {
        return this.x * vector.x + this.y * vector.y;
    };

    Vector2.prototype.cross = function(vector) {
        return this.x * vector.y - this.y * vector.x;
    };

    Vector2.prototype.reflect = function(normal) {
        var dot = this.dot(normal);
        return new Vector2(
            this.x - 2 * dot * normal.x,
            this.y - 2 * dot * normal.y
        );
    };

    Vector2.prototype.project = function(vector) {
        var dot = this.dot(vector);
        var len = vector.magnitude();
        var scalar = dot / (len * len);
        return vector.multiply(scalar);
    };

    function Rectangle(x, y, width, height) {
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 0;
        this.height = height || 0;
    }

    Rectangle.prototype = {
        constructor: Rectangle,

        clone: function() {
            return new Rectangle(this.x, this.y, this.width, this.height);
        },

        contains: function(x, y) {
            return x >= this.x && x <= this.x + this.width &&
                   y >= this.y && y <= this.y + this.height;
        },

        containsPoint: function(point) {
            return this.contains(point.x, point.y);
        },

        intersects: function(rect) {
            return this.x < rect.x + rect.width &&
                   this.x + this.width > rect.x &&
                   this.y < rect.y + rect.height &&
                   this.y + this.height > rect.y;
        },

        union: function(rect) {
            var x = Math.min(this.x, rect.x);
            var y = Math.min(this.y, rect.y);
            var width = Math.max(this.x + this.width, rect.x + rect.width) - x;
            var height = Math.max(this.y + this.height, rect.y + rect.height) - y;
            return new Rectangle(x, y, width, height);
        },

        intersection: function(rect) {
            var x = Math.max(this.x, rect.x);
            var y = Math.max(this.y, rect.y);
            var width = Math.min(this.x + this.width, rect.x + rect.width) - x;
            var height = Math.min(this.y + this.height, rect.y + rect.height) - y;
            if (width < 0 || height < 0) {
                return new Rectangle(0, 0, 0, 0);
            }
            return new Rectangle(x, y, width, height);
        },

        center: function() {
            return new Point(
                this.x + this.width / 2,
                this.y + this.height / 2
            );
        },

        toString: function() {
            return 'Rectangle(' + this.x + ', ' + this.y + ', ' + this.width + ', ' + this.height + ')';
        }
    };

    function Color(r, g, b, a) {
        this.r = clamp(r || 0, 0, 255);
        this.g = clamp(g || 0, 0, 255);
        this.b = clamp(b || 0, 0, 255);
        this.a = a !== undefined ? clamp(a, 0, 1) : 1;
    }

    Color.prototype = {
        constructor: Color,

        clone: function() {
            return new Color(this.r, this.g, this.b, this.a);
        },

        toRGB: function() {
            return 'rgb(' + Math.round(this.r) + ', ' + Math.round(this.g) + ', ' + Math.round(this.b) + ')';
        },

        toRGBA: function() {
            return 'rgba(' + Math.round(this.r) + ', ' + Math.round(this.g) + ', ' + Math.round(this.b) + ', ' + this.a + ')';
        },

        toHex: function() {
            var r = Math.round(this.r).toString(16).padStart(2, '0');
            var g = Math.round(this.g).toString(16).padStart(2, '0');
            var b = Math.round(this.b).toString(16).padStart(2, '0');
            return '#' + r + g + b;
        },

        lerp: function(color, t) {
            return new Color(
                lerp(this.r, color.r, t),
                lerp(this.g, color.g, t),
                lerp(this.b, color.b, t),
                lerp(this.a, color.a, t)
            );
        },

        lighten: function(amount) {
            return new Color(
                Math.min(255, this.r + amount),
                Math.min(255, this.g + amount),
                Math.min(255, this.b + amount),
                this.a
            );
        },

        darken: function(amount) {
            return new Color(
                Math.max(0, this.r - amount),
                Math.max(0, this.g - amount),
                Math.max(0, this.b - amount),
                this.a
            );
        },

        toString: function() {
            return this.toRGBA();
        }
    };

    Color.fromHex = function(hex) {
        hex = hex.replace('#', '');
        var r = parseInt(hex.substring(0, 2), 16);
        var g = parseInt(hex.substring(2, 4), 16);
        var b = parseInt(hex.substring(4, 6), 16);
        return new Color(r, g, b);
    };

    Color.fromRGB = function(r, g, b) {
        return new Color(r, g, b);
    };

    Color.random = function() {
        return new Color(random(0, 255), random(0, 255), random(0, 255));
    };

    Color.randomPink = function() {
        return new Color(random(200, 255), random(100, 180), random(150, 200));
    };

    function Timer() {
        this.startTime = 0;
        this.running = false;
        this.elapsed = 0;
    }

    Timer.prototype = {
        constructor: Timer,

        start: function() {
            if (!this.running) {
                this.startTime = Date.now() - this.elapsed;
                this.running = true;
            }
        },

        stop: function() {
            if (this.running) {
                this.elapsed = Date.now() - this.startTime;
                this.running = false;
            }
        },

        reset: function() {
            this.startTime = Date.now();
            this.elapsed = 0;
        },

        getElapsed: function() {
            if (this.running) {
                return Date.now() - this.startTime;
            }
            return this.elapsed;
        },

        getSeconds: function() {
            return this.getElapsed() / 1000;
        }
    };

    function EventEmitter() {
        this.events = {};
    }

    EventEmitter.prototype = {
        constructor: EventEmitter,

        on: function(event, callback) {
            if (!this.events[event]) {
                this.events[event] = [];
            }
            this.events[event].push(callback);
            return this;
        },

        off: function(event, callback) {
            if (this.events[event]) {
                var index = this.events[event].indexOf(callback);
                if (index > -1) {
                    this.events[event].splice(index, 1);
                }
            }
            return this;
        },

        emit: function(event) {
            var args = Array.prototype.slice.call(arguments, 1);
            if (this.events[event]) {
                var callbacks = this.events[event].slice();
                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i].apply(this, args);
                }
            }
            return this;
        },

        once: function(event, callback) {
            var self = this;
            function handler() {
                self.off(event, handler);
                callback.apply(self, arguments);
            }
            return this.on(event, handler);
        }
    };

    function ObjectPool(factory, initialSize) {
        this.factory = factory;
        this.pool = [];
        this.active = [];
        
        initialSize = initialSize || 10;
        for (var i = 0; i < initialSize; i++) {
            this.pool.push(this.factory());
        }
    }

    ObjectPool.prototype = {
        constructor: ObjectPool,

        acquire: function() {
            var obj;
            if (this.pool.length > 0) {
                obj = this.pool.pop();
            } else {
                obj = this.factory();
            }
            this.active.push(obj);
            return obj;
        },

        release: function(obj) {
            var index = this.active.indexOf(obj);
            if (index > -1) {
                this.active.splice(index, 1);
                this.pool.push(obj);
            }
        },

        releaseAll: function() {
            while (this.active.length > 0) {
                this.pool.push(this.active.pop());
            }
        },

        getActiveCount: function() {
            return this.active.length;
        },

        getPoolSize: function() {
            return this.pool.length;
        }
    };

    function detectDevice() {
        var ua = navigator.userAgent || navigator.vendor || window.opera;
        var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        var isIOS = /iPad|iPhone|iPod/.test(ua);
        var isAndroid = /Android/i.test(ua);
        var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        return {
            isMobile: isMobile,
            isIOS: isIOS,
            isAndroid: isAndroid,
            isTouchDevice: isTouchDevice,
            isDesktop: !isMobile,
            pixelRatio: window.devicePixelRatio || 1,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight
        };
    }

    function throttle(func, limit) {
        var inThrottle;
        return function() {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    function debounce(func, wait) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }

    function loadImage(src, callback) {
        var img = new Image();
        img.onload = function() {
            if (callback) callback(null, img);
        };
        img.onerror = function() {
            if (callback) callback(new Error('Failed to load image: ' + src), null);
        };
        img.src = src;
        return img;
    }

    function preloadImages(sources, callback) {
        var loaded = 0;
        var total = sources.length;
        var images = {};
        
        if (total === 0) {
            if (callback) callback(images);
            return;
        }
        
        sources.forEach(function(src) {
            var img = new Image();
            img.onload = function() {
                loaded++;
                images[src] = img;
                if (loaded === total && callback) {
                    callback(images);
                }
            };
            img.onerror = function() {
                loaded++;
                if (loaded === total && callback) {
                    callback(images);
                }
            };
            img.src = src;
        });
    }

    window.requestAnimFrame = requestAnimFrame;
    window.cancelAnimFrame = cancelAnimFrame;
    window.random = random;
    window.randomFloat = randomFloat;
    window.randomColor = randomColor;
    window.randomHeartColor = randomHeartColor;
    window.lerp = lerp;
    window.clamp = clamp;
    window.distance = distance;
    window.degToRad = degToRad;
    window.radToDeg = radToDeg;
    window.easeInOut = easeInOut;
    window.easeOutQuad = easeOutQuad;
    window.easeInQuad = easeInQuad;
    window.easeOutCubic = easeOutCubic;
    window.easeInCubic = easeInCubic;
    window.easeOutElastic = easeOutElastic;
    window.easeOutBounce = easeOutBounce;
    window.bezier = bezier;
    window.bezierCubic = bezierCubic;
    window.inHeart = inHeart;
    window.heartShape = heartShape;
    window.generateHeartPoints = generateHeartPoints;
    window.Point = Point;
    window.Vector2 = Vector2;
    window.Rectangle = Rectangle;
    window.Color = Color;
    window.Timer = Timer;
    window.EventEmitter = EventEmitter;
    window.ObjectPool = ObjectPool;
    window.detectDevice = detectDevice;
    window.throttle = throttle;
    window.debounce = debounce;
    window.loadImage = loadImage;
    window.preloadImages = preloadImages;

})(window);