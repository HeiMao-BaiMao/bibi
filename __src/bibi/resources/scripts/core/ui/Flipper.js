import sML from 'sml.js';

export default class Flipper {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.Flipper = { create: () => {
        const Flipper = this.I.Flipper = {
        PreviousDistance: 0,
        Back: { Distance: -1 }, Forward: { Distance: 1 },
        getDirection: (Division) => { switch(S.ARA) {
        case 'horizontal': return Division.X != 'center' ? Division.X : Division.Y;
        case 'vertical'  : return Division.Y != 'middle' ? Division.Y : Division.X; } },
        isAbleToFlip: (Distance) => {
        if(L.Opened && !this.I.OpenedSubpanel && typeof (Distance * 1) == 'number' && Distance) {
        if(!this.I.PageObserver.Current.List.length) this.I.PageObserver.updateCurrent();
        if(this.I.PageObserver.Current.List.length) {
        let CurrentEdge, BookEdgePage, Edged;
        if(Distance < 0) CurrentEdge = this.I.PageObserver.Current.List[          0], BookEdgePage = R.Pages[          0], Edged = 'Headed';
        else             CurrentEdge = this.I.PageObserver.Current.List.slice(-1)[0], BookEdgePage = R.Pages.slice(-1)[0], Edged = 'Footed';
        if(CurrentEdge.Page != BookEdgePage) return true;
        if(!CurrentEdge.PageIntersectionStatus.Contained && !CurrentEdge.PageIntersectionStatus[Edged]) return true;
        }
        }
        return false;
        },
        flip: (Distance, Opt = {}) => {
        if(typeof (Distance *= 1) != 'number' || !isFinite(Distance) || Distance === 0) return Promise.resolve();
        this.I.ScrollObserver.forceStopScrolling();
        const SumUpHistory = (this.I.History.List.slice(-1)[0].UI == Flipper) && ((Distance < 0 ? -1 : 1) === (Flipper.PreviousDistance < 0 ? -1 : 1));
        Flipper.PreviousDistance = Distance;
        if(S['book-rendition-layout'] == 'pre-paginated') { // Preventing flicker.
        const CIs = [
        this.I.PageObserver.Current.List[          0].Page.Index,
        this.I.PageObserver.Current.List.slice(-1)[0].Page.Index
        ], TI = CIs[Distance < 0 ? 0 : 1] + Distance;
        CIs.forEach(CI => { try { R.Pages[CI].Spread.Box.classList.remove('current'); } catch(Err) {} });
        try { R.Pages[TI].Spread.Box.classList.add(   'current'); } catch(Err) {}
        }
        return R.moveBy({ Distance: Distance, Duration: Opt.Duration }).then(Destination => this.I.History.add({ UI: Flipper, SumUp: SumUpHistory, Destination: Destination }));
        }
        };
        Flipper[-1] = Flipper.Back, Flipper[1] = Flipper.Forward;
        }};
    }
}
