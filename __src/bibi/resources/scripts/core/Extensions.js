import sML from 'sml.js';

export default class Extensions {
    constructor() {
        this.Extensions = [];
        this.Bibi = {};
    }
    
    initialize(S, E) {
        this.S = S;
        this.E = E;
    }

    load = (Xtn) => new Promise((resolve, reject) => {
        if(!Xtn['src'] || typeof Xtn['src'] != 'string') return reject(`"path" of the Extension Seems to Be Invalid. ("${ Xtn['src'] }")`);
        const XO = new URL(Xtn['src']).origin;
        if(!this.S['trustworthy-origins'].includes(XO)) return reject(`The Origin Is Not Allowed. ("${ Xtn['src'] }")`);
        Xtn.Script = document.head.appendChild(sML.create('script', { className: 'bibi-extension-script', src: Xtn['src'], Extension: Xtn, resolve: resolve, reject: function() { reject(); document.head.removeChild(this); } }));
    });

    add = (XMeta) => {
        const XScript = document.currentScript;
        if(typeof XMeta['id'] == 'undefined') return XScript.reject(`"id" of the extension is undefined.`);
        if(typeof XMeta['id'] != 'string')    return XScript.reject(`"id" of the extension is invalid.`);
        if(!XMeta['id'])                      return XScript.reject(`"id" of the extension is blank.`);
        if(this[XMeta['id']])                 return XScript.reject(`"id" of the extension is reserved or already used by another. ("${ XMeta['id'] }")`);
        XScript.setAttribute('data-bibi-extension-id', XMeta['id']);
        this[XMeta['id']] = XScript.Extension = sML.applyRtL(XMeta, XScript.Extension);
        this[XMeta['id']].Index = this.Extensions.length;
        this.Extensions.push(this[XMeta['id']]);
        XScript.resolve(this[XMeta['id']]);
        const Xtn = this[XMeta['id']];
        const E = this.E;
        return function(onR) {         if(Xtn && typeof onR == 'function') E.bind('bibi:readied',  () => onR.call(Xtn, Xtn));
            return function(onP) {     if(Xtn && typeof onP == 'function') E.bind('bibi:prepared', () => onP.call(Xtn, Xtn));
                return function(onO) { if(Xtn && typeof onO == 'function') E.bind('bibi:opened',   () => onO.call(Xtn, Xtn)); }; }; };
    };
}
