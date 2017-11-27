(function () {
    'use strict';

    /**
     * @param Base
     * @param $scope
     * @param {ModalManager} modalManager
     * @return {TokensCtrl}
     */
    const controller = function (Base, $scope, modalManager) {

        class TokensCtrl extends Base {

            constructor() {
                super($scope);
                /**
                 * Token name
                 * @type {string}
                 */
                this.name = '';
                /**
                 * Token description
                 * @type {string}
                 */
                this.description = '';
                /**
                 * Can reissue this token
                 * @type {boolean}
                 */
                this.issue = true;
                /**
                 * Count of generated tokens
                 * @type {BigNumber}
                 */
                this.count = null;
                /**
                 * Precision of token
                 * @type {BigNumber}
                 */
                this.precision = null;
            }

            generate() {
                const precision = Number(this.precision.toString());

                modalManager.showCustomModal({
                    ns: 'app.tokens',
                    controller: 'TokenGenerateModalCtrl',
                    titleContent: '{{$ctrl.title}}',
                    mod: 'tokens-generate-modal',
                    contentUrl: 'modules/tokens/templates/generate.modal.html',
                    locals: {
                        shownAmount: this.count.toFormat(precision),
                        amount: this.count.toFixed(precision),
                        name: this.name,
                        issue: this.issue,
                        precision
                    }
                });
            }

        }

        return new TokensCtrl();
    };

    controller.$inject = ['Base', '$scope', 'modalManager'];

    angular.module('app.tokens')
        .controller('TokensCtrl', controller);
})();

