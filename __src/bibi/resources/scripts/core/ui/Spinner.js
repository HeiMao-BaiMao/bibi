import sML from 'sml.js';

export default class Spinner {
    constructor(I) {
        this.I = I;
        this.I.Spinner = this;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        Object.assign(this, {
            create: () => {
                const Spinner = this.I.Spinner = O.Body.appendChild(sML.create('div', { id: 'bibi-spinner' }));
                for(let i = 1; i <= 12; i++) Spinner.appendChild(document.createElement('span'));
                E.dispatch('bibi:created-spinner');
            }
        });
    }
}
