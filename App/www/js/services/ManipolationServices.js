angular.module('starter').factory("ManipolationServices", function() {
    function dateAndTimeAggregation(date, time) {
        var newDate;
        time = time.slice(10, -3)
        newDate = date+' '+time;
        newDate = new Date(moment(newDate, 'DD/MM/YYYY HH:mm:ss'));
        return newDate;
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
    function resetDateService (date){
        var d = new Date(date);
        var m = new Date(date);
        if(d.getMinutes() >= 0 && d.getMinutes() <= 14){
            m.setMinutes(15);
        }else if(d.getMinutes() >= 15 && d.getMinutes() <= 29){
            m.setMinutes(30);
        }else if(d.getMinutes() >= 30 && d.getMinutes() <= 44){
            m.setMinutes(45);
        }else if(d.getMinutes() >= 45 && d.getMinutes() <= 59){
            m.setMinutes(0);
            m.setHours(m.getHours()+1);
        }
        return m;      
    }
    function resetDateForDefect (date, dateFrom){
        var d = new Date(date);
        var m = new Date(date);
        dateFrom = new Date(dateFrom);
        if(d.getMinutes() >= 0 && d.getMinutes() <= 7){
            m.setMinutes(0);
        }else if(d.getMinutes() >= 8 && d.getMinutes() <= 19){
            m.setMinutes(15);
        }else if(d.getMinutes() >= 20 && d.getMinutes() <= 34){
            m.setMinutes(30);
        }else if(d.getMinutes() >= 35 && d.getMinutes() <= 48){
            m.setMinutes(45);
        }else if(d.getMinutes() >= 49 && d.getMinutes() <= 59){
            m.setMinutes(0);
            m.setHours(m.getHours()+1);
        }
        if(dateFrom && new Date(dateFrom).valueOf() === new Date(m).valueOf()){
            m = m.setMinutes(m.getMinutes() + 15);
        }
        return m;
    }

    return {
        dateAndTimeAggregation: function (date, time) {
            return dateAndTimeAggregation(date, time);
        },
        trascodeFuel: function (fuel) {
            return trascodeFuel(fuel);
        },
        resetDateService: function (date) {
            return resetDateService(date);
        },
        resetDateForDefect: function (date, dateFrom) {
            return resetDateForDefect(date, dateFrom);
        }
    };



})