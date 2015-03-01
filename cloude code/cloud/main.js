// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("notifyStaff", function(request, response) {


	var currentUser = new Parse.User({id:request.params.params.user_id});
 
 	var ApplicationFile = Parse.Object.extend("ApplicationFile");        
    var appFilesQuery = new Parse.Query(ApplicationFile);
    appFilesQuery.equalTo("user",currentUser);

    appFilesQuery.find({
		           success : function(results){
		           		generateEmail(request,results);
		           },
		           error : function(object, error){
		           		console.log(error);
		           }
		        });
    
 //c'est sale mais ca marche...il faudra surement changer les paramètres
	 var generateEmail = function(request,results){

	 	var fileList =[];

	 	if(results && results.length != 0){
	 		for(var i = 0; i<results.length; i++){
	 			 if(results[i].get("file")) {
		            	fileList.push('\n' + results[i].get("file").url());
		            };
	 		}
	 	}

	    var newMessage = 
	            {   
	                text: "New file Completed by " + request.params.params.user_email + " (id: " + request.params.params.user_id + ")" + "\n" + "Voici la liste des fichiers :"+ "\n"+ fileList,
	                subject: "New File Completed!",
	                from_email: request.params.params.user_email,
	                from_name: "Dossier Appart Notifier",
	                to: [
	                  {
	                    email: "alexandre.huckert@gmail.com",
	                    name: "Alex",
	                    type: "to"
	                  },
	 
	                  {
	                    email: "loic.charpentier@gmail.com",
	                    name: "Loic",
	                    type: "to"
	                  }
	 
	                ]
	              }; 
	                
	    var Mandrill = require('mandrill');
	     
	    Mandrill.initialize('RFFx7QftdIeqG0VIH-dXnQ');
	 
	    Mandrill.sendEmail({
	      message : newMessage,
	      async: true
	    },{
	      success: function(httpResponse) {
	        console.log(httpResponse);
	        response.success("Email sent!");
	      },
	      error: function(httpResponse) {
	        console.error(httpResponse);
	        response.error("Uh oh, something went wrong");
	      }
	    });
	}; 
});