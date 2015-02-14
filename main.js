(function(){
	var app= angular.module("applicationManager", ['ngRoute'])

	app.config(['$routeProvider', function($routeProvider) {	
		$routeProvider.
	        when('/signup', {templateUrl: 'signup.html', controller: 'signupCtrl'}).
	        when('/signin', {templateUrl: 'signin.html', controller: 'signinCtrl as si'}).
	        when('/test', {templateUrl: 'header.html'}).
	        otherwise({redirectTo: '/signup'});
    }]);

	app.run(function(){
		Parse.initialize("HCf9xf3DDDBH4BTY3qwRqxVHeiQ2GW1V2JIx6KBv", "78VAu3yojn4H5bhjKEPa1opxy3bHmQSfPk8S1dAo");
	});

	app.service('sessionService', ['$rootScope','$q', function($rootScope, $q){

		this.login = function(user,$location){

			var loginDefered = $q.defer();
			var loginPromise = loginDefered.promise;

			loginPromise.then(
				function(user){	
					$rootScope.sessionUser = user;
					$location.path('/test');
				//	console.log($rootScope.sessionUser.get("username"));
				},
				function(error){
					console.log(error);
				});

			Parse.User.logIn(user.email,user.password, {
				success: function(user){
					loginDefered.resolve(user);
				},
				error:function(error){
					loginDefered.reject(error);
				}
			});

		};

	}]);


    app.controller('signupCtrl', function(){
    });


    app.controller('signinCtrl', ['sessionService','$scope','$location', function(sessionService,$scope,$location){
    	this.signIn = function(){
    		console.log($scope);
    		sessionService.login($scope.user,$location);
    	};

    	console.log(this.signIn);

    }]);

})();