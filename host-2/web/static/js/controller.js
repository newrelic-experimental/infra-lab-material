(function(angular) {
    'use strict';

    var robotshop = angular.module('robotshop', ['ngRoute']);

    // Share user between controllers
    robotshop.factory('currentUser', function() {
        var data = {
            uniqueid: '',
            user: {},
            cart: {
                total: 0
            }
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

        function clearMessage() {
            $scope.data.message = ' ';
        }
        
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
