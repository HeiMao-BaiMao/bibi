import sML from 'sml.js';

export default class Utilities {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.Utilities = { create: () => {
        const Utilities = this.I.Utilities = this.I.setToggleAction({
        openGracefuly: () => R.Moving || R.Breaking || Utilities.UIState == 'active' ? false : Utilities.open(),
        closeGracefuly: () => R.Moving || R.Breaking || Utilities.UIState == 'default' ? false : Utilities.close(),
        toggleGracefuly: () => R.Moving || R.Breaking ? false : Utilities.toggle()
        }, {
        onopened: () => E.dispatch('bibi:opens-utilities'),
        onclosed: () => E.dispatch('bibi:closes-utilities')
        });
        E.add('bibi:commands:open-utilities',   () => this.I.Utilities.open());
        E.add('bibi:commands:close-utilities',  () => this.I.Utilities.close());
        E.add('bibi:commands:toggle-utilities', () => this.I.Utilities.toggleGracefuly());
        }};
    }
}
