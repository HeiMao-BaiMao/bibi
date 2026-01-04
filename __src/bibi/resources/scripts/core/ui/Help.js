import sML from 'sml.js';

export default class Help {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.Help = { create: () => {
        const Help = this.I.Help = O.Body.appendChild(sML.create('div', { id: 'bibi-help' }));
        Help.Message = Help.appendChild(sML.create('p', { className: 'hidden', id: 'bibi-help-message' }));
        Help.show = (HelpText) => {
        clearTimeout(Help.Timer_deactivate1);
        clearTimeout(Help.Timer_deactivate2);
        Help.classList.add('active');
        Help.Message.innerHTML = HelpText;
        setTimeout(() => Help.classList.add('shown'), 0);
        };
        Help.hide = () => {
        Help.Timer_deactivate1 = setTimeout(() => {
        Help.classList.remove('shown');
        Help.Timer_deactivate2 = setTimeout(() => Help.classList.remove('active'), 200);
        }, 100);
        };
        /*
        sML.appendCSSRule([ // Optimize to Scrollbar Size
        'html.appearance-horizontal div#bibi-help',
        'html.page-rtl.panel-opened div#bibi-help'
        ].join(', '), 'bottom: ' + (O.Scrollbars.Height) + 'px;');
        */
        }};
    }
}
