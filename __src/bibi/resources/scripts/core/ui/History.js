import sML from 'sml.js';

export default class History {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        I.History = {
        List: [], Updaters: [],
        update: () => I.History.Updaters.forEach(fun => fun()),
        add: (Opt = {}) => {
        if(!Opt.UI) Opt.UI = Bibi;
        const    LastPage = R.hatchPage(I.History.List.slice(-1)[0]),
        CurrentPage = Opt.Destination ? R.hatchPage(Opt.Destination) : (() => { I.PageObserver.updateCurrent(); return I.PageObserver.Current.List[0].Page; })();
        if(CurrentPage != LastPage) {
        if(Opt.SumUp && I.History.List.slice(-1)[0].UI == Opt.UI) I.History.List.pop();
        I.History.List.push({ UI: Opt.UI, IIPP: I.PageObserver.getIIPP({ Page: CurrentPage }) });
        if(I.History.List.length - 1 > S['max-history']) { // Not count the first (oldest).
        const First = I.History.List.shift(); // The first (oldest) is the landing point.
        I.History.List.shift(); // Remove the second
        I.History.List.unshift(First); // Restore the first (oldest).
        }
        }
        I.History.update();
        },
        back: () => {
        if(I.History.List.length <= 1) return Promise.reject();
        const CurrentPage = R.hatchPage(I.History.List.pop()),
        LastPage = R.hatchPage(I.History.List.slice(-1)[0]);
        I.History.update();
        return R.focusOn({ Destination: LastPage, Duration: 0 });
        }
        };
    }
}
