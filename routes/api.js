var express = require("express");
var router = express.Router();
var yelp = require("../yelp");
var mongoose = require("mongoose");
var Rsvp = mongoose.model('Rsvp');



router.route('/rsvps/:id')
    .get(function(req, res) {
        Rsvp.find({location: req.params.id}, function(err, rsvp) {

            if(err) throw err;
            if(rsvp.length > 0){

                res.status(200).send(rsvp);
            }
            if(rsvp.length === 0){
                
                var newAttendance = [{
                    location: req.params.id,
                    attendance: [0,0,0,0,0,0,0,0,0,0,0,0]
                }];
                res.send(newAttendance);
            }
                    
        });
    })
    .put(function(req, res){
        Rsvp.findOne({location: req.params.id}, function(err, result){
            
            if(err) throw err;
            if(result){
                result.attendance = req.body.attendance;
                
                result.save(function(err, data){
                    if(err) throw err;
                    res.status(200).send(data);
                });
            }
            if(!result){
                var rsvp = new Rsvp();
                rsvp.attendance = req.body.attendance;
                rsvp.location = req.params.id;
                
                rsvp.save(function(err, data) {
                    if(err) throw err;
                    res.status(200).send(data);
                });
            }
        });
    });
    
    
router.route('/bars/:id')
    .get(function(req, res) {
        searchYelp(req, res, function(obj){
            res.json(obj);
        });
}); 

function searchYelp(req, res, cb){
        
        var default_parameters = {
                location: req.params.id,
                sort: '2'
        };
        
        
        yelp(default_parameters, function(err, response, body){
            if (err) throw err;
            var obj = JSON.parse(body);
            cb(obj.businesses);
        });
}
 

module.exports = router;