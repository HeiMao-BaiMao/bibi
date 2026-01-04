import sML from 'sml.js';

export default class TouchObserver {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.TouchObserver = { create: () => {
        const TouchObserver = this.I.TouchObserver = {
        observeElementHover: (Ele) => {
        if(!Ele.BibiHoverObserver) {
        Ele.BibiHoverObserver = {
        onHover:   (Eve) => E.dispatch(Ele, 'bibi:hovered', Eve),
        onUnHover: (Eve) => E.dispatch(Ele, 'bibi:unhovered', Eve)
        };
        Ele.addEventListener(E['pointerover'], Eve => Ele.BibiHoverObserver.onHover(Eve));
        Ele.addEventListener(E['pointerout'],  Eve => Ele.BibiHoverObserver.onUnHover(Eve));
        }
        return Ele;
        },
        setElementHoverActions: (Ele) => {
        E.add(Ele, 'bibi:hovered', Eve => { if(Ele.Hover || (Ele.isAvailable && !Ele.isAvailable(Eve))) return Ele;
        Ele.Hover = true;
        Ele.classList.add('hover');
        if(Ele.showHelp) Ele.showHelp();
        return Ele;
        });
        E.add(Ele, 'bibi:unhovered', Eve => { if(!Ele.Hover) return Ele;
        Ele.Hover = false;
        Ele.classList.remove('hover');
        if(Ele.hideHelp) Ele.hideHelp();
        return Ele;
        });
        return Ele;
        },
        observeElementTap: (Ele, Opt = {}) => {
        if(!Ele.BibiTapObserver) { const TimeLimit = { D2U: 300, U2D: 300 };
        Ele.BibiTapObserver = {
        care: Opt.PreventDefault ? (Opt.StopPropagation ? _ => _.preventDefault() || _.stopPropagation() : _ => _.preventDefault()) : (Opt.StopPropagation ? _ => _.stopPropagation() : () => {}),
        onPointerDown: function(Eve) {
        if((typeof Eve.buttons == 'number' && Eve.buttons !== 1) || Eve.ctrlKey) return true;
        this.care(Eve);
        clearTimeout(this.Timer_forgetFloating);
        clearTimeout(this.Timer_fireTap);
        const DownTime = Date.now();
        this.Touching = { Time: DownTime, Coord: O.getBibiEventCoord(Eve), Event: Eve };
        if(!this.Floating) return;
        if((DownTime - this.Floating.Time) < TimeLimit.U2D) {
        this.Floating.PreviousTouching.Event.preventDefault();
        this.Floating.Event.preventDefault();
        Eve.preventDefault();
        } else {
        delete this.Floating;
        }
        },
        onPointerUp: function(Eve) {
        this.care(Eve);
        if(!this.Touching) return;
        const UpTime = Date.now();
        if((UpTime - this.Touching.Time) < TimeLimit.D2U) {
        const TouchEndCoord = O.getBibiEventCoord(Eve);
        if(Math.abs(TouchEndCoord.X - this.Touching.Coord.X) < 3 && Math.abs(TouchEndCoord.Y - this.Touching.Coord.Y) < 3) {
        let SDT = 0;
        const Floating = { Time: UpTime, Event: Eve, PreviousTouching: this.Touching };
        if(!this.Floating) {
        SDT = 1;
        this.Floating = Object.assign(Floating, { WaitingFor: 2 });
        } else {
        SDT = this.Floating.WaitingFor;
        this.Floating = Object.assign(Floating, { WaitingFor: ++this.Floating.WaitingFor });
        }
        this.Timer_forgetFloating = setTimeout(() => { delete this.Floating; }, TimeLimit.U2D);
        this.Timer_fireTap = setTimeout(() => { switch(SDT) {
        case 1: return Ele.BibiTapObserver.onTap(      Eve);
        case 2: return Ele.BibiTapObserver.onDoubleTap(Eve);
        case 3: return Ele.BibiTapObserver.onTripleTap(Eve);
        }}, TimeLimit.U2D);
        } else {
        delete this.Floating;
        }
        }
        delete this.Touching;
        },
        onTap:       (Eve) => E.dispatch(Ele, 'bibi:tapped'      , Eve),
        onDoubleTap: (Eve) => E.dispatch(Ele, 'bibi:doubletapped', Eve),
        onTripleTap: (Eve) => E.dispatch(Ele, 'bibi:tripletapped', Eve)
        };
        Ele.addEventListener(E['pointerdown'], Eve => Ele.BibiTapObserver.onPointerDown(Eve));
        Ele.addEventListener(E['pointerup'],   Eve => Ele.BibiTapObserver.onPointerUp(Eve));
        }
        return Ele;
        },
        setElementTapActions: (Ele) => {
        const onTap = (() => { switch(Ele.Type) {
        case 'toggle': return (Eve) => { if(Ele.UIState == 'disabled') return false;
        this.I.setUIState(Ele, Ele.UIState == 'default' ? 'active' : 'default');
        };
        case 'radio': return (Eve) => { if(Ele.UIState == 'disabled') return false;
        Ele.ButtonGroup.Buttons.forEach(Button => { if(Button != Ele) this.I.setUIState(Button, ''); });
        this.I.setUIState(Ele, 'active');
        };
        default: return (Eve) => { if(Ele.UIState == 'disabled') return false;
        this.I.setUIState(Ele, 'active');
        clearTimeout(Ele.Timer_deactivate);
        Ele.Timer_deactivate = setTimeout(() => this.I.setUIState(Ele, Ele.UIState == 'disabled' ? 'disabled' : ''), 200);
        };
        } })();
        E.add(Ele, 'bibi:tapped', Eve => { if((Ele.isAvailable && !Ele.isAvailable(Eve)) || (Ele.UIState == 'disabled') || (Ele.UIState == 'active' && Ele.Type == 'radio')) return Ele;
        onTap(Eve);
        if(Ele.hideHelp) Ele.hideHelp();
        if(Ele.note) setTimeout(Ele.note, 0);
        return Ele;
        });
        return Ele;
        },
        PointerEventNames: O.TouchOS ? [['touchstart', 'mousedown'], ['touchend', 'mouseup'], ['touchmove', 'mousemove']] : document.onpointermove !== undefined ? ['pointerdown', 'pointerup', 'pointermove'] : ['mousedown', 'mouseup', 'mousemove'],
        PreviousPointerCoord: { X: 0, Y: 0 },
        activateHTML: (HTML) => {
        TouchObserver.observeElementTap(HTML); const TOPENs = TouchObserver.PointerEventNames;
        E.add(HTML, 'bibi:tapped',       Eve => E.dispatch('bibi:tapped',         Eve));
        E.add(HTML, 'bibi:doubletapped', Eve => E.dispatch('bibi:doubletapped',   Eve)); //HTML.ownerDocument.addEventListener('dblclick', Eve => { Eve.preventDefault(); Eve.stopPropagation(); return false; });
        E.add(HTML, 'bibi:tripletapped', Eve => E.dispatch('bibi:tripletapped',   Eve));
        E.add(HTML, TOPENs[0],           Eve => E.dispatch('bibi:downed-pointer', Eve), E.Cpt1Psv0);
        E.add(HTML, TOPENs[1],           Eve => E.dispatch('bibi:upped-pointer',  Eve), E.Cpt1Psv0);
        E.add(HTML, TOPENs[2],           Eve => {
        const CC = O.getBibiEventCoord(Eve), PC = TouchObserver.PreviousPointerCoord;
        E.dispatch((PC.X != CC.X || PC.Y != CC.Y) ? 'bibi:moved-pointer' : 'bibi:stopped-pointer', Eve);
        TouchObserver.PreviousPointerCoord = CC;
        //Eve.preventDefault();
        Eve.stopPropagation();
        }, E.Cpt1Psv0);
        }
        }
        const checkTapAvailability = (BibiEvent) => {
        switch(S.RVM) {
        case 'horizontal': if(BibiEvent.Coord.Y > window.innerHeight - O.Scrollbars.Height) return false; else break;
        case 'vertical':   if(BibiEvent.Coord.X > window.innerWidth  - O.Scrollbars.Width)  return false; else break;
        }
        if(BibiEvent.Target.ownerDocument) {
        if(O.isPointableContent(BibiEvent.Target)) return false;
        if(this.I.Slider.ownerDocument && (BibiEvent.Target == this.I.Slider || this.I.Slider.contains(BibiEvent.Target))) return false;
        }
        return true;
        };
        E.bind('bibi:readied',            (    ) => TouchObserver.activateHTML(   O.HTML));
        E.bind('bibi:postprocessed-item', (Item) => TouchObserver.activateHTML(Item.HTML));
        E.add('bibi:tapped', Eve => { if(this.I.isPointerStealth()) return false;
        if(this.I.OpenedSubpanel) return this.I.OpenedSubpanel.close() && false;
        const BibiEvent = O.getBibiEvent(Eve);
        if(!checkTapAvailability(BibiEvent)) return false;
        return BibiEvent.Division.X == 'center' && BibiEvent.Division.Y == 'middle' ? E.dispatch('bibi:tapped-center', Eve) : E.dispatch('bibi:tapped-not-center', Eve);
        });
        E.add('bibi:doubletapped', Eve => { if(this.I.isPointerStealth() || !L.Opened) return false;
        if(this.I.OpenedSubpanel) return this.I.OpenedSubpanel.close() && false;
        const BibiEvent = O.getBibiEvent(Eve);
        if(!checkTapAvailability(BibiEvent)) return false;
        return BibiEvent.Division.X == 'center' && BibiEvent.Division.Y == 'middle' ? E.dispatch('bibi:doubletapped-center', Eve) : E.dispatch('bibi:doubletapped-not-center', Eve);
        });
        E.add('bibi:tapped-center', () => this.I.Utilities.toggleGracefuly());
        E.dispatch('bibi:created-touch-observer');
        }};
    }
}
