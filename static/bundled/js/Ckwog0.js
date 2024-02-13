import {W as Watchable,c as container,i as isAnimating,l as loadGsap,s as state,a as incIndex,n as navigateVector,d as decrement,b as increment,e as decIndex}from'./main.js';const cordHist = new Watchable([]);
const isOpen = new Watchable(false);
const active = new Watchable(false);
const isLoading = new Watchable(false);const cursor = document.createElement('div');
const cursorInner = document.createElement('div');
function onMouse$1(e) {
    const x = e.clientX;
    const y = e.clientY;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}
function setCustomCursor(text) {
    cursorInner.innerText = text;
}
function initCustomCursor() {
    cursor.className = 'cursor';
    cursorInner.className = 'cursorInner';
    cursor.append(cursorInner);
    container.append(cursor);
    window.addEventListener('mousemove', onMouse$1, { passive: true });
    active.addWatcher((o) => {
        if (o) {
            cursor.classList.add('active');
        }
        else {
            cursor.classList.remove('active');
        }
    });
}function onMutation(element, trigger, observeOptions = { attributes: true }) {
    new MutationObserver((mutations, observer) => {
        for (const mutation of mutations) {
            if (trigger(mutation)) {
                observer.disconnect();
                break;
            }
        }
    }).observe(element, observeOptions);
}let imgs = [];
let last = { x: 0, y: 0 };
let _gsap;
let gsapLoaded = false;
function getTrailElsIndex() {
    return cordHist.get().map((item) => item.i);
}
function getTrailCurrentElsIndex() {
    return getTrailElsIndex().slice(-state.get().trailLength);
}
function getTrailInactiveElsIndex() {
    const trailCurrentElsIndex = getTrailCurrentElsIndex();
    return trailCurrentElsIndex.slice(0, trailCurrentElsIndex.length - 1);
}
function getCurrentElIndex() {
    const trailElsIndex = getTrailElsIndex();
    return trailElsIndex[trailElsIndex.length - 1];
}
function getPrevElIndex() {
    const c = cordHist.get();
    const s = state.get();
    return decrement(c[c.length - 1].i, s.length);
}
function getNextElIndex() {
    const c = cordHist.get();
    const s = state.get();
    return increment(c[c.length - 1].i, s.length);
}
function onMouse(e) {
    if (isOpen.get() || isAnimating.get())
        return;
    if (!gsapLoaded) {
        loadLib();
        return;
    }
    const cord = { x: e.clientX, y: e.clientY };
    const travelDist = Math.hypot(cord.x - last.x, cord.y - last.y);
    if (travelDist > state.get().threshold) {
        last = cord;
        incIndex();
        const newHist = { i: state.get().index, ...cord };
        cordHist.set([...cordHist.get(), newHist].slice(-state.get().length));
    }
}
function setPositions() {
    const trailElsIndex = getTrailElsIndex();
    if (trailElsIndex.length === 0 || !gsapLoaded)
        return;
    const elsTrail = getImagesWithIndexArray(trailElsIndex);
    const _isOpen = isOpen.get();
    const _cordHist = cordHist.get();
    const _state = state.get();
    _gsap.set(elsTrail, {
        x: (i) => _cordHist[i].x - window.innerWidth / 2,
        y: (i) => _cordHist[i].y - window.innerHeight / 2,
        opacity: (i) => Math.max((i + 1 + _state.trailLength <= _cordHist.length ? 0 : 1) - (_isOpen ? 1 : 0), 0),
        zIndex: (i) => i,
        scale: 0.6
    });
    if (_isOpen) {
        const elc = getImagesWithIndexArray([getCurrentElIndex()])[0];
        const indexArrayToHires = [];
        const indexArrayToCleanup = [];
        switch (navigateVector.get()) {
            case 'prev':
                indexArrayToHires.push(getPrevElIndex());
                indexArrayToCleanup.push(getNextElIndex());
                break;
            case 'next':
                indexArrayToHires.push(getNextElIndex());
                indexArrayToCleanup.push(getPrevElIndex());
                break;
        }
        hires(getImagesWithIndexArray(indexArrayToHires));
        _gsap.set(getImagesWithIndexArray(indexArrayToCleanup), { opacity: 0 });
        _gsap.set(elc, { x: 0, y: 0, scale: 1 });
        setLoaderForHiresImage(elc);
    }
    else {
        lores(elsTrail);
    }
}
function expandImage() {
    if (isAnimating.get())
        return;
    isOpen.set(true);
    isAnimating.set(true);
    const elcIndex = getCurrentElIndex();
    const elc = getImagesWithIndexArray([elcIndex])[0];
    hires(getImagesWithIndexArray([elcIndex, getPrevElIndex(), getNextElIndex()]));
    setLoaderForHiresImage(elc);
    const tl = _gsap.timeline();
    const trailInactiveEls = getImagesWithIndexArray(getTrailInactiveElsIndex());
    tl.to(trailInactiveEls, {
        y: '+=20',
        ease: 'power3.in',
        stagger: 0.075,
        duration: 0.3,
        delay: 0.1,
        opacity: 0
    });
    tl.to(elc, {
        x: 0,
        y: 0,
        ease: 'power3.inOut',
        duration: 0.7,
        delay: 0.3
    });
    tl.to(elc, {
        delay: 0.1,
        scale: 1,
        ease: 'power3.inOut'
    });
    tl.then(() => {
        isAnimating.set(false);
    }).catch((e) => {
        console.log(e);
    });
}
function minimizeImage() {
    if (isAnimating.get())
        return;
    isOpen.set(false);
    isAnimating.set(true);
    navigateVector.set('none');
    lores(getImagesWithIndexArray([...getTrailInactiveElsIndex(), ...[getCurrentElIndex()]]));
    const tl = _gsap.timeline();
    const elc = getImagesWithIndexArray([getCurrentElIndex()])[0];
    const elsTrailInactive = getImagesWithIndexArray(getTrailInactiveElsIndex());
    tl.to(elc, {
        scale: 0.6,
        duration: 0.6,
        ease: 'power3.inOut'
    });
    tl.to(elc, {
        delay: 0.3,
        duration: 0.7,
        ease: 'power3.inOut',
        x: cordHist.get()[cordHist.get().length - 1].x - window.innerWidth / 2,
        y: cordHist.get()[cordHist.get().length - 1].y - window.innerHeight / 2
    });
    tl.to(elsTrailInactive, {
        y: '-=20',
        ease: 'power3.out',
        stagger: -0.1,
        duration: 0.3,
        opacity: 1
    });
    tl.then(() => {
        isAnimating.set(false);
    }).catch((e) => {
        console.log(e);
    });
}
function initStage(ijs) {
    createStage(ijs);
    const stage = document.getElementsByClassName('stage').item(0);
    imgs = Array.from(stage.getElementsByTagName('img'));
    imgs.forEach((img, i) => {
        if (i < 5) {
            img.src = img.dataset.loUrl;
        }
        onMutation(img, (mutation) => {
            if (isOpen.get() || isAnimating.get())
                return false;
            if (mutation.attributeName !== 'style')
                return false;
            const opacity = parseFloat(img.style.opacity);
            if (opacity !== 1)
                return false;
            if (i + 5 < imgs.length) {
                imgs[i + 5].src = imgs[i + 5].dataset.loUrl;
            }
            return true;
        });
    });
    stage.addEventListener('click', () => {
        expandImage();
    }, { passive: true });
    stage.addEventListener('keydown', () => {
        expandImage();
    }, { passive: true });
    window.addEventListener('mousemove', onMouse, { passive: true });
    isOpen.addWatcher((o) => {
        active.set(o && !isAnimating.get());
    });
    isAnimating.addWatcher((o) => {
        active.set(isOpen.get() && !o);
    });
    cordHist.addWatcher((_) => {
        setPositions();
    });
    window.addEventListener('mousemove', () => {
        loadLib();
    }, { once: true, passive: true });
}
function createStage(ijs) {
    const stage = document.createElement('div');
    stage.className = 'stage';
    for (const ij of ijs) {
        const e = document.createElement('img');
        e.height = ij.loImgH;
        e.width = ij.loImgW;
        e.dataset.hiUrl = ij.hiUrl;
        e.dataset.hiImgH = ij.hiImgH.toString();
        e.dataset.hiImgW = ij.hiImgW.toString();
        e.dataset.loUrl = ij.loUrl;
        e.dataset.loImgH = ij.loImgH.toString();
        e.dataset.loImgW = ij.loImgW.toString();
        e.alt = ij.alt;
        stage.append(e);
    }
    container.append(stage);
}
function getImagesWithIndexArray(indexArray) {
    return indexArray.map((i) => imgs[i]);
}
function hires(imgs) {
    imgs.forEach((img) => {
        if (img.src === img.dataset.hiUrl)
            return;
        img.src = img.dataset.hiUrl;
        img.height = parseInt(img.dataset.hiImgH);
        img.width = parseInt(img.dataset.hiImgW);
    });
}
function lores(imgs) {
    imgs.forEach((img) => {
        if (img.src === img.dataset.loUrl)
            return;
        img.src = img.dataset.loUrl;
        img.height = parseInt(img.dataset.loImgH);
        img.width = parseInt(img.dataset.loImgW);
    });
}
function setLoaderForHiresImage(e) {
    if (!e.complete) {
        isLoading.set(true);
        const controller = new AbortController();
        const abortSignal = controller.signal;
        e.addEventListener('load', () => {
            _gsap
                .to(e, { opacity: 1, ease: 'power3.out', duration: 0.5 })
                .then(() => {
                isLoading.set(false);
            })
                .catch((e) => {
                console.log(e);
            })
                .finally(() => {
                controller.abort();
            });
        }, { once: true, passive: true, signal: abortSignal });
        e.addEventListener('error', () => {
            _gsap
                .set(e, { opacity: 1 })
                .then(() => {
                isLoading.set(false);
            })
                .catch((e) => {
                console.log(e);
            })
                .finally(() => {
                controller.abort();
            });
        }, { once: true, passive: true, signal: abortSignal });
    }
    else {
        _gsap
            .set(e, { opacity: 1 })
            .then(() => {
            isLoading.set(false);
        })
            .catch((e) => {
            console.log(e);
        });
    }
}
function loadLib() {
    loadGsap()
        .then((g) => {
        _gsap = g;
        gsapLoaded = true;
    })
        .catch((e) => {
        console.log(e);
    });
}const navItems = [
    container.dataset.prev,
    container.dataset.close,
    container.dataset.next
];
const loadingText = container.dataset.loading + '...';
let loadedText = '';
function handleClick(type) {
    if (type === navItems[0]) {
        prevImage();
    }
    else if (type === navItems[1]) {
        minimizeImage();
    }
    else {
        nextImage();
    }
}
function handleKey(e) {
    if (isOpen.get() || isAnimating.get())
        return;
    switch (e.key) {
        case 'ArrowLeft':
            prevImage();
            break;
        case 'Escape':
            minimizeImage();
            break;
        case 'ArrowRight':
            nextImage();
            break;
    }
}
function initStageNav() {
    isLoading.addWatcher((o) => {
        if (o)
            setCustomCursor(loadingText);
        else
            setCustomCursor(loadedText);
    });
    const navOverlay = document.createElement('div');
    navOverlay.className = 'navOverlay';
    for (const [index, navItem] of navItems.entries()) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        const isClose = index === 1;
        if (isClose) {
            overlay.addEventListener('click', () => {
                handleCloseClick(navItem);
            }, { passive: true });
            overlay.addEventListener('keydown', () => {
                handleCloseClick(navItem);
            }, { passive: true });
            overlay.addEventListener('mouseover', () => {
                handleCloseHover(navItem);
            }, { passive: true });
            overlay.addEventListener('focus', () => {
                handleCloseHover(navItem);
            }, { passive: true });
        }
        else {
            overlay.addEventListener('click', () => {
                handlePNClick(navItem);
            }, { passive: true });
            overlay.addEventListener('keydown', () => {
                handlePNClick(navItem);
            }, { passive: true });
            overlay.addEventListener('mouseover', () => {
                handlePNHover(navItem);
            }, { passive: true });
            overlay.addEventListener('focus', () => {
                handlePNHover(navItem);
            }, { passive: true });
        }
        navOverlay.append(overlay);
    }
    active.addWatcher(() => {
        if (active.get()) {
            navOverlay.classList.add('active');
        }
        else {
            navOverlay.classList.remove('active');
        }
    });
    container.append(navOverlay);
    window.addEventListener('keydown', handleKey, { passive: true });
}
function nextImage() {
    if (isAnimating.get())
        return;
    navigateVector.set('next');
    cordHist.set(cordHist.get().map((item) => {
        return { ...item, i: increment(item.i, state.get().length) };
    }));
    incIndex();
}
function prevImage() {
    if (isAnimating.get())
        return;
    navigateVector.set('prev');
    cordHist.set(cordHist.get().map((item) => {
        return { ...item, i: decrement(item.i, state.get().length) };
    }));
    decIndex();
}
function handleCloseClick(navItem) {
    handleClick(navItem);
    isLoading.set(false);
}
function handleCloseHover(navItem) {
    loadedText = navItem;
    setCustomCursor(navItem);
}
function handlePNClick(navItem) {
    if (!isLoading.get())
        handleClick(navItem);
}
function handlePNHover(navItem) {
    loadedText = navItem;
    if (isLoading.get())
        setCustomCursor(loadingText);
    else
        setCustomCursor(navItem);
}function initDesktop(ijs) {
    initCustomCursor();
    initStage(ijs);
    initStageNav();
}export{initDesktop};