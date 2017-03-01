angular.module('starter').factory("InfoFactories", [function () {
    var parking, server, selectedClient, selectedCar, dateTimeFrom, dateTimeTo,
    telepass = false, 
    CC = false, 
    selectedRangeDriver = { value: 'short' };

    function resetService (){
        parking, server, selectedClient, selectedCar, telepass = false, CC = false, selectedRangeDriver = { value: 'short' };
        return;
    };
    function setDateTimeFrom(varDate) {
        dateTimeFrom = varDate;
    };
    function getDateTimeFrom() {
        return dateTimeFrom;
    };
    function setDateTimeTo(varDate) {
        dateTimeTo = varDate;
    };
    function getDateTimeTo() {
        return dateTimeTo;
    };
    function setPark(varPark) {
        parking = varPark;
    };
    function getPark() {
        return parking;
    };
    function setClientSelected(varSelectedClient) {
        selectedClient = varSelectedClient;
    };
    function getClientSelected() {
        return selectedClient;
    };
    function setServer(varServer) {
        server = varServer;
    };
    function getServer() {
        return server;
    };
    function setSelectedCar(varCar) {
        selectedCar = varCar;
    };
    function getSelectedCar() {
        return selectedCar;
    };
    function setCC(varCC) {
        CC = varCC;
    };
    function getCC() {
        return CC;
    };
    function setTelepass(varTelepass) {
        telepass = varTelepass;
    };
    function getTelepass() {
        return telepass;
    };
    function setSelectedRangeDriver(varRangeDriver) {
        selectedRangeDriver = varRangeDriver;
    };
    function getSelectedRangeDriver() {
        return selectedRangeDriver;
    };
    function trascodeFuel(value) {
        switch(value) {
            default: 
                break;
            case '0/4': 
                return '0%';
            case '1/4': 
                return '25%';
            case '2/4': 
                return '50%';
            case '3/4': 
                return '75%';
            case '4/4': 
                return '100%';
        }
    };

    return {
        setPark: function (varPark) {
            return setPark(varPark);
        },
        getPark: function () {
            return getPark();
        },
        setClientSelected: function (varSelectedClient) {
            return setClientSelected(varSelectedClient);
        },
        getClientSelected: function () {
            return getClientSelected();
        },
        setSelectedCar: function (varCar) {
            return setSelectedCar(varCar);
        },
        getSelectedCar: function () {
            return getSelectedCar();
        },
        setCC: function (varCC) {
            return setCC(varCC);
        },
        getCC: function () {
            return getCC();
        },
        setTelepass: function (varTelepass) {
            return setTelepass(varTelepass);
        },
        getTelepass: function () {
            return getTelepass();
        },
        setSelectedRangeDriver: function (varRangeDriver) {
            return setSelectedRangeDriver(varRangeDriver);
        },
        getSelectedRangeDriver: function () {
            return getSelectedRangeDriver();
        },
        setServer: function (varServer) {
            return setServer(varServer);
        },
        getServer: function () {
            return getServer();
        },
        setDateTimeFrom: function (vatDate) {
            return setDateTimeFrom(vatDate);
        },
        getDateTimeFrom: function () {
            return getDateTimeFrom();
        },
        setDateTimeTo: function (vatDate) {
            return setDateTimeTo(vatDate);
        },
        getDateTimeTo: function () {
            return getDateTimeTo();
        },
        resetService: function () {
            return resetService();
        },
        trascodeFuel: function (fuel) {
            return trascodeFuel(fuel);
        }
    };



}])
