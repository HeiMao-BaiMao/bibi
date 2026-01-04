export default class DocSettings {
    constructor() {}
    
    initialize(Bibi) {
        const Bookshelf = document.getElementById('bibi-preset').getAttribute('data-bibi-bookshelf');
        if(Bookshelf) {
            this['bookshelf'] = new URL(Bookshelf, location.href.split('?')[0]);
        }
        const Book = document.body.getAttribute('data-bibi-book');
        if(Book) {
            this['book'] = document.body.getAttribute('data-bibi-book');
        }
        const BookDataElement = document.getElementById('bibi-book-data');
        if(BookDataElement) {
            const BookData = BookDataElement.innerText.trim();
            if(BookData) {
                const BookDataMIMEType = BookDataElement.getAttribute('data-bibi-book-mimetype');
                if(/^application\/(epub\+zip|zip|x-zip(-compressed)?)$/i.test(BookDataMIMEType)) {
                    this['book-data']          = BookData;
                    this['book-data-mimetype'] = BookDataMIMEType;
                }
            }
            BookDataElement.innerHTML = '';
            BookDataElement.parentNode.removeChild(BookDataElement);
        }
        if(this['book'] || this['book-data']) {
            let HRef = location.href.replace(/([\?&])book=[^&]*&?/, '$1');
            if(!HRef.split('?')[1]) HRef = HRef.split('?')[0];
            history.replaceState(null, document.title, HRef);
        }
    }
}
