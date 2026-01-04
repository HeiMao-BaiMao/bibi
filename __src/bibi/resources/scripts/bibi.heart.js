/*!
 *                                                                                                                          (℠)
 *  ## Bibi (heart) | Heart of Bibi.
 *
 */




import EventManager from './core/EventManager.js';
import SettingsManager from './core/SettingsManager.js';
import SessionManager from './core/SessionManager.js';
import BookLoader from './core/BookLoader.js';
import Compass from './core/Compass.js';
import Reader from './core/Reader.js';
import UserInterface from './core/UserInterface.js';
import Preset from './core/Preset.js';
import UriSettings from './core/UriSettings.js';
import DocSettings from './core/DocSettings.js';
import Operator from './core/Operator.js';
import Messages from './core/Messages.js';
import Extensions from './core/Extensions.js';
import Book from './core/Book.js';

export const Bibi = { 'version': '____Bibi-Version____', 'href': 'https://bibi.epub.link', Status: '', TimeOrigin: Date.now() };

export const E = new EventManager();
export const S = new SettingsManager();
export const L = new BookLoader();
export const R = new Reader();
export const I = new UserInterface();
export const B = new Book();
export const P = new Preset();
export const U = new UriSettings();
export const D = new DocSettings();
export const O = new Operator();
export const M = new Messages();
export const X = new Extensions();

Bibi.SettingTypes = S.Types;
Bibi.SettingTypes_PresetOnly = S.Types_PresetOnly;
Bibi.SettingTypes_UserOnly = S.Types_UserOnly;

Bibi.verifySettingValue = (SettingType, _P, _V, Fill) => S.verifyValue(SettingType, _P, _V, Fill);
// Map individual verifiers back to Bibi.verifySettingValue for backward compatibility
for(const key in S.Verifiers) {
    Bibi.verifySettingValue[key] = S.Verifiers[key];
}

Bibi.applyFilteredSettingsTo = (To, From, ListOfSettingTypes, Fill) => S.applyFilteredSettingsTo(To, From, ListOfSettingTypes, Fill);


Bibi.ErrorMessages = {
       Canceled: `Fetch Canceled`,
    CORSBlocked: `Probably CORS Blocked`,
    DataInvalid: `Data Invalid`,
       NotFound: `404 Not Found`
};




//==============================================================================================================================================
//----------------------------------------------------------------------------------------------------------------------------------------------

//-- Hello !

//----------------------------------------------------------------------------------------------------------------------------------------------


Bibi.at1st = () => Bibi.at1st.List.forEach(fn => typeof fn == 'function' ? fn() : true), Bibi.at1st.List = [];

Bibi.hello = () => new Promise(resolve => {
    Bibi.at1st();
    O.log.initialize();
    O.log(`Hello!`, '<b:>');
    O.log(`[ja] ${ Bibi['href'] }`);
    O.log(`[en] https://github.com/HeiMao-BaiMao/bibi`);
    resolve();
})
.then(Bibi.initialize)
.then(Bibi.loadExtensions)
.then(Bibi.ready)
.then(Bibi.getBookData)
.then(Bibi.loadBook)
.then(Bibi.bindBook)
.then(Bibi.openBook)
.catch(O.error);


Bibi.initialize = () => {
    //const PromiseTryingRangeRequest = O.tryRangeRequest().then(() => true).catch(() => false).then(TF => O.RangeRequest = TF);
    { // Path / URI
        O.Origin = location.origin || (location.protocol + '//' + (location.host || (location.hostname + (location.port ? ':' + location.port : ''))));
        O.Local = location.protocol == 'file:';
        O.RequestedURL = location.href;
    }
    { // DOM
        O.contentWindow = window;
        O.contentDocument = document;
        O.HTML  = document.documentElement;
        O.Head  = document.head;
        O.Body  = document.body;
        O.Info  = document.getElementById('bibi-info');
        O.Title = document.getElementsByTagName('title')[0];
    }
    { // Environments
        O.HTML.classList.add(...sML.Environments, 'Bibi', 'welcome');
        if(O.TouchOS = (sML.OS.iOS || sML.OS.Android) ? true : false) { // Touch Device
            O.HTML.classList.add('touch');
            if(sML.OS.iOS) {
                O.Head.appendChild(sML.create('meta', { name: 'apple-mobile-web-app-capable',          content: 'yes'   }));
                O.Head.appendChild(sML.create('meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'white' }));
            }
        }
        if(Bibi.Dev)   O.HTML.classList.add('dev');
        if(Bibi.Debug) O.HTML.classList.add('debug');
        O.HTML.classList.add('default-lang-' + (O.Language = (NLs => { // Language
            if(Array.isArray(navigator.languages)) NLs = NLs.concat(navigator.languages);
            if(navigator.language && navigator.language != NLs[0]) NLs.unshift(navigator.language);
            for(let l = NLs.length, i = 0; i < l; i++) {
                const Lan = NLs[i].split ? NLs[i].split('-')[0] : '';
                if(Lan == 'ja') return 'ja';
                if(Lan == 'en') break;
            }                   return 'en';
        })([])));
    }
    { // Modules
        X.initialize(S, E);
        O.initialize(Bibi, I, S, R, U, B, L, E, X);
        P.initialize(U);
        U.initialize(S, R, X, E);
        D.initialize(Bibi);
        M.initialize(O, S, E);
        
        /*E.initialize();*/ O.Biscuits.initialize(undefined, O, E, P, Bibi);
        
        S.initialize(Bibi, O, E, U, D, P, B, C);
        L.initialize(Bibi, O, S, E, I, B, R, D, X);
        R.initialize(Bibi, O, S, E, I, B, C, L, X);
        I.initialize(Bibi, O, S, E, R, L);
    }
    { // Embedding, Window, Fullscreen
        O.Embedded = (() => { // Window Embedded or Not
            if(window.parent == window) { O.HTML.classList.add('window-direct'  );                                                                         return                            0; } // false
            else                        { O.HTML.classList.add('window-embedded'); try { if(location.host == parent.location.host || parent.location.href) return 1; } catch(Err) {} return -1; } // true (1:Reachable or -1:Unreachable)
        })();
        O.ParentBibi = O.Embedded === 1 && typeof S['parent-bibi-index'] == 'number' ? window.parent['bibi:jo'].Bibis[S['parent-bibi-index']] || null : null;
        O.ParentOrigin = O.ParentBibi ? window.parent.location.origin : '';
        O.FullscreenTarget = (() => { // Fullscreen Target
            const FsT = (() => {
                if(!O.Embedded)  { sML.Fullscreen.polyfill(window       ); return O.HTML;             }
                if(O.ParentBibi) { sML.Fullscreen.polyfill(window.parent); return O.ParentBibi.Frame; }
            })() || null;
            if(FsT && FsT.ownerDocument.fullscreenEnabled) { O.HTML.classList.add('fullscreen-enabled' ); return FsT;  }
            else                                           { O.HTML.classList.add('fullscreen-disabled'); return null; }
        })();
        if(O.ParentBibi) {
            O.ParentBibi.Window = window, O.ParentBibi.Document = document, O.ParentBibi.HTML = O.HTML, O.ParentBibi.Body = O.Body;
            ['bibi:initialized', 'bibi:readied', 'bibi:prepared', 'bibi:opened'].forEach(EN => E.add(EN, Det => O.ParentBibi.dispatch(EN, Det)));
            window.addEventListener('message', M.receive, false);
        }
    }
    if(sML.UA.Trident && !(sML.UA.Trident[0] >= 7)) { // Say Bye-bye
        I.note(`Your Browser Is Not Compatible`, 99999999999, 'ErrorOccured');
        throw I.Veil.byebye({
            'en': `<span>Sorry....</span> <span>Your Browser Is</span> <span>Not Compatible.</span>`,
            'ja': `<span>大変申し訳ありません。</span> <span>お使いのブラウザでは、</span><span>動作しません。</span>`
        });
    } else { // Say Welcome!
        I.note(`<span class="non-visual">Welcome!</span>`);
    }
    { // Writing Mode, Font Size, Slider Size, Menu Height
        O.WritingModeProperty = (() => {
            const HTMLComputedStyle = getComputedStyle(O.HTML);
            if(/^(vertical|horizontal)-/.test(HTMLComputedStyle[        'writing-mode']) || sML.UA.Trident) return         'writing-mode';
            if(/^(vertical|horizontal)-/.test(HTMLComputedStyle['-webkit-writing-mode'])                  ) return '-webkit-writing-mode';
            if(/^(vertical|horizontal)-/.test(HTMLComputedStyle[  '-epub-writing-mode'])                  ) return   '-epub-writing-mode';
            return undefined;
        })();
        const StyleChecker = O.Body.appendChild(sML.create('div', { id: 'bibi-style-checker', innerHTML: ' aAａＡあ亜　', style: { width: 'auto', height: 'auto', left: '-1em', top: '-1em' } }));
        O.VerticalTextEnabled = (StyleChecker.offsetWidth < StyleChecker.offsetHeight);
        O.DefaultFontSize = Math.min(StyleChecker.offsetWidth, StyleChecker.offsetHeight);
        StyleChecker.style.fontSize = '0.01px';
        O.MinimumFontSize = Math.min(StyleChecker.offsetWidth, StyleChecker.offsetHeight);
        StyleChecker.setAttribute('style', ''), StyleChecker.innerHTML = '';
        I.Slider.Size = S['use-slider' ] ? StyleChecker.offsetWidth  : 0;
        I.Menu.Height = S['use-menubar'] ? StyleChecker.offsetHeight : 0;
        delete document.body.removeChild(StyleChecker);
    }
    { // Scrollbars
        O.Body.style.width = '101vw', O.Body.style.height = '101vh';
        O.Scrollbars = { Width: window.innerWidth - O.HTML.offsetWidth, Height: window.innerHeight - O.HTML.offsetHeight };
        O.HTML.style.width = O.Body.style.width = '100%', O.Body.style.height = '';
    }
    O.HTML.classList.toggle('book-full-height', S['use-full-height']);
    O.HTML.classList.remove('welcome');
    E.dispatch('bibi:initialized', Bibi.Status = Bibi.Initialized = 'Initialized');
    //return PromiseTryingRangeRequest;
};


Bibi.loadExtensions = () => {
    return new Promise((resolve, reject) => {
        const AdditionalExtensions = [];
        if(!S['allow-scripts-in-content']) AdditionalExtensions.push('sanitizer.js');
        let ReadyForExtraction = false, ReadyForBibiZine = false;
        if(S['book']) {
            if(O.isToBeExtractedIfNecessary(S['book'])) ReadyForExtraction = true;
            if(S['zine'])                               ReadyForBibiZine   = true;
        } else {
            if(S['accept-local-file'] || S['accept-blob-converted-data']) ReadyForExtraction = ReadyForBibiZine = true;
        }
        if(ReadyForBibiZine) AdditionalExtensions.unshift('zine.js');
        (ReadyForExtraction ? (S['book'] ? O.tryRangeRequest().then(() => 'on-the-fly') : Promise.reject()).catch(() => 'at-once').then(_ => AdditionalExtensions.unshift('extractor/' + _ + '.js')) : Promise.resolve()).then(() => {
            if(AdditionalExtensions.length) AdditionalExtensions.forEach(AX => S['extensions'].unshift({ 'src': new URL('../../extensions/' + AX, Bibi.Script.src).href }));
            if(S['extensions'].length == 0) return reject();
            O.log(`Loading Extension${ S['extensions'].length > 1 ? 's' : '' }...`, '<g:>');
            const loadExtensionInPreset = (i) => {
                X.load(S['extensions'][i]).then(Msg => {
                    //O.log(Msg);
                }).catch(Msg => {
                    O.log(Msg);
                }).then(() => {
                    S['extensions'][i + 1] ? loadExtensionInPreset(i + 1) : resolve();
                });
            };
            loadExtensionInPreset(0);
        });
    }).then(() => {
        O.log(`Extensions: %O`, X.Extensions);
        O.log(X.Extensions.length ? `Loaded. (${ X.Extensions.length } Extension${ X.Extensions.length > 1 ? 's' : '' })` : `No Extension.`, '</g>')
    }).catch(() => false);
};


Bibi.ready = () => new Promise(resolve => {
    O.HTML.classList.add('ready');
    O.ReadiedURL = location.href;
    E.add('bibi:readied', resolve);
    setTimeout(() => E.dispatch('bibi:readied', Bibi.Status = Bibi.Readied = 'Readied'), (O.TouchOS && !O.Embedded) ? 1234 : 0);
}).then(() => {
    O.HTML.classList.remove('ready');
});


Bibi.getBookData = () =>
    S['book-data']         ?     Promise.resolve({ BookData: S['book-data'], BookDataMIMEType: S['book-data-mimetype'] }) :
    S['book']              ?     Promise.resolve({ Book: S['book'] }) :
    S['accept-local-file'] ? new Promise(resolve => { Bibi.getBookData.resolve = (Par) => { resolve(Par), O.HTML.classList.remove('waiting-file'); }; O.HTML.classList.add('waiting-file'); }) :
                                 Promise.reject (`Tell me EPUB name via ${ O.Embedded ? 'embedding tag' : 'URI' }.`);

Bibi.setBookData = (Par) => Bibi.getBookData.resolve ? Bibi.getBookData.resolve(Par) : Promise.reject(Par);

Bibi.busyHerself = () => new Promise(resolve => {
    O.Busy = true;
    O.HTML.classList.add('busy');
    O.HTML.classList.add('loading');
    window.addEventListener(E['resize'], R.resetBibiHeight);
    Bibi.busyHerself.resolve = () => { resolve(); delete Bibi.busyHerself; };
}).then(() => {
    window.removeEventListener(E['resize'], R.resetBibiHeight);
    O.Busy = false;
    O.HTML.classList.remove('busy');
    O.HTML.classList.remove('loading');
});


Bibi.loadBook = (BookInfo) => Promise.resolve().then(() => {
    Bibi.busyHerself();
    I.note(`Loading...`);
    O.log(`Initializing Book...`, '<g:>');
    return L.initializeBook(BookInfo).then(InitializedAs => {
        O.log(`${ InitializedAs }: %O`, B);
        O.log(`Initialized. (as ${ /^[aiueo]/i.test(InitializedAs) ? 'an' : 'a' } ${ InitializedAs })`, '</g>');
    });
}).then(() => {
    S.update();
    R.updateOrientation();
    R.resetStage();
}).then(() => {
    // Create Cover
    O.log(`Creating Cover...`, '<g:>');
    if(B.CoverImage.Source) {
        O.log(`Cover Image: %O`, B.CoverImage.Source);
        O.log(`Will Be Created.`, '</g>');
    } else {
        O.log(`Will Be Created. (w/o Image)`, '</g>');
    }
    return L.createCover(); // ← loading is async
}).then(() => {
    // Load Navigation
    if(!B.Nav.Source) return O.log(`No Navigation.`)
    O.log(`Loading Navigation...`, '<g:>');
    return L.loadNavigation().then(PNav => {
        O.log(`${ B.Nav.Type }: %O`, B.Nav.Source);
        O.log(`Loaded.`, '</g>');
        E.dispatch('bibi:loaded-navigation', B.Nav.Source);
    });
}).then(() => {
    // Announce "Prepared" (and Wait, sometime)
    E.dispatch('bibi:prepared', Bibi.Status = Bibi.Prepared = 'Prepared');
    if(!S['autostart'] && !L.Played) return L.wait();
}).then(() => {
    // Background Preparing
    return L.preprocessResources();
}).then(() => {
    // Load & Layout Items in Spreads and Pages
    O.log(`Loading Items in Spreads...`, '<g:>');
    const Promises = [];
    const LayoutOption = {
        TargetSpreadIndex: 0,
        Destination: { Edge: 'head' },
        resetter:       () => { LayoutOption.Reset = true; LayoutOption.removeResetter(); },
        addResetter:    () => { window   .addEventListener('resize', LayoutOption.resetter); },
        removeResetter: () => { window.removeEventListener('resize', LayoutOption.resetter); }
    };
    if(typeof R.StartOn == 'object') {
        const Item = typeof R.StartOn.Item == 'object' ? R.StartOn.Item : (() => {
            if(typeof R.StartOn.ItemIndex == 'number') {
                let II = R.StartOn.ItemIndex;
                     if(II <  0             ) R.StartOn = { ItemIndex: 0 };
                else if(II >= R.Items.length) R.StartOn = { ItemIndex: R.Items.length - 1 };
                return R.Items[R.StartOn.ItemIndex];
            }
            if(typeof R.StartOn.ItemIndexInSpine  == 'number') {
                let IIIS = R.StartOn.ItemIndexInSpine;
                     if(IIIS <  0                     ) IIIS = 0;
                else if(IIIS >= B.Package.Spine.length) IIIS = B.Package.Spine.length - 1;
                let Item = B.Package.Spine[R.StartOn.ItemIndexInSpine];
                if(!Item.Spread) {
                    R.StartOn = { ItemIndex: 0 };
                    Item = R.Items[0];
                }
                return Item;
            }
            if(typeof R.StartOn.P == 'string') {
                const Steps = R.StartOn.P.split('.');
                let II = Steps.shift() * 1 - 1;
                     if(II <  0             ) II = 0,                  R.StartOn = { P: String(II + 1) };
                else if(II >= R.Items.length) II = R.Items.length - 1, R.StartOn = { P: String(II + 1) };
                return R.Items[II];
            }
            if(typeof R.StartOn.IIPP == 'number') {
                let II = Math.floor(R.StartOn.IIPP);
                     if(II <  0             ) II = 0,                  R.StartOn = { IIPP: II };
                else if(II >= R.Items.length) II = R.Items.length - 1, R.StartOn = { IIPP: II };
                return R.Items[II];
            }
            if(typeof R.StartOn.Edge == 'string') {
                R.StartOn = (R.StartOn.Edge != 'foot') ? { Edge: 'head' } : { Edge: 'foot' };
                switch(R.StartOn.Edge) {
                    case 'head': return R.Items[0];
                    case 'foot': return R.Items[R.Items.length - 1];
                }
            }
        })();
        LayoutOption.TargetSpreadIndex = Item && Item.Spread ? Item.Spread.Index : 0;
        LayoutOption.Destination = R.StartOn;
    }
    LayoutOption.addResetter();
    let LoadedItems = 0;
    R.Spreads.forEach(Spread => Promises.push(new Promise(resolve => L.loadSpread(Spread, { AllowPlaceholderItems: S['allow-placeholders'] && Spread.Index != LayoutOption.TargetSpreadIndex }).then(() => {
        LoadedItems += Spread.Items.length;
        I.note(`Loading... (${ LoadedItems }/${ R.Items.length } Items Loaded.)`);
        !LayoutOption.Reset ? R.layOutSpreadAndItsItems(Spread).then(resolve) : resolve();
    }))));
    return Promise.all(Promises).then(() => {
        O.log(`Loaded. (${ R.Items.length } in ${ R.Spreads.length })`, '</g>');
        return LayoutOption;
    });
});


Bibi.bindBook = (LayoutOption) => {
    if(!LayoutOption.Reset) {
        R.organizePages();
        R.layOutStage();
    }
    return R.layOutBook(LayoutOption).then(() => {
        LayoutOption.removeResetter();
        E.dispatch('bibi:laid-out-for-the-first-time', LayoutOption);
        return LayoutOption
    });
};


Bibi.openBook = (LayoutOption) => new Promise(resolve => {
    // Open
    Bibi.busyHerself.resolve();
    I.Veil.close();
    L.Opened = true;
    document.body.click(); // To responce for user scrolling/keypressing immediately
    I.note('');
    O.log(`Enjoy Readings!`, '</b>');
    E.dispatch('bibi:opened', Bibi.Status = Bibi.Opened = 'Opened');
    E.dispatch('bibi:scrolled');
    resolve();
}).then(() => {
    const LandingPage = R.hatchPage(LayoutOption.Destination) || R.Pages[0];
    if(!I.History.List.length) {
        I.History.List = [{ UI: Bibi, Item: LandingPage.Item, PageProgressInItem: LandingPage.IndexInItem / LandingPage.Item.Pages.length }];
        I.History.update();
    }
    if(S['allow-placeholders']) E.add('bibi:scrolled', () => I.PageObserver.turnItems());
    if(S['resume-from-last-position']) E.add('bibi:changed-intersection', () => { try { if(O.Biscuits) O.Biscuits.memorize('Book', { Position: { IIPP: I.PageObserver.getIIPP() } }); } catch(Err) {} });
    E.add('bibi:commands:move-by',     R.moveBy);
    E.add('bibi:commands:scroll-by',   R.scrollBy);
    E.add('bibi:commands:focus-on',    R.focusOn);
    E.add('bibi:commands:change-view', R.changeView);
    (Bibi.Dev && location.hostname != 'localhost') ? Bibi.createDevNote() : delete Bibi.createDevNote;
    /*
    alert((Alert => {
        [
            'document.referrer',
            'navigator.userAgent',
            '[navigator.appName, navigator.vendor, navigator.platform]',
            'window.innerHeight',
            '[O.HTML.offsetHeight, O.HTML.clientHeight, O.HTML.scrollHeight]',
            '[O.Body.offsetHeight, O.Body.clientHeight, O.Body.scrollHeight]',
            '[R.Main.offsetHeight, R.Main.clientHeight, R.Main.scrollHeight]'
        ].forEach(X => Alert.push(`┌ ' + X + '\n' + eval(X)));
        return Alert.join('\n\n');
    })([]));
    //*/
});


Bibi.createDevNote = () => {
    const Dev = Bibi.IsDevMode = O.Body.appendChild(sML.create('div', { id: 'bibi-is-dev-mode' }));
    Bibi.createDevNote.logBorderLine();
    Bibi.createDevNote.appendParagraph(`<strong>This Bibi seems to be a</strong> <strong>Development Version</strong>`);
    Bibi.createDevNote.appendParagraph(`<span>Please don't forget</span> <span>to create a production version</span> <span>before publishing on the Internet.</span>`);
    Bibi.createDevNote.appendParagraph(`<span class="non-visual">(To create a production version, run it on terminal: \`</span><code>npm run build</code><span class="non-visual">\`)</span>`);
    Bibi.createDevNote.appendParagraph(`<em>Close</em>`, 'NoLog').addEventListener('click', () => Dev.className = 'hide');
    Bibi.createDevNote.logBorderLine();
    [E['pointerdown'], E['pointerup'], E['pointermove'], E['pointerover'], E['pointerout'], 'click'].forEach(EN => Dev.addEventListener(EN, Eve => { Eve.preventDefault(); Eve.stopPropagation(); return false; }));
    setTimeout(() => Dev.className = 'show', 0);
    delete Bibi.createDevNote;
};
    Bibi.createDevNote.logBorderLine = (InnerHTML, NoLog) => {
        O.log('========================', '<*/>');
    };
    Bibi.createDevNote.appendParagraph = (InnerHTML, NoLog) => {
        const P = Bibi.IsDevMode.appendChild(sML.create('p', { innerHTML: InnerHTML }));
        if(!NoLog) O.log(InnerHTML.replace(/<[^<>]*>/g, ''), '<*/>');
        return P;
    };


Bibi.createElement = (...Args) => {
    const TagName = Args[0];
    if(!Bibi.Elements) Bibi.Elements = {};
    if(window.customElements) {
        if(!Bibi.Elements[TagName]) Bibi.Elements[TagName] = class extends HTMLElement { constructor() { super(); } }, window.customElements.define(TagName, Bibi.Elements[TagName]);
    } else if(document.registerElement) {
        if(!Bibi.Elements[TagName]) Bibi.Elements[TagName] = document.registerElement(TagName);
        return sML.edit(new Bibi.Elements[Args.shift()](), Args);
    }
    return sML.create(...Args);
};




//==============================================================================================================================================
//----------------------------------------------------------------------------------------------------------------------------------------------

//-- Book

//----------------------------------------------------------------------------------------------------------------------------------------------


// Old B (Book) definition removed. Replaced by Book class.




//==============================================================================================================================================
//----------------------------------------------------------------------------------------------------------------------------------------------

//-- Loader

//----------------------------------------------------------------------------------------------------------------------------------------------


// Old L (Loader) definition removed. Replaced by BookLoader.












L.coordinateLinkages = (BasePath, RootElement, InNav) => {
    const As = RootElement.getElementsByTagName('a'); if(!As) return;
    for(let l = As.length, i = 0; i < l; i++) { const A = As[i];
        if(InNav) {
            A.NavANumber = i + 1;
            A.addEventListener(E['pointerdown'], Eve => Eve.stopPropagation());
            A.addEventListener(E['pointerup'],   Eve => Eve.stopPropagation());
        }
        let HRefPathInSource = A.getAttribute('href'), HRefAttribute = 'href';
        if(!HRefPathInSource) {
            HRefPathInSource = A.getAttribute('xlink:href');
            if(HRefPathInSource) {
                HRefAttribute = 'xlink:href';
            } else {
                if(InNav) {
                    A.addEventListener('click', Eve => { Eve.preventDefault(); Eve.stopPropagation(); return false; });
                    A.classList.add('bibi-bookinfo-inactive-link');
                }
                continue;
            }
        }
        if(/^[a-zA-Z]+:/.test(HRefPathInSource)) {
            if(HRefPathInSource.split('#')[0] == location.href.split('#')[0]) {
                const HRefHashInSource = HRefPathInSource.split('#')[1];
                HRefPathInSource = (HRefHashInSource ? '#' + HRefHashInSource : R.Items[0].AnchorPath)
            } else {
                A.addEventListener('click', Eve => {
                    Eve.preventDefault(); 
                    Eve.stopPropagation();
                    window.open(A.href);
                    return false;
                });
                continue;
            }
        }
        const HRefPath = O.getPath(BasePath.replace(/\/?([^\/]+)$/, ''), (!/^\.*\/+/.test(HRefPathInSource) ? './' : '') + (/^#/.test(HRefPathInSource) ? BasePath.replace(/^.+?([^\/]+)$/, '$1') : '') + HRefPathInSource);
        const HRefFnH = HRefPath.split('#');
        const HRefFile = HRefFnH[0] ? HRefFnH[0] : BasePath;
        const HRefHash = HRefFnH[1] ? HRefFnH[1] : '';
        sML.forEach(R.Items)(Item => {
            if(HRefFile == Item.AnchorPath) {
                A.setAttribute('data-bibi-original-href', HRefPathInSource);
                A.setAttribute(HRefAttribute, B.Path + '/' + HRefPath);
                A.InNav = InNav;
                A.Destination = { ItemIndex: Item.Index }; // not IIPP. ElementSelector may be added.
                     if(Item['rendition:layout'] == 'pre-paginated') A.Destination.PageIndexInItem = 0;
                else if(HRefHash)                                    A.Destination.ElementSelector = '#' + HRefHash;
                L.coordinateLinkages.setJump(A);
                return 'break'; //// break sML.forEach()
            }
        });
        if(HRefHash && /^epubcfi\(.+?\)$/.test(HRefHash)) {
            A.setAttribute('data-bibi-original-href', HRefPathInSource);
            A.setAttribute(HRefAttribute, B.Path + '/#' + HRefHash);
            if(X['EPUBCFI']) {
                A.InNav = InNav;
                A.Destination = X['EPUBCFI'].getDestination(HRefHash);
                L.coordinateLinkages.setJump(A);
            } else {
                A.addEventListener('click', Eve => {
                    Eve.preventDefault(); 
                    Eve.stopPropagation();
                    I.note(O.Language == 'ja' ? '<small>このリンクの利用には EPUBCFI エクステンションが必要です</small>' : '"EPUBCFI" extension is required to use this link.');
                    return false;
                });
            }
        }
        if(InNav && R.StartOn && R.StartOn.Nav == (i + 1) && A.Destination) R.StartOn = A.Destination;
    }
};

    L.coordinateLinkages.setJump = (A) => A.addEventListener('click', Eve => {
        Eve.preventDefault(); 
        Eve.stopPropagation();
        if(A.Destination) new Promise(resolve => A.InNav ? I.Panel.toggle().then(resolve) : resolve()).then(() => {
            if(L.Opened) {
                I.History.add();
                return R.focusOn({ Destination: A.Destination, Duration: 0 }).then(Destination => I.History.add({ UI: B, SumUp: false, Destination: Destination }));
            }
            if(!L.Waiting) return false;
            if(S['start-in-new-window']) return L.openNewWindow(location.href + (location.hash ? '&' : '#') + 'jo(nav=' + A.NavANumber + ')');
            R.StartOn = A.Destination;
            L.play();
        });
        return false;
    });


L.preprocessResources = () => {
    E.dispatch('bibi:is-going-to:preprocess-resources');
    const Promises = [], PreprocessedResources = [], pushItemPreprocessingPromise = (Item, URI) => Promises.push(O.file(Item, { Preprocess: true, URI: URI }).then(() => PreprocessedResources.push(Item)));
    if(B.ExtractionPolicy) for(const FilePath in B.Package.Manifest) {
        const Item = B.Package.Manifest[FilePath];
        if(/\/(css|javascript)$/.test(Item['media-type'])) { // CSSs & JavaScripts in Manifest
            if(!Promises.length) O.log(`Preprocessing Resources...`, '<g:>');
            pushItemPreprocessingPromise(Item, true);
        }
    }
    return Promise.all(Promises).then(() => {/*
        if(B.ExtractionPolicy != 'at-once' && (S.BRL == 'pre-paginated' || (sML.UA.Chromium || sML.UA.WebKit || sML.UA.Gecko))) return resolve(PreprocessedResources);
        R.Items.forEach(Item => pushItemPreprocessingPromise(Item, O.isBin(Item))); // Spine Items
        return Promise.all(Promises).then(() => resolve(PreprocessedResources));*/
        if(PreprocessedResources.length) {
            O.log(`Preprocessed: %O`, PreprocessedResources);
            O.log(`Preprocessed. (${ PreprocessedResources.length } Resource${ PreprocessedResources.length > 1 ? 's' : '' })`, '</g>');
        }
        E.dispatch('bibi:preprocessed-resources');
    });
};


L.loadSpread = (Spread, Opt = {}) => new Promise((resolve, reject) => {
    Spread.AllowPlaceholderItems = (S['allow-placeholders'] && Opt.AllowPlaceholderItems);
    let LoadedItemsInSpread = 0, SkippedItemsInSpread = 0;
    Spread.Items.forEach(Item => {
        L.loadItem(Item, { IsPlaceholder: Opt.AllowPlaceholderItems })
        .then(() =>  LoadedItemsInSpread++) // Loaded
       .catch(() => SkippedItemsInSpread++) // Skipped
        .then(() => {
            if(LoadedItemsInSpread + SkippedItemsInSpread == Spread.Items.length) /*(SkippedItemsInSpread ? reject : resolve)*/resolve(Spread);
        });
    });
});


L.loadItem = (Item, Opt = {}) => {
    const IsPlaceholder = (S['allow-placeholders'] && Item['rendition:layout'] == 'pre-paginated' && Opt.IsPlaceholder);
    if(IsPlaceholder === Item.IsPlaceholder) return Item.Loading ? Item.Loading : Promise.resolve(Item);
    Item.IsPlaceholder = IsPlaceholder;
    const ItemBox = Item.Box;
    ItemBox.classList.remove('loaded');
    ItemBox.classList.toggle('placeholder', Item.IsPlaceholder);
    return Item.Loading = ( // Promise
        Item.IsPlaceholder ? Promise.reject()
        : Item.ContentURL ? Promise.resolve()
        : /\.(html?|xht(ml)?|xml)$/i.test(Item.Source.Path) ? // (X)HTML
            O.file(Item.Source, {
                Preprocess: (B.ExtractionPolicy || sML.UA.Gecko), // Preprocess if archived (or Gecko. For such books as styled only with -webkit/epub- prefixed properties. It's NOT Gecko's fault but requires preprocessing.)
                initialize: () => {
                    if(!S['allow-scripts-in-content']) {
                        Item.Source.Content = Item.Source.Content.replace(/<script(\s+[\w\-]+(\s*=\s*('[^'']*'|"[^""]*"))?)*\s*\/>/ig, '');
                        O.sanitizeItemSource(Item.Source, { As: 'HTML' });
                    }
                }
            }).then(ItemSource =>
                ItemSource.Content
            )
        : /\.(gif|jpe?g|png)$/i.test(Item.Source.Path) ? // Bitmap-in-Spine
            O.file(Item.Source, {
                URI: true
            }).then(ItemSource => [
                (Item['rendition:layout'] == 'pre-paginated' && B.ICBViewport) ? `<meta name="viewport" content="width=${ B.ICBViewport.Width }, height=${ B.ICBViewport.Height }" />` : '',
                `<img class="bibi-spine-item-image" alt="" src="${ Item.Source.URI }" />` // URI is BlobURL or URI
            ])
        : /\.(svg)$/i.test(Item.Source.Path) ? // SVG-in-Spine
            O.file(Item.Source, {
                Preprocess: (B.ExtractionPolicy ? true : false),
                initialize: () => {
                    const StyleSheetRE = /<\?xml-stylesheet\s*(.+?)\s*\?>/g, MatchedStyleSheets = Item.Source.Content.match(StyleSheetRE);
                    if(!S['allow-scripts-in-content']) O.sanitizeItemSource(Item.Source, { As: 'SVG' });
                    Item.Source.Content = (MatchedStyleSheets ? MatchedStyleSheets.map(SS => SS.replace(StyleSheetRE, `<link rel="stylesheet" $1 />`)).join('') : '') + '<bibi:boundary/>' + Item.Source.Content; // Join for preprocessing.
                }
            }).then(ItemSource =>
                ItemSource.Content.split('<bibi:boundary/>')
            )
        : Item.Skipped = true && Promise.resolve([])
    ).then(ItemSourceContent => new Promise(resolve => {
        const DefaultStyleID = 'bibi-default-style';
        if(!Item.ContentURL) {
            let HTML = typeof ItemSourceContent == 'string' ? ItemSourceContent : [`<!DOCTYPE html>`,
                `<html>`,
                    `<head>`,
                        `<meta charset="utf-8" />`,
                        `<title>${ B.FullTitle } - #${ Item.Index + 1 }/${ R.Items.length }</title>`,
                        (ItemSourceContent[0] ? ItemSourceContent[0] + '\n' : '') +
                    `</head>`,
                    `<body>`,
                        (ItemSourceContent[1] ? ItemSourceContent[1] + '\n' : '') +
                    `</body>`,
                `</html>`
            ].join('\n');
            HTML = HTML.replace(/(<head(\s[^>]+)?>)/i, `$1\n<link rel="stylesheet" id="${ DefaultStyleID }" href="${ Bibi.BookStyleURL }" />` + (!B.ExtractionPolicy && !Item.Source.Preprocessed ? `\n<base href="${ O.fullPath(Item.Source.Path) }" />` : ''));
            if(O.Local || sML.UA.LINE || sML.UA.Trident || sML.UA.EdgeHTML) { // Legacy Microsoft Browsers do not accept DataURLs for src of <iframe>. Also LINE in-app-browser is probably the same as it.
                HTML = HTML.replace(/^<\?.+?\?>/, '').replace('</head>', `<script id="bibi-onload">window.addEventListener('load', function() { parent.R.Items[${ Item.Index }].onLoaded(); return false; });</script>\n</head>`);
                Item.onLoaded = () => {
                    resolve();
                    Item.contentDocument.head.removeChild(Item.contentDocument.getElementById('bibi-onload'));
                    delete Item.onLoaded;
                };
                Item.src = '';
                ItemBox.insertBefore(Item, ItemBox.firstChild);
                Item.contentDocument.open(); Item.contentDocument.write(HTML); Item.contentDocument.close();
                return;
            }
            Item.ContentURL = O.createBlobURL('Text', HTML, S['allow-scripts-in-content'] && /\.(xht(ml)?|xml)$/i.test(Item.Source.Path) ? 'application/xhtml+xml' : 'text/html'), Item.Source.Content = '';
        }
        Item.onload = resolve;
        Item.src = Item.ContentURL;
        ItemBox.insertBefore(Item, ItemBox.firstChild);
    })).then(() => {
        return L.postprocessItem(Item);
    }).then(() => {
        ItemBox.classList.add('loaded');
        E.dispatch('bibi:loaded-item', Item);
        // Item.stamp('Loaded');
        Item.Loaded = true;
        Item.Turned = 'Up';
    }).catch(() => { // Placeholder
        if(Item.parentElement) Item.parentElement.removeChild(Item);
        Item.onload = Item.onLoaded = undefined;
        Item.src = '';
        Item.HTML = Item.Head = Item.Body = Item.Pages[0];
        Item.Loaded = false;
        Item.Turned = 'Down';
    }).then(() => {
        delete Item.Loading;
        return Promise.resolve(Item);
    });
};


L.postprocessItem = (Item) => {
    // Item.stamp('Postprocess');
    Item.HTML = Item.contentDocument.getElementsByTagName('html')[0]; Item.HTML.classList.add(...sML.Environments);
    Item.Head = Item.contentDocument.getElementsByTagName('head')[0];
    Item.Body = Item.contentDocument.getElementsByTagName('body')[0];
    Item.HTML.Item = Item.Head.Item = Item.Body.Item = Item;
    const XMLLang = Item.HTML.getAttribute('xml:lang'), Lang = Item.HTML.getAttribute('lang');
         if(!XMLLang && !Lang) Item.HTML.setAttribute('xml:lang', B.Language), Item.HTML.setAttribute('lang', B.Language);
    else if(!XMLLang         ) Item.HTML.setAttribute('xml:lang', Lang);
    else if(            !Lang)                                                 Item.HTML.setAttribute('lang', XMLLang);
    sML.forEach(Item.Body.getElementsByTagName('link'))(Link => Item.Head.appendChild(Link));
    sML.appendCSSRule(Item.contentDocument, 'html', '-webkit-text-size-adjust: 100%;');
    if(sML.UA.Trident) sML.forEach(Item.Body.getElementsByTagName('svg'))(SVG => {
        const ChildImages = SVG.getElementsByTagName('image');
        if(ChildImages.length == 1) {
            const ChildImage = ChildImages[0];
            if(ChildImage.getAttribute('width') && ChildImage.getAttribute('height')) {
                SVG.setAttribute('width',  ChildImage.getAttribute('width'));
                SVG.setAttribute('height', ChildImage.getAttribute('height'));
            }
        }
    });
    L.coordinateLinkages(Item.Source.Path, Item.Body);
    const Lv1Eles = Item.contentDocument.querySelectorAll('body>*:not(script):not(style)');
    if(Lv1Eles && Lv1Eles.length == 1) {
        const Lv1Ele = Item.contentDocument.querySelector('body>*:not(script):not(style)');
             if(    /^svg$/i.test(Lv1Ele.tagName)) Item.Outsourcing = Item.OnlySingleSVG = true;
        else if(    /^img$/i.test(Lv1Ele.tagName)) Item.Outsourcing = Item.OnlySingleIMG = true;
        else if( /^iframe$/i.test(Lv1Ele.tagName)) Item.Outsourcing =                      true;
        else if(!O.getElementInnerText(Item.Body)) Item.Outsourcing =                      true;
    }
    
    // Check aspect ratio for pre-paginated single image items and adjust page-spread
    if(Item['_check-aspect-ratio'] && (Item.OnlySingleIMG || Item.OnlySingleSVG)) {
        if(!Item.Viewport) Item.Viewport = R.getItemViewport(Item);
        if(Item.Viewport) {
            const aspectRatio = Item.Viewport.Width / Item.Viewport.Height;
            const w = Item.Viewport.Width;
            const h = Item.Viewport.Height;
            
            // Remove forced page-spread for non-landscape images
            // Portrait: ratio < 1.0
            // Near-square: 1.0 <= ratio < 1.5
            // Landscape: ratio >= 1.5
            if(aspectRatio < 1.5 && (Item['rendition:page-spread'] == 'left' || Item['rendition:page-spread'] == 'right')) {
                const oldPageSpread = Item['rendition:page-spread'];
                delete Item['rendition:page-spread'];
                Item['_needs-spread-reconstruction'] = true;
                if(Bibi.Dev) O.log(`Non-landscape image detected (${w}x${h}, ratio=${aspectRatio.toFixed(2)}): Item ${Item.Index}, removing page-spread-${oldPageSpread}`);
            } else if(aspectRatio >= 1.5) {
                if(Bibi.Dev) O.log(`Landscape image detected (${w}x${h}, ratio=${aspectRatio.toFixed(2)}): Item ${Item.Index}, keeping spread layout`);
            }
        }
        delete Item['_check-aspect-ratio'];
    }
    
    return (Item['rendition:layout'] == 'pre-paginated' ? Promise.resolve() : L.patchItemStyles(Item)).then(() => {
        E.dispatch('bibi:postprocessed-item', Item);
        // Item.stamp('Postprocessed');
        return Item;
    });
};


L.patchItemStyles = (Item) => new Promise(resolve => { // only for reflowable.
    Item.StyleSheets = [];
    sML.forEach(Item.HTML.querySelectorAll('link, style'))(SSEle => {
        if(/^link$/i.test(SSEle.tagName)) {
            if(!SSEle.href) return;
            if(!/^(alternate )?stylesheet$/.test(SSEle.rel)) return;
            if((sML.UA.Safari || sML.OS.iOS) && SSEle.rel == 'alternate stylesheet') return; //// Safari does not count "alternate stylesheet" in document.styleSheets.
        }
        Item.StyleSheets.push(SSEle);
    });
    const checkCSSLoadingAndResolve = () => {
        if(Item.contentDocument.styleSheets.length < Item.StyleSheets.length) return false;
        clearInterval(Item.CSSLoadingTimerID);
        delete Item.CSSLoadingTimerID;
        resolve();
        return true;
    };
    if(!checkCSSLoadingAndResolve()) Item.CSSLoadingTimerID = setInterval(checkCSSLoadingAndResolve, 33);
}).then(() => {
    if(!Item.Source.Preprocessed) {
        if(B.Package.Metadata['ebpaj:guide-version']) {
            const Versions = B.Package.Metadata['ebpaj:guide-version'].split('.');
            if(Versions[0] * 1 == 1 && Versions[1] * 1 == 1 && Versions[2] * 1 <=3) Item.Body.style.textUnderlinePosition = 'under left';
        }
        if(sML.UA.Trident) {
            //if(B.ExtractionPolicy == 'at-once') return false;
            const IsCJK = /^(zho?|chi|kor?|ja|jpn)$/.test(B.Language);
            O.editCSSRules(Item.contentDocument, CSSRule => {
                if(/(-(epub|webkit)-)?column-count: 1; /                                    .test(CSSRule.cssText)) CSSRule.style.columnCount = CSSRule.style.msColumnCount = 'auto';
                if(/(-(epub|webkit)-)?writing-mode: vertical-rl; /                          .test(CSSRule.cssText)) CSSRule.style.writingMode = 'tb-rl';
                if(/(-(epub|webkit)-)?writing-mode: vertical-lr; /                          .test(CSSRule.cssText)) CSSRule.style.writingMode = 'tb-lr';
                if(/(-(epub|webkit)-)?writing-mode: horizontal-tb; /                        .test(CSSRule.cssText)) CSSRule.style.writingMode = 'lr-tb';
                if(/(-(epub|webkit)-)?(text-combine-upright|text-combine-horizontal): all; /.test(CSSRule.cssText)) CSSRule.style.msTextCombineHorizontal = 'all';
                if(IsCJK && / text-align: justify; /                                        .test(CSSRule.cssText)) CSSRule.style.textJustify = 'inter-ideograph';
            });
        } else {
            O.editCSSRules(Item.contentDocument, CSSRule => {
                if(/(-(epub|webkit)-)?column-count: 1; /.test(CSSRule.cssText)) CSSRule.style.columnCount = CSSRule.style.webkitColumnCount = 'auto';
            });
        }
    }
    const ItemHTMLComputedStyle = getComputedStyle(Item.HTML);
    const ItemBodyComputedStyle = getComputedStyle(Item.Body);
    if(ItemHTMLComputedStyle[O.WritingModeProperty] != ItemBodyComputedStyle[O.WritingModeProperty]) Item.HTML.style.writingMode = ItemBodyComputedStyle[O.WritingModeProperty];
    Item.WritingMode = O.getWritingMode(Item.HTML);
         if(/-rl$/.test(Item.WritingMode)) Item.HTML.classList.add('bibi-vertical-text');
    else if(/-lr$/.test(Item.WritingMode)) Item.HTML.classList.add('bibi-horizontal-text');
    /*
         if(/-rl$/.test(Item.WritingMode)) if(ItemBodyComputedStyle.marginLeft != ItemBodyComputedStyle.marginRight) Item.Body.style.marginLeft = ItemBodyComputedStyle.marginRight;
    else if(/-lr$/.test(Item.WritingMode)) if(ItemBodyComputedStyle.marginRight != ItemBodyComputedStyle.marginLeft) Item.Body.style.marginRight = ItemBodyComputedStyle.marginLeft;
    else                                   if(ItemBodyComputedStyle.marginBottom != ItemBodyComputedStyle.marginTop) Item.Body.style.marginBottom = ItemBodyComputedStyle.marginTop;
    //*/
    [
        [Item.Box, ItemHTMLComputedStyle, Item.HTML],
        [Item,     ItemBodyComputedStyle, Item.Body]
    ].forEach(Par => {
        [
            'backgroundColor',
            'backgroundImage',
            'backgroundRepeat',
            'backgroundPosition',
            'backgroundSize'
        ].forEach(Pro => Par[0].style[Pro] = Par[1][Pro]);
        Par[2].style.background = 'transparent';
    });
    sML.forEach(Item.Body.querySelectorAll('svg, img'))(Img => {
        Img.BibiDefaultStyle = {
               width:  (Img.style.width     ? Img.style.width     : ''),
               height: (Img.style.height    ? Img.style.height    : ''),
            maxWidth:  (Img.style.maxWidth  ? Img.style.maxWidth  : ''),
            maxHeight: (Img.style.maxHeight ? Img.style.maxHeight : '')
        };
    });
});




//==============================================================================================================================================
//----------------------------------------------------------------------------------------------------------------------------------------------

//-- Reader

//----------------------------------------------------------------------------------------------------------------------------------------------


// Old R (Reader) definition removed. Replaced by Reader class.


// Old I (UserInterface) definition removed. Replaced by UserInterface class.


export const C = new Compass(S);



//==============================================================================================================================================
//----------------------------------------------------------------------------------------------------------------------------------------------

//-- Operation Utilities

//----------------------------------------------------------------------------------------------------------------------------------------------




Bibi.x = X.add;
