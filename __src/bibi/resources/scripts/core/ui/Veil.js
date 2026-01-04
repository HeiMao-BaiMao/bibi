import sML from 'sml.js';

export default class Veil {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.Veil = { create: () => {
        const Veil = this.I.Veil = this.I.setToggleAction(O.Body.appendChild(sML.create('div', { id: 'bibi-veil' })), {
        // Translate: 240, /* % */ // Rotate: -48, /* deg */ // Perspective: 240, /* px */
        onopened: () => (O.HTML.classList.add('veil-opened'), Veil.classList.remove('closed')),
        onclosed: () => (Veil.classList.add('closed'), O.HTML.classList.remove('veil-opened'))
        });
        ['touchstart', 'pointerdown', 'mousedown', 'click'].forEach(EN => Veil.addEventListener(EN, Eve => Eve.stopPropagation(), E.Cpt0Psv0));
        Veil.open();
        const PlayButtonTitle = (O.TouchOS ? 'Tap' : 'Click') + ' to Open';
        const PlayButton = Veil.PlayButton = Veil.appendChild(
        sML.create('p', { id: 'bibi-veil-play', title: PlayButtonTitle,
        innerHTML: `<span class="non-visual">${ PlayButtonTitle }</span>`,
        play: (Eve) => (Eve.stopPropagation(), L.play(), E.dispatch('bibi:played:by-button')),
        hide: (   ) => sML.style(PlayButton, { opacity: 0, cursor: 'default' }).then(Eve => Veil.removeChild(PlayButton)),
        on: { click: Eve => PlayButton.play(Eve) }
        })
        );
        E.add('bibi:played', () => PlayButton.hide());
        Veil.byebye = (Msg = {}) => {
        Veil.innerHTML = '';
        Veil.ByeBye = Veil.appendChild(sML.create('p', { id: 'bibi-veil-byebye' }));
        ['en', 'ja'].forEach(Lang => Veil.ByeBye.innerHTML += `<span lang="${ Lang }">${ Msg[Lang] }</span>`);
        O.HTML.classList.remove('welcome');
        Veil.open();
        return Msg['en'] ? Msg['en'].replace(/<[^>]*>/g, '') : '';
        };
        Veil.Cover      = Veil.appendChild(      sML.create('div', { id: 'bibi-veil-cover'      }));
        Veil.Cover.Info = Veil.Cover.appendChild(sML.create('p',   { id: 'bibi-veil-cover-info' }));
        E.dispatch('bibi:created-veil');
        }};
    }
}
