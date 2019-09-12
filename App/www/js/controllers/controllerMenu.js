angular.module('starter').controller('MenuCtrl', function($ionicSideMenuDelegate, $rootScope, $scope, $http, $state, $ionicLoading, InfoFactories, ScriptServices) {
    $scope.selectedClient = InfoFactories.getClientSelected();
    $scope.userInfo = InfoFactories.getUserInfo();

    $scope.logout = function() {
        $ionicSideMenuDelegate.toggleLeft(false);
    	var driverNumber = InfoFactories.getUserInfo().driverNumber;
    	window.localStorage.removeItem('userInfo');
        $ionicLoading.show();
        ScriptServices.getXMLResource(569).then(function(res) {
            res = res.replace('{USER_ID}', driverNumber);
            $ionicLoading.hide();
            ScriptServices.callGenericService(res, 569);
            InfoFactories.resetService();
            $state.go('login');
        });
    };

    $scope.getUserInfo  = function() {
        $scope.userInfo = InfoFactories.getUserInfo();
        return true;
    };

    $scope.chargeOn = function () {
        return InfoFactories.isRegionalGold();
    }

    $scope.editAccount = function() {
        $state.go('completeRegistration', {isEdit: true});
    }
})