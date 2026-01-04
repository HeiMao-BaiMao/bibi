import sML from 'sml.js';

export default class Slider {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L; const C = I.C;
        
        Object.assign(this, {
            create: () => {
                if(!S['use-slider']) return false;
                const Slider = this.Slider = O.Body.appendChild(sML.create('div', { id: 'bibi-slider',
                    RailProgressMode: 'end', // or 'center'
                    Size: this.I.Slider.Size,
                    initialize: () => {
                        const EdgebarBox = Slider.appendChild(sML.create('div', { id: 'bibi-slider-edgebar-box' }));
                        Slider.Edgebar = EdgebarBox.appendChild(sML.create('div', { id: 'bibi-slider-edgebar' }));
                        Slider.Rail    = EdgebarBox.appendChild(sML.create('div', { id: 'bibi-slider-rail' }));
                        Slider.RailGroove   = Slider.Rail.appendChild(sML.create('div', { id: 'bibi-slider-rail-groove' }));
                        Slider.RailProgress = Slider.RailGroove.appendChild(sML.create('div', { id: 'bibi-slider-rail-progress' }));
                        Slider.Thumb   = EdgebarBox.appendChild(sML.create('div', { id: 'bibi-slider-thumb', Labels: { default: { default: `Slider Thumb`, ja: `スライダー上の好きな位置からドラッグを始められます` } } })); this.I.setFeedback(Slider.Thumb);
                        if(S['use-history']) {
                            Slider.classList.add('bibi-slider-with-history');
                            Slider.History        = Slider.appendChild(sML.create('div', { id: 'bibi-slider-history' }));
                            Slider.History.add    = (Destination) => this.I.History.add({ UI: Slider, SumUp: false, Destination: Destination })
                            Slider.History.Button = Slider.History.appendChild(this.I.createButtonGroup()).addButton({ id: 'bibi-slider-history-button',
                                Type: 'normal',
                                Labels: { default: { default: `History Back`, ja: `移動履歴を戻る` } },
                                Help: false,
                                Icon: `<span class="bibi-icon bibi-icon-history"></span>`,
                                action: () => this.I.History.back(),
                                update: function() {
                                    this.Icon.style.transform = `rotate(${ 360 * (this.I.History.List.length - 1) }deg)`;
                                    if(this.I.History.List.length <= 1) this.I.setUIState(this, 'disabled');
                                    else if(this.UIState == 'disabled') this.I.setUIState(this, 'default');
                                }
                            });
                            this.I.History.Updaters.push(() => Slider.History.Button.update());
                        }
                        if(S['use-nombre']) {
                            E.add(Slider.Edgebar, ['mouseover', 'mousemove'], Eve => { if(!Slider.Touching) this.I.Nombre.progress({ List: [{ Page: Slider.getPointedPage(O.getBibiEventCoord(Eve)[C.A_AXIS_L]) }] }); });
                            E.add(Slider.Edgebar,  'mouseout',                Eve => { if(!Slider.Touching) this.I.Nombre.progress(); });
                        }
                    },
                    resetUISize: () => {
                        Slider.MainLength = R.Main['scroll' + C.L_SIZE_L];
                        const ThumbLengthPercent = R.Main['offset' + C.L_SIZE_L] / Slider.MainLength * 100;
                        Slider.RailGroove.style[C.A_SIZE_b] = Slider.Thumb.style[C.A_SIZE_b] = '';
                        Slider.RailGroove.style[C.A_SIZE_l] = (100 - (Slider.RailProgressMode == 'center' ? ThumbLengthPercent : 0)) + '%';
                        Slider.Thumb.style[C.A_SIZE_l] =                                               ThumbLengthPercent       + '%';
                        setTimeout(() => Slider.Thumb.classList.toggle('min', (STACS => STACS.width == STACS.height)(getComputedStyle(Slider.Thumb, '::after'))), 0);
                        Slider.Edgebar.Before = O.getElementCoord(Slider.Edgebar)[C.A_AXIS_L];
                        Slider.Edgebar.Length = Slider.Edgebar['offset' + C.A_SIZE_L];
                        Slider.Edgebar.After  = Slider.Edgebar.Before + Slider.Edgebar.Length;
                        Slider.RailGroove.Before = O.getElementCoord(Slider.RailGroove)[C.A_AXIS_L];
                        Slider.RailGroove.Length = Slider.RailGroove['offset' + C.A_SIZE_L];
                        Slider.RailGroove.After  = Slider.RailGroove.Before + Slider.RailGroove.Length;
                        Slider.Thumb.Length = Slider.Thumb['offset' + C.A_SIZE_L];
                    },
                    onTouchStart: (Eve) => {
                        this.I.ScrollObserver.forceStopScrolling();
                        Eve.preventDefault();
                        Slider.Touching = true;
                        Slider.StartedAt = {
                            ThumbBefore: O.getElementCoord(Slider.Thumb)[C.A_AXIS_L],
                            RailProgressLength: Slider.RailProgress['offset' + C.A_SIZE_L],
                            MainScrollBefore: Math.ceil(R.Main['scroll' + C.L_OOBL_L]) // Android Chrome returns scrollLeft/Top value of an element with slightly less float than actual.
                        };
                        Slider.StartedAt.Coord = Eve.target == Slider.Thumb ? O.getBibiEventCoord(Eve)[C.A_AXIS_L] : Slider.StartedAt.ThumbBefore + Slider.Thumb.Length / 2;
                        clearTimeout(Slider.Timer_onTouchEnd);
                        O.HTML.classList.add('slider-sliding');
                        E.add('bibi:moved-pointer', Slider.onTouchMove);
                    },
                    onTouchMove: (Eve) => {
                        clearTimeout(Slider.Timer_move);
                        const TouchMoveCoord = O.getBibiEventCoord(Eve)[C.A_AXIS_L];
                        if(Slider.Touching) {
                            const Translation = sML.limitMinMax(TouchMoveCoord - Slider.StartedAt.Coord,
                                Slider.Edgebar.Before -  Slider.StartedAt.ThumbBefore,
                                Slider.Edgebar.After  - (Slider.StartedAt.ThumbBefore + Slider.Thumb.Length)
                            );
                            sML.style(Slider.Thumb,        { transform: 'translate' + C.A_AXIS_L + '(' + Translation + 'px)' });
                            sML.style(Slider.RailProgress, { [C.A_SIZE_l]: (Slider.StartedAt.RailProgressLength + Translation * (S.ARD == 'rtl' ? -1 : 1)) + 'px' });
                        }
                        Slider.flipPagesDuringSliding(TouchMoveCoord);
                    },
                    flipPagesDuringSliding: (_) => (Slider.flipPagesDuringSliding = !S['flip-pages-during-sliding'] ? 
                        () => false :
                        (TouchMoveCoord) => {
                            R.DoNotTurn = true; Slider.flip(TouchMoveCoord);
                            Slider.Timer_move = setTimeout(() => { R.DoNotTurn = false; Slider.flip(TouchMoveCoord, 'FORCE'); }, 333);
                        }
                    )(_),
                    onTouchEnd: (Eve) => {
                        if(!Slider.Touching) return;
                        clearTimeout(Slider.Timer_move);
                        Slider.Touching = false;
                        E.remove('bibi:moved-pointer', Slider.onTouchMove);
                        const TouchEndCoord = O.getBibiEventCoord(Eve)[C.A_AXIS_L];
                        if(TouchEndCoord == Slider.StartedAt.Coord) Slider.StartedAt.Coord = Slider.StartedAt.ThumbBefore + Slider.Thumb.Length / 2;
                        R.DoNotTurn = false;
                        Slider.flip(TouchEndCoord, 'FORCE').then(() => {
                            sML.style(Slider.Thumb,        { transform: '' });
                            sML.style(Slider.RailProgress, { [C.A_SIZE_l]: '' });
                            Slider.progress();
                            if(Slider.History) Slider.History.add();
                        });
                        delete Slider.StartedAt;
                        Slider.Timer_onTouchEnd = setTimeout(() => O.HTML.classList.remove('slider-sliding'), 123);
                    },
                    flip: (TouchedCoord, Force) => new Promise(resolve => { switch(S.RVM) {
                        case 'paged':
                            const TargetPage = Slider.getPointedPage(TouchedCoord);
                            return this.I.PageObserver.Current.Pages.includes(TargetPage) ? resolve() : R.focusOn({ Destination: TargetPage, Duration: 0 }).then(() => resolve());
                        default:
                            R.Main['scroll' + C.L_OOBL_L] = Slider.StartedAt.MainScrollBefore + (TouchedCoord - Slider.StartedAt.Coord) * (Slider.MainLength / Slider.Edgebar.Length);
                            return resolve();
                    } }).then(() => {
                        if(Force) this.I.PageObserver.turnItems();
                    }),
                    progress: () => {
                        if(Slider.Touching) return;
                        let MainScrollBefore = Math.ceil(R.Main['scroll' + C.L_OOBL_L]); 
                        if(S.ARA != S.SLA && S.ARD == 'rtl') MainScrollBefore = Slider.MainLength - MainScrollBefore - R.Main.offsetHeight; 
                        switch(S.ARA) {
                            case 'horizontal': Slider.Thumb.style.top  = '', Slider.RailProgress.style.height = ''; break;
                            case   'vertical': Slider.Thumb.style.left = '', Slider.RailProgress.style.width  = ''; break;
                        }
                        Slider.Thumb.style[C.A_OOBL_l] = (MainScrollBefore / Slider.MainLength * 100) + '%';
                        Slider.RailProgress.style[C.A_SIZE_l] = Slider.getRailProgressLength(O.getElementCoord(Slider.Thumb)[C.A_AXIS_L] - Slider.RailGroove.Before) / Slider.RailGroove.Length * 100 + '%';
                    },
                    getRailProgressLength: (_) => (Slider.getRailProgressLength = Slider.RailProgressMode == 'center' ? 
                        (ThumbBeforeInRailGroove) => S.ARD != 'rtl' ? ThumbBeforeInRailGroove + Slider.Thumb.Length / 2 : Slider.RailGroove.Length - (ThumbBeforeInRailGroove + Slider.Thumb.Length / 2) :
                        (ThumbBeforeInRailGroove) => S.ARD != 'rtl' ? ThumbBeforeInRailGroove + Slider.Thumb.Length     : Slider.RailGroove.Length -  ThumbBeforeInRailGroove
                    )(_),
                    getPointedPage: (PointedCoord) => {
                        let RatioInSlider = (PointedCoord - Slider.Edgebar.Before) / Slider.Edgebar['offset' + C.A_SIZE_L];
                        const OriginPageIndex = sML.limitMinMax(Math.round(R.Pages.length * (S.ARD == 'rtl' ? 1 - RatioInSlider : RatioInSlider)), 0, R.Pages.length - 1);
                        const PointedCoordInBook = R.Main['scroll' + C.L_SIZE_L] * (S.ARD == 'rtl' && S.SLD == 'ttb' ? 1 - RatioInSlider : RatioInSlider);
                        let ThePage = R.Pages[OriginPageIndex], MinDist = Slider.getPageDistanceFromPoint(ThePage, PointedCoordInBook);
                        [-1, 1].forEach(PM => { for(let i = OriginPageIndex + PM; R.Pages[i]; i += PM) {
                            const Page = R.Pages[i], Dist = Slider.getPageDistanceFromPoint(Page, PointedCoordInBook);
                            if(Dist < MinDist) ThePage = Page, MinDist = Dist; else break;
                        } });
                        return ThePage;
                    },
                    getPageDistanceFromPoint: (Page, PointedCoordInBook) => {
                        return Math.abs(PointedCoordInBook - (O.getElementCoord(Page, R.Main)[C.L_AXIS_L] + Page['offset' + C.L_SIZE_L] * 0.5));
                    }
                }));
                Slider.initialize();
                this.I.setToggleAction(Slider, {
                    onopened: () => {
                        O.HTML.classList.add('slider-opened');
                        setTimeout(Slider.resetUISize, 0);
                        E.dispatch('bibi:opened-slider');
                    },
                    onclosed: () => {
                        new Promise(resolve => setTimeout(resolve, S['zoom-out-for-utilities'] ? 111 : 0));
                        O.HTML.classList.remove('slider-opened');
                        setTimeout(Slider.resetUISize, 0);
                        E.dispatch('bibi:closed-slider');
                    }
                });
                E.add('bibi:commands:open-slider',   Slider.open);
                E.add('bibi:commands:close-slider',  Slider.close);
                E.add('bibi:commands:toggle-slider', Slider.toggle);
                E.add('bibi:opens-utilities',   Opt => E.dispatch('bibi:commands:open-slider',   Opt));
                E.add('bibi:closes-utilities',  Opt => E.dispatch('bibi:commands:close-slider',  Opt));
                E.add('bibi:loaded-item', Item => Item.HTML.addEventListener(E['pointerup'], Slider.onTouchEnd));
                E.add('bibi:opened', () => {
                    Slider.Edgebar.addEventListener(E['pointerdown'], Slider.onTouchStart);
                    Slider.Thumb.addEventListener(E['pointerdown'], Slider.onTouchStart);
                    O.HTML.addEventListener(E['pointerup'], Slider.onTouchEnd);
                    if(Slider.History) Slider.History.Button.addEventListener(E['pointerup'], Slider.onTouchEnd);
                    E.add(['bibi:is-scrolling', 'bibi:scrolled'], Slider.progress);
                    Slider.progress();
                });
                E.add(['bibi:opened-slider', 'bibi:closed-slider', 'bibi:laid-out'], () => {
                    Slider.resetUISize();
                    Slider.progress();
                });
                { // Optimize to Scrollbar Size
                    const _S = 'div#bibi-slider', _TB = '-thumb:before';
                    const _HS = 'html.appearance-horizontal ' + _S, _HSTB = _HS + _TB, _SH = O.Scrollbars.Height, _STH = Math.ceil(_SH / 2);
                    const _VS = 'html.appearance-vertical '   + _S, _VSTB = _VS + _TB, _SW = O.Scrollbars.Width,  _STW = Math.ceil(_SW / 2);
                    const _getSliderThumbOffsetStyle = (Offset) => ['top', 'right', 'bottom', 'left'].reduce((Style, Dir) => Style + Dir + ': ' + (Offset * -1) + 'px; ', '').trim();
                    sML.appendCSSRule(_HS, 'height: ' + _SH + 'px;');  sML.appendCSSRule(_HSTB, _getSliderThumbOffsetStyle(_STH) + ' border-radius: ' + (_STH / 2) + 'px; min-width: '  + _STH + 'px;');
                    sML.appendCSSRule(_VS, 'width: '  + _SW + 'px;');  sML.appendCSSRule(_VSTB, _getSliderThumbOffsetStyle(_STW) + ' border-radius: ' + (_STW / 2) + 'px; min-height: ' + _STW + 'px;');
                }
                E.dispatch('bibi:created-slider');
            }
        });
    }
}