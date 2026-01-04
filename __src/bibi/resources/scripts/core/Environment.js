import sML from 'sml.js';

export default class Environment {
    constructor() {
        // Log
        this.log = (Log, A2, A3) => {
            let Obj = '', Tag = '';
                 if(A3)      Obj = A2, Tag = A3;
            else if(/^<..>$/.test(A2)) Tag = A2;
            else if(A2)      Obj = A2;
            switch(Tag) {
                case '<e/>': return console.error(Log);
                case '</g>': this.log.Depth--;
            }
            if(
                (Log || Obj)
                    &&
                (this.log.Depth <= this.log.Limit || Tag == '<b:>' || Tag == '</b>' || Tag == '<*/>')
            ) {
                const Time = (this.log.Depth <= 1) ? this.stamp(Log) : 0;
                let Ls = [], Ss = [];
                if(Log) switch(Tag) {
                    case '<b:>': Ls.unshift(`📕`); Ls.push('%c' + Log), Ss.push(this.log.BStyle);                 Ls.push(`%c(v${ Bibi['version'] })` + (Bibi.Dev ? ':%cDEV' : '')), Ss.push(this.log.NStyle); if(Bibi.Dev) Ss.push(this.log.BStyle); break;
                    case '</b>': Ls.unshift(`📖`); Ls.push('%c' + Log), Ss.push(this.log.BStyle); if(this.log.Limit) Ls.push(`%c(${ Math.floor(Time / 1000) + '.' + String(Time % 1000).padStart(3, 0) }sec)`), Ss.push(this.log.NStyle); break;
                    case '<g:>': Ls.unshift(`┌`); Ls.push(Log); break;
                    case '</g>': Ls.unshift(`└`); Ls.push(Log); break;
                  //case '<o/>': Ls.unshift( `>`); Ls.push(Log); break;
                    default    : Ls.unshift( `-`); Ls.push(Log);
                }
                for(let i = this.log.Depth; i > 1; i--) Ls.unshift('│');
                Ls.unshift('%cBibi:'); Ss.unshift(this.log.NStyle);
                switch(Tag) {
                  //case '<o/>': this.log.log('groupCollapsed', Ls, Ss); console.log(Obj); console.groupEnd(); break;
                    default    : this.log.log('log',            Ls, Ss,              Obj                    );
                }
            }
            switch(Tag) {
                case '<g:>': this.log.Depth++;
            }
        };
        
        this.log.initialize = (U) => { // Dependency U
            if(parent && parent != window) return this.log = () => true;
            this.log.Limit = U.hasOwnProperty('log') && typeof (U['log'] *= 1) == 'number' ? U['log'] : 0;
            this.log.Depth = 1;
            this.log.NStyle = 'font: normal normal 10px/1 Menlo, Consolas, monospace;';
            this.log.BStyle = 'font: normal bold   10px/1 Menlo, Consolas, monospace;';
            this.log.distill = (sML.UA.Trident || sML.UA.EdgeHTML) ?
                (Logs, Styles) => [Logs.join(' ').replace(/%c/g, '')]               : // Ignore Styles
                (Logs, Styles) => [Logs.join(' ')                   ].concat(Styles);
            this.log.log = (Method, Logs, Styles, Obj) => {
                const Args = this.log.distill(Logs, Styles);
                if(Obj) Args.push(Obj);
                console[Method].apply(console, Args);
            };
        };

        // TimeCard
        this.TimeCard = {};
        this.getTimeLabel = (TimeFromOrigin = Date.now() - Bibi.TimeOrigin) => [
            TimeFromOrigin / 1000 / 60 / 60,
            TimeFromOrigin / 1000 / 60 % 60,
            TimeFromOrigin / 1000 % 60
        ].map(Val => String(Math.floor(Val)).padStart(2, 0)).join(':') + '.' + String(TimeFromOrigin % 1000).padStart(3, 0);

        this.stamp = (What, TimeCard = this.TimeCard) => {
            const TimeFromOrigin = Date.now() - Bibi.TimeOrigin;
            const TimeLabel = this.getTimeLabel(TimeFromOrigin);
            if(!TimeCard[TimeLabel]) TimeCard[TimeLabel] = [];
            TimeCard[TimeLabel].push(What);
            return TimeFromOrigin;
        };
    }

    initialize(Bibi, U) {
        // Path / URI
        this.Origin = location.origin || (location.protocol + '//' + (location.host || (location.hostname + (location.port ? ':' + location.port : ''))));
        this.Local = location.protocol == 'file:';
        this.RequestedURL = location.href;

        // DOM
        this.contentWindow = window;
        this.contentDocument = document;
        this.HTML  = document.documentElement;
        this.Head  = document.head;
        this.Body  = document.body;
        this.Info  = document.getElementById('bibi-info');
        this.Title = document.getElementsByTagName('title')[0];

        // Environments
        this.HTML.classList.add(...sML.Environments, 'Bibi', 'welcome');
        if(this.TouchOS = (sML.OS.iOS || sML.OS.Android) ? true : false) { // Touch Device
            this.HTML.classList.add('touch');
            if(sML.OS.iOS) {
                this.Head.appendChild(sML.create('meta', { name: 'apple-mobile-web-app-capable',          content: 'yes'   }));
                this.Head.appendChild(sML.create('meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'white' }));
            }
        }
        if(Bibi.Dev)   this.HTML.classList.add('dev');
        if(Bibi.Debug) this.HTML.classList.add('debug');
        this.HTML.classList.add('default-lang-' + (this.Language = (NLs => { // Language
            if(Array.isArray(navigator.languages)) NLs = NLs.concat(navigator.languages);
            if(navigator.language && navigator.language != NLs[0]) NLs.unshift(navigator.language);
            for(let l = NLs.length, i = 0; i < l; i++) {
                const Lan = NLs[i].split ? NLs[i].split('-')[0] : '';
                if(Lan == 'ja') return 'ja';
                if(Lan == 'en') break;
            }                   return 'en';
        })([])));
        
        this.log.initialize(U);
    }
    
    // Utilities
    getElementCoord(Ele, OPa) {
        const Coord = { X: Ele.offsetLeft, Y: Ele.offsetTop };
        OPa = OPa && OPa.tagName ? OPa : null;
        while(Ele.offsetParent != OPa) Ele = Ele.offsetParent, Coord.X += Ele.offsetLeft, Coord.Y += Ele.offsetTop;
        return Coord;
    }
    
    getWritingMode(Ele) {
        const CS = getComputedStyle(Ele);
             if(!this.WritingModeProperty)                         return (CS['direction'] == 'rtl' ? 'rl-tb' : 'lr-tb');
        else if(     /^vertical-/.test(CS[this.WritingModeProperty])) return (CS['direction'] == 'rtl' ? 'bt' : 'tb') + '-' + (/-lr$/.test(CS[this.WritingModeProperty]) ? 'lr' : 'rl');
        else if(   /^horizontal-/.test(CS[this.WritingModeProperty])) return (CS['direction'] == 'rtl' ? 'rl' : 'lr') + '-' + (/-bt$/.test(CS[this.WritingModeProperty]) ? 'bt' : 'tb');
        else if(/^(lr|rl|tb|bt)-/.test(CS[this.WritingModeProperty])) return CS[this.WritingModeProperty];
    }
    
    getViewportZooming() {
         return document.body.clientWidth / window.innerWidth;
    }

    getPath(/* arguments */) {
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
    }
    
    // ... Other methods from O like error, download, extract will remain in O (in bibi.heart.js) for now, or moved to Loader.
    // We need to keep 'O' in bibi.heart.js as a mix of Environment and Loader for now, OR move everything to Environment and Loader.
    // If we replace O with Environment, we lose the Loader methods unless we mix them in or move them too.
    // Strategy: Create Environment class, instantiate it as O in bibi.heart.js.
    // But O in bibi.heart.js has methods like 'download', 'extract'. 
    // We should subclass or just assign them to the instance?
    // Since this is refactoring, let's keep O in bibi.heart.js as the main object, but delegate responsibilities to Environment class?
    // Or, better: Move all 'O' methods to Environment class now?
    // 'O' stands for 'Operator' (Bibi.Operator). It handles environment, logging, and loading utilities.
    // Let's move everything to Environment class for now to complete the replacement of O.
    
    // Moving Loader methods:
    isToBeExtractedIfNecessary(Path) {
        if(!Path || !S['extract-if-necessary'].length) return false;
        if(S['extract-if-necessary'].includes('*')) return true;
        if(S['extract-if-necessary'].includes( '')) return !/(\.[\w\d]+)+$/.test(Path);
        for(let l = S['extract-if-necessary'].length, i = 0; i < l; i++) if(new RegExp(S['extract-if-necessary'][i].replace(/\./g, '\\.') + '$', 'i').test(Path)) return true;
        return false;
    }
}
