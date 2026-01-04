import sML from 'sml.js';

export default class Compass {
    constructor(S) {
        this.S = S;
        this.update();
    }

    update() {
        this.probe('L', this.S['spread-layout-axis']   ); // Rules in "L"ayout
        this.probe('A', this.S['apparent-reading-axis']); // Rules in "A"ppearance
        this.DDD = (() => { switch(this.S.PPD) { // DDD: Direction-Distance Dictionary
            case 'ltr': return this.S.ARD != 'ttb' ? { 'left':  -1 , 'right':  1 , 'top': '-1', 'bottom': '1' } : { 'left': '-1', 'right': '1', 'top':  -1 , 'bottom':  1  };
            case 'rtl': return this.S.ARD != 'ttb' ? { 'left':   1 , 'right': -1 , 'top': '-1', 'bottom': '1' } : { 'left':  '1', 'right':'-1', 'top':  -1 , 'bottom':  1  };
        } })();
    }

    probe(L_A, AXIS) {
        const LR_RL = ['left', 'right']; if(this.S.PPD != 'ltr') LR_RL.reverse();
        if(AXIS == 'horizontal') {
            this._app(L_A, 'BASE', { b: LR_RL[0], a: LR_RL[1], s: 'top', e: 'bottom' });
            this._app(L_A, 'SIZE', { b: 'height', l: 'width'                         });
            this._app(L_A, 'OOBL', { b: 'top',    l: 'left'                          });
            this._app(L_A, 'OEBL', { b: 'bottom', l: 'right'                         });
            this._app(L_A, 'AXIS', { b: 'y',      l: 'x'                             }); this[L_A + '_AXIS_D'] = this.S.PPD == 'ltr' ? 1 : -1;
        } else {
            this._app(L_A, 'BASE', { b: 'top', a: 'bottom', s: LR_RL[0], e: LR_RL[1] });
            this._app(L_A, 'SIZE', { b: 'width',  l: 'height'                        });
            this._app(L_A, 'OOBL', { b: 'left',   l: 'top'                           });
            this._app(L_A, 'OEBL', { b: 'right',  l: 'bottom'                        });
            this._app(L_A, 'AXIS', { b: 'x',      l: 'y'                             }); this[L_A + '_AXIS_D'] = 1;
        }
        // BASE: Directions ("B"efore-"A"fter-"S"tart-"E"nd. Top-Bottom-Left-Right on TtB, Left-Right-Top-Bottom on LtR, and Right-Left-Top-Bottom on RtL.)
        // SIZE: Breadth, Length (Width-Height on TtB, Height-Width on LtR and RtL.)
        // OOBL: "O"ffset "O"rigin of "B"readth and "L"ength
        // OOBL: "O"ffset "E"nd of "B"readth and "L"ength
        // AXIS: X or Y for Breadth and Length (X-Y on TtB, Y-X on LtR and RtL), and ±1 for Culcuration of Length (1 on TtB and LtR, -1 on RtL.)
    }

    _app(L_A, Gauge, Par) {
        for(const Pro in Par) this[[L_A, Gauge,                Pro ].join('_')] =                Par[Pro] ,
                              this[[L_A, Gauge, sML.capitalise(Pro)].join('_')] = sML.capitalise(Par[Pro]);
    }

    d2d(Dir, AOD) { const Dist = this.DDD[Dir]; return AOD ? Dist * 1 : typeof Dist == 'number' ? Dist : 0; } // d2d: Direction to Distance // AOD: Allow Orthogonal Direction
}
