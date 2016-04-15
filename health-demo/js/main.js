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
                    if (allLines[i][0] && allLines[i][1] && allLines[i][2] && allLines[i][3] && allLines[i][4] && allLines[i][5]) {
                        if (allLines[i][0] === 'country_popio') continue;
                        var obj = {
                            country:           allLines[i][0],
                            sex:               allLines[i][3],
                            ageGroup:          allLines[i][5],
                            pcMean:            allLines[i][4],
                            smokingPrevalence: allLines[i][6]
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
        if (age >= 30 && age <= 34) {
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
            return 30;
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
    
    getPcMeanFactor: function(rows) {
        if (typeof rows[0] !== 'undefined' && typeof rows[0].pcMean !== 'undefined') {
            return rows[0].pcMean;
        }
        
        return false;
    },

    getSmokingPrevalenceFactor: function(rows) {
        if (typeof rows[0] !== 'undefined' && typeof rows[0].smokingPrevalence !== 'undefined') {
            return rows[0].smokingPrevalence;
        }
        
        return false;
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
        
        var sex     = jQuery('input[name="sex"]:checked').val();
        var country = jQuery('#country').val();
        var year    = jQuery('#year').val();
        var month   = this.getMonthNumber(jQuery('#month').val());
        var day     = jQuery('#day').val();
        var ageStr  = this.getAgeString(year, month, day);
        var info    = this.getPeopleInfo(country, sex, this.getAgeGroup(Math.floor(this.getAgeInDays(year, month, day) / 365)));
        var pcMean  = this.getPcMeanFactor(info);
        jQuery('#pc-mean-country').val(pcMean);
        this.getLifeExpectancy(sex, country, ageStr);
        
        var smokingPrevalenceFactor = parseFloat(this.getSmokingPrevalenceFactor(info));
        if (smokingPrevalenceFactor) {
            smokingPrevalenceFactor = smokingPrevalenceFactor / 100;
        } else {
            if (sex === 'male') smokingPrevalenceFactor = 0.36; // global male smoking prevalence factor 36%;
            else                smokingPrevalenceFactor = 0.07; // global female smoking prevalence factor 7%;
        }
        jQuery('#smoking-prevalence').val(smokingPrevalenceFactor);
    },
    
    recalculate: function() {
        var lifeExpectancyWorld          = parseFloat(jQuery('#life-expectancy-world').val());
        var lifeExpectancyCountry        = parseFloat(jQuery('#life-expectancy-country').val());
        var pcMean                       = parseFloat(jQuery('#pc-mean-country').val());
        var smokingPrevalenceFactor      = parseFloat(jQuery('#smoking-prevalence').val());
        var lifeDifferenceCountrySmoking = 0;
        
        var smokingLoss = lifeExpectancyCountry * pcMean * (1 - smokingPrevalenceFactor);
        var smokingGain = lifeExpectancyCountry * pcMean * smokingPrevalenceFactor;
        
        jQuery('#question-smoking-modifier-yes').html('-' + smokingLoss.toFixed(1) + ' years');
        jQuery('#question-smoking-modifier-no').html('+' + smokingGain.toFixed(1) + ' years');
        
        if (jQuery('input[name="smoking"]:checked').val() === 'yes') {
            lifeDifferenceCountrySmoking = lifeExpectancyCountry - smokingLoss;
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
