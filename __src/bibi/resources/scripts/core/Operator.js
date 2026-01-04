import sML from 'sml.js';
import SessionManager from './SessionManager.js';

export default class Operator {
    constructor() {
        this.TimeCard = {};
    }

    initialize(Bibi, I, S, R, U, B, L, E, X) {
        this.Bibi = Bibi;
        this.I = I;
        this.S = S;
        this.R = R;
        this.U = U;
        this.B = B;
        this.L = L;
        this.E = E;
        this.X = X;
        
        this._init();
    }
    
    _init() {
        const O = this;
        const Bibi = this.Bibi;
        const I = this.I;
        const S = this.S;
        const R = this.R;
        const U = this.U;
        const B = this.B;
        const L = this.L;
        const E = this.E;
        const X = this.X;

        
        const Session = new SessionManager();
        O.Cookies = Session.Cookies;
        O.Biscuits = Session.Biscuits;
        
        
        O.log = (Log, A2, A3) => { let Obj = '', Tag = '';
                 if(A3)      Obj = A2, Tag = A3;
            else if(/^<..>$/.test(A2)) Tag = A2;
            else if(A2)      Obj = A2;
            switch(Tag) {
                case '<e/>': return console.error(Log);
                case '</g>': O.log.Depth--;
            }
            if(
                (Log || Obj)
                    &&
                (O.log.Depth <= O.log.Limit || Tag == '<b:>' || Tag == '</b>' || Tag == '<*/>')
            ) {
                const Time = (O.log.Depth <= 1) ? O.stamp(Log) : 0;
                let Ls = [], Ss = [];
                if(Log) switch(Tag) {
                    case '<b:>': Ls.unshift(`📕`); Ls.push('%c' + Log), Ss.push(O.log.BStyle);                 Ls.push(`%c(v${ Bibi['version'] })` + (Bibi.Dev ? ':%cDEV' : '')), Ss.push(O.log.NStyle); if(Bibi.Dev) Ss.push(O.log.BStyle); break;
                    case '</b>': Ls.unshift(`📖`); Ls.push('%c' + Log), Ss.push(O.log.BStyle); if(O.log.Limit) Ls.push(`%c(${ Math.floor(Time / 1000) + '.' + String(Time % 1000).padStart(3, 0) }sec)`), Ss.push(O.log.NStyle); break;
                    case '<g:>': Ls.unshift(`┌`); Ls.push(Log); break;
                    case '</g>': Ls.unshift(`└`); Ls.push(Log); break;
                  //case '<o/>': Ls.unshift( `>`); Ls.push(Log); break;
                    default    : Ls.unshift( `-`); Ls.push(Log);
                }
                for(let i = O.log.Depth; i > 1; i--) Ls.unshift('│');
                Ls.unshift('%cBibi:'); Ss.unshift(O.log.NStyle);
                switch(Tag) {
                  //case '<o/>': O.log.log('groupCollapsed', Ls, Ss); console.log(Obj); console.groupEnd(); break;
                    default    : O.log.log('log',            Ls, Ss,              Obj                    );
                }
            }
            switch(Tag) {
                case '<g:>': O.log.Depth++;
            }
        };
        
            O.log.initialize = () => {
                if(parent && parent != window) return O.log = () => true;
                O.log.Limit = U.hasOwnProperty('log') && typeof (U['log'] *= 1) == 'number' ? U['log'] : 0;
                O.log.Depth = 1;
                O.log.NStyle = 'font: normal normal 10px/1 Menlo, Consolas, monospace;';
                O.log.BStyle = 'font: normal bold   10px/1 Menlo, Consolas, monospace;';
                O.log.distill = (sML.UA.Trident || sML.UA.EdgeHTML) ?
                    (Logs, Styles) => [Logs.join(' ').replace(/%c/g, '')]               : // Ignore Styles
                    (Logs, Styles) => [Logs.join(' ')                   ].concat(Styles);
                O.log.log = (Method, Logs, Styles, Obj) => {
                    const Args = O.log.distill(Logs, Styles);
                    if(Obj) Args.push(Obj);
                    console[Method].apply(console, Args);
                };
            };
        /*
        O.logSets = (...Args) => {
            let Repeats = [], Sets = []; Sets.length = 1;
            Args.reverse();
            for(let i = 0; i < Args.length; i++) {
                if(!Array.isArray(Args[i])) Args[i] = [Args[i]];
                Repeats[i] = Sets.length;
                Sets.length = Sets.length * Args[i].length;
            }
            Args.reverse(), Repeats.reverse();
            for(let i = 0; i < Sets.length; i++) Sets[i] = '';
            Args.forEach((_AA, i) => {
                let s = 0;
                while(s < Sets.length) _AA.forEach(_A => {
                    let r = Repeats[i];
                    while(r--) Sets[s++] += _A;
                });
            });
            Sets.forEach(Set => console.log('- ' + Set + ': ' + eval(Set)));
        };*/
        
        
        O.error = (Err) => {
            O.Busy = false;
            O.HTML.classList.remove('busy');
            O.HTML.classList.remove('loading');
            O.HTML.classList.remove('waiting');
            I.note(Err, 99999999999, 'ErrorOccured');
            O.log(Err, '<e/>');
            E.dispatch('bibi:x_x', typeof Err == 'string' ? new Error(Err) : Err);
        };
        
        
        O.TimeCard = {};
        
        O.getTimeLabel = (TimeFromOrigin = Date.now() - Bibi.TimeOrigin) => [
            TimeFromOrigin / 1000 / 60 / 60,
            TimeFromOrigin / 1000 / 60 % 60,
            TimeFromOrigin / 1000 % 60
        ].map(Val => String(Math.floor(Val)).padStart(2, 0)).join(':') + '.' + String(TimeFromOrigin % 1000).padStart(3, 0);
        
        O.stamp = (What, TimeCard = O.TimeCard) => {
            const TimeFromOrigin = Date.now() - Bibi.TimeOrigin;
            const TimeLabel = O.getTimeLabel(TimeFromOrigin);
            if(!TimeCard[TimeLabel]) TimeCard[TimeLabel] = [];
            TimeCard[TimeLabel].push(What);
            return TimeFromOrigin;
        };
        
        
        O.isToBeExtractedIfNecessary = (Path) => {
            if(!Path || !S['extract-if-necessary'].length) return false;
            if(S['extract-if-necessary'].includes('*')) return true;
            if(S['extract-if-necessary'].includes( '')) return !/(\.[\w\d]+)+$/.test(Path);
            for(let l = S['extract-if-necessary'].length, i = 0; i < l; i++) if(new RegExp(S['extract-if-necessary'][i].replace(/\./g, '\\.') + '$', 'i').test(Path)) return true;
            return false;
        };
        
        
        O.src = (Source) => {
            if(!B.Package.Manifest[Source.Path]) B.Package.Manifest[Source.Path] = Source;
            if(!Source['media-type']) Source['media-type'] = O.getContentType(Source.Path);
            return B.Package.Manifest[Source.Path];
        };
        
        
        O.RangeLoader = null;
        
        O.cancelExtraction = (Source) => {
            if(Source.Resources) Source.Resources.forEach(Res => Res.Retlieved ? Promise.resolve() : O.RangeLoader.abort(Res.Path));
            return Source.Retlieved ? Promise.resolve() : O.RangeLoader.abort(Source.Path);
        };
        
        O.extract = (Source) => { 
            Source = O.src(Source);
            if(Source.Retlieving) return Source.Retlieving;
            if(Source.Content) return Promise.resolve(Source);
            if(Source.URI) return O.download(Source);
            return Source.Retlieving = O.RangeLoader.getBuffer(Source.Path).then(ABuf => {
                if(O.isBin(Source)) Source.DataType = 'Blob', Source.Content = new Blob([ABuf], { type: Source['media-type'] });
                else                Source.DataType = 'Text', Source.Content = new TextDecoder('utf-8').decode(new Uint8Array(ABuf));
                Source.Retlieved = true;
                delete Source.Retlieving;
                return Source;
            }).catch(Err => {
                delete Source.Retlieving;
                return Promise.reject(
                        /404/.test(Err) ? Bibi.ErrorMessages.NotFound :
                    /aborted/.test(Err) ? Bibi.ErrorMessages.Canceled :
                      /fetch/.test(Err) ? Bibi.ErrorMessages.CORSBlocked :
                  /not found/.test(Err) ? Bibi.ErrorMessages.DataInvalid :
                    /invalid/.test(Err) ? Bibi.ErrorMessages.DataInvalid :
                Err);
            });
        };
        
        O.download = (Source/*, Opt = {}*/) => {
            Source = O.src(Source);
            if(Source.Retlieving) return Source.Retlieving;
            if(Source.Content) return Promise.resolve(Source);
            const IsBin = O.isBin(Source);
            const XHR = new XMLHttpRequest(); //if(Opt.MimeType) XHR.overrideMimeType(Opt.MimeType);
            const RemotePath = Source.URI ? Source.URI : (/^([a-z]+:\/\/|\/)/.test(Source.Path) ? '' : B.Path + '/') + Source.Path;
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
                    XHR.status == 404 ? Bibi.ErrorMessages.NotFound :
                    XHR.status ==   0 ? Bibi.ErrorMessages.CORSBlocked :
                XHR.status + ' ' + XHR.statusText);
            });
        };
        
        O.tryRangeRequest = (Path = Bibi.Script.src, Bytes = '0-0') => new Promise((resolve, reject) => {
            const XHR = new XMLHttpRequest();
            XHR.onloadend = () => XHR.status != 206 ? reject() : resolve();
            XHR.open('GET', Path, true);
            XHR.setRequestHeader('Range', 'bytes=' + Bytes);
            XHR.send(null);
        });
        
        O.file = (Source, Opt = {}) => new Promise((resolve, reject) => {
            Source = O.src(Source);
            if(Opt.URI && Source.URI) return resolve(Source);
            (() => {
                if(Source.Content) return Promise.resolve(Source);
                if(Source.URI || !B.ExtractionPolicy) return O.download(Source);
                switch(B.ExtractionPolicy) {
                    case 'on-the-fly': return O.extract(Source);
                    case 'at-once':    return Promise.reject(`File Not Included: "${ Source.Path }"`);
                }
            })().then(Source => {
                if(typeof Opt.initialize == 'function') Opt.initialize(Source);
                return (Opt.Preprocess && !Source.Preprocessed) ? O.preprocess(Source) : Source;
            }).then(Source => {
                if(Opt.URI) {
                    if(!Source.URI) Source.URI = O.createBlobURL(Source.DataType, Source.Content, Source['media-type']);
                    Source.Content = '';
                }
                resolve(Source);
             }).catch(reject);
        });
        
        
        O.isBin = (Source) => /\.(aac|gif|jpe?g|m4[av]|mp[g34]|ogg|[ot]tf|pdf|png|web[mp]|woff2?)$/i.test(Source.Path);
        
        O.createBlobURL = (DT, CB, MT) => URL.createObjectURL(DT == 'Text' ? new Blob([CB], { type: MT }) : CB);
        
        
        O.ContentTypes = {
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
        
        O.getContentType = (FileName) => {
            for(const Ext in O.ContentTypes) if(new RegExp('\\.' + Ext + '$').test(FileName)) return O.ContentTypes[Ext];
            return null;
        };
        
        
        O.preprocess = (Source) => {
            Source = O.src(Source);
            const Resources = [];
            const Setting = O.preprocess.getSetting(Source.Path);
            if(!Setting) {
                return Promise.resolve(Source);
            }
            const Promises = [];
            if(Setting.ReplaceRules) Source.Content = Setting.ReplaceRules.reduce((SourceContent, Rule) => SourceContent.replace(Rule[0], Rule[1]), Source.Content);
            if(Setting.ResolveRules) { // RRR
                const FileDir = Source.Path.replace(/\/?[^\/]+$/, '');
                Setting.ResolveRules.forEach(ResolveRule => ResolveRule.Patterns.forEach(Pattern => {
                    const ResRE = ResolveRule.getRE(Pattern.Attribute);
                    const Reses = Source.Content.match(ResRE);
                    if(!Reses) return;
                    const ExtRE = new RegExp('\\.(' + Pattern.Extensions + ')$', 'i');
                    Reses.forEach(Res => {
                        const ResPathInSource = Res.replace(ResRE, ResolveRule.PathRef);
                        const ResPaths = O.getPath(FileDir, (!/^(\.*\/+|#)/.test(ResPathInSource) ? './' : '') + ResPathInSource).split('#');
                        if(!ExtRE.test(ResPaths[0])) return;
                        const Resource = O.src({ Path: ResPaths[0] });
                        Resources.push(Resource);
                        Promises.push(O.file(Resource, { Preprocess: true, URI: true }).then(ChildSource => {
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
        };
        
            O.preprocess.getSetting = (FilePath) => { const PpSs = O.preprocess.Settings;
                for(const Ext in PpSs) if(new RegExp('\\.(' + Ext + ')$', 'i').test(FilePath)) return typeof PpSs[Ext].init == 'function' ? PpSs[Ext].init() : PpSs[Ext];
                return null;
            };
        
            O.preprocess.Settings = {
                'css': {
                    ReplaceRules: [
                        [/\/\*[.\s\S]*?\*\/|[^\{\}]+\{\s*\}/gm, ''],
                        [/[\r\n]+/g, '\n']
                    ],
                    ResolveRules: [{
                        getRE: () => /@import\s+["'](?!(?:https?|data):)(.+?)['"]/g,
                        PathRef: '$1',
                        Patterns: [
                            { Extensions: 'css' }
                        ]
                    }, {
                        getRE: () => /@import\s+url\(["']?(?!(?:https?|data):)(.+?)['"]?\)/g,
                        PathRef: '$1',
                        Patterns: [
                            { Extensions: 'css' }
                        ]
                    }, {
                        getRE: () => /url\(["']?(?!(?:https?|data):)(.+?)['"]?\)/g,
                        PathRef: '$1',
                        Patterns: [
                            { Extensions: 'gif|png|jpe?g|svg|ttf|otf|woff' }
                        ]
                    }],
                    init: function() { const RRs = this.ReplaceRules;
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
                        if(/^(zho?|chi|kor?|ja|jpn)$/.test(B.Language)) {
                            RRs.push([/text-align\s*:\s*justify\s*([;\}])/gm, 'text-align: justify; text-justify: inter-ideograph$1']);
                        }
                        //delete this.init;
                        return this;
                    }
                },
                'svg': {
                    ReplaceRules: [
                        [/<!--\s+[.\s\S]*?\s+-->/gm, '']
                    ],
                    ResolveRules: [{
                        getRE: (Att) => new RegExp('<\\??[a-zA-Z:\\-]+[^>]*? (' + Att + ')\\s*=\\s*["\'](?!(?:https?|data):)(.+?)[\'"]', 'g'),
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
                        getRE: (Att) => new RegExp('<\\??[a-zA-Z:\\-]+[^>]*? (' + Att + ')\\s*=\\s*["\'](?!(?:https?|data):)(.+?)[\'"]', 'g'),
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
        
        
        O.openDocument = (Source) => O.file(Source).then(Source => (new DOMParser()).parseFromString(Source.Content, /\.(xml|opf|ncx)$/i.test(Source.Path) ? 'text/xml' : 'text/html'));
        
        
        O.editCSSRules = function() {
            let Doc, fun;
                 if(typeof arguments[0] == 'function') Doc = arguments[1], fun = arguments[0];
            else if(typeof arguments[1] == 'function') Doc = arguments[0], fun = arguments[1];
            if(!Doc) Doc = document;
            if(!Doc.styleSheets || typeof fun != 'function') return;
            sML.forEach(Doc.styleSheets)(StyleSheet => O.editCSSRulesOfStyleSheet(StyleSheet, fun));
        };
        
            O.editCSSRulesOfStyleSheet = (StyleSheet, fun) => {
                try{ if(!StyleSheet.cssRules) return; } catch(_) { return; }
                for(let l = StyleSheet.cssRules.length, i = 0; i < l; i++) {
                    const CSSRule = StyleSheet.cssRules[i];
                    /**/ if(CSSRule.cssRules)   O.editCSSRulesOfStyleSheet(CSSRule,            fun);
                    else if(CSSRule.styleSheet) O.editCSSRulesOfStyleSheet(CSSRule.styleSheet, fun);
                    else                                               fun(CSSRule                );
                }
            };
        
        
        O.getWritingMode = (Ele) => {
            const CS = getComputedStyle(Ele);
                 if(!O.WritingModeProperty)                            return (CS['direction'] == 'rtl' ? 'rl-tb' : 'lr-tb');
            else if(     /^vertical-/.test(CS[O.WritingModeProperty])) return (CS['direction'] == 'rtl' ? 'bt' : 'tb') + '-' + (/-lr$/.test(CS[O.WritingModeProperty]) ? 'lr' : 'rl');
            else if(   /^horizontal-/.test(CS[O.WritingModeProperty])) return (CS['direction'] == 'rtl' ? 'rl' : 'lr') + '-' + (/-bt$/.test(CS[O.WritingModeProperty]) ? 'bt' : 'tb');
            else if(/^(lr|rl|tb|bt)-/.test(CS[O.WritingModeProperty])) return CS[O.WritingModeProperty];
        };
        
        
        O.getElementInnerText = (Ele) => {
            let InnerText = 'InnerText';
            const Copy = document.createElement('div');
            Copy.innerHTML = Ele.innerHTML.replace(/ (src(set)?|source|(xlink:)?href)=/g, ' data-$1=');
            sML.forEach(Copy.querySelectorAll('svg'   ))(Ele => Ele.parentNode.removeChild(Ele));
            sML.forEach(Copy.querySelectorAll('video' ))(Ele => Ele.parentNode.removeChild(Ele));
            sML.forEach(Copy.querySelectorAll('audio' ))(Ele => Ele.parentNode.removeChild(Ele));
            sML.forEach(Copy.querySelectorAll('img'   ))(Ele => Ele.parentNode.removeChild(Ele));
            sML.forEach(Copy.querySelectorAll('script'))(Ele => Ele.parentNode.removeChild(Ele));
            sML.forEach(Copy.querySelectorAll('style' ))(Ele => Ele.parentNode.removeChild(Ele));
            /**/ if(typeof Copy.textContent != 'undefined') InnerText = Copy.textContent;
            else if(typeof Copy.innerText   != 'undefined') InnerText = Copy.innerText;
            return InnerText.replace(/[\r\n\s\t ]/g, '');
        };
        
        
        O.getElementCoord = (Ele, OPa) => {
            const Coord = { X: Ele.offsetLeft, Y: Ele.offsetTop };
            OPa = OPa && OPa.tagName ? OPa : null;
            while(Ele.offsetParent != OPa) Ele = Ele.offsetParent, Coord.X += Ele.offsetLeft, Coord.Y += Ele.offsetTop;
            return Coord;
        };
        
        
        O.getViewportZooming = () => document.body.clientWidth / window.innerWidth;
        
        
        O.getPath = function() {
            let Origin = '', Path = arguments[0];
            if(arguments.length == 2 && /^[\w\d]+:\/\//.test(arguments[1])) Path  =       arguments[1];
            else for(let l = arguments.length, i = 1; i < l; i++)           Path += '/' + arguments[i];
            Path.replace(/^([a-zA-Z]+:\/\/[^\/]+)?\/*(.*)$/, (M, P1, P2) => { Origin = P1, Path = P2; });
            while(/([^:\/])\/{2,}/.test(Path)) Path = Path.replace(/([^:\/])\/{2,}/g, '$1/');
            while(        /\/\.\//.test(Path)) Path = Path.replace(        /\/\.\//g,   '/');
            while(/[^\/]+\/\.\.\//.test(Path)) Path = Path.replace(/[^\/]+\/\.\.\//g,    '');
            /**/                               Path = Path.replace(      /^(\.\/)+/g,    '');
            if(Origin) Path = Origin + '/' + Path;
            return Path;
        };
        
        
        O.fullPath = (FilePath) => B.Path + B.PathDelimiter + FilePath;
        
        
        O.getViewportByMetaContent = (Str) => {
            if(typeof Str == 'string' && /width/.test(Str) && /height/.test(Str)) {
                Str = Str.replace(/\s+/g, '');
                const W = Str.replace( /^.*?width=(\d+).*$/, '$1') * 1;
                const H = Str.replace(/^.*?height=(\d+).*$/, '$1') * 1;
                if(!isNaN(W) && !isNaN(H)) return { Width: W, Height: H };
            }
            return null;
        };
        
        O.getViewportByViewBox = (Str) => {
            if(typeof Str == 'string') {
                const XYWH = Str.replace(/^\s+/, '').replace(/\s+$/, '').split(/\s+/);
                if(XYWH.length == 4) {
                    const W = XYWH[2] * 1;// - XYWH[0] * 1;
                    const H = XYWH[3] * 1;// - XYWH[1] * 1;
                    if(!isNaN(W) && !isNaN(H)) return { Width: W, Height: H };
                }
            }
            return null;
        };
        
        O.getViewportByImage = (Img) => {
            if(Img && /^img$/i.test(Img.tagName)) {
                const ImageStyle = getComputedStyle(Img);
                return { Width: parseInt(ImageStyle.width), Height: parseInt(ImageStyle.height) };
            }
            return null;
        };
        
        O.getViewportByOriginalResolution = (Str) => {
            if(typeof Str == 'string') {
                const WH = Str.replace(/\s+/, '').split('x');
                if(WH.length == 2) {
                    const W = WH[0] * 1;
                    const H = WH[1] * 1;
                    if(!isNaN(W) && !isNaN(H)) return { Width: W, Height: H };
                }
            }
            return null;
        };
        
        
        O.isPointableContent = (Ele) => {
            while(Ele) {
                if(/^(a|audio|video)$/i.test(Ele.tagName)) return true;
                Ele = Ele.parentElement;
            }
            return false;
        };
        
        
        O.stopPropagation = (Eve) => { Eve.stopPropagation(); return false; };
        
        O.preventDefault  = (Eve) => { Eve.preventDefault();  return false; };
        
        
        O.getBibiEvent = (Eve) => {
            if(!Eve) return {};
            const Coord = O.getBibiEventCoord(Eve);
            const FlipperWidth = S['flipper-width'];
            const Ratio = {
                X: Coord.X / window.innerWidth,
                Y: Coord.Y / window.innerHeight
            };
            let BorderT, BorderR, BorderB, BorderL;
            if(FlipperWidth < 1) { // Ratio
                BorderL = BorderT =     FlipperWidth;
                BorderR = BorderB = 1 - FlipperWidth;
            } else { // Pixel to Ratio
                BorderL = FlipperWidth / window.innerWidth;
                BorderT = FlipperWidth / window.innerHeight;
                BorderR = 1 - BorderL;
                BorderB = 1 - BorderT;
            }
            const Division = { /* 9: 5 */ };
                 if(Ratio.X < BorderL          ) Division.X = 'left';//,   Division[9] -= 1;
            else if(          BorderR < Ratio.X) Division.X = 'right';//,  Division[9] += 1;
            else                                 Division.X = 'center';
                 if(Ratio.Y < BorderT          ) Division.Y = 'top';//,    Division[9] -= 3;
            else if(          BorderB < Ratio.Y) Division.Y = 'bottom';//, Division[9] += 3;
            else                                 Division.Y = 'middle';
            return {
                Target: Eve.target,
                Coord: Coord,
                Ratio: Ratio,
                Division: Division
            };
        };
        
        O.getBibiEventCoord = (Eve) => { let Coord = { X: 0, Y: 0 };
            if(/^touch/.test(Eve.type)) {
                Coord.X = Eve.changedTouches[0].pageX;
                Coord.Y = Eve.changedTouches[0].pageY;
            } else {
                Coord.X = Eve.pageX;
                Coord.Y = Eve.pageY;
            }
            Coord = O.getCoordInViewport(Coord, Eve.target.ownerDocument);/*
            console.log(
                `[${ Eve.target.ownerDocument == document ? 'PARENT' : 'CHILD' }]`,
                Coord,
                {
                    X: Eve.screenX - window.screenX - (window.outerWidth  - window.innerWidth),
                    Y: Eve.screenY - window.screenY - (window.outerHeight - window.innerHeight)
                },
                Eve
            );//*/
            return Coord;
        };
        
        O.getCoordInViewport = (Coord, Doc) => {
            if(Doc == document) {
                Coord.X -= O.Body.scrollLeft;
                Coord.Y -= O.Body.scrollTop;
            } else {
                const Main = R.Main;
                const MainTransformation = I.Loupe.CurrentTransformation || { Scale: 1, TranslateX: 0, TranslateY: 0 };
                const MainScale = MainTransformation.Scale;
                const MainTransformOriginX_InMain = Main.offsetWidth  / 2;
                const MainTransformOriginY_InMain = Main.offsetHeight / 2;
                const MainTranslationX = MainTransformation.TranslateX;
                const MainTranslationY = MainTransformation.TranslateY;
                const Item = Doc.documentElement.Item;
                const ItemScale = Item.Scale;
                const ItemCoordInMain = O.getElementCoord(Item, Main);
                if(Item['rendition:layout'] != 'pre-paginated' && !Item.Outsourcing) ItemCoordInMain.X += S['item-padding-left'], ItemCoordInMain.Y += S['item-padding-top'];
                Coord.X = Math.floor(Main.offsetLeft + ((MainTransformOriginX_InMain + MainTranslationX) + ((((ItemCoordInMain.X + (Coord.X * ItemScale)) - Main.scrollLeft) - MainTransformOriginX_InMain) * MainScale)));
                Coord.Y = Math.floor(Main.offsetTop  + ((MainTransformOriginY_InMain + MainTranslationY) + ((((ItemCoordInMain.Y + (Coord.Y * ItemScale)) - Main.scrollTop ) - MainTransformOriginY_InMain) * MainScale)));
                //                  (MainCoord       + ((MainTransformOrigin_in_Main + MainTranslation ) + ((((ItemCoord_in_Main + Coord_in_Item        ) - ScrolledLength ) - MainTransformOrigin_in_Main) * MainScale)))
                //                  (MainCoord       + ((MainTransformOrigin_in_Main + MainTranslation ) + (((Coord_in_Main                               - ScrolledLength ) - MainTransformOrigin_in_Main) * MainScale)))
                //                  (MainCoord       + ((MainTransformOrigin_in_Main + MainTranslation ) + ((Coord_in_Viewport_of_Main                                       - MainTransformOrigin_in_Main) * MainScale)))
                //                  (MainCoord       + ((MainTransformOrigin_in_Main + MainTranslation ) + (Coord_from_MainTransformOrigin_in_Main                                                          * MainScale)))
                //                  (MainCoord       + (MainTransformOrigin_in_Translated-Main           + Coord_from_TransformOrigin_in_Scaled-Main                                                                    ))
                //                  (MainCoord       + Coord_in_Transformed-Main                                                                                                                                         )
                //                  Coord
            }
            return Coord;
        };
        
        
        // Old O.Cookies and O.Biscuits removed. Replaced by SessionManager.
        
        
        
        
        
        //==============================================================================================================================================
        //----------------------------------------------------------------------------------------------------------------------------------------------
        
        //-- Events
        
        //----------------------------------------------------------------------------------------------------------------------------------------------
        
        
        // Old E (Events) definition removed. Replaced by EventManager.
        
        
        
        
        
        //==============================================================================================================================================
        //----------------------------------------------------------------------------------------------------------------------------------------------
        
        //-- Messages
        
        //----------------------------------------------------------------------------------------------------------------------------------------------
        
        
        
    }
}
