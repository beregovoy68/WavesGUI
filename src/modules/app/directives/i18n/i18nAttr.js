(function () {
    'use strict';

    /**
     * @param {JQuery} $element
     * @param {object} $attrs
     * @param {app.i18n} i18n
     * @param {$rootScope.Scope} $scope
     * @return {{listener: null, $postLink: (function()), $onDestroy: (function())}}
     */
    const controller = function ($element, $attrs, i18n, $scope) {
        return {
            listener: null,
            $postLink() {

                const ns = i18n.getNs($element);
                const list = $attrs.wI18nAttr.split(' ');
                const hash = list.reduce((result, attrName) => {
                    result[attrName] = $element.attr(attrName);
                    return result;
                }, Object.create(null));
                const listener = function () {
                    Object.keys(hash).forEach((attrName) => {
                        const literal = hash[attrName];
                        const params = $scope.attrParams || Object.create(null);
                        const value = i18n.translate(literal, ns, params[attrName]);
                        $element.attr(attrName, value);
                    });
                };
                listener();
                this.listener = listener;
                i18next.on('languageChanged', listener);
                this.stopWatch = $scope.$watch('attrParams', listener);
            },
            $onDestroy() {
                i18next.off('languageChanged', this.listener);
                this.stopWatch();
            }
        };
    };

    controller.$inject = ['$element', '$attrs', 'i18n', '$scope'];

    angular.module('app')
        .directive('wI18nAttr', () => {
            return {
                scope: {
                    attrParams: '<'
                },
                restrict: 'A',
                controller: controller
            };
        });
})();
