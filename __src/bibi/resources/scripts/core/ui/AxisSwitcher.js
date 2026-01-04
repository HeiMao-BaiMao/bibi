import sML from 'sml.js';

export default class AxisSwitcher {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.AxisSwitcher = { create: () => { if(S['fix-reader-view-mode']) return this.I.AxisSwitcher = null;
        const AxisSwitcher = this.I.AxisSwitcher = {
        switchAxis: () => new Promise(resolve => {
        if(S.RVM == 'paged') return resolve();
        const ViewMode = S.RVM == 'horizontal' ? 'vertical' : 'horizontal';
        this.I.Menu.Config.ViewModeSection.ButtonGroups[0].Buttons.filter(Button => Button.Mode == ViewMode)[0].BibiTapObserver.onTap();
        resolve();
        })
        };
        E.dispatch('bibi:created-axis-switcher');
        }};
    }
}
