import sML from 'sml.js';

export default class History {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.History = {
        List: [], Updaters: [],
        update: () => this.I.History.Updaters.forEach(fun => fun()),
        add: (Opt = {}) => {
        if(!Opt.UI) Opt.UI = Bibi;
        const    LastPage = R.hatchPage(this.I.History.List.slice(-1)[0]),
        CurrentPage = Opt.Destination ? R.hatchPage(Opt.Destination) : (() => { this.I.PageObserver.updateCurrent(); return this.I.PageObserver.Current.List[0].Page; })();
        if(CurrentPage != LastPage) {
        if(Opt.SumUp && this.I.History.List.slice(-1)[0].UI == Opt.UI) this.I.History.List.pop();
        this.I.History.List.push({ UI: Opt.UI, IIPP: this.I.PageObserver.getIIPP({ Page: CurrentPage }) });
        if(this.I.History.List.length - 1 > S['max-history']) { // Not count the first (oldest).
        const First = this.I.History.List.shift(); // The first (oldest) is the landing point.
        this.I.History.List.shift(); // Remove the second
        this.I.History.List.unshift(First); // Restore the first (oldest).
        }
        }
        this.I.History.update();
        },
        back: () => {
        if(this.I.History.List.length <= 1) return Promise.reject();
        const CurrentPage = R.hatchPage(this.I.History.List.pop()),
        LastPage = R.hatchPage(this.I.History.List.slice(-1)[0]);
        this.I.History.update();
        return R.focusOn({ Destination: LastPage, Duration: 0 });
        }
        };
    }
}
