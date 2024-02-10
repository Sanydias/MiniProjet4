const mongoose = require('mongoose');
const reservationSchema = mongoose.Schema({
    roomname : { type : 'string', required : true }, // salle rouge
    roomsubname : { type : 'string', required : true }, //salle fred
    nombretable : { type : 'number', required : true },
    nombresiege : { type : 'number', required : true },
    nombresiegetable : { type : 'number', required : true },
    statut : { type : 'boolean', required : true },
    id_reserveur : { type : 'number' }
});

module.exports = mongoose.model('Reservation', reservationSchema);