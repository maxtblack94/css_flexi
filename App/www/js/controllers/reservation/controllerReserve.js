angular.module('starter').controller('ReserveCtrl', function(ReservationService, $ionicHistory, ManipolationServices, $filter, ScriptServices, $timeout, $cordovaDatePicker, $scope, InfoFactories, $state, $ionicLoading, PopUpServices) {
    $scope.selectedClient = InfoFactories.getClientSelected();
    $scope = Object.assign($scope, ReservationService.instance);
    $scope.selectedTarif.value = {};

    if($scope.selectedClient.drivingRange){
        $ionicLoading.show();
        ScriptServices.directWithOutScriptID(610).then(function (data) {
            $scope.listDriverRange = data.ListDriverRange;
            $ionicLoading.hide();
        }, function (error) {
            PopUpServices.errorPopup($filter('translate')('bookResume.noDataFound'), "1");
            $ionicLoading.hide();
        });
    }

    if($scope.selectedClient.vehicleType && $scope.selectedPark){
        $ionicLoading.show();
        $scope.vehicleTypeList = [];
        ScriptServices.getXMLResource(592).then(function(res) {
            res = res.replace('{IDPARK}', $scope.selectedPark.Nr);
            ScriptServices.callGenericService(res, 592).then(function(data) {
                $scope.vehicleTypeList = (data.typeList || []);
                if($scope.vehicleTypeList.length === 0){
                    PopUpServices.messagePopup($filter('translate')('bookResume.vehicleTypesNotFound'), "Info");
                }
                $ionicLoading.hide();
            }, function(error) {
                $ionicLoading.hide();
                PopUpServices.errorPopup($filter('translate')('bookResume.vehicleTypesNotFound'), "1");
            });
        });
    }

    $scope.setHasCC = function(cc) {
        ReservationService.setCC(cc);
    };

    $scope.setHasTelepass = function(telepass) {
        ReservationService.setTelepass(telepass);
    };
    
    $scope.searchVehicle = function() {
        console.log('cerca veicoli');
        if(datesCheck()){
            if($scope.selectedClient.vehicleType){
                ReservationService.setVehicleType($scope.selectedClient.vehicleType);
            }

            if ($scope.selectedTarif.value.id) {
                ReservationService.setTarif($scope.selectedTarif);
                $state.go('vehicles');
            } else if (!$scope.selectedTarif.value.id && $scope.selectedService.tarifs.length) {
                PopUpServices.errorPopup($filter('translate')('commons.selectTarif'), "1");
            } else {
                $state.go('vehicles');
            }
            
        }
    };



    checkErrorTarifTime = function (dateTimeTo, dateTimeFrom) {
        var tarif = $scope.selectedTarif.value;
        if (tarif.opening) {
            var tarifTmp = {
                opening: new Date(moment('12/10/2020' + ' ' + tarif.opening, 'DD/MM/YYYY HH:mm:ss')),
                closing: new Date(moment('12/10/2020' + ' ' + tarif.closing, 'DD/MM/YYYY HH:mm:ss'))
            };
            if (!(tarifTmp.opening.getHours() <= dateTimeFrom.getHours() && dateTimeFrom.getHours() < tarifTmp.closing.getHours()) ) {
                PopUpServices.errorPopup($filter('translate')('bookResume.subscriptionIncompatible'), "1");
                return true;
            } else if(!(tarifTmp.opening.getHours() <= dateTimeTo.getHours() && dateTimeTo.getHours() < tarifTmp.closing.getHours())) {
                PopUpServices.errorPopup($filter('translate')('bookResume.subscriptionIncompatible'), "1");
                return true;
            }

            /* if(dateTimeTo.getHours() < tarifTmp.opening.getHours() || dateTimeTo.getHours() > tarifTmp.closing.getHours()){
                PopUpServices.errorPopup($filter('translate')('bookResume.subscriptionIncompatible'), "1");
                return true;
            } else if(!(dateTimeFrom.getHours() >= tarifTmp.opening.getHours()) && (dateTimeFrom.getHours() < tarifTmp.closing.getHours())){
                PopUpServices.errorPopup($filter('translate')('bookResume.isNotInTime'), "1");
                return true;
            } */
            return false;
        } else {
            return false;
        }
    };

    $scope.changeParking = function(park) {
        $state.go('park', { parkDirection: park});
    };

    function datesCheck (){
        if(!$scope.selectedPark){
            PopUpServices.errorPopup($filter('translate')('bookResume.wrongParking'), "1");
            return false;
        }
        if(!$scope.dateTimeTo || !$scope.dateTimeFrom){
            PopUpServices.errorPopup($filter('translate')('bookResume.wrongDates'), "1");
            return false;
        }else{
            var dateTimeTo = new Date($scope.dateTimeTo);
            var dateTimeFrom = new Date($scope.dateTimeFrom);
            if(new Date() - dateTimeFrom > 0){
                PopUpServices.errorPopup($filter('translate')('bookResume.returnDateNeedToBeMajor'), "1");
                return false;
            }else if((dateTimeTo - dateTimeFrom) < 0){
                PopUpServices.errorPopup($filter('translate')('bookResume.returnDateIsMajor'), "1");
                return false;
            }else if(!$scope.selectedPark.h24){
                if(!((dateTimeFrom.getHours() >= $scope.selectedPark.opening.getHours()) && (dateTimeFrom.getHours() < $scope.selectedPark.closing.getHours()))){
                    PopUpServices.errorPopup($filter('translate')('bookResume.returnDateIsOut'), "1");
                    return false;
                }else if(!((dateTimeTo.getHours() >= $scope.selectedPark.opening.getHours()) && (dateTimeTo.getHours() < $scope.selectedPark.closing.getHours()))){
                    PopUpServices.errorPopup($filter('translate')('bookResume.isNotInTime'), "1");
                    return false;
                }else if(!((dateTimeFrom.getHours() >= $scope.selectedPark.opening.getHours()) && (dateTimeFrom.getHours() < $scope.selectedPark.closing.getHours()))){
                    PopUpServices.errorPopup($filter('translate')('bookResume.isNotInTime'), "1");
                    return false;
                }
                // controllo date subscription
            }
            if(checkErrorTarifTime(dateTimeTo, dateTimeFrom)) {
                return false;
            }
            if($scope.selectedClient.drivingRange == true && $scope.selectedService.parkingTypeCode !== "BT2" && $scope.driverRange.value.code == "short"){
                PopUpServices.errorPopup($filter('translate')('bookResume.defineRange'), "1");
                return false;
            }else if($scope.selectedClient.vehicleType == true && !$scope.vehicleType && $scope.vehicleTypeList){
                PopUpServices.errorPopup($filter('translate')('bookResume.missingVehicleType'), "1");
                return false;
            }
            if(InfoFactories.getUserInfo() && InfoFactories.getUserInfo().registry && InfoFactories.getUserInfo().registry.time_of_booking){
                var days = InfoFactories.getUserInfo().registry.time_of_booking;
                var maxDate;
                if(days === "0"){
                    maxDate = new Date($scope.dateTimeFrom).setHours(23,59,59,0);
                }else{
                    maxDate = new Date($scope.dateTimeFrom);
                    maxDate = moment(maxDate).add('days', days);
                }
                if(maxDate < new Date($scope.dateTimeTo)){
                    PopUpServices.errorPopup($filter('translate')('bookResume.returnDateHaveToBe') +moment(maxDate).format('DD/MM/YYYY HH:mm'), "1");
                    return false;
                }
            }
            return true;
        }
        
    }

    function fixDateTime (date, time, type){
        var hours = new Date(time).getHours();
        var minutes = new Date(time).getMinutes();
        var newDate = new Date(date).setHours(hours,minutes,0,0);
        if(type == 'to'){
            var dateFrom = $scope.dateTimeFrom ? $scope.dateTimeFrom : undefined;
            $scope.dateTimeTo = ManipolationServices.resetDateForDefect(newDate, dateFrom);
            ReservationService.setDateTimeTo($scope.dateTimeTo);
        }else if(type == 'from'){
            if(new Date(Date.now() + 60000 * 10) - newDate > 0){
                newDate = ManipolationServices.resetDateService(newDate);
            }else{
                newDate = ManipolationServices.resetDateForDefect(newDate);
            };
            $scope.dateTimeFrom = newDate;
            ReservationService.setDateTimeFrom($scope.dateTimeFrom);
        }
    }

    $scope.selectFromDate = function() {
        var dateFromConfig = {
            date: $scope.dateTimeFrom ? new Date($scope.dateTimeFrom) : new Date(),
            mode: 'date',
            allowOldDates: false,
            allowFutureDates: true,
            androidTheme: 4,
            doneButtonLabel: $filter('translate')('commons.select'),
            cancelButtonLabel: $filter('translate')('commons.close'),
            cancelButtonColor: '#000000',
            locale: navigator.language
        };
        
        $cordovaDatePicker.show(dateFromConfig).then(function(date) {
            if(date){
                $timeout(function() {
                    selectFromTime(date);
                }, 300);
            }            
        });
    };
    
    function selectFromTime (date) {
        var timeFromConfig = {
            date: $scope.dateTimeFrom ? new Date($scope.dateTimeFrom) : new Date(),
            mode: 'time',
            is24Hour: true,
            androidTheme: 2,
            allowOldDates: true,
            allowFutureDates: true,
            doneButtonLabel: $filter('translate')('commons.select'),
            cancelButtonLabel: $filter('translate')('commons.close'),
            cancelButtonColor: '#000000',
            locale: navigator.language
        };
        
        $cordovaDatePicker.show(timeFromConfig).then(function(time) {
            if(time){
                fixDateTime(date, time, 'from');
            }
        });
    }

    $scope.selectToDate = function() {
            
        var dateToConfig = {
            date: $scope.dateTimeFrom ? new Date($scope.dateTimeFrom) : $scope.dateTimeTo ? new Date($scope.dateTimeTo) : new Date(),
            mode: 'date',
            androidTheme: 4,
            allowOldDates: false,
            allowFutureDates: true,
            doneButtonLabel: $filter('translate')('commons.select'),
            cancelButtonLabel: $filter('translate')('commons.close'),
            cancelButtonColor: '#000000',
            locale: navigator.language
        };
        
        $cordovaDatePicker.show(dateToConfig).then(function(date) {
            if(date){
                $timeout(function() {
                    selectToTime(date);
                }, 500)
            }
        });
    };
    
    function selectToTime (date) {
        var timeToConfig = {
            date: $scope.dateTimeFrom ? new Date($scope.dateTimeFrom) : $scope.dateTimeTo ? new Date($scope.dateTimeTo) : new Date(),
            mode: 'time',
            is24Hour: true,
            androidTheme: 2,
            allowOldDates: true,
            allowFutureDates: true,
            doneButtonLabel: $filter('translate')('commons.select'),
            cancelButtonLabel: $filter('translate')('commons.close'),
            cancelButtonColor: '#000000',
            locale: navigator.language
        };
        
        $cordovaDatePicker.show(timeToConfig).then(function(time) {
            if(time){
                fixDateTime(date, time, 'to');
            }
        });

    }

    $scope.cancel = function () {
        ReservationService.resetReservation();
        $state.go('tab.bookings');
    };

    $scope.back = function (params) {
        if ($scope.user && $scope.user.registry && scope.user.registry.services.length > 1) {
            $ionicHistory.goBack();
        } else {
            $scope.cancel(); 
        }
        
     };
 });