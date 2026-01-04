import sML from 'sml.js';

export default class ScrollObserver {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L; const C = I.C;
        this.I.ScrollObserver = { create: () => {
        const ScrollObserver = this.I.ScrollObserver = {
        History: [],
        Count: 0,
        onScroll: (Eve) => { if(R.LayingOut || !L.Opened) return;
        if(!ScrollObserver.Scrolling) {
        ScrollObserver.Scrolling = true;
        O.HTML.classList.add('scrolling');
        }
        E.dispatch('bibi:is-scrolling');
        ScrollObserver.History.unshift(Math.ceil(R.Main['scroll' + C.L_OOBL_L])); // Android Chrome returns scrollLeft/Top value of an element with slightly less float than actual.
        if(ScrollObserver.History.length > 2) ScrollObserver.History.pop();
        if(++ScrollObserver.Count == 8) {
        ScrollObserver.Count = 0;
        E.dispatch('bibi:scrolled');
        }
        clearTimeout(R.Timer_onScrollEnd);
        R.Timer_onScrollEnd = setTimeout(() => {
        ScrollObserver.Scrolling = false;
        ScrollObserver.Count = 0;
        O.HTML.classList.remove('scrolling');
        E.dispatch('bibi:scrolled');
        }, 123);
        },
        observe: () => {
        R.Main.addEventListener('scroll', ScrollObserver.onScroll);
        },
        breakCurrentScrolling: () => {
        try { R.Breaking = true; sML.Scroller.Scrolling.cancel(); setTimeout(() => R.Breaking = false, 333); } catch(Err) { R.Breaking = false; }
        },
        forceStopScrolling: () => {
        ScrollObserver.breakCurrentScrolling();
        R.Main.style.overflow = 'hidden', R.Main.scrollLeft = R.Main.scrollLeft, R.Main.scrollTop = R.Main.scrollTop, R.Main.style.overflow = '';
        }
        }
        E.bind('bibi:opened', ScrollObserver.observe);
        E.dispatch('bibi:created-scroll-observer');
        }};
    }
}
