(function(){
	var app= angular.module("applicationManager", ['ngRoute', 'angularFileUpload','ui.unique']);

	app.config(['$routeProvider', function($routeProvider) {	
		$routeProvider.
	        when('/signup', {templateUrl: 'signup.html', controller: 'signupCtrl as signupCtrl'}).
	        when('/signin', {templateUrl: 'signin.html', controller: 'signinCtrl as signinCtrl'}).
	        when('/home', {templateUrl: 'home.html', controller: 'homeCtrl as homeCtrl'}).
	        when('/success', {templateUrl: 'success.html'}).
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
		        appFilesQuery.ascending('createdAt');
		        
		        appFilesQuery.find({
		           success : function(results){
		               appFilesDefered.resolve(results);
		           },
		           error : function(object, error){
		               appFilesDefered.reject(object,error);
		           }
		        });
		        return appFilesDefered.promise;
		    },
		    //mise à jour d'un applicationFile avec le bon fichier
		    updateAppFiles : function(file,appFile, user){
		    	var parseFile = new Parse.File(file.name, file);
				parseFile.save().
					then(
						function() {
						},
						function(error) {
							console.log("erreur d'enregistrement du fichier",error);
						});

		    	var updateDefered = $q.defer();
		    	var applicationFile = Parse.Object("ApplicationFile");
		    	applicationFile.id= appFile.id;
		    	applicationFile.set("file",parseFile);
		    	applicationFile.set("fileName",file.name);
		    	applicationFile.save(null, {
		    		success : function(applicationFile){
		    			updateDefered.resolve(applicationFile);
		    		},
		    		error : function(applicationFile,error){
		    			updateDefered.reject("erreur d'enregistrement du applicationFile",error);
		    		}
		    	});

		    	return updateDefered.promise;
		    }
        };
	}])

	app.factory('uploadFactory', ['$q', function($q){
		return  {
			upload : function (file, type, user){

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
					  	applicationDeferred.reject(error);
					}
				});	

				return applicationDeferred.promise ;
			}
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

    app.controller('homeCtrl', ['$rootScope','$scope', 'applicationFactory', '$route', 'uploadFactory', '$location', function($rootScope,$scope,applicationFactory,$route, uploadFactory, $location){
    	
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
		            simpleApplicationFile.id = results[i].id;
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
  					
  					uploadFactory.upload(file, $scope.newType, $rootScope.sessionUser).
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


		$scope.completeApplication = function() {

			Parse.Cloud.run('notifyStaff', {
				params : {
					user_id: $rootScope.sessionUser.id,
					user_email : $rootScope.sessionUser.get("email")
					}
			}, {
			  success: function(result) {
			    console.log("Staff has been notified ", result);

			  },
			  error: function(error) {
			  }
			});
			
		    $location.path('/success');	    

		};



    }])

	app.controller('uploadCtrl', ['$scope','applicationFactory','$rootScope','$route', function($scope,applicationFactory,$rootScope,$route){
		$scope.startUpload = function(){

	        if ($scope.applicationFile.mfiles && $scope.applicationFile.mfiles.length) {
	            for (var i = 0; i < $scope.applicationFile.mfiles.length; i++) {
	                var file = $scope.applicationFile.mfiles[i];
						
						applicationFactory.updateAppFiles(file,$scope.applicationFile,$rootScope.sessionUser).
							then(
								function(applicationFile){
									$scope.applicationFile.mfiles = undefined;
									$route.reload();
								},
								function(error){
									console.log(error);
								});
	            }
        	}
		};
		
	}])



})();