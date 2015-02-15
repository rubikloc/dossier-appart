(function(){
	var app= angular.module("applicationManager", ['ngRoute', 'angularFileUpload']);

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
		
		this.getAppFiles = function(user){

			var appFilesDefered = $q.defer();
	        var appFilesPromise = appFilesDefered.promise;

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
	        return appFilesPromise;
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

    app.controller('homeCtrl', ['$rootScope','$scope', 'applicationFactory', '$q', '$route', function($rootScope,$scope,applicationFactory,$q, $route){
    	

// Problem to solve
    	$rootScope.sessionUser = Parse.User.current();
// Problem to solve

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