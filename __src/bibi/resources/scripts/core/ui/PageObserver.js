import sML from 'sml.js';

export default class PageObserver {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L; const C = I.C;
        this.I.PageObserver = { create: () => {
        const PageObserver = this.I.PageObserver = {
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
        const Dir = (this.I.ScrollObserver.History.length > 1) && (this.I.ScrollObserver.History[1] * C.L_AXIS_D > this.I.ScrollObserver.History[0] * C.L_AXIS_D) ? -1 : 1;
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
    }
}
