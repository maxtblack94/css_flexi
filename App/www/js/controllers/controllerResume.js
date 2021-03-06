angular.module('starter').controller('ResumeCtrl', function(ManipolationServices, $filter, ScriptServices, $timeout, $cordovaDatePicker, $scope, InfoFactories, $state, $ionicLoading, PopUpServices) {
    InfoFactories.setTelepass(false);
    InfoFactories.setCC(false);
    $scope.selectedParking = InfoFactories.getPark();
    $scope.selectedClient = InfoFactories.getClientSelected();
    $scope.selectedDriverRange = InfoFactories.getSelectedRangeDriver();
    $scope.selectedVehicleType = InfoFactories.getSelectedVehicleType();
    $scope.dateTimeFrom = InfoFactories.getDateTimeFrom();
    $scope.dateTimeTo = InfoFactories.getDateTimeTo();
    
    if($scope.selectedClient.drivingRange){
        $ionicLoading.show();
        ScriptServices.directWithOutScriptID(610).then(function (data) {
            $scope.listDriverRange = data.ListDriverRange;
            $ionicLoading.hide();
        }, function (error) {
            PopUpServices.errorPopup($filter('translate')('bookResume.noDataFound'), "1");
            $ionicLoading.hide();
        })
    }

    if($scope.selectedClient.vehicleType && $scope.selectedParking){
        $ionicLoading.show();
        ScriptServices.getXMLResource(592).then(function(res) {
            res = res.replace('{IDPARK}', $scope.selectedParking.Nr);
            ScriptServices.callGenericService(res, 592).then(function(data) {
                $scope.vehicleTypeList = data.typeList;
                if($scope.vehicleTypeList.length === 0){
                    PopUpServices.messagePopup($filter('translate')('bookResume.vehicleTypesNotFound'), "Info");
                }
                $ionicLoading.hide();
            }, function(error) {
                $ionicLoading.hide();
                PopUpServices.errorPopup($filter('translate')('bookResume.vehicleTypesNotFound'), "1");
            })
        });
    }

    $scope.setHasCC = function() {
        $scope.hasCC = !$scope.hasCC;
        InfoFactories.setCC($scope.hasCC);
    };
  
    $scope.setHasTelepass = function() {
        $scope.hasTelepass = !$scope.hasTelepass;
        InfoFactories.setTelepass($scope.hasTelepass);
    };
    $scope.changeParking = function() {
        $state.go('tab.parking');
    };
    
    $scope.searchVehicle = function() {
        if(datesCheck()){
            if($scope.selectedClient.drivingRange){
                InfoFactories.setSelectedRangeDriver($scope.selectedDriverRange);
            }
            if($scope.selectedClient.vehicleType){
                InfoFactories.setSelectedVehicleType($scope.selectedVehicleType);
            }
            $state.go('tab.selcar');
        }
    };

    function datesCheck (){
        if(!$scope.selectedParking){
            PopUpServices.errorPopup($filter('translate')('bookResume.wrongParking'), "1");
            return false;
        }
        if(!$scope.dateTimeTo || !$scope.dateTimeFrom){
            PopUpServices.errorPopup($filter('translate')('bookResume.wrongDates'), "1");
            return false;
        }else{
            var dateTimeTo = new Date($scope.dateTimeTo);
            var dateTimeFrom = new Date($scope.dateTimeFrom)
            if(new Date() - dateTimeFrom > 0){
                PopUpServices.errorPopup($filter('translate')('bookResume.returnDateNeedToBeMajor'), "1");
                return false;
            }else if((dateTimeTo - dateTimeFrom) < 0){
                PopUpServices.errorPopup($filter('translate')('bookResume.returnDateIsMajor'), "1");
                return false;
            }else if(!$scope.selectedParking.h24){
                if(!((dateTimeFrom.getHours() >= $scope.selectedParking.opening.getHours()) && (dateTimeFrom.getHours() < $scope.selectedParking.closing.getHours()))){
                    PopUpServices.errorPopup($filter('translate')('bookResume.returnDateIsOut'), "1");
                    return false;
                }else if(!((dateTimeTo.getHours() >= $scope.selectedParking.opening.getHours()) && (dateTimeTo.getHours() < $scope.selectedParking.closing.getHours()))){
                    PopUpServices.errorPopup($filter('translate')('bookResume.isNotInTime'), "1");
                    return false;
                }
            }
            if($scope.selectedClient.drivingRange == true && $scope.selectedDriverRange.value == "short"){
                PopUpServices.errorPopup($filter('translate')('bookResume.defineRange'), "1");
                return false;
            }else if($scope.selectedClient.vehicleType == true && !$scope.selectedVehicleType.value && $scope.vehicleTypeList){
                PopUpServices.errorPopup($filter('translate')('bookResume.missingVehicleType'), "1");
                return false;
            }
            if(InfoFactories.getUserInfo() && InfoFactories.getUserInfo().registry && InfoFactories.getUserInfo().registry.time_of_booking){
                var days = InfoFactories.getUserInfo().registry.time_of_booking;
                var maxDate;
                if(days === "0"){
                    maxDate = new Date($scope.dateTimeFrom).setHours(23,59,59,0);
                }else{
                    maxDate = new Date($scope.dateTimeFrom)
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
            InfoFactories.setDateTimeTo($scope.dateTimeTo);
        }else if(type == 'from'){
            if(new Date(Date.now() + 60000 * 10) - newDate > 0){
                newDate = ManipolationServices.resetDateService(newDate);
            }else{
                newDate = ManipolationServices.resetDateForDefect(newDate);
            };
            $scope.dateTimeFrom = newDate;
            InfoFactories.setDateTimeFrom($scope.dateTimeFrom);
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
    };

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
    };
})