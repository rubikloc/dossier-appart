(function(){
	var app= angular.module("applicationManager", ['ngRoute']);

	app.config(['$routeProvider', function($routeProvider) {	
		$routeProvider.
	        when('/signup', {templateUrl: 'signup.html', controller: 'signupCtrl as signupCtrl'}).
	        when('/signin', {templateUrl: 'signin.html', controller: 'signinCtrl as signinCtrl'}).
	        when('/home', {templateUrl: 'home.html', controller: 'homeCtrl as homeCtrl'}).
	        otherwise({redirectTo: '/signup'});
    }]);

	app.run(function(){
		Parse.initialize("HCf9xf3DDDBH4BTY3qwRqxVHeiQ2GW1V2JIx6KBv", "78VAu3yojn4H5bhjKEPa1opxy3bHmQSfPk8S1dAo");
	});

	app.service('sessionService', ['$rootScope','$q', '$location', function($rootScope, $q, $location){

		this.login = function(user){

			var loginDefered = $q.defer();
			var loginPromise = loginDefered.promise;

			loginPromise.then(
				function(user){	
					$rootScope.sessionUser = user;
					$location.path('/home');
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
		
		this.signup = function(user) {
			var signupDefered = $q.defer();
        	var signupPromise = signupDefered.promise;
        
	        signupDefered.promise
	            .then(function(user){
						console.log("utilisateur créé ",user.objectId);
	                    $rootScope.sessionUser = user;
	                    $location.path('/home');
	                },
	                function(msg,object){
						console.log(msg);	                    
	                });
	        
	        var newUser = new Parse.User();
    		newUser.set("username",user.email);
    		newUser.set("email",user.email);
    		newUser.set("password",user.password);
    		
    		newUser.signUp(null, {
    				success : function(user){
    				    signupDefered.resolve(user);
    					},
    				error : function(object,msg){
    				    signupDefered.reject(msg,object);
    				}
    		});
		};

		this.logout = function(){
			Parse.User.logOut();
			$location.path('/signin');
		};


	}]);

	app.factory('applicationFactory', ['$q', function($q){
		
		this.getAppFiles = function(user, $scope){

			var appFilesDefered = $q.defer();
	        var appFilesPromise = appFilesDefered.promise;

	        appFilesPromise.
	            then(function(results){
	                
            		var urls =[];
			        for(var i= 0; i < results.length; i++){
			            urls.push(results[i].get("applicantResumeFile").url());
			        }
			        
	                $scope.appFilesUrls = urls;
	            },
	            function(error){
	                console.log('erreur dans la récup des résultats pour un user: ',error);
	            }
	        );   

			var JobApplication = Parse.Object.extend("JobApplication");        
	        
	        var appFilesQuery = new Parse.Query(JobApplication);
	        
	        appFilesQuery.equalTo("parent",user);
	        
	        appFilesQuery.find({
	           success : function(results){
	               appFilesDefered.resolve(results);
	           },
	           error : function(object, error){
	               appFilesDefered.reject(object,error);
	           }
	        });
	        
        };

		return this;
	}])


    app.controller('signupCtrl', ['sessionService','$scope', function(sessionService,$scope){
    	this.signUp = function() {
    		sessionService.signup($scope.user);

    	};
    }]);


    app.controller('signinCtrl', ['sessionService','$scope', function(sessionService,$scope){
    	this.signIn = function(){
    		console.log($scope);
    		sessionService.login($scope.user);
    	};

    }]);


    app.controller('headerCtrl', ['sessionService', '$scope', function(sessionService, $scope){
    	this.logOut = function(){
    		sessionService.logout();

    	};
    	
    }])

    app.controller('homeCtrl', ['$rootScope','$scope', 'applicationFactory', function($rootScope,$scope,applicationFactory){
    	applicationFactory.getAppFiles($rootScope.sessionUser, $scope);

    }])


})();