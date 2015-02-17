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

	app.service('initApplicationFile', ['$http','$q', function($http,$q){
		return function(user){

			var initDefered = $q.defer();
			var application = [];

			$http.get('application-types.json').
				then(
					function(response){

						angular.forEach(response.data, function(ApplicationFileType){

							var applicationFile = new Parse.Object("ApplicationFile");
							applicationFile.set("type", ApplicationFileType.type);
							applicationFile.setACL(new Parse.ACL(user));
							applicationFile.set("user",user);
							application.push(applicationFile);
						});


						Parse.Object.saveAll(application, {
							success:function(appResults){
								initDefered.resolve(appResults);
							},
							error:function(error){
								initDefered.reject(error);
							}
						});
					});

			return initDefered.promise;
		};
			
	}])

	app.factory('applicationFactory', ['$q', function($q){
		
		return {
			getAppFiles: function(user){

				var appFilesDefered = $q.defer();

				var ApplicationFile = Parse.Object.extend("ApplicationFile");        
		        var appFilesQuery = new Parse.Query(ApplicationFile);
		        appFilesQuery.equalTo("user",user);
		        
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
		return function upload(file, type, user){

			var parseFile = new Parse.File(file.name, file);

			parseFile.save().
				then(
					function() {
						console.log("The file has been saved to Parse.") ;
					},
					function(error) {
						console.log(error);
					});

			var applicationFile = new Parse.Object("ApplicationFile");
			
			applicationFile.set("file", parseFile);
			applicationFile.set("type", type);
			applicationFile.set("fileName", file.name)
			applicationFile.setACL(new Parse.ACL(user));
			applicationFile.set("user",user);	

			var applicationDeferred = $q.defer();

			applicationFile.save(null, {
				success: function(applicationFile) {
				    applicationDeferred.resolve(applicationFile);
				},
				error: function(applicationFile, error) {
				  	applicationDeferred.resolve(error);
				}
			});	

			return applicationDeferred.promise ;
		};
	}])


    app.controller('signupCtrl', ['sessionService','$scope','$rootScope','$location','initApplicationFile', function(sessionService,$scope,$rootScope,$location,initApplicationFile){
    	this.signUp = function() {
    		$scope.loading = true;
    		//création du compte via le service sessionService
    		sessionService.signup($scope.user).
    			then(
	    			function(user){
	                    $rootScope.sessionUser = user;
	                    //initiatlisation des applicationFiles pour les différents types via le service initApplicationFile
	                    initApplicationFile(user).
	                    	then(
	                    		function(appResults){
	                    			console.log("fini");
	                    			//redirection vers la page d'accueil
	                    			$location.path('/home');
    								$scope.loading = false;
	                    		},
	                    		function(error){
    								$scope.loading = false;
									console.log("erreur à l'initialisation des appfiles",error);
	                    		});
	                },
	                function(errorMsg){
						$scope.loading = false;
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

    app.controller('homeCtrl', ['$rootScope','$scope', 'applicationFactory', '$route', 'uploadFactory', function($rootScope,$scope,applicationFactory,$route, uploadFactory){
    	
    	applicationFactory.getAppFiles($rootScope.sessionUser).
            then(function(results){
        		var application =[];

		        for(var i= 0; i < results.length; i++){
		            
		            var simpleApplicationFile = {"type":"default"};

		            simpleApplicationFile.id = results[i].id;
		            if (results[i].get("type")) {
		            	simpleApplicationFile.type = results[i].get("type");
		            };

		            if(results[i].get("file")) {
		            	simpleApplicationFile.url = results[i].get("file").url();
		            };
		        	application.push(simpleApplicationFile);
		        }
                $scope.application = application;

            },
            function(error){
                console.log('erreur dans la récup des résultats pour un user: ',error);
            }
        	);   


		$scope.$watch('files', function () {	    

	        if ($scope.files && $scope.files.length) {

	            for (var i = 0; i < $scope.files.length; i++) {
	                var file = $scope.files[i];
  					
  					uploadFactory(file, $scope.newType, $rootScope.sessionUser).
  						then(
  							function(applicationFile){
  								$route.reload();    	
  							},
  							function(error){
  								console.log(error);
  							});
		            }
		        }
	    });

    }])

})();