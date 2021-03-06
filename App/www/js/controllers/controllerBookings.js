angular.module('starter').controller('BookingsCtrl', function ($filter, ManipolationServices, PopUpServices, $cordovaGeolocation, $timeout, $cordovaDatePicker, $scope, $rootScope, InfoFactories, $state, $ionicPopup, $ionicLoading, ScriptServices) {
    $scope.selectedClient = InfoFactories.getClientSelected();
    $scope.userInfo = InfoFactories.getUserInfo();

    var favo = window.localStorage.getItem('favoriteParking') ? eval('(' + window.localStorage.getItem('favoriteParking') + ')') : null;
    if (favo) {
        InfoFactories.setPark(favo);
    }
    $scope.refreshBookings = function () {
        $scope.loadbookings();
        $scope.$broadcast('scroll.refreshComplete');
    }

    /*$scope.scheduleDelayedNotification = function (pnr) {
        var now = new Date().getTime();
        var _10SecondsFromNow = new Date(now + 10 * 1000);
      
        $cordovaLocalNotification.schedule({
            id: 1,
            title: "Segnala Ritardo Riconsegna",
            text: "Ti informiamo che per la tua prenotazione con PNR: "+ pnr +" non è ancora stata effettuata la riconsegna del veicolo. Se ritieni di ritardare, per cortesia quantifica e comunica il ritardo, tramite la funzione Segnala Ritardo (sezione Alert).",
            "data":{
                "eventName" : "gestioneRitardo"
            },
            every: 3,
            at: _10SecondsFromNow
      }).then(function (result) {
        console.log(result)
      });
    };
    scheduleDelayedNotification();*/
    
    $scope.loadbookings = function() {
        $ionicLoading.show();
        $scope.BookingsList = undefined;
        ScriptServices.getXMLResource(516).then(function (res) {
            var driver = InfoFactories.getUserInfo().driverNumber;
            res = res.replace('{DRIVER_NUMBER}', driver);
            ScriptServices.callGenericService(res, 516).then(function (data) {
                $scope.BookingsList = data.data.BookingsList;
                var blength = $scope.BookingsList.length;
                for (var i = 0; i < blength; i++) {
                    var obj = $scope.BookingsList[i];
                    obj.dateTimeTo = ManipolationServices.dateAndTimeAggregation(obj.return_date, obj.return_time);
                    obj.dateTimeFrom = ManipolationServices.dateAndTimeAggregation(obj.pickup_date, obj.pickup_time);
                    obj.cmb_fuel_quantity = ManipolationServices.trascodeFuel(obj.cmb_fuel_quantity);
                    if (obj.pickup_time_tollerance) {
                        
                        obj.pickup_time_tollerance = ManipolationServices.dateAndTimeAggregation(obj.pickup_date_tollerance, obj.pickup_time_tollerance);
                        if (new Date(obj.pickup_time_tollerance) <= new Date()) {
                            $scope.tolleranceCheck = true;
                            $rootScope.sosPnr = obj.status === "Collected"? obj.pnr:undefined;
                        }
                    }
                    if (obj.returnDateChanged && obj.return_time_tollerance) {
                        obj.return_time_tollerance = ManipolationServices.dateAndTimeAggregation(obj.return_date_tollerance, obj.return_time_tollerance);
                        obj.dateTimeTo = obj.return_time_tollerance;
                    }
                    $scope.BookingsList[i] = obj;
                }
                $ionicLoading.hide();
            }, function (error) {
                $ionicLoading.hide();
                PopUpServices.errorPopup(error);
            })
        });

    };

    function returnActions (){
        $scope.actions = {};
        $scope.actions.buttons = [];
        if($scope.selectedClient.delay){
            $scope.actions.buttons.push({ 
                text: ionic.Platform.isAndroid() ? '<i class="fa ion-android-time" aria-hidden="true"></i> ' + $scope.selectedClient.lbldelay || $filter('translate')('bookings.delay'): $scope.selectedClient.lbldelay || $filter('translate')('bookings.delay'), 
                type: "delay" 
            });
        }
        if($scope.selectedClient.changeDriver){
            $scope.actions.buttons.push({ 
                text: ionic.Platform.isAndroid() ? '<i class="fa fa-id-card-o" aria-hidden="true"></i>' +$filter('translate')('bookings.changeDriver') : $filter('translate')('bookings.changeDriver'), 
                type: "changeDriver" 
            });
        }
        if($scope.selectedClient.damage){
            $scope.actions.buttons.push({ 
                text: ionic.Platform.isAndroid() ? '<i class="fa fa-wrench" aria-hidden="true"></i> ' +$filter('translate')('bookings.damageHard') : $filter('translate')('bookings.damageHard'), 
                type: "damage" 
            });
        }
        if($scope.selectedClient.defect){
            $scope.actions.buttons.push({ 
                text: ionic.Platform.isAndroid() ? '<i class="fa fa-wrench" aria-hidden="true"></i> ' +$filter('translate')('bookings.damage'): $filter('translate')('bookings.damage'), 
                type: "defect" 
            });
        }
        if($scope.selectedClient.cleanness){
            $scope.actions.buttons.push({ 
                text: ionic.Platform.isAndroid() ? '<i class="fa fa-recycle" aria-hidden="true"></i> ' + $filter('translate')('bookings.cleaness'): $filter('translate')('bookings.cleaness'), 
                type: "cleanness"
            });
        }
    }

    returnActions();

    $scope.loadbookings();

    $scope.newBooking = function () {
        $state.go('tab.parking');
    };

    $scope.openCarManipolation = function (reservation, opT) {
        $ionicLoading.show();
        ScriptServices.getXMLResource(627).then(function (res) {
            res = res.replace('{PNR}', reservation.pnr);
            ScriptServices.callGenericService(res, 627).then(function (data) {
                var response = data.data.split(',');
                var carCoords = {
                    "lat": response[0],
                    "long": response[1]
                }
                startCloseOpenCarProcess(reservation, opT, carCoords);
            }, function (error) {
                $ionicLoading.hide();
                PopUpServices.errorPopup(error+ $filter('translate')('bookings.noCoords'));
            })
        });
    }

    function startCloseOpenCarProcess(reservation, opT, carCoords) {
        if (opT === "0") {
            var posOptions = { timeout: 10000, enableHighAccuracy: false };
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                var lat = position.coords.latitude
                var long = position.coords.longitude
                var proximityResult = checkProximity(carCoords, { "lat": lat, "long": long }, opT);
                if (proximityResult) {
                    openCloseCar(reservation, opT);
                } else {
                    $ionicLoading.hide();
                    PopUpServices.errorPopup($filter('translate')('bookings.needProximity'), '1');
                }
            }, function (err) {
                $ionicLoading.hide();
                PopUpServices.errorPopup(err+ $filter('translate')('bookings.noYourCoords'), '1');
            });
        } else {
            var proximityResult = checkProximity(carCoords, { "lat": reservation.latP, "long": reservation.lngP }, opT);
            if (proximityResult) {
                openCloseCar(reservation, opT);
            } else {
                $ionicLoading.hide();
                PopUpServices.errorPopup($filter('translate')('bookings.needCurrectPark'), '1');
            }
        }
    }
    function checkProximity(carCoords, coordsCustom, type) {
        var configuredDistance = $scope.selectedClient.distanceRange || ($scope.userInfo.registry || {}).distanceRange || 0.20;
        var radlat1 = Math.PI * carCoords.lat / 180;
        var radlat2 = Math.PI * coordsCustom.lat / 180;
        var theta = carCoords.long - coordsCustom.long;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344;
        configuredDistance = angular.isString(configuredDistance) ? parseInt(configuredDistance) : configuredDistance;
        return dist < configuredDistance ? true : false;
    }

    function openCloseCar(reservation, opT) {
        $ionicLoading.show();
        var rollbackData = {"reservation": reservation, "opT":opT}
        ScriptServices.getXMLResource(621).then(function(res) {
            res = res.replace('{PNR_NUMBER}', reservation.pnr).replace('{OPERATION_TYPE}', opT);
            ScriptServices.callGenericService(res, 621).then(function(data) {
                $ionicLoading.hide();
                humanCheckCarOpened(rollbackData);
            }, function(error) {
                PopUpServices.errorPopup(error+ $filter('translate')('bookings.errorOpenCar'));
                $ionicLoading.hide();
            })
        });
    }

    function humanCheckCarOpened (rollbackData){
        var configObj = {
            "buttons": [{ 
                text: $filter('translate')('commons.close'),
                type: 'button-stable',
                onTap: function() {
                    $scope.loadbookings();
                }
            },{
                text: '<b>'+ $filter('translate')('commons.retry') +'</b>',
                type: 'button-positive',
                onTap: function() {
                    openCloseCar(rollbackData.reservation, rollbackData.opT);
                }
            }],
            "message" : rollbackData.opT === "0" ? $filter('translate')('bookings.humanCheckCarOpenMessage') : $filter('translate')('bookings.humanCheckCarCloseMessage'),
            "title" : $filter('translate')('bookings.humanCheckCarOpenTitle'),
            "subTitle" : $filter('translate')('bookings.humanCheckCarOpenSubTitle')
        }
        PopUpServices.buttonsPopup(configObj);
    }


    $scope.openBooking = function (object) {
        $state.go('tab.map', { pnrInfo: object });
    };

    $scope.delete = function (book) {
        var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('bookings.cancelConfirmTitle'),
            template: $filter('translate')('bookings.cancelConfirmBody'),
        });

        confirmPopup.then(function (res) {
            if (res) {
                if (!book) {
                    return;
                }
                $ionicLoading.show();
                ScriptServices.getXMLResource(553).then(function(res) {
                    res = res.replace('{BOOKING_NUMBER}', book.Nr);
                    ScriptServices.callGenericService(res, 553).then(function(data) {
                        $scope.loadbookings();
                    }, function(error) {
                       
                    })
                });
            }
        });
    };

    $scope.selectToDate = function () {
        var dateToConfig = {
            date: $scope.contextPnr.dateTimeTo ? new Date($scope.contextPnr.dateTimeTo) : new Date(),
            mode: 'date',
            allowOldDates: false,
            allowFutureDates: true,
            doneButtonLabel: $filter('translate')('commons.select'),
            cancelButtonLabel: $filter('translate')('commons.close'),
            cancelButtonColor: '#000000',
            locale: navigator.language
        };

        $cordovaDatePicker.show(dateToConfig).then(function (date) {
            if (date) {
                $timeout(function () {
                    selectToTime(date);
                }, 500)
            }
        });
    };

    function selectToTime(date) {
        var timeToConfig = {
            date: $scope.contextPnr.dateTimeTo ? new Date($scope.contextPnr.dateTimeTo) : new Date(),
            mode: 'time',
            is24Hour: true,
            allowOldDates: true,
            allowFutureDates: true,
            doneButtonLabel: $filter('translate')('commons.select'),
            cancelButtonLabel: $filter('translate')('commons.close'),
            cancelButtonColor: '#000000',
            locale: navigator.language
        };

        $cordovaDatePicker.show(timeToConfig).then(function (time) {
            if (time) {
                fixDateTime(date, time, 'to');
            }
        });
    };

    function fixDateTime(date, time, type) {
        var hours = new Date(time).getHours();
        var minutes = new Date(time).getMinutes();
        var newDate = new Date(date).setHours(hours, minutes, 0, 0);
        $scope.contextPnr.dateTimeTo = ManipolationServices.resetDateForDefect(newDate);
    }

})