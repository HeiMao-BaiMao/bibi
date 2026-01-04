import sML from 'sml.js';

export default class Arrows {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.Arrows = { create: () => { if(!S['use-arrows']) return I.Arrows = null;
        const Arrows = I.Arrows = {
        navigate: () => setTimeout(() => {
        [Arrows.Back, Arrows.Forward].forEach(Arrow => I.Flipper.isAbleToFlip(Arrow.Distance) ? Arrow.classList.add('glowing') : false);
        setTimeout(() => [Arrows.Back, Arrows.Forward].forEach(Arrow => Arrow.classList.remove('glowing')), 1234);
        }, 400),
        toggleState: () => [Arrows.Back, Arrows.Forward].forEach(Arrow => {
        const Availability = I.Flipper.isAbleToFlip(Arrow.Distance);
        Arrow.classList.toggle(  'available',  Availability);
        Arrow.classList.toggle('unavailable', !Availability);
        }),
        areAvailable: (BibiEvent) => {
        if(!L.Opened) return false;
        if(I.OpenedSubpanel) return false;
        if(I.Panel && I.Panel.UIState == 'active') return false;
        //if(BibiEvent.Coord.Y < I.Menu.Height/* * 1.5*/) return false;
        const Buf = 3;
        if(BibiEvent.Coord.X <= Buf || BibiEvent.Coord.Y <= Buf) return false;
        else if(S.ARA == 'horizontal') { if(BibiEvent.Coord.X >= window.innerWidth  - Buf || BibiEvent.Coord.Y >= window.innerHeight - O.Scrollbars.Height - Buf) return false; }
        else if(S.ARA == 'vertical'  ) { if(BibiEvent.Coord.Y >= window.innerHeight - Buf || BibiEvent.Coord.X >= window.innerWidth  - O.Scrollbars.Width  - Buf) return false; }
        if(BibiEvent.Target.ownerDocument.documentElement == O.HTML) {
        if(BibiEvent.Target == O.HTML || BibiEvent.Target == O.Body || BibiEvent.Target == I.Menu) return true;
        if(/^(bibi-main|bibi-arrow|bibi-help|bibi-poweredby)/.test(BibiEvent.Target.id)) return true;
        if(/^(spread|item|page)( |-|$)/.test(BibiEvent.Target.className)) return true;
        } else {
        return O.isPointableContent(BibiEvent.Target) ? false : true;
        }
        return false;
        }
        };
        O.HTML.classList.add('arrows-active');
        Arrows.Back    = O.Body.appendChild(sML.create('div', { className: 'bibi-arrow', id: 'bibi-arrow-back',    Labels: { default: { default: `Back`,    ja: `戻る` } }, Distance: -1 }));
        Arrows.Forward = O.Body.appendChild(sML.create('div', { className: 'bibi-arrow', id: 'bibi-arrow-forward', Labels: { default: { default: `Forward`, ja: `進む` } }, Distance:  1 }));
        Arrows[-1] = Arrows.Forward.Pair = I.Flipper.Back.Arrow    = Arrows.Back;
        Arrows[ 1] = Arrows.Back.Pair    = I.Flipper.Forward.Arrow = Arrows.Forward;
        [Arrows.Back, Arrows.Forward].forEach(Arrow => {
        I.setFeedback(Arrow);
        const FunctionsToBeCanceled = [Arrow.showHelp, Arrow.hideHelp, Arrow.BibiTapObserver.onTap, Arrow.BibiTapObserver.onDoubleTap];
        if(!O.TouchOS) FunctionsToBeCanceled.push(Arrow.BibiHoverObserver.onHover, Arrow.BibiHoverObserver.onUnHover);
        FunctionsToBeCanceled.forEach(f2BC => f2BC = () => {});
        });
        E.add('bibi:commands:move-by', Distance => { // indicate direction
        if(!L.Opened || typeof (Distance *= 1) != 'number' || !isFinite(Distance) || !(Distance = Math.round(Distance))) return false;
        return E.dispatch(Distance < 0 ? Arrows.Back : Arrows.Forward, 'bibi:tapped', null);
        });
        E.add('bibi:loaded-item', Item => {/*
        sML.appendCSSRule(Item.contentDocument, 'html[data-bibi-cursor="left"]',   'cursor: w-resize;');
        sML.appendCSSRule(Item.contentDocument, 'html[data-bibi-cursor="right"]',  'cursor: e-resize;');
        sML.appendCSSRule(Item.contentDocument, 'html[data-bibi-cursor="top"]',    'cursor: n-resize;');
        sML.appendCSSRule(Item.contentDocument, 'html[data-bibi-cursor="bottom"]', 'cursor: s-resize;');*/
        sML.appendCSSRule(Item.contentDocument, 'html[data-bibi-cursor]', 'cursor: pointer;');
        });
        E.add('bibi:opened',       () => setTimeout(() => { Arrows.toggleState(); Arrows.navigate(); }, 123));
        E.add('bibi:scrolled',     () => Arrows.toggleState());
        E.add('bibi:changed-view', () => Arrows.navigate());
        E.dispatch('bibi:created-arrows');
        // Optimize to Scrollbar Size
        (_ => {
        _('html.appearance-horizontal.book-full-height:not(.slider-opened)',       'height', O.Scrollbars.Width);
        _('html.appearance-horizontal:not(.book-full-height):not(.slider-opened)', 'height', O.Scrollbars.Width + I.Menu.Height);
        _('html.appearance-vertical:not(.slider-opened)',                          'width',  O.Scrollbars.Width);
        })((Context, WidthOrHeight, Margin) => sML.appendCSSRule(
        `${ Context } div#bibi-arrow-back, ${ Context } div#bibi-arrow-forward`,
        `${ WidthOrHeight }: calc(100% - ${ Margin }px); ${ WidthOrHeight }: calc(100v${ WidthOrHeight.charAt(0) } - ${ Margin }px);`
        ));
        }};
    }
}
