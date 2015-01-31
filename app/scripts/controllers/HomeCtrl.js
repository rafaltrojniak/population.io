(function() {
  'use strict';

  angular.module('populationioApp')

  .controller('HomeCtrl', ['$scope', '$document', '$timeout', '$filter', '$location', '$rootScope', 'ProfileService', 'PopulationIOService', "Countries",
    function($scope, $document, $timeout, $filter, $location, $rootScope, ProfileService, PopulationIOService, Countries) {
      var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var days = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
      var years = [];
      for (var i = 1920; i < new Date().getFullYear(); i++) {
        years.push(i.toString())
      }

      $scope.setDay = function($item, $model, $label) {
        $scope.goForm.birthdayDay.$setValidity('validateDay', true);
      };
      $scope.setMonth = function($item, $model, $label) {
        $scope.goForm.birthdayMonth.$setValidity('validateMonth', true);
      };
      $scope.setYear = function($item, $model, $label) {
        $scope.goForm.birthdayYear.$setValidity('validateYear', true);
      };
      $scope.setCountry = function($item, $model, $label) {
        $scope.goForm.country.$setValidity('validateCountry', true);
      };


      $scope.$watch('goForm.$invalid', function(invalid) {
        if (invalid) {
          ProfileService.active = false;
        }
      });

      $scope.birthdays = function(newVal, type) {
        switch (type) {
          case 'd':
            return _.filter(days, function(v) {
              return v.indexOf(parseInt(newVal)) > -1
            });
            break;
          case 'm':
            if (isNaN(parseInt(newVal))) {
              return _.filter(months, function(v) {
                return v.toLowerCase().indexOf(newVal.toLowerCase()) > -1
              })
            } else {
              var monthIndex = parseInt(newVal) - 1;
              if (monthIndex < 1) {
                monthIndex = 0
              }
              if (monthIndex > 11) {
                monthIndex = 11
              }
              return [months[monthIndex]];
            }
            break;
          case 'y':
            return _.filter(years, function(v) {
              return v.indexOf(parseInt(newVal)) > -1
            });

            break;

        }
      };

      $scope.$watch('profile.birthday', function(newVal) {
        ProfileService.active = false;
      }, true);
      $scope.$watch('profile.gender', function() {
        ProfileService.active = false;
      });

      $scope.goGoGadget = function() {
        if ($scope.goForm.$invalid) {
          //console.log($scope.goForm);
          $scope.highlightErrors = true;
          $scope.highlightExtra = true;
          $timeout(function() {
            $scope.highlightExtra = false
          }, 2000);
          return;
        }

        $rootScope.expanded = true;

        var year = moment().year(ProfileService.birthday.year).format('YYYY'),
          month = moment().month(ProfileService.birthday.month).format('MM'),
          day = moment().date(ProfileService.birthday.day).format('DD');
        ProfileService.country = _.find(Countries, function(v) {
          return v.POPIO_NAME.toLowerCase() == ProfileService.country.toLowerCase()
        }).POPIO_NAME;
        //console.log(ProfileService.country);

        ProfileService.birthday = {
          year: year,
          month: month,
          day: day,
          formatted: [year, month, day].join('-')
        };

        ProfileService.hideSummaryCtrl = true;
        ProfileService.hideMilestonesCtrl = true;
        ProfileService.hideBirthdaysCtrl = true;
        ProfileService.hideExpectancyCtrl = true;
        ProfileService.hideDeathCtrl = true;

        $rootScope.milestonesLoadingStarted = false;
        $rootScope.summaryLoadingStarted = false;
        $rootScope.expectancyLoadingStarted = false;
        $rootScope.deathLoadingStarted = false;
        $rootScope.birthdaysLoadingStarted = false;

        $rootScope.dataLoadingFromServer = true;

        $rootScope.$emit('loadSummary');
        $rootScope.dataProvidedByForm = true;

        $location.path([
          year,
          month,
          day,
          ProfileService.gender,
          ProfileService.country,
          'home'
        ].join('/'));
      };


      $scope.showDatepicker = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.isDatepickerVisible = true;
      };

      $scope.isDatepickerVisible = false;
      $scope.countries = Countries;

      //$rootScope.$emit('ready');// ?
    }
  ])

  ;
}());
