export default class EventManager {
    constructor() {
        const TouchOS = (sML.OS.iOS || sML.OS.Android) ? true : false;
        
        if(document.onpointerdown !== undefined) {
            this['pointerdown'] = 'pointerdown';
            this['pointermove'] = 'pointermove';
            this['pointerup']   = 'pointerup';
            this['pointerover'] = 'pointerover';
            this['pointerout']  = 'pointerout';
        } else if(TouchOS && document.ontouchstart !== undefined) {
            this['pointerdown'] = 'touchstart';
            this['pointermove'] = 'touchmove';
            this['pointerup']   = 'touchend';
        } else {
            this['pointerdown'] = 'mousedown';
            this['pointermove'] = 'mousemove';
            this['pointerup']   = 'mouseup';
            this['pointerover'] = 'mouseover';
            this['pointerout']  = 'mouseout';
        }
        this['resize'] = TouchOS ? 'orientationchange' : 'resize';
        this.Cpt0Psv0 = { capture: false, passive: false };
        this.Cpt1Psv0 = { capture:  true, passive: false };
        
        this.CustomEvents = new sML.CustomEvents('bibi');
    }

    add(/*[Tar,]*/ Nam, fun, Opt) {
        if(Array.isArray(arguments[0])                                        ) return arguments[0].forEach(AI => this.add(AI, arguments[1], arguments[2], arguments[3]));
        if(Array.isArray(arguments[1])                                        ) return arguments[1].forEach(AI => this.add(arguments[0], AI, arguments[2], arguments[3]));
        if(Array.isArray(arguments[2]) && typeof arguments[2][0] == 'function') return arguments[2].forEach(AI => this.add(arguments[0], arguments[1], AI, arguments[3]));
        let Tar = document; if(typeof fun != 'function') Tar = arguments[0], Nam = arguments[1], fun = arguments[2], Opt = arguments[3];
        return /^bibi:/.test(Nam) ? this.CustomEvents.add(Tar, Nam, fun) : Tar.addEventListener(Nam, fun, Opt);
    }

    remove(/*[Tar,]*/ Nam, fun, Opt) {
        if(Array.isArray(arguments[0])                                        ) return arguments[0].forEach(AI => this.remove(AI, arguments[1], arguments[2], arguments[3]));
        if(Array.isArray(arguments[1])                                        ) return arguments[1].forEach(AI => this.remove(arguments[0], AI, arguments[2], arguments[3]));
        if(Array.isArray(arguments[2]) && typeof arguments[2][0] == 'function') return arguments[2].forEach(AI => this.remove(arguments[0], arguments[1], AI, arguments[3]));
        let Tar = document; if(typeof fun != 'function') Tar = arguments[0], Nam = arguments[1], fun = arguments[2], Opt = arguments[3];
        return /^bibi:/.test(Nam) ? this.CustomEvents.remove(Tar, Nam, fun) : Tar.removeEventListener(Nam, fun, Opt);
    }

    bind(...args) { return this.CustomEvents.bind.apply(this.CustomEvents, args); }
    unbind(...args) { return this.CustomEvents.unbind.apply(this.CustomEvents, args); }
    dispatch(...args) { return this.CustomEvents.dispatch.apply(this.CustomEvents, args); }
}
