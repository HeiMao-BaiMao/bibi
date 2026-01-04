export default class SettingsManager {
    constructor() {
        this.Types = {
            'boolean': [
                'allow-placeholders',
                'prioritise-fallbacks'
            ],
            'yes-no': [
                'autostart',
                'autostart-embedded',
                'fix-nav-ttb',
                'fix-reader-view-mode',
                'flip-pages-during-sliding',
                'full-breadth-layout-in-scroll',
                'start-embedded-in-new-window',
                'use-arrows',
                'use-bookmarks',
                'use-font-size-changer',
                'use-full-height',
                'use-history',
                'use-keys',
                'use-loupe',
                'use-menubar',
                'use-nombre',
                'use-slider',
                'zoom-out-for-utilities'
            ],
            'string': [
                'book',
                'default-page-progression-direction',
                'on-doubletap',
                'on-tripletap',
                'pagination-method',
                'reader-view-mode'
            ],
            'integer': [
                'item-padding-bottom',
                'item-padding-left',
                'item-padding-right',
                'item-padding-top',
                'spread-gap',
                'spread-margin'
            ],
            'number': [
                'base-font-size',
                'flipper-width',
                'font-size-scale-per-step',
                'loupe-max-scale',
                'loupe-scale-per-step',
                'orientation-border-ratio'
            ],
            'array': [
                'content-draggable',
                'orthogonal-edges',
                'orthogonal-arrow-keys',
                'orthogonal-touch-moves',
                'orthogonal-wheelings'
            ]
        };

        this.Types_PresetOnly = {
            'boolean': [
                'accept-base64-encoded-data',
                'accept-blob-converted-data',
                'allow-scripts-in-content',
                'remove-bibi-website-link'
            ],
            'yes-no': [
                'accept-local-file',
                'keep-settings',
                'resume-from-last-position'
            ],
            'string': [
                'bookshelf',
                'website-name-in-title',
                'website-name-in-menu',
                'website-href'
            ],
            'integer': [
                'max-bookmarks',
                'max-history'
            ],
            'number': [
            ],
            'array': [
                'extensions',
                'extract-if-necessary',
                'trustworthy-origins'
            ]
        };

        this.Types_UserOnly = {
            'boolean': [
                'debug',
                'wait',
                'zine'
            ],
            'yes-no': [
            ],
            'string': [
                'edge',
                'epubcfi',
                'p',
            ],
            'integer': [
                'log',
                'nav',
                'parent-bibi-index'
            ],
            'number': [
                'iipp',
                'sipp'
            ],
            'array': [
            ]
        };

        this.Verifiers = {
            'boolean': (_P, _V, Fill) => {
                if(typeof _V == 'boolean') return _V;
                if(_V === 'true'  || _V === '1' || _V === 1) return true;
                if(_V === 'false' || _V === '0' || _V === 0) return false;
                if(Fill) return false;
            },
            'yes-no': (_P, _V, Fill) => {
                if(/^(yes|no|mobile|desktop)$/.test(_V)) return _V;
                if(_V === 'true'  || _V === '1' || _V === 1) return 'yes';
                if(_V === 'false' || _V === '0' || _V === 0) return 'no';
                if(Fill) return 'no';
            },
            'string': (_P, _V, Fill) => {
                if(typeof _V == 'string') {
                    switch(_P) {
                        case 'edge'                               : return /^(head|foot)$/.test(_V)                              ? _V : undefined;
                        case 'book'                               : return (_V = decodeURIComponent(_V).trim())                  ? _V : undefined;
                        case 'default-page-progression-direction' : return _V == 'rtl'                                           ? _V : 'ltr';
                        case 'on-doubletap': case 'on-tripletap'  : return /^(panel|zoom)$/.test(_V)                             ? _V : undefined;
                        case 'p'                                  : return /^([a-z]+|[1-9]\d*((\.[1-9]\d*)*|-[a-z]+))$/.test(_V) ? _V : undefined;
                        case 'pagination-method'                  : return _V == 'x'                                             ? _V : 'auto';
                        case 'reader-view-mode'                   : return /^(paged|horizontal|vertical)$/.test(_V)              ? _V : 'paged';
                    }
                    return _V;
                }
                if(Fill) return '';
            },
            'integer': (_P, _V, Fill) => {
                if(typeof (_V *= 1) == 'number' && isFinite(_V)) {
                    _V = Math.max(Math.round(_V), 0);
                    switch(_P) {
                        case 'log'           : return Math.min(_V,  9);
                        case 'max-bookmarks' : return Math.min(_V,  9);
                        case 'max-history'   : return Math.min(_V, 19);
                    }
                    return _V;
                }
                if(Fill) return 0;
            },
            'number': (_P, _V, Fill) => {
                if(typeof (_V *= 1) == 'number' && isFinite(_V) && _V >= 0) return _V;
                if(Fill) return 0;
            },
            'array': (_P, _V, Fill) => {
                if(Array.isArray(_V)) {
                    switch(_P) {
                        case 'content-draggable'      : _V.length = 2; for(let i = 0; i < 2; i++) _V[i] = _V[i] === false || _V[i] === 'false' || _V[i] === '0' || _V[i] === 0 ? false : true; return _V;
                        case 'extensions'             : return _V.filter(_I => typeof _I['src'] == 'string' && (_I['src'] = _I['src'].trim()));
                        case 'extract-if-necessary'   : return (_V = _V.map(_I => typeof _I == 'string' ? _I.trim().toLowerCase() : '')).includes('*') ? ['*'] : _V.filter(_I => /^(\.[\w\d]+)*$/.test(_I));
                        case 'orthogonal-arrow-keys'  :
                        case 'orthogonal-edges'       :
                        case 'orthogonal-touch-moves' :
                        case 'orthogonal-wheelings'   : _V.length = 2; for(let i = 0; i < 2; i++) _V[i] = typeof _V[i] == 'string' ? _V[i] : ''; return _V;
                        case 'trustworthy-origins'    : return _V.reduce((_VN, _I) => typeof _I == 'string' && /^https?:\/\/[^\/]+$/.test(_I = _I.trim().replace(/\/$/, '')) && !_VN.includes(_I) ? _VN.push(_I) && _VN : false, []);
                    }
                    return _V.filter(_I => typeof _I != 'function');
                }
                if(Fill) return [];
            }
        };
    }

    verifyValue(SettingType, _P, _V, Fill) {
        return this.Verifiers[SettingType](_P, _V, Fill);
    }

    applyFilteredSettingsTo(To, From, ListOfSettingTypes, Fill) {
        ListOfSettingTypes.forEach(STs => {
            for(const ST in STs) {
                STs[ST].forEach(_P => {
                    const VSV = this.verifyValue(ST, _P, From[_P]);
                    if(Fill) {
                        To[_P] = this.verifyValue(ST, _P, To[_P]);
                        if(typeof VSV != 'undefined' || typeof To[_P] == 'undefined') To[_P] = this.verifyValue(ST, _P, From[_P], true);
                    } else if(From.hasOwnProperty(_P)) {
                        if(typeof VSV != 'undefined') To[_P] = VSV;
                    }
                });
            }
        });
        return To;
    }

    initialize(Bibi, O, E, U, D, P) {
        // Clean up self
        for(const Pro in this) {
            if (Pro === 'Types' || Pro === 'Types_PresetOnly' || Pro === 'Types_UserOnly' || Pro === 'Verifiers') continue;
            if(typeof this[Pro] != 'function') delete this[Pro];
        }

        sML.applyRtL(this, P, 'ExceptFunctions');
        sML.applyRtL(this, U, 'ExceptFunctions');
        sML.applyRtL(this, D, 'ExceptFunctions');
        
        this.Types['yes-no'].concat(this.Types_PresetOnly['yes-no']).concat(this.Types_UserOnly['yes-no']).forEach(Pro => this[Pro] = (this[Pro] == 'yes' || (this[Pro] == 'mobile' && O.TouchOS) || (this[Pro] == 'desktop' && !O.TouchOS)));
        
        // --------
        if(!this['trustworthy-origins'].includes(O.Origin)) this['trustworthy-origins'].unshift(O.Origin);
        // --------
        this['book'] = (!this['book-data'] && typeof this['book'] == 'string' && this['book']) ? new URL(this['book'], this['bookshelf'] + '/').href : '';
        if(!this['book-data'] && this['book'] && !this['trustworthy-origins'].includes(new URL(this['book']).origin)) throw `The Origin of the Path of the Book Is Not Allowed.`;
        // --------
        if(typeof this['parent-bibi-index'] != 'number') delete this['parent-bibi-index'];
        // --------
        if(this['book'] || !window.File) this['accept-local-file'] = false, this['accept-blob-converted-data'] = false, this['accept-base64-encoded-data'] = false;
        else                             this['accept-local-file'] = this['accept-local-file'] && (this['extract-if-necessary'].includes('*') || this['extract-if-necessary'].includes('.epub') || this['extract-if-necessary'].includes('.zip')) ? true : false;
        // --------
        this['autostart'] = this['wait'] ? false : !this['book'] ? true : window.parent != window ? this['autostart-embedded'] : this['autostart'];
        this['start-in-new-window'] = (window.parent != window && !this['autostart']) ? this['start-embedded-in-new-window'] : false;
        // --------
        this['default-page-progression-direction'] = this['default-page-progression-direction'] == 'rtl' ? 'rtl' : 'ltr';
        ['history', 'bookmarks'].forEach(_ => {
            if( this['max-' + _] == 0) this['use-' + _] = false;
            if(!this['use-' + _]     ) this['max-' + _] = 0;
        });
        if(!this['use-menubar']) this['use-full-height'] = true;
        // --------
        if(sML.UA.Trident || sML.UA.EdgeHTML) this['pagination-method'] = 'auto';
        // --------
        if(!this['reader-view-mode']) this['reader-view-mode'] = 'paged';
        
        if(O.Biscuits) E.bind('bibi:initialized-book', () => {
            const BookBiscuits = O.Biscuits.remember('Book');
            if(this['keep-settings']) {
                if(!U['reader-view-mode']              && BookBiscuits.RVM) this['reader-view-mode']              = BookBiscuits.RVM;
                if(!U['full-breadth-layout-in-scroll'] && BookBiscuits.FBL) this['full-breadth-layout-in-scroll'] = BookBiscuits.FBL;
            }
            if(this['resume-from-last-position']) {
                // R is global or we need to pass it? 
                // R is not initialized yet when Settings.initialize is called?
                // R is used in callback.
                // Assuming R is available globally as part of Bibi heart or passed later.
                // NOTE: 'R' is not passed to initialize. It is accessed globally in original code.
                // We should probably rely on global access for now or passed 'R' in closure if possible.
                // Since 'R' is defined in bibi.heart.js module scope, we can't access it easily here unless passed.
                // BUT, this is a callback. 'R' will be available when 'bibi:initialized-book' is fired.
                // So we need a way to access R.
                // Let's defer this specific line or assume R is globally available (window.R? No, it's module scoped).
                
                // Hack: Pass R via a getter or let the main module handle this event binding?
                // Or attach R to Bibi object?
                
                // For now, let's assume we can access R via Bibi.R if we attach it, or use a callback mechanism.
                // The original code accessed R directly.
                
                // In this refactoring, we can emit an event or ask the main app to bind this.
                // Or simply: 
                // if(!Bibi.R.StartOn && BookBiscuits.Position ...
                
                // We will modify the code to expect 'Bibi.R' or similar.
                // Or we can leave a TODO.
                
                // Let's use 'Bibi.R' assuming we attach R to Bibi.
                 if(Bibi.R && !Bibi.R.StartOn && BookBiscuits.Position && BookBiscuits.Position.IIPP) Bibi.R.StartOn = sML.clone(BookBiscuits.Position);
            }
        });
        
        // --------
        this.Modes = { // 'Mode': { SH: 'ShortHand', CNP: 'ClassNamePrefix' }
              'book-rendition-layout'    : { SH: 'BRL', CNP: 'book' },
                 'reader-view-mode'      : { SH: 'RVM', CNP: 'view' },
            'page-progression-direction' : { SH: 'PPD', CNP: 'page' },
               'spread-layout-axis'      : { SH: 'SLA', CNP: 'spread' },
               'spread-layout-direction' : { SH: 'SLD', CNP: 'spread' },
            'apparent-reading-axis'      : { SH: 'ARA', CNP: 'appearance' },
            'apparent-reading-direction' : { SH: 'ARD', CNP: 'appearance' },
            'navigation-layout-direction': { SH: 'NLD', CNP: 'nav' }
        };
        for(const Mode in this.Modes) {
            const _ = this.Modes[Mode];
            Object.defineProperty(this, _.SH, { get: () => this[Mode], set: (Val) => this[Mode] = Val });
            delete _.SH;
        }
        // --------
        E.dispatch('bibi:initialized-settings');
    }

    update(Settings, Bibi, O, E, R, C, B) {
        const Prev = {}; for(const Mode in this.Modes) Prev[Mode] = this[Mode];
        if(typeof Settings == 'object') for(const Property in Settings) if(typeof this[Property] != 'function') this[Property] = Settings[Property];
        
        this['book-rendition-layout'] = B.Package.Metadata['rendition:layout'];
        this['allow-placeholders'] = (this['allow-placeholders'] && B.AllowPlaceholderItems);
        
        if(this.FontFamilyStyleIndex) sML.deleteCSSRule(this.FontFamilyStyleIndex);
        if(this['ui-font-family']) this.FontFamilyStyleIndex = sML.appendCSSRule('html', 'font-family: ' + this['ui-font-family'] + ' !important;');
        
        this['page-progression-direction'] = B.PPD;
        
        if(this['pagination-method'] == 'x') {
            this['spread-layout-axis'] = this['reader-view-mode'] == 'vertical' ? 'vertical' : 'horizontal';
        } else {
            this['spread-layout-axis'] = (() => {
                if(this['reader-view-mode'] != 'paged') return this['reader-view-mode'];
                if(this['book-rendition-layout'] == 'reflowable') switch(B.WritingMode) {
                    case 'tb-rl': case 'tb-lr': return   'vertical'; ////
                }                               return 'horizontal';
            })();
        }
        
         this['apparent-reading-axis']      = (this['reader-view-mode']   == 'paged'   ) ? 'horizontal' : this['reader-view-mode'];
         this['apparent-reading-direction'] = (this['reader-view-mode']   == 'vertical') ? 'ttb'        : this['page-progression-direction'];
            this['spread-layout-direction'] = (this['spread-layout-axis'] == 'vertical') ? 'ttb'        : this['page-progression-direction'];
        this['navigation-layout-direction'] = (this['fix-nav-ttb'] || this['page-progression-direction'] != 'rtl') ? 'ttb' : 'rtl';
        
        for(const Mode in this.Modes) {
            const Pfx = this.Modes[Mode].CNP + '-', PC = Pfx + Prev[Mode], CC = Pfx + this[Mode];
            if(PC != CC) O.HTML.classList.remove(PC);
            O.HTML.classList.add(CC);
        }
        
        C.update();
        E.dispatch('bibi:updated-settings', this);
    }
}
