import sML from 'sml.js';

export default class WheelObserver {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.WheelObserver = { create: () => {
        const WheelObserver = this.I.WheelObserver = {
        TotalDelta: 0,
        Turned: false,
        Wheels: [],
        reset: () => {
        WheelObserver.TotalDelta = 0;
        WheelObserver.Progress = 0;
        WheelObserver.Turned = false;
        WheelObserver.Wheels = [];
        },
        reserveResetWith: (fn) => {
        clearTimeout(WheelObserver.Timer_resetWheeling);
        try { fn(); } catch(Err) {}
        WheelObserver.Timer_resetWheeling = setTimeout(WheelObserver.reset, 234);
        },
        careTurned: () => {
        WheelObserver.reserveResetWith(() => WheelObserver.Turned = true);
        },
        heat: () => {
        clearTimeout(WheelObserver.Timer_coolDown);
        WheelObserver.Hot = true;
        WheelObserver.Timer_coolDown = setTimeout(() => WheelObserver.Hot = false, 234);
        },
        onWheel: (Eve) => {
        //if(WheelObserver.Turned) return WheelObserver.careTurned();
        const WA /* WheelAxis */ = Math.abs(Eve.deltaX) > Math.abs(Eve.deltaY) ? 'X' : 'Y';
        const CW /* CurrentWheel */ = {}, Ws = WheelObserver.Wheels, Wl = Ws.length;
        //if(Wl && Ws[Wl - 1].Axis != WA) WheelObserver.Wheels = [];
        CW.Axis = WA;
        CW.Direction = WA == 'X' ? (Eve.deltaX < 0 ? 'left' : 'right') : (Eve.deltaY < 0 ? 'top' : 'bottom');
        CW.Distance = C.d2d(CW.Direction, 'Allow Orthogonal Direction');
        CW.Delta = Math.abs(Eve['delta' + WA]);
        if(!Ws[Wl - 1])                        CW.Accel =  1, CW.Wheeled = 'start';
        else if(CW.Axis     != Ws[Wl - 1].Axis    ) return WheelObserver.careTurned(); ////////
        else if(CW.Distance != Ws[Wl - 1].Distance) CW.Accel =  1, CW.Wheeled = (Wl >= 3 &&                           Ws[Wl - 2].Distance != CW.Distance && Ws[Wl - 3].Distance != CW.Distance) ? 'reverse' : '';
        else if(CW.Delta     > Ws[Wl - 1].Delta   ) CW.Accel =  1, CW.Wheeled = (Wl >= 3 && Ws[Wl - 1].Accel == -1 && Ws[Wl - 2].Accel == -1             && Ws[Wl - 3].Accel == -1            ) ? 'serial' : '';
        else if(CW.Delta     < Ws[Wl - 1].Delta   ) CW.Accel = -1, CW.Wheeled = '';
        else                                        CW.Accel = Ws[Wl - 1].Accel, CW.Wheeled = '';
        WheelObserver.reserveResetWith(() => {
        Ws.push(CW); if(Wl > 3) Ws.shift();
        WheelObserver.Progress = (WheelObserver.TotalDelta += Eve['delta' + WA]) / 3 / 100;
        });
        const ToDo = WA != C.A_AXIS_L ? this.I.orthogonal('wheelings') : S.RVM == 'paged' ? 'move' : WheelObserver.OverlaidUIs.filter(OUI => OUI.contains(Eve.target)).length ? 'simulate' : '';
        if(!ToDo) return;
        //Eve.preventDefault(); // Must not prevent.
        //Eve.stopPropagation(); // No need to stop.
        if(WheelObserver.Hot) return;
        switch(ToDo) {
        case 'simulate':  return WheelObserver.scrollNatural(Eve, WA);
        case 'across'  :  return WheelObserver.scrollAcross(Eve, WA);
        case 'move':      return WheelObserver.move(CW);
        case 'utilities': return WheelObserver.toggleUtilities(CW);
        case 'switch':    return WheelObserver.switchAxis(CW);
        }
        },
        scrollNatural: (Eve, Axis) => { switch(Axis) {
        case 'X': R.Main.scrollLeft += Eve.deltaX; break;
        case 'Y': R.Main.scrollTop  += Eve.deltaY; break;
        } },
        scrollAcross: (Eve, Axis) => { switch(Axis) {
        case 'X': R.Main.scrollTop  += Eve.deltaX; break;
        case 'Y': R.Main.scrollLeft += Eve.deltaY * (S.ARD == 'rtl' ? -1 : 1); break;
        } },
        move: (CW) => {
        if(!CW.Wheeled) return;
        WheelObserver.heat();
        R.moveBy({ Distance: CW.Distance, Duration: this.I.isScrollable() && S['content-draggable'][0] ? 123 : 0 });
        },
        toggleUtilities: (CW) => {
        if(!CW.Wheeled) return;
        WheelObserver.heat();
        this.I.Utilities.toggleGracefuly();
        },
        switchAxis: () => {
        if(!this.I.AxisSwitcher || Math.abs(WheelObserver.Progress) < 1) return;
        WheelObserver.heat();
        this.I.AxisSwitcher.switchAxis();
        },
        OverlaidUIs: []
        };
        document.addEventListener('wheel', Eve => E.dispatch('bibi:is-wheeling', Eve), E.Cpt1Psv0);
        E.add('bibi:loaded-item', Item => Item.contentDocument.addEventListener('wheel', Eve => E.dispatch('bibi:is-wheeling', Eve), E.Cpt1Psv0));
        E.add('bibi:opened', () => {
        [this.I.Menu, this.I.Slider].forEach(UI => {
        if(!UI.ownerDocument) return;
        UI.addEventListener('wheel', Eve => { Eve.preventDefault(); Eve.stopPropagation(); }, E.Cpt1Psv0);
        WheelObserver.OverlaidUIs.push(UI);
        });
        E.add('bibi:is-wheeling', WheelObserver.onWheel);
        O.HTML.classList.add('wheel-active');
        });
        E.dispatch('bibi:created-wheel-observer');
        }};
    }
}
