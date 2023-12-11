const mongoose = require('mongoose');
const reservationSchema = mongoose.Schema({
    roomname : { type : 'string' },
    roomsubname : { type : 'string' },
    nombresiege : { type : 'string' }
});

module.exports = mongoose.model('Reservation', reservationSchema);