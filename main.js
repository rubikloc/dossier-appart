(function(){
	var app= angular.module("applicationManager", ['ngRoute', 'angularFileUpload']);

	app.config(['$routeProvider', function($routeProvider) {	
		$routeProvider.
	        when('/signup', {templateUrl: 'signup.html', controller: 'signupCtrl as signupCtrl'}).
	        when('/signin', {templateUrl: 'signin.html', controller: 'signinCtrl as signinCtrl'}).
	        when('/home', {templateUrl: 'home.html', controller: 'homeCtrl as homeCtrl'}).
	        otherwise({redirectTo: '/signup'});
    }]);

	app.run(['$rootScope', function($rootScope){
		Parse.initialize("HCf9xf3DDDBH4BTY3qwRqxVHeiQ2GW1V2JIx6KBv", "78VAu3yojn4H5bhjKEPa1opxy3bHmQSfPk8S1dAo");
    	$rootScope.sessionUser = Parse.User.current();
	}]);

	app.service('sessionService', ['$q', function($q){

		this.login = function(user){
			var loginDefered = $q.defer();

			Parse.User.logIn(user.email,user.password, {
				success: function(user){
					loginDefered.resolve(user);
				},
				error:function(user,errorMsg){
					loginDefered.reject(errorMsg);
				}
			});
			return loginDefered.promise;

		};
		
		this.signup = function(user) {
			var signupDefered = $q.defer();
        
	        var newUser = new Parse.User();
    		newUser.set("username",user.email);
    		newUser.set("email",user.email);
    		newUser.set("password",user.password);
    		
    		newUser.signUp(null, {
    				success : function(user){
    				    signupDefered.resolve(user);
    					},
    				error : function(user,errorMsg){
    				    signupDefered.reject(errorMsg);
    				}
    		});
    		return signupDefered.promise;

		};

		this.logout = function(){
			Parse.User.logOut();
		};
	}]);

	app.factory('applicationFactory', ['$q', function($q){
		
		return {
			getAppFiles: function(user){

				var appFilesDefered = $q.defer();

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
		        return appFilesDefered.promise;
		    }
        };
	}])

	app.factory('uploadFactory', ['$q', function($q){
		return function upload(files){
			
		};
	}])


    app.controller('signupCtrl', ['sessionService','$scope','$rootScope','$location', function(sessionService,$scope,$rootScope,$location){
    	this.signUp = function() {
    		sessionService.signup($scope.user).
    			then(
	    			function(user){
	                    $rootScope.sessionUser = user;
	                    $location.path('/home');
	                },
	                function(errorMsg){
	                	$scope.signError = errorMsg.message;           
	                });				
    	};
    }]);


    app.controller('signinCtrl', ['sessionService','$scope','$rootScope','$location', function(sessionService,$scope,$rootScope,$location){
    	this.signIn = function(){
    		sessionService.login($scope.user).
    			then(
    				function(user){
						$rootScope.sessionUser = user;
						$location.path('/home');
    				},
    				function(errorMsg){
	                	$scope.signError = errorMsg.message;
    				});
    	};
    }]);


    app.controller('headerCtrl', ['sessionService', '$location', function(sessionService, $location){
    	this.logOut = function(){
    		sessionService.logout();
			$location.path('/signin');
    	};
    }])

    app.controller('homeCtrl', ['$rootScope','$scope', 'applicationFactory', '$q', '$route', function($rootScope,$scope,applicationFactory,$q, $route){
    	
    	applicationFactory.getAppFiles($rootScope.sessionUser).
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

// A ré-écrire proprement

		$scope.$watch('files', function () {
	        $scope.upload($scope.files);
	    });

	    $scope.upload = function (files) {

	        if (files && files.length) {

	            for (var i = 0; i < files.length; i++) {
	                var file = files[i];
  					var parseFile = new Parse.File(file.name, file);

					parseFile.save().then(function() {
					  //alert("The file has been saved to Parse.") ;

					}, function(error) {
					  console.log(error);
					});

					$scope.url = "";
					var mySecondDeferred = $q.defer();
					var mySecondPromise = mySecondDeferred.promise;

					mySecondPromise.
							then(function(jobApplication){
									$route.reload();
								},
								function(error){
									console.log("Pb");
								});

					var jobApplication = new Parse.Object("JobApplication");
					jobApplication.set("applicantName", "Joe Smith");
					jobApplication.set("applicantResumeFile", parseFile);
					jobApplication.set("fileName", file.name)
					jobApplication.setACL(new Parse.ACL($rootScope.sessionUser));
					jobApplication.set("parent",$rootScope.sessionUser);
					jobApplication.save();					

					jobApplication.save(null, {
						  success: function(jobApplication) {
						    // Execute any logic that should take place after the object is saved.
						    mySecondDeferred.resolve(jobApplication);

						  },
						  error: function(jobApplication, error) {
						    // Execute any logic that should take place if the save fails.
						    // error is a Parse.Error with an error code and message.
						    alert('Failed to create new object, with error code: ' + error.message);
						  }
			});					


		            }
		        }
		    };



    }])

})();