export default class Messages {
    constructor() {}
    
    initialize(O, S, E) {
        this.O = O;
        this.S = S;
        this.E = E;
    }

    judge = (Msg, Origin) => (this.O.ParentBibi && Msg && typeof Msg == 'string' && Origin && typeof Origin == 'string' && this.S['trustworthy-origins'].includes(Origin));

    post = (Msg) => !this.judge(Msg, this.O.ParentOrigin) ? false : window.parent.postMessage(Msg, window.parent.location.origin);

    receive = (Eve) => {
        if(!Eve || !this.judge(Eve.data, Eve.origin)) return false; try {
        const Data = JSON.parse(Eve.data);
        if(!Data || typeof Data != 'object') return false;
        for(const EventName in Data) if(/^bibi:commands:/.test(EventName)) this.E.dispatch(EventName, Data[EventName]);
        return true; } catch(Err) {} return false;
    };
}
