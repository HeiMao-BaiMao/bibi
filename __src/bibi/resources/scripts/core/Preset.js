export default class Preset {
    constructor() {
        this.Script = null;
    }
    
    initialize(U) {
        const DocHRef = location.href.split('?')[0];
        this['bookshelf'] = new URL(this['bookshelf'] || '../../bibi-bookshelf', this.Script.src).href.replace(/\/$/, '');
        this['extensions'] = (() => {
            let Extensions_HTML = document.getElementById('bibi-preset').getAttribute('data-bibi-extensions');
            if(Extensions_HTML) {
                Extensions_HTML = Extensions_HTML.trim().replace(/\s+/, ' ').split(' ').map(EPath => ({ src: new URL(EPath, DocHRef).href }));
                if(Extensions_HTML.length) this['extensions'] = Extensions_HTML;
            }
            return !Array.isArray(this['extensions']) ? [] : this['extensions'].filter(Xtn => {
                if(Xtn.hasOwnProperty('-spell-of-activation-')) {
                    const SoA = Xtn['-spell-of-activation-'];
                    if(!SoA || !/^[a-zA-Z0-9_\-]+$/.test(SoA) || !U.hasOwnProperty(SoA)) return false;
                }
                if(!Xtn || !Xtn['src'] || typeof Xtn['src'] != 'string') return false;
                return (Xtn['src'] = new URL(Xtn['src'], this.Script.src).href);
            });
        })();
    }
}
