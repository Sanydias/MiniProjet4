
/* Express : trdaucteur pour le serveur */

    var express = require('express');
    var app = express();

/* body-parser : permet de lire le HTML */
    
    var bodyParser = require('body-parser');


/* dotenv : cacher son url */

    require('dotenv').config();

/* mongoose : connexion à la BDD */
    
    var mongoose = require('mongoose');
    const url = process.env.DATABASE_URL;
    mongoose.connect(url).then(console.log("MongoDB connected")).catch(err => console.error(err));

/* Bcrypt : Hashage de mot de passe */

    const bcrypt = require('bcrypt');

/* method-override : CRUD */

    const methodeOverride = require('method-override');

    app.use(bodyParser.urlencoded({extended: false}));
    app.use(methodeOverride('_method'));

/* VIEWS */

    app.set('view engine', 'ejs');

/* MODELE USER */

    var User = require('./models/User');

/* MODELE RESERVATION */

    var Reservation = require('./models/Reservation');

/* HOME */

    app.get('/', function(req, res){
        Reservation.find().then((data) => { console.log(data); res.render('Home', {data: data}); }).catch(err => console.error(err));
        
    });

/* INSCRIPTION */

    app.get('/inscription', function(req, res){
        res.render('Inscription');
    });

    app.post('/api/inscription', function(req, res){
        const Data = new User({
            username : req.body.username,
            email : req.body.email,
            password : bcrypt.hashSync(req.body.password, 10)
        });
        Data.save().then(() => { console.log('Data saved successfuly'); res.redirect('/'); }).catch(err => console.error(err));
    });

/* CONNEXION */

    app.get('/connexion', function(req, res){
        res.render('Connexion');
    });

    app.post('/api/connexion', function(req, res){
        User.findOne({
            username : req.body.username
        }).then(user => {
            if (!user){
                return res.status(404).send('User not found');
            }
            console.log(user);
            if (!bcrypt.compareSync(req.body.password, user.password)) {
                return res.status(404).send('Invalid password');
            }
            res.render('User', {data: user});
        }).catch(err => console.error(err));
    });

/* MODIFIER UTILISATEUR */

    app.get('/modifier/:id', function(req, res){
        User.findOne({ _id : req.params.id }).then((data) => { console.log(data); res.render('Modifier', {data: data}); }).catch(err => console.error(err));
    });

    app.put('/api/modifier/:id', function(req, res){
            const Data = {
                username : req.body.username,
                email : req.body.email
            }
            User.updateOne({'_id': req.params.id}, {$set: Data}).then(() => { console.log('Data updated successfuly'); res.redirect('/'); }).catch(err => console.error(err));
    });

/* LISTE RESERVATION */

    app.get('/liste', function(req, res){
        Reservation.find().then((data) => { console.log(data); res.render('Reservations', {data: data}); }).catch(err => console.error(err));
    });

/* SUPRIMER UTILISATEUR */

    app.delete('/supprimer/:id', function (req, res) {
        User.findOneAndDelete({'_id': req.params.id}).then(() => { console.log('Data deleted successfuly'); res.redirect('/'); }).catch(err => console.error(err));
    })

/* LANCER SERVEUR */

    var server = app.listen(5004, function () {
        console.log("server listening on port 5004");
    })