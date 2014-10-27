var coffee = require("./coffee.js");
var cantina = require("./cantina.js");
var office = require("./office.js");
var hackerspace = require("./hackerspace.js");
var officeLight = require("./officeLight.js");
var meetings = require("./meetings.js");

module.exports = {
    hackerspace: function(response) {
        hackerspace.get(function(isOpen){
            response.end(isOpen);
        });
    },

    coffee: function(response) {
        coffee.get(true, 'online', function(tx1, tx2){
            console.log("Coffee");
            response.end(tx1 + "\n" + tx2);
        });
    },

    office: function(response) {
        office.get('online', function(status, message) {
            console.log("Office for online ");
            officeLight.get("online", function(data){
                console.log("Light online: " + data);
            });
            response.end(status + "\n" + message);
        });
    },

    meetings: function(response){
        meetings.get("online", function(text){
            console.log("Meeting online");
            response.end(text);
        });
    },

    help: function(response){
        response.end("help is allowed!");
    }
};
