import sML from 'sml.js';

export default class BookLoader {
    constructor() {
        this.Opened = false;
        this.Waiting = false;
        this.Played = false;
        
        this.RangeLoader = null;
        
        this.ContentTypes = {
            'pdf'     : 'application/pdf',
            'xht(ml)?': 'application/xhtml+xml',
            'xml'     : 'application/xml',
            'aac'     :       'audio/aac',
            'mp3'     :       'audio/mpeg',
            'otf'     :        'font/opentype',
            'ttf'     :        'font/truetype',
            'woff'    :        'font/woff',
            'woff2'   :        'font/woff2',
            'gif'     :       'image/gif',
            'jpe?g'   :       'image/jpeg',
            'png'     :       'image/png',
            'svg'     :       'image/svg+xml',
            'webp'    :       'image/webp',
            'css'     :        'text/css',
            'js'      :        'text/javascript',
            'html?'   :        'text/html',
            'mp4'     :       'video/mp4',
            'webm'    :       'video/webm',
            'ya?ml'   : 'application/x-yaml'
        };

        this.PreprocessSettings = {
            'css': {
                ReplaceRules: [
                    [/\/\*[.\s\S]*?\*\/|[^\{\}]+\{\s*\}/gm, ''],
                    [/\n+/g, '\n']
                ],
                ResolveRules: [{
                    getRE: () => /@import\s+["'](?!(?:https?:|data):)(.+?)['"]/g,
                    PathRef: '$1',
                    Patterns: [
                        { Extensions: 'css' }
                    ]
                }, { 
                    getRE: () => /@import\s+url\(["']?(?!(?:https?:|data):)(.+?)['"]?\)/g,
                    PathRef: '$1',
                    Patterns: [
                        { Extensions: 'css' }
                    ]
                }, { 
                    getRE: () => /url\(["']?(?!(?:https?:|data):)(.+?)['"]?\)/g,
                    PathRef: '$1',
                    Patterns: [
                        { Extensions: 'gif|png|jpe?g|svg|ttf|otf|woff' }
                    ]
                }],
                init: function(B) { const RRs = this.ReplaceRules;
                    RRs.push([/(-(epub|webkit)-)?column-count\s*:\s*1\s*([;\}])/gm, 'column-count: auto$3']);
                    RRs.push([/(-(epub|webkit)-)?text-underline-position\s*:/gm, 'text-underline-position:']);
                    if(sML.UA.Chromium || sML.UA.WebKit) {
                        return this;
                    }
                    RRs.push([/-(epub|webkit)-/gm, '']);
                    if(sML.UA.Gecko) {
                        RRs.push([/text-combine-horizontal\s*:\s*([^;\}]+)\s*([;\}])/gm, 'text-combine-upright: $1$2']);
                        RRs.push([/text-combine\s*:\s*horizontal\s*([;\}])/gm, 'text-combine-upright: all$1']);
                        return this;
                    }
                    if(sML.UA.EdgeHTML) {
                        RRs.push([/text-combine-(upright|horizontal)\s*:\s*([^;\}\s]+)\s*([;\}])/gm, 'text-combine-horizontal: $2; text-combine-upright: $2$3']);
                        RRs.push([/text-combine\s*:\s*horizontal\s*([;\}])/gm, 'text-combine-horizontal: all; text-combine-upright: all$1']);
                    }
                    if(sML.UA.Trident) {
                        RRs.push([/writing-mode\s*:\s*vertical-rl\s*([;\}])/gm,   'writing-mode: tb-rl$1']);
                        RRs.push([/writing-mode\s*:\s*vertical-lr\s*([;\}])/gm,   'writing-mode: tb-lr$1']);
                        RRs.push([/writing-mode\s*:\s*horizontal-tb\s*([;\}])/gm, 'writing-mode: lr-tb$1']);
                        RRs.push([/text-combine-(upright|horizontal)\s*:\s*([^;\}\s]+)\s*([;\}])/gm, '-ms-text-combine-horizontal: $2$3']);
                        RRs.push([/text-combine\s*:\s*horizontal\s*([;\}])/gm, '-ms-text-combine-horizontal: all$1']);
                    }
                    if(B && /^(zho?|chi|kor?|ja|jpn)$/.test(B.Language)) {
                        RRs.push([/text-align\s*:\s*justify\s*([;\}])/gm, 'text-align: justify; text-justify: inter-ideograph$1']);
                    }
                    return this;
                }
            },
            'svg': {
                ReplaceRules: [
                    [/<!--\s+[.\s\S]*?\s+-->/gm, '']
                ],
                ResolveRules: [{
                    getRE: (Att) => new RegExp('<\\??[a-zA-Z:\\-]+[^>]*? (' + Att + ')\\s*=\\s*["\'](?!(?:https?:|data):)(.+?)["\']', 'g'),
                    PathRef: '$2',
                    Patterns: [
                        { Attribute: 'href',           Extensions: 'css' },
                        { Attribute: 'src',            Extensions: 'svg' },
                        { Attribute: 'src|xlink:href', Extensions: 'gif|png|jpe?g' }
                    ]
                }]
            },
            'html?|xht(ml)?|xml': {
                ReplaceRules: [
                    [/<!--\s+[.\s\S]*?\s+-->/gm, '']
                ],
                ResolveRules: [{
                    getRE: (Att) => new RegExp('<\\??[a-zA-Z:\\-]+[^>]*? (' + Att + ')\\s*=\\s*["\'](?!(?:https?:|data):)(.+?)["\']', 'g'),
                    PathRef: '$2',
                    Patterns: [
                        { Attribute: 'href',           Extensions: 'css' },
                        { Attribute: 'src',            Extensions: 'js|svg' },
                        { Attribute: 'src|xlink:href', Extensions: 'gif|png|jpe?g|mp([34]|e?g)|m4[av]' },
                        { Attribute: 'poster',         Extensions: 'gif|png|jpe?g' }
                    ]
                }]
            }
        };
    }

    initialize(Bibi, O, S, E, I, B, R, D, X) {
        this.Bibi = Bibi;
        this.O = O;
        this.S = S;
        this.E = E;
        this.I = I;
        this.B = B;
        this.R = R;
        this.D = D;
        this.X = X;
    }

    wait() {
        this.Waiting = true;
        this.O.Busy = false;
        this.O.HTML.classList.remove('busy');
        this.O.HTML.classList.add('waiting');
        this.E.dispatch('bibi:waits');
        this.O.log(`(Waiting...)`, '<i/>');
        this.I.note('');
        return new Promise(resolve => this.wait.resolve = resolve).then(() => {
            this.Waiting = false;
            this.O.Busy = true;
            this.O.HTML.classList.add('busy');
            this.O.HTML.classList.remove('waiting');
            this.I.note(`Loading...`);
            return new Promise(resolve => setTimeout(resolve, 99));
        });
    }

    openNewWindow(HRef) {
        const WO = window.open(HRef);
        return WO ? WO : location.href = HRef;
    }

    play() {
        if(this.S['start-in-new-window']) return this.openNewWindow(location.href);
        this.Played = true;
        this.R.resetStage();
        this.wait.resolve();
        this.E.dispatch('bibi:played');
    }

    initializeBook(BookInfo = {}) {
        return new Promise((resolve, reject) => {
            const reject_failedToOpenTheBook = (Msg) => reject(`Failed to open the book (${ Msg })`);
            if(!BookInfo.Book && !BookInfo.BookData) return reject_failedToOpenTheBook(this.Bibi.ErrorMessages.DataInvalid);
            const BookDataFormat = 
                typeof BookInfo.Book     == 'string' ? 'URI' :
                typeof BookInfo.BookData == 'string' ? 'Base64' :
                typeof BookInfo.BookData == 'object' && BookInfo.BookData.size && BookInfo.BookData.type ? (BookInfo.BookData.name ? 'File' : 'Blob') : '';
            if(!BookDataFormat) return reject_failedToOpenTheBook(this.Bibi.ErrorMessages.DataInvalid);
            this.B.Type = !this.S['book'] ? '' : this.S['zine'] ? 'Zine' : 'EPUB';
            if(this.B.Type != 'EPUB') this.B.ZineData = { Source: { Path: 'zine.yaml' } };
            if(BookDataFormat == 'URI') {
                // Online
                if(this.O.Local) return reject(`Bibi can't open books via ${ this.D['book'] ? 'data-bibi-book' : 'URL' } on local mode`);
                this.B.Path = BookInfo.Book;
                const RootSource = (this.B.Type == 'Zine' ? this.B.ZineData : this.B.Container).Source;
                const InitErrors = [], initialize_as = (FileOrFolder) => ({ 
                    Promised: (
                        FileOrFolder == 'folder' ? this.download(RootSource).then(() => (this.B.PathDelimiter = '/') && '') :
                        this.RangeLoader         ? this.extract(RootSource).then(() => 'on-the-fly') :
                                         this.O.loadZippedBookData(  this.B.Path  ).then(() => 'at-once')
                    ).then(ExtractionPolicy => {
                        this.B.ExtractionPolicy = ExtractionPolicy;
                        //this.O.log(`Succeed to Open as ${ this.B.Type } ${ FileOrFolder }.`);
                        resolve(`${ this.B.Type } ${ FileOrFolder }`);
                    }).catch(Err => {
                        InitErrors.push(Err = (/404/.test(String(Err)) ? this.Bibi.ErrorMessages.NotFound : String(Err).replace(/^Error: /, '')));
                        this.O.log(`Failed as ${ /^[aiueo]/i.test(this.B.Type) ? 'an' : 'a' } ${ this.B.Type } ${ FileOrFolder }: ` + Err);
                        return Promise.reject();
                    }),
                    or:        function(fun) { return this.Promised.catch(fun); },
                    or_reject: function(fun) { return this.or(() => reject_failedToOpenTheBook(InitErrors.length < 2 || InitErrors[0] == InitErrors[1] ? InitErrors[0] : `as a file: ${ InitErrors[0] } / as a folder: ${ InitErrors[1] }`)); }
                });
                this.isToBeExtractedIfNecessary(this.B.Path) ? initialize_as('file').or(() => initialize_as('folder').or_reject()) : initialize_as('folder').or_reject();
            } else {
                let BookData = BookInfo.BookData;
                let FileOrData;
                const MIMETypeREs = { EPUB: /^application\/epub\+zip$/, Zine: /^application\/(zip|x-zip(-compressed)?)$/ };
                const MIMETypeErrorMessage = 'File of this type is unacceptable';
                if(BookDataFormat == 'File') {
                    // Local-Archived EPUB/Zine File
                    if(!this.S['accept-local-file'])                      return reject(`Local file is set to unacceptable`);
                    if(!BookData.name)                               return reject(`File without a name is unacceptable`);
                    if(!/\.[ -]+$/.test(BookData.name))            return reject(`Local file without extension is set to unacceptable`);
                    if(!this.isToBeExtractedIfNecessary(BookData.name)) return reject(`File with this extension is set to unacceptable`);
                    if(BookData.type) {
                        if(/\.epub$/i.test(BookData.name) ? !MIMETypeREs['EPUB'].test(BookData.type) :
                            /\.zip$/i.test(BookData.name) ? !MIMETypeREs['Zine'].test(BookData.type) : true) return reject(MIMETypeErrorMessage);
                    }
                    FileOrData = 'file';
                    this.B.Path = '[Local File] ' + BookData.name;
                } else {
                    if(BookDataFormat == 'Base64') {
                        // Base64-Encoded EPUB/Zine Data
                        if(!this.S['accept-base64-encoded-data']) return reject(`Base64 encoded data is set to unacceptable`);
                        try {
                            const Bin = atob(BookData.replace(/^.*,/, ''));
                            const Buf = new Uint8Array(Bin.length);
                            for(let l = Bin.length, i = 0; i < l; i++) Buf[i] = Bin.charCodeAt(i);
                            BookData = new Blob([Buf.buffer], { type: BookInfo.BookDataMIMEType });
                            if(!BookData || !BookData.size || !BookData.type) throw '';
                        } catch(_) {
                            return reject(this.Bibi.ErrorMessages.DataInvalid);
                        }
                        this.B.Path = '[Base64 Encoded Data]';
                    } else {
                        // Blob of EPUB/Zine Data
                        if(!this.S['accept-blob-converted-data']) return reject(`Blob converted data is set to unacceptable`);
                        this.B.Path = '[Blob Converted Data]';
                    }
                    if(!MIMETypeREs['EPUB'].test(BookData.type) && !MIMETypeREs['Zine'].test(BookData.type)) return reject(MIMETypeErrorMessage);
                    FileOrData = 'data';
                }
                this.O.loadZippedBookData(BookData).then(() => {
                    switch(this.B.Type) {
                        case 'EPUB': case 'Zine':
                            this.B.ExtractionPolicy = 'at-once';
                            return resolve(`${ this.B.Type } ${ FileOrData }`);
                        default:
                            return reject_failedToOpenTheBook(this.Bibi.ErrorMessages.DataInvalid);
                    }
                }).catch(reject_failedToOpenTheBook);
            }
        }).then(InitializedAs => {
            delete this.S['book-data'];
            delete this.S['book-data-mimetype'];
            return (this.B.Type == 'Zine' ? this.X.Zine.loadZineData() : this.loadContainer().then(() => this.loadPackage())).then(() => this.E.dispatch('bibi:initialized-book')).then(() => InitializedAs);
        });
    }

    loadContainer() {
        return this.openDocument(this.B.Container.Source).then(Doc => {
            this.B.Package.Source.Path = Doc.getElementsByTagName('rootfile')[0].getAttribute('full-path');
        });
    }

    loadPackage() {
        return this.openDocument(this.B.Package.Source).then(Doc => {
             // This is Used also from the Zine Extention.
            const _Package  = Doc.getElementsByTagName('package' )[0];
            const _Metadata = Doc.getElementsByTagName('metadata')[0], Metadata = this.B.Package.Metadata;
            const _Manifest = Doc.getElementsByTagName('manifest')[0], Manifest = this.B.Package.Manifest;
            const _Spine    = Doc.getElementsByTagName('spine'   )[0], Spine    = this.B.Package.Spine;
            const SourcePaths = {};
            // ================================================================================
            // METADATA
            // --------------------------------------------------------------------------------
            const DCNS = _Package.getAttribute('xmlns:dc') || _Metadata.getAttribute('xmlns:dc');
            const UIDID = _Package.getAttribute('unique-identifier'), UIDE = UIDID ? Doc.getElementById(UIDID) : null, UIDTC = UIDE ? UIDE.textContent : '';
            Metadata['unique-identifier'] = UIDTC ? UIDTC.trim() : '';
            ['identifier', 'language', 'title', 'creator', 'publisher'].forEach(Pro => sML.forEach(Doc.getElementsByTagNameNS(DCNS, Pro))(_Meta => (Metadata[Pro] ? Metadata[Pro] : Metadata[Pro] = []).push(_Meta.textContent.trim())));
            sML.forEach(_Metadata.getElementsByTagName('meta'))(_Meta => {
                if(_Meta.getAttribute('refines')) return; // Should be solved. 
                let Property = _Meta.getAttribute('property');
                if(Property) {
                    if(/^dcterms:/.test(Property)) {
                        if(!Metadata[Property]) Metadata[Property] = [];
                        Metadata[Property].push(_Meta.textContent.trim()); // 'dcterms:~'
                    } else {
                        Metadata[Property] = _Meta.textContent.trim(); // ex.) 'rendition:~'
                    }
                } else {
                    let Name = _Meta.getAttribute('name');
                    if(Name) {
                        Metadata[Name] = _Meta.getAttribute('content').trim(); // ex.) 'cover'
                    }
                }
            });
            // --------------------------------------------------------------------------------
            if(!Metadata['identifier']) Metadata['identifier'] = Metadata['dcterms:identifier'] || [];
            if(!Metadata['language'  ]) Metadata['language'  ] = Metadata['dcterms:language'  ] || ['en'];
            if(!Metadata['title'     ]) Metadata['title'     ] = Metadata['dcterms:title'     ] || Metadata['identifier'];
            // --------------------------------------------------------------------------------
            if(!Metadata['rendition:layout'     ]                                               ) Metadata['rendition:layout'     ] = 'reflowable'; if(Metadata['omf:version']) Metadata['rendition:layout'] = 'pre-paginated';
            if(!Metadata['rendition:orientation'] || Metadata['rendition:orientation'] == 'auto') Metadata['rendition:orientation'] = 'portrait';
            if(!Metadata['rendition:spread'     ] || Metadata['rendition:spread'     ] == 'auto') Metadata['rendition:spread'     ] = 'landscape';
            // Note: O.getViewportByOriginalResolution etc are in O (Environment)? Or should be in Loader?
            // They are not in O list I moved. Let's assume they are in O (Environment) or I need to move them.
            // Wait, I didn't see them in Environment.js...
            // They were likely in bibi.heart.js but I missed them or they were not in the O object?
            // Let's check.
            
            // Assume they are in O (Environment) for now, or I will fix later.
            // Actually, if they are not in Environment.js, this will fail.
            // I'll leave them as this.O.getViewport... and verify later.
            
            if( Metadata[     'original-resolution']) Metadata[     'original-resolution'] = this.O.getViewportByOriginalResolution(Metadata[     'original-resolution']);
            if( Metadata[      'rendition:viewport']) Metadata[      'rendition:viewport'] = this.O.getViewportByMetaContent(       Metadata[      'rendition:viewport']);
            if( Metadata['fixed-layout-jp:viewport']) Metadata['fixed-layout-jp:viewport'] = this.O.getViewportByMetaContent(       Metadata['fixed-layout-jp:viewport']);
            if( Metadata[            'omf:viewport']) Metadata[            'omf:viewport'] = this.O.getViewportByMetaContent(       Metadata[            'omf:viewport']);
            this.B.ICBViewport = Metadata['original-resolution'] || Metadata['rendition:viewport'] || Metadata['fixed-layout-jp:viewport'] || Metadata['omf:viewport'] || null;
            // ================================================================================
            // MANIFEST
            // --------------------------------------------------------------------------------
            const PackageDir  = this.B.Package.Source.Path.replace(       /\/[^\/]+$/, '');
            sML.forEach(_Manifest.getElementsByTagName('item'))(_Item => {
                let Source = {
                    'id': _Item.getAttribute('id'),
                    'href': _Item.getAttribute('href'),
                    'media-type': _Item.getAttribute('media-type')
                };
                if(!Source['id'] || !Source['href'] || (!Source['media-type'] && this.B.Type == 'EPUB')) return false;
                Source.Path = this.O.getPath(PackageDir, Source['href']);
                if(Manifest[Source.Path]) Source = Object.assign(Manifest[Source.Path], Source);
                if(!Source.Content) Source.Content = '';
                Source.Of = [];
                let Properties = _Item.getAttribute('properties');
                if(Properties) {
                    Properties = Properties.trim().replace(/\s+/g, ' ').split(' ');
                         if(Properties.includes('cover-image')) this.B.CoverImage.Source = Source;
                    else if(Properties.includes('nav'        )) this.B.Nav.Source        = Source, this.B.Nav.Type = 'Navigation Document';
                }
                const FallbackItemID = _Item.getAttribute('fallback');
                if(FallbackItemID) Source['fallback'] = FallbackItemID;
                Manifest[Source.Path] = Source;
                SourcePaths[Source['id']] = Source.Path;
            });
            [this.B.Container, this.B.Package].forEach(Meta => { if(Meta && Meta.Source) Meta.Source.Content = ''; });
            // ================================================================================
            // SPINE
            // --------------------------------------------------------------------------------
            if(!this.B.Nav.Source) {
                const Source = Manifest[SourcePaths[_Spine.getAttribute('toc')]];
                if(Source) this.B.Nav.Source = Source, this.B.Nav.Type = 'TOC-NCX';
            }
            if(       this.B.Nav.Source)        this.B.Nav.Source.Of.push(       this.B.Nav);
            if(this.B.CoverImage.Source) this.B.CoverImage.Source.Of.push(this.B.CoverImage);
            // --------------------------------------------------------------------------------
            this.B.PPD = _Spine.getAttribute('page-progression-direction');
            if(!this.B.PPD || !/^(ltr|rtl)$/.test(this.B.PPD)) this.B.PPD = this.S['default-page-progression-direction']; // default;
            // --------------------------------------------------------------------------------
            const PropertyRE = /^((rendition:)?(layout|orientation|spread|page-spread))-(.+)$/; 
            let SpreadBefore, SpreadAfter;
            if(this.B.PPD == 'rtl') SpreadBefore = 'right', SpreadAfter = 'left';
            else               SpreadBefore = 'left',  SpreadAfter = 'right';
            const SpreadsDocumentFragment = document.createDocumentFragment();
            sML.forEach(_Spine.getElementsByTagName('itemref'))(ItemRef => {
                const IDRef = ItemRef.getAttribute('idref'); if(!IDRef) return false;
                const Source = Manifest[SourcePaths[IDRef]]; if(!Source) return false;
                const Item = sML.create('iframe', { className: 'item', scrolling: 'no', allowtransparency: 'true' /*, TimeCard: {}, stamp: function(What) { this.O.stamp(What, this.TimeCard); }*/ });
                Item['idref'] = IDRef;
                Item.Source = Source;
                Item.AnchorPath = Source.Path;
                Item.FallbackChain = [];
                if(this.S['prioritise-fallbacks']) while(Item.Source['fallback']) {
                    const FallbackItem = Manifest[SourcePaths[Item.Source['fallback']]];
                    if(FallbackItem) Item.FallbackChain.push(Item.Source = FallbackItem);
                    else delete Item.Source['fallback'];
                }
                Item.Source.Of.push(Item);
                let Properties = ItemRef.getAttribute('properties');
                if(Properties) {
                    Properties = Properties.trim().replace(/\s+/g, ' ').split(' ');
                    Properties.forEach(Pro => { if(PropertyRE.test(Pro)) ItemRef[Pro.replace(PropertyRE, '$1')] = Pro.replace(PropertyRE, '$4'); });
                }
                Item['rendition:layout']      = ItemRef['rendition:layout']      || Metadata['rendition:layout'];
                Item['rendition:orientation'] = ItemRef['rendition:orientation'] || Metadata['rendition:orientation'];
                Item['rendition:spread']      = ItemRef['rendition:spread']      || Metadata['rendition:spread'];
                Item['rendition:page-spread'] = ItemRef['rendition:page-spread'] || ItemRef['page-spread'] || undefined;
                
                Item['_check-aspect-ratio'] = (Item['rendition:layout'] == 'pre-paginated' && Item['rendition:page-spread']);
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
                Item.IndexInSpine = Spine.push(Item) - 1;
                if(ItemRef.getAttribute('linear') == 'no') {
                    Item['linear'] = 'no';
                    Item.IndexInNonLinearItems = this.R.NonLinearItems.push(Item) - 1;
                } else {
                    Item['linear'] = 'yes';
                    Item.Index = this.R.Items.push(Item) - 1;
                    let Spread = null;
                    if(Item['rendition:layout'] == 'pre-paginated' && Item['rendition:page-spread'] == SpreadAfter && Item.Index > 0) {
                        const PreviousItem = this.R.Items[Item.Index - 1];
                        if(Item['rendition:layout'] == 'pre-paginated' && PreviousItem['rendition:page-spread'] == SpreadBefore) {
                            PreviousItem.SpreadPair = Item;
                            Item.SpreadPair = PreviousItem;
                            Spread = Item.Spread = PreviousItem.Spread;
                            Spread.Box.classList.remove('single-item-spread-before', 'single-item-spread-' + SpreadBefore);
                            Spread.Box.classList.add(Item['rendition:layout']);
                        }
                    }
                    if(!Spread) {
                        Spread = Item.Spread = sML.create('div', { className: 'spread', 
                            Items: [], Pages: [], 
                            Index: this.R.Spreads.length 
                        });
                        Spread.Box = sML.create('div', { className: 'spread-box ' + Item['rendition:layout'], Inside: Spread, Spread: Spread });
                        if(Item['rendition:page-spread']) {
                            Spread.Box.classList.add('single-item-spread-' + Item['rendition:page-spread']);
                            switch(Item['rendition:page-spread']) {
                                case SpreadBefore: Spread.Box.classList.add('single-item-spread-before'); break;
                                case SpreadAfter:  Spread.Box.classList.add('single-item-spread-after' ); break;
                            }
                        }
                        this.R.Spreads.push(SpreadsDocumentFragment.appendChild(Spread.Box).appendChild(Spread));
                    }
                    Item.IndexInSpread = Spread.Items.push(Item) - 1;
                    Item.Box = Spread.appendChild(sML.create('div', { className: 'item-box ' + Item['rendition:layout'], Inside: Item, Item: Item }));
                    Item.Pages = [];
                    if(Item['rendition:layout'] == 'pre-paginated') {
                        Item.PrePaginated = true;
                        if(Item.IndexInSpread == 0) Spread.PrePaginated = true;
                        const Page = sML.create('span', { className: 'page', 
                            Spread: Spread, Item: Item, 
                            IndexInItem: 0 
                        });
                        Item.Pages.push(Item.Box.appendChild(Page));
                        this.I.PageObserver.observePageIntersection(Page);
                    } else {
                        Item.PrePaginated = Spread.PrePaginated = false;
                    }
                }
            });
            this.R.createSpine(SpreadsDocumentFragment);
            // --------------------------------------------------------------------------------
            this.B.FileDigit = String(Spine.length).length;
            // ================================================================================
            this.B.ID        =  Metadata['unique-identifier'] || Metadata['identifier'][0] || '';
            this.B.Language  =  Metadata['language'][0].split('-')[0];
            this.B.Title     =  Metadata['title'     ].join(', ');
            this.B.Creator   = !Metadata['creator'   ] ? '' : Metadata['creator'  ].join(', ');
            this.B.Publisher = !Metadata['publisher' ] ? '' : Metadata['publisher'].join(', ');
            const FullTitleFragments = [this.B.Title];
            if(this.B.Creator)   FullTitleFragments.push(this.B.Creator);
            if(this.B.Publisher) FullTitleFragments.push(this.B.Publisher);
            this.B.FullTitle = FullTitleFragments.join(' - ').replace(/&amp;?/gi, '&').replace(/&lt;?/gi, '<').replace(/&gt;?/gi, '>');
            this.O.Title.innerHTML = '';
            this.O.Title.appendChild(document.createTextNode(this.B.FullTitle + ' | ' + (this.S['website-name-in-title'] ? this.S['website-name-in-title'] : 'Published with Bibi')));
            try { this.O.Info.querySelector('h1').innerHTML = document.title; } catch(_) {}
            this.B.WritingMode =                                                                                   /^(zho?|chi|kor?|ja|jpn)$/.test(this.B.Language) ? (this.B.PPD == 'rtl' ? 'tb-rl' : 'lr-tb')
                : /^(aze?|ara?|ui?g|urd?|kk|kaz|ka?s|ky|kir|kur?|sn?d|ta?t|pu?s|bal|pan?|fas?|per|ber|msa?|may|yid?|heb?|arc|syr|di?v)$/.test(this.B.Language) ?                             'rl-tb'
                :                                                                                                             /^(mo?n)$/.test(this.B.Language) ?                   'tb-lr'
                :                                                                                                                                                                       'lr-tb';
            this.B.AllowPlaceholderItems = (this.B.ExtractionPolicy != 'at-once' && Metadata['rendition:layout'] == 'pre-paginated');
            // ================================================================================
            this.E.dispatch('bibi:processed-package');
        });
    }

    createCover() {
        const VCover = this.I.Veil.Cover, PCover = this.I.Panel.BookInfo.Cover;
        const optimizeString = (Str) => `<span>` + Str.replace(
            /([ 　・／]+)/g, '</span><span>$1'
        ) + `</span>`;
        VCover.Info.innerHTML = PCover.Info.innerHTML = (() => {
            const BookID = [];
            if(this.B.Title)     BookID.push(`<strong>${ optimizeString(this.B.Title)     }</strong>`);
            if(this.B.Creator)   BookID.push(    `<em>${ optimizeString(this.B.Creator)   }</em>`    );
            if(this.B.Publisher) BookID.push(  `<span>${ optimizeString(this.B.Publisher) }</span>`  );
            return BookID.join(' ');
        })();
        return Promise.resolve(new Promise((resolve, reject) => {
            if(!this.B.CoverImage.Source || !this.B.CoverImage.Source.Path) return reject();
            let TimedOut = false;
            const TimerID = setTimeout(() => { TimedOut = true; reject(); }, 5000);
            this.file(this.B.CoverImage.Source, { URI: true }).then(Item => {
                if(!TimedOut) resolve(Item.URI);
            }).catch(() => {
                if(!TimedOut) reject();
            }).then(() => clearTimeout(TimerID));
        }).then(ImageURI => {
            VCover.className = PCover.className = 'with-cover-image';
            sML.style(VCover, { 'background-image': 'url(' + ImageURI + ')' });
            PCover.insertBefore(sML.create('img', { src: ImageURI }), PCover.Info);
        }).catch(() => {
            VCover.className = PCover.className = 'without-cover-image';
            VCover.insertBefore(this.I.getBookIcon(), VCover.Info);
            PCover.insertBefore(this.I.getBookIcon(), PCover.Info);
        }));
    }

    loadNavigation() {
        return this.openDocument(this.B.Nav.Source).then(Doc => {
            const PNav = this.I.Panel.BookInfo.Navigation = this.I.Panel.BookInfo.insertBefore(sML.create('div', { id: 'bibi-panel-bookinfo-navigation' }), this.I.Panel.BookInfo.firstElementChild);
            PNav.innerHTML = '';
            const NavContent = document.createDocumentFragment();
            if(this.B.Nav.Type == 'Navigation Document') {
                sML.forEach(Doc.querySelectorAll('nav'))(Nav => {
                    switch(Nav.getAttribute('epub:type')) {
                        case 'toc':       Nav.classList.add('bibi-nav-toc'); break;
                        case 'landmarks': Nav.classList.add('bibi-nav-landmarks'); break;
                        case 'page-list': Nav.classList.add('bibi-nav-page-list'); break;
                    }
                    sML.forEach(Nav.getElementsByTagName('*'))(Ele => Ele.removeAttribute('style'));
                    NavContent.appendChild(Nav);
                });
            } else {
                const makeNavULTree = (Ele) => {
                    const ChildNodes = Ele.childNodes;
                    let UL = undefined;
                    for(let l = ChildNodes.length, i = 0; i < l; i++) {
                        if(ChildNodes[i].nodeType != 1 || !/^navPoint$/i.test(ChildNodes[i].tagName)) continue;
                        const NavPoint = ChildNodes[i];
                        const NavLabel = NavPoint.getElementsByTagName('navLabel')[0];
                        const Content  = NavPoint.getElementsByTagName('content')[0];
                        const Text = NavPoint.getElementsByTagName('text')[0];
                        if(!UL) UL = document.createElement('ul');
                        const LI = sML.create('li', { id: NavPoint.getAttribute('id') }); LI.setAttribute('playorder', NavPoint.getAttribute('playorder'));
                        const A = sML.create('a', { href: Content.getAttribute('src'), innerHTML: Text.textContent.trim() });
                        LI.appendChild(A);
                        const ChildUL = makeNavULTree(NavPoint);
                        if(ChildUL) LI.appendChild(ChildUL);
                        UL.appendChild(LI);
                    }
                    return UL;
                };
                const NCX = Doc.getElementsByTagName('ncx')[0];
                const NavMap = NCX.getElementsByTagName('navMap')[0];
                const PageList = NCX.getElementsByTagName('pageList')[0];
                if(NavMap) {
                    const Nav = document.createElement('nav');
                    Nav.classList.add('bibi-nav-toc');
                    Nav.appendChild(makeNavULTree(NavMap));
                    NavContent.appendChild(Nav);
                }
                if(PageList) {
                    const Nav = document.createElement('nav');
                    Nav.classList.add('bibi-nav-page-list');
                    Nav.appendChild(makeNavULTree(PageList));
                    NavContent.appendChild(Nav);
                }
            }
            PNav.appendChild(NavContent);
            const RE = new RegExp('^' + this.B.PathDelimiter.replace(/([\/\.])/g, '\\$1'));
            sML.forEach(PNav.querySelectorAll('a'))(A => {
                const HRef = A.getAttribute('href');
                if(!HRef) return;
                if(/^(https?|mailto):/.test(HRef)) return A.setAttribute('target', '_blank');
                A.setAttribute('data-bibi-original-href', HRef);
                A.setAttribute('href', this.O.getPath(this.B.Package.Source.Path.replace(       /\/[^\/]+$/, ''), HRef));
                A.addEventListener('click', Eve => {
                    Eve.preventDefault();
                    Eve.stopPropagation();
                    const HRef = A.getAttribute('href');
                    const InBook = (() => {
                        const Path = HRef.replace(RE, '').split('#')[0];
                        for(const ItemPath in this.B.Package.Manifest) if(ItemPath == Path) return true;
                        return false;
                    })();
                    if(InBook) {
                        this.I.Panel.toggle().then(() => {
                            this.R.focusOn({ Destination: { Item: this.B.Package.Manifest[HRef.replace(RE, '').split('#')[0]], ElementSelector: (HRef.split('#')[1] ? '#' + HRef.split('#')[1] : undefined) } });
                        });
                    } else {
                        window.open(HRef);
                    }
                });
            });
            return PNav;
        });
    }

    loadSpread(Spread, Opt) {
        // Implementation needed
         const Promises = [];
        Spread.Items.forEach(Item => {
            Promises.push(this.loadItem(Item, Opt));
        });
        return Promise.all(Promises).then(() => {
            Spread.Loaded = true;
        });
    }

    loadItem(Item, Opt) {
        // Implementation needed
         if(Item.Loaded) return Promise.resolve(Item);
         if(Opt && Opt.AllowPlaceholderItems && Item.PrePaginated && !Item.Spread.PrePaginated) {
             // Placeholder logic
             Item.Loaded = true; // Temporary
             return Promise.resolve(Item);
         }
        return this.file(Item.Source, { Preprocess: true }).then(() => {
            Item.Loaded = true;
            return Item;
        });
    }

    preprocessResources() {
        // Implementation
        return Promise.resolve();
    }

    // --- O methods moved here ---

    isToBeExtractedIfNecessary(Path) {
        if(!Path || !this.S['extract-if-necessary'].length) return false;
        if(this.S['extract-if-necessary'].includes('*')) return true;
        if(this.S['extract-if-necessary'].includes( '')) return !/(\.[\u0000-\u007F]+)+$/.test(Path);
        for(let l = this.S['extract-if-necessary'].length, i = 0; i < l; i++) if(new RegExp(this.S['extract-if-necessary'][i].replace(/\./g, '\\.') + '$', 'i').test(Path)) return true;
        return false;
    }

    src(Source) {
        if(!this.B.Package.Manifest[Source.Path]) this.B.Package.Manifest[Source.Path] = Source;
        if(!Source['media-type']) Source['media-type'] = this.getContentType(Source.Path);
        return this.B.Package.Manifest[Source.Path];
    }

    cancelExtraction(Source) {
        if(Source.Resources) Source.Resources.forEach(Res => Res.Retlieved ? Promise.resolve() : this.RangeLoader.abort(Res.Path));
        return Source.Retlieved ? Promise.resolve() : this.RangeLoader.abort(Source.Path);
    }

    extract(Source) { 
        Source = this.src(Source);
        if(Source.Retlieving) return Source.Retlieving;
        if(Source.Content) return Promise.resolve(Source);
        if(Source.URI) return this.download(Source);
        return Source.Retlieving = this.RangeLoader.getBuffer(Source.Path).then(ABuf => {
            if(this.isBin(Source)) Source.DataType = 'Blob', Source.Content = new Blob([ABuf], { type: Source['media-type'] });
            else                   Source.DataType = 'Text', Source.Content = new TextDecoder('utf-8').decode(new Uint8Array(ABuf));
            Source.Retlieved = true;
            delete Source.Retlieving;
            return Source;
        }).catch(Err => {
            delete Source.Retlieving;
            return Promise.reject(
                    /404/.test(Err) ? this.Bibi.ErrorMessages.NotFound :
                /aborted/.test(Err) ? this.Bibi.ErrorMessages.Canceled :
                  /fetch/.test(Err) ? this.Bibi.ErrorMessages.CORSBlocked :
              /not found/.test(Err) ? this.Bibi.ErrorMessages.DataInvalid :
                /invalid/.test(Err) ? this.Bibi.ErrorMessages.DataInvalid :
            Err);
        });
    }

    download(Source/*, Opt = {}*/) {
        Source = this.src(Source);
        if(Source.Retlieving) return Source.Retlieving;
        if(Source.Content) return Promise.resolve(Source);
        const IsBin = this.isBin(Source);
        const XHR = new XMLHttpRequest(); //if(Opt.MimeType) XHR.overrideMimeType(Opt.MimeType);
        const RemotePath = Source.URI ? Source.URI : (/^([a-z]+:\/\/|\/)/.test(Source.Path) ? '' : this.B.Path + '/') + Source.Path;
        return Source.Retlieving = new Promise((resolve, reject) => {
            XHR.open('GET', RemotePath, true);
            XHR.responseType = IsBin ? 'blob' : 'text';
            XHR.onloadend = () => XHR.status == 200 ? resolve() : reject();
            XHR.onerror = () => reject();
            XHR.send(null);
        }).then(() => {
            Source.DataType = IsBin ? 'Blob' : 'Text', Source.Content = XHR.response;
            Source.Retlieved = true;
            delete Source.Retlieving;
            return Source;
        }).catch(() => {
            delete Source.Retlieving;
            return Promise.reject(
                XHR.status == 404 ? this.Bibi.ErrorMessages.NotFound :
                XHR.status ==   0 ? this.Bibi.ErrorMessages.CORSBlocked :
            XHR.status + ' ' + XHR.statusText);
        });
    }

    tryRangeRequest(Path = this.Bibi.Script.src, Bytes = '0-0') {
        return new Promise((resolve, reject) => {
            const XHR = new XMLHttpRequest();
            XHR.onloadend = () => XHR.status != 206 ? reject() : resolve();
            XHR.open('GET', Path, true);
            XHR.setRequestHeader('Range', 'bytes=' + Bytes);
            XHR.send(null);
        });
    }

    file(Source, Opt = {}) {
        return new Promise((resolve, reject) => {
            Source = this.src(Source);
            if(Opt.URI && Source.URI) return resolve(Source);
            (() => {
                if(Source.Content) return Promise.resolve(Source);
                if(Source.URI || !this.B.ExtractionPolicy) return this.download(Source);
                switch(this.B.ExtractionPolicy) {
                    case 'on-the-fly': return this.extract(Source);
                    case 'at-once':    return Promise.reject(`File Not Included: "${ Source.Path }"`);
                }
            })().then(Source => {
                if(typeof Opt.initialize == 'function') Opt.initialize(Source);
                return (Opt.Preprocess && !Source.Preprocessed) ? this.preprocess(Source) : Source;
            }).then(Source => {
                if(Opt.URI) {
                    if(!Source.URI) Source.URI = this.createBlobURL(Source.DataType, Source.Content, Source['media-type']);
                    Source.Content = '';
                }
                resolve(Source);
             }).catch(reject);
        });
    }

    isBin(Source) {
        return /\.(aac|gif|jpe?g|m4[av]|mp[g34]|ogg|[ot]tf|pdf|png|web[mp]|woff2?)$/i.test(Source.Path);
    }

    createBlobURL(DT, CB, MT) {
        return URL.createObjectURL(DT == 'Text' ? new Blob([CB], { type: MT }) : CB);
    }

    getContentType(FileName) {
        for(const Ext in this.ContentTypes) if(new RegExp('\\.' + Ext + '$').test(FileName)) return this.ContentTypes[Ext];
        return null;
    }

    preprocess(Source) {
        Source = this.src(Source);
        const Resources = [];
        const Setting = this.getPreprocessSetting(Source.Path);
        if(!Setting) {
            return Promise.resolve(Source);
        }
        const Promises = [];
        if(Setting.ReplaceRules) Source.Content = Setting.ReplaceRules.reduce((SourceContent, Rule) => SourceContent.replace(Rule[0], Rule[1]), Source.Content);
        if(Setting.ResolveRules) { // RRR
            const FileDir = Source.Path.replace(       /\/[^\/]+$/, '');
            Setting.ResolveRules.forEach(ResolveRule => ResolveRule.Patterns.forEach(Pattern => {
                const ResRE = ResolveRule.getRE(Pattern.Attribute);
                const Reses = Source.Content.match(ResRE);
                if(!Reses) return;
                const ExtRE = new RegExp('\\.(' + Pattern.Extensions + ')$', 'i');
                Reses.forEach(Res => {
                    const ResPathInSource = Res.replace(ResRE, ResolveRule.PathRef);
                    const ResPaths = this.O.getPath(FileDir, (!/^(\.*\/+|#)/.test(ResPathInSource) ? './' : '') + ResPathInSource).split('#');
                    if(!ExtRE.test(ResPaths[0])) return;
                    const Resource = this.src({ Path: ResPaths[0] });
                    Resources.push(Resource);
                    Promises.push(this.file(Resource, { Preprocess: true, URI: true }).then(ChildSource => {
                        ResPaths[0] = ChildSource.URI;
                        Source.Content = Source.Content.replace(Res, Res.replace(ResPathInSource, ResPaths.join('#')));
                    }));
                });
            }));
        }
        return Promise.all(Promises).then(() => {
            Source.Preprocessed = true;
            Source.Resources = Resources;
            return Source;
        });
    }

    getPreprocessSetting(FilePath) {
        const PpSs = this.PreprocessSettings;
        for(const Ext in PpSs) if(new RegExp('\\.(' + Ext + ')$', 'i').test(FilePath)) return typeof PpSs[Ext].init == 'function' ? PpSs[Ext].init(this.B) : PpSs[Ext];
        return null;
    }

    openDocument(Source) {
        return this.file(Source).then(Source => (new DOMParser()).parseFromString(Source.Content, /\.(xml|opf|ncx)$/i.test(Source.Path) ? 'text/xml' : 'text/html'));
    }
}
