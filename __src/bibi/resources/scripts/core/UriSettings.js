export default class UriSettings {
    constructor() {}
    
    translateData(PnV) {
        let [_P, _V] = PnV;
        switch(_P) {
            case 'paged': case 'horizontal': case 'vertical': _V = _P, _P = 'reader-view-mode'; break;
            case 'view': case 'rvm': _P = 'reader-view-mode'; break;
            case 'dppd': case 'default-ppd': _P = 'default-page-progression-direction'; break;
            case 'pagination': _P = 'pagination-method'; break;
        }
        return [_P, _V];
    }

    parseDataString(DataString) {
        if(typeof DataString != 'string' || !DataString) return null;
        const ParsedData = {}; let HasData = false;
        DataString.split('&').forEach(PnV => {
            const DD = this.translateData(PnV.split('='));
            if(DD && DD[1] != undefined) ParsedData[DD[0]] = DD[1], HasData = true;
        });
        return HasData ? ParsedData : null;
    }

    initialize(S, R, X, E) {
        const _U = S.applyFilteredSettingsTo({}, this, [S.Types, S.Types_UserOnly]);
        const HashData = (() => {
            let Hash = location.hash;
            if(typeof Hash != 'string') return {};
            const Data = {};
            const CatGroupREStr = '([&#])([a-zA-Z_]+)\(([^\(\)]+)\)', CatGroups = Hash.match(new RegExp(CatGroupREStr, 'g'));
            if(CatGroups && CatGroups.length) CatGroups.forEach(CatGroup => {
                const CatGroupParts = CatGroup.match(new RegExp(CatGroupREStr));
                let Cat = CatGroupParts[2].toLowerCase(), Dat = CatGroupParts[3];
                if(Dat) {
                    Cat = Cat == 'bibi' ? 'Bibi' : Cat == 'jo' ? 'Jo' : Cat == 'epubcfi' ? 'EPUBCFI' : undefined;
                    if(Cat) Data[Cat] = Dat;
                }
                Hash = Hash.replace(CatGroup, CatGroupParts[1]);
            });
            Data['#'] = Hash.replace(/^#|&$/, '');
            for(const Cat in Data) {
                if(Cat == 'EPUBCFI') continue;
                const ParsedData = this.parseDataString(Data[Cat]);
                if(!ParsedData) continue;
                Data[Cat] = S.applyFilteredSettingsTo({}, ParsedData, [S.Types, S.Types_UserOnly]);
                delete Data[Cat]['book'];
            }
            return Data;
        })();
        if(HashData['#']      ) { Object.assign(_U, _U['#']       = HashData['#']   ); }
        if(HashData['Bibi']   ) { Object.assign(_U, _U['Bibi']    = HashData['Bibi']); }
        if(HashData['Jo']     ) { Object.assign(_U, _U['Jo']      = HashData['Jo']  ); if(history.replaceState) history.replaceState(null, null, location.href.replace(/[&#]jo\([^\)]*\)$/g, '')); }
        if(HashData['EPUBCFI']) {                   _U['EPUBCFI'] = HashData['EPUBCFI']; }
        _U['Query'] = {}; for(const Pro in this) {
            if(typeof this[Pro] != 'function') _U['Query'][Pro] = this[Pro];
            this[Pro] = undefined; delete this[Pro];
        }
        Object.assign(this, _U);
             if(typeof this['nav']  == 'number') this['nav'] < 1 ? delete this['nav'] : R.StartOn = { Nav:  this['nav']  }; // to be converted in L.coordinateLinkages
        else if(typeof this['p']    == 'string')                                  R.StartOn = { P:    this['p']    };
        else if(typeof this['iipp'] == 'number')                                  R.StartOn = { IIPP: this['iipp'] };
        else if(typeof this['edge'] == 'string')                                  R.StartOn = { Edge: this['edge'] };
        else if(typeof this['EPUBCFI'] == 'string') E.add('bibi:readied', () => { if(X['EPUBCFI']) R.StartOn = X['EPUBCFI'].getDestination(this['EPUBCFI']); });
    }
}
