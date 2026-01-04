import sML from 'sml.js';

export default class Loupe {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L; const C = I.C;
        this.I.Loupe = { create: () => {
        if(S['loupe-max-scale']      <= 1) S['loupe-max-scale']      = 4.0;
        if(S['loupe-scale-per-step'] <= 1) S['loupe-scale-per-step'] = 1.6;
        if(S['loupe-scale-per-step'] > S['loupe-max-scale']) S['loupe-scale-per-step'] = S['loupe-max-scale'];
        const Loupe = this.I.Loupe = {
        CurrentTransformation: { Scale: 1, TranslateX: 0, TranslateY: 0 },
        defineZoomOutPropertiesForUtilities: () => {
        const BookMargin = {
        Top: S['use-menubar'] && S['use-full-height'] ? I.Menu.Height : 0,
        Right: S.ARA == 'vertical'   ? I.Slider.Size : 0,
        Bottom: S.ARA == 'horizontal' ? I.Slider.Size : 0,
        Left: 0
        };
        const Tfm = {};
        if(S.ARA == 'horizontal') {
        Tfm.Scale = (R.Main.offsetHeight - (BookMargin.Top + BookMargin.Bottom)) / (R.Main.offsetHeight - (S.ARA == S.SLA && (S.RVM != 'paged' || I.Slider.ownerDocument) ? O.Scrollbars.Height : 0));
        Tfm.TranslateX = 0;
        } else {
        Tfm.Scale = Math.min(
        (R.Main.offsetWidth  - BookMargin.Right) / (R.Main.offsetWidth - O.Scrollbars.Width),
        (R.Main.offsetHeight - BookMargin.Top  ) /  R.Main.offsetHeight
        );
        Tfm.TranslateX = R.Main.offsetWidth * (1 - Tfm.Scale) / -2;
        //OP.Left = Tfm.TranslateX * -1;
        }
        Tfm.TranslateY = BookMargin.Top - (R.Main.offsetHeight) * (1 - Tfm.Scale) / 2;
        const St = (O.Body['offset' + C.A_SIZE_L] / Tfm.Scale - R.Main['offset' + C.A_SIZE_L]);
        const OP = {};
        OP[C.A_BASE_B] = St / 2 + (!S['use-full-height'] && S.ARA == 'vertical' ? I.Menu.Height : 0);
        OP[C.A_BASE_A] = St / 2;
        const IP = {};
        if(S.ARA == S.SLA) IP[S.ARA == 'horizontal' ? 'Right' : 'Bottom'] = St / 2;
        Loupe.ZoomOutPropertiesForUtilities = {
        Transformation: Tfm,
        Stretch: St,
        OuterPadding: OP,
        InnerPadding: IP
        };
        },
        getNormalizedTransformation: (Tfm) => {
        const NTfm = Object.assign({}, Loupe.CurrentTransformation);
        if(Tfm) {
        if(typeof Tfm.Scale      == 'number') NTfm.Scale      = Tfm.Scale;
        if(typeof Tfm.TranslateX == 'number') NTfm.TranslateX = Tfm.TranslateX;
        if(typeof Tfm.TranslateY == 'number') NTfm.TranslateY = Tfm.TranslateY;
        }
        return NTfm;
        },
        getActualTransformation: (Tfm) => {
        const ATfm = Loupe.getNormalizedTransformation(Tfm);
        if(ATfm.Scale == 1 && Loupe.IsZoomedOutForUtilities) {
        const Tfm4U = Loupe.ZoomOutPropertiesForUtilities.Transformation;
        ATfm.Scale      *= Tfm4U.Scale;
        ATfm.TranslateX += Tfm4U.TranslateX;
        ATfm.TranslateY += Tfm4U.TranslateY;
        }
        return ATfm;
        },
        transform: (Tfm, Opt = {}) => new Promise((resolve, reject) => {
        // Tfm: Transformation
        Tfm = Loupe.getNormalizedTransformation(Tfm);
        const CTfm = Loupe.CurrentTransformation;
        //if(Tfm.Scale == CTfm.Scale && Tfm.TranslateX == CTfm.TranslateX && Tfm.TranslateY == CTfm.TranslateY) return resolve();
        Loupe.Transforming = true;
        clearTimeout(Loupe.Timer_onTransformEnd);
        O.HTML.classList.add('transforming');
        if(Tfm.Scale > 1) {
        const OverflowX = window.innerWidth  * (0.5 * (Tfm.Scale - 1)),
        OverflowY = window.innerHeight * (0.5 * (Tfm.Scale - 1));
        Tfm.TranslateX = sML.limitMinMax(Tfm.TranslateX, OverflowX * -1 - (S.RVM != 'vertical' ? 0 : I.Slider.UIState == 'active' ? I.Slider.Size - O.Scrollbars.Width  : 0) + O.Scrollbars.Width , OverflowX);
        Tfm.TranslateY = sML.limitMinMax(Tfm.TranslateY, OverflowY * -1 - (S.RVM == 'vertical' ? 0 : I.Slider.UIState == 'active' ? I.Slider.Size - O.Scrollbars.Height : 0) + O.Scrollbars.Height, OverflowY + (I.Menu.UIState == 'active' ? I.Menu.Height : 0));
        }
        Loupe.CurrentTransformation = Tfm;
        const ATfm = Loupe.getActualTransformation(Tfm);
        sML.style(R.Main, {
        transform: (Ps => {
        if(ATfm.TranslateX && ATfm.TranslateY) Ps.push( 'translate(' + ATfm.TranslateX + 'px' + ', ' + ATfm.TranslateY + 'px' + ')');
        else if(ATfm.TranslateX                   ) Ps.push('translateX(' + ATfm.TranslateX + 'px'                                 + ')');
        else if(                   ATfm.TranslateY) Ps.push('translateY('                                 + ATfm.TranslateY + 'px' + ')');
        if(ATfm.Scale != 1                   ) Ps.push(     'scale(' + ATfm.Scale                                             + ')');
        return Ps.length ? Ps.join(' ') : '';
        })([])
        });
        Loupe.Timer_onTransformEnd = setTimeout(() => {
        if(Loupe.CurrentTransformation.Scale == 1) O.HTML.classList.remove('zoomed-in'), O.HTML.classList.remove('zoomed-out');
        else if(Loupe.CurrentTransformation.Scale <  1) O.HTML.classList.remove('zoomed-in'), O.HTML.classList.add(   'zoomed-out');
        else                                      O.HTML.classList.add(   'zoomed-in'), O.HTML.classList.remove('zoomed-out');
        O.HTML.classList.remove('transforming');
        Loupe.Transforming = false;
        resolve();
        E.dispatch('bibi:transformed-book', {
        Transformation: Tfm,
        ActualTransformation: ATfm,
        Temporary: Opt.Temporary
        });
        }, 345);
        }),
        scale: (Scl, Opt = {}) => { // Scl: Scale
        Scl = typeof Scl == 'number' ? sML.limitMinMax(Scl, 1, S['loupe-max-scale']) : 1;
        if(!Opt.Stepless) Scl = Math.round(Scl * 100) / 100;
        const CTfm = Loupe.CurrentTransformation;
        if(Scl == CTfm.Scale) return Promise.resolve();
        E.dispatch('bibi:changes-scale', Scl);
        let TX = 0, TY = 0;
        if(Scl < 1) {
        TX = R.Main.offsetWidth  * (1 - Scl) / 2;
        TY = R.Main.offsetHeight * (1 - Scl) / 2;
        } else if(Scl > 1) {
        if(Loupe.UIState != 'active') return Promise.resolve();
        if(!Opt.Center) Opt.Center = { X: window.innerWidth / 2, Y: window.innerHeight / 2 };
        TX = CTfm.TranslateX + (Opt.Center.X - window.innerWidth  / 2 - CTfm.TranslateX) * (1 - Scl / CTfm.Scale);
        TY = CTfm.TranslateY + (Opt.Center.Y - window.innerHeight / 2 - CTfm.TranslateY) * (1 - Scl / CTfm.Scale);
        /* ↑↑↑↑ SIMPLIFIED ↑↑↑↑
        const CTfmOriginX = window.innerWidth  / 2 + CTfm.TranslateX;  TX = CTfm.TranslateX + (Opt.Center.X - (CTfmOriginX + (Opt.Center.X - CTfmOriginX) * (Scl / CTfm.Scale)));
        const CTfmOriginY = window.innerHeight / 2 + CTfm.TranslateY;  TY = CTfm.TranslateY + (Opt.Center.Y - (CTfmOriginY + (Opt.Center.Y - CTfmOriginY) * (Scl / CTfm.Scale)));
        //*/
        }
        return Loupe.transform({
        Scale: Scl,
        TranslateX: TX,
        TranslateY: TY
        });
        },
        BookStretchingEach: 0,
        transformToDefault: () => Loupe.transform({ Scale: 1, TranslateX: 0, TranslateY: 0 }),
        transformForUtilities: (IO) => {
        if(!Loupe.isAvailable()) return Promise.resolve();
        let cb = () => {};
        if(IO) {
        if(Loupe.IsZoomedOutForUtilities) return Promise.resolve();
        Loupe.IsZoomedOutForUtilities = true;
        const OP4U = Loupe.ZoomOutPropertiesForUtilities.OuterPadding, IP4U = Loupe.ZoomOutPropertiesForUtilities.InnerPadding;
        for(const Dir in OP4U) R.Main.style[     'padding' + Dir] = OP4U[Dir] + 'px';
        for(const Dir in IP4U) R.Main.Book.style['padding' + Dir] = IP4U[Dir] + 'px';
        Loupe.BookStretchingEach = Loupe.ZoomOutPropertiesForUtilities.Stretch / 2;
        } else {
        if(!Loupe.IsZoomedOutForUtilities) return Promise.resolve();
        Loupe.IsZoomedOutForUtilities = false;
        cb = () => {
        R.Main.style.padding = R.Main.Book.style.padding = '';
        Loupe.BookStretchingEach = 0;
        };
        }
        return Loupe.transform(null, { Temporary: true }).then(cb).then(() => I.Slider.ownerDocument ? I.Slider.progress() : undefined);
        },
        isAvailable: () => {
        if(!L.Opened) return false;
        if(Loupe.UIState != 'active') return false;
        //if(S.BRL == 'reflowable') return false;
        return true;
        },
        checkAndGetBibiEventForTaps: (Eve) => {
        if(!Eve || !Loupe.isAvailable()) return null;
        const BibiEvent = O.getBibiEvent(Eve);
        if(BibiEvent.Target.tagName) {
        if(/bibi-menu|bibi-slider/.test(BibiEvent.Target.id)) return null;
        if(O.isPointableContent(BibiEvent.Target)) return null;
        if(S.RVM == 'horizontal' && BibiEvent.Coord.Y > window.innerHeight - O.Scrollbars.Height) return null;
        }
        return BibiEvent;
        },
        onTap: (Eve, HowManyTaps) => {
        if(HowManyTaps == 1 && (!I.KeyObserver.ActiveKeys || !I.KeyObserver.ActiveKeys['Space'])) return Promise.resolve(); // Requires pressing space-key on single-tap.
        const BibiEvent = Loupe.checkAndGetBibiEventForTaps(Eve);
        if(!BibiEvent) return Promise.resolve();
        //if(HowManyTaps > 1 && (BibiEvent.Division.X != 'center' || BibiEvent.Division.Y != 'middle')) return Promise.resolve();
        Eve.preventDefault();
        try { Eve.target.ownerDocument.body.Item.contentWindow.getSelection().empty(); } catch(Err) {}
        if(Loupe.CurrentTransformation.Scale >= S['loupe-max-scale'] && !Eve.shiftKey) return Loupe.scale(1);
        return Loupe.scale(Loupe.CurrentTransformation.Scale * (Eve.shiftKey ? 1 / S['loupe-scale-per-step'] : S['loupe-scale-per-step']), { Center: BibiEvent.Coord });
        },
        onPointerDown: (Eve) => {
        Loupe.PointerDownCoord = O.getBibiEvent(Eve).Coord;
        Loupe.PointerDownTransformation = {
        Scale: Loupe.CurrentTransformation.Scale,
        TranslateX: Loupe.CurrentTransformation.TranslateX,
        TranslateY: Loupe.CurrentTransformation.TranslateY
        };
        },
        onPointerUp: (Eve) => {
        O.HTML.classList.remove('dragging');
        Loupe.Dragging = false;
        delete Loupe.PointerDownCoord;
        delete Loupe.PointerDownTransformation;
        },
        onPointerMove: (Eve) => {
        if(I.PinchObserver.Hot) return false;
        if(!Loupe.isAvailable()) return false;
        if(Loupe.CurrentTransformation.Scale == 1 || !Loupe.PointerDownCoord) return false;
        Eve.preventDefault();
        Loupe.Dragging = true;
        O.HTML.classList.add('dragging');
        const BibiEvent = O.getBibiEvent(Eve);
        clearTimeout(Loupe.Timer_TransitionRestore);
        sML.style(R.Main, { transition: 'none' }, { cursor: 'move' });
        Loupe.transform({
        Scale: Loupe.CurrentTransformation.Scale,
        TranslateX: Loupe.PointerDownTransformation.TranslateX + (BibiEvent.Coord.X - Loupe.PointerDownCoord.X),
        TranslateY: Loupe.PointerDownTransformation.TranslateY + (BibiEvent.Coord.Y - Loupe.PointerDownCoord.Y)
        });
        Loupe.Timer_TransitionRestore = setTimeout(() => sML.style(R.Main, { transition: '' }, { cursor: '' }), 234);
        }
        };
        I.isPointerStealth.addChecker(() => {
        if(Loupe.Dragging) return true;
        if(!I.KeyObserver.ActiveKeys || !I.KeyObserver.ActiveKeys['Space']) return false;
        return true;
        });
        I.setToggleAction(Loupe, {
        onopened: () => {
        //Loupe.defineZoomOutPropertiesForUtilities();
        O.HTML.classList.add('loupe-active');
        },
        onclosed: () => {
        Loupe.transformToDefault();
        O.HTML.classList.remove('loupe-active');
        }
        });
        E.add('bibi:commands:activate-loupe',   (   ) => Loupe.open());
        E.add('bibi:commands:deactivate-loupe', (   ) => Loupe.close());
        E.add('bibi:commands:toggle-loupe',     (   ) => Loupe.toggle());
        E.add('bibi:commands:scale',            Scale => Loupe.scale(Scale));
        E.add('bibi:tapped',                                         Eve => Loupe.onTap(Eve, 1));
        if(S['on-doubletap'] == 'zoom') E.add('bibi:doubletapped',   Eve => Loupe.onTap(Eve, 2));
        if(S['on-tripletap'] == 'zoom') E.add('bibi:tripletapped',   Eve => Loupe.onTap(Eve, 3));
        E.add('bibi:downed-pointer', Eve => Loupe.onPointerDown(Eve));
        E.add('bibi:upped-pointer',  Eve => Loupe.onPointerUp(Eve));
        E.add('bibi:moved-pointer',  Eve => Loupe.onPointerMove(Eve));
        if(S['zoom-out-for-utilities']) {
        E.add('bibi:opens-utilities',  () => Loupe.transformForUtilities(true ));
        E.add('bibi:closes-utilities', () => Loupe.transformForUtilities(false));
        }
        E.add('bibi:opened', () => Loupe.open());
        E.add('bibi:laid-out', () => Loupe.defineZoomOutPropertiesForUtilities());
        E.add('bibi:changed-view',  () => Loupe.transformToDefault());
        if(S['use-loupe']) {
        const ButtonGroup = I.Menu.R.addButtonGroup({
        Sticky: true,
        Tiled: true,
        id: 'bibi-buttongroup_loupe',
        Buttons: [{
        Labels: { default: { default: `Zoom-in`, ja: `拡大する` } },
        Icon: `<span class="bibi-icon bibi-icon-loupe bibi-icon-loupe-zoomin"></span>`,
        Help: true,
        action: () => Loupe.scale(Loupe.CurrentTransformation.Scale * S['loupe-scale-per-step']),
        updateState: function(State) { I.setUIState(this, typeof State == 'string' ? State : (Loupe.CurrentTransformation.Scale >= S['loupe-max-scale']) ? 'disabled' : 'default'); }
        }, { 
        Labels: { default: { default: `Reset Zoom-in/out`, ja: `元のサイズに戻す` } },
        Icon: `<span class="bibi-icon bibi-icon-loupe bibi-icon-loupe-reset"></span>`,
        Help: true,
        action: () => Loupe.scale(1),
        updateState: function(State) { I.setUIState(this, typeof State == 'string' ? State : (Loupe.CurrentTransformation.Scale == 1) ? 'disabled' : 'default'); }
        }, {
        Labels: { default: { default: `Zoom-out`, ja: `縮小する` } },
        Icon: `<span class="bibi-icon bibi-icon-loupe bibi-icon-loupe-zoomout"></span>`,
        Help: true,
        action: () => Loupe.scale(Loupe.CurrentTransformation.Scale / S['loupe-scale-per-step']),
        updateState: function(State) { I.setUIState(this, typeof State == 'string' ? State : (Loupe.CurrentTransformation.Scale <= 1) ? 'disabled' : 'default'); }
        }]
        });
        Loupe.updateButtonState = (State) => ButtonGroup.Buttons.forEach(Button => Button.updateState(State));
        E.add('bibi:opened',           () => Loupe.updateButtonState());
        E.add('bibi:transformed-book', () => Loupe.updateButtonState());
        }
        E.dispatch('bibi:created-loupe');
        }};
    }
}
