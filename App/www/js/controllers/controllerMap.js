angular.module('starter').controller('MapCtrl', function ($filter, PopUpServices, ScriptServices, $scope, $http, $state, $ionicLoading, $cordovaGeolocation, $ionicPopup) {
    $scope.selectedBooking = $state.params.pnrInfo;

    $scope.navigate = function () {

        if (device.platform == 'iOS') {
            window.open('maps://?q=' + $scope.g_address, '_system');
        } else {
            var label = encodeURI($scope.g_address);
            window.open('geo:0,0?q=' + $scope.g_address, '_system');
        }
    };
    $scope.delete = function (book) {
        var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('map.confirmDeleteTitle'),
            template: $filter('translate')('map.confirmDeleteInfo')
        });

        confirmPopup.then(function (res) {
            if (res) {
                if (!book)
                    return;

                $ionicLoading.show();
                ScriptServices.getXMLResource(553).then(function(res) {
                    res = res.replace('{BOOKING_NUMBER}', book.Nr);
                    ScriptServices.callGenericService(res, 553).then(function(data) {
                        $state.go('tab.bookings');
                    }, function(error) {
                        PopUpServices.errorPopup(error+$filter('translate')('commons.retry'));
                        $ionicLoading.hide();
                    })
                });
            }
        });
    };

    function convertCoordinates() {
        return {
            lat: Number($scope.selectedBooking.lat),
            lng: Number($scope.selectedBooking.lng)
        };
    }

    var coorOnj = convertCoordinates();

    $scope.centerToMarker = function(){
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: coorOnj.lat, lng: coorOnj.lng },
            zoom: 18,
            mapTypeControl: false
        });
        markerOn();
    }
    

    function markerOn(){
        new google.maps.Marker({
            position: {
                lat: coorOnj.lat,
                lng: coorOnj.lng
            },
            map: map
        });
    }
    

    var latlng = new google.maps.LatLng(coorOnj.lat, coorOnj.lng);
    new google.maps.Geocoder().geocode({ 'latLng': latlng }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                $scope.g_address = results[0].formatted_address;
                $scope.$apply();
                $scope.centerToMarker();
            } else {
                PopUpServices.errorPopup($filter('translate')('map.noCoordsFound'), '1');
            }
        } else {
            PopUpServices.errorPopup($filter('translate')('map.noCoordsFound'), '1');
        }
    });

})