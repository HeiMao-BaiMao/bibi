import sML from 'sml.js';

export const UIHelpers = {
    createButtonGroup(Par = {}) {
        if(Par.Area && Par.Area.tagName) {
            const AreaToBeAppended = Par.Area;
            delete Par.Area;
            return AreaToBeAppended.addButtonGroup(Par);
        }
        if(typeof Par.className != 'string' || !Par.className) delete Par.className;
        if(typeof Par.id        != 'string' || !Par.id)        delete Par.id;
        const ClassNames = ['bibi-buttongroup'];
        if(Par.Tiled) ClassNames.push('bibi-buttongroup-tiled');
        if(Par.Sticky) ClassNames.push('sticky');
        if(Par.className) ClassNames.push(Par.className);
        Par.className = ClassNames.join(' ');
        const ButtonsToAdd = Array.isArray(Par.Buttons) ? Par.Buttons : Par.Button ? [Par.Button] : [];
        delete Par.Buttons;
        delete Par.Button;
        const ButtonGroup = sML.create('ul', Par);
        ButtonGroup.Buttons = [];
        const UI = this; 
        ButtonGroup.addButton = function(Par) {
            const Button = UI.createButton(Par);
            if(!Button) return null;
            Button.ButtonGroup = this;
            Button.ButtonBox = Button.ButtonGroup.appendChild(sML.create('li', { className: 'bibi-buttonbox bibi-buttonbox-' + Button.Type }));
            if(!UI.O.TouchOS) {
                UI.TouchObserver.observeElementHover(Button.ButtonBox)
                UI.TouchObserver.setElementHoverActions(Button.ButtonBox);
            }
            Button.ButtonBox.appendChild(Button)
            Button.ButtonGroup.Buttons.push(Button);
            return Button;
        };
        ButtonsToAdd.forEach(ButtonToAdd => {
            if(!ButtonToAdd.Type && Par.ButtonType) ButtonToAdd.Type = Par.ButtonType;
            ButtonGroup.addButton(ButtonToAdd);
        });
        ButtonGroup.Busy = false;
        return ButtonGroup;
    },

    createButton(Par = {}) {
        if(typeof Par.className != 'string' || !Par.className) delete Par.className;
        if(typeof Par.id        != 'string' || !Par.id       ) delete Par.id;
        Par.Type = (typeof Par.Type == 'string' && /^(normal|toggle|radio|link)$/.test(Par.Type)) ? Par.Type : 'normal';
        const ClassNames = ['bibi-button', 'bibi-button-' + Par.Type];
        if(Par.className) ClassNames.push(Par.className);
        Par.className = ClassNames.join(' ');
        if(typeof Par.Icon != 'undefined' && !Par.Icon.tagName) {
            if(typeof Par.Icon == 'string' && Par.Icon) {
                Par.Icon = sML.hatch(Par.Icon);
            } else {
                delete Par.Icon;
            }
        }
        const Button = sML.create((typeof Par.href == 'string' ? 'a' : 'span'), Par);
        if(Button.Icon) {
            Button.IconBox = Button.appendChild(sML.create('span', { className: 'bibi-button-iconbox' }));
            Button.IconBox.appendChild(Button.Icon);
            Button.Icon = Button.IconBox.firstChild;
            Button.IconBox.Button = Button.Icon.Button = Button;
        }
        Button.Label = Button.appendChild(sML.create('span', { className: 'bibi-button-label' }));
        this.setFeedback(Button, {
            Help: Par.Help,
            Checked: Par.Checked,
            StopPropagation: true,
            PreventDefault: (Button.href ? false : true)
        });
        Button.isAvailable = () => {
            if(Button.Busy) return false;
            if(Button.ButtonGroup && Button.ButtonGroup.Busy) return false;
            return (Button.UIState != 'disabled');
        };
        if(typeof Button.action == 'function') this.E.add(Button, 'bibi:tapped', () => Button.isAvailable() ? Button.action.apply(Button, arguments) : null);
        Button.Busy = false;
        return Button;
    },

    createSubpanel(Par = {}) {
        if(typeof Par.className != 'string' || !Par.className) delete Par.className;
        if(typeof Par.id        != 'string' || !Par.id       ) delete Par.id;
        const ClassNames = ['bibi-subpanel', 'bibi-subpanel-' + (Par.Position == 'left' ? 'left' : 'right')];
        if(Par.className) ClassNames.push(Par.className);
        Par.className = ClassNames.join(' ');
        const SectionsToAdd = Array.isArray(Par.Sections) ? Par.Sections : Par.Section ? [Par.Section] : [];
        delete Par.Sections;
        delete Par.Section;
        const Subpanel = this.O.Body.appendChild(sML.create('div', Par));
        Subpanel.Sections = [];
        Subpanel.addEventListener(this.E['pointerdown'], Eve => Eve.stopPropagation());
        Subpanel.addEventListener(this.E['pointerup'],   Eve => Eve.stopPropagation());
        
        const UI = this;
        this.setToggleAction(Subpanel, {
            onopened: function(Opt) {
                UI.Subpanels.forEach(Sp => Sp == Subpanel ? true : Sp.close({ ForAnotherSubpanel: true }));
                UI.OpenedSubpanel = this;
                this.classList.add('opened');
                UI.O.HTML.classList.add('subpanel-opened');
                if(Subpanel.Opener) UI.setUIState(Subpanel.Opener, 'active');
                if(Par.onopened) Par.onopened.apply(Subpanel, arguments);
            },
            onclosed: function(Opt) {
                this.classList.remove('opened');
                if(UI.OpenedSubpanel == this) setTimeout(() => UI.OpenedSubpanel = null, 222);
                if(!Opt || !Opt.ForAnotherSubpanel) {
                    UI.O.HTML.classList.remove('subpanel-opened');
                }
                if(Subpanel.Opener) {
                    UI.setUIState(Subpanel.Opener, 'default');
                }
                if(Par.onclosed) Par.onclosed.apply(Subpanel, arguments);
            }
        });
        Subpanel.bindOpener = (Opener) => {
            this.E.add(Opener, 'bibi:tapped', () => Subpanel.toggle());
            Subpanel.Opener = Opener;
            return Subpanel.Opener;
        }
        if(Subpanel.Opener) Subpanel.bindOpener(Subpanel.Opener);
        this.E.add('bibi:opened-panel',      Subpanel.close);
        this.E.add('bibi:closes-utilities',  Subpanel.close);
        this.Subpanels.push(Subpanel);
        Subpanel.addSection = function(Par = {}) {
            const SubpanelSection = UI.createSubpanelSection(Par);
            if(!SubpanelSection) return null;
            SubpanelSection.Subpanel = this;
            this.appendChild(SubpanelSection)
            this.Sections.push(SubpanelSection);
            return SubpanelSection;
        };
        SectionsToAdd.forEach(SectionToAdd => Subpanel.addSection(SectionToAdd));
        return Subpanel;
    },

    createSubpanelSection(Par = {}) {
        if(typeof Par.className != 'string' || !Par.className) delete Par.className;
        if(typeof Par.id        != 'string' || !Par.id       ) delete Par.id;
        const ClassNames = ['bibi-subpanel-section'];
        if(Par.className) ClassNames.push(Par.className);
        Par.className = ClassNames.join(' ');
        const PGroupsToAdd = Array.isArray(Par.PGroups) ? Par.PGroups : Par.PGroup ? [Par.PGroup] : [];
        delete Par.PGroups;
        delete Par.PGroup;
        const ButtonGroupsToAdd = Array.isArray(Par.ButtonGroups) ? Par.ButtonGroups : Par.ButtonGroup ? [Par.ButtonGroup] : [];
        delete Par.ButtonGroups;
        delete Par.ButtonGroup;
        const SubpanelSection = sML.create('div', Par);
        if(SubpanelSection.Labels) { // HGroup
            SubpanelSection.Labels = this.distillLabels(SubpanelSection.Labels);
            SubpanelSection
                .appendChild(sML.create('div', { className: 'bibi-hgroup' }))
                    .appendChild(sML.create('p', { className: 'bibi-h' }))
                        .appendChild(sML.create('span', { className: 'bibi-h-label', innerHTML: SubpanelSection.Labels['default'][this.O.Language] }));
        }
        SubpanelSection.ButtonGroups = []; // ButtonGroups
        const UI = this;
        SubpanelSection.addButtonGroup = function(Par = {}) {
            const ButtonGroup = UI.createButtonGroup(Par);
            this.appendChild(ButtonGroup);
            this.ButtonGroups.push(ButtonGroup);
            return ButtonGroup;
        };
        
        ButtonGroupsToAdd.forEach(ButtonGroupToAdd => {
            if(ButtonGroupToAdd) SubpanelSection.addButtonGroup(ButtonGroupToAdd);
        });
        return SubpanelSection;
    },

    setToggleAction(Obj, Par = {}) {
        const UI = this;
        return sML.edit(Obj, {
            UIState: 'default',
            open: (Opt) => new Promise(resolve => {
                if(Obj.UIState == 'default') {
                    UI.setUIState(Obj, 'active');
                    if(Par.onopened) Par.onopened.call(Obj, Opt);
                }
                resolve(Opt);
            }),
            close: (Opt) => new Promise(resolve => {
                if(Obj.UIState == 'active') {
                    UI.setUIState(Obj, 'default');
                    if(Par.onclosed) Par.onclosed.call(Obj, Opt);
                }
                resolve(Opt);
            }),
            toggle: (Opt) => Obj.UIState == 'default' ? Obj.open(Opt) : Obj.close(Opt)
        });
    },

    setFeedback(Ele, Opt = {}) {
        Ele.Labels = this.distillLabels(Ele.Labels);
        if(Ele.Labels) {
            if(Opt.Help) {
                Ele.showHelp = () => {
                    if(this.Help && Ele.Labels[Ele.UIState]) this.Help.show(Ele.Labels[Ele.UIState][this.O.Language]);
                    return Ele;
                };
                Ele.hideHelp = () => {
                    if(this.Help) this.Help.hide();
                    return Ele;
                };
            }
            if(Ele.Notes) Ele.note = () => {
                if(Ele.Labels[Ele.UIState]) setTimeout(() => this.note(Ele.Labels[Ele.UIState][this.O.Language]), 0);
                return Ele;
            }
        }
        if(!this.O.TouchOS) {
            this.TouchObserver.observeElementHover(Ele);
            this.TouchObserver.setElementHoverActions(Ele);
        }
        this.TouchObserver.observeElementTap(Ele, Opt);
        this.TouchObserver.setElementTapActions(Ele);
        this.setUIState(Ele, Opt.Checked ? 'active' : 'default');
        return Ele;
    },

    setUIState(UI, UIState) {
        if(!UIState) UIState = 'default';
        UI.PreviousUIState = UI.UIState;
        if(UIState == UI.UIState) return;
        UI.UIState = UIState;
        if(UI.tagName) {
            if(UI.Labels && UI.Labels[UI.UIState] && UI.Labels[UI.UIState][this.O.Language]) {
                UI.title = UI.Labels[UI.UIState][this.O.Language].replace(/<[^>]+>/g, '');
                if(UI.Label) UI.Label.innerHTML = UI.Labels[UI.UIState][this.O.Language];
            }
            sML.replaceClass(UI, UI.PreviousUIState, UI.UIState);
        }
        return UI.UIState;
    },

    isPointerStealth() {
        let IsPointerStealth = false;
        UIHelpers.isPointerStealth.Checkers.forEach(checker => IsPointerStealth = checker() ? true : IsPointerStealth);
        return IsPointerStealth;
    },

    distillLabels(Labels) {
        if(typeof Labels != 'object' || !Labels) Labels = {};
        for(const State in Labels) Labels[State] = UIHelpers.distillLabels.distillLanguage.call(this, Labels[State]);
        if(!Labels['default'])                       Labels['default']  = UIHelpers.distillLabels.distillLanguage.call(this);
        if(!Labels['active']   && Labels['default']) Labels['active']   = Labels['default'];
        if(!Labels['disabled'] && Labels['default']) Labels['disabled'] = Labels['default'];
        return Labels;
    },

    orthogonal(InputType) {
        return this.S['orthogonal-' + InputType][this.S.RVM == 'paged' ? 0 : 1];
    },

    isScrollable() {
        return (this.S.ARA == this.S.SLA && this.Loupe.CurrentTransformation.Scale == 1) ? true : false;
    },

    getBookIcon() {
        return sML.create('div', { className: 'book-icon', innerHTML: `<span></span>` });
    }
};

UIHelpers.isPointerStealth.Checkers = [];
UIHelpers.isPointerStealth.addChecker = (fun) => typeof fun == 'function' && !UIHelpers.isPointerStealth.Checkers.includes(fun) ? UIHelpers.isPointerStealth.Checkers.push(fun) : UIHelpers.isPointerStealth.Checkers.length;

UIHelpers.distillLabels.distillLanguage = function(Label) {
    if(typeof Label != 'object' || !Label) Label = { default: Label };
    if(typeof Label['default'] != 'string')  {
             if(typeof Label['en'] == 'string')       Label['default']  = Label['en'];
        else if(typeof Label[this.O.Language] == 'string') Label['default']  = Label[this.O.Language];
        else                                          Label['default']  = '';
    }
    if(typeof Label[this.O.Language] != 'string') {
             if(typeof Label['default'] == 'string')  Label[this.O.Language] = Label['default'];
        else if(typeof Label['en']      == 'string')  Label[this.O.Language] = Label['en'];
        else                                          Label[this.O.Language] = '';
    }
    return Label;
};