(function(){
	var app= angular.module("applicationManager", ['ngRoute'])

	app.config(['$routeProvider', function($routeProvider) {	
		$routeProvider.
	        when('/signup', {templateUrl: 'signup.html', controller: 'signupCtrl'}).
	        when('/signin', {templateUrl: 'signin.html', controller: 'signinCtrl'}).
	        otherwise({redirectTo: '/signup'});
    }]);

	app.run(function(){
		Parse.initialize("HCf9xf3DDDBH4BTY3qwRqxVHeiQ2GW1V2JIx6KBv", "78VAu3yojn4H5bhjKEPa1opxy3bHmQSfPk8S1dAo");		
	});

	app.service('sessionService', ['$rootScope','$q', function($rootScope, $q){

		this.login = function(user){

			var loginDefered = $q.defer();
			var loginPromise = loginDefered.promise;

			loginPromise.then(
				function(user){	
					$rootScope.sessionUser = user;
				//	console.log($rootScope.sessionUser.get("username"));
				},
				function(error){
					console.log(error);
				});

			Parse.User.logIn(user.login,user.password, {
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


    app.controller('signinCtrl', ['sessionService', '$scope', function(sessionService, $scope){
    	$scope.signIn = function(){
    		console.log("test");
    		sessionService.login($scope.user);
    	};

    }]);

})();