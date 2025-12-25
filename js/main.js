(function(window, document) {

    var CONFIG = {
        birthDate: new Date('2007-12-26T00:00:00'),
        
        messages: [
            "Hey Vishu! 🎉",
            "Today is an incredibly special day...",
            "You're officially turning 18! Welcome to adulthood!",
            "Eighteen years ago, the world became a much brighter place because you were born.",
            "Every moment since then has been filled with your amazing energy, your beautiful smile, and your wonderful spirit.",
            "As you step into this new chapter of life, remember that you have the power to achieve anything you set your mind to.",
            "Dream big, work hard, stay humble, and never stop being the incredible person you are.",
            "May this new year of your life bring you endless happiness, success, love, and all the wonderful things you deserve.",
            "Here's to new adventures, unforgettable memories, and a future as bright as your smile! ✨",
            "Happy 18th Birthday, Vishu! 🎂💖"
        ],
        
        counterMessage: "You've Been Making The World Brighter For",
        
        colors: {
            hearts: ['#FF6B95', '#FF8FAB', '#FFB3C6', '#FF69B4', '#FF1493', '#DB7093', '#FFB6C1', '#FFC0CB'],
            confetti: ['#FF6B95', '#FFD700', '#00CED1', '#FF69B4', '#7B68EE', '#98FB98', '#FF7F50', '#87CEEB'],
            fireworks: ['#FF6B95', '#FFD700', '#00CED1', '#FF69B4', '#7B68EE', '#FF4500', '#00FF7F', '#FF1493']
        }
    };

    var APP = {
        isInitialized: false,
        isMainPageVisible: false,
        
        elements: {},
        systems: {},
        intervals: {},
        
        device: null
    };

    function init() {
        if (APP.isInitialized) return;
        
        APP.device = detectDevice();
        
        cacheElements();
        
        setupPreloader();
        
        setupEventListeners();
        
        APP.isInitialized = true;
        
        console.log('Birthday App Initialized');
        console.log('Device:', APP.device.isMobile ? 'Mobile' : 'Desktop');
    }

    function cacheElements() {
        APP.elements = {
            preloader: document.getElementById('preloader'),
            loaderBar: document.querySelector('.loader-bar'),
            
            landingPage: document.getElementById('landing-page'),
            enterBtn: document.getElementById('enter-btn'),
            
            mainPage: document.getElementById('main-page'),
            
            header: document.getElementById('header'),
            
            treeCanvas: document.getElementById('tree-canvas'),
            heartsFloatContainer: document.getElementById('hearts-float-container'),
            
            typedMessage: document.getElementById('typed-message'),
            typingCursor: document.querySelector('.typing-cursor'),
            
            counterMessage: document.getElementById('counter-message'),
            counterDays: document.getElementById('counter-days'),
            counterHours: document.getElementById('counter-hours'),
            counterMinutes: document.getElementById('counter-minutes'),
            counterSeconds: document.getElementById('counter-seconds'),
            
            bgParticles: document.getElementById('bg-particles'),
            bgStars: document.getElementById('bg-stars'),
            fireworksContainer: document.getElementById('fireworks-container'),
            balloonsContainer: document.getElementById('balloons-container'),
            confettiContainer: document.getElementById('confetti-container'),
            sparklesContainer: document.getElementById('sparkles-container'),
            
            clickEffect: document.getElementById('click-effect'),
            warningOverlay: document.getElementById('warning-overlay'),
            
            musicBtn: document.getElementById('music-btn')
        };
    }

    function setupPreloader() {
        var progress = 0;
        var preloadInterval = setInterval(function() {
            progress += random(5, 15);
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(preloadInterval);
                
                if (APP.elements.loaderBar) {
                    APP.elements.loaderBar.style.width = '100%';
                }
                
                setTimeout(function() {
                    hidePreloader();
                }, 500);
            } else {
                if (APP.elements.loaderBar) {
                    APP.elements.loaderBar.style.width = progress + '%';
                }
            }
        }, 100);
    }

    function hidePreloader() {
        if (APP.elements.preloader) {
            APP.elements.preloader.classList.add('hidden');
        }
        
        if (APP.elements.landingPage) {
            APP.elements.landingPage.style.display = 'flex';
        }
    }

    function setupEventListeners() {
        if (APP.elements.enterBtn) {
            APP.elements.enterBtn.addEventListener('click', handleEnterClick);
            APP.elements.enterBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                handleEnterClick();
            });
        }
        
        document.addEventListener('click', handleDocumentClick);
        
        window.addEventListener('resize', debounce(handleResize, 250));
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        if (APP.elements.musicBtn) {
            APP.elements.musicBtn.addEventListener('click', toggleMusic);
        }
    }

    function handleEnterClick() {
        if (APP.elements.landingPage) {
            APP.elements.landingPage.classList.add('hidden');
        }
        
        setTimeout(function() {
            showMainPage();
        }, 300);
    }

    function showMainPage() {
        if (APP.isMainPageVisible) return;
        
        APP.isMainPageVisible = true;
        
        if (APP.elements.mainPage) {
            APP.elements.mainPage.classList.add('visible');
        }
        
        setTimeout(function() {
            initializeAllSystems();
        }, 500);
    }

    function initializeAllSystems() {
        initStarField();
        
        setTimeout(function() {
            initTree();
        }, 1000);
        
        setTimeout(function() {
            initHeartSystem();
        }, 2000);
        
        setTimeout(function() {
            initTypewriter();
        }, 3000);
        
        initCounter();
        
        setTimeout(function() {
            initConfetti();
        }, 4000);
        
        setTimeout(function() {
            initBalloons();
        }, 5000);
        
        setTimeout(function() {
            initSparkles();
        }, 3500);
        
        setTimeout(function() {
            initFireworks();
        }, 6000);
        
        initClickHeart();
    }

    function initStarField() {
        if (!APP.elements.bgStars) return;
        
        APP.systems.starField = new StarField(APP.elements.bgStars, {
            count: APP.device.isMobile ? 50 : 100
        });
    }

    function initTree() {
        if (!APP.elements.treeCanvas) return;
        
        var canvas = APP.elements.treeCanvas;
        var container = canvas.parentElement;
        
        var width = container.clientWidth;
        var height = container.clientHeight;
        
        canvas.width = width * (APP.device.pixelRatio || 1);
        canvas.height = height * (APP.device.pixelRatio || 1);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        var ctx = canvas.getContext('2d');
        ctx.scale(APP.device.pixelRatio || 1, APP.device.pixelRatio || 1);
        
        var centerX = width / 2;
        var baseY = height - 30;
        
        APP.systems.tree = new Tree(canvas, {
            seed: {
                x: centerX,
                y: baseY,
                scale: 1,
                color: '#FF6B95'
            },
            branches: generateBranches(centerX, baseY, width, height),
            bloom: {
                num: APP.device.isMobile ? 150 : 300,
                radius: Math.min(width, height) * 0.35
            },
            heartColors: CONFIG.colors.hearts
        });
        
        APP.systems.tree.on('growthComplete', function() {
            console.log('Tree growth complete');
        });
        
        APP.systems.tree.on('bloomsComplete', function() {
            console.log('Blooms complete');
        });
        
        APP.systems.tree.start();
    }

    function generateBranches(centerX, baseY, width, height) {
        var scale = Math.min(width / 400, height / 500);
        
        return [
            {
                start: new Point(centerX, baseY),
                control: new Point(centerX - 10 * scale, baseY - 80 * scale),
                end: new Point(centerX, baseY - 160 * scale),
                radius: 8 * scale,
                length: 80,
                children: [
                    {
                        start: new Point(centerX, baseY - 80 * scale),
                        control: new Point(centerX - 50 * scale, baseY - 110 * scale),
                        end: new Point(centerX - 80 * scale, baseY - 100 * scale),
                        radius: 4 * scale,
                        length: 50,
                        children: []
                    },
                    {
                        start: new Point(centerX, baseY - 80 * scale),
                        control: new Point(centerX + 50 * scale, baseY - 110 * scale),
                        end: new Point(centerX + 80 * scale, baseY - 100 * scale),
                        radius: 4 * scale,
                        length: 50,
                        children: []
                    },
                    {
                        start: new Point(centerX, baseY - 110 * scale),
                        control: new Point(centerX - 60 * scale, baseY - 150 * scale),
                        end: new Point(centerX - 100 * scale, baseY - 140 * scale),
                        radius: 3.5 * scale,
                        length: 45,
                        children: []
                    },
                    {
                        start: new Point(centerX, baseY - 110 * scale),
                        control: new Point(centerX + 60 * scale, baseY - 150 * scale),
                        end: new Point(centerX + 100 * scale, baseY - 140 * scale),
                        radius: 3.5 * scale,
                        length: 45,
                        children: []
                    },
                    {
                        start: new Point(centerX, baseY - 140 * scale),
                        control: new Point(centerX - 40 * scale, baseY - 190 * scale),
                        end: new Point(centerX - 70 * scale, baseY - 200 * scale),
                        radius: 3 * scale,
                        length: 40,
                        children: []
                    },
                    {
                        start: new Point(centerX, baseY - 140 * scale),
                        control: new Point(centerX + 40 * scale, baseY - 190 * scale),
                        end: new Point(centerX + 70 * scale, baseY - 200 * scale),
                        radius: 3 * scale,
                        length: 40,
                        children: []
                    },
                    {
                        start: new Point(centerX, baseY - 160 * scale),
                        control: new Point(centerX - 25 * scale, baseY - 210 * scale),
                        end: new Point(centerX - 40 * scale, baseY - 230 * scale),
                        radius: 2.5 * scale,
                        length: 35,
                        children: []
                    },
                    {
                        start: new Point(centerX, baseY - 160 * scale),
                        control: new Point(centerX + 25 * scale, baseY - 210 * scale),
                        end: new Point(centerX + 40 * scale, baseY - 230 * scale),
                        radius: 2.5 * scale,
                        length: 35,
                        children: []
                    }
                ]
            }
        ];
    }

    function initHeartSystem() {
        if (!APP.elements.heartsFloatContainer) return;
        
        APP.systems.heartSystem = new HeartSystem(APP.elements.heartsFloatContainer, {
            maxHearts: APP.device.isMobile ? 15 : 30,
            spawnRate: APP.device.isMobile ? 800 : 500
        });
        
        APP.systems.heartSystem.start();
    }

    function initTypewriter() {
        if (!APP.elements.typedMessage) return;
        
        APP.systems.typewriter = new MessageTypewriter(APP.elements.typedMessage, CONFIG.messages, {
            speed: 35,
            messageDelay: 1200,
            initialDelay: 500,
            showCursor: true,
            onMessageComplete: function(index, message) {
                console.log('Message ' + (index + 1) + ' complete');
            },
            onAllComplete: function() {
                console.log('All messages complete');
                
                if (APP.elements.typingCursor) {
                    APP.elements.typingCursor.style.display = 'none';
                }
            }
        });
        
        APP.systems.typewriter.start();
    }

    function initCounter() {
        if (APP.elements.counterMessage) {
            APP.elements.counterMessage.textContent = CONFIG.counterMessage;
        }
        
        updateCounter();
        
        APP.intervals.counter = setInterval(updateCounter, 1000);
    }

    function updateCounter() {
        var now = new Date();
        var diff = now - CONFIG.birthDate;
        
        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (APP.elements.counterDays) {
            APP.elements.counterDays.textContent = days.toLocaleString();
        }
        if (APP.elements.counterHours) {
            APP.elements.counterHours.textContent = padZero(hours);
        }
        if (APP.elements.counterMinutes) {
            APP.elements.counterMinutes.textContent = padZero(minutes);
        }
        if (APP.elements.counterSeconds) {
            APP.elements.counterSeconds.textContent = padZero(seconds);
        }
    }

    function padZero(num) {
        return num < 10 ? '0' + num : num.toString();
    }

    function initConfetti() {
        if (!APP.elements.confettiContainer) return;
        
        APP.systems.confetti = new ConfettiSystem(APP.elements.confettiContainer, {
            colors: CONFIG.colors.confetti
        });
        
        APP.systems.confetti.start();
        
        APP.systems.confetti.burst(window.innerWidth / 2, window.innerHeight / 3, 30);
    }

    function initBalloons() {
        if (!APP.elements.balloonsContainer) return;
        
        APP.systems.balloons = new BalloonSystem(APP.elements.balloonsContainer, {
            maxBalloons: APP.device.isMobile ? 5 : 10,
            spawnRate: APP.device.isMobile ? 5000 : 3000
        });
        
        APP.systems.balloons.start();
    }

    function initSparkles() {
        if (!APP.elements.sparklesContainer) return;
        
        APP.systems.sparkles = new SparkleSystem(APP.elements.sparklesContainer, {
            maxSparkles: APP.device.isMobile ? 15 : 30,
            spawnRate: APP.device.isMobile ? 400 : 200
        });
        
        APP.systems.sparkles.start();
    }

    function initFireworks() {
        if (!APP.elements.fireworksContainer) return;
        
        APP.systems.fireworks = new FireworkSystem(APP.elements.fireworksContainer, {
            launchRate: APP.device.isMobile ? 4000 : 2500,
            colors: CONFIG.colors.fireworks
        });
        
        APP.systems.fireworks.start();
    }

    function initClickHeart() {
        if (!APP.elements.clickEffect) return;
        
        APP.systems.clickHeart = new ClickHeart(APP.elements.clickEffect);
        APP.systems.clickHeart.activate();
    }

    function handleDocumentClick(event) {
        if (!APP.isMainPageVisible) return;
        
        if (APP.systems.heartSystem && random(0, 10) > 5) {
            APP.systems.heartSystem.createHeartBurst(event.clientX, event.clientY, random(5, 10));
        }
    }

    function handleResize() {
        if (APP.systems.tree && APP.elements.treeCanvas) {
            var container = APP.elements.treeCanvas.parentElement;
            var width = container.clientWidth;
            var height = container.clientHeight;
            
            APP.elements.treeCanvas.width = width * (APP.device.pixelRatio || 1);
            APP.elements.treeCanvas.height = height * (APP.device.pixelRatio || 1);
            APP.elements.treeCanvas.style.width = width + 'px';
            APP.elements.treeCanvas.style.height = height + 'px';
        }
        
        APP.device = detectDevice();
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            pauseAllSystems();
        } else {
            resumeAllSystems();
        }
    }

    function pauseAllSystems() {
        if (APP.systems.heartSystem) {
            APP.systems.heartSystem.stop();
        }
        if (APP.systems.confetti) {
            APP.systems.confetti.stop();
        }
        if (APP.systems.balloons) {
            APP.systems.balloons.stop();
        }
        if (APP.systems.sparkles) {
            APP.systems.sparkles.stop();
        }
        if (APP.systems.fireworks) {
            APP.systems.fireworks.stop();
        }
        
        if (APP.intervals.counter) {
            clearInterval(APP.intervals.counter);
        }
    }

    function resumeAllSystems() {
        if (APP.systems.heartSystem) {
            APP.systems.heartSystem.start();
        }
        if (APP.systems.confetti) {
            APP.systems.confetti.start();
        }
        if (APP.systems.balloons) {
            APP.systems.balloons.start();
        }
        if (APP.systems.sparkles) {
            APP.systems.sparkles.start();
        }
        if (APP.systems.fireworks) {
            APP.systems.fireworks.start();
        }
        
        APP.intervals.counter = setInterval(updateCounter, 1000);
    }

    function toggleMusic() {
        console.log('Music toggle clicked');
    }

    function addGlobalStyles() {
        var style = document.createElement('style');
        style.textContent = '@keyframes cursorBlink{0%,100%{opacity:1}50%{opacity:0}}@keyframes twinkle{0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}';
        document.head.appendChild(style);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            addGlobalStyles();
            init();
        });
    } else {
        addGlobalStyles();
        init();
    }

    window.BirthdayApp = {
        init: init,
        CONFIG: CONFIG,
        APP: APP
    };

})(window, document);