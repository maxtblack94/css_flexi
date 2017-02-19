angular.module('starter').controller('BookingsCtrl', function($scope, $rootScope, InfoFactories, $http, $state, $ionicPopup, $ionicLoading, WebService) {
    $scope.locale = window.locale;
    $scope.selectedClient = InfoFactories.getClientSelected();
    
    var favo = window.localStorage.getItem('favoriteParking') ? eval('('+window.localStorage.getItem('favoriteParking')+')') : null;
    if(favo){
        InfoFactories.setPark(favo);
    }
    $scope.refreshBookings = function(){
        loadbookings();
        $scope.$broadcast('scroll.refreshComplete');
    }
  
	 function loadbookings() {
        $scope.loading = true;
        $ionicLoading.show();
        $scope.BookingsList = null;
		
		$http.get("res/516.xml").success(function(res) {
			var driver = window.localStorage.getItem('Nr');
			res = res.replace('{DRIVER_NUMBER}', driver);
            
			WebService.ajaxPostRequestTemp(res, 516, function(data) {
                $scope.loading = false;
                $ionicLoading.hide();
				$scope.BookingsList = data.data.BookingsList;
				//alert(JSON.stringify($scope.BookingsList[0]));
				
				var blength = $scope.BookingsList.length;
				for(var i = 0; i < blength; i++) {
                    $scope.BookingsList[i].return_time = $scope.BookingsList[i].return_time.slice(0, -3);
                    $scope.BookingsList[i].pickup_time = $scope.BookingsList[i].pickup_time.slice(0, -3);

                    

					switch($scope.BookingsList[i].cmb_fuel_quantity) {
						default: 
							break;
						case '0/4': 
							$scope.BookingsList[i].cmb_fuel_quantity = '0%';
						case '1/4': 
							$scope.BookingsList[i].cmb_fuel_quantity = '25%';
							break;
						case '2/4': 
							$scope.BookingsList[i].cmb_fuel_quantity = '50%';
							break;
						case '3/4': 
							$scope.BookingsList[i].cmb_fuel_quantity = '75%';
							break;
						case '4/4': 
							$scope.BookingsList[i].cmb_fuel_quantity = '100%';
							break;
					}
				}
				
			});
		});
	};
	

	loadbookings();
    
    $scope.newBooking = function() {
        $state.go('tab.parking');
    };

    $scope.openCarManipolation = function(reservation, opT){
        $ionicLoading.show();
        $http.get("res/621.xml").success(function(res) {
	    	res = res.replace('{PNR_NUMBER}', reservation).replace('{OPERATION_TYPE}', opT);
    		$http({
    			url: 'http://'+CLIENT+'.corporatecarsharing.biz/api.svc/ScriptParameterSets',
		        method: "POST",
		        data: res,
		        headers: {
                    'TenForce-Auth' : 'dGVuZm9yY2UuaXRAVEYuY29tfGRlbW9pdGFseTEyMTY4', 
                    'Content-Type' : 'application/atom+xml'
                }
	    	}).success(function (data, status, headers, config) {
	    		var responsePromisee = $http.get("http://"+CLIENT+".corporatecarsharing.biz/api.svc/ExecuteAdminScript?scriptId=621&scriptParameterSetId=" + data.d.Id, {headers: {'TenForce-Auth': 'dGVuZm9yY2UuaXRAVEYuY29tfGRlbW9pdGFseTEyMTY4'}});
	    		
                responsePromisee.success(function(data, status, headers, config) {
                    console.log(data)
                    $ionicLoading.hide();
	    		});
	        }).error(function(err) {
                //gestire ERRORe
                $ionicLoading.hide();
            });
    	})
    }
    
    $scope.openBooking = function(object) {
        $state.go('tab.map', {pnrInfo:object});
    };
	
    $scope.delete = function(book) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Conferma eliminazione',
            template: 'Sicuro di vole eliminare la prenotazione selezionata?'
        });
        
        confirmPopup.then(function(res) {
            if(res) {
                if(!book){
                    return;
                }
                $ionicLoading.show();
                $http.get("res/553.xml").success(function(res) {
                    res = res.replace('{BOOKING_NUMBER}', book.Nr);
                    WebService.ajaxPostRequest(res, 553, function(data) {
                        loadbookings();
                    });
                });
            } 
        });
    };
    
})