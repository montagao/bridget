import {W as Watchable,s as state,n as navigateVector,f as scrollable,l as loadGsap,g as setIndex,h as expand,r as removeDuplicates,j as createDivWithClass,c as container,i as isAnimating}from'./main.js';const mounted = new Watchable(false);function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function onIntersection(element, trigger) {
    new IntersectionObserver((entries, observer) => {
        for (const entry of entries) {
            if (trigger(entry)) {
                observer.disconnect();
                break;
            }
        }
    }).observe(element);
}
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
async function loadSwiper() {
    const s = await import('./BT8hLS.js');
    return s.Swiper;
}let galleryInner;
let gallery;
let curtain;
let indexDiv;
let navDiv;
let indexDispNums = [];
let galleryImages = [];
let collectionImages = [];
let _gsap;
let _swiper;
let lastIndex = -1;
let libLoaded = false;
function slideUp() {
    if (isAnimating.get() || !libLoaded)
        return;
    isAnimating.set(true);
    _gsap.to(curtain, {
        opacity: 1,
        duration: 1
    });
    _gsap.to(gallery, {
        y: 0,
        ease: 'power3.inOut',
        duration: 1,
        delay: 0.4
    });
    setTimeout(() => {
        scrollable.set(false);
        isAnimating.set(false);
    }, 1400);
}
function slideDown() {
    if (isAnimating.get())
        return;
    isAnimating.set(true);
    scrollToActive();
    _gsap.to(gallery, {
        y: '100%',
        ease: 'power3.inOut',
        duration: 1
    });
    _gsap.to(curtain, {
        opacity: 0,
        duration: 1.2,
        delay: 0.4
    });
    setTimeout(() => {
        scrollable.set(true);
        isAnimating.set(false);
        lastIndex = -1;
    }, 1600);
}
function initGallery(ijs) {
    constructGallery(ijs);
    indexDispNums = Array.from(indexDiv.getElementsByClassName('num') ?? []);
    galleryImages = Array.from(gallery.getElementsByTagName('img'));
    collectionImages = Array.from(document
        .getElementsByClassName('collection')
        .item(0)
        ?.getElementsByTagName('img') ?? []);
    state.addWatcher((o) => {
        if (o.index === lastIndex)
            return;
        else if (lastIndex === -1)
            navigateVector.set('none');
        else if (o.index < lastIndex)
            navigateVector.set('prev');
        else if (o.index > lastIndex)
            navigateVector.set('next');
        else
            navigateVector.set('none');
        changeSlide(o.index);
        updateIndexText();
        lastIndex = o.index;
    });
    mounted.addWatcher((o) => {
        if (!o)
            return;
        scrollable.set(true);
    });
    window.addEventListener('touchstart', () => {
        loadGsap()
            .then((g) => {
            _gsap = g;
        })
            .catch((e) => {
            console.log(e);
        });
        loadSwiper()
            .then((S) => {
            _swiper = new S(galleryInner, { spaceBetween: 20 });
            _swiper.on('slideChange', ({ realIndex }) => {
                setIndex(realIndex);
            });
        })
            .catch((e) => {
            console.log(e);
        });
        libLoaded = true;
    }, { once: true, passive: true });
    mounted.set(true);
}
function changeSlide(slide) {
    galleryLoadImages();
    _swiper.slideTo(slide, 0);
}
function scrollToActive() {
    collectionImages[state.get().index].scrollIntoView({
        block: 'center',
        behavior: 'auto'
    });
}
function updateIndexText() {
    const indexValue = expand(state.get().index + 1);
    const indexLength = expand(state.get().length);
    indexDispNums.forEach((e, i) => {
        if (i < 4) {
            e.innerText = indexValue[i];
        }
        else {
            e.innerText = indexLength[i - 4];
        }
    });
}
function galleryLoadImages() {
    let activeImagesIndex = [];
    const currentIndex = state.get().index;
    const nextIndex = Math.min(currentIndex + 1, state.get().length - 1);
    const prevIndex = Math.max(currentIndex - 1, 0);
    switch (navigateVector.get()) {
        case 'next':
            activeImagesIndex = [nextIndex];
            break;
        case 'prev':
            activeImagesIndex = [prevIndex];
            break;
        case 'none':
            activeImagesIndex = [currentIndex, nextIndex, prevIndex];
            break;
    }
    removeDuplicates(activeImagesIndex).forEach((i) => {
        const e = galleryImages[i];
        if (e.src === e.dataset.src)
            return;
        e.src = e.dataset.src;
    });
}
function constructGalleryNav() {
    indexDiv = document.createElement('div');
    indexDiv.insertAdjacentHTML('afterbegin', `<span class="num"></span><span class="num"></span><span class="num"></span><span class="num"></span>
    <span>/</span>
    <span class="num"></span><span class="num"></span><span class="num"></span><span class="num"></span>`);
    const closeDiv = document.createElement('div');
    closeDiv.innerText = capitalizeFirstLetter(container.dataset.close);
    closeDiv.addEventListener('click', () => {
        slideDown();
    }, { passive: true });
    closeDiv.addEventListener('keydown', () => {
        slideDown();
    }, { passive: true });
    navDiv = createDivWithClass('nav');
    navDiv.append(indexDiv, closeDiv);
}
function constructGalleryInner(ijs) {
    const swiperWrapper = createDivWithClass('swiper-wrapper');
    const loadingText = container.dataset.loading + '...';
    for (const ij of ijs) {
        const swiperSlide = createDivWithClass('swiper-slide');
        const l = createDivWithClass('loadingText');
        l.innerText = loadingText;
        const e = document.createElement('img');
        e.dataset.src = ij.hiUrl;
        e.height = ij.hiImgH;
        e.width = ij.hiImgW;
        e.alt = ij.alt;
        e.style.opacity = '0';
        e.addEventListener('load', () => {
            if (state.get().index !== ij.index) {
                _gsap.set(e, { opacity: 1 });
                _gsap.set(l, { opacity: 0 });
            }
            else {
                _gsap.to(e, { opacity: 1, delay: 0.5, duration: 0.5, ease: 'power3.out' });
                _gsap.to(l, { opacity: 0, duration: 0.5, ease: 'power3.in' });
            }
        }, { once: true, passive: true });
        const p = createDivWithClass('slideContainer');
        p.append(e, l);
        swiperSlide.append(p);
        swiperWrapper.append(swiperSlide);
    }
    galleryInner = createDivWithClass('galleryInner');
    galleryInner.append(swiperWrapper);
}
function constructGallery(ijs) {
    gallery = createDivWithClass('gallery');
    constructGalleryInner(ijs);
    constructGalleryNav();
    gallery.append(galleryInner, navDiv);
    curtain = createDivWithClass('curtain');
    container.append(gallery, curtain);
}let imgs = [];
function handleClick(i) {
    setIndex(i);
    slideUp();
}
function initCollection(ijs) {
    createCollection(ijs);
    const collection = document
        .getElementsByClassName('collection')
        .item(0);
    mounted.addWatcher((o) => {
        if (o) {
            collection.classList.remove('hidden');
        }
        else {
            collection.classList.add('hidden');
        }
    });
    imgs = Array.from(collection.getElementsByTagName('img'));
    imgs.forEach((img, i) => {
        if (i < 5) {
            img.src = img.dataset.src;
        }
        img.addEventListener('click', () => {
            handleClick(i);
        }, { passive: true });
        img.addEventListener('keydown', () => {
            handleClick(i);
        }, { passive: true });
        onIntersection(img, (entry) => {
            if (entry.intersectionRatio <= 0)
                return false;
            if (i + 5 < imgs.length) {
                imgs[i + 5].src = imgs[i + 5].dataset.src;
            }
            return true;
        });
    });
}
function createCollection(ijs) {
    const _collection = document.createElement('div');
    _collection.className = 'collection';
    for (const [i, ij] of ijs.entries()) {
        const x = i !== 0 ? getRandom(-25, 25) : 0;
        const y = i !== 0 ? getRandom(-30, 30) : 0;
        const e = document.createElement('img');
        e.dataset.src = ij.loUrl;
        e.height = ij.loImgH;
        e.width = ij.loImgW;
        e.alt = ij.alt;
        e.style.transform = `translate3d(${x}%, ${y - 50}%, 0)`;
        _collection.append(e);
    }
    container.append(_collection);
}function initMobile(ijs) {
    initCollection(ijs);
    initGallery(ijs);
}export{initMobile};