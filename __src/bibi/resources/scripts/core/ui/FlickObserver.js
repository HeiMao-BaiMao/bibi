import sML from 'sml.js';

export default class FlickObserver {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.FlickObserver = { create: () => {
        const FlickObserver = this.I.FlickObserver = {
        Moving: 0,
        getDegree: (_) => (Deg => Deg < 0 ? Deg + 360 : Deg)(Math.atan2(_.Y * -1, _.X) * 180 / Math.PI),
        onTouchStart: (Eve) => {
        if(!L.Opened) return;
        //if(S.RVM != 'paged' && O.TouchOS) return;
        if(FlickObserver.LastEvent) return FlickObserver.onTouchEnd();
        if(this.I.Loupe.Transforming) return;
        FlickObserver.LastEvent = Eve;
        const EventCoord = O.getBibiEventCoord(Eve);
        FlickObserver.StartedAt = {
        X: EventCoord.X,
        Y: EventCoord.Y,
        Item: Eve.target.ownerDocument.body.Item || null,
        TimeStamp: Eve.timeStamp,
        ScrollLeft: R.Main.scrollLeft,
        ScrollTop: R.Main.scrollTop,
        OriginList: this.I.PageObserver.updateCurrent().List
        };
        //Eve.preventDefault();
        E.add('bibi:moved-pointer', FlickObserver.onTouchMove);
        E.add('bibi:upped-pointer', FlickObserver.onTouchEnd);
        },
        cancel: () => {
        delete FlickObserver.StartedAt;
        delete FlickObserver.LastEvent;
        E.remove('bibi:moved-pointer', FlickObserver.onTouchMove);
        E.remove('bibi:upped-pointer', FlickObserver.onTouchEnd);
        FlickObserver.Moving = 0;
        },
        onTouchMove: (Eve) => {
        //if(Eve.touches && Eve.touches.length == 1 && O.getViewportZooming() <= 1) Eve.preventDefault();
        this.I.ScrollObserver.breakCurrentScrolling();
        if(FlickObserver.StartedAt) {
        if(!FlickObserver.Moving) {
        const TimeFromTouchStarted = Eve.timeStamp - FlickObserver.StartedAt.TimeStamp;
        if(!O.TouchOS && (Eve.type == 'mousemove' || Eve.pointerType == 'mouse')) { if(TimeFromTouchStarted < 234) return FlickObserver.cancel(); }
        else                                                                      { if(TimeFromTouchStarted > 234) return FlickObserver.cancel(); }
        FlickObserver.StartedAt.TimeStamp = Eve.timeStamp;
        }
        const EventCoord = O.getBibiEventCoord(Eve);
        const Passage = { X: EventCoord.X - FlickObserver.StartedAt.X, Y: EventCoord.Y - FlickObserver.StartedAt.Y };
        if(++FlickObserver.Moving <= 3) {
        const Deg = FlickObserver.getDegree(Passage);
        FlickObserver.StartedAt.LaunchingAxis = (315 <= Deg || Deg <=  45) || (135 <= Deg && Deg <= 225) ? 'X' :
        ( 45 <  Deg && Deg <  135) || (225 <  Deg && Deg <  315) ? 'Y' : '';
        }
        if(FlickObserver.StartedAt.LaunchingAxis == C.A_AXIS_B) {
        // Orthogonal
        } else {
        // Natural
        if(S.RVM != 'paged' && Eve.type == 'touchmove') return FlickObserver.cancel();
        if(S['content-draggable'][S.RVM == 'paged' ? 0 : 1] && this.I.isScrollable()) R.Main['scroll' + C.L_OOBL_L] = FlickObserver.StartedAt['Scroll' + C.L_OOBL_L] + Passage[C.L_AXIS_L] * -1;
        }
        Eve.preventDefault();
        if(FlickObserver.StartedAt.Item) {
        FlickObserver.StartedAt.Item.HTML.classList.add('bibi-flick-hot');
        FlickObserver.StartedAt.Item.contentWindow.getSelection().empty();
        }
        FlickObserver.LastEvent = Eve;
        if(EventCoord[C.A_AXIS_L] <= 0 || EventCoord[C.A_AXIS_L] >= R.Stage[C.A_SIZE_L] || EventCoord[C.A_AXIS_B] <= 0 || EventCoord[C.A_AXIS_B] >= R.Stage[C.A_SIZE_B]) return FlickObserver.onTouchEnd(Eve, { Swipe: true });
        }
        },
        onTouchEnd: (Eve, Opt) => {
        if(!Eve) Eve = FlickObserver.LastEvent;
        E.remove('bibi:moved-pointer', FlickObserver.onTouchMove);
        E.remove('bibi:upped-pointer', FlickObserver.onTouchEnd);
        FlickObserver.Moving = 0;
        let cb = undefined, Par = {};
        if(FlickObserver.StartedAt) {
        const EventCoord = O.getBibiEventCoord(Eve);
        const Passage = { X: EventCoord.X - FlickObserver.StartedAt.X, Y: EventCoord.Y - FlickObserver.StartedAt.Y };
        if(FlickObserver.StartedAt.Item) FlickObserver.StartedAt.Item.HTML.classList.remove('bibi-flick-hot');
        if(!this.I.Loupe.Transforming) {
        if(FlickObserver.StartedAt.LaunchingAxis == C.A_AXIS_B && Math.abs(Passage[C.A_AXIS_B] / 100) >= 1) {
        // Orthogonal Pan/Releace
        cb = FlickObserver.getOrthogonalTouchMoveFunction();
        }
        if(!cb && (Math.abs(Passage.X) >= 3 || Math.abs(Passage.Y) >= 3)) {
        // Moved (== not Tap)
        Eve.preventDefault();
        Par.Speed = Math.sqrt(Math.pow(Passage.X, 2) + Math.pow(Passage.Y, 2)) / (Eve.timeStamp - FlickObserver.StartedAt.TimeStamp);
        Par.Deg = FlickObserver.getDegree(Passage);
        if(O.getViewportZooming() <= 1 && (Eve.timeStamp - FlickObserver.StartedAt.TimeStamp) <= 300) {
        Par.OriginList = FlickObserver.StartedAt.OriginList;
        cb = (Opt && Opt.Swipe) ? FlickObserver.onSwipe : FlickObserver.onFlick;
        } else if(this.I.isScrollable()) {
        cb = FlickObserver.onPanRelease;
        }
        } else {
        // Not Moved (== Tap)
        // [[[[ Do Nothing ]]]] (to avoid conflicts with other tap events on other UIs like Arrows.)
        }
        }
        delete FlickObserver.StartedAt;
        }
        delete FlickObserver.LastEvent;
        return (cb ? cb(Eve, Par) : Promise.resolve());
        },
        onFlick: (Eve, Par) => {
        if(S.RVM != 'paged' && !S['content-draggable'][S.RVM == 'paged' ? 0 : 1]) return Promise.resolve();
        if(typeof Par.Deg != 'number') return Promise.resolve();
        const Deg = Par.Deg;
        const Dir = (330 <= Deg || Deg <=  30) ? 'left' /* to right */ :
        ( 60 <= Deg && Deg <= 120) ? 'bottom' /* to top */ :
        (150 <= Deg && Deg <= 210) ? 'right' /* to left */ :
        (240 <= Deg && Deg <= 300) ? 'top' /* to bottom */ : '';
        const Dist = C.d2d(Dir, this.I.orthogonal('touch-moves') == 'move');
        if(!Dist) {
        // Orthogonal (not for "move")
        return new Promise(resolve => {
        FlickObserver.getOrthogonalTouchMoveFunction()();
        resolve();
        });
        } else if(S.RVM == 'paged' || S.RVM != (/^[lr]/.test(Dir) ? 'horizontal' : /^[tb]/.test(Dir) ? 'vertical' : '')) {
        // Paged || Scrolling && Orthogonal
        const PageIndex = (Dist > 0 ? Par.OriginList.slice(-1)[0].Page.Index : Par.OriginList[0].Page.Index);
        return R.focusOn({
        Destination: { Page: R.Pages[PageIndex + Dist] ? R.Pages[PageIndex + Dist] : R.Pages[PageIndex] },
        Duration: !this.I.isScrollable() ? 0 : S.RVM != 'paged' || S['content-draggable'][0] ? 123 : 0
        });
        } else {
        // Scrolling && Natural
        return R.scrollBy({
        Distance: Dist * (Par.Speed ? sML.limitMinMax(Math.round(Par.Speed * 100) * 0.08, 0.33, 10) * 333 / (S.SLD == 'ttb' ? R.Stage.Height : R.Stage.Width) : 1),
        Duration: 1234,
        Cancelable: true,
        ease: (_) => (Math.pow((_ - 1), 4) - 1) * -1
        });
        }
        },
        onSwipe: (Eve, Par) => FlickObserver.onFlick(Eve, Par),
        onPanRelease: (Eve, Par) => {
        if(S.RVM != 'paged' || !S['content-draggable'][0]) return Promise.resolve(); // Only for Paged View ====
        const Deg = Par.Deg;
        const Dir = (270 <  Deg || Deg <   90) ? 'left'  /* to right */ :
        ( 90 <  Deg && Deg <  270) ? 'right' /* to left  */ : '';
        const Dist = C.d2d(Dir);
        const CurrentList = this.I.PageObserver.updateCurrent().List;
        return R.focusOn({
        Destination: { Page: (Dist >= 0 ? CurrentList.slice(-1)[0].Page : CurrentList[0].Page) },
        Duration: !this.I.isScrollable() ? 0 : S['content-draggable'][0] ? 123 : 0
        });
        },
        getOrthogonalTouchMoveFunction: () => { switch(this.I.orthogonal('touch-moves')) {
        case 'switch': if(this.I.AxisSwitcher) return this.I.AxisSwitcher.switchAxis; break;
        case 'utilities': return this.I.Utilities.toggleGracefuly; break;
        } },
        getCNPf: (Ele) => Ele.ownerDocument == document ? '' : 'bibi-',
        activateElement: (Ele) => { if(!Ele) return false;
        Ele.addEventListener(E['pointerdown'], FlickObserver.onTouchStart, E.Cpt1Psv0);
        const CNPf = FlickObserver.getCNPf(Ele);
        /**/                             Ele.ownerDocument.documentElement.classList.add(CNPf + 'flick-active');
        if(this.I.isScrollable()) Ele.ownerDocument.documentElement.classList.add(CNPf + 'flick-scrollable');
        },
        deactivateElement: (Ele) => { if(!Ele) return false;
        Ele.removeEventListener(E['pointerdown'], FlickObserver.onTouchStart, E.Cpt1Psv0);
        const CNPf = FlickObserver.getCNPf(Ele);
        Ele.ownerDocument.documentElement.classList.remove(CNPf + 'flick-active');
        Ele.ownerDocument.documentElement.classList.remove(CNPf + 'flick-scrollable');
        }
        };
        FlickObserver.activateElement(R.Main);
        E.add('bibi:loaded-item', Item => FlickObserver.activateElement(Item.HTML));
        E.dispatch('bibi:created-flick-observer');
        }};
    }
}
