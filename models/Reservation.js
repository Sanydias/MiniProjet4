const mongoose = require('mongoose');
const reservationSchema = mongoose.Schema({
    date : { type : 'string' },
    valide : { type : 'boolean' }
});

module.exports = mongoose.model('Reservation', reservationSchema);