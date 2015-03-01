// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("notifyStaff", function(request, response) {
 
 
    var newMessage = 
            {   
                text: "New file Completed by " + request.params.params.user_email + " (id: " + request.params.params.user_id + ")",
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
 
 
 
});