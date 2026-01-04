export default class SessionManager {
    constructor() {
        this.Cookies = {
            Label: 'bibi',
            remember: (Group) => {
                const BCs = JSON.parse(sML.Cookies.read(this.Cookies.Label) || '{}');
                //console.log('Cookies:', BCs);
                if(typeof Group != 'string' || !Group) return BCs;
                return BCs[Group];
            },
            eat: (Group, KeyVal, Opt) => {
                if(typeof Group != 'string' || !Group) return false;
                if(typeof KeyVal != 'object') return false;
                const BCs = this.Cookies.remember();
                if(typeof BCs[Group] != 'object') BCs[Group] = {};
                for(const Key in KeyVal) {
                    const Val = KeyVal[Key];
                    if(typeof Val == 'function') continue;
                    BCs[Group][Key] = Val;
                }
                if(!Opt) Opt = {};
                Opt.Path = location.pathname.replace(/[^"]+$/, '');
                // Note: S['cookie-expires'] dependency. Pass it via Opt or access global S?
                // For now, assume caller passes Expires in Opt, or we access S if available globally.
                // In original code: if(!Opt.Expires) Opt.Expires = S['cookie-expires'];
                // We will leave this responsibility to the caller or handle it later.
                if(!Opt.Expires && typeof S !== 'undefined' && S['cookie-expires']) Opt.Expires = S['cookie-expires'];
                
                sML.Cookies.write(this.Cookies.Label, JSON.stringify(BCs), Opt);
            }
        };

        this.Biscuits = {
            Memories: {}, Labels: {},
            initialize: (Tag, O, E, P, B) => {
                if(!localStorage) return this.Biscuits = null;
                if(typeof Tag != 'string') {
                    // Requires P.Script.src and O.Origin
                    this.Biscuits.LabelBase = 'BibiBiscuits:' + P.Script.src.replace(new RegExp('^' + O.Origin.replace(/([\/\.])/g, '\\$1')), '');
                    E.bind('bibi:initialized',      () => this.Biscuits.initialize('Bibi', O, E, P, B));
                    E.bind('bibi:initialized-book', () => this.Biscuits.initialize('Book', O, E, P, B));
                    return null;
                }
                switch(Tag) {
                    case 'Bibi': break;
                    case 'Book': if(B && B.ID) break; // Requires B.ID
                    default: return null;
                }
                const Label = this.Biscuits.Labels[Tag] = this.Biscuits.LabelBase + (Tag == 'Book' ? '#' + B.ID : '');
                const BiscuitsOfTheLabel = localStorage.getItem(Label);
                this.Biscuits.Memories[Label] = BiscuitsOfTheLabel ? JSON.parse(BiscuitsOfTheLabel) : {};
                return this.Biscuits.Memories[Label];
            },
            remember: (Tag, Key) => {
                if(!Tag || typeof Tag != 'string' || !this.Biscuits.Labels[Tag]) return this.Biscuits.Memories;
                const Label = this.Biscuits.Labels[Tag];
                return (!Key || typeof Key != 'string') ? this.Biscuits.Memories[Label] : this.Biscuits.Memories[Label][Key];
            },
            memorize: (Tag, KnV) => {
                if(!Tag || typeof Tag != 'string' || !this.Biscuits.Labels[Tag]) return false;
                const Label = this.Biscuits.Labels[Tag];
                if(KnV && typeof KnV == 'object') for(const Key in KnV) { const Val = KnV[Key];
                    try {
                        if(Val && typeof Val != 'function' && typeof JSON.parse(JSON.stringify({ [Key]: Val }))[Key] != 'undefined') this.Biscuits.Memories[Label][Key] = Val;
                        //if(Val) O.Biscuits.Memories[Label][Key] = Val;
                        else throw '';
                    } catch(Err) {
                        delete this.Biscuits.Memories[Label][Key];
                    }
                }
                return localStorage.setItem(Label, JSON.stringify(this.Biscuits.Memories[Label]));
            },
            forget: (Tag, Keys) => {
                if(!Tag) {
                    localStorage.removeItem(this.Biscuits.Labels.Bibi);
                    localStorage.removeItem(this.Biscuits.Labels.Book);
                    this.Biscuits.Memories = {};
                } else if(typeof Tag != 'string' || !this.Biscuits.Labels[Tag]) {
                } else {
                    const Label = this.Biscuits.Labels[Tag];
                    if(!Keys) {
                        localStorage.removeItem(Label);
                        delete this.Biscuits.Memories[Label];
                    } else {
                        if(typeof Keys == 'string') Keys = [Keys];
                        if(Array.isArray(Keys)) Keys.forEach(Key => (typeof Key != 'string' || !Key) ? false : delete this.Biscuits.Memories[Label][Key]);
                        localStorage.setItem(Label, JSON.stringify(this.Biscuits.Memories[Label]));
                    }
                }
                return this.Biscuits.Memories;
            }
        };
    }
}
