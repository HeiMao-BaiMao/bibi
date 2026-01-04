import sML from 'sml.js';

export default class BookmarkManager {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.BookmarkManager = { create: () => { if(!S['use-bookmarks'] || !O.Biscuits) return;
        const BookmarkManager = this.I.BookmarkManager = {
        Bookmarks: [],
        initialize: () => {
        BookmarkManager.Subpanel = this.I.createSubpanel({
        Opener: this.I.Menu.L.addButtonGroup({ Sticky: true, id: 'bibi-buttongroup_bookmarks' }).addButton({
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
        this.I.PageObserver.updateCurrent();
        Bookmarks = this.I.PageObserver.Current.Pages.map(Page => ({
        IIPP: this.I.PageObserver.getIIPP({ Page: Page }),
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
        if(L.Opened) return R.focusOn({ Destination: Bmk }).then(Destination => this.I.History.add({ UI: BookmarkManager, SumUp: false/*true*/, Destination: Destination }));
        if(!L.Waiting) return false;
        if(S['start-in-new-window']) return L.openNewWindow(location.href + (location.hash ? '&' : '#') + 'jo(iipp=' + Bmk.IIPP + ')');
        R.StartOn = { IIPP: Bmk.IIPP };
        L.play();
        },
        remove: () => BookmarkManager.remove(Bmk)
        });
        const Remover = Button.appendChild(sML.create('span', { className: 'bibi-remove-bookmark', title: 'しおりを削除' }));
        this.I.setFeedback(Remover, { StopPropagation: true });
        E.add(Remover, 'bibi:tapped', () => Button.remove());
        Remover.addEventListener(E['pointer-over'], Eve => Eve.stopPropagation());
        if(Bmk.IsHot) {
        delete Bmk.IsHot;
        this.I.setUIState(Button, 'active'); setTimeout(() => this.I.setUIState(Button, ExistingBookmarks.includes(Bmk) ? 'disabled' : 'default'), 234);
        }
        else if(ExistingBookmarks.includes(Bmk)) this.I.setUIState(Button, 'disabled');
        else                                     this.I.setUIState(Button,  'default');
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
        this.I.setUIState(BookmarkManager.AddButton, 'disabled');
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
    }
}
