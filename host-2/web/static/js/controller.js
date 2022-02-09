(function(angular) {
    'use strict';

    var robotshop = angular.module('robotshop', ['ngRoute']);

    // Share user between controllers
    robotshop.factory('currentUser', function() {
        var data = {
            uniqueid: '',
            user: {},
        };

        return data;
    });

    robotshop.config(['$routeProvider', '$locationProvider', ($routeProvider, $locationProvider) => {
        $routeProvider.when('/search/:text', {
            templateUrl: 'search.html',
            controller: 'searchform'
        }).when('/login', {
            templateUrl: 'login.html',
            controller: 'loginform'
        });

        // needed for URL rewrite hash
        $locationProvider.html5Mode(true);
    }]);

    // clear template fragment cache, development
    robotshop.run(function($rootScope, $templateCache) {
        $rootScope.$on('$viewContentLoaded', function() {
            $templateCache.removeAll();
        });
    });

    robotshop.controller('productform', function($scope, $http, $routeParams, $timeout, currentUser) {

        newrelic.addPageAction('productForm', { user_id: currentUser.uniqueid});
        $scope.data = {};
        $scope.data.message = ' ';
        $scope.data.product = {};
        $scope.data.rating = {};
        $scope.data.rating.avg_rating = 0;
        $scope.data.quantity = 1;

        $scope.rateProduct = function(score) {
            console.log('rate product', $scope.data.product.sku, score);
            var url = '/api/ratings/api/rate/' + $scope.data.product.sku + '/' + score;
            $http({
                url: url,
                method: 'PUT'
            }).then((res) => {
                $scope.data.message = 'Thankyou for your feedback';
                $timeout(clearMessage, 3000);
                loadRating($scope.data.product.sku);
            }).catch((e) => {
                console.log('ERROR', e);
            });
        };
        
        $scope.glowstan = function(vote, val) {
            console.log('glowstan', vote);
            var idx = vote;
            while(idx > 0) {
                document.getElementById('vote-' + idx).style.opacity = val;
                idx--;
            }
        };

        function loadRating(sku) {
            $http({
                url: '/api/ratings/api/fetch/' + sku,
                method: 'GET'
            }).then((res) => {
                $scope.data.rating = res.data;
            }).catch((e) => {
                console.log('ERROR', e);
            });
        }

        function clearMessage() {
            console.log('clear message');
            $scope.data.message = ' ';
        }
        
        loadRating($routeParams.sku);
    });


    robotshop.controller('shopform', function($scope, $http, $location, currentUser) {

        newrelic.addPageAction('shopForm', { user_id: currentUser.uniqueid});
        $scope.data = {};

        $scope.data.uniqueid = 'foo';
        $scope.data.searchText = '';

        $scope.search = function() {
            if($scope.data.searchText) {
                $location.url('/search/' + $scope.data.searchText);
                $scope.data.searchText = '';
            }
        };

        // unique id for cart etc
        function getUniqueid() {
            return new Promise((resolve, reject) => {
            $http({
                url: '/api/user/uniqueid',
                method: 'GET'
            }).then((res) => {
                resolve(res.data.uuid);
            }).catch((e) => {
                reject(e);
            });
        });
        }
        
        // watch for login
        $scope.$watch(() => { return currentUser.uniqueid; }, (newVal, oldVal) => {
            if(newVal !== oldVal) {
                $scope.data.uniqueid = currentUser.uniqueid;
            }
        });
    });

    robotshop.controller('searchform', function($scope, $http, $routeParams) {

        newrelic.addPageAction('searchForm',{});
        $scope.data = {};
        $scope.data.searchResults = [];
        var text = $routeParams.text;
        search(text);
    });

    robotshop.controller('loginform', function($scope, $http, currentUser) {

        newrelic.addPageAction('loginForm', { user_id: currentUser.uniqueid});
        $scope.data = {};
        $scope.data.name = '';
        $scope.data.email = '';
        $scope.data.password = '';
        $scope.data.password2 = '';
        $scope.data.message = '';
        $scope.data.user = {};

        $scope.login = function() {
            $scope.data.message = '';
            $http({
                url: '/api/user/login',
                method: 'POST',
                data: {
                    name: $scope.data.name,
                    password: $scope.data.password
                }
            }).then((res) => {
                newrelic.addPageAction('validLogin', { user_id: currentUser.uniqueid });
                var oldId = currentUser.uniqueid;
                $scope.data.user = res.data;
                $scope.data.user.password = '';
                $scope.data.password = $scope.data.password2 = '';
                currentUser.user = $scope.data.user;
                currentUser.uniqueid = $scope.data.user.name;
                loadHistory(currentUser.user.name);
            }).catch((e) => {
                newrelic.addPageAction('invalidLogin', { user_id: currentUser.uniqueid });
                $scope.data.message = 'ERROR ' + e.data;
                $scope.data.password = '';
            });
        };

        $scope.register = function() {
            $scope.data.message = '';
            $scope.data.name = $scope.data.name.trim();
            $scope.data.email = $scope.data.email.trim();
            $scope.data.password = $scope.data.password.trim();
            $scope.data.password2 = $scope.data.password2.trim();
            // all fields complete
            if($scope.data.name && $scope.data.email && $scope.data.password && $scope.data.password2) {
                if($scope.data.password !== $scope.data.password2) {
                    $scope.data.message = 'Passwords do not match';
                    $scope.data.password = $scope.data.password2 = '';
                    return;
                }
            }
            $http({
                url: '/api/user/register',
                method: 'POST',
                data: {
                    name: $scope.data.name,
                    email: $scope.data.email,
                    password: $scope.data.password
                }
            }).then(() => {
                $scope.data.user = {
                    name: $scope.data.name,
                    email: $scope.data.email
                };
                newrelic.addPageAction(
                    'registerForm',
                    {
                        username: $scope.data.name, 
                        email: $scope.data.email
                    }
                );
                $scope.data.password = $scope.data.password2 = '';
                currentUser.user = $scope.data.user;
                currentUser.uniqueid = $scope.data.user.name;
            }).catch((e) => {
                $scope.data.message = 'ERROR ' + e.data;
                $scope.data.password = $scope.data.password2 = '';
            });
        };

        function loadHistory(id) {
            $http({
                url: '/api/user/history/' + id,
                method: 'GET'
            }).then((res) => {
                $scope.data.orderHistory = res.data.history;
            }).catch(() => {
            });
        }

        if(!angular.equals(currentUser.user, {})) {
            $scope.data.user = currentUser.user;
            loadHistory(currentUser.user.name);
        }
    });

}) (window.angular);
