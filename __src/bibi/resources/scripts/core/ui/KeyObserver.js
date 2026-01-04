import sML from 'sml.js';

export default class KeyObserver {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.KeyObserver = { create: () => { if(!S['use-keys']) return;
        const KeyObserver = this.I.KeyObserver = {
        ActiveKeys: {},
        KeyCodes: { 'keydown': {}, 'keyup': {}, 'keypress': {} },
        updateKeyCodes: (EventTypes, KeyCodesToUpdate) => {
        if(typeof EventTypes.join != 'function')  EventTypes = [EventTypes];
        if(typeof KeyCodesToUpdate == 'function') KeyCodesToUpdate = KeyCodesToUpdate();
        EventTypes.forEach(EventType => KeyObserver.KeyCodes[EventType] = sML.edit(KeyObserver.KeyCodes[EventType], KeyCodesToUpdate));
        },
        KeyParameters: {},
        initializeKeyParameters: () => {
        let _ = { 'End': 'foot', 'Home': 'head' };
        for(const p in _) _[p.toUpperCase()] = _[p] == 'head' ? 'foot' : _[p] == 'foot' ? 'head' : _[p];
        //Object.assign(_, { 'Space': 1, 'SPACE': -1 }); // Space key is reserved for Loupe.
        KeyObserver.KeyParameters = _;
        },
        updateKeyParameters: () => {
        const _O = this.I.orthogonal('arrow-keys');
        const _ = (() => { switch(S.ARA) {
        case 'horizontal': return Object.assign({ 'Left Arrow': C.d2d('left'), 'Right Arrow': C.d2d('right' ) }, _O == 'move' ? {   'Up Arrow': C.d2d('top' , 9),  'Down Arrow': C.d2d('bottom', 9) } : {   'Up Arrow': _O,  'Down Arrow': _O });
        case   'vertical': return Object.assign({   'Up Arrow': C.d2d('top' ),  'Down Arrow': C.d2d('bottom') }, _O == 'move' ? { 'Left Arrow': C.d2d('left', 9), 'Right Arrow': C.d2d('right' , 9) } : { 'Left Arrow': _O, 'Right Arrow': _O });
        } })();
        for(const p in _) _[p.toUpperCase()] = _[p] == -1 ? 'head' : _[p] == 1 ? 'foot' : _[p];
        Object.assign(KeyObserver.KeyParameters, _);
        },
        getBibiKeyName: (Eve) => {
        const KeyName = KeyObserver.KeyCodes[Eve.type][Eve.keyCode];
        return KeyName ? KeyName : '';
        },
        onEvent: (Eve) => {
        if(!L.Opened) return false;
        Eve.BibiKeyName = KeyObserver.getBibiKeyName(Eve);
        Eve.BibiModifierKeys = [];
        if(Eve.shiftKey) Eve.BibiModifierKeys.push('Shift');
        if(Eve.ctrlKey)  Eve.BibiModifierKeys.push('Control');
        if(Eve.altKey)   Eve.BibiModifierKeys.push('Alt');
        if(Eve.metaKey)  Eve.BibiModifierKeys.push('Meta');
        //if(!Eve.BibiKeyName) return false;
        if(Eve.BibiKeyName) Eve.preventDefault();
        return true;
        },
        onKeyDown: (Eve) => {
        if(!KeyObserver.onEvent(Eve)) return false;
        if(Eve.BibiKeyName) {
        if(!KeyObserver.ActiveKeys[Eve.BibiKeyName]) {
        KeyObserver.ActiveKeys[Eve.BibiKeyName] = Date.now();
        } else {
        E.dispatch('bibi:is-holding-key', Eve);
        }
        }
        E.dispatch('bibi:downed-key', Eve);
        },
        onKeyUp: (Eve) => {
        if(!KeyObserver.onEvent(Eve)) return false;
        if(KeyObserver.ActiveKeys[Eve.BibiKeyName] && Date.now() - KeyObserver.ActiveKeys[Eve.BibiKeyName] < 300) {
        E.dispatch('bibi:touched-key', Eve);
        }
        if(Eve.BibiKeyName) {
        if(KeyObserver.ActiveKeys[Eve.BibiKeyName]) {
        delete KeyObserver.ActiveKeys[Eve.BibiKeyName];
        }
        }
        E.dispatch('bibi:upped-key', Eve);
        },
        onKeyPress: (Eve) => {
        if(!KeyObserver.onEvent(Eve)) return false;
        E.dispatch('bibi:pressed-key', Eve);
        },
        observe: (Doc) => {
        ['keydown', 'keyup', 'keypress'].forEach(EventName => Doc.addEventListener(EventName, KeyObserver['onKey' + sML.capitalise(EventName.replace('key', ''))], false));
        },
        onKeyTouch: (Eve) => {
        if(!Eve.BibiKeyName) return false;
        const KeyParameter = KeyObserver.KeyParameters[!Eve.shiftKey ? Eve.BibiKeyName : Eve.BibiKeyName.toUpperCase()];
        if(!KeyParameter) return false;
        Eve.preventDefault();
        switch(typeof KeyParameter) {
        case 'number': if(this.I.Flipper.isAbleToFlip(KeyParameter)) {
        if(this.I.Arrows) E.dispatch(this.I.Arrows[KeyParameter], 'bibi:tapped', Eve);
        this.I.Flipper.flip(KeyParameter);
        } break;
        case 'string': switch(KeyParameter) {
        case 'head': case 'foot': return R.focusOn({ Destination: KeyParameter, Duration: 0 });
        case 'utilities': return this.I.Utilities.toggleGracefuly();
        case 'switch': return this.I.AxisSwitcher ? this.I.AxisSwitcher.switchAxis() : false;
        } break;
        }
        }
        };
        KeyObserver.updateKeyCodes(['keydown', 'keyup', 'keypress'], {
        32: 'Space'
        });
        KeyObserver.updateKeyCodes(['keydown', 'keyup'], {
        33: 'Page Up',     34: 'Page Down',
        35: 'End',         36: 'Home',
        37: 'Left Arrow',  38: 'Up Arrow',  39: 'Right Arrow',  40: 'Down Arrow'
        });
        E.add('bibi:postprocessed-item', Item => Item.IsPlaceholder ? false : KeyObserver.observe(Item.contentDocument));
        E.add('bibi:opened', () => {
        KeyObserver.initializeKeyParameters(), KeyObserver.updateKeyParameters(), E.add('bibi:changed-view', () => KeyObserver.updateKeyParameters());
        KeyObserver.observe(document);
        E.add(['bibi:touched-key', 'bibi:is-holding-key'], Eve => KeyObserver.onKeyTouch(Eve));
        });
        E.dispatch('bibi:created-key-observer');
        }};
    }
}
