(function(window) {

    function AdvancedTypewriter(element, options) {
        this.element = element;
        this.options = options || {};
        
        this.texts = this.options.texts || [];
        this.speed = this.options.speed || 50;
        this.deleteSpeed = this.options.deleteSpeed || 30;
        this.pauseDuration = this.options.pauseDuration || 2000;
        this.loop = this.options.loop !== false;
        this.cursor = this.options.cursor !== false;
        this.cursorChar = this.options.cursorChar || '|';
        this.cursorClass = this.options.cursorClass || 'typewriter-cursor';
        this.onComplete = this.options.onComplete || null;
        this.onTextComplete = this.options.onTextComplete || null;
        this.onCharacter = this.options.onCharacter || null;
        
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isTyping = false;
        this.isDeleting = false;
        this.isPaused = false;
        this.timeoutId = null;
        
        this.cursorElement = null;
        this.textElement = null;
        
        this.initialize();
    }

    AdvancedTypewriter.prototype = {
        constructor: AdvancedTypewriter,

        initialize: function() {
            this.element.innerHTML = '';
            
            this.textElement = document.createElement('span');
            this.textElement.className = 'typewriter-text';
            this.element.appendChild(this.textElement);
            
            if (this.cursor) {
                this.cursorElement = document.createElement('span');
                this.cursorElement.className = this.cursorClass;
                this.cursorElement.textContent = this.cursorChar;
                this.cursorElement.style.cssText = 
                    'display:inline-block;' +
                    'margin-left:2px;' +
                    'animation:cursorBlink 0.7s infinite;';
                this.element.appendChild(this.cursorElement);
            }
        },

        start: function() {
            if (this.isTyping) return;
            
            this.isTyping = true;
            this.type();
        },

        stop: function() {
            this.isTyping = false;
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
        },

        pause: function() {
            this.isPaused = true;
        },

        resume: function() {
            this.isPaused = false;
            if (this.isTyping) {
                this.type();
            }
        },

        type: function() {
            if (!this.isTyping || this.isPaused) return;
            
            var self = this;
            var currentText = this.texts[this.currentTextIndex];
            
            if (!currentText) {
                this.complete();
                return;
            }
            
            if (this.isDeleting) {
                this.deleteChar();
            } else {
                this.typeChar();
            }
        },

        typeChar: function() {
            var self = this;
            var currentText = this.texts[this.currentTextIndex];
            
            if (this.currentCharIndex < currentText.length) {
                var char = currentText.charAt(this.currentCharIndex);
                
                if (char === '<') {
                    var endIndex = currentText.indexOf('>', this.currentCharIndex);
                    if (endIndex !== -1) {
                        var tag = currentText.substring(this.currentCharIndex, endIndex + 1);
                        this.textElement.innerHTML += tag;
                        this.currentCharIndex = endIndex + 1;
                    } else {
                        this.textElement.innerHTML += char;
                        this.currentCharIndex++;
                    }
                } else if (char === '&') {
                    var semicolonIndex = currentText.indexOf(';', this.currentCharIndex);
                    if (semicolonIndex !== -1 && semicolonIndex - this.currentCharIndex < 10) {
                        var entity = currentText.substring(this.currentCharIndex, semicolonIndex + 1);
                        this.textElement.innerHTML += entity;
                        this.currentCharIndex = semicolonIndex + 1;
                    } else {
                        this.textElement.innerHTML += char;
                        this.currentCharIndex++;
                    }
                } else {
                    this.textElement.innerHTML += char;
                    this.currentCharIndex++;
                }
                
                if (this.onCharacter) {
                    this.onCharacter(char, this.currentCharIndex, this.currentTextIndex);
                }
                
                var delay = this.speed;
                if (char === '.' || char === '!' || char === '?') {
                    delay = this.speed * 5;
                } else if (char === ',') {
                    delay = this.speed * 3;
                }
                
                this.timeoutId = setTimeout(function() {
                    self.type();
                }, delay);
            } else {
                if (this.onTextComplete) {
                    this.onTextComplete(this.currentTextIndex, currentText);
                }
                
                if (this.currentTextIndex < this.texts.length - 1 || this.loop) {
                    this.timeoutId = setTimeout(function() {
                        self.isDeleting = true;
                        self.type();
                    }, this.pauseDuration);
                } else {
                    this.complete();
                }
            }
        },

        deleteChar: function() {
            var self = this;
            var text = this.textElement.innerHTML;
            
            if (text.length > 0) {
                var lastChar = text.charAt(text.length - 1);
                
                if (lastChar === '>') {
                    var startIndex = text.lastIndexOf('<');
                    if (startIndex !== -1) {
                        this.textElement.innerHTML = text.substring(0, startIndex);
                    } else {
                        this.textElement.innerHTML = text.substring(0, text.length - 1);
                    }
                } else if (lastChar === ';') {
                    var ampIndex = text.lastIndexOf('&');
                    if (ampIndex !== -1 && text.length - ampIndex < 10) {
                        this.textElement.innerHTML = text.substring(0, ampIndex);
                    } else {
                        this.textElement.innerHTML = text.substring(0, text.length - 1);
                    }
                } else {
                    this.textElement.innerHTML = text.substring(0, text.length - 1);
                }
                
                this.timeoutId = setTimeout(function() {
                    self.type();
                }, this.deleteSpeed);
            } else {
                this.isDeleting = false;
                this.currentCharIndex = 0;
                
                if (this.loop) {
                    this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
                } else {
                    this.currentTextIndex++;
                }
                
                this.timeoutId = setTimeout(function() {
                    self.type();
                }, 500);
            }
        },

        complete: function() {
            this.isTyping = false;
            
            if (this.cursorElement) {
                this.cursorElement.style.animation = 'none';
                this.cursorElement.style.opacity = '0';
            }
            
            if (this.onComplete) {
                this.onComplete();
            }
        },

        reset: function() {
            this.stop();
            this.currentTextIndex = 0;
            this.currentCharIndex = 0;
            this.isDeleting = false;
            this.textElement.innerHTML = '';
            
            if (this.cursorElement) {
                this.cursorElement.style.animation = 'cursorBlink 0.7s infinite';
                this.cursorElement.style.opacity = '1';
            }
        },

        setText: function(texts) {
            this.texts = Array.isArray(texts) ? texts : [texts];
            this.reset();
        },

        getCurrentText: function() {
            return this.texts[this.currentTextIndex] || '';
        },

        getDisplayedText: function() {
            return this.textElement.innerHTML;
        }
    };

    function MessageTypewriter(element, messages, options) {
        this.element = element;
        this.messages = messages || [];
        this.options = options || {};
        
        this.speed = this.options.speed || 40;
        this.messageDelay = this.options.messageDelay || 1500;
        this.initialDelay = this.options.initialDelay || 500;
        this.showCursor = this.options.showCursor !== false;
        this.cursorChar = this.options.cursorChar || '|';
        this.onMessageComplete = this.options.onMessageComplete || null;
        this.onAllComplete = this.options.onAllComplete || null;
        this.onStart = this.options.onStart || null;
        
        this.currentMessageIndex = 0;
        this.currentCharIndex = 0;
        this.isTyping = false;
        this.displayedContent = '';
        
        this.textContainer = null;
        this.cursorElement = null;
        
        this.initialize();
    }

    MessageTypewriter.prototype = {
        constructor: MessageTypewriter,

        initialize: function() {
            this.element.innerHTML = '';
            
            this.textContainer = document.createElement('div');
            this.textContainer.className = 'message-typewriter-content';
            this.textContainer.style.cssText = 
                'display:inline;' +
                'white-space:pre-wrap;' +
                'word-wrap:break-word;';
            this.element.appendChild(this.textContainer);
            
            if (this.showCursor) {
                this.cursorElement = document.createElement('span');
                this.cursorElement.className = 'message-typewriter-cursor';
                this.cursorElement.textContent = this.cursorChar;
                this.cursorElement.style.cssText = 
                    'display:inline-block;' +
                    'width:3px;' +
                    'height:1.2em;' +
                    'background:currentColor;' +
                    'margin-left:2px;' +
                    'vertical-align:text-bottom;' +
                    'animation:cursorBlink 0.7s infinite;';
                this.element.appendChild(this.cursorElement);
            }
        },

        start: function() {
            if (this.isTyping) return;
            
            this.isTyping = true;
            
            if (this.onStart) {
                this.onStart();
            }
            
            var self = this;
            setTimeout(function() {
                self.typeNextMessage();
            }, this.initialDelay);
        },

        typeNextMessage: function() {
            if (!this.isTyping) return;
            
            if (this.currentMessageIndex >= this.messages.length) {
                this.complete();
                return;
            }
            
            this.currentCharIndex = 0;
            this.typeCharacter();
        },

        typeCharacter: function() {
            if (!this.isTyping) return;
            
            var self = this;
            var message = this.messages[this.currentMessageIndex];
            
            if (this.currentCharIndex < message.length) {
                var char = message.charAt(this.currentCharIndex);
                
                if (char === '<') {
                    var endIndex = message.indexOf('>', this.currentCharIndex);
                    if (endIndex !== -1) {
                        var tag = message.substring(this.currentCharIndex, endIndex + 1);
                        this.displayedContent += tag;
                        this.currentCharIndex = endIndex + 1;
                    } else {
                        this.displayedContent += char;
                        this.currentCharIndex++;
                    }
                } else {
                    this.displayedContent += char;
                    this.currentCharIndex++;
                }
                
                this.textContainer.innerHTML = this.displayedContent;
                
                var delay = this.speed;
                if (char === '.' || char === '!' || char === '?') {
                    delay = this.speed * 6;
                } else if (char === ',') {
                    delay = this.speed * 3;
                } else if (char === ' ') {
                    delay = this.speed * 0.5;
                }
                
                setTimeout(function() {
                    self.typeCharacter();
                }, delay);
            } else {
                if (this.onMessageComplete) {
                    this.onMessageComplete(this.currentMessageIndex, message);
                }
                
                this.currentMessageIndex++;
                
                if (this.currentMessageIndex < this.messages.length) {
                    this.displayedContent += '<br><br>';
                    this.textContainer.innerHTML = this.displayedContent;
                    
                    setTimeout(function() {
                        self.typeNextMessage();
                    }, this.messageDelay);
                } else {
                    this.complete();
                }
            }
        },

        complete: function() {
            this.isTyping = false;
            
            if (this.cursorElement) {
                this.cursorElement.style.display = 'none';
            }
            
            if (this.onAllComplete) {
                this.onAllComplete();
            }
        },

        stop: function() {
            this.isTyping = false;
        },

        reset: function() {
            this.stop();
            this.currentMessageIndex = 0;
            this.currentCharIndex = 0;
            this.displayedContent = '';
            this.textContainer.innerHTML = '';
            
            if (this.cursorElement) {
                this.cursorElement.style.display = 'inline-block';
            }
        },

        skip: function() {
            this.stop();
            
            this.displayedContent = this.messages.join('<br><br>');
            this.textContainer.innerHTML = this.displayedContent;
            this.currentMessageIndex = this.messages.length;
            
            this.complete();
        }
    };

    function LetterReveal(element, options) {
        this.element = element;
        this.options = options || {};
        
        this.text = this.options.text || element.textContent;
        this.delay = this.options.delay || 50;
        this.initialDelay = this.options.initialDelay || 0;
        this.animation = this.options.animation || 'fadeIn';
        this.stagger = this.options.stagger || 30;
        this.onComplete = this.options.onComplete || null;
        
        this.letters = [];
        this.isRevealing = false;
    }

    LetterReveal.prototype = {
        constructor: LetterReveal,

        initialize: function() {
            this.element.innerHTML = '';
            this.letters = [];
            
            for (var i = 0; i < this.text.length; i++) {
                var char = this.text.charAt(i);
                var span = document.createElement('span');
                
                if (char === ' ') {
                    span.innerHTML = '&nbsp;';
                } else {
                    span.textContent = char;
                }
                
                span.style.cssText = 
                    'display:inline-block;' +
                    'opacity:0;' +
                    'transform:translateY(-20px);';
                
                this.element.appendChild(span);
                this.letters.push(span);
            }
        },

        start: function() {
            if (this.isRevealing) return;
            
            this.isRevealing = true;
            this.initialize();
            
            var self = this;
            
            setTimeout(function() {
                self.revealLetters();
            }, this.initialDelay);
        },

        revealLetters: function() {
            var self = this;
            var completedCount = 0;
            
            this.letters.forEach(function(letter, index) {
                setTimeout(function() {
                    self.revealLetter(letter);
                    completedCount++;
                    
                    if (completedCount === self.letters.length) {
                        self.isRevealing = false;
                        if (self.onComplete) {
                            self.onComplete();
                        }
                    }
                }, index * self.stagger);
            });
        },

        revealLetter: function(letter) {
            var animation = this.getAnimation();
            
            letter.animate(animation.keyframes, {
                duration: animation.duration,
                easing: animation.easing,
                fill: 'forwards'
            });
        },

        getAnimation: function() {
            var animations = {
                fadeIn: {
                    keyframes: [
                        { opacity: 0, transform: 'translateY(-20px)' },
                        { opacity: 1, transform: 'translateY(0)' }
                    ],
                    duration: 400,
                    easing: 'ease-out'
                },
                slideUp: {
                    keyframes: [
                        { opacity: 0, transform: 'translateY(30px)' },
                        { opacity: 1, transform: 'translateY(0)' }
                    ],
                    duration: 500,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                },
                scaleIn: {
                    keyframes: [
                        { opacity: 0, transform: 'scale(0)' },
                        { opacity: 1, transform: 'scale(1)' }
                    ],
                    duration: 400,
                    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                },
                rotateIn: {
                    keyframes: [
                        { opacity: 0, transform: 'rotate(-180deg) scale(0)' },
                        { opacity: 1, transform: 'rotate(0deg) scale(1)' }
                    ],
                    duration: 600,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                },
                bounceIn: {
                    keyframes: [
                        { opacity: 0, transform: 'scale(0.3)' },
                        { opacity: 0.9, transform: 'scale(1.1)' },
                        { opacity: 1, transform: 'scale(1)' }
                    ],
                    duration: 500,
                    easing: 'ease-out'
                }
            };
            
            return animations[this.animation] || animations.fadeIn;
        },

        reset: function() {
            this.isRevealing = false;
            this.element.innerHTML = '';
            this.letters = [];
        }
    };

    function WordReveal(element, options) {
        this.element = element;
        this.options = options || {};
        
        this.text = this.options.text || element.textContent;
        this.delimiter = this.options.delimiter || ' ';
        this.stagger = this.options.stagger || 100;
        this.initialDelay = this.options.initialDelay || 0;
        this.animation = this.options.animation || 'fadeSlide';
        this.onComplete = this.options.onComplete || null;
        
        this.words = [];
        this.isRevealing = false;
    }

    WordReveal.prototype = {
        constructor: WordReveal,

        initialize: function() {
            this.element.innerHTML = '';
            this.words = [];
            
            var wordStrings = this.text.split(this.delimiter);
            
            for (var i = 0; i < wordStrings.length; i++) {
                var span = document.createElement('span');
                span.textContent = wordStrings[i];
                span.style.cssText = 
                    'display:inline-block;' +
                    'opacity:0;' +
                    'transform:translateY(20px);' +
                    'margin-right:0.3em;';
                
                this.element.appendChild(span);
                this.words.push(span);
            }
        },

        start: function() {
            if (this.isRevealing) return;
            
            this.isRevealing = true;
            this.initialize();
            
            var self = this;
            
            setTimeout(function() {
                self.revealWords();
            }, this.initialDelay);
        },

        revealWords: function() {
            var self = this;
            var completedCount = 0;
            
            this.words.forEach(function(word, index) {
                setTimeout(function() {
                    self.revealWord(word);
                    completedCount++;
                    
                    if (completedCount === self.words.length) {
                        self.isRevealing = false;
                        if (self.onComplete) {
                            self.onComplete();
                        }
                    }
                }, index * self.stagger);
            });
        },

        revealWord: function(word) {
            word.animate([
                { opacity: 0, transform: 'translateY(20px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], {
                duration: 500,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fill: 'forwards'
            });
        },

        reset: function() {
            this.isRevealing = false;
            this.element.innerHTML = '';
            this.words = [];
        }
    };

    function CountingNumber(element, options) {
        this.element = element;
        this.options = options || {};
        
        this.start = this.options.start || 0;
        this.end = this.options.end || 100;
        this.duration = this.options.duration || 2000;
        this.delay = this.options.delay || 0;
        this.easing = this.options.easing || 'easeOutQuad';
        this.prefix = this.options.prefix || '';
        this.suffix = this.options.suffix || '';
        this.separator = this.options.separator || ',';
        this.decimal = this.options.decimal || 0;
        this.onComplete = this.options.onComplete || null;
        this.onUpdate = this.options.onUpdate || null;
        
        this.current = this.start;
        this.isCounting = false;
        this.startTime = null;
    }

    CountingNumber.prototype = {
        constructor: CountingNumber,

        startCount: function() {
            if (this.isCounting) return;
            
            var self = this;
            
            setTimeout(function() {
                self.isCounting = true;
                self.startTime = Date.now();
                self.animate();
            }, this.delay);
        },

        animate: function() {
            if (!this.isCounting) return;
            
            var self = this;
            var elapsed = Date.now() - this.startTime;
            var progress = Math.min(elapsed / this.duration, 1);
            var easedProgress = this.getEasedProgress(progress);
            
            this.current = this.start + (this.end - this.start) * easedProgress;
            this.updateDisplay();
            
            if (this.onUpdate) {
                this.onUpdate(this.current, progress);
            }
            
            if (progress < 1) {
                requestAnimFrame(function() {
                    self.animate();
                });
            } else {
                this.current = this.end;
                this.updateDisplay();
                this.isCounting = false;
                
                if (this.onComplete) {
                    this.onComplete(this.end);
                }
            }
        },

        getEasedProgress: function(t) {
            switch (this.easing) {
                case 'linear':
                    return t;
                case 'easeInQuad':
                    return t * t;
                case 'easeOutQuad':
                    return t * (2 - t);
                case 'easeInOutQuad':
                    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                case 'easeOutCubic':
                    return (--t) * t * t + 1;
                case 'easeOutElastic':
                    var p = 0.3;
                    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
                default:
                    return t * (2 - t);
            }
        },

        updateDisplay: function() {
            var value = this.decimal > 0 
                ? this.current.toFixed(this.decimal) 
                : Math.round(this.current);
            
            if (this.separator) {
                value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, this.separator);
            }
            
            this.element.textContent = this.prefix + value + this.suffix;
        },

        reset: function() {
            this.isCounting = false;
            this.current = this.start;
            this.startTime = null;
            this.updateDisplay();
        },

        setEnd: function(end) {
            this.end = end;
        }
    };

    function TextScramble(element, options) {
        this.element = element;
        this.options = options || {};
        
        this.chars = this.options.chars || '!<>-_\\/[]{}—=+*^?#________';
        this.speed = this.options.speed || 30;
        this.onComplete = this.options.onComplete || null;
        
        this.queue = [];
        this.frame = 0;
        this.frameRequest = null;
        this.resolve = null;
    }

    TextScramble.prototype = {
        constructor: TextScramble,

        setText: function(newText) {
            var self = this;
            var oldText = this.element.textContent;
            var length = Math.max(oldText.length, newText.length);
            
            return new Promise(function(resolve) {
                self.resolve = resolve;
                self.queue = [];
                
                for (var i = 0; i < length; i++) {
                    var from = oldText[i] || '';
                    var to = newText[i] || '';
                    var start = Math.floor(Math.random() * 40);
                    var end = start + Math.floor(Math.random() * 40);
                    
                    self.queue.push({
                        from: from,
                        to: to,
                        start: start,
                        end: end,
                        char: ''
                    });
                }
                
                cancelAnimFrame(self.frameRequest);
                self.frame = 0;
                self.update();
            });
        },

        update: function() {
            var self = this;
            var output = '';
            var complete = 0;
            
            for (var i = 0; i < this.queue.length; i++) {
                var item = this.queue[i];
                var from = item.from;
                var to = item.to;
                var start = item.start;
                var end = item.end;
                
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!item.char || Math.random() < 0.28) {
                        item.char = this.randomChar();
                    }
                    output += '<span style="color:#FFD700;">' + item.char + '</span>';
                } else {
                    output += from;
                }
            }
            
            this.element.innerHTML = output;
            
            if (complete === this.queue.length) {
                if (this.onComplete) {
                    this.onComplete();
                }
                this.resolve();
            } else {
                this.frameRequest = requestAnimFrame(function() {
                    self.update();
                });
                this.frame++;
            }
        },

        randomChar: function() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    };

    window.AdvancedTypewriter = AdvancedTypewriter;
    window.MessageTypewriter = MessageTypewriter;
    window.LetterReveal = LetterReveal;
    window.WordReveal = WordReveal;
    window.CountingNumber = CountingNumber;
    window.TextScramble = TextScramble;

})(window);