var app = {
    smokingRiskData: [],
    days:            [],
    months:          [],
    years:           [],
    
    initControls: function() {
        var self = this;
        var i;
        for (i = 1; i <= 31; i ++) {
            this.days.push(i);
        }
        for (i = 2015; i >= 1920; i --) {
            this.years.push(i);
        }    
        this.months = [
            'January', 'February', 'March',     'April',   'May',      'June',
            'July',    'August',   'September', 'October', 'November', 'December'
        ];
        jQuery('#day').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        },{
            name: 'days',
            source: self.findSubstringMatch(this.days)
        });
        jQuery('#month').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        },{
            name: 'days',
            source: self.findSubstringMatch(this.months)
        });
        jQuery('#year').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        },{
            name: 'year',
            source: self.findSubstringMatch(this.years)
        });        
        jQuery('#country').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        },{
            name: 'country',
            source: self.findSubstringMatch(countries.sort())
        });
    },
    
    initUI: function() {
        jQuery('#living-info').hide();
        jQuery('#result-info').hide();
        jQuery('#social-info').hide();
    },
    
    loadListeners: function() {
        var self = this;
        jQuery('#user-form').submit(function(e) {
            self.submitUserForm(e);
        });
        jQuery('#living-info input').click(function() {
            self.recalculate();
        });
    },
    
    findSubstringMatch: function(strs) {
        return function findMatches(q, cb) {
            var matches, substringRegex;
            matches = [];
            substrRegex = new RegExp(q, 'i');
            jQuery.each(strs, function(i, str) {
                if (substrRegex.test(str)) {
                    matches.push(str);
                }
            });
            cb(matches);
        };
    },
    
    loadSmokingRiskData: function() {
        var self = this;
        jQuery.ajax({
            type:     'GET',
            url:      'data/smoking-risk.csv',
            dataType: 'text',
            success: function(data) {
                var allLines = jQuery.csv.toArrays(data);
                for (var i = 0; i < allLines.length; i ++) {
                    if (allLines[i][0] && allLines[i][1] && allLines[i][2] && allLines[i][3] && allLines[i][4]) {
                        if (allLines[i][0] === 'country_popio') continue;
                        var obj = {
                            country:       allLines[i][0],
                            sex:           allLines[i][1],
                            ageGroup:      allLines[i][2],
                            smokerLoss:    parseFloat(allLines[i][3]),
                            nonsmokerGain: parseFloat(allLines[i][4])
                        };
                        self.smokingRiskData.push(obj);
                    }
                }
            },
            error: function() {
                throw 'Smoking risk data not found';
            }
        });        
    },
    
    getAgeGroup: function(age) {
        if (age >= 5 && age <= 9) {
            return 5;
        } else if (age >= 10 && age <= 14) {
            return 10;                        
        } else if (age >= 15 && age <= 19) {
            return 15;            
        } else if (age >= 20 && age <= 24) {
            return 20;
        } else if (age >= 25 && age <= 29) {
            return 25;
        } else if (age >= 30 && age <= 34) {
            return 30;            
        } else if (age >= 35 && age <= 39) {
            return 35;
        } else if (age >= 40 && age <= 44) {
            return 40;
        } else if (age >= 45 && age <= 49) {
            return 45;
        } else if (age >= 50 && age <= 54) {
            return 50;
        } else if (age >= 55 && age <= 59) {
            return 55;
        } else if (age >= 60 && age <= 64) {
            return 60;
        } else if (age >= 65 && age <= 69) {
            return 65;
        } else if (age >= 70 && age <= 74) {
            return 70;
        } else if (age >= 75 && age <= 79) {
            return 75;
        } else if (age >= 80) {
            return 80;            
        } else {
            return 5;
        }
    },
    
    getMonthNumber: function(mountStr) {
        return (this.months.indexOf(mountStr) + 1);
    },
    
    getAgeInDays: function(year, month, day) {
        year  = parseInt(year);
        month = parseInt(month);
        if (month < 10) month = '0' + month;
        day = parseInt(day);
        if (day < 10) day   = '0' + day;
        var now      = new Date();
        var dob      = new Date(year + '-' + month + '-' + day);
        var diffDays = Math.ceil(Math.abs(now.getTime() - dob.getTime()) / (1000 * 3600 * 24));
        
        return diffDays;
    },
    
    getAgeString: function(year, month, day) {
        var diffDays = this.getAgeInDays(year, month, day);
        var years    = Math.floor(diffDays / 365);
        var months   = Math.floor((diffDays % 365) / 30);
        
        return years + 'y' + months + 'm';
    },
    
    getPeopleInfo: function(country, sex, ageGroup) {
        if (sex === 'male'   || sex === 'Male')   sex = 'Males';
        if (sex === 'female' || sex === 'Female') sex = 'Females';
        return items = jQuery.grep(this.smokingRiskData, function(row, i) {
            if (row.country == country && row.sex == sex && row.ageGroup == ageGroup) return true;
            return false;
        });        
    },

    getLifeExpectancy: function(sex, country, ageStr) {
        var self   = this;
        var now    = new Date();
        var nowStr = now.getFullYear();        
        var month  = now.getMonth() + 1;
        if (month < 9) month = '0' + month;
        nowStr += '-' + month;
        var day  = now.getDate();
        if (day < 9) day = '0' + day;
        nowStr += '-' + day;
        jQuery.ajax({
            type: 'GET',
            url:  'http://api.population.io/1.0/life-expectancy/remaining/' + sex + '/World/' + nowStr + '/' + ageStr,
            success: function(worldData) {
                jQuery('#life-expectancy-world').val(worldData['remaining_life_expectancy']);
                jQuery.ajax({
                    type: 'GET',
                    url:  'http://api.population.io/1.0/life-expectancy/remaining/' + sex + '/' + country + '/' + nowStr + '/' + ageStr,
                    success: function(data) {
                        if (data && data['remaining_life_expectancy']) {
                            jQuery('#life-expectancy-country').val(data['remaining_life_expectancy']);
                            jQuery('#living-info').show();
                            jQuery('#result-info').show();
                            jQuery('#social-info').show();
                            self.recalculate();
                            $('html, body').animate({
                                scrollTop: $('#living-info').offset().top - 60
                            }, 2000);                    
                        }
                    },
                    error: function(xhr) {
                        var message = 'API error: ' + xhr.responseText;
                        alert(message);
                        throw message;
                    }
                });                 
            },
            error: function(xhr) {
                var message = 'API error: ' + xhr.responseText;
                alert(message);
                throw message;
            }
        });        
    },
    
    validateUserForm: function() {
        var element;
        var value;

        element = jQuery('#day');
        value   = parseInt(element.val());
        if (value) element.val(value);
        else       element.val('');
        if (! element.val()) {
            element.focus();
            return false;
        }
        
        element = jQuery('#month');
        if (! element.val()) {
            element.val('').focus();
            return false;
        }
        
        element = jQuery('#year');
        value   = parseInt(element.val());
        if (value) element.val(value);
        else       element.val('');
        if (! element.val()) {
            element.val('').focus();
            return false;
        }        
        
        element = jQuery('#country');
        if (! element.val()) {
            element.val('').focus();
            return false;
        }        
        
        return true;
    },
    
    submitUserForm: function(event) {
        event.preventDefault();
        
        if (! this.validateUserForm()) {
            return false;
        }
        
        var sex      = jQuery('input[name="sex"]:checked').val();
        var country  = jQuery('#country').val();
        var year     = jQuery('#year').val();
        var month    = this.getMonthNumber(jQuery('#month').val());
        var day      = jQuery('#day').val();
        var ageStr   = this.getAgeString(year, month, day);
        var numYears = Math.floor(this.getAgeInDays(year, month, day) / 365);
        var ageGroup = this.getAgeGroup(numYears);
        var info     = this.getPeopleInfo(country, sex, ageGroup);
        
        if (! info.length) {
            var errorMessage = 'Data for user (' + country + ', ' + sex + ', ' + ageGroup + ') not found in csv data file';
            alert(errorMessage);
            throw errorMessage;
        }
        info = info[0];
        
        this.getLifeExpectancy(sex, country, ageStr);
        
        jQuery('#smoker-loss-factor').val(info.smokerLoss);
        jQuery('#nonsmoker-gain-factor').val(info.nonsmokerGain);
    },
    
    recalculate: function() {
        var lifeExpectancyWorld   = parseFloat(jQuery('#life-expectancy-world').val());
        var lifeExpectancyCountry = parseFloat(jQuery('#life-expectancy-country').val());
        var smokerLossFactor      = parseFloat(jQuery('#smoker-loss-factor').val());
        var nonsmokerGainFactor   = parseFloat(jQuery('#nonsmoker-gain-factor').val());
        
        var smokingLoss = lifeExpectancyCountry * smokerLossFactor;
        var smokingGain = lifeExpectancyCountry * nonsmokerGainFactor;        
        
        jQuery('#question-smoking-modifier-yes').html(smokingLoss.toFixed(1) + ' years');
        jQuery('#question-smoking-modifier-no').html('+' + smokingGain.toFixed(1) + ' years');        
        
        if (jQuery('input[name="smoking"]:checked').val() === 'yes') {
            lifeDifferenceCountrySmoking = lifeExpectancyCountry - Math.abs(smokingLoss);
        } else if (jQuery('input[name="smoking"]:checked').val() === 'no') {
            lifeDifferenceCountrySmoking = lifeExpectancyCountry + smokingGain;
        } else {
            lifeDifferenceCountrySmoking = lifeExpectancyCountry;
        }        
        
        jQuery('#result-life-expectancy-world').html(lifeExpectancyWorld.toFixed(1) + ' years');
        jQuery('#result-life-expectancy-country').html(lifeExpectancyCountry.toFixed(1) + ' years');        
        jQuery('#result-smoking').html(lifeDifferenceCountrySmoking.toFixed(1) + ' years');  
    },
    
    init: function() {
        this.initUI();
        this.initControls();
        this.loadSmokingRiskData();
        this.loadListeners();
    }    
};

jQuery(document).ready(function() {
    app.init();
});
