import sML from 'sml.js';
import { UIHelpers } from './ui/UIHelpers.js';
import Utilities from './ui/Utilities.js';
import ScrollObserver from './ui/ScrollObserver.js';
import PageObserver from './ui/PageObserver.js';
import ResizeObserver from './ui/ResizeObserver.js';
import TouchObserver from './ui/TouchObserver.js';
import FlickObserver from './ui/FlickObserver.js';
import WheelObserver from './ui/WheelObserver.js';
import PinchObserver from './ui/PinchObserver.js';
import KeyObserver from './ui/KeyObserver.js';
import EdgeObserver from './ui/EdgeObserver.js';
import Notifier from './ui/Notifier.js';
import Veil from './ui/Veil.js';
import Catcher from './ui/Catcher.js';
import Menu from './ui/Menu.js';
import Panel from './ui/Panel.js';
import Help from './ui/Help.js';
import PoweredBy from './ui/PoweredBy.js';
import FontSizeChanger from './ui/FontSizeChanger.js';
import Loupe from './ui/Loupe.js';
import Nombre from './ui/Nombre.js';
import History from './ui/History.js';
import Slider from './ui/Slider.js';
import BookmarkManager from './ui/BookmarkManager.js';
import Flipper from './ui/Flipper.js';
import Arrows from './ui/Arrows.js';
import AxisSwitcher from './ui/AxisSwitcher.js';
import Spinner from './ui/Spinner.js';

export default class UserInterface {
    constructor() {}

    initialize(Bibi, O, S, E, R, L, C) {
        this.Bibi = Bibi;
        this.O = O;
        this.S = S;
        this.E = E;
        this.R = R;
        this.L = L;
        this.C = C;
        
        this.Utilities = new Utilities(this);
        this.ScrollObserver = new ScrollObserver(this);
        this.PageObserver = new PageObserver(this);
        this.ResizeObserver = new ResizeObserver(this);
        this.TouchObserver = new TouchObserver(this);
        this.FlickObserver = new FlickObserver(this);
        this.WheelObserver = new WheelObserver(this);
        this.PinchObserver = new PinchObserver(this);
        this.KeyObserver = new KeyObserver(this);
        this.EdgeObserver = new EdgeObserver(this);
        this.Notifier = new Notifier(this);
        this.Veil = new Veil(this);
        this.Catcher = new Catcher(this);
        this.Menu = new Menu(this);
        this.Panel = new Panel(this);
        this.Help = new Help(this);
        this.PoweredBy = new PoweredBy(this);
        this.FontSizeChanger = new FontSizeChanger(this);
        this.Loupe = new Loupe(this);
        this.Nombre = new Nombre(this);
        this.History = new History(this);
        this.Slider = new Slider(this);
        this.BookmarkManager = new BookmarkManager(this);
        this.Flipper = new Flipper(this);
        this.Arrows = new Arrows(this);
        this.AxisSwitcher = new AxisSwitcher(this);
        this.Spinner = new Spinner(this);
        
        this._init();
    }
    
    _init() {
        const I = this;
        const Bibi = this.Bibi;
        const O = this.O;
        const S = this.S;
        const E = this.E;
        const R = this.R;
        const L = this.L;
        const C = this.C;

        Object.assign(this, UIHelpers);
        
        this.Utilities.create();
        this.TouchObserver.create();
        this.Notifier.create();
        this.Veil.create();
        E.bind('bibi:readied', () => {
            this.ScrollObserver.create();
            this.ResizeObserver.create();
            this.PageObserver.create();
            this.Catcher.create();
            this.Menu.create();
            this.Panel.create();
            this.Help.create();
            this.PoweredBy.create();
            this.FontSizeChanger.create();
            this.Loupe.create();
        });
        E.bind('bibi:initialized-book', () => {
            this.BookmarkManager.create();
        });
        E.bind('bibi:prepared', () => {
            this.FlickObserver.create();
            this.WheelObserver.create();
            this.PinchObserver.create();
            this.KeyObserver.create();
            this.EdgeObserver.create();
            this.Nombre.create();
            this.Slider.create();
            this.Flipper.create();
            this.Arrows.create();
            this.AxisSwitcher.create();
            this.Spinner.create();
        });
    }
}
