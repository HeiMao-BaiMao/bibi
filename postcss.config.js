module.exports = (api) => {
    const options = api.options?.ctx || {};
    const plugins = [];
    
    // Use autoprefixer instead of deprecated postcss-cssnext
    if(options['postcss-cssnext'] || options['autoprefixer']) {
        const autoprefixer = require('autoprefixer');
        const browsers = options['postcss-cssnext'] || options['autoprefixer'];
        plugins.push(autoprefixer({ overrideBrowserslist: Array.isArray(browsers) ? browsers : undefined }));
    }
    
    if(options['cssnano']) {
        const cssnano = require('cssnano');
        plugins.push(cssnano(options['cssnano']));
    }
    
    return {
        parser: false,
        plugins: plugins
    };
};