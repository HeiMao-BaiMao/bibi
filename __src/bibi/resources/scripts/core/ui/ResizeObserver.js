import sML from 'sml.js';

export default class ResizeObserver {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.ResizeObserver = { create: () => {
        const ResizeObserver = this.I.ResizeObserver = {
        Resizing: false,
        TargetPageAfterResizing: null,
        onResize: (Eve) => { if(R.LayingOut || !L.Opened) return;
        if(!ResizeObserver.Resizing) {
        ResizeObserver.Resizing = true;
        //ResizeObserver.TargetPageAfterResizing = this.I.PageObserver.Current.List && this.I.PageObserver.Current.List[0] && this.I.PageObserver.Current.List[0].Page ? this.I.PageObserver.Current.List[0].Page : this.I.PageObserver.IntersectingPages[0];
        ResizeObserver.TargetPageAfterResizing = this.I.PageObserver.Current.List[0] ? this.I.PageObserver.Current.List[0].Page : null;
        ////////R.Main.removeEventListener('scroll', this.I.ScrollObserver.onScroll);
        O.Busy = true;
        O.HTML.classList.add('busy');
        O.HTML.classList.add('resizing');
        };
        clearTimeout(ResizeObserver.Timer_onResizeEnd);
        ResizeObserver.Timer_onResizeEnd = setTimeout(() => {
        R.updateOrientation();
        const Page = ResizeObserver.TargetPageAfterResizing || (this.I.PageObserver.Current.List[0] ? this.I.PageObserver.Current.List[0].Page : null);
        R.layOutBook({
        Reset: true,
        Destination: Page ? { ItemIndex: Page.Item.Index, PageProgressInItem: Page.IndexInItem / Page.Item.Pages.length } : null
        }).then(() => {
        E.dispatch('bibi:resized', Eve);
        O.HTML.classList.remove('resizing');
        O.HTML.classList.remove('busy');
        O.Busy = false;
        ////////R.Main.addEventListener('scroll', this.I.ScrollObserver.onScroll);
        //this.I.ScrollObserver.onScroll();
        ResizeObserver.Resizing = false;
        });
        }, sML.UA.Trident ? 1200 : O.TouchOS ? 600 : 300);
        },
        observe: () => {
        window.addEventListener(E['resize'], ResizeObserver.onResize);
        }
        };
        E.bind('bibi:opened', ResizeObserver.observe);
        E.dispatch('bibi:created-resize-observer');
        }};
    }
}
