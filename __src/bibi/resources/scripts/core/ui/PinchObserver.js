import sML from 'sml.js';

export default class PinchObserver {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.PinchObserver = { create: () => {
        const PinchObserver = this.I.PinchObserver = {
        Pinching: 0,
        getEventCoords: (Eve) => {
        const T0 = Eve.touches[0], T1 = Eve.touches[1], Doc = Eve.target.ownerDocument;
        const T0CoordInViewport = { X: T0.screenX, Y: T0.screenY };
        const T1CoordInViewport = { X: T1.screenX, Y: T1.screenY };
        return {
        Center: { X: (T0CoordInViewport.X + T1CoordInViewport.X) / 2, Y: (T0CoordInViewport.Y + T1CoordInViewport.Y) / 2 },
        Distance: Math.sqrt(Math.pow(T1.screenX - T0.screenX, 2) + Math.pow(T1.screenY - T0.screenY, 2))
        };
        },
        onTouchStart: (Eve) => {
        if(!L.Opened) return;
        if(Eve.touches.length != 2) return;
        O.HTML.classList.add('pinching');
        PinchObserver.Hot = true;
        Eve.preventDefault(); Eve.stopPropagation();
        PinchObserver.PinchStart = {
        Scale: this.I.Loupe.CurrentTransformation.Scale,
        Coords: PinchObserver.getEventCoords(Eve)
        };
        },
        onTouchMove: (Eve) => {
        if(Eve.touches.length != 2 || !PinchObserver.PinchStart) return;
        Eve.preventDefault(); Eve.stopPropagation();
        const Ratio = PinchObserver.getEventCoords(Eve).Distance / PinchObserver.PinchStart.Coords.Distance;
        /* // Switch Utilities with Pinch-In/Out
        if(PinchObserver.Pinching++ < 3 && PinchObserver.PinchStart.Scale == 1) switch(this.I.Utilities.UIState) {
        case 'default': if(Ratio < 1) { PinchObserver.onTouchEnd(); this.I.Utilities.openGracefuly();  return; } break;
        case  'active': if(Ratio > 1) { PinchObserver.onTouchEnd(); this.I.Utilities.closeGracefuly(); return; } break;
        } //*/
        clearTimeout(PinchObserver.Timer_TransitionRestore);
        sML.style(R.Main, { transition: 'none' });
        this.I.Loupe.scale(PinchObserver.PinchStart.Scale * Ratio, { Center: PinchObserver.PinchStart.Coords.Center, Stepless: true });
        PinchObserver.Timer_TransitionRestore = setTimeout(() => sML.style(R.Main, { transition: '' }), 234);
        },
        onTouchEnd: (Eve, Opt) => {
        PinchObserver.Pinching = 0;
        delete PinchObserver.LastScale;
        delete PinchObserver.PinchStart;
        delete PinchObserver.Hot;
        O.HTML.classList.remove('pinching');
        },
        getCNPf: (Doc) => Doc == document ? '' : 'bibi-',
        activateElement: (Ele) => { if(!Ele) return false;
        Ele.addEventListener('touchstart', PinchObserver.onTouchStart, E.Cpt1Psv0);
        Ele.addEventListener('touchmove',  PinchObserver.onTouchMove,  E.Cpt1Psv0);
        Ele.addEventListener('touchend',   PinchObserver.onTouchEnd,   E.Cpt1Psv0);
        Ele.ownerDocument.documentElement.classList.add(PinchObserver.getCNPf(Ele) + 'pinch-active');
        },
        deactivateElement: (Ele) => { if(!Ele) return false;
        Ele.removeEventListener('touchstart', PinchObserver.onTouchStart, E.Cpt1Psv0);
        Ele.removeEventListener('touchmove',  PinchObserver.onTouchMove,  E.Cpt1Psv0);
        Ele.removeEventListener('touchend',   PinchObserver.onTouchEnd,   E.Cpt1Psv0);
        Ele.ownerDocument.documentElement.classList.remove(PinchObserver.getCNPf(Ele) + 'pinch-active');
        }
        };
        PinchObserver.activateElement(R.Main);
        E.add('bibi:loaded-item', Item => PinchObserver.activateElement(Item.HTML));
        E.dispatch('bibi:created-pinch-observer');
        }};
    }
}
