angular.module('starter', ['ionic', 'ngCordova', 'tagged.directives.autogrow', 'angularMoment', 'pascalprecht.translate', 'pdf'])

  .run(function ($ionicPlatform, $cordovaStatusbar, $cordovaDevice, amMoment, $rootScope) {
    amMoment.changeLocale('it');
    $ionicPlatform.ready(function () {
      var pushCallback = function(jsonData) {
        if (jsonData) {
          var parsedNotification = {
              "title" : ((jsonData.notification || {}).payload || {}).title,
              "body" : ((jsonData.notification || {}).payload || {}).body,
              "additionalData" : (((jsonData.notification || {}).payload || {}).additionalData || {}),
              "eventName" : (((jsonData.notification || {}).payload || {}).additionalData || {}).eventName,
              "pushID" : (((jsonData.notification || {}).payload || {}).additionalData || {}).pushID
          }
          $rootScope.$broadcast('pushNotificationEvent', parsedNotification);
        }
      };
      if (window.plugins && window.plugins.OneSignal) {
        window.plugins.OneSignal
        .startInit("9e4aefd1-79ba-4ea2-b7c1-755e85dc5851")
        .handleNotificationOpened(pushCallback)
        .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
        .endInit();
      }

      if (window.StatusBar) {
        if ($cordovaDevice.getPlatform() == 'iOS'){
          $cordovaStatusbar.styleHex('#111');
        }
      }
    });
  })

  .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider, $translateProvider) {
    $translateProvider.translations('en', window.locale_en);
    $translateProvider.translations('it_IT', window.locale_it);
    $translateProvider.translations('ro_RO', window.locale_ro);
    $translateProvider.translations('hr_HR', window.locale_hr);
    $translateProvider.useSanitizeValueStrategy(null);

    var uppercaseLang = navigator.language.toLowerCase();

    if (uppercaseLang.startsWith('it')) {
      $translateProvider.preferredLanguage("it_IT");
    }else if (uppercaseLang.startsWith('ro')) {
      $translateProvider.preferredLanguage("ro_RO");
    }else if (uppercaseLang.startsWith('hr')) {
      $translateProvider.preferredLanguage("hr_HR");
    }else {
      $translateProvider.preferredLanguage('en');
    }
    
    $ionicConfigProvider.views.swipeBackEnabled(false);
    $httpProvider.defaults.timeout = 30000;
    $stateProvider

      .state('login', {
        url: '/login',
        cache: false,
        params: {
          error401: null
        },
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })

      .state('register', {
        url: '/register',
        cache: false,
        params: {
          error401: null
        },
        templateUrl: 'templates/register.html',
        controller: 'RegisterCtrl'
      })

      .state('confirmPrenotation', {
        url: '/confirm-prenotation',
        params: {
          car: null
        },
        cache: false,
        templateUrl: 'templates/tabs/confirmPrenotation.html',
        controller: 'ConfirmPrenotationCtrl'
      })

      .state('contacts', {
        url: '/contacts',
        cache: false,
        templateUrl: 'templates/commons/contacts.html',
        controller: 'ContactsCtrl'
      })

      .state('editPassword', {
        url: '/edit-password',
        cache: false,
        templateUrl: 'templates/commons/edit-password.html',
        controller: 'EditPasswordCtrl'
      })
      .state('clientDetails', {
        url: '/client-details',
        cache: false,
        templateUrl: 'templates/commons/client-details.html',
        controller: 'ClientDetailCtrl'
      })

      .state('license', {
        url: '/license',
        cache: false,
        templateUrl: 'templates/commons/license-edit.html',
        controller: 'LicenseEditCtrl'
      })

      // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html',
        controller: 'TabCtrl'
      })

      // Each tab has its own nav history stack:

      .state('tab.bookings', {
        url: '/bookings',
        cache: false,
        views: {
          'tab-bookings': {
            templateUrl: 'templates/tabs/tab-bookings.html',
            controller: 'BookingsCtrl'
          }
        }
      })

      .state('tab.plafond', {
        url: '/plafond',
        cache: false,
        views: {
          'tab-plafond': {
            templateUrl: 'templates/tabs/tab-plafond.html',
            controller: 'PlafondCtrl'
          }
        }
      })

      .state('tab.history', {
        url: '/history',
        cache: false,
        views: {
          'tab-history': {
            templateUrl: 'templates/tabs/tab-history.html',
            controller: 'HistoryCtrl'
          }
        }
      })

      .state('tab.employeeReservation', {
        url: '/employeeReservation',
        cache: false,
        views: {
          'tab-employeeReservation': {
            templateUrl: 'templates/tabs/tab-employeeReservation.html',
            controller: 'EmployeeReservationCtrl'
          }
        }
      })
      
      .state('tab.sos', {
        url: '/sos',
        cache: false,
        views: {
          'tab-sos': {
            templateUrl: 'templates/tabs/tab-sos.html',
            controller: 'SosCtrl'
          }
        }
      })

      .state('tab.ble', {
        url: '/ble',
        cache: false,
        views: {
          'tab-ble': {
            templateUrl: 'templates/tabs/tab-ble-test.html',
            controller: 'BleCtrl'
          }
        }
      })

      .state('tab.map', {
        url: '/map',
        params: {
          pnrInfo: null
        },
        cache: false,
        views: {
          'tab-bookings': {
            templateUrl: 'templates/tabs/map.html',
            controller: 'MapCtrl'
          }
        }
      })

      .state('tab.parking', {
        url: '/parking',
        cache: false,
        views: {
          'tab-parking': {
            templateUrl: 'templates/tabs/tab-parking.html',
            controller: 'ParkingCtrl'
          }
        }
      })

      .state('tab.resume', {
        url: '/resume',
        cache: false,
        params: {
          error: null
        },
        views: {
          'tab-resume': {
            templateUrl: 'templates/tabs/tab-book-resume.html',
            controller: 'ResumeCtrl'
          }
        }
      })

      .state('tab.selcar', {
        url: '/selcar',
        cache: false,
        views: {
          'tab-selcar': {
            templateUrl: 'templates/tabs/car-selection.html',
            controller: 'CarCtrl'
          }
        }
      })

      .state('tab.notifications', {
        url: '/notifications',
        cache: false,
        views: {
          'tab-notifications': {
            templateUrl: 'templates/tabs/tab-notifications.html',
            controller: 'notificationsCtrl'
          }
        }
      })

      .state('settings', {
        url: '/settings',
        cache: false,
        templateUrl: 'templates/commons/settings.html',
        controller: 'SettingsCtrl'
      })
      
      .state('help', {
        url: '/help',
        cache: false,
        templateUrl: 'templates/commons/help.html',
        controller: 'HelpCtrl'
      })

      .state('completeRegistration', {
        url: '/completeRegistration',
        cache: false,
        templateUrl: 'templates/completeRegistration.html',
        controller: 'CompleteRegistrationCtrl'
      })
      
      
      .state('subscriptions', {
        url: '/subscriptions',
        cache: false,
        templateUrl: 'templates/reservation/subscriptions.html',
        controller: 'SubscriptionsCtrl'
      })

      .state('park', {
        url: '/park',
        cache: false,
        params: {
          parkDirection: null
        },
        templateUrl: 'templates/reservation/park.html',
        controller: 'ParkCtrl'
      })

      .state('reserve', {
        url: '/reserve',
        cache: false,
        templateUrl: 'templates/reservation/reserve.html',
        controller: 'ReserveCtrl'
      })

      .state('pooling-reserve', {
        url: '/pooling-reserve',
        cache: false,
        templateUrl: 'templates/reservation/pooling/pooling-reserve.html',
        controller: 'PoolingReserveCtrl'
      })

      .state('pooling-times', {
        url: '/pooling-times',
        cache: false,
        templateUrl: 'templates/reservation/pooling/pooling-times.html',
        controller: 'PoolingTimesCtrl'
      })

      .state('pooling-confirm', {
        url: '/pooling-confirm',
        cache: false,
        params: {
          time: null
        },
        templateUrl: 'templates/reservation/pooling/pooling-confirm.html',
        controller: 'PoolingConfirmCtrl'
      })

      .state('vehicles', {
        url: '/vehicles',
        cache: false,
        templateUrl: 'templates/reservation/vehicle.html',
        controller: 'VehicleCtrl'
      })

      .state('confirm', {
        url: '/confirm',
        cache: false,
        params: {
          car: null
        },
        templateUrl: 'templates/reservation/confirm.html',
        controller: 'ConfirmCtrl'
      })

      .state('confirmMapReservation', {
        url: '/confirmMapReservation',
        cache: false,
        params: {
          vehicle: null
        },
        templateUrl: 'templates/mapReservation/confirmMapReservation.html',
        controller: 'ConfirmMapReservationCtrl'
      })

      .state('mapReservation', {
        url: '/mapReservation',
        cache: false,
        params: {
          parkList: null
        },
        templateUrl: 'templates/mapReservation/map.html',
        controller: 'MapResercationCtrl'
      })

      .state('mapReservationIos', {
        url: '/mapReservationIos',
        cache: false,
        params: {
          parkList: null
        },
        templateUrl: 'templates/mapReservation/map.html',
        controller: 'MapResercationIOSCtrl'
      })
      
      .state('gppRegistration', {
        url: '/gppRegistration',
        cache: false,
        templateUrl: 'templates/gppRegistration/gppRegistration.html',
        controller: 'GppRegistrationCtrl'
      })
      
      .state('gppRegistrationLicense', {
        url: '/gppRegistrationLicense',
        cache: false,
        templateUrl: 'templates/gppRegistration/gppRegistrationLicense.html',
        controller: 'GppRegistrationLicenseCtrl'
      })

      .state('gppRegistrationTerms', {
        url: '/gppRegistrationTerms',
        cache: false,
        templateUrl: 'templates/gppRegistration/gppRegistrationTerms.html',
        controller: 'GppRegistrationTermsCtrl'
      });

    $urlRouterProvider.otherwise('/login');

  });
