function increment(num, length) {
    return (num + 1) % length;
}
function decrement(num, length) {
    return (num + length - 1) % length;
}
function expand(num) {
    return ('0000' + num.toString()).slice(-4);
}
async function loadGsap() {
    const g = await import('./BnYq9v.js');
    return g.gsap;
}
function getThresholdSessionIndex() {
    const s = sessionStorage.getItem('thresholdsIndex');
    if (s === null)
        return 4;
    return parseInt(s);
}
function removeDuplicates(arr) {
    if (arr.length < 2)
        return arr;
    return [...new Set(arr)];
}
function createDivWithClass(className) {
    const div = document.createElement('div');
    if (className === '')
        return div;
    div.classList.add(className);
    return div;
}
class Watchable {
    constructor(obj, lazy = true) {
        this.obj = obj;
        this.lazy = lazy;
        this.watchers = [];
    }
    get() {
        return this.obj;
    }
    set(e) {
        if (e === this.obj && this.lazy)
            return;
        this.obj = e;
        this.watchers.forEach((watcher) => {
            watcher(this.obj);
        });
    }
    addWatcher(watcher) {
        this.watchers.push(watcher);
    }
}const scrollable = new Watchable(true);
let container;
function initContainer() {
    container = document.getElementsByClassName('container').item(0);
    scrollable.addWatcher((o) => {
        if (o) {
            container.classList.remove('disableScroll');
        }
        else {
            container.classList.add('disableScroll');
        }
    });
}const thresholds = [
    { threshold: 20, trailLength: 20 },
    { threshold: 40, trailLength: 10 },
    { threshold: 80, trailLength: 5 },
    { threshold: 140, trailLength: 5 },
    { threshold: 200, trailLength: 30 }
];
const defaultState = {
    index: -1,
    length: 0,
    threshold: thresholds[getThresholdSessionIndex()].threshold,
    trailLength: thresholds[getThresholdSessionIndex()].trailLength
};
const state = new Watchable(defaultState, false);
const isAnimating = new Watchable(false);
const navigateVector = new Watchable('none');
function initState(length) {
    const s = state.get();
    s.length = length;
    updateThreshold(s, 0);
    state.set(s);
}
function setIndex(index) {
    const s = state.get();
    s.index = index;
    state.set(s);
}
function incIndex() {
    const s = state.get();
    s.index = increment(s.index, s.length);
    state.set(s);
}
function decIndex() {
    const s = state.get();
    s.index = decrement(s.index, s.length);
    state.set(s);
}
function incThreshold() {
    let s = state.get();
    s = updateThreshold(s, 1);
    state.set(s);
}
function decThreshold() {
    let s = state.get();
    s = updateThreshold(s, -1);
    state.set(s);
}
function updateThreshold(state, inc) {
    const i = thresholds.findIndex((t) => state.threshold === t.threshold) + inc;
    if (i < 0 || i >= thresholds.length)
        return state;
    sessionStorage.setItem('thresholdsIndex', i.toString());
    const newItems = thresholds[i];
    return { ...state, ...newItems };
}const thresholdDiv = document
    .getElementsByClassName('threshold')
    .item(0);
const thresholdDispNums = Array.from(thresholdDiv.getElementsByClassName('num'));
const decButton = thresholdDiv
    .getElementsByClassName('dec')
    .item(0);
const incButton = thresholdDiv
    .getElementsByClassName('inc')
    .item(0);
const indexDiv = document.getElementsByClassName('index').item(0);
const indexDispNums = Array.from(indexDiv.getElementsByClassName('num'));
function initNav() {
    state.addWatcher((o) => {
        updateIndexText(expand(o.index + 1), expand(o.length));
        updateThresholdText(expand(o.threshold));
    });
    decButton.addEventListener('click', () => {
        decThreshold();
    }, { passive: true });
    incButton.addEventListener('click', () => {
        incThreshold();
    }, { passive: true });
}
function updateThresholdText(thresholdValue) {
    thresholdDispNums.forEach((e, i) => {
        e.innerText = thresholdValue[i];
    });
}
function updateIndexText(indexValue, indexLength) {
    indexDispNums.forEach((e, i) => {
        if (i < 4) {
            e.innerText = indexValue[i];
        }
        else {
            e.innerText = indexLength[i - 4];
        }
    });
}async function initResources() {
    if (document.title.split(' | ')[0] === '404') {
        return [];
    }
    try {
        const response = await fetch(`${window.location.href}index.json`, {
            headers: {
                Accept: 'application/json'
            }
        });
        const data = await response.json();
        return data.sort((a, b) => {
            if (a.index < b.index) {
                return -1;
            }
            return 1;
        });
    }
    catch (_) {
        return [];
    }
}document.addEventListener('DOMContentLoaded', () => {
    main().catch((e) => {
        console.log(e);
    });
});
async function main() {
    initContainer();
    const ijs = await initResources();
    initState(ijs.length);
    initNav();
    if (ijs.length === 0) {
        return;
    }
    if (!isMobile()) {
        await import('./Ckwog0.js')
            .then((d) => {
            d.initDesktop(ijs);
        })
            .catch((e) => {
            console.log(e);
        });
    }
    else {
        await import('./FmyewP.js')
            .then((m) => {
            m.initMobile(ijs);
        })
            .catch((e) => {
            console.log(e);
        });
    }
}
function isMobile() {
    return window.matchMedia('(hover: none)').matches;
}export{Watchable as W,incIndex as a,increment as b,container as c,decrement as d,decIndex as e,scrollable as f,setIndex as g,expand as h,isAnimating as i,createDivWithClass as j,loadGsap as l,navigateVector as n,removeDuplicates as r,state as s};