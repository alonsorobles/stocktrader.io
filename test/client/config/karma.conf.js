basePath = '../';

files = [
    JASMINE,
    JASMINE_ADAPTER,
    '../../public/javascripts/vendor/angular.js',
    '../../public/javascripts/vendor/angular-*.js',
    'lib/angular/angular-mocks.js',
    '../../public/javascripts/**/*.js',
    'test/unit/**/*.js'
];

autoWatch = true;

browsers = ['Chrome'];

junitReporter = {
    outputFile: 'test_out/unit.xml',
    suite: 'unit'
};
