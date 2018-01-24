(function () {
    'use strict';

    /**
     * @param {Base} Base
     * @param $scope
     * @param {Waves} waves
     * @param {app.utils} utils
     * @param {ModalManager} modalManager
     * @param {User} user
     * @param {EventManager} eventManager
     * @param {Function} createPoll
     * @param {GatewayService} gatewayService
     * @return {PortfolioCtrl}
     */
    const controller = function (Base, $scope, waves, utils, modalManager, user,
                                 eventManager, createPoll, gatewayService) {

        class PortfolioCtrl extends Base {

            constructor() {
                super($scope);
                /**
                 * @type {Money[]}
                 */
                this.portfolioBalances = [];
                /**
                 * @type {string}
                 */
                this.mirrorId = null;
                /**
                 * @type {Asset}
                 */
                this.mirror = null;
                /**
                 * @type {string[]}
                 */
                this.pinnedAssetIdList = null;
                /**
                 * @type {string}
                 */
                this.wavesId = WavesApp.defaultAssets.WAVES;


                this.syncSettings({ pinnedAssetIdList: 'pinnedAssetIdList' });

                this.mirrorId = user.getSetting('baseAssetId');
                waves.node.assets.info(this.mirrorId)
                    .then((mirror) => {
                        this.mirror = mirror;
                    });

                createPoll(this, this._getPortfolio, 'portfolioBalances', 3000, { isBalance: true });
            }

            /**
             * @param {Asset} asset
             */
            showAsset(asset) {
                modalManager.showAssetInfo(asset);
            }

            /**
             * @param {Asset} asset
             */
            showSend(asset) {
                return modalManager.showSendAsset(user, asset || Object.create(null));
            }

            /**
             * @param {Asset} asset
             */
            showDeposit(asset) {
                return modalManager.showDepositAsset(user, asset);
            }

            /**
             * @param {Asset} asset
             */
            showSepa(asset) {
                return modalManager.showSepaAsset(user, asset);
            }

            showQR() {
                return modalManager.showAddressQrCode(user);
            }

            pinAsset(asset, state) {
                asset.pinned = state;

                if (state === true && !this._isPinned(asset.id)) {
                    const list = this.pinnedAssetIdList.slice();
                    list.push(asset.id);
                    this.pinnedAssetIdList = list;
                } else if (state === false && this._isPinned(asset.id)) {
                    const list = this.pinnedAssetIdList.slice();
                    list.splice(this.pinnedAssetIdList.indexOf(asset.id), 1);
                    this.pinnedAssetIdList = list;
                }
            }

            isDepositSupported(asset) {
                return gatewayService.hasSupportOf(asset, 'deposit');
            }

            isSepaSupported(asset) {
                return gatewayService.hasSupportOf(asset, 'sepa');
            }

            /**
             * @return {Promise<Money[]>}
             * @private
             */
            _getPortfolio() {
                // TODO : request both userBalances() and balanceList(this.pinnedAssetIdList) @xenohunter
                // TODO : move pinned assets to top from assets list @tsigel
                return waves.node.assets.userBalances()
                    .then(this._checkAssets())
                    .then((balancesList) => {
                        return balancesList.map((balance) => {
                            if (this._isPinned(balance.asset.id)) {
                                balance.asset.pinned = true;
                            }

                            return balance;
                        });
                    });
            }

            /**
             * @return {function(*=)}
             * @private
             */
            _checkAssets() {
                return (assets) => {
                    return PortfolioCtrl._isEmptyBalance(assets) ?
                        waves.node.assets.balanceList(this.pinnedAssetIdList) :
                        assets;
                };
            }

            _isPinned(assetId) {
                return this.pinnedAssetIdList.indexOf(assetId) !== -1;
            }

            /**
             * @param {Array} list
             * @return {boolean}
             * @private
             */
            static _isEmptyBalance(list) {
                return list.length === 0;
            }

        }

        return new PortfolioCtrl();
    };

    controller.$inject = [
        'Base',
        '$scope',
        'waves',
        'utils',
        'modalManager',
        'user',
        'eventManager',
        'createPoll',
        'gatewayService'
    ];

    angular.module('app.wallet.portfolio')
        .controller('PortfolioCtrl', controller);
})();
