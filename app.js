
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

/* Swagger */

    // const swaggerJsDoc = require('swagger-jsdoc');
    const swaggerUI = require('swagger-ui-express');

    // const swaggerOptions = {
    //     swaggerDefinition : {
    //         info : {
    //             title : 'API Documentation',
    //             version : '1.0.0',
    //         }
    //     },
    //     apis : [
    //         'app.js'
    //     ]
    // }

    // const swaggerDocs = swaggerJsDoc(swaggerOptions);
    const swaggerDocs = require('./swagger-output.json');
    console.log(swaggerDocs);

    const toobusy = require('toobusy-js');
    app.use(function (req, res, next) {
        if (toobusy()) {
            res.status(503).send("Serveur too busy");
        } else {
            next();
        }
        
    })

    const session = require('express-session');
    const svgCaptcha = require('svg-captcha');

    app.use(
        session({
            secret:'my-secret-key',
            resave: false,
            saveUninitialized: true,
        })
    )

    app.get('/captcha', (req, res) =>{
        const captcha = svgCaptcha.create();
        req.session.captcha = captcha.text;
        res.type('svg');
        res.status(200).send(captcha.data);
    })

    app.get('/formcaptcha', function(req, res) {
        res.render('FormCaptcha');
    })

    app.post('/verify', (req, res) => {
        const {userInput} = req.body;
        if (userInput === req.session.captcha) {
            res.status(200).send('Captcha is valid');
        } else {
            res.status(400).send('Captcha is invalid');
        }
    })

    const hpp = require('hpp');
    app.use(hpp());

    const helmet = require('helmet');
    app.use(helmet()); // add various http headers

    const nocache = require('nocache');
    app.use(nocache());

/* MODELE USER */

    var User = require('./models/User');

/* MODELE RESERVATION */

    var Reservation = require('./models/Reservation');

/* API */

    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

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
        Data.save().then(() => { console.log('Data saved successfuly'); res.redirect('/connexion'); }).catch(err => console.error(err));
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
            res.render('Compte', {data: user});
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

/* SUPPRIMER UTILISATEUR */

    app.delete('/supprimer/:id', function (req, res) {
        User.findOneAndDelete({'_id': req.params.id}).then(() => { console.log('Data deleted successfuly'); res.redirect('/'); }).catch(err => console.error(err));
    });

/**
 * @swagger
 * /liste :
 *      get :
 *          description: get list of all room
 *          responses :
 *              200 :
 *                  description : Success
 */

/* LISTE SALLE */

    app.get('/liste', function(req, res){
        Reservation.find().then((data) => { console.log(data); res.render('ListeSalle', {data: data}); }).catch(err => console.error(err));
    });

/* AJOUT SALLE */

    app.get('/ajoutsalle', function(req, res){
        res.render('AjoutSalle');
    });

/**
 * @swagger
 * /api/ajoutsalle :
 *      post :
 *          description: add a new room
 *          parameters:
 *          - name : roomname
 *            description : name of the room
 *            in : formData
 *            required : true
 *            type : string
 *          - name : roomsubname
 *            description : who's the owner of the room
 *            in : formData
 *            required : true
 *            type : string
 *          - name : nombretable
 *            description : number of desk
 *            in : formData
 *            required : true
 *            type : number
 *          - name : nombresiege
 *            description : number of chair
 *            in : formData
 *            required : true
 *            type : number
 *          - name : nombresiegetable
 *            description : number of chair for one desk
 *            in : formData
 *            required : true
 *            type : number
 *          - name : statut
 *            description : if the room is available
 *            in : formData
 *            required : true
 *            type : boolean
 *          - name : id_reserveur
 *            description : id of the person who use the room
 *            in : formData
 *            required : false
 *            type : number
 *          responses :
 *              201 :
 *                  description : Success
 */

    app.post('/api/ajoutsalle', function(req, res){
        spt = req.body.nombretable * req.body.nombresiegetable;
        const Data = new Reservation({
            roomname : req.body.roomname,
            roomsubname : req.body.roomsubname,
            nombretable : req.body.nombretable,
            nombresiege : spt,
            nombresiegetable : req.body.nombresiegetable,
            statut : 'false',
            id_reserveur : 'Aucun'
        });
        Data.save().then(() => { console.log('Data saved successfuly'); res.redirect('/liste'); }).catch(err => console.error(err));
    });

/* MODIFIER SALLE */

    app.get('/modifiersalle/:id', function(req, res){
        Reservation.findOne({ _id : req.params.id }).then((data) => { console.log(data); res.render('ModifierSalle', {data: data}); }).catch(err => console.error(err));
    });

    app.put('/api/modifiersalle/:id', function(req, res){
        spt = req.body.nombretable * req.body.nombresiegetable;
            const Data = {
                roomname : req.body.roomname,
                roomsubname : req.body.roomsubname,
                nombretable : req.body.nombretable,
                nombresiege : spt,
                nombresiegetable : req.body.nombresiegetable,
            }
            Reservation.updateOne({'_id': req.params.id}, {$set: Data}).then(() => { console.log('Data updated successfuly'); res.redirect('/liste'); }).catch(err => console.error(err));
    });

/* SUPPRIMER SALLE */

    app.delete('/supprimersalle/:id', function (req, res) {
        Reservation.findOneAndDelete({'_id': req.params.id}).then(() => { console.log('Data deleted successfuly'); res.redirect('/liste'); }).catch(err => console.error(err));
    });

/* LISTE RESERVATION */
    
    app.get('/listereservation/:id', function(req, res){
        console.log(req.params.id); 
        Reservation.find({ 
            'id_reserveur' : req.params.id 
        }).then((data) => { 
            console.log(data); 
            res.render('ListeReservation', {data: data}); 
        }).catch(err => console.error(err));
    });

/* RESERVATION */

    app.get('/reservation', function(req, res){
        res.render('Reservation');
    });

    app.post('/reservationresultat', function(req, res){
        Reservation.find({
        }).then((data) => { 
            console.log(data); 
            res.render('ReservationResultat', {data: data, siege : req.body.nombresiege}); 
        }).catch(err => console.error(err));
    });

    app.put('/api/reservation/:id', function(req, res){
            const Data = {
                statut : 'true'
            }
            Reservation.updateOne({
                '_id': req.params.id
            }, {
                $set: Data
            }).then(() => { 
                console.log('Data updated successfuly'); 
                res.redirect('/reservationnom/'+ req.params.id); 
            }).catch(err => console.error(err));
    });

    app.get('/reservationnom/:id', function(req, res){
        Reservation.findOne({
            '_id' : req.params.id
        }).then(data => {
            console.log(data);
            res.render('ReservationNom', {data: data});
        }).catch(err => console.error(err));
    });

    app.put('/api/reservationnom/:id', function(req, res){
            const Data = {
                id_reserveur : req.body.id_reserveur
            }
            Reservation.updateOne({
                '_id': req.params.id
            }, {
                $set: Data
            }).then(() => { 
                console.log('Data updated successfuly'); 
                res.redirect('/connexion'); 
            }).catch(err => console.error(err));
    });

/* ANNULER RESERVATION */

    app.put('/api/annulerreservation/:id', function(req, res){
            const Data = {
                statut : 'false',
                id_reserveur : 'Aucun'
            }
            Reservation.updateOne({
                '_id': req.params.id
            }, {
                $set: Data
            }).then(() => { 
                console.log('Data updated successfuly'); 
                res.redirect('/connexion'); 
            }).catch(err => console.error(err));
    });

/* LANCER SERVEUR */

    var server = app.listen(5004, function () {
        console.log("server listening on port 5004");
    })