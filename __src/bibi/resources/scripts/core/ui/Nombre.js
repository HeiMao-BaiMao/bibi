import sML from 'sml.js';

export default class Nombre {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.Nombre = { create: () => { if(!S['use-nombre']) return;
        const Nombre = this.I.Nombre = O.Body.appendChild(sML.create('div', { id: 'bibi-nombre',
        clearTimers: () => {
        clearTimeout(Nombre.Timer_hot);
        clearTimeout(Nombre.Timer_vanish);
        clearTimeout(Nombre.Timer_autohide);
        },
        show: () => {
        Nombre.clearTimers();
        Nombre.classList.add('active');
        Nombre.Timer_hot = setTimeout(() => Nombre.classList.add('hot'), 10);
        },
        hide: () => {
        Nombre.clearTimers();
        Nombre.classList.remove('hot');
        Nombre.Timer_vanish = setTimeout(() => Nombre.classList.remove('active'), 255);
        },
        progress: (PageInfo) => {
        Nombre.clearTimers();
        if(!PageInfo) PageInfo = this.I.PageObserver.Current;
        if(!PageInfo.List.length) return; ////////
        const StartPageNumber = PageInfo.List[          0].Page.Index + 1;
        const   EndPageNumber = PageInfo.List.slice(-1)[0].Page.Index + 1;
        const Percent = Math.floor((EndPageNumber) / R.Pages.length * 100);
        Nombre.Current.innerHTML = (() => {
        let PageNumber = StartPageNumber; if(StartPageNumber != EndPageNumber) PageNumber += `<span class="delimiter">-</span>` + EndPageNumber;
        return PageNumber;
        })();
        Nombre.Delimiter.innerHTML = `/`;
        Nombre.Total.innerHTML     = R.Pages.length;
        Nombre.Percent.innerHTML   = `(${ Percent }<span class="unit">%</span>)`;
        Nombre.show();
        if(this.I.Slider.UIState != 'active') Nombre.Timer_autohide = setTimeout(Nombre.hide, 1234);
        }
        }));
        Nombre.Current   = Nombre.appendChild(sML.create('span', { className: 'bibi-nombre-current'   }));
        Nombre.Delimiter = Nombre.appendChild(sML.create('span', { className: 'bibi-nombre-delimiter' }));
        Nombre.Total     = Nombre.appendChild(sML.create('span', { className: 'bibi-nombre-total'     }));
        Nombre.Percent   = Nombre.appendChild(sML.create('span', { className: 'bibi-nombre-percent'   }));
        E.add('bibi:opened' , () => setTimeout(() => {
        Nombre.progress();
        E.add(['bibi:is-scrolling', 'bibi:scrolled', 'bibi:opened-slider'], () => Nombre.progress());
        E.add('bibi:closed-slider', Nombre.hide);
        }, 321));
        sML.appendCSSRule('html.view-paged div#bibi-nombre',      'bottom: ' + (O.Scrollbars.Height + 2) + 'px;');
        sML.appendCSSRule('html.view-horizontal div#bibi-nombre', 'bottom: ' + (O.Scrollbars.Height + 2) + 'px;');
        sML.appendCSSRule('html.view-vertical div#bibi-nombre',    'right: ' + (O.Scrollbars.Height + 2) + 'px;');
        E.dispatch('bibi:created-nombre');
        }};
    }
}
