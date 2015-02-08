(function() {

	var app = angular.module('applicationManager',['angularFileUpload']);

	app.controller('applicationController', ['$http','$q',function($http,$q){


		Parse.initialize("HCf9xf3DDDBH4BTY3qwRqxVHeiQ2GW1V2JIx6KBv", "78VAu3yojn4H5bhjKEPa1opxy3bHmQSfPk8S1dAo");

		var thisApp =this;
		thisApp.username = "";


		var myThirdDefered = $q.defer();
		var myThirdPromise = myThirdDefered.promise;

		myThirdPromise.then(
			function(user){
				var currentUser = Parse.User.current();
				thisApp.username = currentUser.get("username");
				console.log(thisApp.username); 
			},
			function(error){
				console.log(error);
			})
/*
		var user = new Parse.User();
		user.set("username","test");
		user.set("password","test");
		user.set("email","test@test.com");
		user.signUp(null, {
				success : function(user){
					console.log(user.objectId);
					Parse.},
				error : function(error){
					console.log(error);
				}
		});
*/
		Parse.User.logIn("test","test", {
			success: function(user){
				myThirdDefered.resolve(user);
			},
			error:function(error){
				myFirstDeferred.reject(error);
			}
		});

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



	app.controller('uploadController', ['$scope', function ($scope) {
	    $scope.$watch('files', function () {
	        $scope.upload($scope.files);
	    });

	    $scope.upload = function (files) {

	        if (files && files.length) {

	            for (var i = 0; i < files.length; i++) {
	                var file = files[i];
	                console.log(file);
  					var parseFile = new Parse.File(file.name, file);

					parseFile.save().then(function() {
					  alert("The file has been saved to Parse.") ;
					}, function(error) {
					  console.log(error);
					});

					var jobApplication = new Parse.Object("JobApplication");
					jobApplication.set("applicantName", "Joe Smith");
					jobApplication.set("applicantResumeFile", parseFile);
					jobApplication.set("fileName", file.name)
					jobApplication.setACL(new Parse.ACL(Parse.User.current()));
					jobApplication.save();					

	            }
	        }
	    };
	}]);

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





})();


