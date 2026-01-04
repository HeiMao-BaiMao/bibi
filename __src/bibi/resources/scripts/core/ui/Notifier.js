import sML from 'sml.js';

export default class Notifier {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.Notifier = { create: () => {
        const Notifier = this.I.Notifier = O.Body.appendChild(sML.create('div', { id: 'bibi-notifier',
        show: (Msg, Err) => {
        clearTimeout(Notifier.Timer_hide);
        Notifier.P.className = Err ? 'error' : '';
        Notifier.P.innerHTML = Msg;
        O.HTML.classList.add('notifier-shown');
        if(L.Opened && !Err) Notifier.addEventListener(O.TouchOS ? E['pointerdown'] : E['pointerover'], Notifier.hide);
        },
        hide: (Time = 0) => {
        clearTimeout(Notifier.Timer_hide);
        Notifier.Timer_hide = setTimeout(() => {
        if(L.Opened) Notifier.removeEventListener(O.TouchOS ? E['pointerdown'] : E['pointerover'], Notifier.hide);
        O.HTML.classList.remove('notifier-shown');
        }, Time);
        },
        note: (Msg, Time, Err) => {
        if(!Msg) return Notifier.hide();
        Notifier.show(Msg, Err);
        if(typeof Time == 'undefined') Time = O.Busy && !L.Opened ? 8888 : 2222;
        if(typeof Time == 'number') Notifier.hide(Time);
        }
        }));
        Notifier.P = Notifier.appendChild(document.createElement('p'));
        this.I.note = Notifier.note;
        E.dispatch('bibi:created-notifier');
        }};
        
        this.I.note = () => false;
    }
}
