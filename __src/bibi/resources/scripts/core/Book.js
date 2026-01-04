export default class Book {
    constructor() {
        this.Path = '';
        this.PathDelimiter = ' > ';
        this.DataElement = null;
        this.Container = { Source: { Path: 'META-INF/container.xml' } };
        this.Package = { Source: {}, Metadata: {}, Manifest: {}, Spine: [] };
        this.Nav = {};
        this.CoverImage = {};
        this.FileDigit = 0;
    }
}
