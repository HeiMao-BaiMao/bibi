import sML from 'sml.js';

export default class UserInterface {
    constructor() {}

    initialize(Bibi, O, S, E, R, L) {
        this.Bibi = Bibi;
        this.O = O;
        this.S = S;
        this.E = E;
        this.R = R;
        this.L = L;
        
        this._init();
    }
    
    _init() {
        const I = this;
        const Bibi = this.Bibi;
        const O = this.O;
        const S = this.S;
        const E = this.E;
        const R = this.R;
        const L = this.L;

        
        
        
        I.initialize = () => {
            I.Utilities.create();
            I.TouchObserver.create();
            I.Notifier.create();
            I.Veil.create();
            E.bind('bibi:readied', () => {
                I.ScrollObserver.create();
                I.ResizeObserver.create();
                I.PageObserver.create();
                I.Catcher.create();
                I.Menu.create();
                I.Panel.create();
                I.Help.create();
                I.PoweredBy.create();
                I.FontSizeChanger.create();
                I.Loupe.create();
            });
            E.bind('bibi:initialized-book', () => {
                I.BookmarkManager.create();
            });
            E.bind('bibi:prepared', () => {
                I.FlickObserver.create();
                I.WheelObserver.create();
                I.PinchObserver.create();
                I.KeyObserver.create();
                I.EdgeObserver.create();
                I.Nombre.create();
                I.Slider.create();
                I.Flipper.create();
                I.Arrows.create();
                I.AxisSwitcher.create();
                I.Spinner.create();
            });
        };
        
        
        I.Utilities = { create: () => {
            const Utilities = I.Utilities = I.setToggleAction({
                openGracefuly: () => R.Moving || R.Breaking || Utilities.UIState == 'active' ? false : Utilities.open(),
                closeGracefuly: () => R.Moving || R.Breaking || Utilities.UIState == 'default' ? false : Utilities.close(),
                toggleGracefuly: () => R.Moving || R.Breaking ? false : Utilities.toggle()
            }, {
                onopened: () => E.dispatch('bibi:opens-utilities'),
                onclosed: () => E.dispatch('bibi:closes-utilities')
            });
            E.add('bibi:commands:open-utilities',   () => I.Utilities.open());
            E.add('bibi:commands:close-utilities',  () => I.Utilities.close());
            E.add('bibi:commands:toggle-utilities', () => I.Utilities.toggleGracefuly());
        }};
        
        
        I.ScrollObserver = { create: () => {
            const ScrollObserver = I.ScrollObserver = {
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
        
        
        I.PageObserver = { create: () => {
            const PageObserver = I.PageObserver = {
                // ---- Intersection
                IntersectingPages: [],
                PagesToBeObserved: [],
                observePageIntersection: (Page) => !PageObserver.PagesToBeObserved.includes(Page) ? PageObserver.PagesToBeObserved.push(Page) : PageObserver.PagesToBeObserved.length,
                unobservePageIntersection: (Page) => (PageObserver.PagesToBeObserved = PageObserver.PagesToBeObserved.filter(PageToBeObserved => PageToBeObserved != Page)).length,
                observeIntersection: () => {
                    const Glasses = new IntersectionObserver(Ents => Ents.forEach(Ent => {
                        const Page = Ent.target;
                        let IntersectionChanging = false;
                        //const IntersectionRatio = Math.round(Ent.intersectionRatio * 10000) / 100;
                        if(Ent.isIntersecting) {
                            if(!PageObserver.IntersectingPages.includes(Page)) {
                                IntersectionChanging = true;
                                PageObserver.IntersectingPages.push(Page);
                            }
                        } else {
                            if( PageObserver.IntersectingPages.includes(Page)) {
                                IntersectionChanging = true;
                                PageObserver.IntersectingPages = PageObserver.IntersectingPages.filter(IntersectingPage => IntersectingPage != Page);
                            }
                        }
                        if(IntersectionChanging) {
                            if(PageObserver.IntersectingPages.length) PageObserver.IntersectingPages.sort((A, B) => A.Index - B.Index);
                            E.dispatch('bibi:changes-intersection', PageObserver.IntersectingPages);
                            clearTimeout(PageObserver.Timer_IntersectionChange);
                            PageObserver.Timer_IntersectionChange = setTimeout(() => {
                                E.dispatch('bibi:changed-intersection', PageObserver.IntersectingPages);
                            }, 9);
                        }
                    }), {
                        root: R.Main,
                        rootMargin: '0px',
                        threshold: 0
                    });
                    PageObserver.observePageIntersection = (Page) => Glasses.observe(Page);
                    PageObserver.unobservePageIntersection = (Page) => Glasses.unobserve(Page);
                    PageObserver.PagesToBeObserved.forEach(PageToBeObserved => Glasses.observe(PageToBeObserved));
                    delete PageObserver.PagesToBeObserved;
                },
                // ---- Current
                Current: { List: [], Pages: [], Frame: {} },
                updateCurrent: () => {
                    const Frame = PageObserver.getFrame();
                    if(Frame) {
                        PageObserver.Current.Frame = Frame;
                        const List = PageObserver.getList();
                        if(List) {
                            PageObserver.Current.List = List;
                            PageObserver.Current.Pages = List.map(CE => CE.Page);
                            PageObserver.classify();
                        }
                    }
                    return PageObserver.Current;
                },
                getFrame: () => {
                    const Frame = {};
                    Frame.Length = R.Main['offset' + C.L_SIZE_L];
                    Frame[C.L_OOBL_L                              ] = Math.ceil(R.Main['scroll' + C.L_OOBL_L]); // Android Chrome returns scrollLeft/Top value of an element with slightly less float than actual.
                    Frame[C.L_OOBL_L == 'Top' ? 'Bottom' : 'Right'] = Frame[C.L_OOBL_L] + Frame.Length;
                    //if(PageObserver.Current.List.length && Frame[C.L_BASE_B] == PageObserver.Current.Frame.Before && Frame[C.L_BASE_A] == PageObserver.Current.Frame.After) return false;
                    return { Before: Frame[C.L_BASE_B], After: Frame[C.L_BASE_A], Length: Frame.Length };
                },
                getCandidatePageList: () => {
                    const QSW = Math.ceil((R.Stage.Width - 1) / 4), QSH = Math.ceil((R.Stage.Height - 1) / 4), CheckRoute = [5, 6, 4, 2, 8]; // 4x4 matrix
                    for(let l = CheckRoute.length, i = 0; i < l; i++) { const CheckPoint = CheckRoute[i];
                        const Ele = document.elementFromPoint(QSW * (CheckPoint % 3 || 3), QSH * Math.ceil(CheckPoint / 3));
                        if(Ele) {
                                 if(Ele.IndexInItem) return [Ele]; // Page
                            else if(Ele.Pages)       return Ele.Pages; // Item or Spread
                            else if(Ele.Inside)      return Ele.Inside.Pages; // ItemBox or SpreadBox
                        }
                    }
                    return PageObserver.IntersectingPages.length ? PageObserver.IntersectingPages : [];
                },
                getList: () => {
                    let List = [], List_SpreadContained = [];
                    const PageList = PageObserver.getCandidatePageList();
                    if(!PageList.length || typeof PageList[0].Index != 'number') return null;
                    const FirstIndex = sML.limitMin(PageList[                  0].Index - 2,                  0);
                    const  LastIndex = sML.limitMax(PageList[PageList.length - 1].Index + 2, R.Pages.length - 1);
                    for(let BiggestPageIntersectionRatio = 0, i = FirstIndex; i <= LastIndex; i++) { const Page = R.Pages[i];
                        const PageIntersectionStatus = PageObserver.getIntersectionStatus(Page, 'WithDetail');
                        if(PageIntersectionStatus.Ratio < BiggestPageIntersectionRatio) {
                            if(List.length) break;
                        } else {
                            const CurrentEntry = { Page: Page, PageIntersectionStatus: PageIntersectionStatus };
                            if(List.length) {
                                const Prev = List[List.length - 1];
                                if(Prev.Page.Item   == Page.Item  )   CurrentEntry.ItemIntersectionStatus =   Prev.ItemIntersectionStatus;
                                if(Prev.Page.Spread == Page.Spread) CurrentEntry.SpreadIntersectionStatus = Prev.SpreadIntersectionStatus;
                            }
                            if(  !CurrentEntry.ItemIntersectionStatus)   CurrentEntry.ItemIntersectionStatus = PageObserver.getIntersectionStatus(Page.Item.Box); // Item is scaled.
                            if(!CurrentEntry.SpreadIntersectionStatus) CurrentEntry.SpreadIntersectionStatus = PageObserver.getIntersectionStatus(Page.Spread);   // SpreadBox has margin.
                            if(CurrentEntry.SpreadIntersectionStatus.Ratio == 1) List_SpreadContained.push(CurrentEntry);
                            if(PageIntersectionStatus.Ratio > BiggestPageIntersectionRatio) List   = [CurrentEntry], BiggestPageIntersectionRatio = PageIntersectionStatus.Ratio;
                            else                                                            List.push(CurrentEntry);
                        }
                    }
                    return List_SpreadContained.length ? List_SpreadContained : List.length ? List : null;
                },
                getIntersectionStatus: (Ele, WithDetail) => {
                    const Coord = sML.getCoord(Ele), _D = C.L_AXIS_D;
                    const LengthInside = Math.min(PageObserver.Current.Frame.After * _D, Coord[C.L_BASE_A] * _D) - Math.max(PageObserver.Current.Frame.Before * _D, Coord[C.L_BASE_B] * _D);
                    const Ratio = (LengthInside <= 0 || !Coord[C.L_SIZE_L] || isNaN(LengthInside)) ? 0 : LengthInside / Coord[C.L_SIZE_L];
                    const IntersectionStatus = { Ratio: Ratio };
                    if(Ratio <= 0) {} else if(WithDetail) {
                        if(Ratio >= 1) {
                            IntersectionStatus.Contained = true;
                        } else {
                            const FC_B = PageObserver.Current.Frame.Before * _D, FC_A = PageObserver.Current.Frame.After * _D;
                            const PC_B = Coord[C.L_BASE_B]                 * _D, PC_A = Coord[C.L_BASE_A]                * _D;
                                 if(FC_B <  PC_B        ) IntersectionStatus.Entering = true;
                            else if(FC_B == PC_B        ) IntersectionStatus.Headed   = true;
                            else if(        PC_A == FC_A) IntersectionStatus.Footed   = true;
                            else if(        PC_A <  FC_A) IntersectionStatus.Passing  = true;
                            if(R.Main['offset' + L] < Coord[C.L_SIZE_L]) IntersectionStatus.Oversized = true;
                        }
                    }
                    return IntersectionStatus;
                },
                classify: () => {
                    const CurrentElements = [], PastCurrentElements = R.Main.Book.querySelectorAll('.current');
                    PageObserver.Current.List.forEach(CurrentEntry => {
                        const Page = CurrentEntry.Page, ItemBox = Page.Item.Box, SpreadBox = Page.Spread.Box;
                        if(!CurrentElements.includes(SpreadBox)) SpreadBox.classList.add('current'), CurrentElements.push(SpreadBox);
                        if(!CurrentElements.includes(  ItemBox))   ItemBox.classList.add('current'), CurrentElements.push(  ItemBox);
                        Page.classList.add('current'), CurrentElements.push(Page);
                    });
                    sML.forEach(PastCurrentElements)(PastCurrentElement => {
                        if(!CurrentElements.includes(PastCurrentElement)) {
                            PastCurrentElement.classList.remove('current');
                        }
                    });
                },
                observeCurrent: () => {
                    E.bind(['bibi:changed-intersection', 'bibi:scrolled'], PageObserver.updateCurrent);
                },
                // ---- PageChange
                Past:    { List: [{ Page: null, PageIntersectionStatus: null }] },
                observePageMove: () => {
                    E.bind('bibi:scrolled', () => {
                        const CS = PageObserver.Current.List[0], CE = PageObserver.Current.List.slice(-1)[0], CSP = CS.Page, CEP = CE.Page, CSPIS = CS.PageIntersectionStatus, CEPIS = CE.PageIntersectionStatus;
                        const PS =    PageObserver.Past.List[0], PE =    PageObserver.Past.List.slice(-1)[0], PSP = PS.Page, PEP = PE.Page;
                        const FPI = 0, LPI = R.Pages.length - 1;
                        let Flipped = false, AtTheBeginning = false, AtTheEnd = false;
                        if(CSP != PSP || CEP != PEP) {
                            Flipped = true;
                            if(CSP.Index == FPI && (CSPIS.Contained || CSPIS.Headed)) AtTheBeginning = true;
                            if(CEP.Index == LPI && (CEPIS.Contained || CEPIS.Footed)) AtTheEnd       = true;
                        } else {
                            const PSPIS = PS.PageIntersectionStatus, PEPIS = PE.PageIntersectionStatus
                            if(CSP.Index == FPI && (CSPIS.Contained || CSPIS.Headed) && !(PSPIS.Contained || PSPIS.Headed)) AtTheBeginning = true;
                            if(CEP.Index == LPI && (CEPIS.Contained || CEPIS.Footed) && !(PEPIS.Contained || PEPIS.Footed)) AtTheEnd       = true;
                        }
                        const ReturnValue = { Past: PageObserver.Past, Current: PageObserver.Current };
                        if(Flipped       ) E.dispatch('bibi:flipped',              ReturnValue);
                        if(AtTheBeginning) E.dispatch('bibi:got-to-the-beginning', ReturnValue);
                        if(AtTheEnd      ) E.dispatch('bibi:got-to-the-end',       ReturnValue);
                        Object.assign(PageObserver.Past, PageObserver.Current);
                    });
                },
                getIIPP: (Par = {}) => {
                    const Page = (Par.Page && typeof Par.Page.IndexInItem == 'number') ? Par.Page : (PageObserver.Current.Pages[0] || (Par.Item && Par.Item.IndexInSpine ? Par.Item.Pages[0] : R.Pages[0]));
                    return Page.Item.Index + Page.IndexInItem / Page.Item.Pages.length;
                },
                getP: (Par = {}) => {
                    let Item = null, Element = null;
                    if(Par.Element && Par.Element.ownerDocument && Par.Element.ownerDocument.body.Item) {
                        Item = Par.Element.ownerDocument.body.Item;
                        Element = Par.Element;
                    } else {
                        if(B.Package.Metadata['rendition:layout'] == 'pre-paginated') return { P: String((PageObserver.Current.Pages[0] || R.Pages[0]).Item.Index + 1) };
                        if(!Par.Page || typeof Par.Page.IndexInItem != 'number') Par.Page = null;
                        const Page = Par.Page ? Par.Page : (
                               B.WritingMode.split('-')[0] == 'tb' && S.SLA == 'vertical'
                            || B.WritingMode.split('-')[1] == 'tb' && S.SLA == 'horizontal'
                        ) ? PageObserver.Current.Pages[0] : PageObserver.IntersectingPages.filter(ISP => R.Stage[C.L_SIZE_L] * PageObserver.getIntersectionStatus(ISP).Ratio > 3)[0];
                        if(!Page) return '';
                        Item = Page.Item;
                        const PageCoord = O.getElementCoord(Page, R.Main);
                        const PageArea = { Left: PageCoord.X, Right: PageCoord.X + Page.offsetWidth, Top: PageCoord.Y, Bottom: PageCoord.Y + Page.offsetHeight };
                        PageArea[C.L_OOBL_B] += S['item-padding-' + C.L_OOBL_b];
                        PageArea[C.L_OEBL_B] -= S['item-padding-' + C.L_OEBL_b];
                        if(Item.Columned) {
                            PageArea[C.L_OOBL_L] += S['item-padding-' + C.L_OOBL_l];
                            PageArea[C.L_OEBL_L] -= S['item-padding-' + C.L_OEBL_l];
                        }
                        const ItemCoord = O.getElementCoord(Item, R.Main);
                        const HTMLArea = { Left: ItemCoord.X + S['item-padding-left'], Top: ItemCoord.Y + S['item-padding-top'] }; HTMLArea.Right = HTMLArea.Left + Item.HTML.offsetWidth, HTMLArea.Bottom = HTMLArea.Top + Item.HTML.offsetHeight;
                        const ViewArea = { Left: R.Main.scrollLeft, Right: R.Main.scrollLeft + R.Stage.Width, Top: R.Main.scrollTop, Bottom: R.Main.scrollTop + R.Stage.Height };
                        const PagedHTMLArea = Par.Page ? {
                            Left: Math.max(PageArea.Left, HTMLArea.Left               ) - HTMLArea.Left,  Right: Math.min(PageArea.Right,  HTMLArea.Right                  ) - HTMLArea.Left,
                             Top: Math.max(PageArea.Top,  HTMLArea.Top                ) - HTMLArea.Top , Bottom: Math.min(PageArea.Bottom, HTMLArea.Bottom                 ) - HTMLArea.Top
                        } : {
                            Left: Math.max(PageArea.Left, HTMLArea.Left, ViewArea.Left) - HTMLArea.Left,  Right: Math.min(PageArea.Right,  HTMLArea.Right,  ViewArea.Right ) - HTMLArea.Left,
                             Top: Math.max(PageArea.Top,  HTMLArea.Top,  ViewArea.Top ) - HTMLArea.Top , Bottom: Math.min(PageArea.Bottom, HTMLArea.Bottom, ViewArea.Bottom) - HTMLArea.Top
                        };
                        PagedHTMLArea.Right--, PagedHTMLArea.Bottom--;
                        const AbsoluteDistance = 10;
                        let LPM = 1, BPM = 1, getFirstElement = (l, b) => Item.contentDocument.elementFromPoint(l, b);
                        if(S.ARD == 'rtl') {
                            LPM *= -1;
                        } else if(S.ARD == 'ttb') {
                            if(S.PPD == 'rtl') BPM *= -1;
                            getFirstElement = (l, b) => Item.contentDocument.elementFromPoint(b, l);
                        }
                        if(Par.TagNames) Par.TagNames = !Array.isArray(Par.TagNames) ? null : Par.TagNames.map(TN => typeof TN != 'string' ? '' : TN.replace(/\s+/, '').toLowerCase()).filter(TN => TN ? true : false);
                        if(!Par.TagNames || !Par.TagNames.length) delete Par.TagNames;
                        __: for(let i = 0, l = PagedHTMLArea[C.A_BASE_B], lp = Math.round((PagedHTMLArea[C.A_BASE_A] - PagedHTMLArea[C.A_BASE_B]) / 9); l * LPM < PagedHTMLArea[C.A_BASE_A] * LPM; l += lp) {
                            for(let j = 0, b = PagedHTMLArea[C.A_BASE_S], bp = Math.round((PagedHTMLArea[C.A_BASE_E] - PagedHTMLArea[C.A_BASE_S]) / 3); b * BPM < PagedHTMLArea[C.A_BASE_E] * BPM; b += bp) {
                                const Ele = getFirstElement(l, b);
                                if(Par.TagNames) {
                                    if(Par.TagNames.includes(Ele.tagName.toLowerCase())) Element = Ele;
                                } else if(Ele != Item.HTML && Ele != Item.Body) {
                                    Element = Ele;
                                }
                                if(Element) break __;
                            }
                        }
                        if(!Element) return (Page.IndexInItem < Item.Pages.length - 1) ? PageObserver.getP({ Page: Item.Pages[Page.IndexInItem + 1], TagNames: Par.TagNames }) : Item.Index < R.Items.length - 1 ? (Item.Index + 2) : 'foot';
                    }
                    const Steps = [];
                    let Ele = Element; while(Ele != Item.Body) {
                        let Nth = 0;
                        sML.forEach(Ele.parentElement.childNodes)((CN, i) => {
                            if(CN.nodeType != 1) return;
                            Nth++;
                            if(CN == Ele) {
                                Steps.unshift(Nth);
                                Ele = Ele.parentElement;
                                return 'break';
                            }
                        });
                    }
                    Steps.unshift(Item.Index + 1);
                    return Steps.join('.');/*
                    return {
                        P: Steps.join('.'),
                        ItemIndex: Item.Index,
                        ElementSelector: 'body'; Steps.forEach(Step => ElementSelector += `>*:nth-child(` + Step + `)`),
                        Item: Item,
                        Element: Element
                    };*/
                },
                // ---- Turning Face-up/down
                MaxTurning: 4,
                TurningItems_FaceUp: [],
                TurningItems_FaceDown: [],
                getTurningOriginItem: (Dir = 1) => {
                    const List = PageObserver.Current.List.length ? PageObserver.Current.List : PageObserver.IntersectingPages.length ? PageObserver.IntersectingPages : null;
                    try { return (Dir > 0 ? List[0] : List[List.length - 1]).Page.Item; } catch(Err) {} return null;
                },
                turnItems: (Opt) => {
                    if(R.DoNotTurn || !S['allow-placeholders']) return;
                    if(typeof Opt != 'object') Opt = {};
                    const Dir = (I.ScrollObserver.History.length > 1) && (I.ScrollObserver.History[1] * C.L_AXIS_D > I.ScrollObserver.History[0] * C.L_AXIS_D) ? -1 : 1;
                    const Origin = Opt.Origin || PageObserver.getTurningOriginItem(Dir); if(!Origin) return;
                    const MUST = [Origin], NEW_ = [], KEEP = []; // const ___X = [];
                    const Next = R.Items[Origin.Index + Dir]; if(Next) MUST.push(Next);
                    const Prev = R.Items[Origin.Index - Dir]; if(Prev) MUST.push(Prev);
                    MUST.forEach(Item => {
                        if(Item.Turned != 'Up') (PageObserver.TurningItems_FaceUp.includes(Item) ? KEEP : NEW_).push(Item);
                    });
                    let i = 1/*, x = 0*/; while(++i < 9/* && x < 2*/ && KEEP.length + NEW_.length < PageObserver.MaxTurning) {
                        const Item = R.Items[Origin.Index + i * Dir]; if(!Item) break;
                        if(MUST.includes(Item)) continue;
                        if(Item.Turned != 'Up') (PageObserver.TurningItems_FaceUp.includes(Item) ? KEEP : NEW_).push(Item);/* x++;*/
                    }
                    PageObserver.TurningItems_FaceUp.forEach(Item => { // use `forEach`, not `for`.
                        if(KEEP.includes(Item)) return;
                        if(KEEP.length + NEW_.length < PageObserver.MaxTurning) return KEEP.push(Item);
                        clearTimeout(Item.Timer_Turn);
                        PageObserver.turnItem(Item, { Down: true }); // ___X.push(Item);
                    });
                    NEW_.forEach((Item, i) => PageObserver.turnItem(Item, { Up: true, Delay: (MUST.includes(Item) ? 99 : 999) * i }));
                    /*
                    console.log('--------');
                    console.log('Origin', Origin.Index);
                    console.log('MUST', MUST.map(Item => Item.Index));
                    console.log('KEEP', KEEP.map(Item => Item.Index));
                    console.log('NEW_', NEW_.map(Item => Item.Index));
                    // console.log('___X', ___X.map(Item => Item.Index));
                    //*/
                },
                turnItem: (Item, Opt) => new Promise(resolve => {
                    if(R.DoNotTurn || !S['allow-placeholders']) return;
                    if(!Item) Item = PageObserver.getTurningOriginItem();
                    if(typeof Opt != 'object') Opt = { Up: true };
                    if(Opt.Up) {
                        if(PageObserver.TurningItems_FaceUp.includes(Item)) return resolve();
                        PageObserver.TurningItems_FaceUp.push(Item), PageObserver.TurningItems_FaceDown = PageObserver.TurningItems_FaceDown.filter(_ => _ != Item);
                    } else {
                        if(PageObserver.TurningItems_FaceDown.includes(Item)) return resolve();
                        PageObserver.TurningItems_FaceDown.push(Item), PageObserver.TurningItems_FaceUp = PageObserver.TurningItems_FaceUp.filter(_ => _ != Item);
                        if(O.RangeLoader) O.cancelExtraction(Item.Source);
                    }
                    Item.Timer_Turn = setTimeout(() => L.loadItem(Item, { IsPlaceholder: !(Opt.Up) }).then(() => {
                        if(Opt.Up) PageObserver.TurningItems_FaceUp = PageObserver.TurningItems_FaceUp.filter(_ => _ != Item);
                        else       PageObserver.TurningItems_FaceDown = PageObserver.TurningItems_FaceDown.filter(_ => _ != Item);
                        R.layOutItem(Item).then(() => R.layOutSpread(Item.Spread, { Makeover: true, Reverse: Opt.Reverse })).then(() => resolve(Item));
                    }), Opt.Delay || 0);
                })
            }
            E.bind('bibi:laid-out-for-the-first-time', LayoutOption => {
                PageObserver.IntersectingPages = [R.Spreads[LayoutOption.TargetSpreadIndex].Pages[0]];
                PageObserver.observeIntersection();
            });
            E.bind('bibi:opened', () => {
                PageObserver.updateCurrent();
                PageObserver.observeCurrent();
                PageObserver.observePageMove();
            });
            E.dispatch('bibi:created-page-observer');
        }};
        
        
        I.ResizeObserver = { create: () => {
            const ResizeObserver = I.ResizeObserver = {
                Resizing: false,
                TargetPageAfterResizing: null,
                onResize: (Eve) => { if(R.LayingOut || !L.Opened) return;
                    if(!ResizeObserver.Resizing) {
                        ResizeObserver.Resizing = true;
                        //ResizeObserver.TargetPageAfterResizing = I.PageObserver.Current.List && I.PageObserver.Current.List[0] && I.PageObserver.Current.List[0].Page ? I.PageObserver.Current.List[0].Page : I.PageObserver.IntersectingPages[0];
                        ResizeObserver.TargetPageAfterResizing = I.PageObserver.Current.List[0] ? I.PageObserver.Current.List[0].Page : null;
                        ////////R.Main.removeEventListener('scroll', I.ScrollObserver.onScroll);
                        O.Busy = true;
                        O.HTML.classList.add('busy');
                        O.HTML.classList.add('resizing');
                    };
                    clearTimeout(ResizeObserver.Timer_onResizeEnd);
                    ResizeObserver.Timer_onResizeEnd = setTimeout(() => {
                        R.updateOrientation();
                        const Page = ResizeObserver.TargetPageAfterResizing || (I.PageObserver.Current.List[0] ? I.PageObserver.Current.List[0].Page : null);
                        R.layOutBook({
                            Reset: true,
                            Destination: Page ? { ItemIndex: Page.Item.Index, PageProgressInItem: Page.IndexInItem / Page.Item.Pages.length } : null
                        }).then(() => {
                            E.dispatch('bibi:resized', Eve);
                            O.HTML.classList.remove('resizing');
                            O.HTML.classList.remove('busy');
                            O.Busy = false;
                            ////////R.Main.addEventListener('scroll', I.ScrollObserver.onScroll);
                            //I.ScrollObserver.onScroll();
                            ResizeObserver.Resizing = false;
                        });
                    }, sML.UA.Trident ? 1200 : O.TouchOS ? 600 : 300);
                },
                observe: () => {
                    window.addEventListener(E['resize'], ResizeObserver.onResize);
                }
            };
            E.bind('bibi:opened', ResizeObserver.observe);
            E.dispatch('bibi:created-resize-observer');
        }};
        
        
        I.TouchObserver = { create: () => {
            const TouchObserver = I.TouchObserver = {
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
                            I.setUIState(Ele, Ele.UIState == 'default' ? 'active' : 'default');
                        };
                        case 'radio': return (Eve) => { if(Ele.UIState == 'disabled') return false;
                            Ele.ButtonGroup.Buttons.forEach(Button => { if(Button != Ele) I.setUIState(Button, ''); });
                            I.setUIState(Ele, 'active');
                        };
                        default: return (Eve) => { if(Ele.UIState == 'disabled') return false;
                            I.setUIState(Ele, 'active');
                            clearTimeout(Ele.Timer_deactivate);
                            Ele.Timer_deactivate = setTimeout(() => I.setUIState(Ele, Ele.UIState == 'disabled' ? 'disabled' : ''), 200);
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
                    if(I.Slider.ownerDocument && (BibiEvent.Target == I.Slider || I.Slider.contains(BibiEvent.Target))) return false;
                }
                return true;
            };
            E.bind('bibi:readied',            (    ) => TouchObserver.activateHTML(   O.HTML));
            E.bind('bibi:postprocessed-item', (Item) => TouchObserver.activateHTML(Item.HTML));
            E.add('bibi:tapped', Eve => { if(I.isPointerStealth()) return false;
                if(I.OpenedSubpanel) return I.OpenedSubpanel.close() && false;
                const BibiEvent = O.getBibiEvent(Eve);
                if(!checkTapAvailability(BibiEvent)) return false;
                return BibiEvent.Division.X == 'center' && BibiEvent.Division.Y == 'middle' ? E.dispatch('bibi:tapped-center', Eve) : E.dispatch('bibi:tapped-not-center', Eve);
            });
            E.add('bibi:doubletapped', Eve => { if(I.isPointerStealth() || !L.Opened) return false;
                if(I.OpenedSubpanel) return I.OpenedSubpanel.close() && false;
                const BibiEvent = O.getBibiEvent(Eve);
                if(!checkTapAvailability(BibiEvent)) return false;
                return BibiEvent.Division.X == 'center' && BibiEvent.Division.Y == 'middle' ? E.dispatch('bibi:doubletapped-center', Eve) : E.dispatch('bibi:doubletapped-not-center', Eve);
            });
            E.add('bibi:tapped-center', () => I.Utilities.toggleGracefuly());
            E.dispatch('bibi:created-touch-observer');
        }};
        
        
        I.FlickObserver = { create: () => {
            const FlickObserver = I.FlickObserver = {
                Moving: 0,
                getDegree: (_) => (Deg => Deg < 0 ? Deg + 360 : Deg)(Math.atan2(_.Y * -1, _.X) * 180 / Math.PI),
                onTouchStart: (Eve) => {
                    if(!L.Opened) return;
                    //if(S.RVM != 'paged' && O.TouchOS) return;
                    if(FlickObserver.LastEvent) return FlickObserver.onTouchEnd();
                    if(I.Loupe.Transforming) return;
                    FlickObserver.LastEvent = Eve;
                    const EventCoord = O.getBibiEventCoord(Eve);
                    FlickObserver.StartedAt = {
                        X: EventCoord.X,
                        Y: EventCoord.Y,
                        Item: Eve.target.ownerDocument.body.Item || null,
                        TimeStamp: Eve.timeStamp,
                        ScrollLeft: R.Main.scrollLeft,
                        ScrollTop: R.Main.scrollTop,
                        OriginList: I.PageObserver.updateCurrent().List
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
                    I.ScrollObserver.breakCurrentScrolling();
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
                            if(S['content-draggable'][S.RVM == 'paged' ? 0 : 1] && I.isScrollable()) R.Main['scroll' + C.L_OOBL_L] = FlickObserver.StartedAt['Scroll' + C.L_OOBL_L] + Passage[C.L_AXIS_L] * -1;
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
                        if(!I.Loupe.Transforming) {
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
                                } else if(I.isScrollable()) {
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
                    const Dist = C.d2d(Dir, I.orthogonal('touch-moves') == 'move');
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
                            Duration: !I.isScrollable() ? 0 : S.RVM != 'paged' || S['content-draggable'][0] ? 123 : 0
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
                    const CurrentList = I.PageObserver.updateCurrent().List;
                    return R.focusOn({
                        Destination: { Page: (Dist >= 0 ? CurrentList.slice(-1)[0].Page : CurrentList[0].Page) },
                        Duration: !I.isScrollable() ? 0 : S['content-draggable'][0] ? 123 : 0
                    });
                },
                getOrthogonalTouchMoveFunction: () => { switch(I.orthogonal('touch-moves')) {
                    case 'switch': if(I.AxisSwitcher) return I.AxisSwitcher.switchAxis; break;
                    case 'utilities': return I.Utilities.toggleGracefuly; break;
                } },
                getCNPf: (Ele) => Ele.ownerDocument == document ? '' : 'bibi-',
                activateElement: (Ele) => { if(!Ele) return false;
                    Ele.addEventListener(E['pointerdown'], FlickObserver.onTouchStart, E.Cpt1Psv0);
                    const CNPf = FlickObserver.getCNPf(Ele);
                    /**/                             Ele.ownerDocument.documentElement.classList.add(CNPf + 'flick-active');
                    if(I.isScrollable()) Ele.ownerDocument.documentElement.classList.add(CNPf + 'flick-scrollable');
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
        
        
        I.WheelObserver = { create: () => {
            const WheelObserver = I.WheelObserver = {
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
                    const ToDo = WA != C.A_AXIS_L ? I.orthogonal('wheelings') : S.RVM == 'paged' ? 'move' : WheelObserver.OverlaidUIs.filter(OUI => OUI.contains(Eve.target)).length ? 'simulate' : '';
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
                    R.moveBy({ Distance: CW.Distance, Duration: I.isScrollable() && S['content-draggable'][0] ? 123 : 0 });
                },
                toggleUtilities: (CW) => {
                    if(!CW.Wheeled) return;
                    WheelObserver.heat();
                    I.Utilities.toggleGracefuly();
                },
                switchAxis: () => {
                    if(!I.AxisSwitcher || Math.abs(WheelObserver.Progress) < 1) return;
                    WheelObserver.heat();
                    I.AxisSwitcher.switchAxis();
                },
                OverlaidUIs: []
            };
            document.addEventListener('wheel', Eve => E.dispatch('bibi:is-wheeling', Eve), E.Cpt1Psv0);
            E.add('bibi:loaded-item', Item => Item.contentDocument.addEventListener('wheel', Eve => E.dispatch('bibi:is-wheeling', Eve), E.Cpt1Psv0));
            E.add('bibi:opened', () => {
                [I.Menu, I.Slider].forEach(UI => {
                    if(!UI.ownerDocument) return;
                    UI.addEventListener('wheel', Eve => { Eve.preventDefault(); Eve.stopPropagation(); }, E.Cpt1Psv0);
                    WheelObserver.OverlaidUIs.push(UI);
                });
                E.add('bibi:is-wheeling', WheelObserver.onWheel);
                O.HTML.classList.add('wheel-active');
            });
            E.dispatch('bibi:created-wheel-observer');
        }};
        
        
        I.PinchObserver = { create: () => {
            const PinchObserver = I.PinchObserver = {
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
                        Scale: I.Loupe.CurrentTransformation.Scale,
                        Coords: PinchObserver.getEventCoords(Eve)
                    };
                },
                onTouchMove: (Eve) => {
                    if(Eve.touches.length != 2 || !PinchObserver.PinchStart) return;
                    Eve.preventDefault(); Eve.stopPropagation();
                    const Ratio = PinchObserver.getEventCoords(Eve).Distance / PinchObserver.PinchStart.Coords.Distance;
                    /* // Switch Utilities with Pinch-In/Out
                    if(PinchObserver.Pinching++ < 3 && PinchObserver.PinchStart.Scale == 1) switch(I.Utilities.UIState) {
                        case 'default': if(Ratio < 1) { PinchObserver.onTouchEnd(); I.Utilities.openGracefuly();  return; } break;
                        case  'active': if(Ratio > 1) { PinchObserver.onTouchEnd(); I.Utilities.closeGracefuly(); return; } break;
                    } //*/
                    clearTimeout(PinchObserver.Timer_TransitionRestore);
                    sML.style(R.Main, { transition: 'none' });
                    I.Loupe.scale(PinchObserver.PinchStart.Scale * Ratio, { Center: PinchObserver.PinchStart.Coords.Center, Stepless: true });
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
        
        
        I.KeyObserver = { create: () => { if(!S['use-keys']) return;
            const KeyObserver = I.KeyObserver = {
                ActiveKeys: {},
                KeyCodes: { 'keydown': {}, 'keyup': {}, 'keypress': {} },
                updateKeyCodes: (EventTypes, KeyCodesToUpdate) => {
                    if(typeof EventTypes.join != 'function')  EventTypes = [EventTypes];
                    if(typeof KeyCodesToUpdate == 'function') KeyCodesToUpdate = KeyCodesToUpdate();
                    EventTypes.forEach(EventType => KeyObserver.KeyCodes[EventType] = sML.edit(KeyObserver.KeyCodes[EventType], KeyCodesToUpdate));
                },
                KeyParameters: {},
                initializeKeyParameters: () => {
                    let _ = { 'End': 'foot', 'Home': 'head' };
                    for(const p in _) _[p.toUpperCase()] = _[p] == 'head' ? 'foot' : _[p] == 'foot' ? 'head' : _[p];
                    //Object.assign(_, { 'Space': 1, 'SPACE': -1 }); // Space key is reserved for Loupe.
                    KeyObserver.KeyParameters = _;
                },
                updateKeyParameters: () => {
                    const _O = I.orthogonal('arrow-keys');
                    const _ = (() => { switch(S.ARA) {
                        case 'horizontal': return Object.assign({ 'Left Arrow': C.d2d('left'), 'Right Arrow': C.d2d('right' ) }, _O == 'move' ? {   'Up Arrow': C.d2d('top' , 9),  'Down Arrow': C.d2d('bottom', 9) } : {   'Up Arrow': _O,  'Down Arrow': _O });
                        case   'vertical': return Object.assign({   'Up Arrow': C.d2d('top' ),  'Down Arrow': C.d2d('bottom') }, _O == 'move' ? { 'Left Arrow': C.d2d('left', 9), 'Right Arrow': C.d2d('right' , 9) } : { 'Left Arrow': _O, 'Right Arrow': _O });
                    } })();
                    for(const p in _) _[p.toUpperCase()] = _[p] == -1 ? 'head' : _[p] == 1 ? 'foot' : _[p];
                    Object.assign(KeyObserver.KeyParameters, _);
                },
                getBibiKeyName: (Eve) => {
                    const KeyName = KeyObserver.KeyCodes[Eve.type][Eve.keyCode];
                    return KeyName ? KeyName : '';
                },
                onEvent: (Eve) => {
                    if(!L.Opened) return false;
                    Eve.BibiKeyName = KeyObserver.getBibiKeyName(Eve);
                    Eve.BibiModifierKeys = [];
                    if(Eve.shiftKey) Eve.BibiModifierKeys.push('Shift');
                    if(Eve.ctrlKey)  Eve.BibiModifierKeys.push('Control');
                    if(Eve.altKey)   Eve.BibiModifierKeys.push('Alt');
                    if(Eve.metaKey)  Eve.BibiModifierKeys.push('Meta');
                    //if(!Eve.BibiKeyName) return false;
                    if(Eve.BibiKeyName) Eve.preventDefault();
                    return true;
                },
                onKeyDown: (Eve) => {
                    if(!KeyObserver.onEvent(Eve)) return false;
                    if(Eve.BibiKeyName) {
                        if(!KeyObserver.ActiveKeys[Eve.BibiKeyName]) {
                            KeyObserver.ActiveKeys[Eve.BibiKeyName] = Date.now();
                        } else {
                            E.dispatch('bibi:is-holding-key', Eve);
                        }
                    }
                    E.dispatch('bibi:downed-key', Eve);
                },
                onKeyUp: (Eve) => {
                    if(!KeyObserver.onEvent(Eve)) return false;
                    if(KeyObserver.ActiveKeys[Eve.BibiKeyName] && Date.now() - KeyObserver.ActiveKeys[Eve.BibiKeyName] < 300) {
                        E.dispatch('bibi:touched-key', Eve);
                    }
                    if(Eve.BibiKeyName) {
                        if(KeyObserver.ActiveKeys[Eve.BibiKeyName]) {
                            delete KeyObserver.ActiveKeys[Eve.BibiKeyName];
                        }
                    }
                    E.dispatch('bibi:upped-key', Eve);
                },
                onKeyPress: (Eve) => {
                    if(!KeyObserver.onEvent(Eve)) return false;
                    E.dispatch('bibi:pressed-key', Eve);
                },
                observe: (Doc) => {
                    ['keydown', 'keyup', 'keypress'].forEach(EventName => Doc.addEventListener(EventName, KeyObserver['onKey' + sML.capitalise(EventName.replace('key', ''))], false));
                },
                onKeyTouch: (Eve) => {
                    if(!Eve.BibiKeyName) return false;
                    const KeyParameter = KeyObserver.KeyParameters[!Eve.shiftKey ? Eve.BibiKeyName : Eve.BibiKeyName.toUpperCase()];
                    if(!KeyParameter) return false;
                    Eve.preventDefault();
                    switch(typeof KeyParameter) {
                        case 'number': if(I.Flipper.isAbleToFlip(KeyParameter)) {
                            if(I.Arrows) E.dispatch(I.Arrows[KeyParameter], 'bibi:tapped', Eve);
                            I.Flipper.flip(KeyParameter);
                        } break;
                        case 'string': switch(KeyParameter) {
                            case 'head': case 'foot': return R.focusOn({ Destination: KeyParameter, Duration: 0 });
                            case 'utilities': return I.Utilities.toggleGracefuly();
                            case 'switch': return I.AxisSwitcher ? I.AxisSwitcher.switchAxis() : false;
                        } break;
                    }
                }
            };
            KeyObserver.updateKeyCodes(['keydown', 'keyup', 'keypress'], {
                32: 'Space'
            });
            KeyObserver.updateKeyCodes(['keydown', 'keyup'], {
                33: 'Page Up',     34: 'Page Down',
                35: 'End',         36: 'Home',
                37: 'Left Arrow',  38: 'Up Arrow',  39: 'Right Arrow',  40: 'Down Arrow'
            });
            E.add('bibi:postprocessed-item', Item => Item.IsPlaceholder ? false : KeyObserver.observe(Item.contentDocument));
            E.add('bibi:opened', () => {
                KeyObserver.initializeKeyParameters(), KeyObserver.updateKeyParameters(), E.add('bibi:changed-view', () => KeyObserver.updateKeyParameters());
                KeyObserver.observe(document);
                E.add(['bibi:touched-key', 'bibi:is-holding-key'], Eve => KeyObserver.onKeyTouch(Eve));
            });
            E.dispatch('bibi:created-key-observer');
        }};
        
        
        I.EdgeObserver = { create: () => {
            const EdgeObserver = I.EdgeObserver = {};
            E.add('bibi:opened', () => {
                E.add(['bibi:tapped-not-center', 'bibi:doubletapped-not-center'], Eve => {
                    if(I.isPointerStealth()) return false;
                    const BibiEvent = O.getBibiEvent(Eve);
                    const Dir = I.Flipper.getDirection(BibiEvent.Division), Ortho = I.orthogonal('edges'), Dist = C.d2d(Dir, Ortho == 'move');
                    if(Dist) {
                        if(I.Arrows && I.Arrows.areAvailable(BibiEvent)) E.dispatch(I.Arrows[Dist], 'bibi:tapped', Eve);
                        if(I.Flipper.isAbleToFlip(Dist)) I.Flipper.flip(Dist);
                    } else if(typeof C.DDD[Dir] == 'string') switch(Ortho) {
                        case 'utilities': I.Utilities.toggleGracefuly(); break;
                        case 'switch': if(I.AxisSwitcher) I.AxisSwitcher.switchAxis(); break;
                    }
                });
                if(!O.TouchOS) {
                    E.add('bibi:moved-pointer', Eve => {
                        if(I.isPointerStealth()) return false;
                        const BibiEvent = O.getBibiEvent(Eve);
                        if(I.Arrows.areAvailable(BibiEvent)) {
                            const Dir = I.Flipper.getDirection(BibiEvent.Division), Ortho = I.orthogonal('edges'), Dist = C.d2d(Dir, Ortho == 'move');
                            if(Dist && I.Flipper.isAbleToFlip(Dist)) {
                                EdgeObserver.Hovering = true;
                                if(I.Arrows) {
                                    const Arrow = I.Arrows[Dist];
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
                            if(I.Arrows) E.dispatch([I.Arrows.Back, I.Arrows.Forward], 'bibi:unhovered', Eve);
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
        
        
        I.Notifier = { create: () => {
            const Notifier = I.Notifier = O.Body.appendChild(sML.create('div', { id: 'bibi-notifier',
                show: (Msg, Err) => {
                    clearTimeout(Notifier.Timer_hide);
                    Notifier.P.className = Err ? 'error' : '';
                    Notifier.P.innerHTML = Msg;
                    O.HTML.classList.add('notifier-shown');
                    if(L.Opened && !Err) Notifier.addEventListener(O.TouchOS ? E['pointerdown'] : E['pointerover'], Notifier.hide);
                },
                hide: (Time = 0) => {
                    clearTimeout(Notifier.Timer_hide);
                    Notifier.Timer_hide = setTimeout(() => {
                        if(L.Opened) Notifier.removeEventListener(O.TouchOS ? E['pointerdown'] : E['pointerover'], Notifier.hide);
                        O.HTML.classList.remove('notifier-shown');
                    }, Time);
                },
                note: (Msg, Time, Err) => {
                    if(!Msg) return Notifier.hide();
                    Notifier.show(Msg, Err);
                    if(typeof Time == 'undefined') Time = O.Busy && !L.Opened ? 8888 : 2222;
                    if(typeof Time == 'number') Notifier.hide(Time);
                }
            }));
            Notifier.P = Notifier.appendChild(document.createElement('p'));
            I.note = Notifier.note;
            E.dispatch('bibi:created-notifier');
        }};
        
            I.note = () => false;
        
        
        I.Veil = { create: () => {
            const Veil = I.Veil = I.setToggleAction(O.Body.appendChild(sML.create('div', { id: 'bibi-veil' })), {
                // Translate: 240, /* % */ // Rotate: -48, /* deg */ // Perspective: 240, /* px */
                onopened: () => (O.HTML.classList.add('veil-opened'), Veil.classList.remove('closed')),
                onclosed: () => (Veil.classList.add('closed'), O.HTML.classList.remove('veil-opened'))
            });
            ['touchstart', 'pointerdown', 'mousedown', 'click'].forEach(EN => Veil.addEventListener(EN, Eve => Eve.stopPropagation(), E.Cpt0Psv0));
            Veil.open();
            const PlayButtonTitle = (O.TouchOS ? 'Tap' : 'Click') + ' to Open';
            const PlayButton = Veil.PlayButton = Veil.appendChild(
                sML.create('p', { id: 'bibi-veil-play', title: PlayButtonTitle,
                    innerHTML: `<span class="non-visual">${ PlayButtonTitle }</span>`,
                    play: (Eve) => (Eve.stopPropagation(), L.play(), E.dispatch('bibi:played:by-button')),
                    hide: (   ) => sML.style(PlayButton, { opacity: 0, cursor: 'default' }).then(Eve => Veil.removeChild(PlayButton)),
                    on: { click: Eve => PlayButton.play(Eve) }
                })
            );
            E.add('bibi:played', () => PlayButton.hide());
            Veil.byebye = (Msg = {}) => {
                Veil.innerHTML = '';
                Veil.ByeBye = Veil.appendChild(sML.create('p', { id: 'bibi-veil-byebye' }));
                ['en', 'ja'].forEach(Lang => Veil.ByeBye.innerHTML += `<span lang="${ Lang }">${ Msg[Lang] }</span>`);
                O.HTML.classList.remove('welcome');
                Veil.open();
                return Msg['en'] ? Msg['en'].replace(/<[^>]*>/g, '') : '';
            };
            Veil.Cover      = Veil.appendChild(      sML.create('div', { id: 'bibi-veil-cover'      }));
            Veil.Cover.Info = Veil.Cover.appendChild(sML.create('p',   { id: 'bibi-veil-cover-info' }));
            E.dispatch('bibi:created-veil');
        }};
        
        
        I.Catcher = { create: () => { if(S['book-data'] || S['book'] || !S['accept-local-file']) return;
            const Catcher = I.Catcher = O.Body.appendChild(sML.create('div', { id: 'bibi-catcher' }));
            Catcher.insertAdjacentHTML('afterbegin', I.distillLabels.distillLanguage({
                default: [
                    `<div class="pgroup" lang="en">`,
                        `<p><strong>Pass Me Your EPUB File!</strong></p>`,
                        `<p><em>You Can Open Your Own EPUB.</em></p>`,
                        `<p><span>Please ${ O.TouchOS ? 'Tap Screen' : 'Drag & Drop It Here. <br />Or Click Screen' } and Choose It.</span></p>`,
                        `<p><small>(Open in Your Device without Uploading)</small></p>`,
                    `</div>`
                ].join(''),
                ja: [
                    `<div class="pgroup" lang="ja">`,
                        `<p><strong>EPUBファイルをここにください！</strong></p>`,
                        `<p><em>お持ちの EPUB ファイルを<br />開くことができます。</em></p>`,
                        `<p><span>${ O.TouchOS ? '画面をタップ' : 'ここにドラッグ＆ドロップするか、<br />画面をクリック' }して選択してください。</span></p>`,
                        `<p><small>（外部に送信されず、この端末の中で開きます）</small></p>`,
                    `</div>`
                ].join('')
            })[O.Language]);
            Catcher.title = Catcher.querySelector('span').innerHTML.replace(/<br( ?\/)?>/g, '\n').replace(/<[^>]+>/g, '').trim();
            Catcher.Input = Catcher.appendChild(sML.create('input', { type: 'file' }));
            if(!S['extract-if-necessary'].includes('*') && S['extract-if-necessary'].length) {
                const Accept = [];
                if(S['extract-if-necessary'].includes('.epub')) {
                    Accept.push('application/epub+zip');
                }
                if(S['extract-if-necessary'].includes('.zip')) {
                    Accept.push('application/zip');
                    Accept.push('application/x-zip');
                    Accept.push('application/x-zip-compressed');
                }
                if(Accept.length) Catcher.Input.setAttribute('accept', Accept.join(','));
            }
            Catcher.Input.addEventListener('change', Eve => {
                let FileData = {};  try { FileData = Eve.target.files[0]; } catch(_) {}
                Bibi.getBookData.resolve({ BookData: FileData });
            });
            Catcher.addEventListener('click', Eve => Catcher.Input.click(Eve));
            if(!O.TouchOS) {
                Catcher.addEventListener('dragenter', Eve => { Eve.preventDefault(); O.HTML.classList.add(   'dragenter'); }, 1);
                Catcher.addEventListener('dragover',  Eve => { Eve.preventDefault();                                       }, 1);
                Catcher.addEventListener('dragleave', Eve => { Eve.preventDefault(); O.HTML.classList.remove('dragenter'); }, 1);
                Catcher.addEventListener('drop',      Eve => { Eve.preventDefault();
                    let FileData = {};  try { FileData = Eve.dataTransfer.files[0]; } catch(_) {}
                    Bibi.getBookData.resolve({ BookData: FileData });
                }, 1);
            }
            Catcher.appendChild(I.getBookIcon());
            E.dispatch('bibi:created-catcher');
        }};
        
        
        I.Menu = { create: () => {
            if(!S['use-menubar']) O.HTML.classList.add('without-menubar');
            const Menu = I.Menu = O.Body.appendChild(sML.create('div', { id: 'bibi-menu' }, I.Menu)); delete Menu.create;
            //Menu.addEventListener('click', Eve => Eve.stopPropagation());
            I.TouchObserver.setElementHoverActions(Menu);
            I.setToggleAction(Menu, {
                onopened: () => { O.HTML.classList.add(   'menu-opened'); E.dispatch('bibi:opened-menu'); },
                onclosed: () => { O.HTML.classList.remove('menu-opened'); E.dispatch('bibi:closed-menu'); }
            });
            E.add('bibi:commands:open-menu',   Menu.open);
            E.add('bibi:commands:close-menu',  Menu.close);
            E.add('bibi:commands:toggle-menu', Menu.toggle);
            E.add('bibi:opens-utilities',   Opt => E.dispatch('bibi:commands:open-menu',   Opt));
            E.add('bibi:closes-utilities',  Opt => E.dispatch('bibi:commands:close-menu',  Opt));
            E.add('bibi:opened', Menu.close);/*
            E.add('bibi:changes-intersection', () => {
                clearTimeout(Menu.Timer_cool);
                if(!Menu.Hot) Menu.classList.add('hot');
                Menu.Hot = true;
                Menu.Timer_cool = setTimeout(() => {
                    Menu.Hot = false;
                    Menu.classList.remove('hot');
                }, 1234);
            });*//*
            if(sML.OS.iOS) {
                Menu.addEventListener('pointerdown', console.log);
                Menu.addEventListener('pointerover', console.log);
            }*/
            if(!O.TouchOS) E.add('bibi:opened', () => {
                E.add('bibi:moved-pointer', Eve => {
                    if(I.isPointerStealth()) return false;
                    const BibiEvent = O.getBibiEvent(Eve);
                    clearTimeout(Menu.Timer_close);
                    if(BibiEvent.Division.Y == 'top') { //if(BibiEvent.Coord.Y < Menu.Height * 1.5) {
                        E.dispatch(Menu, 'bibi:hovered', Eve);
                    } else if(Menu.Hover) {
                        Menu.Timer_close = setTimeout(() => E.dispatch(Menu, 'bibi:unhovered', Eve), 123);
                    }
                });
            });
            Menu.L = Menu.appendChild(sML.create('div', { id: 'bibi-menu-l' }));
            Menu.R = Menu.appendChild(sML.create('div', { id: 'bibi-menu-r' }));
            [Menu.L, Menu.R].forEach(MenuSide => {
                MenuSide.ButtonGroups = [];
                MenuSide.addButtonGroup = function(Par) {
                    const ButtonGroup = I.createButtonGroup(Par);
                    if(!ButtonGroup) return null;
                    this.ButtonGroups.push(ButtonGroup);
                    return this.appendChild(ButtonGroup);
                };
            });
            { // Optimize to Scrollbar Size
                const _Common = 'html.appearance-vertical:not(.veil-opened):not(.slider-opened)', _M = ' div#bibi-menu';
                sML.appendCSSRule(_Common + _M, 'width: calc(100% - ' + O.Scrollbars.Width + 'px);');
                sML.appendCSSRule([_Common + '.panel-opened' + _M, _Common + '.subpanel-opened' + _M].join(', '), 'padding-right: ' + O.Scrollbars.Width + 'px;');
            }
            I.OpenedSubpanel = null;
            I.Subpanels = [];
            Menu.Config.create();
            E.dispatch('bibi:created-menu');
        }};
        
            I.Menu.Config = { create: () => {
                const Menu = I.Menu;
                const Components = [];
                if(!S['fix-reader-view-mode'])                                                                     Components.push('ViewModeSection');
                if(O.Embedded)                                                                                     Components.push('NewWindowButton');
                if(O.FullscreenTarget && !O.TouchOS)                                                               Components.push('FullscreenButton');
                if(S['website-href'] && /^https?:\/\/[^\/]+/.test(S['website-href']) && S['website-name-in-menu']) Components.push('WebsiteLink');
                if(!S['remove-bibi-website-link'])                                                                 Components.push('BibiWebsiteLink');
                if(!Components.length) {
                    delete I.Menu.Config;
                    return;
                }
                const Config = Menu.Config = sML.applyRtL(I.createSubpanel({ id: 'bibi-subpanel_config' }), Menu.Config); delete Config.create;
                const Opener = Config.bindOpener(Menu.R.addButtonGroup({ Sticky: true }).addButton({
                    Type: 'toggle',
                    Labels: {
                        default: { default: `Configure Setting`,            ja: `設定を変更` },
                        active:  { default: `Close Setting-Menu`, ja: `設定メニューを閉じる` }
                    },
                    Help: true,
                    Icon: `<span class="bibi-icon bibi-icon-config"></span>`
                }));
                if(Components.includes('ViewModeSection')                                           ) Config.ViewModeSection.create(          ); else delete Config.ViewModeSection;
                if(Components.includes('NewWindowButton') || Components.includes('FullscreenButton'))   Config.WindowSection.create(Components); else delete   Config.WindowSection;
                if(Components.includes('WebsiteLink')     || Components.includes('BibiWebsiteLink') )  Config.LinkageSection.create(Components); else delete  Config.LinkageSection;
                E.dispatch('bibi:created-config');
            }};
        
                I.Menu.Config.ViewModeSection = { create: () => {
                    const Config = I.Menu.Config;
                    const /* SpreadShapes */ SSs = (/* SpreadShape */ SS => SS + SS + SS)((/* ItemShape */ IS => `<span class="bibi-shape bibi-shape-spread">${ IS + IS }</span>`)(`<span class="bibi-shape bibi-shape-item"></span>`));
                    const Section = Config.ViewModeSection = Config.addSection({
                        Labels: { default: { default: `View Mode`, ja: `閲覧モード` } },
                        ButtonGroups: [{
                            ButtonType: 'radio',
                            Buttons: [{
                                Mode: 'paged',
                                Labels: { default: { default: `Spread / Page`, ja: `見開き／ページ` } },
                                Icon: `<span class="bibi-icon bibi-icon-view bibi-icon-view-paged"><span class="bibi-shape bibi-shape-spreads bibi-shape-spreads-paged">${ SSs }</span></span>`
                            }, {
                                Mode: 'horizontal',
                                Labels: { default: { default: `<span class="non-visual-in-label">⇄ </span>Horizontal Scroll`, ja: `<span class="non-visual-in-label">⇄ </span>横スクロール` } },
                                Icon: `<span class="bibi-icon bibi-icon-view bibi-icon-view-horizontal"><span class="bibi-shape bibi-shape-spreads bibi-shape-spreads-horizontal">${ SSs }</span></span>`
                            }, {
                                Mode: 'vertical',
                                Labels: { default: { default: `<span class="non-visual-in-label">⇅ </span>Vertical Scroll`, ja: `<span class="non-visual-in-label">⇅ </span>縦スクロール` } },
                                Icon: `<span class="bibi-icon bibi-icon-view bibi-icon-view-vertical"><span class="bibi-shape bibi-shape-spreads bibi-shape-spreads-vertical">${ SSs }</span></span>`
                            }].map(Button => sML.edit(Button, {
                                Notes: true,
                                action: () => R.changeView({ Mode: Button.Mode, NoNotification: true })
                            }))
                        }, /*{
                            Buttons: []
                        }, */{
                            Buttons: [{
                                Name: 'full-breadth-layout-in-scroll',
                                Type: 'toggle',
                                Notes: false,
                                Labels: { default: { default: `Full Width for Each Page <small>(in Scrolling Mode)</small>`, ja: `スクロール表示で各ページを幅一杯に</small>` } },
                                Icon: `<span class="bibi-icon bibi-icon-full-breadth-layout"></span>`,
                                action: function() {
                                    const IsActive = (this.UIState == 'active');
                                    S.update({ 'full-breadth-layout-in-scroll': IsActive });
                                    if(IsActive) O.HTML.classList.add(   'book-full-breadth');
                                    else         O.HTML.classList.remove('book-full-breadth');
                                    if(S.RVM == 'horizontal' || S.RVM == 'vertical') R.changeView({ Mode: S.RVM, Force: true });
                                    if(S['keep-settings'] && O.Biscuits) O.Biscuits.memorize('Book', { FBL: S['full-breadth-layout-in-scroll'] });
                                }
                            }]
                        }]
                    });
                    E.add('bibi:updated-settings', () => {
                        Section.ButtonGroups[0].Buttons.forEach(Button => I.setUIState(Button, (Button.Mode == S.RVM ? 'active' : 'default')));
                    });/*
                    E.add('bibi:updated-settings', () => {
                        const ButtonGroup = Section.ButtonGroups[1];
                        ButtonGroup.style.display = S.BRL == 'reflowable' ? '' : 'none';
                        ButtonGroup.Buttons.forEach(Button => I.setUIState(Button, S[Button.Name] ? 'active' : 'default'));
                    });*/
                    E.add('bibi:updated-settings', () => {
                        const ButtonGroup = Section.ButtonGroups[Section.ButtonGroups.length - 1];
                        ButtonGroup.style.display = S.BRL == 'pre-paginated' ? '' : 'none';
                        ButtonGroup.Buttons.forEach(Button => I.setUIState(Button, S[Button.Name] ? 'active' : 'default'));
                    });
                }};
        
                I.Menu.Config.WindowSection = { create: (Components) => {
                    const Config = I.Menu.Config;
                    const Buttons = [];
                    if(Components.includes('NewWindowButton')) {
                        Buttons.push({
                            Type: 'link',
                            Labels: {
                                default: { default: `Open in New Window`, ja: `あたらしいウィンドウで開く` }
                            },
                            Icon: `<span class="bibi-icon bibi-icon-open-newwindow"></span>`,
                            id: 'bibi-button-open-newwindow',
                            href: O.RequestedURL,
                            target: '_blank'
                        });
                    }
                    if(Components.includes('FullscreenButton')) {
                        Buttons.push({
                            Type: 'toggle',
                            Labels: {
                                default: { default: `Enter Fullscreen`, ja: `フルスクリーンモード` },
                                active:  { default: `Exit Fullscreen`, ja: `フルスクリーンモード解除` }
                            },
                            Icon: `<span class="bibi-icon bibi-icon-toggle-fullscreen"></span>`,
                            id: 'bibi-button-toggle-fullscreen',
                            action: function() {
                                !O.Fullscreen ? O.FullscreenTarget.requestFullscreen() : O.FullscreenTarget.ownerDocument.exitFullscreen();
                                Config.close();
                            }
                        });
                        O.FullscreenTarget.ownerDocument.addEventListener('fullscreenchange', function() { // care multi-embeddeding
                            if(!O.FullscreenButton) O.FullscreenButton = document.getElementById('bibi-button-toggle-fullscreen');
                            if(this.fullscreenElement == O.FullscreenTarget) {
                                O.Fullscreen = true;
                                O.HTML.classList.add('fullscreen');
                                I.setUIState(O.FullscreenButton, 'active');
                            } else if(O.Fullscreen) {
                                O.Fullscreen = false;
                                O.HTML.classList.remove('fullscreen');
                                I.setUIState(O.FullscreenButton, 'default');
                            }
                        });
                    }
                    if(Buttons.length) {
                        const Section = Config.WindowSection = Config.addSection({ Labels: { default: { default: `Window Control`, ja: `ウィンドウ制御` } } });
                        Section.addButtonGroup({ Buttons: Buttons });
                    }
                }};
        
                I.Menu.Config.LinkageSection = { create: (Components) => {
                    const Config = I.Menu.Config;
                    const Buttons = [];
                    if(Components.includes('WebsiteLink')) Buttons.push({
                        Type: 'link',
                        Labels: { default: { default: S['website-name-in-menu'].replace(/&/gi, '&amp;').replace(/</gi, '&lt;').replace(/>/gi, '&gt;') } },
                        Icon: `<span class="bibi-icon bibi-icon-open-newwindow"></span>`,
                        href: S['website-href'],
                        target: '_blank'
                    });
                    if(Components.includes('BibiWebsiteLink')) Buttons.push({
                        Type: 'link',
                        Labels: { default: { default: `Bibi | Official Website` } },
                        Icon: `<span class="bibi-icon bibi-icon-open-newwindow"></span>`,
                        href: Bibi['href'],
                        target: '_blank'
                    });
                    if(Buttons.length) {
                        const Section = Config.LinkageSection = Config.addSection({ Labels: { default: { default: `Link${ Buttons.length > 1 ? 's' : '' }`, ja: `リンク` } } });
                        Section.addButtonGroup({ Buttons: Buttons });
                    }
                }};
        
        
        I.Panel = { create: () => {
            const Panel = I.Panel = O.Body.appendChild(sML.create('div', { id: 'bibi-panel' }));
            I.setToggleAction(Panel, {
                onopened: () => { O.HTML.classList.add(   'panel-opened'); E.dispatch('bibi:opened-panel'); },
                onclosed: () => { O.HTML.classList.remove('panel-opened'); E.dispatch('bibi:closed-panel'); }
            });
            E.add('bibi:commands:open-panel',   Panel.open);
            E.add('bibi:commands:close-panel',  Panel.close);
            E.add('bibi:commands:toggle-panel', Panel.toggle);
            E.add('bibi:closes-utilities',      Panel.close);
            I.setFeedback(Panel, { StopPropagation: true });
            E.add(Panel, 'bibi:tapped', () => E.dispatch('bibi:commands:toggle-panel'));
            Panel.BookInfo            = Panel.appendChild(               sML.create('div', { id: 'bibi-panel-bookinfo'            }));
            Panel.BookInfo.Cover      = Panel.BookInfo.appendChild(      sML.create('div', { id: 'bibi-panel-bookinfo-cover'      }));
            Panel.BookInfo.Cover.Info = Panel.BookInfo.Cover.appendChild(sML.create('p',   { id: 'bibi-panel-bookinfo-cover-info' }));
            const Opener = Panel.Opener = I.Menu.L.addButtonGroup({ Sticky: true }).addButton({
                Type: 'toggle',
                Labels: {
                    default: { default: `Open Index`,  ja: `目次を開く`   },
                    active:  { default: `Close Index`, ja: `目次を閉じる` }
                },
                Help: true,
                Icon: `<span class="bibi-icon bibi-icon-toggle-panel">${ (Bars => { for(let i = 1; i <= 6; i++) Bars += '<span></span>'; return Bars; })('') }</span>`,
                action: () => Panel.toggle()
            });
            E.add('bibi:opened-panel', () => I.setUIState(Opener, 'active'            ));
            E.add('bibi:closed-panel', () => I.setUIState(Opener, ''                  ));
            E.add('bibi:started',      () =>    sML.style(Opener, { display: 'block' }));
            if(S['on-doubletap'] == 'panel') E.add('bibi:doubletapped',   () => Panel.toggle());
            if(S['on-tripletap'] == 'panel') E.add('bibi:tripletapped',   () => Panel.toggle());
            //sML.appendCSSRule('div#bibi-panel-bookinfo', 'height: calc(100% - ' + (O.Scrollbars.Height) + 'px);'); // Optimize to Scrollbar Size
            E.dispatch('bibi:created-panel');
        }};
        
        
        I.Help = { create: () => {
            const Help = I.Help = O.Body.appendChild(sML.create('div', { id: 'bibi-help' }));
            Help.Message = Help.appendChild(sML.create('p', { className: 'hidden', id: 'bibi-help-message' }));
            Help.show = (HelpText) => {
                clearTimeout(Help.Timer_deactivate1);
                clearTimeout(Help.Timer_deactivate2);
                Help.classList.add('active');
                Help.Message.innerHTML = HelpText;
                setTimeout(() => Help.classList.add('shown'), 0);
            };
            Help.hide = () => {
                Help.Timer_deactivate1 = setTimeout(() => {
                    Help.classList.remove('shown');
                    Help.Timer_deactivate2 = setTimeout(() => Help.classList.remove('active'), 200);
                }, 100);
            };
            /*
            sML.appendCSSRule([ // Optimize to Scrollbar Size
                'html.appearance-horizontal div#bibi-help',
                'html.page-rtl.panel-opened div#bibi-help'
            ].join(', '), 'bottom: ' + (O.Scrollbars.Height) + 'px;');
            */
        }};
        
        
        I.PoweredBy = { create: () => {
            const PoweredBy = I.PoweredBy = O.Body.appendChild(sML.create('div', { id: 'bibi-poweredby', innerHTML: `<p><a href="${ Bibi['href'] }" target="_blank" title="Bibi | Official Website">Bibi</a></p>` }));
            /*
            sML.appendCSSRule([ // Optimize to Scrollbar Size
                'html.appearance-horizontal div#bibi-poweredby',
                'html.page-rtl.panel-opened div#bibi-poweredby'
            ].join(', '), 'bottom: ' + (O.Scrollbars.Height) + 'px;');
            */
        }};
        
        I.FontSizeChanger = { create: () => {
            const FontSizeChanger = I.FontSizeChanger = {};
            if(typeof S['font-size-scale-per-step'] != 'number' || S['font-size-scale-per-step'] <= 1) S['font-size-scale-per-step'] = 1.25;
            if(S['use-font-size-changer'] && S['keep-settings'] && O.Biscuits) {
                const BibiBiscuits = O.Biscuits.remember('Bibi');
                if(BibiBiscuits && BibiBiscuits.FontSize && BibiBiscuits.FontSize.Step != undefined) FontSizeChanger.Step = BibiBiscuits.FontSize.Step * 1;
            }
            if(typeof FontSizeChanger.Step != 'number' || FontSizeChanger.Step < -2 || 2 < FontSizeChanger.Step) FontSizeChanger.Step = 0;
            E.bind('bibi:postprocessed-item', Item => { if(Item['rendition:layout'] == 'pre-paginated') return false;
                Item.changeFontSize = (FontSize) => {
                    if(Item.FontSizeStyleRule) sML.deleteCSSRule(Item.contentDocument, Item.FontSizeStyleRule);
                    Item.FontSizeStyleRule = sML.appendCSSRule(Item.contentDocument, 'html', 'font-size: ' + FontSize + 'px !important;');
                };
                Item.changeFontSizeStep = (Step) => Item.changeFontSize(Item.FontSize.Base * Math.pow(S['font-size-scale-per-step'], Step));
                Item.FontSize = {
                    Default: getComputedStyle(Item.HTML).fontSize.replace(/[^\d]*$/, '') * 1
                };
                Item.FontSize.Base = Item.FontSize.Default;
                if(Item.Source.Preprocessed && (sML.UA.Chrome || sML.UA.Trident)) {
                    sML.forEach(Item.HTML.querySelectorAll('body, body *'))(Ele => Ele.style.fontSize = parseInt(getComputedStyle(Ele).fontSize) / Item.FontSize.Base + 'rem');
                } else {
                    O.editCSSRules(Item.contentDocument, CSSRule => {
                        if(!CSSRule || !CSSRule.selectorText || /^@/.test(CSSRule.selectorText)) return;
                        try { if(Item.contentDocument.querySelector(CSSRule.selectorText) == Item.HTML) return; } catch(_) {}
                        const REs = {
                            'pt': / font-size: (\d[\d\.]*)pt; /,
                            'px': / font-size: (\d[\d\.]*)px; /
                        };
                        if(REs['pt'].test(CSSRule.cssText)) CSSRule.style.fontSize = CSSRule.cssText.match(REs['pt'])[1] * (96/72) / Item.FontSize.Base + 'rem';
                        if(REs['px'].test(CSSRule.cssText)) CSSRule.style.fontSize = CSSRule.cssText.match(REs['px'])[1]           / Item.FontSize.Base + 'rem';
                    });
                }
                if(typeof S['base-font-size'] == 'number' && S['base-font-size'] > 0) {
                    let MostPopularFontSize = 0;
                    const FontSizeCounter = {};
                    sML.forEach(Item.Body.querySelectorAll('p, p *'))(Ele => {
                        if(!Ele.innerText.replace(/\s/g, '')) return;
                        const FontSize = Math.round(getComputedStyle(Ele).fontSize.replace(/[^\d]*$/, '') * 100) / 100;
                        if(!FontSizeCounter[FontSize]) FontSizeCounter[FontSize] = [];
                        FontSizeCounter[FontSize].push(Ele);
                    });
                    let MostPopularFontSizeAmount = 0;
                    for(const FontSize in FontSizeCounter) {
                        if(FontSizeCounter[FontSize].length > MostPopularFontSizeAmount) {
                            MostPopularFontSizeAmount = FontSizeCounter[FontSize].length;
                            MostPopularFontSize = FontSize;
                        }
                    }
                    if(MostPopularFontSize) Item.FontSize.Base = Item.FontSize.Base * (S['base-font-size'] / MostPopularFontSize);
                    Item.changeFontSizeStep(FontSizeChanger.Step);
                } else if(FontSizeChanger.Step != 0) {
                    Item.changeFontSizeStep(FontSizeChanger.Step);
                }
            });
            FontSizeChanger.changeFontSizeStep = (Step, Actions) => {
                if(S.BRL == 'pre-paginated') return;
                if(Step == FontSizeChanger.Step) return;
                if(!Actions) Actions = {};
                E.dispatch('bibi:changes-font-size');
                if(typeof Actions.before == 'function') Actions.before();
                FontSizeChanger.Step = Step;
                if(S['use-font-size-changer'] && S['keep-settings'] && O.Biscuits) {
                    O.Biscuits.memorize('Book', { FontSize: { Step: Step } });
                }
                setTimeout(() => {
                    R.layOutBook({
                        before: () => R.Items.forEach(Item => { if(Item.changeFontSizeStep) Item.changeFontSizeStep(Step); }),
                        Reset: true,
                        DoNotCloseUtilities: true,
                        NoNotification: true
                    }).then(() => {
                        E.dispatch('bibi:changed-font-size', { Step: Step });
                        if(typeof Actions.after == 'function') Actions.after();
                    });
                }, 88);
            };
            //E.add('bibi:changes-font-size', () => E.dispatch('bibi:closes-utilities'));
          //E.add('bibi:changes-view', () => FontSizeChanger.changeFontSizeStep(0)); // unnecessary
            if(S['use-font-size-changer']) {
                const changeFontSizeStep = function() {
                    const Button = this;
                    FontSizeChanger.changeFontSizeStep(Button.Step, {
                        before: () => Button.ButtonGroup.Busy = true,
                        after:  () => Button.ButtonGroup.Busy = false
                    });
                };
                I.createSubpanel({
                    Opener: I.Menu.R.addButtonGroup({ Sticky: true, id: 'bibi-buttongroup_font-size' }).addButton({
                        Type: 'toggle',
                        Labels: {
                            default: { default: `Change Font Size`,     ja: `文字サイズを変更` },
                            active:  { default: `Close Font Size Menu`, ja: `文字サイズメニューを閉じる` }
                        },
                        //className: 'bibi-button-font-size bibi-button-font-size-change',
                        Icon: `<span class="bibi-icon bibi-icon-change-fontsize"></span>`,
                        Help: true
                    }),
                    id: 'bibi-subpanel_font-size',
                    open: () => {}
                }).addSection({
                    Labels: { default: { default: `Choose Font Size`, ja: `文字サイズを選択` } }
                }).addButtonGroup({
                    //Tiled: true,
                    ButtonType: 'radio',
                    Buttons: [{
                        Labels: { default: { default: `<span class="non-visual-in-label">Font Size:</span> Ex-Large`,                        ja: `<span class="non-visual-in-label">文字サイズ：</span>最大` } },
                        Icon: `<span class="bibi-icon bibi-icon-fontsize bibi-icon-fontsize-exlarge"></span>`,
                        action: changeFontSizeStep, Step:  2
                    }, {
                        Labels: { default: { default: `<span class="non-visual-in-label">Font Size:</span> Large`,                           ja: `<span class="non-visual-in-label">文字サイズ：</span>大` } },
                        Icon: `<span class="bibi-icon bibi-icon-fontsize bibi-icon-fontsize-large"></span>`,
                        action: changeFontSizeStep, Step:  1
                    }, {
                        Labels: { default: { default: `<span class="non-visual-in-label">Font Size:</span> Medium <small>(default)</small>`, ja: `<span class="non-visual-in-label">文字サイズ：</span>中<small>（初期値）</small>` } },
                        Icon: `<span class="bibi-icon bibi-icon-fontsize bibi-icon-fontsize-medium"></span>`,
                        action: changeFontSizeStep, Step:  0
                    }, {
                        Labels: { default: { default: `<span class="non-visual-in-label">Font Size:</span> Small`,                           ja: `<span class="non-visual-in-label">文字サイズ：</span>小` } },
                        Icon: `<span class="bibi-icon bibi-icon-fontsize bibi-icon-fontsize-small"></span>`,
                        action: changeFontSizeStep, Step: -1
                    }, {
                        Labels: { default: { default: `<span class="non-visual-in-label">Font Size:</span> Ex-Small`,                        ja: `<span class="non-visual-in-label">文字サイズ：</span>最小` } },
                        Icon: `<span class="bibi-icon bibi-icon-fontsize bibi-icon-fontsize-exsmall"></span>`,
                        action: changeFontSizeStep, Step: -2
                    }]
                }).Buttons.forEach(Button => { if(Button.Step == FontSizeChanger.Step) I.setUIState(Button, 'active'); });
            }
            E.dispatch('bibi:created-font-size-changer');
        }};
        
        
        I.Loupe = { create: () => {
            if(S['loupe-max-scale']      <= 1) S['loupe-max-scale']      = 4.0;
            if(S['loupe-scale-per-step'] <= 1) S['loupe-scale-per-step'] = 1.6;
            if(S['loupe-scale-per-step'] > S['loupe-max-scale']) S['loupe-scale-per-step'] = S['loupe-max-scale'];
            const Loupe = I.Loupe = {
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
        
        
        I.Nombre = { create: () => { if(!S['use-nombre']) return;
            const Nombre = I.Nombre = O.Body.appendChild(sML.create('div', { id: 'bibi-nombre',
                clearTimers: () => {
                    clearTimeout(Nombre.Timer_hot);
                    clearTimeout(Nombre.Timer_vanish);
                    clearTimeout(Nombre.Timer_autohide);
                },
                show: () => {
                    Nombre.clearTimers();
                    Nombre.classList.add('active');
                    Nombre.Timer_hot = setTimeout(() => Nombre.classList.add('hot'), 10);
                },
                hide: () => {
                    Nombre.clearTimers();
                    Nombre.classList.remove('hot');
                    Nombre.Timer_vanish = setTimeout(() => Nombre.classList.remove('active'), 255);
                },
                progress: (PageInfo) => {
                    Nombre.clearTimers();
                    if(!PageInfo) PageInfo = I.PageObserver.Current;
                    if(!PageInfo.List.length) return; ////////
                    const StartPageNumber = PageInfo.List[          0].Page.Index + 1;
                    const   EndPageNumber = PageInfo.List.slice(-1)[0].Page.Index + 1;
                    const Percent = Math.floor((EndPageNumber) / R.Pages.length * 100);
                    Nombre.Current.innerHTML = (() => {
                        let PageNumber = StartPageNumber; if(StartPageNumber != EndPageNumber) PageNumber += `<span class="delimiter">-</span>` + EndPageNumber;
                        return PageNumber;
                    })();
                    Nombre.Delimiter.innerHTML = `/`;
                    Nombre.Total.innerHTML     = R.Pages.length;
                    Nombre.Percent.innerHTML   = `(${ Percent }<span class="unit">%</span>)`;
                    Nombre.show();
                    if(I.Slider.UIState != 'active') Nombre.Timer_autohide = setTimeout(Nombre.hide, 1234);
                }
            }));
            Nombre.Current   = Nombre.appendChild(sML.create('span', { className: 'bibi-nombre-current'   }));
            Nombre.Delimiter = Nombre.appendChild(sML.create('span', { className: 'bibi-nombre-delimiter' }));
            Nombre.Total     = Nombre.appendChild(sML.create('span', { className: 'bibi-nombre-total'     }));
            Nombre.Percent   = Nombre.appendChild(sML.create('span', { className: 'bibi-nombre-percent'   }));
            E.add('bibi:opened' , () => setTimeout(() => {
                Nombre.progress();
                E.add(['bibi:is-scrolling', 'bibi:scrolled', 'bibi:opened-slider'], () => Nombre.progress());
                E.add('bibi:closed-slider', Nombre.hide);
            }, 321));
            sML.appendCSSRule('html.view-paged div#bibi-nombre',      'bottom: ' + (O.Scrollbars.Height + 2) + 'px;');
            sML.appendCSSRule('html.view-horizontal div#bibi-nombre', 'bottom: ' + (O.Scrollbars.Height + 2) + 'px;');
            sML.appendCSSRule('html.view-vertical div#bibi-nombre',    'right: ' + (O.Scrollbars.Height + 2) + 'px;');
            E.dispatch('bibi:created-nombre');
        }};
        
        
        I.History = {
            List: [], Updaters: [],
            update: () => I.History.Updaters.forEach(fun => fun()),
            add: (Opt = {}) => {
                if(!Opt.UI) Opt.UI = Bibi;
                const    LastPage = R.hatchPage(I.History.List.slice(-1)[0]),
                      CurrentPage = Opt.Destination ? R.hatchPage(Opt.Destination) : (() => { I.PageObserver.updateCurrent(); return I.PageObserver.Current.List[0].Page; })();
                if(CurrentPage != LastPage) {
                    if(Opt.SumUp && I.History.List.slice(-1)[0].UI == Opt.UI) I.History.List.pop();
                    I.History.List.push({ UI: Opt.UI, IIPP: I.PageObserver.getIIPP({ Page: CurrentPage }) });
                    if(I.History.List.length - 1 > S['max-history']) { // Not count the first (oldest).
                        const First = I.History.List.shift(); // The first (oldest) is the landing point.
                        I.History.List.shift(); // Remove the second
                        I.History.List.unshift(First); // Restore the first (oldest).
                    }
                }
                I.History.update();
            },
            back: () => {
                if(I.History.List.length <= 1) return Promise.reject();
                const CurrentPage = R.hatchPage(I.History.List.pop()),
                         LastPage = R.hatchPage(I.History.List.slice(-1)[0]);
                I.History.update();
                return R.focusOn({ Destination: LastPage, Duration: 0 });
            }
        };
        
        
        I.Slider = { create: () => {
            if(!S['use-slider']) return false;
            const Slider = I.Slider = O.Body.appendChild(sML.create('div', { id: 'bibi-slider',
                RailProgressMode: 'end', // or 'center'
                Size: I.Slider.Size,
                initialize: () => {
                    const EdgebarBox = Slider.appendChild(sML.create('div', { id: 'bibi-slider-edgebar-box' }));
                    Slider.Edgebar = EdgebarBox.appendChild(sML.create('div', { id: 'bibi-slider-edgebar' }));
                    Slider.Rail    = EdgebarBox.appendChild(sML.create('div', { id: 'bibi-slider-rail' }));
                    Slider.RailGroove   = Slider.Rail.appendChild(sML.create('div', { id: 'bibi-slider-rail-groove' }));
                    Slider.RailProgress = Slider.RailGroove.appendChild(sML.create('div', { id: 'bibi-slider-rail-progress' }));
                    Slider.Thumb   = EdgebarBox.appendChild(sML.create('div', { id: 'bibi-slider-thumb', Labels: { default: { default: `Slider Thumb`, ja: `スライダー上の好きな位置からドラッグを始められます` } } })); I.setFeedback(Slider.Thumb);
                    if(S['use-history']) {
                        Slider.classList.add('bibi-slider-with-history');
                        Slider.History        = Slider.appendChild(sML.create('div', { id: 'bibi-slider-history' }));
                        Slider.History.add    = (Destination) => I.History.add({ UI: Slider, SumUp: false, Destination: Destination })
                        Slider.History.Button = Slider.History.appendChild(I.createButtonGroup()).addButton({ id: 'bibi-slider-history-button',
                            Type: 'normal',
                            Labels: { default: { default: `History Back`, ja: `移動履歴を戻る` } },
                            Help: false,
                            Icon: `<span class="bibi-icon bibi-icon-history"></span>`,
                            action: () => I.History.back(),
                            update: function() {
                                this.Icon.style.transform = `rotate(${ 360 * (I.History.List.length - 1) }deg)`;
                                     if(I.History.List.length <= 1) I.setUIState(this, 'disabled');
                                else if(this.UIState == 'disabled') I.setUIState(this, 'default');
                            }
                        });
                        I.History.Updaters.push(() => Slider.History.Button.update());
                    }
                    if(S['use-nombre']) {
                        E.add(Slider.Edgebar, ['mouseover', 'mousemove'], Eve => { if(!Slider.Touching) I.Nombre.progress({ List: [{ Page: Slider.getPointedPage(O.getBibiEventCoord(Eve)[C.A_AXIS_L]) }] }); });
                        E.add(Slider.Edgebar,  'mouseout',                Eve => { if(!Slider.Touching) I.Nombre.progress(); });
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
                    I.ScrollObserver.forceStopScrolling();
                    Eve.preventDefault();
                    Slider.Touching = true;
                    Slider.StartedAt = {
                        ThumbBefore: O.getElementCoord(Slider.Thumb)[C.A_AXIS_L],
                        RailProgressLength: Slider.RailProgress['offset' + C.A_SIZE_L],
                        MainScrollBefore: Math.ceil(R.Main['scroll' + C.L_OOBL_L]) // Android Chrome returns scrollLeft/Top value of an element with slightly less float than actual.
                    };
                    Slider.StartedAt.Coord = Eve.target == Slider.Thumb ? O.getBibiEventCoord(Eve)[C.A_AXIS_L] : Slider.StartedAt.ThumbBefore + Slider.Thumb.Length / 2; // ← ? <Move Thumb naturally> : <Bring Thumb's center to the touched coord at the next pointer moving>
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
                flipPagesDuringSliding: (_) => (Slider.flipPagesDuringSliding = !S['flip-pages-during-sliding'] ? // switch and define at the first call.
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
                        return I.PageObserver.Current.Pages.includes(TargetPage) ? resolve() : R.focusOn({ Destination: TargetPage, Duration: 0 }).then(() => resolve());
                    default:
                        R.Main['scroll' + C.L_OOBL_L] = Slider.StartedAt.MainScrollBefore + (TouchedCoord - Slider.StartedAt.Coord) * (Slider.MainLength / Slider.Edgebar.Length);
                        return resolve();
                } }).then(() => {
                    if(Force) I.PageObserver.turnItems();
                }),
                progress: () => {
                    if(Slider.Touching) return;
                    let MainScrollBefore = Math.ceil(R.Main['scroll' + C.L_OOBL_L]); // Android Chrome returns scrollLeft/Top value of an element with slightly less float than actual.
                    if(S.ARA != S.SLA && S.ARD == 'rtl') MainScrollBefore = Slider.MainLength - MainScrollBefore - R.Main.offsetHeight; // <- Paged (HorizontalAppearance) && VerticalText
                    switch(S.ARA) {
                        case 'horizontal': Slider.Thumb.style.top  = '', Slider.RailProgress.style.height = ''; break;
                        case   'vertical': Slider.Thumb.style.left = '', Slider.RailProgress.style.width  = ''; break;
                    }
                    Slider.Thumb.style[C.A_OOBL_l] = (MainScrollBefore / Slider.MainLength * 100) + '%';
                    Slider.RailProgress.style[C.A_SIZE_l] = Slider.getRailProgressLength(O.getElementCoord(Slider.Thumb)[C.A_AXIS_L] - Slider.RailGroove.Before) / Slider.RailGroove.Length * 100 + '%';
                },
                getRailProgressLength: (_) => (Slider.getRailProgressLength = Slider.RailProgressMode == 'center' ? // switch and define at the first call.
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
            I.setToggleAction(Slider, {
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
        }};
        
        
        I.BookmarkManager = { create: () => { if(!S['use-bookmarks'] || !O.Biscuits) return;
            const BookmarkManager = I.BookmarkManager = {
                Bookmarks: [],
                initialize: () => {
                    BookmarkManager.Subpanel = I.createSubpanel({
                        Opener: I.Menu.L.addButtonGroup({ Sticky: true, id: 'bibi-buttongroup_bookmarks' }).addButton({
                            Type: 'toggle',
                            Labels: {
                                default: { default: `Manage Bookmarks`,     ja: `しおりメニューを開く` },
                                active:  { default: `Close Bookmarks Menu`, ja: `しおりメニューを閉じる` }
                            },
                            Icon: `<span class="bibi-icon bibi-icon-manage-bookmarks"></span>`,
                            Help: true
                        }),
                        Position: 'left',
                        id: 'bibi-subpanel_bookmarks',
                        updateBookmarks: () => BookmarkManager.update(),
                        onopened: () => { E.add(   'bibi:scrolled', BookmarkManager.Subpanel.updateBookmarks); BookmarkManager.Subpanel.updateBookmarks (); },
                        onclosed: () => { E.remove('bibi:scrolled', BookmarkManager.Subpanel.updateBookmarks); }
                    });
                    BookmarkManager.ButtonGroup = BookmarkManager.Subpanel.addSection({
                        id: 'bibi-subpanel-section_bookmarks',
                        Labels: { default: { default: `Bookmarks`, ja: `しおり` } }
                    }).addButtonGroup();
                    const BookmarkBiscuits = O.Biscuits.remember('Book', 'Bookmarks');
                    if(Array.isArray(BookmarkBiscuits) && BookmarkBiscuits.length) BookmarkManager.Bookmarks = BookmarkBiscuits;
                    //E.add(['bibi:opened', 'bibi:resized'], () => BookmarkManager.update());
                    delete BookmarkManager.initialize;
                },
                exists: (Bookmark) => {
                    for(let l = BookmarkManager.Bookmarks.length, i = 0; i < l; i++) if(BookmarkManager.Bookmarks[i].IIPP == Bookmark.IIPP) return BookmarkManager.Bookmarks[i];
                    return null;
                },
                add: (Bookmark) => {
                    if(BookmarkManager.exists(Bookmark)) return BookmarkManager.update();
                    Bookmark.IsHot = true;
                    BookmarkManager.Bookmarks.push(Bookmark);
                    BookmarkManager.update({ Added: Bookmark });
                },
                remove: (Bookmark) => {
                    BookmarkManager.Bookmarks = BookmarkManager.Bookmarks.filter(Bmk => Bmk.IIPP != Bookmark.IIPP);
                    BookmarkManager.update({ Removed: Bookmark });
                },
                update: (Opt = {}) => {
                    BookmarkManager.Subpanel.Opener.ButtonGroup.style.display = '';
                    if(BookmarkManager.ButtonGroup.Buttons) {
                        BookmarkManager.ButtonGroup.Buttons = [];
                        BookmarkManager.ButtonGroup.innerHTML = '';
                    }
                    //BookmarkManager.Bookmarks = BookmarkManager.Bookmarks.filter(Bmk => typeof Bmk.IIPP == 'number' && typeof Bmk['%'] == 'number');
                    let Bookmarks = [], ExistingBookmarks = [];
                    if(Array.isArray(Opt.Bookmarks)) BookmarkManager.Bookmarks = Opt.Bookmarks;
                    if(Opt.Added) Bookmarks = [Opt.Added];
                    else if(L.Opened) {
                        I.PageObserver.updateCurrent();
                        Bookmarks = I.PageObserver.Current.Pages.map(Page => ({
                            IIPP: I.PageObserver.getIIPP({ Page: Page }),
                            '%': Math.floor((Page.Index + 1) / R.Pages.length * 100) // only for showing percentage in waiting status
                        }));
                    }
                    if(BookmarkManager.Bookmarks.length) {
                        const UpdatedBookmarks = []
                        for(let l = BookmarkManager.Bookmarks.length, i = 0; i < l; i++) {
                            let Bmk = BookmarkManager.Bookmarks[i];
                                 if(typeof Bmk == 'number') Bmk = { IIPP: Bmk };
                            else if(!Bmk) continue;
                            else if(typeof Bmk.IIPP != 'number') {
                                if(Bmk.ItemIndex) Bmk.IIPP = Bmk.ItemIndex + (Bmk.PageProgressInItem ? Bmk.PageProgressInItem : 0);
                                else if(B.Package.Metadata['rendition:layout'] == 'pre-paginated') {
                                    if(typeof Bmk.PageNumber == 'number') Bmk.PageIndex = Bmk.PageNumber - 1;
                                    if(typeof Bmk.PageIndex  == 'number') Bmk.IIPP      = Bmk.PageIndex;
                                }
                            }
                            if(typeof Bmk.IIPP != 'number') continue;
                            if(/^(\d*\.)?\d+?$/.test(Bmk['%'])) Bmk['%'] *= 1; else delete Bmk['%'];
                            let Label = '', ClassName = '';
                            const BB = 'bibi-bookmark';
                            const Page = R.hatchPage(Bmk);
                            let PageNumber = 0;
                                 if(Page && typeof Page.Index == 'number')                     PageNumber = Page.Index + 1;
                            else if(B.Package.Metadata['rendition:layout'] == 'pre-paginated') PageNumber = Math.floor(Bmk.IIPP) + 1;
                            if(PageNumber) {
                                Label += `<span class="${BB}-page"><span class="${BB}-unit">P.</span><span class="${BB}-number">${ PageNumber }</span></span>`;
                                if(R.Pages.length) {
                                    if(PageNumber > R.Pages.length) continue;
                                    Label += `<span class="${BB}-total-pages">/<span class="${BB}-number">${ R.Pages.length }</span></span>`;
                                    Bmk['%'] = Math.floor(PageNumber / R.Pages.length * 100);
                                }
                            }
                            if(typeof Bmk['%'] == 'number') {
                                if(Label) Label += ` <span class="${BB}-percent"><span class="${BB}-parenthesis">(</span><span class="${BB}-number">${ Bmk['%'] }</span><span class="${BB}-unit">%</span><span class="${BB}-parenthesis">)</span></span>`;
                                else      Label +=  `<span class="${BB}-percent">` +                                    `<span class="${BB}-number">${ Bmk['%'] }</span><span class="${BB}-unit">%</span>`                                    + `</span>`;
                            }
                            const Labels = Label ? { default: { default: Label, ja: Label } } : { default: { default: `Bookmark #${ UpdatedBookmarks.length + 1 }`, ja: `しおり #${ UpdatedBookmarks.length + 1 }` } };
                            if(Bookmarks.reduce((Exists, Bookmark) => Exists = Bmk.IIPP == Bookmark.IIPP ? true : Exists, false)) {
                                ExistingBookmarks.push(Bmk);
                                ClassName = `bibi-button-bookmark-is-current`;
                                Labels.default.default += ` <span class="${BB}-is-current"></span>`;
                                Labels.default.ja      += ` <span class="${BB}-is-current ${BB}-is-current-ja"></span>`;
                            }
                            const Button = BookmarkManager.ButtonGroup.addButton({
                                className: ClassName,
                                Type: 'normal',
                                Labels: Labels,
                                Icon: `<span class="bibi-icon bibi-icon-bookmark bibi-icon-a-bookmark"></span>`,
                                Bookmark: Bmk,
                                action: () => {
                                    if(L.Opened) return R.focusOn({ Destination: Bmk }).then(Destination => I.History.add({ UI: BookmarkManager, SumUp: false/*true*/, Destination: Destination }));
                                    if(!L.Waiting) return false;
                                    if(S['start-in-new-window']) return L.openNewWindow(location.href + (location.hash ? '&' : '#') + 'jo(iipp=' + Bmk.IIPP + ')');
                                    R.StartOn = { IIPP: Bmk.IIPP };
                                    L.play();
                                },
                                remove: () => BookmarkManager.remove(Bmk)
                            });
                            const Remover = Button.appendChild(sML.create('span', { className: 'bibi-remove-bookmark', title: 'しおりを削除' }));
                            I.setFeedback(Remover, { StopPropagation: true });
                            E.add(Remover, 'bibi:tapped', () => Button.remove());
                            Remover.addEventListener(E['pointer-over'], Eve => Eve.stopPropagation());
                            if(Bmk.IsHot) {
                                delete Bmk.IsHot;
                                I.setUIState(Button, 'active'); setTimeout(() => I.setUIState(Button, ExistingBookmarks.includes(Bmk) ? 'disabled' : 'default'), 234);
                            }
                            else if(ExistingBookmarks.includes(Bmk)) I.setUIState(Button, 'disabled');
                            else                                     I.setUIState(Button,  'default');
                            const UpdatedBookmark = { IIPP: Bmk.IIPP };
                            if(Bmk['%']) UpdatedBookmark['%'] = Bmk['%'];
                            UpdatedBookmarks.push(UpdatedBookmark);
                        }
                        BookmarkManager.Bookmarks = UpdatedBookmarks;
                    } else {
                        if(!L.Opened) BookmarkManager.Subpanel.Opener.ButtonGroup.style.display = 'none';
                    }
                    if(BookmarkManager.Bookmarks.length < S['max-bookmarks']) {
                        BookmarkManager.AddButton = BookmarkManager.ButtonGroup.addButton({
                            id: 'bibi-button-add-a-bookmark',
                            Type: 'normal',
                            Labels: { default: { default: `Add a Bookmark to Current Page`, ja: `現在のページにしおりを挟む` } },
                            Icon: `<span class="bibi-icon bibi-icon-bookmark bibi-icon-add-a-bookmark"></span>`,
                            action: () => Bookmarks.length ? BookmarkManager.add(Bookmarks[0]) : false
                        });
                        if(!Bookmarks.length || ExistingBookmarks.length) {
                            I.setUIState(BookmarkManager.AddButton, 'disabled');
                        }
                    }
                    O.Biscuits.memorize('Book', { Bookmarks: BookmarkManager.Bookmarks });
                    /**/            E.dispatch('bibi:updated-bookmarks', BookmarkManager.Bookmarks);
                    if(Opt.Added)   E.dispatch(  'bibi:added-bookmark',  BookmarkManager.Bookmarks);
                    if(Opt.Removed) E.dispatch('bibi:removed-bookmark',  BookmarkManager.Bookmarks);
                },
            };
            BookmarkManager.initialize();
            E.dispatch('bibi:created-bookmark-manager');
        }};
        
        
        I.Flipper = { create: () => {
            const Flipper = I.Flipper = {
                PreviousDistance: 0,
                Back: { Distance: -1 }, Forward: { Distance: 1 },
                getDirection: (Division) => { switch(S.ARA) {
                    case 'horizontal': return Division.X != 'center' ? Division.X : Division.Y;
                    case 'vertical'  : return Division.Y != 'middle' ? Division.Y : Division.X; } },
                isAbleToFlip: (Distance) => {
                    if(L.Opened && !I.OpenedSubpanel && typeof (Distance * 1) == 'number' && Distance) {
                        if(!I.PageObserver.Current.List.length) I.PageObserver.updateCurrent();
                        if(I.PageObserver.Current.List.length) {
                            let CurrentEdge, BookEdgePage, Edged;
                            if(Distance < 0) CurrentEdge = I.PageObserver.Current.List[          0], BookEdgePage = R.Pages[          0], Edged = 'Headed';
                            else             CurrentEdge = I.PageObserver.Current.List.slice(-1)[0], BookEdgePage = R.Pages.slice(-1)[0], Edged = 'Footed';
                            if(CurrentEdge.Page != BookEdgePage) return true;
                            if(!CurrentEdge.PageIntersectionStatus.Contained && !CurrentEdge.PageIntersectionStatus[Edged]) return true;
                        }
                    }
                    return false;
                },
                flip: (Distance, Opt = {}) => {
                    if(typeof (Distance *= 1) != 'number' || !isFinite(Distance) || Distance === 0) return Promise.resolve();
                    I.ScrollObserver.forceStopScrolling();
                    const SumUpHistory = (I.History.List.slice(-1)[0].UI == Flipper) && ((Distance < 0 ? -1 : 1) === (Flipper.PreviousDistance < 0 ? -1 : 1));
                    Flipper.PreviousDistance = Distance;
                    if(S['book-rendition-layout'] == 'pre-paginated') { // Preventing flicker.
                        const CIs = [
                            I.PageObserver.Current.List[          0].Page.Index,
                            I.PageObserver.Current.List.slice(-1)[0].Page.Index
                        ], TI = CIs[Distance < 0 ? 0 : 1] + Distance;
                        CIs.forEach(CI => { try { R.Pages[CI].Spread.Box.classList.remove('current'); } catch(Err) {} });
                                            try { R.Pages[TI].Spread.Box.classList.add(   'current'); } catch(Err) {}
                    }
                    return R.moveBy({ Distance: Distance, Duration: Opt.Duration }).then(Destination => I.History.add({ UI: Flipper, SumUp: SumUpHistory, Destination: Destination }));
                }
            };
            Flipper[-1] = Flipper.Back, Flipper[1] = Flipper.Forward;
        }};
        
        
        I.Arrows = { create: () => { if(!S['use-arrows']) return I.Arrows = null;
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
        
        
        I.AxisSwitcher = { create: () => { if(S['fix-reader-view-mode']) return I.AxisSwitcher = null;
            const AxisSwitcher = I.AxisSwitcher = {
                switchAxis: () => new Promise(resolve => {
                    if(S.RVM == 'paged') return resolve();
                    const ViewMode = S.RVM == 'horizontal' ? 'vertical' : 'horizontal';
                    I.Menu.Config.ViewModeSection.ButtonGroups[0].Buttons.filter(Button => Button.Mode == ViewMode)[0].BibiTapObserver.onTap();
                    resolve();
                })
            };
            E.dispatch('bibi:created-axis-switcher');
        }};
        
        
        I.Spinner = { create: () => {
            const Spinner = I.Spinner = O.Body.appendChild(sML.create('div', { id: 'bibi-spinner' }));
            for(let i = 1; i <= 12; i++) Spinner.appendChild(document.createElement('span'));
            E.dispatch('bibi:created-spinner');
        }};
        
        
        I.createButtonGroup = (Par = {}) => {
            if(Par.Area && Par.Area.tagName) {
                const AreaToBeAppended = Par.Area;
                delete Par.Area;
                return AreaToBeAppended.addButtonGroup(Par);
            }
            if(typeof Par.className != 'string' || !Par.className) delete Par.className;
            if(typeof Par.id        != 'string' || !Par.id)        delete Par.id;
            const ClassNames = ['bibi-buttongroup'];
            if(Par.Tiled) ClassNames.push('bibi-buttongroup-tiled');
            if(Par.Sticky) ClassNames.push('sticky');
            if(Par.className) ClassNames.push(Par.className);
            Par.className = ClassNames.join(' ');
            const ButtonsToAdd = Array.isArray(Par.Buttons) ? Par.Buttons : Par.Button ? [Par.Button] : [];
            delete Par.Buttons;
            delete Par.Button;
            const ButtonGroup = sML.create('ul', Par);
            ButtonGroup.Buttons = [];
            ButtonGroup.addButton = function(Par) {
                const Button = I.createButton(Par);
                if(!Button) return null;
                Button.ButtonGroup = this;
                Button.ButtonBox = Button.ButtonGroup.appendChild(sML.create('li', { className: 'bibi-buttonbox bibi-buttonbox-' + Button.Type }));
                if(!O.TouchOS) {
                    I.TouchObserver.observeElementHover(Button.ButtonBox)
                    I.TouchObserver.setElementHoverActions(Button.ButtonBox);
                }
                Button.ButtonBox.appendChild(Button)
                Button.ButtonGroup.Buttons.push(Button);
                return Button;
            };
            ButtonsToAdd.forEach(ButtonToAdd => {
                if(!ButtonToAdd.Type && Par.ButtonType) ButtonToAdd.Type = Par.ButtonType;
                ButtonGroup.addButton(ButtonToAdd);
            });
            ButtonGroup.Busy = false;
            return ButtonGroup;
        };
        
        
        I.createButton = (Par = {}) => {
            if(typeof Par.className != 'string' || !Par.className) delete Par.className;
            if(typeof Par.id        != 'string' || !Par.id       ) delete Par.id;
            Par.Type = (typeof Par.Type == 'string' && /^(normal|toggle|radio|link)$/.test(Par.Type)) ? Par.Type : 'normal';
            const ClassNames = ['bibi-button', 'bibi-button-' + Par.Type];
            if(Par.className) ClassNames.push(Par.className);
            Par.className = ClassNames.join(' ');
            if(typeof Par.Icon != 'undefined' && !Par.Icon.tagName) {
                if(typeof Par.Icon == 'string' && Par.Icon) {
                    Par.Icon = sML.hatch(Par.Icon);
                } else {
                    delete Par.Icon;
                }
            }
            const Button = sML.create((typeof Par.href == 'string' ? 'a' : 'span'), Par);
            if(Button.Icon) {
                Button.IconBox = Button.appendChild(sML.create('span', { className: 'bibi-button-iconbox' }));
                Button.IconBox.appendChild(Button.Icon);
                Button.Icon = Button.IconBox.firstChild;
                Button.IconBox.Button = Button.Icon.Button = Button;
            }
            Button.Label = Button.appendChild(sML.create('span', { className: 'bibi-button-label' }));
            I.setFeedback(Button, {
                Help: Par.Help,
                Checked: Par.Checked,
                StopPropagation: true,
                PreventDefault: (Button.href ? false : true)
            });
            Button.isAvailable = () => {
                if(Button.Busy) return false;
                if(Button.ButtonGroup && Button.ButtonGroup.Busy) return false;
                return (Button.UIState != 'disabled');
            };
            if(typeof Button.action == 'function') E.add(Button, 'bibi:tapped', () => Button.isAvailable() ? Button.action.apply(Button, arguments) : null);
            Button.Busy = false;
            return Button;
        };
        
        
        I.createSubpanel = (Par = {}) => {
            if(typeof Par.className != 'string' || !Par.className) delete Par.className;
            if(typeof Par.id        != 'string' || !Par.id       ) delete Par.id;
            const ClassNames = ['bibi-subpanel', 'bibi-subpanel-' + (Par.Position == 'left' ? 'left' : 'right')];
            if(Par.className) ClassNames.push(Par.className);
            Par.className = ClassNames.join(' ');
            const SectionsToAdd = Array.isArray(Par.Sections) ? Par.Sections : Par.Section ? [Par.Section] : [];
            delete Par.Sections;
            delete Par.Section;
            const Subpanel = O.Body.appendChild(sML.create('div', Par));
            Subpanel.Sections = [];
            Subpanel.addEventListener(E['pointerdown'], Eve => Eve.stopPropagation());
            Subpanel.addEventListener(E['pointerup'],   Eve => Eve.stopPropagation());
            I.setToggleAction(Subpanel, {
                onopened: function(Opt) {
                    I.Subpanels.forEach(Sp => Sp == Subpanel ? true : Sp.close({ ForAnotherSubpanel: true }));
                    I.OpenedSubpanel = this;
                    this.classList.add('opened');
                    O.HTML.classList.add('subpanel-opened');
                    if(Subpanel.Opener) I.setUIState(Subpanel.Opener, 'active');
                    if(Par.onopened) Par.onopened.apply(Subpanel, arguments);
                },
                onclosed: function(Opt) {
                    this.classList.remove('opened');
                    if(I.OpenedSubpanel == this) setTimeout(() => I.OpenedSubpanel = null, 222);
                    if(!Opt || !Opt.ForAnotherSubpanel) {
                        O.HTML.classList.remove('subpanel-opened');
                    }
                    if(Subpanel.Opener) {
                        I.setUIState(Subpanel.Opener, 'default');
                    }
                    if(Par.onclosed) Par.onclosed.apply(Subpanel, arguments);
                }
            });
            Subpanel.bindOpener = (Opener) => {
                E.add(Opener, 'bibi:tapped', () => Subpanel.toggle());
                Subpanel.Opener = Opener;
                return Subpanel.Opener;
            }
            if(Subpanel.Opener) Subpanel.bindOpener(Subpanel.Opener);
            E.add('bibi:opened-panel',      Subpanel.close);
            E.add('bibi:closes-utilities',  Subpanel.close);
            I.Subpanels.push(Subpanel);
            Subpanel.addSection = function(Par = {}) {
                const SubpanelSection = I.createSubpanelSection(Par);
                if(!SubpanelSection) return null;
                SubpanelSection.Subpanel = this;
                this.appendChild(SubpanelSection)
                this.Sections.push(SubpanelSection);
                return SubpanelSection;
            };
            SectionsToAdd.forEach(SectionToAdd => Subpanel.addSection(SectionToAdd));
            return Subpanel;
        };
        
        
        I.createSubpanelSection = (Par = {}) => {
            if(typeof Par.className != 'string' || !Par.className) delete Par.className;
            if(typeof Par.id        != 'string' || !Par.id       ) delete Par.id;
            const ClassNames = ['bibi-subpanel-section'];
            if(Par.className) ClassNames.push(Par.className);
            Par.className = ClassNames.join(' ');
            const PGroupsToAdd = Array.isArray(Par.PGroups) ? Par.PGroups : Par.PGroup ? [Par.PGroup] : [];
            delete Par.PGroups;
            delete Par.PGroup;
            const ButtonGroupsToAdd = Array.isArray(Par.ButtonGroups) ? Par.ButtonGroups : Par.ButtonGroup ? [Par.ButtonGroup] : [];
            delete Par.ButtonGroups;
            delete Par.ButtonGroup;
            const SubpanelSection = sML.create('div', Par);
            if(SubpanelSection.Labels) { // HGroup
                SubpanelSection.Labels = I.distillLabels(SubpanelSection.Labels);
                SubpanelSection
                    .appendChild(sML.create('div', { className: 'bibi-hgroup' }))
                        .appendChild(sML.create('p', { className: 'bibi-h' }))
                            .appendChild(sML.create('span', { className: 'bibi-h-label', innerHTML: SubpanelSection.Labels['default'][O.Language] }));
            }
            SubpanelSection.ButtonGroups = []; // ButtonGroups
            SubpanelSection.addButtonGroup = function(Par = {}) {
                const ButtonGroup = I.createButtonGroup(Par);
                this.appendChild(ButtonGroup);
                this.ButtonGroups.push(ButtonGroup);
                return ButtonGroup;
            };
            ButtonGroupsToAdd.forEach(ButtonGroupToAdd => {
                if(ButtonGroupToAdd) SubpanelSection.addButtonGroup(ButtonGroupToAdd);
            });
            return SubpanelSection;
        };
        
        
        I.setToggleAction = (Obj, Par = {}) => {
            // Par = {
            //      onopened: Function,
            //      onclosed: Function
            // };
            return sML.edit(Obj, {
                UIState: 'default',
                open: (Opt) => new Promise(resolve => {
                    if(Obj.UIState == 'default') {
                        I.setUIState(Obj, 'active');
                        if(Par.onopened) Par.onopened.call(Obj, Opt);
                    }
                    resolve(Opt);
                }),
                close: (Opt) => new Promise(resolve => {
                    if(Obj.UIState == 'active') {
                        I.setUIState(Obj, 'default');
                        if(Par.onclosed) Par.onclosed.call(Obj, Opt);
                    }
                    resolve(Opt);
                }),
                toggle: (Opt) => Obj.UIState == 'default' ? Obj.open(Opt) : Obj.close(Opt)
            });
        };
        
        
        I.setFeedback = (Ele, Opt = {}) => {
            Ele.Labels = I.distillLabels(Ele.Labels);
            if(Ele.Labels) {
                if(Opt.Help) {
                    Ele.showHelp = () => {
                        if(I.Help && Ele.Labels[Ele.UIState]) I.Help.show(Ele.Labels[Ele.UIState][O.Language]);
                        return Ele;
                    };
                    Ele.hideHelp = () => {
                        if(I.Help) I.Help.hide();
                        return Ele;
                    };
                }
                if(Ele.Notes) Ele.note = () => {
                    if(Ele.Labels[Ele.UIState]) setTimeout(() => I.note(Ele.Labels[Ele.UIState][O.Language]), 0);
                    return Ele;
                }
            }
            if(!O.TouchOS) {
                I.TouchObserver.observeElementHover(Ele);
                I.TouchObserver.setElementHoverActions(Ele);
            }
            I.TouchObserver.observeElementTap(Ele, Opt);
            I.TouchObserver.setElementTapActions(Ele);
            I.setUIState(Ele, Opt.Checked ? 'active' : 'default');
            return Ele;
        };
        
        
        I.setUIState = (UI, UIState) => {
            if(!UIState) UIState = 'default';
            UI.PreviousUIState = UI.UIState;
            if(UIState == UI.UIState) return;
            UI.UIState = UIState;
            if(UI.tagName) {
                if(UI.Labels && UI.Labels[UI.UIState] && UI.Labels[UI.UIState][O.Language]) {
                    UI.title = UI.Labels[UI.UIState][O.Language].replace(/<[^>]+>/g, '');
                    if(UI.Label) UI.Label.innerHTML = UI.Labels[UI.UIState][O.Language];
                }
                sML.replaceClass(UI, UI.PreviousUIState, UI.UIState);
            }
            return UI.UIState;
        };
        
        
        I.isPointerStealth = () => {
            let IsPointerStealth = false;
            I.isPointerStealth.Checkers.forEach(checker => IsPointerStealth = checker() ? true : IsPointerStealth);
            return IsPointerStealth;
        };
        
            I.isPointerStealth.Checkers = [];
        
            I.isPointerStealth.addChecker = (fun) => typeof fun == 'function' && !I.isPointerStealth.Checkers.includes(fun) ? I.isPointerStealth.Checkers.push(fun) : I.isPointerStealth.Checkers.length;
        
        
        I.distillLabels = (Labels) => {
            if(typeof Labels != 'object' || !Labels) Labels = {};
            for(const State in Labels) Labels[State] = I.distillLabels.distillLanguage(Labels[State]);
            if(!Labels['default'])                       Labels['default']  = I.distillLabels.distillLanguage();
            if(!Labels['active']   && Labels['default']) Labels['active']   = Labels['default'];
            if(!Labels['disabled'] && Labels['default']) Labels['disabled'] = Labels['default'];
            return Labels;
        };
        
            I.distillLabels.distillLanguage = (Label) => {
                if(typeof Label != 'object' || !Label) Label = { default: Label };
                if(typeof Label['default'] != 'string')  {
                         if(typeof Label['en'] == 'string')       Label['default']  = Label['en'];
                    else if(typeof Label[O.Language] == 'string') Label['default']  = Label[O.Language];
                    else                                          Label['default']  = '';
                }
                if(typeof Label[O.Language] != 'string') {
                         if(typeof Label['default'] == 'string')  Label[O.Language] = Label['default'];
                    else if(typeof Label['en']      == 'string')  Label[O.Language] = Label['en'];
                    else                                          Label[O.Language] = '';
                }
                return Label;
            };
        
        
        I.orthogonal = (InputType) => S['orthogonal-' + InputType][S.RVM == 'paged' ? 0 : 1];
        
        I.isScrollable = () => (S.ARA == S.SLA && I.Loupe.CurrentTransformation.Scale == 1) ? true : false;
        
        
        I.getBookIcon = () => sML.create('div', { className: 'book-icon', innerHTML: `<span></span>` });
        
        
        
        
        //==============================================================================================================================================
        //----------------------------------------------------------------------------------------------------------------------------------------------
        
        //-- Presets
        
        //----------------------------------------------------------------------------------------------------------------------------------------------
        
        
        
        I.initialize();
    }
}
