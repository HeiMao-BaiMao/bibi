import sML from 'sml.js';

export default class Menu {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.Menu = { create: () => {
        if(!S['use-menubar']) O.HTML.classList.add('without-menubar');
        const Menu = this.I.Menu = O.Body.appendChild(sML.create('div', { id: 'bibi-menu' }, this.I.Menu)); delete Menu.create;
        //Menu.addEventListener('click', Eve => Eve.stopPropagation());
        this.I.TouchObserver.setElementHoverActions(Menu);
        this.I.setToggleAction(Menu, {
        onopened: () => { O.HTML.classList.add(   'menu-opened'); E.dispatch('bibi:opened-menu'); },
        onclosed: () => { O.HTML.classList.remove('menu-opened'); E.dispatch('bibi:closed-menu'); }
        });
        E.add('bibi:commands:open-menu',   Menu.open);
        E.add('bibi:commands:close-menu',  Menu.close);
        E.add('bibi:commands:toggle-menu', Menu.toggle);
        E.add('bibi:opens-utilities',   Opt => E.dispatch('bibi:commands:open-menu',   Opt));
        E.add('bibi:closes-utilities',  Opt => E.dispatch('bibi:commands:close-menu',  Opt));
        E.add('bibi:opened', Menu.close);/*
        E.add('bibi:changes-intersection', () => {
        clearTimeout(Menu.Timer_cool);
        if(!Menu.Hot) Menu.classList.add('hot');
        Menu.Hot = true;
        Menu.Timer_cool = setTimeout(() => {
        Menu.Hot = false;
        Menu.classList.remove('hot');
        }, 1234);
        });*//*
        if(sML.OS.iOS) {
        Menu.addEventListener('pointerdown', console.log);
        Menu.addEventListener('pointerover', console.log);
        }*/
        if(!O.TouchOS) E.add('bibi:opened', () => {
        E.add('bibi:moved-pointer', Eve => {
        if(this.I.isPointerStealth()) return false;
        const BibiEvent = O.getBibiEvent(Eve);
        clearTimeout(Menu.Timer_close);
        if(BibiEvent.Division.Y == 'top') { //if(BibiEvent.Coord.Y < Menu.Height * 1.5) {
        E.dispatch(Menu, 'bibi:hovered', Eve);
        } else if(Menu.Hover) {
        Menu.Timer_close = setTimeout(() => E.dispatch(Menu, 'bibi:unhovered', Eve), 123);
        }
        });
        });
        Menu.L = Menu.appendChild(sML.create('div', { id: 'bibi-menu-l' }));
        Menu.R = Menu.appendChild(sML.create('div', { id: 'bibi-menu-r' }));
        [Menu.L, Menu.R].forEach(MenuSide => {
        MenuSide.ButtonGroups = [];
        MenuSide.addButtonGroup = function(Par) {
        const ButtonGroup = I.createButtonGroup(Par);
        if(!ButtonGroup) return null;
        this.ButtonGroups.push(ButtonGroup);
        return this.appendChild(ButtonGroup);
        };
        });
        { // Optimize to Scrollbar Size
        const _Common = 'html.appearance-vertical:not(.veil-opened):not(.slider-opened)', _M = ' div#bibi-menu';
        sML.appendCSSRule(_Common + _M, 'width: calc(100% - ' + O.Scrollbars.Width + 'px);');
        sML.appendCSSRule([_Common + '.panel-opened' + _M, _Common + '.subpanel-opened' + _M].join(', '), 'padding-right: ' + O.Scrollbars.Width + 'px;');
        }
        this.I.OpenedSubpanel = null;
        this.I.Subpanels = [];
        Menu.Config.create();
        E.dispatch('bibi:created-menu');
        }};
        
        this.I.Menu.Config = { create: () => {
        const Menu = this.I.Menu;
        const Components = [];
        if(!S['fix-reader-view-mode'])                                                                     Components.push('ViewModeSection');
        if(O.Embedded)                                                                                     Components.push('NewWindowButton');
        if(O.FullscreenTarget && !O.TouchOS)                                                               Components.push('FullscreenButton');
        if(S['website-href'] && /^https?:\/\/[^\/]+/.test(S['website-href']) && S['website-name-in-menu']) Components.push('WebsiteLink');
        if(!S['remove-bibi-website-link'])                                                                 Components.push('BibiWebsiteLink');
        if(!Components.length) {
        delete this.I.Menu.Config;
        return;
        }
        const Config = Menu.Config = sML.applyRtL(this.I.createSubpanel({ id: 'bibi-subpanel_config' }), Menu.Config); delete Config.create;
        const Opener = Config.bindOpener(Menu.R.addButtonGroup({ Sticky: true }).addButton({
        Type: 'toggle',
        Labels: {
        default: { default: `Configure Setting`,            ja: `設定を変更` },
        active:  { default: `Close Setting-Menu`, ja: `設定メニューを閉じる` }
        },
        Help: true,
        Icon: `<span class="bibi-icon bibi-icon-config"></span>`
        }));
        if(Components.includes('ViewModeSection')                                           ) Config.ViewModeSection.create(          ); else delete Config.ViewModeSection;
        if(Components.includes('NewWindowButton') || Components.includes('FullscreenButton'))   Config.WindowSection.create(Components); else delete   Config.WindowSection;
        if(Components.includes('WebsiteLink')     || Components.includes('BibiWebsiteLink') )  Config.LinkageSection.create(Components); else delete  Config.LinkageSection;
        E.dispatch('bibi:created-config');
        }};
        
        this.I.Menu.Config.ViewModeSection = { create: () => {
        const Config = this.I.Menu.Config;
        const /* SpreadShapes */ SSs = (/* SpreadShape */ SS => SS + SS + SS)((/* ItemShape */ IS => `<span class="bibi-shape bibi-shape-spread">${ IS + IS }</span>`)(`<span class="bibi-shape bibi-shape-item"></span>`));
        const Section = Config.ViewModeSection = Config.addSection({
        Labels: { default: { default: `View Mode`, ja: `閲覧モード` } },
        ButtonGroups: [{
        ButtonType: 'radio',
        Buttons: [{
        Mode: 'paged',
        Labels: { default: { default: `Spread / Page`, ja: `見開き／ページ` } },
        Icon: `<span class="bibi-icon bibi-icon-view bibi-icon-view-paged"><span class="bibi-shape bibi-shape-spreads bibi-shape-spreads-paged">${ SSs }</span></span>`
        }, {
        Mode: 'horizontal',
        Labels: { default: { default: `<span class="non-visual-in-label">⇄ </span>Horizontal Scroll`, ja: `<span class="non-visual-in-label">⇄ </span>横スクロール` } },
        Icon: `<span class="bibi-icon bibi-icon-view bibi-icon-view-horizontal"><span class="bibi-shape bibi-shape-spreads bibi-shape-spreads-horizontal">${ SSs }</span></span>`
        }, {
        Mode: 'vertical',
        Labels: { default: { default: `<span class="non-visual-in-label">⇅ </span>Vertical Scroll`, ja: `<span class="non-visual-in-label">⇅ </span>縦スクロール` } },
        Icon: `<span class="bibi-icon bibi-icon-view bibi-icon-view-vertical"><span class="bibi-shape bibi-shape-spreads bibi-shape-spreads-vertical">${ SSs }</span></span>`
        }].map(Button => sML.edit(Button, {
        Notes: true,
        action: () => R.changeView({ Mode: Button.Mode, NoNotification: true })
        }))
        }, /*{
        Buttons: []
        }, */{
        Buttons: [{
        Name: 'full-breadth-layout-in-scroll',
        Type: 'toggle',
        Notes: false,
        Labels: { default: { default: `Full Width for Each Page <small>(in Scrolling Mode)</small>`, ja: `スクロール表示で各ページを幅一杯に</small>` } },
        Icon: `<span class="bibi-icon bibi-icon-full-breadth-layout"></span>`,
        action: function() {
        const IsActive = (this.UIState == 'active');
        S.update({ 'full-breadth-layout-in-scroll': IsActive });
        if(IsActive) O.HTML.classList.add(   'book-full-breadth');
        else         O.HTML.classList.remove('book-full-breadth');
        if(S.RVM == 'horizontal' || S.RVM == 'vertical') R.changeView({ Mode: S.RVM, Force: true });
        if(S['keep-settings'] && O.Biscuits) O.Biscuits.memorize('Book', { FBL: S['full-breadth-layout-in-scroll'] });
        }
        }]
        }]
        });
        E.add('bibi:updated-settings', () => {
        Section.ButtonGroups[0].Buttons.forEach(Button => this.I.setUIState(Button, (Button.Mode == S.RVM ? 'active' : 'default')));
        });/*
        E.add('bibi:updated-settings', () => {
        const ButtonGroup = Section.ButtonGroups[1];
        ButtonGroup.style.display = S.BRL == 'reflowable' ? '' : 'none';
        ButtonGroup.Buttons.forEach(Button => this.I.setUIState(Button, S[Button.Name] ? 'active' : 'default'));
        });*/
        E.add('bibi:updated-settings', () => {
        const ButtonGroup = Section.ButtonGroups[Section.ButtonGroups.length - 1];
        ButtonGroup.style.display = S.BRL == 'pre-paginated' ? '' : 'none';
        ButtonGroup.Buttons.forEach(Button => this.I.setUIState(Button, S[Button.Name] ? 'active' : 'default'));
        });
        }};
        
        this.I.Menu.Config.WindowSection = { create: (Components) => {
        const Config = this.I.Menu.Config;
        const Buttons = [];
        if(Components.includes('NewWindowButton')) {
        Buttons.push({
        Type: 'link',
        Labels: {
        default: { default: `Open in New Window`, ja: `あたらしいウィンドウで開く` }
        },
        Icon: `<span class="bibi-icon bibi-icon-open-newwindow"></span>`,
        id: 'bibi-button-open-newwindow',
        href: O.RequestedURL,
        target: '_blank'
        });
        }
        if(Components.includes('FullscreenButton')) {
        Buttons.push({
        Type: 'toggle',
        Labels: {
        default: { default: `Enter Fullscreen`, ja: `フルスクリーンモード` },
        active:  { default: `Exit Fullscreen`, ja: `フルスクリーンモード解除` }
        },
        Icon: `<span class="bibi-icon bibi-icon-toggle-fullscreen"></span>`,
        id: 'bibi-button-toggle-fullscreen',
        action: function() {
        !O.Fullscreen ? O.FullscreenTarget.requestFullscreen() : O.FullscreenTarget.ownerDocument.exitFullscreen();
        Config.close();
        }
        });
        O.FullscreenTarget.ownerDocument.addEventListener('fullscreenchange', function() { // care multi-embeddeding
        if(!O.FullscreenButton) O.FullscreenButton = document.getElementById('bibi-button-toggle-fullscreen');
        if(this.fullscreenElement == O.FullscreenTarget) {
        O.Fullscreen = true;
        O.HTML.classList.add('fullscreen');
        this.I.setUIState(O.FullscreenButton, 'active');
        } else if(O.Fullscreen) {
        O.Fullscreen = false;
        O.HTML.classList.remove('fullscreen');
        this.I.setUIState(O.FullscreenButton, 'default');
        }
        });
        }
        if(Buttons.length) {
        const Section = Config.WindowSection = Config.addSection({ Labels: { default: { default: `Window Control`, ja: `ウィンドウ制御` } } });
        Section.addButtonGroup({ Buttons: Buttons });
        }
        }};
        
        this.I.Menu.Config.LinkageSection = { create: (Components) => {
        const Config = this.I.Menu.Config;
        const Buttons = [];
        if(Components.includes('WebsiteLink')) Buttons.push({
        Type: 'link',
        Labels: { default: { default: S['website-name-in-menu'].replace(/&/gi, '&amp;').replace(/</gi, '&lt;').replace(/>/gi, '&gt;') } },
        Icon: `<span class="bibi-icon bibi-icon-open-newwindow"></span>`,
        href: S['website-href'],
        target: '_blank'
        });
        if(Components.includes('BibiWebsiteLink')) Buttons.push({
        Type: 'link',
        Labels: { default: { default: `Bibi | Official Website` } },
        Icon: `<span class="bibi-icon bibi-icon-open-newwindow"></span>`,
        href: Bibi['href'],
        target: '_blank'
        });
        if(Buttons.length) {
        const Section = Config.LinkageSection = Config.addSection({ Labels: { default: { default: `Link${ Buttons.length > 1 ? 's' : '' }`, ja: `リンク` } } });
        Section.addButtonGroup({ Buttons: Buttons });
        }
        }};
    }
}
