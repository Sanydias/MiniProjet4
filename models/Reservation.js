const mongoose = require('mongoose');
const reservationSchema = mongoose.Schema({
    roomname : { type : 'string' }, // salle rouge
    roomsubname : { type : 'string' }, //salle fred
    nombretable : { type : 'number' },
    nombresiege : { type : 'number' },
    nombresiegetable : { type : 'number' },
    statut : { type : 'boolean' },
    id_reserveur : { type : 'string' }
});

module.exports = mongoose.model('Reservation', reservationSchema);