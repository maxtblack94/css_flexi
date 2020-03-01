angular.module('starter').controller('PromoCtrl', function(ScriptServices, $scope, PopUpServices, $ionicLoading, InfoFactories, $filter) {
    $scope.selectedClient = InfoFactories.getClientSelected();
    $scope.request = {};
    $scope.promotions = [];
    
    function init(params) {
        getActivePromotions();
    }

    $scope.refreshActivePromo = function(){
        $scope.$broadcast('scroll.refreshComplete');
        getActivePromotions();
    }
    
    function getActivePromotions(params) {
        $ionicLoading.show();
        $scope.promotions = [];
        ScriptServices.getXMLResource(679).then(function(res) {
            var driverNumber = InfoFactories.getUserInfo().driverNumber;
            res = res.replace('{DRIVERNUMBER}', driverNumber);
            ScriptServices.callGenericService(res, 679).then(function(data) {
                if (data.data) {
                    $scope.promotions.push(data.data);
                }
                $ionicLoading.hide();
            }, function(error) {
                $ionicLoading.hide();
                PopUpServices.errorPopup($filter('translate')('commons.retry'));
            });
        });
    }
    
    $scope.addPromo = function () {
        $ionicLoading.show();
        ScriptServices.getXMLResource(678).then(function(res) {
            var driverNumber = InfoFactories.getUserInfo().driverNumber;
            res = res.replace('{PROMOCODE}', $scope.request.promoCode)
            .replace('{DRIVERNUMBER}', driverNumber);
            ScriptServices.callGenericService(res, 678).then(function(data) {
                $ionicLoading.hide();
                if (data.retcode && data.retcode === 3) {
                    PopUpServices.messagePopup($filter('translate')("commons.messagePromoAlreadyExists"), $filter('translate')('commons.attention'));
                } else if(data.retcode && data.retcode === 2) {
                    PopUpServices.messagePopup($filter('translate')("commons.messagePromoCodeInvalid"), $filter('translate')('commons.attention'));
                } else {
                    PopUpServices.messagePopup($filter('translate')("commons.messagePromoCodeSuccess"),$filter('translate')('commons.success'));
                    getActivePromotions();
                }
                
            }, function(error) {
                $ionicLoading.hide();
                PopUpServices.errorPopup($filter('translate')('commons.retry'));
            });
        });
    };



    init();

});