// =========================================
// 0. FORCE SCROLL TO TOP ON REFRESH
// =========================================
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// --- CONFIGURATION ---
const totalFrames = 21; 
const folderPath = 'animation/'; 
const animationDuration = 1500; 
const holdDuration = 200;       

// --- ELEMENTS ---
const loader = document.getElementById('loader');
const logoBase = document.getElementById('logo-base'); 
const logoText = document.getElementById('logo-text'); 
const progressLine = document.getElementById('progress-line');
const progressText = document.getElementById('progress-text');
const frameImage = document.getElementById('sequence-frame');
const skipBtn = document.querySelector('.skip-btn');
const scrollTrack = document.getElementById('scroll-track');
const animationContainer = document.getElementById('image-sequence-container');
const mainScreen = document.getElementById('main-screen'); 

// --- STATE ---
let validFrames = {}; 
let imagesLoadedCount = 0;
let startTime = null;
let isMinTimePassed = false;
let isTicking = false;
let isAutoPlaying = false;
let isPortfolioMode = false;
let isRestoringSession = false;

// =========================================
// 1. SAVE SCROLL POSITION BEFORE LEAVING
// =========================================
const saveScrollPosition = () => {
    if (isPortfolioMode) {
        sessionStorage.setItem('scrollPos', window.scrollY);
    }
};

window.addEventListener('beforeunload', saveScrollPosition);
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveScrollPosition();
});

// =========================================
// 2. SESSION MEMORY (THE BACK BUTTON FIX)
// =========================================
function checkSessionMemory() {
    if (sessionStorage.getItem('portfolioUnlocked') === 'true') {
        isRestoringSession = true;

        loader.style.display = 'none';
        scrollTrack.style.display = 'none';
        animationContainer.style.display = 'none';
        skipBtn.classList.add('exit');
        isPortfolioMode = true;
        
        const savedCategory = sessionStorage.getItem('openCategory');
        if (savedCategory) {
            const categoryBtn = document.querySelector(`.portfolio-item[data-category="${savedCategory}"]`);
            if (categoryBtn) {
                categoryBtn.click(); 
            }
        }

        const savedScroll = sessionStorage.getItem('scrollPos');
        if (savedScroll) {
            setTimeout(() => {
                window.scrollTo({ top: parseInt(savedScroll, 10), left: 0, behavior: 'instant' });
            }, 100);
        } else {
            window.scrollTo(0, 0); 
        }
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.documentElement.classList.add('page-ready');
                isRestoringSession = false; 
            });
        });
        
        // SHOW TOP BRANDING
        const topBranding = document.getElementById('top-branding');
        if (topBranding) topBranding.classList.add('visible');
        
        return true; 
    }
    return false;
}

// =========================================
// 3. SMART PRELOADER
// =========================================
function preloadImages() {
    for (let i = 1; i <= totalFrames; i++) {
        findImage(i);
    }
}

function findImage(index) {
    const tryJpg = new Image();
    tryJpg.src = `${folderPath}${index}.jpg`;
    tryJpg.onload = () => { markImageAsLoaded(index, tryJpg.src); };
    tryJpg.onerror = () => {
        const tryJpeg = new Image();
        tryJpeg.src = `${folderPath}${index}.jpeg`;
        tryJpeg.onload = () => { markImageAsLoaded(index, tryJpeg.src); };
        tryJpeg.onerror = () => {
            const tryPng = new Image();
            tryPng.src = `${folderPath}${index}.png`;
            tryPng.onload = () => { markImageAsLoaded(index, tryPng.src); };
            tryPng.onerror = () => {
                if (index === 1) console.error("Frame 1 missing.");
                markImageAsLoaded(index, null);
            };
        };
    };
}

function markImageAsLoaded(index, path) {
    if (path) {
        validFrames[index] = path;
        const hiddenImg = new Image();
        hiddenImg.src = path; 
        if (index === 1) frameImage.src = path;
    }
    imagesLoadedCount++;
    checkCompletion();
}

// =========================================
// 4. LOADING SCREEN
// =========================================
function startLoadingAnimation(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    
    let progress = elapsed / animationDuration;
    if (progress > 1) progress = 1;

    progressLine.style.width = `${progress * 100}%`;
    progressText.innerText = `${Math.floor(progress * 100)}%`;
    logoText.style.opacity = 0.1 + (0.9 * progress); 
    logoBase.style.opacity = 1.0 - (0.9 * progress); 

    if (progress < 1) {
        requestAnimationFrame(startLoadingAnimation);
    } else {
        isMinTimePassed = true;
        checkCompletion();
    }
}

function checkCompletion() {
    if (!isMinTimePassed) return;
    const threshold = totalFrames * 0.9;
    
    if (imagesLoadedCount >= threshold) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, holdDuration);
    }
}

// =========================================
// 5. SCROLL LOGIC
// =========================================
window.addEventListener('scroll', () => {
    if (isPortfolioMode) return;

    if (!isTicking) {
        window.requestAnimationFrame(() => {
            updateFrame();
            isTicking = false;
        });
        isTicking = true;
    }
}, { passive: true });

function updateFrame() {
    if (isAutoPlaying) {
         const rect = mainScreen.getBoundingClientRect();
         if (rect.top <= 0) {
             enterPortfolioMode();
             isAutoPlaying = false; 
         }
         return; 
    }

    const scrollTop = window.scrollY;
    
    if (!scrollTrack || scrollTrack.style.display === 'none') return;
    const trackHeight = scrollTrack.offsetHeight - window.innerHeight;
    let scrollFraction = scrollTop / trackHeight;

    let frameIndex;
    if (scrollFraction <= 0.85) {
        let animProgress = scrollFraction / 0.85;
        frameIndex = Math.ceil(animProgress * totalFrames);
        if (frameIndex < 1) frameIndex = 1;
        if (frameIndex > totalFrames) frameIndex = totalFrames;
        
        animationContainer.style.transform = `scale(1)`;
        animationContainer.style.filter = `brightness(1)`;
    } else {
        frameIndex = totalFrames; 
        
        let dimProgress = (scrollFraction - 0.85) / 0.15;
        if (dimProgress > 1) dimProgress = 1;
        
        const bgScale = 1 - (0.05 * dimProgress);
        const bgBrightness = 1 - (0.2 * dimProgress);
        animationContainer.style.transform = `scale(${bgScale})`;
        animationContainer.style.filter = `brightness(${bgBrightness})`;
    }

    const path = validFrames[frameIndex];
    if (path && !frameImage.src.includes(path)) {
        frameImage.src = path;
    }

    if (scrollFraction > 0.85) {
        skipBtn.classList.add('exit');
    } else {
        skipBtn.classList.remove('exit');
    }

    const rect = mainScreen.getBoundingClientRect();
    if (rect.top <= 0) { 
        enterPortfolioMode();
        return; 
    }
}

// =========================================
// 6. LOCK MODE
// =========================================
function enterPortfolioMode() {
    if (isPortfolioMode) return; 
    isPortfolioMode = true;
    
    sessionStorage.setItem('portfolioUnlocked', 'true');
    
    if (!sessionStorage.getItem('openCategory')) {
        if (window.innerWidth <= 900) {
            sessionStorage.setItem('openCategory', 'creative-direction');
        }
    }
    
    skipBtn.classList.add('exit');
    scrollTrack.style.display = 'none';
    animationContainer.style.display = 'none';
    
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
    });

    // SHOW TOP BRANDING
    const topBranding = document.getElementById('top-branding');
    if (topBranding) topBranding.classList.add('visible');
}

// =========================================
// 7. ARROWS (KEYBOARD)
// =========================================
window.addEventListener('keydown', (e) => {
    if (isAutoPlaying || isPortfolioMode) return; 

    const trackHeight = scrollTrack.offsetHeight - window.innerHeight;
    const step = trackHeight / totalFrames; 

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        window.scrollBy({ top: step, behavior: 'smooth' });
    } 
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        window.scrollBy({ top: -step, behavior: 'smooth' });
    }
});

// =========================================
// 8. SKIP BUTTON (2500ms LINEAR)
// =========================================
skipBtn.addEventListener('click', (e) => {
    e.preventDefault(); 
    if (isAutoPlaying || isPortfolioMode) return; 
    isAutoPlaying = true;

    const startY = window.scrollY;
    const trackHeight = scrollTrack.offsetHeight; 
    const endY = trackHeight - window.innerHeight + 10; 
    const distance = endY - startY;
    
    const duration = 2500; 
    let startTime = null;

    function animateScroll(currentTime) {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        
        const progress = Math.min(timeElapsed / duration, 1);
        const nextScroll = startY + (distance * progress);
        
        window.scrollTo(0, nextScroll);
        
        updateFrameManual(nextScroll, trackHeight - window.innerHeight);

        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        } else {
            isAutoPlaying = false;
            enterPortfolioMode();
        }
    }

    requestAnimationFrame(animateScroll);
});

function updateFrameManual(scrollTop, maxScroll) {
    let scrollFraction = scrollTop / maxScroll;
    
    let frameIndex;
    if (scrollFraction <= 0.85) {
        let animProgress = scrollFraction / 0.85;
        frameIndex = Math.ceil(animProgress * totalFrames);
        if (frameIndex < 1) frameIndex = 1;
        if (frameIndex > totalFrames) frameIndex = totalFrames;
        
        animationContainer.style.transform = `scale(1)`;
        animationContainer.style.filter = `brightness(1)`;
    } else {
        frameIndex = totalFrames;
        let dimProgress = (scrollFraction - 0.85) / 0.15;
        if (dimProgress > 1) dimProgress = 1;
        
        const bgScale = 1 - (0.05 * dimProgress);
        const bgBrightness = 1 - (0.2 * dimProgress);
        animationContainer.style.transform = `scale(${bgScale})`;
        animationContainer.style.filter = `brightness(${bgBrightness})`;
    }

    const path = validFrames[frameIndex];
    if (path && !frameImage.src.includes(path)) {
        frameImage.src = path;
    }
}

// =========================================
// 9. CAROUSEL LOGIC
// =========================================
function initCarousel() {
    const track = document.querySelector('.carousel-track');
    if (!track) return;

    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.carousel-arrow.next');
    const prevButton = document.querySelector('.carousel-arrow.prev');
    const dotsNav = document.querySelector('.carousel-nav');
    const dots = Array.from(dotsNav.children);

    const intervalTime = 5000; 
    let carouselInterval;

    const setSlidePosition = () => {
        const slideWidth = slides[0].getBoundingClientRect().width;
        slides.forEach((slide, index) => {
            slide.style.left = slideWidth * index + 'px';
        });
        const currentSlide = track.querySelector('.current-slide');
        if (currentSlide) {
            track.style.transform = 'translateX(-' + currentSlide.style.left + ')';
        }
    };
    setSlidePosition();

    const moveToSlide = (track, currentSlide, targetSlide) => {
        track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
        currentSlide.classList.remove('current-slide');
        targetSlide.classList.add('current-slide');
    };

    const updateDots = (currentDot, targetDot) => {
        currentDot.classList.remove('current-slide');
        targetDot.classList.add('current-slide');
    };

    const nextSlide = () => {
        const currentSlide = track.querySelector('.current-slide');
        const currentDot = dotsNav.querySelector('.current-slide');
        
        let nextSlide = currentSlide.nextElementSibling;
        let nextDot = currentDot.nextElementSibling;

        if (!nextSlide) {
            nextSlide = slides[0];
            nextDot = dots[0];
        }

        moveToSlide(track, currentSlide, nextSlide);
        updateDots(currentDot, nextDot);
    };

    const prevSlide = () => {
        const currentSlide = track.querySelector('.current-slide');
        const currentDot = dotsNav.querySelector('.current-slide');
        
        let prevSlide = currentSlide.previousElementSibling;
        let prevDot = currentDot.previousElementSibling;

        if (!prevSlide) {
            prevSlide = slides[slides.length - 1];
            prevDot = dots[dots.length - 1];
        }

        moveToSlide(track, currentSlide, prevSlide);
        updateDots(currentDot, prevDot);
    };

    const startAutoPlay = () => {
        if (carouselInterval) clearInterval(carouselInterval);
        carouselInterval = setInterval(nextSlide, intervalTime);
    };

    const stopAutoPlay = () => {
        clearInterval(carouselInterval);
    };

    nextButton.addEventListener('click', () => { stopAutoPlay(); nextSlide(); startAutoPlay(); });
    prevButton.addEventListener('click', () => { stopAutoPlay(); prevSlide(); startAutoPlay(); });

    dotsNav.addEventListener('click', e => {
        const targetDot = e.target.closest('button');
        if (!targetDot) return;

        stopAutoPlay();

        const currentSlide = track.querySelector('.current-slide');
        const currentDot = dotsNav.querySelector('.current-slide');
        const targetIndex = dots.findIndex(dot => dot === targetDot);
        const targetSlide = slides[targetIndex];

        moveToSlide(track, currentSlide, targetSlide);
        updateDots(currentDot, targetDot);
        startAutoPlay();
    });

    let startX = 0;
    let isDragging = false;

    const getPositionX = (e) => {
        return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    };

    const dragStart = (e) => {
        startX = getPositionX(e);
        isDragging = true;
        track.style.transition = 'none'; 
        stopAutoPlay();
        if (e.type.includes('mouse')) {
            e.preventDefault(); 
        }
    };

    const dragAction = (e) => {
        if (!isDragging) return;
        const currentX = getPositionX(e);
        const diffX = currentX - startX;
        
        const currentSlide = track.querySelector('.current-slide');
        const baseLeft = currentSlide.style.left || '0px';
        
        track.style.transform = `translateX(calc(-${baseLeft} + ${diffX}px))`;
    };

    const dragEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        track.style.transition = 'transform 0.6s ease-in-out';
        
        const endX = e.type.includes('mouse') ? e.clientX : e.changedTouches[0].clientX;
        const diffX = endX - startX;
        const swipeThreshold = 50; 

        if (diffX < -swipeThreshold) {
            nextSlide();
        } else if (diffX > swipeThreshold) {
            prevSlide();
        } else {
            const currentSlide = track.querySelector('.current-slide');
            track.style.transform = `translateX(-${currentSlide.style.left})`;
        }
        
        startAutoPlay();
    };

    track.addEventListener('touchstart', dragStart, { passive: true });
    track.addEventListener('touchmove', dragAction, { passive: true });
    track.addEventListener('touchend', dragEnd);

    track.addEventListener('mousedown', dragStart);
    track.addEventListener('mousemove', dragAction);
    track.addEventListener('mouseup', dragEnd);
    track.addEventListener('mouseleave', (e) => {
        if (isDragging) dragEnd(e);
    });

    startAutoPlay();
    window.addEventListener('resize', setSlidePosition);
}

// =========================================
// 10. PORTFOLIO MULTI-GRID LOGIC
// =========================================
function initPortfolioGallery() {
    const categories = document.querySelectorAll('.portfolio-item');
    const grids = document.querySelectorAll('.works-grid');
    const portfolioList = document.querySelector('.portfolio-list');

    if (categories.length > 0 && grids.length > 0) {
        categories.forEach(category => {
            category.addEventListener('click', (e) => {
                if (e) e.preventDefault();
                
                if (category.classList.contains('active')) return;

                let exactScrollY = window.scrollY;
                if (isRestoringSession && sessionStorage.getItem('scrollPos')) {
                    exactScrollY = parseInt(sessionStorage.getItem('scrollPos'), 10);
                }
                
                const galleryContainer = document.querySelector('.portfolio-gallery');
                const currentHeight = galleryContainer.offsetHeight;
                galleryContainer.style.minHeight = currentHeight + 'px';

                const targetCategory = category.getAttribute('data-category');
                sessionStorage.setItem('openCategory', targetCategory);
                const targetGrid = document.getElementById('grid-' + targetCategory);

                if (!targetGrid) return; 

                if(portfolioList) {
                    portfolioList.classList.add('category-selected');
                }

                categories.forEach(c => c.classList.remove('active'));
                category.classList.add('active');

                targetGrid.classList.add('active');

                grids.forEach(g => {
                    if (g !== targetGrid) {
                        g.classList.remove('show');
                        g.classList.remove('active');
                    }
                });

                window.scrollTo({ top: exactScrollY, behavior: 'instant' });

                setTimeout(() => {
                    targetGrid.classList.add('show');
                    galleryContainer.style.minHeight = ''; 
                    window.scrollTo({ top: exactScrollY, behavior: 'instant' }); 
                }, 50);
            });
        });
    }
}

// =========================================
// INITIALIZE EVERYTHING
// =========================================
initCarousel();
initPortfolioGallery();

if (!checkSessionMemory()) {
    preloadImages();
    window.scrollTo(0, 0); 
    requestAnimationFrame(startLoadingAnimation);
    
    if (window.innerWidth <= 900) {
        setTimeout(() => {
            const photoBtn = document.querySelector('.portfolio-item[data-category="creative-direction"]');
            if (photoBtn) {
                sessionStorage.setItem('openCategory', 'creative-direction');
                document.querySelector('.portfolio-list').classList.add('category-selected');
                photoBtn.classList.add('active');
                
                const targetGrid = document.getElementById('grid-creative-direction');
                if (targetGrid) {
                    targetGrid.classList.add('active');
                    setTimeout(() => {
                        targetGrid.classList.add('show');
                    }, 50);
                }
            }
        }, 100); 
    }
}