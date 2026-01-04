import sML from 'sml.js';

export default class FontSizeChanger {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.FontSizeChanger = { create: () => {
        const FontSizeChanger = this.I.FontSizeChanger = {};
        if(typeof S['font-size-scale-per-step'] != 'number' || S['font-size-scale-per-step'] <= 1) S['font-size-scale-per-step'] = 1.25;
        if(S['use-font-size-changer'] && S['keep-settings'] && O.Biscuits) {
        const BibiBiscuits = O.Biscuits.remember('Bibi');
        if(BibiBiscuits && BibiBiscuits.FontSize && BibiBiscuits.FontSize.Step != undefined) FontSizeChanger.Step = BibiBiscuits.FontSize.Step * 1;
        }
        if(typeof FontSizeChanger.Step != 'number' || FontSizeChanger.Step < -2 || 2 < FontSizeChanger.Step) FontSizeChanger.Step = 0;
        E.bind('bibi:postprocessed-item', Item => { if(Item['rendition:layout'] == 'pre-paginated') return false;
        Item.changeFontSize = (FontSize) => {
        if(Item.FontSizeStyleRule) sML.deleteCSSRule(Item.contentDocument, Item.FontSizeStyleRule);
        Item.FontSizeStyleRule = sML.appendCSSRule(Item.contentDocument, 'html', 'font-size: ' + FontSize + 'px !important;');
        };
        Item.changeFontSizeStep = (Step) => Item.changeFontSize(Item.FontSize.Base * Math.pow(S['font-size-scale-per-step'], Step));
        Item.FontSize = {
        Default: getComputedStyle(Item.HTML).fontSize.replace(/[^\d]*$/, '') * 1
        };
        Item.FontSize.Base = Item.FontSize.Default;
        if(Item.Source.Preprocessed && (sML.UA.Chrome || sML.UA.Trident)) {
        sML.forEach(Item.HTML.querySelectorAll('body, body *'))(Ele => Ele.style.fontSize = parseInt(getComputedStyle(Ele).fontSize) / Item.FontSize.Base + 'rem');
        } else {
        O.editCSSRules(Item.contentDocument, CSSRule => {
        if(!CSSRule || !CSSRule.selectorText || /^@/.test(CSSRule.selectorText)) return;
        try { if(Item.contentDocument.querySelector(CSSRule.selectorText) == Item.HTML) return; } catch(_) {}
        const REs = {
        'pt': / font-size: (\d[\d\.]*)pt; /,
        'px': / font-size: (\d[\d\.]*)px; /
        };
        if(REs['pt'].test(CSSRule.cssText)) CSSRule.style.fontSize = CSSRule.cssText.match(REs['pt'])[1] * (96/72) / Item.FontSize.Base + 'rem';
        if(REs['px'].test(CSSRule.cssText)) CSSRule.style.fontSize = CSSRule.cssText.match(REs['px'])[1]           / Item.FontSize.Base + 'rem';
        });
        }
        if(typeof S['base-font-size'] == 'number' && S['base-font-size'] > 0) {
        let MostPopularFontSize = 0;
        const FontSizeCounter = {};
        sML.forEach(Item.Body.querySelectorAll('p, p *'))(Ele => {
        if(!Ele.innerText.replace(/\s/g, '')) return;
        const FontSize = Math.round(getComputedStyle(Ele).fontSize.replace(/[^\d]*$/, '') * 100) / 100;
        if(!FontSizeCounter[FontSize]) FontSizeCounter[FontSize] = [];
        FontSizeCounter[FontSize].push(Ele);
        });
        let MostPopularFontSizeAmount = 0;
        for(const FontSize in FontSizeCounter) {
        if(FontSizeCounter[FontSize].length > MostPopularFontSizeAmount) {
        MostPopularFontSizeAmount = FontSizeCounter[FontSize].length;
        MostPopularFontSize = FontSize;
        }
        }
        if(MostPopularFontSize) Item.FontSize.Base = Item.FontSize.Base * (S['base-font-size'] / MostPopularFontSize);
        Item.changeFontSizeStep(FontSizeChanger.Step);
        } else if(FontSizeChanger.Step != 0) {
        Item.changeFontSizeStep(FontSizeChanger.Step);
        }
        });
        FontSizeChanger.changeFontSizeStep = (Step, Actions) => {
        if(S.BRL == 'pre-paginated') return;
        if(Step == FontSizeChanger.Step) return;
        if(!Actions) Actions = {};
        E.dispatch('bibi:changes-font-size');
        if(typeof Actions.before == 'function') Actions.before();
        FontSizeChanger.Step = Step;
        if(S['use-font-size-changer'] && S['keep-settings'] && O.Biscuits) {
        O.Biscuits.memorize('Book', { FontSize: { Step: Step } });
        }
        setTimeout(() => {
        R.layOutBook({
        before: () => R.Items.forEach(Item => { if(Item.changeFontSizeStep) Item.changeFontSizeStep(Step); }),
        Reset: true,
        DoNotCloseUtilities: true,
        NoNotification: true
        }).then(() => {
        E.dispatch('bibi:changed-font-size', { Step: Step });
        if(typeof Actions.after == 'function') Actions.after();
        });
        }, 88);
        };
        //E.add('bibi:changes-font-size', () => E.dispatch('bibi:closes-utilities'));
        //E.add('bibi:changes-view', () => FontSizeChanger.changeFontSizeStep(0)); // unnecessary
        if(S['use-font-size-changer']) {
        const changeFontSizeStep = function() {
        const Button = this;
        FontSizeChanger.changeFontSizeStep(Button.Step, {
        before: () => Button.ButtonGroup.Busy = true,
        after:  () => Button.ButtonGroup.Busy = false
        });
        };
        this.I.createSubpanel({
        Opener: this.I.Menu.R.addButtonGroup({ Sticky: true, id: 'bibi-buttongroup_font-size' }).addButton({
        Type: 'toggle',
        Labels: {
        default: { default: `Change Font Size`,     ja: `文字サイズを変更` },
        active:  { default: `Close Font Size Menu`, ja: `文字サイズメニューを閉じる` }
        },
        //className: 'bibi-button-font-size bibi-button-font-size-change',
        Icon: `<span class="bibi-icon bibi-icon-change-fontsize"></span>`,
        Help: true
        }),
        id: 'bibi-subpanel_font-size',
        open: () => {}
        }).addSection({
        Labels: { default: { default: `Choose Font Size`, ja: `文字サイズを選択` } }
        }).addButtonGroup({
        //Tiled: true,
        ButtonType: 'radio',
        Buttons: [{
        Labels: { default: { default: `<span class="non-visual-in-label">Font Size:</span> Ex-Large`,                        ja: `<span class="non-visual-in-label">文字サイズ：</span>最大` } },
        Icon: `<span class="bibi-icon bibi-icon-fontsize bibi-icon-fontsize-exlarge"></span>`,
        action: changeFontSizeStep, Step:  2
        }, {
        Labels: { default: { default: `<span class="non-visual-in-label">Font Size:</span> Large`,                           ja: `<span class="non-visual-in-label">文字サイズ：</span>大` } },
        Icon: `<span class="bibi-icon bibi-icon-fontsize bibi-icon-fontsize-large"></span>`,
        action: changeFontSizeStep, Step:  1
        }, {
        Labels: { default: { default: `<span class="non-visual-in-label">Font Size:</span> Medium <small>(default)</small>`, ja: `<span class="non-visual-in-label">文字サイズ：</span>中<small>（初期値）</small>` } },
        Icon: `<span class="bibi-icon bibi-icon-fontsize bibi-icon-fontsize-medium"></span>`,
        action: changeFontSizeStep, Step:  0
        }, {
        Labels: { default: { default: `<span class="non-visual-in-label">Font Size:</span> Small`,                           ja: `<span class="non-visual-in-label">文字サイズ：</span>小` } },
        Icon: `<span class="bibi-icon bibi-icon-fontsize bibi-icon-fontsize-small"></span>`,
        action: changeFontSizeStep, Step: -1
        }, {
        Labels: { default: { default: `<span class="non-visual-in-label">Font Size:</span> Ex-Small`,                        ja: `<span class="non-visual-in-label">文字サイズ：</span>最小` } },
        Icon: `<span class="bibi-icon bibi-icon-fontsize bibi-icon-fontsize-exsmall"></span>`,
        action: changeFontSizeStep, Step: -2
        }]
        }).Buttons.forEach(Button => { if(Button.Step == FontSizeChanger.Step) this.I.setUIState(Button, 'active'); });
        }
        E.dispatch('bibi:created-font-size-changer');
        }};
    }
}
