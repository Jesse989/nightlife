var app = angular.module('app', ['ngRoute', 'ngResource']);

app.factory('barsResource', function($resource) {
    return $resource('api/bars/:id', null,
    {
        'update': { method:'PUT' }
    });
});

app.factory('rsvpsResource', function($resource) {
    return $resource('api/rsvps/:id', null,
    {
        'update': { method:'PUT' }
    });
});

app.service('sharedProperties', function () {
    var current_user = {
        username: "",
        password: ""
    };
    

    return {
        getUsername: function () {
            return current_user.username;
        },
        setUsername: function(value) {
            current_user.username = value;
        },
        getPassword: function () {
            return current_user.password;
        },
        setPassword: function(value) {
            current_user.password = value;
        }
    };
});



app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'main.html',
            controller: 'api'
        })
        .when('/login', {
            templateUrl: 'login.html',
            controller: 'authController'
        })
        .when('/register', {
            templateUrl: 'register.html',
            controller: 'authController'
        });
});
  


app.run(function($rootScope, sharedProperties, $http){
                
                geolocator.config({
                language: "en",
                google: {
                    version: "3",
                    key: "AIzaSyDJy8hlezJGMnY8a-GzDOWk2JH3gg6iW-Y"
                }
            });
 
            window.onload = function () {
                var options = {
                    enableHighAccuracy: true,
                    timeout: 1000,
                    maximumAge: 0,
                    desiredAccuracy: 30,
                    fallbackToIP: true, // fallback to IP if Geolocation fails or rejected 
                    addressLookup: true,
                    timezone: false
                };
                geolocator.locate(options, function (err, location) {
                    if (err) return console.log(err);
                    $rootScope.defaultAddress = location.address.city;
                });
            };
    $rootScope.authenticated = false;
});

app.controller('api', [ '$http', '$scope', 'barsResource', 'rsvpsResource', '$rootScope', 'sharedProperties', function($http, $scope, barsResource, rsvpsResource, $rootScope, sharedProperties) {
    
        $scope.error_message = "";
        $scope.going = { 
            committed: false,
            location: null
            };
            
            
                        

 
        
        $scope.rsvp = function($index) {
            if($rootScope.authenticated){
                if(!$scope.going.committed){
                    $rootScope.attendance[0].attendance[$index]++;
                    $scope.going.committed = true;
                    $scope.going.location = $index;
                    rsvpsResource.update({ id: $rootScope.attendance[0].location}, $rootScope.attendance[0]);
                    
                } else if ($scope.going.committed && $scope.going.location === $index){
                    $rootScope.attendance[0].attendance[$index]--;
                    $scope.going.committed = false;
                    $scope.going.location = null;
                    rsvpsResource.update({ id: $rootScope.attendance[0].location}, $rootScope.attendance[0]);            } 
            } else {
                
             
                $scope.changeLocation('#/login', true);
            }
        }
      
        $scope.changeLocation = function(url, forceReload) {
            $scope = $scope || angular.element(document).scope();
            if(forceReload || $scope.$$phase) {
                window.location = url;
            }
        };
        
        $scope.toTitleCase = function(str) {
            return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        };
        
        
        $rootScope.getBars = function(address) {
            $scope.address = $scope.toTitleCase(address);
            
            var bars = barsResource.query({id: ( $scope.address || $rootScope.defaultAddress)}, function() {
                $rootScope.bars = bars;
  
                rsvpsResource.query({id: ($scope.address || $rootScope.defaultAddress)}, function(data){
                    $rootScope.attendance = data;
                        console.log($rootScope.attendance.$promise)
                });
            });
        };
}]);

app.controller('authController', function(sharedProperties, $scope, $http, $location, $rootScope){
    $scope.user = {username: '', password: ''};
    $scope.error_message = '';
    $rootScope.authenticated = false;
    
    
    
    $rootScope.signout = function() {
        $http.get('auth/signout');
        $rootScope.authenticated = false;
        sharedProperties.setUsername($rootScope.ip);
        sharedProperties.setPassword("");
        $location.path('/');
    };
    
    $scope.login = function() {
        $http.post('/auth/login', $scope.user).success(function(data) {
            if(data.state == 'success'){
                $rootScope.authenticated = true;
                sharedProperties.setUsername(data.user.username);
                sharedProperties.setPassword(data.user.password);
                $location.path('/');
                $rootScope.getBars($rootScope.address)
            }
            else {
                $scope.error_message = data.message;
            }
        });
    };
   
    $scope.register = function() {
        if($scope.user.password === $scope.user.verifyPassword){
            $http.post('/auth/signup', $scope.user).success(function(data){
                if(data.state == 'success'){
                    $rootScope.authenticated = true;
                    sharedProperties.setUsername(data.user.username);
                    $location.path('/');
                }
                else{
                    $scope.error_message = data.message;
                    $rootScope.getBars($rootScope.address)
                }
            });
        } else{
            $scope.user.password = "";
            $scope.user.verifyPassword = "";
            $scope.error_message = 'Passwords do not match';
        }
    };
    
});
