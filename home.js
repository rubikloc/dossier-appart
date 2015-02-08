(function(){
	var app = angular.module('home',[]);

	app.controller('homeController',['$http',function($http){
		var home = this;
		home.contents =[];

		$http.get('home-content.json').
			success(function(data){
				home.contents = data;
			});

	}]);

	app.directive("headerMain",function(){
		return{
			restrict : "E",
			templateUrl : "header.html"	
		};
	});

})();