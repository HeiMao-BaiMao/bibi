import sML from 'sml.js';

export default class Catcher {
    constructor(I) {
        this.I = I;
        const Bibi = I.Bibi; const O = I.O; const S = I.S; const E = I.E; const R = I.R; const L = I.L;
        this.I.Catcher = { create: () => { if(S['book-data'] || S['book'] || !S['accept-local-file']) return;
        const Catcher = this.I.Catcher = O.Body.appendChild(sML.create('div', { id: 'bibi-catcher' }));
        Catcher.insertAdjacentHTML('afterbegin', this.I.distillLabels.distillLanguage.call(this.I, {
        default: [
        `<div class="pgroup" lang="en">`,
        `<p><strong>Pass Me Your EPUB File!</strong></p>`,
        `<p><em>You Can Open Your Own EPUB.</em></p>`,
        `<p><span>Please ${ O.TouchOS ? 'Tap Screen' : 'Drag & Drop It Here. <br />Or Click Screen' } and Choose It.</span></p>`,
        `<p><small>(Open in Your Device without Uploading)</small></p>`,
        `</div>`
        ].join(''),
        ja: [
        `<div class="pgroup" lang="ja">`,
        `<p><strong>EPUBファイルをここにください！</strong></p>`,
        `<p><em>お持ちの EPUB ファイルを<br />開くことができます。</em></p>`,
        `<p><span>${ O.TouchOS ? '画面をタップ' : 'ここにドラッグ＆ドロップするか、<br />画面をクリック' }して選択してください。</span></p>`,
        `<p><small>（外部に送信されず、この端末の中で開きます）</small></p>`,
        `</div>`
        ].join('')
        })[O.Language]);
        Catcher.title = Catcher.querySelector('span').innerHTML.replace(/<br( ?\/)?>/g, '\n').replace(/<[^>]+>/g, '').trim();
        Catcher.Input = Catcher.appendChild(sML.create('input', { type: 'file' }));
        if(!S['extract-if-necessary'].includes('*') && S['extract-if-necessary'].length) {
        const Accept = [];
        if(S['extract-if-necessary'].includes('.epub')) {
        Accept.push('application/epub+zip');
        }
        if(S['extract-if-necessary'].includes('.zip')) {
        Accept.push('application/zip');
        Accept.push('application/x-zip');
        Accept.push('application/x-zip-compressed');
        }
        if(Accept.length) Catcher.Input.setAttribute('accept', Accept.join(','));
        }
        Catcher.Input.addEventListener('change', Eve => {
        let FileData = {};  try { FileData = Eve.target.files[0]; } catch(_) {}
        Bibi.getBookData.resolve({ BookData: FileData });
        });
        Catcher.addEventListener('click', Eve => Catcher.Input.click(Eve));
        if(!O.TouchOS) {
        Catcher.addEventListener('dragenter', Eve => { Eve.preventDefault(); O.HTML.classList.add(   'dragenter'); }, 1);
        Catcher.addEventListener('dragover',  Eve => { Eve.preventDefault();                                       }, 1);
        Catcher.addEventListener('dragleave', Eve => { Eve.preventDefault(); O.HTML.classList.remove('dragenter'); }, 1);
        Catcher.addEventListener('drop',      Eve => { Eve.preventDefault();
        let FileData = {};  try { FileData = Eve.dataTransfer.files[0]; } catch(_) {}
        Bibi.getBookData.resolve({ BookData: FileData });
        }, 1);
        }
        Catcher.appendChild(this.I.getBookIcon());
        E.dispatch('bibi:created-catcher');
        }};
    }
}
