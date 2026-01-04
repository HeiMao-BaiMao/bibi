import sML from 'sml.js';

export default class EdgeObserver {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L; const C = I.C;
        this.I.EdgeObserver = { create: () => {
        const EdgeObserver = this.I.EdgeObserver = {};
        E.add('bibi:opened', () => {
        E.add(['bibi:tapped-not-center', 'bibi:doubletapped-not-center'], Eve => {
        if(this.I.isPointerStealth()) return false;
        const BibiEvent = O.getBibiEvent(Eve);
        const Dir = this.I.Flipper.getDirection(BibiEvent.Division), Ortho = this.I.orthogonal('edges'), Dist = C.d2d(Dir, Ortho == 'move');
        if(Dist) {
        if(this.I.Arrows && this.I.Arrows.areAvailable(BibiEvent)) E.dispatch(this.I.Arrows[Dist], 'bibi:tapped', Eve);
        if(this.I.Flipper.isAbleToFlip(Dist)) this.I.Flipper.flip(Dist);
        } else if(typeof C.DDD[Dir] == 'string') switch(Ortho) {
        case 'utilities': this.I.Utilities.toggleGracefuly(); break;
        case 'switch': if(this.I.AxisSwitcher) this.I.AxisSwitcher.switchAxis(); break;
        }
        });
        if(!O.TouchOS) {
        E.add('bibi:moved-pointer', Eve => {
        if(this.I.isPointerStealth()) return false;
        const BibiEvent = O.getBibiEvent(Eve);
        if(this.I.Arrows.areAvailable(BibiEvent)) {
        const Dir = this.I.Flipper.getDirection(BibiEvent.Division), Ortho = this.I.orthogonal('edges'), Dist = C.d2d(Dir, Ortho == 'move');
        if(Dist && this.I.Flipper.isAbleToFlip(Dist)) {
        EdgeObserver.Hovering = true;
        if(this.I.Arrows) {
        const Arrow = this.I.Arrows[Dist];
        E.dispatch(Arrow,      'bibi:hovered',   Eve);
        E.dispatch(Arrow.Pair, 'bibi:unhovered', Eve);
        }
        const HoveringHTML = BibiEvent.Target.ownerDocument.documentElement;
        if(EdgeObserver.HoveringHTML != HoveringHTML) {
        if(EdgeObserver.HoveringHTML) EdgeObserver.HoveringHTML.removeAttribute('data-bibi-cursor');
        (EdgeObserver.HoveringHTML = HoveringHTML).setAttribute('data-bibi-cursor', Dir);
        }
        return;
        }
        }
        if(EdgeObserver.Hovering) {
        EdgeObserver.Hovering = false;
        if(this.I.Arrows) E.dispatch([this.I.Arrows.Back, this.I.Arrows.Forward], 'bibi:unhovered', Eve);
        if(EdgeObserver.HoveringHTML) EdgeObserver.HoveringHTML.removeAttribute('data-bibi-cursor'), EdgeObserver.HoveringHTML = null;
        }
        });
        sML.forEach(O.Body.querySelectorAll('img'))(Img => Img.addEventListener(E['pointerdown'], O.preventDefault));
        }
        });
        if(!O.TouchOS) {
        E.add('bibi:loaded-item', Item => sML.forEach(Item.Body.querySelectorAll('img'))(Img => Img.addEventListener(E['pointerdown'], O.preventDefault)));
        }
        E.dispatch('bibi:created-edge-observer');
        }};
    }
}
