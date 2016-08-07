var mongoose = require("mongoose");


var rsvpSchema = new mongoose.Schema({
    created_at: {type: Date, default: Date.now},
    attendance: [Number],
    location: String

});

var userSchema = new mongoose.Schema({
    username: String,
    password: String, //hash created from password
    created_at: {type: Date, default: Date.now}
});


mongoose.model('Rsvp', rsvpSchema);
mongoose.model('User', userSchema);