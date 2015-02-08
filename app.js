(function() {

	var app = angular.module('applicationManager',['angularFileUpload']);

	app.controller('applicationController', ['$http',function($http){

		Parse.initialize("HCf9xf3DDDBH4BTY3qwRqxVHeiQ2GW1V2JIx6KBv", "78VAu3yojn4H5bhjKEPa1opxy3bHmQSfPk8S1dAo");

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

		//this.addFile = function(application){};

	});



	app.controller('uploadController', ['$scope', '$q', function ($scope, $q) {
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
									console.log($scope.url);
								},
								function(error){
									console.log("Pb");
								});



					var jobApplication = new Parse.Object("JobApplication");
					jobApplication.set("applicantName", "Joe Smith");
					jobApplication.set("applicantResumeFile", parseFile);
					jobApplication.set("fileName", file.name)
					jobApplication.save(null, {
						  success: function(jobApplication) {
						    // Execute any logic that should take place after the object is saved.
						    alert('New object created with objectId: ' + jobApplication.id);
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
			.then(function(data) {
			    var file = data.get("applicantResumeFile");
			    // The object was retrieved successfully.
			    $scope.url = file.url();
			}, function(error) {
			    console.log('couille', error);
			});




		var Test = Parse.Object.extend("JobApplication");
		var query = new Parse.Query(Test);

		//call async query and send the answer to the promise
		query.get("JUGkrZ7XQe", {
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


