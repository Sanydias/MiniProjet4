const mongoose = require('mongoose');
const reservationSchema = mongoose.Schema({
    roomid : { type : 'string' },
    roomname : { type : 'string' },
    statut : { type : 'boolean' }
});

module.exports = mongoose.model('Reservation', reservationSchema);