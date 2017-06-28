angular.module('starter').controller('CarCtrl', function(ManipolationServices, PopUpServices, $scope, $http, $rootScope, $state, InfoFactories, $timeout, $ionicLoading, $ionicPopup, WebService) {
    $scope.locale = window.locale;
    $scope.dateTimeFrom = InfoFactories.getDateTimeFrom();
    $scope.dateTimeTo = InfoFactories.getDateTimeTo();
    $scope.selectedClient = InfoFactories.getClientSelected();
    $scope.selectedParking = InfoFactories.getPark();
    $scope.hasTelepass  = InfoFactories.getTelepass();
    $scope.hasCC = InfoFactories.getCC();
    
    $scope.onSelect = function(car) {
        $state.go('confirmPrenotation', {'car':car});
    };

    $scope.goResume = function(){
        $state.go('tab.resume');
    }
    
     function loadVehicles () {
        $scope.vehicleList = null;
        var cc = !$scope.selectedClient.cc ? false : InfoFactories.getCC();
        var telepass = !$scope.selectedClient.telepass ? false : InfoFactories.getTelepass()
        $ionicLoading.show();
		$http.get("res/571.xml").success(function(res) {                                       
			res = res.replace('{NUMBER_PARKING}', InfoFactories.getPark().Nr)
					 .replace('{NUMBER_DRIVER}', InfoFactories.getUserInfo().driverNumber)
					 .replace('{DATE_FROM}', moment($scope.dateTimeFrom).format('DD/MM/YYYY'))
					 .replace('{DATE_TO}', moment($scope.dateTimeTo).format('DD/MM/YYYY'))
					 .replace('{TIME_FROM}', moment($scope.dateTimeFrom).format('HH:mm'))
					 .replace('{TIME_TO}', moment($scope.dateTimeTo).format('HH:mm'))
					 .replace('{CC}', cc)
					 .replace('{TELEPASS}', telepass)
					 .replace('{DRIVING_RANGE}', InfoFactories.getSelectedRangeDriver().value)
                     .replace('{VEHICLETYPE}', InfoFactories.getSelectedVehicleType().value);
            WebService.ajaxPostRequest(res, 571, function(data) {
                $scope.loading = false;
                $ionicLoading.hide();
                                       
                if(data.retcode == 2) {
                    PopUpServices.messagePopup($scope.locale.vehicle.labelCannotReserve, "Attenzione", callbackMissingRecords);
                }else if(data.retcode == 1 || data.retcode == 3){
                    PopUpServices.messagePopup("Nessun veicolo è al momento disponibile per il periodo da Te richiesto", "Attenzione", callbackMissingRecords);
                }else{
                    $scope.vehicleList = data.data.VehiclesList;
                    for(var i = 0; i < $scope.vehicleList.length; i++) {
                        $scope.vehicleList[i].fuel_quantity = ManipolationServices.trascodeFuel($scope.vehicleList[i].fuel_quantity);
                    }
                }
			});
		});
    };

    function callbackMissingRecords (){
        $state.go('tab.resume');
    }

	$scope.refreshCars = function(){
		$scope.vehicleList = null;
        loadVehicles();
        $scope.$broadcast('scroll.refreshComplete');
    }

    if(!$scope.dateTimeFrom || !$scope.dateTimeTo){
        $timeout(function() {
            $state.go('tab.resume');
        }, 200);
    }else{
        loadVehicles();
    }
})