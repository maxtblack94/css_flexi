angular.module('starter').controller('CompleteRegistrationCtrl', function($filter, LovServices, $cordovaDatePicker, PopUpServices, $scope, $state, InfoFactories, $timeout, $ionicLoading, $ionicPopup, ScriptServices) {
    $scope.selectedClient = InfoFactories.getClientSelected();
    $scope.user = InfoFactories.getUserInfo();
    $scope.currentTarif = undefined;
    $scope.nazioni = LovServices.getNations();
    $scope.province = LovServices.getProvinces();
    

    function getConsensi(){
        $ionicLoading.show();
        ScriptServices.getXMLResource(651).then(function(res) {
            res = res.replace('{DRIVERID}', $scope.user.driverNumber || null);
            ScriptServices.callGenericService(res, 651).then(function(data) {
                $scope.acceptances = data.data.acceptances;
                $scope.services = data.data.service;
                $scope.documentsType = data.data.docType;
                initializeRequest(data.data);
                $ionicLoading.hide();
            }, function(error) {
                PopUpServices.errorPopup($filter('translate')('commons.retry'));
                $ionicLoading.hide();
            });
        });
    }

    $scope.selectTarif = function (tarif) {
        $scope.currentTarif = tarif;
    };

    function initializeRequest(data) {
        $scope.request = {};
        $scope.request = {
            firstName: data.fname,
            lastName: data.lname,
            email: data.email,
            emailConfirm: data.email,
            username: data.username,
            password: data.password,
            confirmPassword: data.password,
            promo: data.promo,
            company: data.company
        };
        $scope.disabledPromo = data.promo ? true: false;
        $scope.disabledCompany = data.company ? true: false;
    }

    $scope.selectPicklistValue = function (picklist, title, subTitle) {
        var templateUrl;
        if (picklist === 'birthNation' || picklist === 'nationResidence' || picklist === 'fattNation') {
            templateUrl = "templates/picklists/nation.html";
        } else if(picklist === 'documentType') {
            templateUrl = "templates/picklists/documentType.html";
        } else {
            templateUrl = "templates/picklists/province.html";
        }

        $ionicPopup.show({
            templateUrl: templateUrl,
            title: title,
            subTitle: subTitle,
            cssClass: 'picklist',
            scope: $scope,
            buttons: [{
                text: $filter('translate')('commons.cancel'),
                type: 'button-stable',
            }, {
                text: '<b>'+$filter('translate')('commons.save')+'</b>',
                type: 'button-positive',
                onTap: function (e) {
                    if (!$scope.request.picklistValue) {
                        $scope.request.picklistValue = null;
                        e.preventDefault();
                    } else {
                        $scope.request[picklist] = $scope.request.picklistValue;
                        $scope.request.picklistValue = null;
                    }
                }
            }]
        });
    };

    $scope.selectBirthDate = function() {
        var dateFromConfig = {
            date: $scope.request.birthDate ? new Date($scope.request.birthDate) : new Date(),
            mode: 'date',
            allowOldDates: true,
            allowFutureDates: false,
            androidTheme: 4,
            doneButtonLabel: $filter('translate')('commons.select'),
            cancelButtonLabel: $filter('translate')('commons.close'),
            cancelButtonColor: '#000000',
            locale: navigator.language
        };
        
        $cordovaDatePicker.show(dateFromConfig).then(function(date) {
            if(date){
                $scope.request.birthDate = date;
            }            
        });
    };

    $scope.selectDate = function(input) {
        var dateFromConfig = {
            date: $scope.request[input] ? new Date($scope.request[input]) : new Date(),
            mode: 'date',
            /* allowOldDates: true,
            allowFutureDates: false, */
            androidTheme: 4,
            doneButtonLabel: $filter('translate')('commons.select'),
            cancelButtonLabel: $filter('translate')('commons.close'),
            cancelButtonColor: '#000000',
            locale: navigator.language
        };
        
        $cordovaDatePicker.show(dateFromConfig).then(function(date) {
            if(date){
                $scope.request[input] = date;
            }            
        });
    };

    getConsensi();

    $scope.isValid = function () {

        
        if (!$scope.request.email ||
            !$scope.request.password ||
            !$scope.request.username ||
            !$scope.request.accept5 || 
            !$scope.request.accept6 ||
            !$scope.request.accept7 ||
            !$scope.request.mobile ||
            !$scope.request.birthNation ||
            !$scope.request.birthPlace ||
            !$scope.request.birthDate ||
            !$scope.request.indirizzo ||
            /* !$scope.request.civico || */
            !$scope.request.city ||
            !$scope.request.cap ||
            !$scope.request.nationResidence ||
            !$scope.request.shortProvinceResidence ||
            !$scope.request.fiscalCode ||
            !$scope.request.documentType ||
            !$scope.request.docNumber ||
            !$scope.request.docEndDate ||
            !$scope.request.licenseNumber ||
            !$scope.request.licenseEndDate ||
            !$scope.request.licenseIssueDate 
        ) {
            PopUpServices.messagePopup('Compilare tutti i campi obbligatori', 'Attenzione');
        } else if ($scope.request.password !== $scope.request.confirmPassword ) {
            PopUpServices.messagePopup('I campi password non combaciano', 'Attenzione');
        } else if ($scope.request.email !== $scope.request.emailConfirm) {
            PopUpServices.messagePopup('I campi email non combaciano', 'Attenzione');
        } else if ($scope.request.isDatiFatt && (
            !$scope.request.fattRagioneSociale ||
            (!$scope.request.fattCF && $scope.request.isDittaindividuale) ||
            !$scope.request.fattIndirizzo ||
            !$scope.request.fattCap ||
            !$scope.request.fattCity ||
            !$scope.request.fattNation ||
            !$scope.request.fattProvince ||
            !$scope.request.fattPiva
            )) {
            PopUpServices.messagePopup('Completare tutti i campi relativi alla fatturazione', 'Attenzione');
        } else if (!$scope.request.sdi && !$scope.request.pec && $scope.request.isDatiFatt) {
            PopUpServices.messagePopup('Inserire Codice SDI oppure pec per la fatturazione', 'Attenzione');
        } else if(!$scope.request.cap.match(/^\d{5}$/)) {
            PopUpServices.messagePopup('Il valore del cap non è corretto', 'Attenzione');
/*         } else if(!$scope.request.email.match(/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)) {
            PopUpServices.messagePopup('Il valore del Email non è corretto', 'Attenzione'); */
        } else if($scope.request.fattCap && $scope.request.isDatiFatt && !$scope.request.fattCap.match(/^\d{5}$/)) {
            PopUpServices.messagePopup('Prima di procedere accetta tutti i consensi', 'Attenzione');
        } else if($scope.request.accept5 !== 'YES' || $scope.request.accept6 !== 'YES' || $scope.request.accept7 !== 'YES') {
            PopUpServices.messagePopup('Prima di procedere accetta tutti i consensi', 'Attenzione');
        } else if(!$scope.currentTarif) {
            PopUpServices.messagePopup('Seleziona il profilo di noleggio', 'Attenzione');
        } else {
            completeRegistration();
        }
    }

    $scope.openUrl = function(url){
        if (url) {
            window.open(url, '_system', 'location=yes');
        }
    }

    function completeRegistration() {
        $ionicLoading.show();
        ScriptServices.getXMLResource(652).then(function(res) {
            res = res.replace('{DRIVERID}', $scope.user.driverNumber || null)
            .replace('{EMAIL}', $scope.request.email || '')
            .replace('{FIRSTNAME}', $scope.request.firstName || '')
            .replace('{LASTNAME}', $scope.request.lastName || '')
            .replace('{PASSWORD}', $scope.request.password || '')
            .replace('{PROMO}', $scope.request.promo || '')
            .replace('{COMPANY}', $scope.request.company || '')
            .replace('{USERNAME}', $scope.request.username || '')
            .replace('{ACCEPT5}', $scope.request.accept5 || 'NO')
            .replace('{ACCEPT6}', $scope.request.accept6 || 'NO')
            .replace('{ACCEPT7}', $scope.request.accept7 || 'NO')
            .replace('{TARIF}', $scope.currentTarif.code || '')
            .replace('{MOBILE}', $scope.request.mobile || '')
            .replace('{BNATION}', $scope.request.birthNation || '')
            .replace('{BPLACE}', $scope.request.birthPlace || '')
            .replace('{BDATE}', moment($scope.request.birthDate).format('DD/MM/YYYY')  || '')
            .replace('{VIA}', $scope.request.indirizzo || '')
            .replace('{CIVICO}', $scope.request.civico || '')
            .replace('{COMUNE}', $scope.request.city || '')
            .replace('{CAP}', $scope.request.cap || '')
            .replace('{NATIONRESIDENCE}', $scope.request.nationResidence || '')
            .replace('{PROVINCE}', $scope.request.shortProvinceResidence || '')
            .replace('{CF}', $scope.request.fiscalCode || '')
            .replace('{DOCTYPE}', $scope.request.documentType.code || '')
            .replace('{DOCNUMBER}', $scope.request.docNumber || '')
            .replace('{DOCENDDATE}', moment($scope.request.docEndDate).format('DD/MM/YYYY') || '')
            .replace('{LICENSENUMBER}', $scope.request.licenseNumber || '')
            .replace('{LICENSEENDDATE}', moment($scope.request.licenseEndDate).format('DD/MM/YYYY') || '')
            .replace('{LICENSEDATE}', moment($scope.request.licenseIssueDate).format('DD/MM/YYYY') || '')
            .replace('{RILASCIATADA}', $scope.request.licenseIssueIstitute || '')
            .replace('{RAGIONESOCIALE}', $scope.request.fattRagioneSociale || '')
            .replace('{PIVA}', $scope.request.fattPiva || '')
            .replace('{CFPI}', $scope.request.fattCF || '')
            .replace('{CAPPI}', $scope.request.fattCap || '')
            .replace('{VIAPI}', $scope.request.fattIndirizzo || '')
            .replace('{NATIONPI}', $scope.request.fattNation || '')
            .replace('{CITYPI}', $scope.request.fattCity || '')
            .replace('{PROVINCEPI}', $scope.request.fattProvince || '')
            .replace('{SID}', $scope.request.sdi || '')
            .replace('{PEC}', $scope.request.pec || '');
            ScriptServices.callGenericService(res, 652).then(function(data) {
                window.localStorage.removeItem('isNotRegistered');
                PopUpServices.messagePopup("Il tuo profilo è in fase di verifica. Procedi all'attivazione della modalità di pagamento", "Profilo in attesa di abilitazione", $scope.paymentModal);
                $ionicLoading.hide();
            }, function(error) {
                PopUpServices.errorPopup($filter('translate')('commons.retry'));
                $ionicLoading.hide();
            });
        });
    }


    $scope.paymentModal = function (params) {
        var modalContent = `<div class="bt-content" style="padding: 20px; z-index: 9999; color: rgb(0, 0, 0);">Gentile Cliente, per tua tutela, ti verra’ chiesto di autorizzare un blocco platfond di 0,02 euro (che verranno riaccreditati) al fine di verificare la validita’ dei dati inseriti.<br><br><br>Per portare a termine la procedura di iscrizione, come previsto dall’istituto bancario Banca Intesa, e’ quindi necessario digitare il pulsante "paga".<br><br><br>Per info e supporto contattaci al n.verde 800.77.44.55</div>
                <ion-item class="item-image">
                    <img src="icons/cartedicredito.jpg">
                </ion-item>`;
        var configObj = {
            "buttons": [{
                text: $filter('translate')('Annulla'),
                type: 'button-stable',
                onTap: function () {
                    $state.go('tab.bookings');
                }
            }, {
                text: '<b>'+$filter('translate')('Procedi')+'</b>',
                type: 'button-positive',
                onTap: function () {
                    startSetefy();
                }
            }],
            "message": modalContent,
            "title": 'Modalità pagamento',
            "cssClass": 'info'
        }
        PopUpServices.buttonsPopup(configObj);
    }

    function startSetefy() {
        $ionicLoading.show();
        ScriptServices.getXMLResource(655).then(function(res) {
            res = res.replace('{DRIVERID}', $scope.user.driverNumber || null);
            ScriptServices.callGenericService(res, 655).then(function(data) {
                window.open(data.data, '_system', 'location=yes');
                $state.go('tab.bookings');
                $ionicLoading.hide();
            }, function(error) {
                PopUpServices.errorPopup($filter('translate')('commons.retry'));
                $ionicLoading.hide();
            });
        });
    }
})