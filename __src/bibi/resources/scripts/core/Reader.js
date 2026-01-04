import sML from 'sml.js';

export default class Reader {
    constructor() {
        this.Spreads = [];
        this.Items = [];
        this.Pages = [];
        this.NonLinearItems = [];
        this.IntersectingPages = [];
        this.Current = {};
        
        this.Stage = {};
        this.Columned = false;
        this.Main = null;
        
        this.PagesPerSpread = 1; // Default
        this.Orientation = null;
        this.LayingOut = false;
        this.Moving = false;
        this.StartOn = null; // Used during loading

        this.Bibi = null;
        this.O = null;
        this.S = null;
        this.E = null;
        this.I = null;
        this.B = null;
        this.C = null;
        this.L = null;
        this.X = null;
    }

    initialize(Bibi, O, S, E, I, B, C, L, X) {
        this.Bibi = Bibi;
        this.O = O;
        this.S = S;
        this.E = E;
        this.I = I;
        this.B = B;
        this.C = C;
        this.L = L;
        this.X = X;

        Object.defineProperties(this, { // To ensure backward compatibility.
            Current: { get: () => this.I.PageObserver.Current },
            updateCurrent: { get: () => this.I.PageObserver.updateCurrent }
        });
    }

    createSpine = (SpreadsDocumentFragment) => {
        this.Main      = this.O.Body.insertBefore(sML.create('main', { id: 'bibi-main' }), this.O.Body.firstElementChild);
        this.Main.Book =  this.Main.appendChild(sML.create('div',  { id: 'bibi-main-book' }));
        this.Main.Book.appendChild(SpreadsDocumentFragment);
        //this.Sub       = this.O.Body.insertBefore(sML.create('div',  { id: 'bibi-sub' }),  this.Main.nextSibling);
    };

    resetBibiHeight = () => {
        const WIH = window.innerHeight;
        if(this.O.TouchOS) this.O.HTML.style.height = this.O.Body.style.height = WIH + 'px'; // for In-App Browsers
        return WIH;
    };

    resetStage = () => {
        const WIH = this.resetBibiHeight();
        this.Stage = {};
        this.Columned = false;
        this.Main.style.padding = this.Main.style.width = this.Main.style.height = '';
        this.Main.Book.style.padding = this.Main.Book.style.width = this.Main.Book.style.height = '';
        const BookBreadthIsolationStartEnd = (this.S['use-slider'] && this.S.RVM == 'paged' && this.O.Scrollbars[this.C.A_SIZE_B] ? this.O.Scrollbars[this.C.A_SIZE_B] : 0) + this.S['spread-margin'] * 2;
        sML.style(this.Main.Book, {
            [this.C.A_SIZE_b]: (BookBreadthIsolationStartEnd > 0 ? 'calc(100% - ' + BookBreadthIsolationStartEnd + 'px)' : ''),
            [this.C.A_SIZE_l]: ''
        });
        this.Stage.Width  = this.O.Body.clientWidth;
        this.Stage.Height = WIH;
        this.Stage[this.C.A_SIZE_B] -= (this.S['use-slider'] || this.S.RVM != 'paged' ? this.O.Scrollbars[this.C.A_SIZE_B] : 0) + this.S['spread-margin'] * 2;
        window.scrollTo(0, 0);
        if(!this.S['use-full-height']) this.Stage.Height -= this.I.Menu.Height;
        if(this.S['spread-margin'] > 0) this.Main.Book.style['padding' + this.C.L_BASE_S] = this.Main.Book.style['padding' + this.C.L_BASE_E] = this.S['spread-margin'] + 'px';
        //this.Main.style['background'] = this.S['book-background'] ? this.S['book-background'] : '';
    };

    layOutSpreadAndItsItems = (Spread, Opt = {}) => {
        //Spread.style.width = Spread.style.height = '';
        return (Spread.Items.length == 1 ? this.layOutItem(Spread.Items[0])
         : !Opt.Reverse                  ? this.layOutItem(Spread.Items[0]).then(() => this.layOutItem(Spread.Items[1]))
         :                                 this.layOutItem(Spread.Items[1]).then(() => this.layOutItem(Spread.Items[0]))
        ).then(() => this.layOutSpread(Spread, Opt));
    };

    layOutSpread = (Spread, Opt = {}) => new Promise(resolve => {
        if(Opt.Makeover) {
            Spread.PreviousSpreadBoxLength = Spread.Box['offset' + this.C.L_SIZE_L];
            Spread.OldPages = Spread.Pages.concat(); // copy
        }
        Spread.Pages = [];
        Spread.Items.forEach(Item => Item.Pages.forEach(Page => Page.IndexInSpread = Spread.Pages.push(Page) - 1));
        const SpreadSize = { Width: 0, Height: 0 }, SpreadBox = Spread.Box;
        if(Spread.Items.length == 1) {
            const Item = Spread.Items[0];
            Spread.Spreaded = Item.Spreaded ? true : false;
            SpreadSize.Width  = (Spread.Spreaded && Item['rendition:layout'] == 'pre-paginated' && Item['rendition:page-spread']) ? (this.B.ICBViewport ? Item.Box.offsetHeight * this.B.ICBViewport.Width * 2 / this.B.ICBViewport.Height : this.Stage.Width) : Item.Box.offsetWidth;
            SpreadSize.Height = Item.Box.offsetHeight;
        } else {
            const ItemA = Spread.Items[0], ItemB = Spread.Items[1];
            Spread.Spreaded = (ItemA.Spreaded || ItemB.Spreaded) ? true : false;
            if(ItemA['rendition:layout'] == 'pre-paginated' && ItemB['rendition:layout'] == 'pre-paginated') {
                // Paired Pre-Paginated Items
                if(Spread.Spreaded || this.S.RVM != 'vertical') {
                    // Spreaded
                    SpreadSize.Width  =          ItemA.Box.offsetWidth  + ItemB.Box.offsetWidth;
                    SpreadSize.Height = Math.max(ItemA.Box.offsetHeight,  ItemB.Box.offsetHeight);
                } else {
                    // Not Spreaded (Vertical)
                    SpreadSize.Width  = Math.max(ItemA.Box.offsetWidth,   ItemB.Box.offsetWidth);
                    SpreadSize.Height =          ItemA.Box.offsetHeight + ItemB.Box.offsetHeight;
                }
            } else {
                // Paired Items Including Reflowable // currently not appearable.
                if(this.S.SLA == 'horizontal') { // if(this.Stage.Width > ItemA.Box.offsetWidth + ItemB.Box.offsetWidth) {
                    // horizontal layout
                    SpreadSize.Width  =          ItemA.Box.offsetWidth + ItemB.Box.offsetWidth;
                    SpreadSize.Height = Math.max(ItemA.Box.offsetHeight, ItemB.Box.offsetHeight);
                    if(this.Bibi.Dev) {
                        this.O.log(`Paired Items incl/Reflowable (Horizontal)`, '<g:>');
                        this.O.log(`[0] w${ ItemA.Box.offsetWidth }/h${ ItemA.Box.offsetHeight } %O`, ItemA);
                        this.O.log(`[1] w${ ItemB.Box.offsetWidth }/h${ ItemB.Box.offsetHeight } %O`, ItemB);
                        this.O.log(`-=> w${      SpreadSize.Width }/h${      SpreadSize.Height } %O`, Spread, '</g>');
                    }
                } else {
                    // vertical layout
                    SpreadSize.Width  = Math.max(ItemA.Box.offsetWidth,   ItemB.Box.offsetWidth);
                    SpreadSize.Height =          ItemA.Box.offsetHeight + ItemB.Box.offsetHeight;
                    if(this.Bibi.Dev) {
                        this.O.log(`Paired Items incl/Reflowable (Vertical)`, '<g:>');
                        this.O.log(`[0] w${ ItemA.Box.offsetWidth }/h${ ItemA.Box.offsetHeight } %O`, ItemA);
                        this.O.log(`[1] w${ ItemB.Box.offsetWidth }/h${ ItemB.Box.offsetHeight } %O`, ItemB);
                        this.O.log(`-=> w${      SpreadSize.Width }/h${      SpreadSize.Height } %O`, Spread, '</g>');
                    }
                }
            }
        }
        const MinSpaceOfEdge = (this.S.RVM != 'paged' && (Spread.Index == 0 || Spread.Index == this.Spreads.length - 1)) ? Math.floor((this.Stage[this.C.L_SIZE_L] - SpreadSize[this.C.L_SIZE_L]) / 2) : 0;
        if(MinSpaceOfEdge > 0) {
            if(Spread.Index == 0                   ) Spread.style['padding' + this.C.L_BASE_B] = MinSpaceOfEdge + 'px', SpreadSize[this.C.L_SIZE_L] += MinSpaceOfEdge;
            if(Spread.Index == this.Spreads.length - 1) Spread.style['padding' + this.C.L_BASE_A] = MinSpaceOfEdge + 'px', SpreadSize[this.C.L_SIZE_L] += MinSpaceOfEdge;
        } else {
            Spread.style.padding = '';
        }
        if(this.O.Scrollbars.Height && this.S.SLA == 'vertical' && this.S.ARA != 'vertical') {
            SpreadBox.style.minHeight    = this.S.RVM == 'paged' ?   'calc(100vh - ' + this.O.Scrollbars.Height + 'px)' : '';
            SpreadBox.style.marginBottom = Spread.Index == this.Spreads.length - 1 ? this.O.Scrollbars.Height + 'px'  : '';
        } else {
            SpreadBox.style.minHeight = SpreadBox.style.marginBottom = ''
        }
        SpreadBox.classList.toggle('spreaded', Spread.Spreaded);
        SpreadBox.style[this.C.L_SIZE_b] = '', Spread.style[this.C.L_SIZE_b] = Math.ceil(SpreadSize[this.C.L_SIZE_B]) + 'px';
        SpreadBox.style[this.C.L_SIZE_l] =     Spread.style[this.C.L_SIZE_l] = Math.ceil(SpreadSize[this.C.L_SIZE_L]) + 'px';
        //sML.style(Spread, { 'border-radius': this.S['spread-border-radius'], 'box-shadow': this.S['spread-box-shadow'] });
        if(Opt.Makeover) {
            if(!Spread.PrePaginated) this.replacePages(Spread.OldPages, Spread.Pages);
            const ChangedSpreadBoxLength = Spread.Box['offset' + this.C.L_SIZE_L] - Spread.PreviousSpreadBoxLength;
            if(ChangedSpreadBoxLength != 0) {
                const Correct = (this.C.L_AXIS_L == 'X' && this.O.getElementCoord(Spread, this.Main).X + Spread.offsetWidth <= this.Main.scrollLeft + this.Main.offsetWidth);
                this.Main.Book.style[this.C.L_SIZE_l] = (parseFloat(getComputedStyle(this.Main.Book)[this.C.L_SIZE_l]) + ChangedSpreadBoxLength) + 'px';
                if(Correct) {
                    this.Main.scrollLeft += ChangedSpreadBoxLength;
                    this.I.Slider.resetUISize();
                    this.I.Slider.progress();
                }
            }
            delete Spread.OldPages, delete Spread.PreviousSpreadBoxLength;
        }
        resolve(Spread);
    });

    layOutItem = (Item) => new Promise(resolve => {
        // Item.stamp('Reset...');
        Item.Scale = 1;
        //Item.Box.style.width = Item.Box.style.height = Item.style.width = Item.style.height = '';
        (Item['rendition:layout'] != 'pre-paginated') ? this.renderReflowableItem(Item) : this.renderPrePaginatedItem(Item);
        // Item.stamp('Reset.');
        resolve(Item);
    });

    renderReflowableItem = (Item) => {
        const ItemPaddingSE = this.S['item-padding-' + this.C.L_BASE_s] + this.S['item-padding-' + this.C.L_BASE_e];
        const ItemPaddingBA = this.S['item-padding-' + this.C.L_BASE_b] + this.S['item-padding-' + this.C.L_BASE_a];
        const PageCB = this.Stage[this.C.L_SIZE_B] - ItemPaddingSE; // Page "C"ontent "B"readth
        let   PageCL = this.Stage[this.C.L_SIZE_L] - ItemPaddingBA; // Page "C"ontent "L"ength
        const PageGap = ItemPaddingBA;
        ['b','a','s','e'].forEach(base => { const trbl = this.C['L_BASE_' + base]; Item.style['padding-' + trbl] = this.S['item-padding-' + trbl] + 'px'; });
        sML.style(Item.HTML, { 'width': '', 'height': '' });
        if(Item.WithGutters) {
            Item.HTML.classList.remove('bibi-with-gutters');
            if(Item.Neck.parentNode) Item.Neck.parentNode.removeChild(Item.Neck);
            Item.Neck.innerHTML = '';
            delete Item.Neck;
        }
        const ReverseItemPaginationDirectionIfNecessary = (sML.UA.Trident || sML.UA.EdgeHTML) ? false : true;
        if(Item.Columned) {
            sML.style(Item.HTML, { 'column-fill': '', 'column-width': '', 'column-gap': '', 'column-rule': '' });
            Item.HTML.classList.remove('bibi-columned');
            if(ReverseItemPaginationDirectionIfNecessary && Item.ReversedColumned) {
                Item.HTML.style.direction = '';
                sML.forEach(Item.contentDocument.querySelectorAll('body > *'))(Ele => Ele.style.direction = '');
            }
        }
        Item.WithGutters = false;
        Item.Columned = false, Item.ColumnBreadth = 0, Item.ColumnLength = 0;
        Item.ReversedColumned = false;
        Item.Half = false;
        // Spread logic based on viewport orientation
        // Portrait viewport (1 page per spread): Never spread
        // Landscape viewport (2 pages per spread): Spread if conditions met
        Item.Spreaded = (
            this.PagesPerSpread == 2 &&
            this.S.SLA == 'horizontal' && (this.S['pagination-method'] == 'x' || /-tb$/.test(Item.WritingMode))
                &&
            (Item['rendition:spread'] == 'both' || this.Orientation == Item['rendition:spread'] || this.Orientation == 'landscape')
        );
        if(Item.Spreaded) {
            const HalfL = Math.floor((PageCL - PageGap) / 2);
            if(HalfL >= Math.floor(PageCB * this.S['orientation-border-ratio'] / 2)) PageCL = HalfL;
            else Item.Spreaded = false;
        }
        if(this.Bibi.Dev && Item.Index == 0) this.O.log(`Reflowable spread mode: ${Item.Spreaded} (PagesPerSpread: ${this.PagesPerSpread}, Orientation: ${this.Orientation})`);
        sML.style(Item, {
            [this.C.L_SIZE_b]: PageCB + 'px',
            [this.C.L_SIZE_l]: PageCL + 'px'
        });
        const WordWrappingStyleSheetIndex = sML.appendCSSRule(Item.contentDocument, '*', 'word-wrap: break-word;'); ////
        sML.forEach(Item.Body.querySelectorAll('img, svg'))(Img => {
            // Fit Image Size
            if(!Img.BibiDefaultStyle) return;
            ['width', 'height', 'maxWidth', 'maxHeight'].forEach(Pro => Img.style[Pro] = Img.BibiDefaultStyle[Pro]);
            if(this.S.RVM == 'horizontal' && /-(rl|lr)$/.test(Item.WritingMode) || this.S.RVM == 'vertical' && /-tb$/.test(Item.WritingMode)) return;
            const NaturalB = parseFloat(getComputedStyle(Img)[this.C.L_SIZE_b]), MaxB = Math.floor(Math.min(parseFloat(getComputedStyle(Item.Body)[this.C.L_SIZE_b]), PageCB));
            const NaturalL = parseFloat(getComputedStyle(Img)[this.C.L_SIZE_l]), MaxL = Math.floor(Math.min(parseFloat(getComputedStyle(Item.Body)[this.C.L_SIZE_l]), PageCL));
            if(NaturalB > MaxB || NaturalL > MaxL) sML.style(Img, {
                [this.C.L_SIZE_b]: Math.floor(parseFloat(getComputedStyle(Img)[this.C.L_SIZE_b]) * Math.min(MaxB / NaturalB, MaxL / NaturalL)) + 'px',
                [this.C.L_SIZE_l]: 'auto',
                maxWidth: '100vw',
                maxHeight: '100vh'
            });
        });
        let PaginateWith = '';
        if(!Item.Outsourcing) {
            if(this.S['pagination-method'] == 'x') {
                     if(this.S.RVM == 'paged' && Item.HTML['offset'+ this.C.L_SIZE_L] > PageCL) PaginateWith = 'S'; // VM:Paged            WM:Vertical   LA:Horizontal
                else if(                         Item.HTML['offset'+ this.C.L_SIZE_B] > PageCB) PaginateWith = 'C'; // VM:Paged/Horizontal WM:Horizontal LA:Horizontal // VM:      Vertical WM:Vertical LA:Vertical
            } else   if(this.S.RVM == 'paged' || Item.HTML['offset'+ this.C.L_SIZE_B] > PageCB) PaginateWith = 'C'; // VM:Paged/Horizontal WM:Horizontal LA:Horizontal // VM:Paged/Vertical WM:Vertical LA:Vertical
        }
        switch(PaginateWith) {
            case 'S':
                Item.HTML.classList.add('bibi-columned');
                sML.style(Item.HTML, {
                    [this.C.L_SIZE_b]: 'auto',
                    [this.C.L_SIZE_l]: PageCL + 'px',
                    'column-fill': 'auto',
                    'column-width': PageCB + 'px',
                    'column-gap': 0,
                    'column-rule': ''
                });
                const HowManyPages = Math.ceil((sML.UA.Trident ? Item.Body.clientHeight : Item.HTML.scrollHeight) / PageCB);
                sML.style(Item.HTML, { 'width': '', 'height': '', 'column-fill': '', 'column-width': '', 'column-gap': '', 'column-rule': '' });
                Item.HTML.classList.remove('bibi-columned');
                Item.HTML.classList.add('bibi-with-gutters');
                const ItemLength = (PageCL + PageGap) * HowManyPages - PageGap;
                Item.HTML.style[this.C.L_SIZE_L] = ItemLength + 'px';
                const Points = [];//[0, 0];
                for(let i = 1; i < HowManyPages; i++) {
                    const Start = 0, End = PageCB, After = (PageCL + PageGap) * i, Before = After - PageGap;
                    Points.push(Start), Points.push(Before);
                    Points.push(  End), Points.push(Before);
                    Points.push(  End), Points.push(After );
                    Points.push(Start), Points.push(After );
                }
                if(/^tb-/.test(Item.WritingMode)) Points.reverse();
                const Polygon = [];
                for(let Pt = '', l = Points.length, i = 0; i < l; i++) {
                    const Px = Points[i] + (Points[i] ? 'px' : '');
                    if(i % 2 == 0) Pt = Px;
                    else Polygon.push(Pt + ' ' + Px);
                }
                const Neck = this.Bibi.createElement('bibi-neck'), Throat = Neck.appendChild(this.Bibi.createElement('bibi-throat')), ShadowOrThroat = Throat.attachShadow ? Throat.attachShadow({ mode: 'open' }) : Throat.createShadowRoot ? Throat.createShadowRoot() : Throat;
                ShadowOrThroat.appendChild(document.createElement('style')).textContent = (ShadowOrThroat != Throat ? ':host' : 'bibi-throat') + ` { ${this.C.L_SIZE_b}: ${PageCB}px; ${this.C.L_SIZE_l}: ${ItemLength}px; shape-outside: polygon(${ Polygon.join(', ') }); }`;
                Item.Neck = Item.Head.appendChild(Neck);
                Item.WithGutters = true;
                break;
            case 'C':
                Item.HTML.classList.add('bibi-columned');
                sML.style(Item.HTML, {
                    [this.C.L_SIZE_b]: PageCB + 'px',
                    //[this.C.L_SIZE_l]: PageCL + 'px',
                    'column-fill': 'auto',
                    'column-width': PageCL + 'px',
                    'column-gap': PageGap + 'px',
                    'column-rule': ''
                });
                this.Columned = true;
                Item.Columned = true, Item.ColumnBreadth = PageCB, Item.ColumnLength = PageCL;
                if(ReverseItemPaginationDirectionIfNecessary) {
                    let ToBeReversedColumnAxis = false;
                    switch(Item.WritingMode) {
                        case 'lr-tb': case 'tb-lr': if(this.S['page-progression-direction'] != 'ltr') ToBeReversedColumnAxis = true; break;
                        case 'rl-tb': case 'tb-rl': if(this.S['page-progression-direction'] != 'rtl') ToBeReversedColumnAxis = true; break;
                    }
                    if(ToBeReversedColumnAxis) {
                        Item.ReversedColumned = true;
                        sML.forEach(Item.contentDocument.querySelectorAll('body > *'))(Ele => Ele.style.direction = getComputedStyle(Ele).direction);
                        Item.HTML.style.direction = this.S['page-progression-direction'];
                        //if(sML.UA.Chromium) Item.HTML.style.transform = 'translateX(' + (Item.HTML['scroll'+ this.C.L_SIZE_L] - Item.HTML['offset'+ this.C.L_SIZE_L]) * (this.S['page-progression-direction'] == 'rtl' ? 1 : -1) + 'px)';
                    }
                }
                break;
        }
        sML.deleteCSSRule(Item.contentDocument, WordWrappingStyleSheetIndex); ////
        let ItemL = sML.UA.Trident ? Item.Body['client' + this.C.L_SIZE_L] : Item.HTML['scroll' + this.C.L_SIZE_L];
        const HowManyPages = Math.ceil((ItemL + PageGap) / (PageCL + PageGap));
        ItemL = (PageCL + PageGap) * HowManyPages - PageGap;
        Item.style[this.C.L_SIZE_l] = Item.HTML.style[this.C.L_SIZE_l] = ItemL + 'px';
        if(sML.UA.Trident) Item.HTML.style[this.C.L_SIZE_l] = '100%';
        let ItemBoxB = PageCB + ItemPaddingSE;
        let ItemBoxL = ItemL  + ItemPaddingBA;// + ((this.S.RVM == 'paged' && Item.Spreaded && HowManyPages % 2) ? (PageGap + PageCL) : 0);
        Item.Box.style[this.C.L_SIZE_b] = ItemBoxB + 'px';
        Item.Box.style[this.C.L_SIZE_l] = ItemBoxL + 'px';
        Item.Pages.forEach(Page => {
            this.I.PageObserver.unobservePageIntersection(Page);
            Item.Box.removeChild(Page);
        });
        Item.Pages = [];
        for(let i = 0; i < HowManyPages; i++) {
            const Page = Item.Box.appendChild(sML.create('span', { className: 'page' }));
            //Page.style[this.C.L_SIZE_l] = (PageCL + ItemPaddingBA) + 'px';//this.Stage[this.C.L_SIZE_L] + 'px';
            Page.Item = Item, Page.Spread = Item.Spread;
            Page.IndexInItem = Item.Pages.length;
            Item.Pages.push(Page);
            this.I.PageObserver.observePageIntersection(Page);
        }
        return Item;
    };

    renderPrePaginatedItem = (Item) => {
        sML.style(Item, { width: '', height: '', transform: '' });
        let StageB = this.Stage[this.C.L_SIZE_B];
        let StageL = this.Stage[this.C.L_SIZE_L];
        
        if(!Item.Viewport) Item.Viewport = this.getItemViewport(Item);
        
        // Check aspect ratio for single image items (IMG or SVG)
        let forceNonSpread = false;
        let isPortraitImage = false;
        if((Item.OnlySingleIMG || Item.OnlySingleSVG) && Item.Viewport) {
            const aspectRatio = Item.Viewport.Width / Item.Viewport.Height;
            // Portrait: height > width (aspectRatio < 1)
            // Landscape: width > height (aspectRatio > 1)
            // Square: width == height (aspectRatio == 1)
            
            if(aspectRatio < 1) {
                // Portrait image - should occupy single page in spread
                isPortraitImage = true;
                forceNonSpread = true;
                delete Item['rendition:page-spread'];
                if(Item.Spread && Item.Spread.Box) {
                    Item.Spread.Box.classList.remove('single-item-spread-center', 'single-item-spread-left', 'single-item-spread-right');
                }
                if(Item.SpreadPair) {
                    delete Item.SpreadPair.SpreadPair;
                    delete Item.SpreadPair;
                }
                if(this.Bibi.Dev) this.O.log(`Portrait image (${Item.Viewport.Width}x${Item.Viewport.Height}, ratio=${aspectRatio.toFixed(2)}): Item ${Item.Index}`);
            } else if(aspectRatio >= 1.5) {
                // Wide landscape image - can use full spread
                if(this.Bibi.Dev) this.O.log(`Landscape image (${Item.Viewport.Width}x${Item.Viewport.Height}, ratio=${aspectRatio.toFixed(2)}): Item ${Item.Index}`);
            } else {
                // Near-square or slightly landscape - treat as portrait for better layout
                isPortraitImage = true;
                forceNonSpread = true;
                delete Item['rendition:page-spread'];
                if(this.Bibi.Dev) this.O.log(`Near-square image (${Item.Viewport.Width}x${Item.Viewport.Height}, ratio=${aspectRatio.toFixed(2)}): Item ${Item.Index}`);
            }
        }
        
        // Spread logic based on viewport orientation and image orientation
        // Portrait viewport (1 page per spread): Never spread
        // Landscape viewport (2 pages per spread): Spread only landscape images
        Item.Spreaded = !forceNonSpread && this.PagesPerSpread == 2 && (
            (this.S.RVM == 'paged' || !this.S['full-breadth-layout-in-scroll'])
                &&
            (Item['rendition:spread'] == 'both' || this.Orientation == Item['rendition:spread'] || this.Orientation == 'landscape')
        );
      //if( Item.Viewport && !this.B.ICBViewport) this.B.ICBViewport = Item.Viewport;
        let ItemLoVp = null; // ItemLayoutViewport
        if(Item.Spreaded) {
            ItemLoVp = this.getItemLayoutViewport(Item);
            if(Item.SpreadPair) {
                const PairItem = Item.SpreadPair;
                PairItem.Spreaded = true;
                if(!PairItem.Viewport) PairItem.Viewport = this.getItemViewport(PairItem);
                const PairItemLoVp = this.getItemLayoutViewport(PairItem);
                let LoBaseItem = null, LoBaseItemLoVp = null; // LayoutBaseItem, LayoutBaseItemLayoutViewport
                let LoPairItem = null, LoPairItemLoVp = null; // LayoutPairItem, LayoutPairItemLayoutViewport
                if(PairItem.Index > Item.Index) LoBaseItem =     Item, LoBaseItemLoVp =     ItemLoVp, LoPairItem = PairItem, LoPairItemLoVp = PairItemLoVp;
                else                            LoBaseItem = PairItem, LoBaseItemLoVp = PairItemLoVp, LoPairItem =     Item, LoPairItemLoVp =     ItemLoVp;
                LoPairItem.Scale = LoBaseItemLoVp.Height / LoPairItemLoVp.Height;
                const SpreadViewPort = {
                    Width:  LoBaseItemLoVp.Width + LoPairItemLoVp.Width * LoPairItem.Scale,
                    Height: LoBaseItemLoVp.Height
                };
                LoBaseItem.Scale = Math.min(
                    StageB / SpreadViewPort[this.C.L_SIZE_B],
                    StageL / SpreadViewPort[this.C.L_SIZE_L]
                );
                LoPairItem.Scale *= LoBaseItem.Scale;
            } else {
                const SpreadViewPort = {
                    Width:  ItemLoVp.Width * (/^(left|right)$/.test(Item['rendition:page-spread']) ? 2 : 1),
                    Height: ItemLoVp.Height
                };
                Item.Scale = Math.min(
                    StageB / SpreadViewPort[this.C.L_SIZE_B],
                    StageL / SpreadViewPort[this.C.L_SIZE_L]
                );
            }
        } else {
            ItemLoVp = this.getItemLayoutViewport(Item);
            if(this.S.RVM == 'paged' || !this.S['full-breadth-layout-in-scroll']) {
                // Calculate target dimensions based on viewport orientation and image orientation
                let targetB = StageB;
                let targetL = StageL;
                
                // In landscape mode (2 pages per spread), portrait images should fit in half width
                // In portrait mode (1 page per spread), all images use full width
                if(this.PagesPerSpread == 2 && isPortraitImage) {
                    // Landscape viewport + Portrait image = Half width
                    targetB = StageB / 2;
                    if(this.Bibi.Dev) this.O.log(`Landscape mode + Portrait image: scaling to half width ${targetB}px`);
                } else if(this.PagesPerSpread == 1) {
                    // Portrait viewport = Full width for all images
                    if(this.Bibi.Dev) this.O.log(`Portrait mode: using full width ${targetB}px`);
                } else {
                    // Landscape viewport + Landscape image = Full width
                    if(this.Bibi.Dev) this.O.log(`Landscape mode + Landscape image: using full width ${targetB}px`);
                }
                
                Item.Scale = Math.min(
                    targetB / ItemLoVp[this.C.L_SIZE_B],
                    targetL / ItemLoVp[this.C.L_SIZE_L]
                );
                
                if(this.Bibi.Dev) this.O.log(`Item ${Item.Index} scale: ${Item.Scale.toFixed(3)} (${ItemLoVp[this.C.L_SIZE_B]}x${ItemLoVp[this.C.L_SIZE_L]} -> ${Math.floor(ItemLoVp[this.C.L_SIZE_B]*Item.Scale)}x${Math.floor(ItemLoVp[this.C.L_SIZE_L]*Item.Scale)})`);
            } else {
                Item.Scale = StageB / ItemLoVp[this.C.L_SIZE_B];
            }
        }
        let PageL = Math.floor(ItemLoVp[this.C.L_SIZE_L] * Item.Scale);
        let PageB = Math.floor(ItemLoVp[this.C.L_SIZE_B] * (PageL / ItemLoVp[this.C.L_SIZE_L]));
        Item.Box.style[this.C.L_SIZE_l] = PageL + 'px';
        Item.Box.style[this.C.L_SIZE_b] = PageB + 'px';
        sML.style(Item, {
            width:  ItemLoVp.Width + 'px',
            height: ItemLoVp.Height + 'px',
            transform: 'scale(' + Item.Scale + ')'
        });
        return Item;
    };

    getItemViewport = (Item) => Item.IsPlaceholder ? null : (() => {
        const ViewportMeta = Item.Head.querySelector('meta[name="viewport"]');
        if(ViewportMeta)       return this.O.getViewportByMetaContent(           ViewportMeta.getAttribute('content'));
        if(Item.OnlySingleSVG) return this.O.getViewportByViewBox(Item.Body.firstElementChild.getAttribute('viewBox')); // It's also for Item of SVGs-in-Spine, or Fixed-Layout Item including SVG without Viewport.
        if(Item.OnlySingleIMG) return this.O.getViewportByImage(  Item.Body.firstElementChild                        ); // It's also for Item of Bitmaps-in-Spine.
                               return null                                                                       ;
    })();

    getItemLayoutViewport = (Item) => Item.Viewport ? Item.Viewport : this.B.ICBViewport ? this.B.ICBViewport : {
        Width:  this.Stage.Height * this.S['orientation-border-ratio'] / (/*Item.Spreaded &&*/ /^(left|right)$/.test(Item['rendition:page-spread']) ? 2 : 1),
        Height: this.Stage.Height
    };

    organizePages = () => this.Pages = this.Spreads.reduce((NewPages, Spread) => Spread.Pages.reduce((NewPages, Page) => { Page.Index = NewPages.push(Page) - 1; return NewPages; }, NewPages), []);

    replacePages = (OldPages, NewPages) => {
        const StartIndex = OldPages[0].Index, OldLength = OldPages.length, NewLength = NewPages.length;
        for(let l = NewPages.length, i = 0; i < l; i++) NewPages[i].Index = StartIndex + i;
        if(NewLength != OldLength) {
            const Dif = NewLength - OldLength;
            let i = OldPages[OldLength - 1].Index + 1;
            while(this.Pages[i]) this.Pages[i].Index += Dif, i++;
        }
        this.Pages.splice(StartIndex, OldLength, ...NewPages);
        return this.Pages;
    };

    layOutStage = () => {
        //this.E.dispatch('bibi:is-going-to:lay-out-stage');
        let MainContentLayoutLength = 0;
        this.Spreads.forEach(Spread => MainContentLayoutLength += Spread.Box['offset' + this.C.L_SIZE_L]);
        if(this.S['book-rendition-layout'] == 'pre-paginated' || this.S['reader-view-mode'] != 'paged') MainContentLayoutLength += this.S['spread-gap'] * (this.Spreads.length - 1);
        this.Main.Book.style[this.C.L_SIZE_l] = MainContentLayoutLength + 'px';
        //this.E.dispatch('bibi:laid-out-stage');
    };

    layOutBook = (Opt) => new Promise((resolve, reject) => {
        // Opt: {
        //     Destination: BibiDestination,
        //     Reset: Boolean, (default: false)
        //     DoNotCloseUtilities: Boolean, (default: false)
        //     Setting: BibiSetting,
        //     before: Function
        // }
        if(this.LayingOut) return reject();
        this.I.ScrollObserver.History = [];
        this.LayingOut = true;
        this.O.log(`Laying out...`, '<g:>');
        if(Opt) this.O.log(`Option: %O`, Opt); else Opt = {};
        if(!Opt.DoNotCloseUtilities) this.E.dispatch('bibi:closes-utilities');
        this.E.dispatch('bibi:is-going-to:lay-out', Opt);
        this.O.Busy = true;
        this.O.HTML.classList.add('busy');
        this.O.HTML.classList.add('laying-out');
        if(!Opt.NoNotification) this.I.note(`Laying out...`);
        if(!Opt.Destination) Opt.Destination = { IIPP: this.I.PageObserver.getIIPP() };
        if(Opt.Setting) this.S.update(Opt.Setting);
        const Layout = {}; ['reader-view-mode', 'spread-layout-direction', 'apparent-reading-direction'].forEach(Pro => Layout[Pro] = this.S[Pro]);
        this.O.log(`Layout: %O`, Layout);
        if(typeof Opt.before == 'function') Opt.before();
        if(!Opt.Reset) {
            resolve();
        } else {
            this.resetStage();
            const Promises = [];
            this.Spreads.forEach(Spread => Promises.push(this.layOutSpreadAndItsItems(Spread)));
            Promise.all(Promises).then(() => {
                this.organizePages();
                this.layOutStage();
                resolve();
            });
        }
    }).then(() => {
        return this.focusOn({ Destination: Opt.Destination, Duration: 0 });
    }).then(() => {
        this.O.Busy = false;
        this.O.HTML.classList.remove('busy');
        this.O.HTML.classList.remove('laying-out');
        if(!Opt.NoNotification) this.I.note('');
        this.LayingOut = false;
        this.E.dispatch('bibi:laid-out');
        this.O.log(`Laid out.`, '</g>');
    });

    updateOrientation = () => {
        const PreviousOrientation = this.Orientation;
        const PreviousPagesPerSpread = this.PagesPerSpread;
        
        if(typeof window.orientation != 'undefined') {
            this.Orientation = (window.orientation == 0 || window.orientation == 180) ? 'portrait' : 'landscape';
        } else {
            const W = window.innerWidth  - (this.S.ARA == 'vertical'   ? this.O.Scrollbars.Width  : 0);
            const H = window.innerHeight - (this.S.ARA == 'horizontal' ? this.O.Scrollbars.Height : 0);
            this.Orientation = (W / H) < this.S['orientation-border-ratio'] ? 'portrait' : 'landscape';
        }
        
        // Set pages per spread based on orientation
        // Portrait (縦長): 1 page per spread (single page view)
        // Landscape (横長): 2 pages per spread (spread view)
        this.PagesPerSpread = (this.Orientation == 'portrait') ? 1 : 2;
        
        if(this.Orientation != PreviousOrientation) {
            if(PreviousOrientation) this.E.dispatch('bibi:changes-orientation', this.Orientation);
            this.O.HTML.classList.remove('orientation-' + PreviousOrientation);
            this.O.HTML.classList.add('orientation-' + this.Orientation);
            if(this.Bibi.Dev) this.O.log(`Orientation changed: ${PreviousOrientation} -> ${this.Orientation} (${this.PagesPerSpread} pages per spread)`);
            if(PreviousOrientation) this.E.dispatch('bibi:changed-orientation', this.Orientation);
        }
    };

    changeView = (Par) => {
        if(
            this.S['fix-reader-view-mode'] ||
            !Par || typeof Par.Mode != 'string' || !/^(paged|horizontal|vertical)$/.test(Par.Mode) ||
            this.S.RVM == Par.Mode && !Par.Force
        ) return false;
        if(this.L.Opened) {
            this.E.dispatch('bibi:changes-view');
            this.O.Busy = true;
            this.O.HTML.classList.add('busy');
            this.O.HTML.classList.add('changing-view');
            const Delay = [
                this.O.TouchOS ? 99 : 3,
                this.O.TouchOS ? 99 : 33
            ];
            setTimeout(() => {
                this.E.dispatch('bibi:closes-utilities');
            }, Delay[0]);
            setTimeout(() => {
                this.layOutBook({
                    Reset: true,
                    NoNotification: Par.NoNotification,
                    Setting: {
                        'reader-view-mode': Par.Mode
                    }
                }).then(() => {
                    this.O.HTML.classList.remove('changing-view');
                    this.O.HTML.classList.remove('busy');
                    this.O.Busy = false;
                    setTimeout(() => this.E.dispatch('bibi:changed-view', Par.Mode), 0);
                });
            }, Delay[0] + Delay[1]);
        } else {
            this.S.update({
                'reader-view-mode': Par.Mode
            });
            this.L.play();
        }
        if(this.S['keep-settings'] && this.O.Biscuits) this.O.Biscuits.memorize('Book', { RVM: Par.Mode });
    };

    focusOn = (Par) => new Promise((resolve, reject) => {
        if(this.Moving) return reject();
        if(typeof Par == 'number' || /^\d+$/.test(Par)) Par = { Destination: Par * 1 };
        if(!Par) return reject();
        const _ = Par.Destination = this.hatchDestination(Par.Destination);
        if(!_) return reject();
        this.E.dispatch('bibi:is-going-to:focus-on', Par);
        this.Moving = true;
        Par.FocusPoint = 0;
        if(this.S['book-rendition-layout'] == 'reflowable') {
            if(typeof _.Point == 'number') {
                Par.FocusPoint = _.Point;
            } else {
                Par.FocusPoint = this.O.getElementCoord(_.Page)[this.C.L_AXIS_L];
                if(_.Side == 'after') Par.FocusPoint += (_.Page['offset' + this.C.L_SIZE_L] - this.Stage[this.C.L_SIZE_L]) * this.C.L_AXIS_D;
                if(this.S.SLD == 'rtl') Par.FocusPoint += _.Page.offsetWidth;
            }
            if(this.S.SLD == 'rtl') Par.FocusPoint -= this.Stage.Width;
        } else {
            if(this.Stage[this.C.L_SIZE_L] >= _.Page.Spread['offset' + this.C.L_SIZE_L]) {
                Par.FocusPoint = this.O.getElementCoord(_.Page.Spread)[this.C.L_AXIS_L];
                Par.FocusPoint -= Math.floor((this.Stage[this.C.L_SIZE_L] - _.Page.Spread['offset' + this.C.L_SIZE_L]) / 2);
            } else {
                Par.FocusPoint = this.O.getElementCoord(_.Page)[this.C.L_AXIS_L];
                if(this.Stage[this.C.L_SIZE_L] > _.Page['offset' + this.C.L_SIZE_L]) Par.FocusPoint -= Math.floor((this.Stage[this.C.L_SIZE_L] - _.Page['offset' + this.C.L_SIZE_L]) / 2);
                else if(_.Side == 'after') Par.FocusPoint += (_.Page['offset' + this.C.L_SIZE_L] - this.Stage[this.C.L_SIZE_L]) * this.C.L_AXIS_D;
            }
        }
        if(typeof _.TextNodeIndex == 'number') this.selectTextLocation(_); // Colorize Destination with Selection
        const ScrollTarget = { Frame: this.Main, X: 0, Y: 0 };
        ScrollTarget[this.C.L_AXIS_L] = Par.FocusPoint; if(!this.S['use-full-height'] && this.S.RVM == 'vertical') ScrollTarget.Y -= this.I.Menu.Height;
        return sML.scrollTo(ScrollTarget, {
            ForceScroll: true,
            Duration: typeof Par.Duration == 'number' ? Par.Duration : (this.S.SLA == this.S.ARA && this.S.RVM != 'paged') ? 222 : 0,
            Easing: (Pos) => (Pos === 1) ? 1 : Math.pow(2, -10 * Pos) * -1 + 1
        }).then(() => {
            resolve(_);
            this.E.dispatch('bibi:focused-on', Par);
        }).catch(reject).then(() => {
            this.Moving = false;
        });
    }).catch(() => Promise.resolve());

    hatchDestination = (_) => {
        if(!_) return null;
        if(
            this.S.BRL == 'reflowable'
                &&
            (this.S.SLA == 'vertical' && /-tb$/.test(this.B.WritingMode) || this.S.SLA == 'horizontal' && /^tb-/.test(this.B.WritingMode))
                &&
            ((_.P & /\./.test(_.P)) || _.Element || _.ElementSelector)
        ) {
            _.Point = this.hatchPoint(_);
            return _;
        }
        delete _.Point;
        if(_.Page) {
            if(this.Pages[_.Page.Index] != _.Page) delete _.Page; // Pages of the Item have been replaced.
            else return _;
        }
        if(typeof _ == 'number' || (typeof _ == 'string' && /^\d+$/.test(_))) {
            return { Page: this.Items[_].Pages[0] };
        } else if(typeof _ == 'string') {
                 if(_ == 'head' || _ == 'foot') _ = { Edge: _ };
            else if(this.X['EPUBCFI'])               _ = this.X['EPUBCFI'].getDestination(_);
        } else if(typeof _.IndexInItem == 'number') {
            if(this.Pages[_.Index] == _) return { Page: _ }; // Page (If Pages of the Item have not been replaced)
        } else if(typeof _.Index == 'number') {
            return { Page: _.Pages[0] }; // Item or Spread
        } else if(_.tagName) {
            _ = { Element: _ };
        }
        _.Page = this.hatchPage(_);
        return _;
    };

    hatchPage = (_) => {
        if(typeof _.P == 'string' && _.P) Object.assign(_, this.getPDestination(_.P));
        if(_.Page) return _.Page;
        if(typeof _.PageIndex == 'number') return this.Pages[_.PageIndex];
        if(typeof _.SIPP == 'number' && ((typeof _.PageIndexInSpread != 'number' && typeof _.PageProgressInSpread != 'number') || (typeof _.SpreadIndex != 'number' && !_.Spread))) _.SpreadIndex = Math.floor(_.SIPP), _.PageProgressInSpread = String(_.SIPP).replace(/^\d*\./, '0.') * 1;
        if(typeof _.IIPP == 'number' && ((typeof _.PageIndexInItem   != 'number' && typeof _.PageProgressInItem   != 'number') || (typeof _.ItemIndex   != 'number' && !_.Item  ))) _.ItemIndex   = Math.floor(_.IIPP), _.PageProgressInItem   = String(_.IIPP).replace(/^\d*\./, '0.') * 1;
        if(_.Edge == 'head') return this.Pages[0];
        if(_.Edge == 'foot') return this.Pages[this.Pages.length - 1];
        try {
            if(typeof _.ElementSelector == 'string') {
                if(!_.Item) _.Item = this.hatchItem(_);
                if( _.Item) _.Element = _.Item.contentDocument.querySelector(_.ElementSelector);
                delete _.ElementSelector;
            }
            if(_.Element) {
                const NPOE = this.hatchNearestPageOfElement(_.Element);
                if(NPOE) return NPOE;
            }
            if(typeof    _.PageIndexInItem   == 'number') return this.hatchItem(_).Pages[_.PageIndexInItem];
            if(typeof    _.PageIndexInSpread == 'number') return this.hatchSpread(_).Pages[_.PageIndexInSpread];
            if(typeof _.PageProgressInItem   == 'number') return (Item   =>   Item.Pages[sML.limitMax(Math.floor(  Item.Pages.length * _.PageProgressInItem  ),   Item.Pages.length - 1)])(this.hatchItem(  _));
            if(typeof _.PageProgressInSpread == 'number') return (Spread => Spread.Pages[sML.limitMax(Math.floor(Spread.Pages.length * _.PageProgressInSpread), Spread.Pages.length - 1)])(this.hatchSpread(_));
            return (this.hatchItem(_) || this.hatchSpread(_)).Pages[0];
        } catch(Err) {}
        return null;
    };

    hatchItem = (_) => {
        if(_.Item) return _.Item;
        if(typeof _.ItemIndex == 'number') return this.Items[_.ItemIndex];
        if(typeof _.ItemIndexInSpine == 'number') return this.B.Package.Spine[_.ItemIndexInSpine];
        if(typeof _.ItemIndexInSpread == 'number') try { return this.hatchSpread(_).Items[_.ItemIndexInSpread]; } catch(_) { return null; }
        //if(_.Element && _.Element.ownerDocument.body.Item && _.Element.ownerDocument.body.Item.Pages) return _.Element.ownerDocument.body.Item;
        return null;
    };

    hatchSpread = (_) => {
        if(_.Spread) return _.Spread;
        if(typeof _.SpreadIndex == 'number') return this.Spreads[_.SpreadIndex];
        return null;
    };

    hatchNearestPageOfElement = (Ele) => {
        if(!Ele || !Ele.tagName) return null;
        const Item = Ele.ownerDocument.body.Item;
        if(!Item || !Item.Pages) return null;
        let NearestPage, ElementCoordInItem;
        if(Item.Columned) {
            ElementCoordInItem = this.O.getElementCoord(Ele)[this.C.L_AXIS_B];
            if(this.S.PPD == 'rtl' && this.S.SLA == 'vertical') ElementCoordInItem = /* !!!! Use offsetWidth of **Body** >>>> */ Item.Body.offsetWidth - ElementCoordInItem - Ele.offsetWidth;
            NearestPage = Item.Pages[ElementCoordInItem <= 0 ? 0 : Math.floor(ElementCoordInItem / Item.ColumnBreadth)];
        } else {
            ElementCoordInItem = this.O.getElementCoord(Ele)[this.C.L_AXIS_L];
            if(this.S.PPD == 'rtl' && this.S.SLA == 'horizontal') ElementCoordInItem = /* !!!! Use offsetWidth of **HTML** >>>> */ Item.HTML.offsetWidth - ElementCoordInItem - Ele.offsetWidth;
            NearestPage = Item.Pages[Math.floor(ElementCoordInItem / this.Stage[this.C.L_SIZE_L])];
            /*
            NearestPage = Item.Pages[0];
            for(let l = Item.Pages.length, i = 0; i < l; i++) {
                ElementCoordInItem -= Item.Pages[i]['offset' + this.C.L_SIZE_L];
                if(ElementCoordInItem <= 0) {
                    NearestPage = Item.Pages[i];
                    break;
                }
            }
            //*/
        }
        return NearestPage;
    };

    hatchPoint = (_) => {
        try {
            if(typeof _.P == 'string' && _.P) Object.assign(_, this.getPDestination(_.P));
            if(typeof _.ElementSelector == 'string') { _.Element = this.hatchItem(_).contentDocument.querySelector(_.ElementSelector); delete _.ElementSelector; }
            if(_.Element) return this.hatchPointOfElement(_.Element);
        } catch(_) {}
        return null;
    };

    hatchPointOfElement = (Ele) => {
        if(!Ele || !Ele.tagName) return null;
        const Item = Ele.ownerDocument.body.Item;
        if(!Item || !Item.Pages) return null;
        let ElementCoordInItem;
        if(Item.Columned) {
            ElementCoordInItem = this.O.getElementCoord(Ele)[this.C.L_AXIS_B];
            if(this.S.PPD == 'rtl' && this.S.SLA == 'vertical') ElementCoordInItem = Item.Body.offsetWidth - ElementCoordInItem - Ele.offsetWidth; // Use offsetWidth of **Body**
        } else {
            ElementCoordInItem = this.O.getElementCoord(Ele)[this.C.L_AXIS_L];
            if(this.S.PPD == 'rtl' && this.S.SLA == 'horizontal') ElementCoordInItem += Ele.offsetWidth; // Use offsetWidth of **Body**
        }
        return this.O.getElementCoord(Item)[this.C.L_AXIS_L] + this.S['item-padding-' + this.C.L_OOBL_l] + ElementCoordInItem;
    };

    getPDestination = (PString) => {
        PString = this.Bibi.verifySettingValue('string', 'p', PString);
        if(!PString) return null;
        if(/^[a-z]+$/.test(PString)) return (PString == 'head' || PString == 'foot') ? { Edge: PString } : null;
        const Steps = PString.split(/-[a-z]+$/.test(PString) ? '-' : '.');
        const ItemIndex = parseInt(Steps.shift()) - 1;
        if(ItemIndex <                  0) return { Edge: 'head' };
        if(ItemIndex > this.Items.length - 1) return { Edge: 'foot' };
        const Item = this.Items[ItemIndex];
        if(Steps.length) {
            if(/^[a-z]+$/.test(Steps[0])) {
                if(Steps[0] == 'end') return { Page: Item.Pages[Item.Pages.length - 1] };
            } else {
                let ElementSelector = `body`;
                Steps.forEach(Step => ElementSelector += `>*:nth-child(` + Step + `)`);
                const Element = Item.contentDocument.querySelector(ElementSelector);
                if(Element) return { Element: Element };
            }
        }
        return { Page: Item.Pages[0] };
    };

    selectTextLocation = (_) => {
        if(typeof _.TextNodeIndex != 'number' || !_.Element) return false;
        const _Node = _.Element.childNodes[_.TextNodeIndex];
        if(!_Node || !_Node.textContent) return;
        const Sides = { Start: { Node: _Node, Index: 0 }, End: { Node: _Node, Index: _Node.textContent.length } };
        if(_.TermStep) {
            if(_.TermStep.Preceding || _.TermStep.Following) {
                Sides.Start.Index = _.TermStep.Index, Sides.End.Index = _.TermStep.Index;
                if(_.TermStep.Preceding) Sides.Start.Index -= _.TermStep.Preceding.length;
                if(_.TermStep.Following)   Sides.End.Index += _.TermStep.Following.length;
                if(Sides.Start.Index < 0 || _Node.textContent.length < Sides.End.Index) return;
                if(_Node.textContent.substr(Sides.Start.Index, Sides.End.Index - Sides.Start.Index) != _.TermStep.Preceding + _.TermStep.Following) return;
            } else if(_.TermStep.Side && _.TermStep.Side == 'a') {
                Sides.Start.Node = _Node.parentNode.firstChild; while(Sides.Start.Node.childNodes.length) Sides.Start.Node = Sides.Start.Node.firstChild;
                Sides.End.Index = _.TermStep.Index - 1;
            } else {
                Sides.Start.Index = _.TermStep.Index;
                Sides.End.Node = _Node.parentNode.lastChild; while(Sides.End.Node.childNodes.length) Sides.End.Node = Sides.End.Node.lastChild;
                Sides.End.Index = Sides.End.Node.textContent.length;
            }
        }
        return sML.Ranges.selectRange(sML.Ranges.getRange(Sides));
    };

    moveBy = (Par) => new Promise((resolve, reject) => {
        if(this.Moving || !this.L.Opened) return reject();
        if(!Par) return reject();
        switch(typeof Par) {
            case 'string':
            case 'number': Par = { Distance: Par };
            case 'object': Par.Distance *= 1;
        }
        if(typeof Par.Distance != 'number' || !isFinite(Par.Distance) || !Par.Distance) return reject();
        //Par.Distance = Par.Distance < 0 ? -1 : 1;
        this.E.dispatch('bibi:is-going-to:move-by', Par);
        const Current = (Par.Distance > 0 ? this.I.PageObserver.Current.List.slice(-1) : this.I.PageObserver.Current.List)[0], CurrentPage = Current.Page, CurrentItem = CurrentPage.Item;
        let Promised = null;
        if(
            true ||
            this.Columned ||
            this.S.BRL == 'pre-paginated' ||
            this.S.BRL == 'reflowable' && this.S.RVM == 'paged' ||
            CurrentItem['rendition:layout'] == 'pre-paginated' ||
            CurrentItem.Outsourcing ||
            CurrentItem.Pages.length == 1 ||
            Par.Distance < 0 && CurrentPage.IndexInItem == 0 ||
            Par.Distance > 0 && CurrentPage.IndexInItem == CurrentItem.Pages.length - 1
        ) {
            let Side = Par.Distance > 0 ? 'before' : 'after';
            if(Current.PageIntersectionStatus.Oversized) {
                if(Par.Distance > 0) {
                         if(Current.PageIntersectionStatus.Entering) Par.Distance = 0, Side = 'before';
                    else if(Current.PageIntersectionStatus.Headed  ) Par.Distance = 0, Side = 'after';
                } else {
                         if(Current.PageIntersectionStatus.Footed  ) Par.Distance = 0, Side = 'before';
                    else if(Current.PageIntersectionStatus.Passing ) Par.Distance = 0, Side = 'before';
                }
            } else {
                if(Par.Distance > 0) {
                    if(Current.PageIntersectionStatus.Entering) Par.Distance = 0, Side = 'before';
                } else {
                    if(Current.PageIntersectionStatus.Passing ) Par.Distance = 0, Side = 'before';
                }
            }
            let DestinationPageIndex = CurrentPage.Index + Par.Distance;
                 if(DestinationPageIndex <                  0) DestinationPageIndex = 0,                  Side = 'before';
            else if(DestinationPageIndex > this.Pages.length - 1) DestinationPageIndex = this.Pages.length - 1, Side = 'after';
            let DestinationPage = this.Pages[DestinationPageIndex];
            if(this.S.BRL == 'pre-paginated' && DestinationPage.Item.SpreadPair) {
                if(this.S.SLA == 'horizontal' && this.Stage[this.C.L_SIZE_L] > DestinationPage.Spread['offset' + this.C.L_SIZE_L]) {
                    if(Par.Distance < 0 && DestinationPage.IndexInSpread == 0) DestinationPage = DestinationPage.Spread.Pages[1];
                    if(Par.Distance > 0 && DestinationPage.IndexInSpread == 1) DestinationPage = DestinationPage.Spread.Pages[0];
                }
            }
            Par.Destination = { Page: DestinationPage, Side: Side };
            Promised = this.focusOn(Par).then(() => Par.Destination);
        } else {
            Promised = this.scrollBy(Par);
        }
        Promised.then(Returned => {
            resolve(Returned);
            this.E.dispatch('bibi:moved-by', Par);
        });
    }).catch(() => Promise.resolve());

    scrollBy = (Par) => new Promise((resolve, reject) => {
        if(!Par) return reject();
        if(typeof Par == 'number') Par = { Distance: Par };
        if(!Par.Distance || typeof Par.Distance != 'number') return reject();
        this.E.dispatch('bibi:is-going-to:scroll-by', Par);
        this.Moving = true;
        const ScrollTarget = { Frame: this.Main, X: 0, Y: 0 };
        switch(this.S.SLD) {
            case 'ttb': ScrollTarget.Y = this.Main.scrollTop  + this.Stage.Height * Par.Distance     ; break;
            case 'ltr': ScrollTarget.X = this.Main.scrollLeft + this.Stage.Width  * Par.Distance     ; break;
            case 'rtl': ScrollTarget.X = this.Main.scrollLeft + this.Stage.Width  * Par.Distance * -1; break;
        }
        sML.scrollTo(ScrollTarget, {
            Duration: typeof Par.Duration == 'number' ? Par.Duration : (this.S.RVM != 'paged' && this.S.SLA == this.S.ARA) ? 100 : 0,
            ForceScroll: Par.Cancelable ? false : true,
            ease: typeof Par.ease == 'function' ? Par.ease : null
        }).catch(() => true).then(() => {
            this.Moving = false;
            resolve();
        });
    }).then(() => 
        this.E.dispatch('bibi:scrolled-by', Par)
    );

}
