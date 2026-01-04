import sML from 'sml.js';

export default class Panel {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.Panel = { create: () => {
        const Panel = this.I.Panel = O.Body.appendChild(sML.create('div', { id: 'bibi-panel' }));
        this.I.setToggleAction(Panel, {
        onopened: () => { O.HTML.classList.add(   'panel-opened'); E.dispatch('bibi:opened-panel'); },
        onclosed: () => { O.HTML.classList.remove('panel-opened'); E.dispatch('bibi:closed-panel'); }
        });
        E.add('bibi:commands:open-panel',   Panel.open);
        E.add('bibi:commands:close-panel',  Panel.close);
        E.add('bibi:commands:toggle-panel', Panel.toggle);
        E.add('bibi:closes-utilities',      Panel.close);
        this.I.setFeedback(Panel, { StopPropagation: true });
        E.add(Panel, 'bibi:tapped', () => E.dispatch('bibi:commands:toggle-panel'));
        Panel.BookInfo            = Panel.appendChild(               sML.create('div', { id: 'bibi-panel-bookinfo'            }));
        Panel.BookInfo.Cover      = Panel.BookInfo.appendChild(      sML.create('div', { id: 'bibi-panel-bookinfo-cover'      }));
        Panel.BookInfo.Cover.Info = Panel.BookInfo.Cover.appendChild(sML.create('p',   { id: 'bibi-panel-bookinfo-cover-info' }));
        const Opener = Panel.Opener = this.I.Menu.L.addButtonGroup({ Sticky: true }).addButton({
        Type: 'toggle',
        Labels: {
        default: { default: `Open Index`,  ja: `目次を開く`   },
        active:  { default: `Close Index`, ja: `目次を閉じる` }
        },
        Help: true,
        Icon: `<span class="bibi-icon bibi-icon-toggle-panel">${ (Bars => { for(let i = 1; i <= 6; i++) Bars += '<span></span>'; return Bars; })('') }</span>`,
        action: () => Panel.toggle()
        });
        E.add('bibi:opened-panel', () => this.I.setUIState(Opener, 'active'            ));
        E.add('bibi:closed-panel', () => this.I.setUIState(Opener, ''                  ));
        E.add('bibi:started',      () =>    sML.style(Opener, { display: 'block' }));
        if(S['on-doubletap'] == 'panel') E.add('bibi:doubletapped',   () => Panel.toggle());
        if(S['on-tripletap'] == 'panel') E.add('bibi:tripletapped',   () => Panel.toggle());
        //sML.appendCSSRule('div#bibi-panel-bookinfo', 'height: calc(100% - ' + (O.Scrollbars.Height) + 'px);'); // Optimize to Scrollbar Size
        E.dispatch('bibi:created-panel');
        }};
    }
}
