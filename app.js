(function() {

	var app = angular.module('applicationManager',['angularFileUpload']);


	app.run(function($rootScope){
		
		Parse.initialize("HCf9xf3DDDBH4BTY3qwRqxVHeiQ2GW1V2JIx6KBv", "78VAu3yojn4H5bhjKEPa1opxy3bHmQSfPk8S1dAo");
		$rootScope.sessionUser = {};
		//$rootScope.sessionUser = Parse.User.current();
		//$rootScope.sessionUser.get = function(test) {};
		
	});

	app.service('sessionService', ['$rootScope','$q', function($rootScope, $q){

		this.login = function($scope){

			var loginDefered = $q.defer();
			var loginPromise = loginDefered.promise;

			loginPromise.then(
				function(user){	
					$rootScope.sessionUser = user;
			//		$scope.username = user.get("username");
				},
				function(error){
					console.log(error);
				});

			Parse.User.logIn("alex@ifeelgoods.com","test", {
				success: function(user){
					loginDefered.resolve(user);
				},
				error:function(error){
					loginDefered.reject(error);
				}
			});

		};

	}]);


/*

	app.factory('applicationFactory', ['$q', function(){
		return function name(){
			
		};
	}])

*/

	app.controller('applicationController', ['$http','$q','$scope','$rootScope', 'sessionService',function($http,$q,$scope,$rootScope, sessionService){


//		Parse.initialize("HCf9xf3DDDBH4BTY3qwRqxVHeiQ2GW1V2JIx6KBv", "78VAu3yojn4H5bhjKEPa1opxy3bHmQSfPk8S1dAo");


		sessionService.login($scope); 

		$scope.getEmail = function() {
			$scope.email = $rootScope.sessionUser.get("email");
			$scope.username = $rootScope.sessionUser.get("username");
		};


	//	$scope.username = $rootScope.sessionUser.get("username");


/*
		var TestObject = Parse.Object.extend("TestObject2");

		var testObject = new TestObject();
		testObject.save({foo: "bar", user : 123}).then(function(object) {
		alert("yay! it worked");
		});



		var user = new Parse.User();
		user.set("username", "my name");
		user.set("password", "my pass");
		user.set("email", "email@example.com");
		
		// other fields can be set just like with Parse.Object
		user.set("phone", "650-555-0000");
		
		user.signUp(null, {
		  success: function(user) {
		    // Hooray! Let them use the app now.
		  },
		  error: function(user, error) {
		    // Show the error message somewhere and let the user try again.
		    alert("Error: " + error.code + " " + error.message);
		  }
		});*/





		var application = this;
		application.files = [];

		$http.get('application-files.json').			
			success(function(data){
				application.files = data;
			});

	}]);

	app.controller('fileController', function(){
		
		this.hasUrl = function(file) {
			return file.url ? true:false;
		};

	});

    app.controller('retrieveController', ['$q','$scope', function($q,$scope){
        
        var userResults = this;
        
        userResults.results = [];
        
        
        //fonction qui récupère les JobApplication du user courent et qui transmet les urls à la vue
        $scope.retrieveResults = function() {
            console.log($scope);
            var userResultDefered = $q.defer();
            
            var userResultPromise = userResultDefered.promise;
            
            userResultPromise.
                then(function(results){
                    var urls =[];
                    for(var i= 0; i < results.length; i++){
                        urls.push(results[i].get("applicantResumeFile").url());
                    }
                    userResults.results =urls;
                },
                function(error){
                    console.log('erreur dans la récup des résultats pour un user: ',error);
                }
            );
                
            var JobApplication = Parse.Object.extend("JobApplication");
            
            var userResultsQuery = new Parse.Query(JobApplication);
            
            userResultsQuery.equalTo("parent",Parse.User.current());
            
            userResultsQuery.find({
               success : function(results){
                   userResultDefered.resolve(results);
               },
               error : function(object, error){
                   userResultDefered.reject(object,error);
               }
            });
        }
    }]);

    app.controller('signupController',['$q','$scope',function($q,$scope){
        var signUp = this;
        signUp.user = {};
        $scope.isSignUpInvalid = false;
        $scope.signupError ="";
        $scope.isSignupSuccessful =false;
        
        
        var signupDefered = $q.defer();
        var signupPromise = signupDefered.promise;
        
        signupDefered.promise
            .then(function(user){
					console.log("utilisateur créé",user.objectId);
                    $scope.isSignupSuccessful =true;
                    $scope.isSignUpInvalid = false;
				    $scope.username = user.get("username");
				    console.log(user.get("username"));
                },
                function(msg,object){
				    console.log("dans la fonction reject :",msg,object);
					$scope.signupError = msg.message;
					$scope.isSignUpInvalid = true;
                    
                });
        
        this.signUp = function(){
    		var user = new Parse.User();
    		user.set("username",signUp.user.email);
    		user.set("email",signUp.user.email);
    		user.set("password",signUp.user.password);
    		user.signUp(null, {
    				success : function(user){
    				    signupDefered.resolve(user);
    					},
    				error : function(object,msg){
    				    signupDefered.reject(msg,object);
    				}
    		});
        };
        
        
        
    }]);


	app.controller('uploadController', ['$scope', '$q', function ($scope, $q) {
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
									$scope.url = jobApplication.get('applicantResumeFile').url();
								},
								function(error){
									console.log("Pb");
								});



					var jobApplication = new Parse.Object("JobApplication");
					jobApplication.set("applicantName", "Joe Smith");
					jobApplication.set("applicantResumeFile", parseFile);
					jobApplication.set("fileName", file.name)
					jobApplication.setACL(new Parse.ACL(Parse.User.current()));
					jobApplication.set("parent",Parse.User.current());
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
	}]);


/*

	app.controller('getImages', ['$scope','$q', function($scope,$q){

		
		$scope.url = "";

		//create a defered to embed async call
		var myFirstDeferred = $q.defer();


		var myFirstPromise = myFirstDeferred.promise;

		myFirstPromise
			.then(function(jobApplication) {
			    var file = jobApplication.get("applicantResumeFile");
			    // The object was retrieved successfully.
			    $scope.url = file.url();
			}, function(error) {
			    console.log('couille', error);
			});




		var Test = Parse.Object.extend("JobApplication");
		var query = new Parse.Query(Test);

		//call async query and send the answer to the promise
		query.get("5HeoGFg7ul", {
		  	success: function(jobApplication) {
		  		myFirstDeferred.resolve(jobApplication);
		  	},
		  	error: function(object, error) {
		  		myFirstDeferred.reject(object,error);
		  	}
		});	
	}]);

*/



})();


