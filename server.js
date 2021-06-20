/**************************************************************************************************
*
* Online (Heroku) Link: https://warm-savannah-36182.herokuapp.com/
*
**************************************************************************************************/

const express = require("express");
const path = require("path");
const dataService = require("./data-service.js");
const dataServiceAuth = require("./data-service-auth.js");
const bodyParser = require("body-parser");
const fs = require("fs");
const multer = require("multer");
const exphbs = require("express-handlebars");
const app = express();
const clientSessions = require("client-sessions");

const HTTP_PORT = process.env.PORT || 8080;

///////////////////////////////////////////////////

app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        }
    }
}));

app.set('view engine', '.hbs');

///////////////////////////////////////////////////

const storage = multer.diskStorage({
    destination: "./public/pictures/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

///////////////////////////////////////////////////

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

app.use(clientSessions({
    cookieName: "session",
    secret: "assignment6_web322",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
}));

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

///////////////////////////////////////////////////

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

///////////////////////////////////////////////////

app.get("/", function (req, res) {
    res.render('home');
});

app.get("/about", function (req, res) {
    res.render('about');
});

///////////////////////////////////////////////////

app.get("/pictures/add", ensureLogin, function (req, res) {
    res.render('addPicture');
});

app.get("/pictures", ensureLogin, function (req, res) {
    fs.readdir("./public/pictures/uploaded", function (err, items) {
        res.render("pictures", { pictures: items });
    });
});

app.post("/pictures/add", ensureLogin, upload.single("pictureFile"), function (req, res) {
    res.redirect("/pictures");
});

///////////////////////////////////////////////////

app.get("/people", ensureLogin, function (req, res) {
    if (req.query.vin) {
        dataService.getPeopleByVin(req.query.vin).then((data) => {
            res.render("people", (data.length > 0) ? { people: data.map(value => value.dataValues) } : { message: "no results" });
        }).catch((err) => {
            res.render("people", { message: "no results" });
        });
    }
    else {
        dataService.getAllPeople().then((data) => {
            res.render("people", (data.length > 0) ? { people: data.map(value => value.dataValues) } : { message: "no results" });
        }).catch((err) => {
            res.render("people", { message: "no results" });
        });
    }
});

app.get("/people/add", ensureLogin, function (req, res) {
    dataService.getCars().then((data) => {
        res.render("addPeople", { cars: data.map(value => value.dataValues) });
    }).catch((err) => {
        res.render("addPeople", { cars: [] });
    });
});

app.post("/people/add", ensureLogin, function (req, res) {
    dataService.addPeople(req.body).then(() => {
        res.redirect("/people");
    }).catch((err) => {
        res.status(500).send("Unable to Add the Person");
    });;
});

app.get("/person/:id", ensureLogin, function (req, res) {
    let viewData = {};
    dataService.getPeopleById(req.params.id).then((data) => {
        if (data) {
            viewData.person = data.map(value => value.dataValues)[0];
        } else {
            viewData.person = null;
        }
    }).then(dataService.getCars)
        .then((data) => {
            viewData.cars = data.map(value => value.dataValues);
            for (let i = 0; i < viewData.cars.length; i++) {
                if (viewData.cars[i].vin == viewData.person.vin) {
                    viewData.cars[i].selected = true;
                }
            }
        }).then(() => {
            if (viewData.person == null) {
                res.status(404).send("Person Not Found");
            } else {
                res.render("person", { viewData: viewData });
            }
        }).catch(() => {
            viewData.person = null;
            viewData.cars = [];
            res.status(404).send("Person Not Found");
        });
});

app.post("/person/update", ensureLogin, function (req, res) {
    dataService.updatePerson(req.body).then(() => {
        res.redirect("/people");
    }).catch((err) => {
        res.status(500).send("Unable to Update the Person");
    });
});

app.get("/people/delete/:id", ensureLogin, function (req, res) {
    dataService.deletePeopleById(req.params.id).then(() => {
        res.redirect("/people");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Person / Person Not Found");
    });
});

///////////////////////////////////////////////////

app.get("/cars", ensureLogin, function (req, res) {
    if (req.query.vin) {
        dataService.getCarsByVin(req.query.vin).then((data) => {
            res.render("cars", (data.length > 0) ? { cars: data.map(value => value.dataValues) } : { message: "no results" });
        }).catch((err) => { res.render("cars", { message: "There was an error" }) });
    }
    else if (req.query.year) {
        dataService.getCarsByYear(req.query.year).then((data) => {
            res.render("cars", (data.length > 0) ? { cars: data.map(value => value.dataValues) } : { message: "no results" });
        }).catch((err) => { res.render("cars", { message: "There was an error" }) });
    }
    else if (req.query.make) {
        dataService.getCarsByMake(req.query.make).then((data) => {
            res.render("cars", (data.length > 0) ? { cars: data.map(value => value.dataValues) } : { message: "no results" });
        }).catch((err) => { res.render("cars", { message: "There was an error" }) });
    }
    else {
        dataService.getCars().then((data) => {
            res.render("cars", (data.length > 0) ? { cars: data.map(value => value.dataValues) } : { message: "no results" });
        }).catch((err) => { res.render("cars", { message: "There was an error" }) });
    }
});


app.get("/cars/add", ensureLogin, function (req, res) {
    res.render("addCar");
});

app.post("/car/add", ensureLogin, function (req, res) {
    dataService.addCar(req.body).then(() => {
        res.redirect("/cars");
    }).catch((err) => {
        res.status(500).send("Unable to Add the Car");
    });
});

app.get("/car/:vin", ensureLogin, function (req, res) {
    dataService.getCarsByVin(req.params.vin).then((data) => {
        res.render("car", { car: data.map(value => value.dataValues)[0] });
    }).catch(() => {
        res.status(404).send("Car Not Found");
    });
});

app.post("/car/update", ensureLogin, function (req, res) {
    dataService.updateCar(req.body).then(() => {
        res.redirect("/cars");
    }).catch((err) => {
        res.status(500).send("Unable to Update the Car");
    });

});

app.get("/cars/delete/:vin", ensureLogin, function (req, res) {
    dataService.deleteCarByVin(req.params.vin).then(() => {
        res.redirect("/cars");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Car / Car Not Found");
    });
});

///////////////////////////////////////////////////

app.get("/stores", ensureLogin, function (req, res) {
    if (req.query.retailer) {
        dataService.getStoresByRetailer(req.query.retailer).then((data) => {
            res.render("stores", (data.length > 0) ? { stores: data.map(value => value.dataValues) } : { message: "no results" });
        }).catch((err) => { res.send(err) });
    }
    else {
        dataService.getStores().then((data) => {
            res.render("stores", (data.length > 0) ? { stores: data.map(value => value.dataValues) } : { message: "no results" });
        }).catch((err) => { res.send(err) });
    }
});

app.get("/stores/add", ensureLogin, function (req, res) {
    res.render("addStore");
});

app.post("/stores/add", ensureLogin, function (req, res) {
    dataService.addStore(req.body).then(() => {
        res.redirect("/stores");
    }).catch((err) => {
        res.status(500).send("Unable to Add the Store");
    });
});

app.get("/store/:id", ensureLogin, function (req, res) {
    dataService.getStoreById(req.params.id).then((data) => {
        res.render("store", { store: data.map(value => value.dataValues)[0] });
    }).catch(() => {
        res.status(404).send("Store Not Found");
    });
});

app.post("/store/update", ensureLogin, function (req, res) {
    dataService.updateStore(req.body).then(() => {
        res.redirect("/stores");
    }).catch((err) => {
        res.status(500).send("Unable to Update the Store");
    });
});

app.get("/stores/delete/:id", ensureLogin, function (req, res) {
    dataService.deleteStoreById(req.params.id).then(() => {
        res.redirect("/stores");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Store / Store Not Found");
    });
});

///////////////////////////////////////////////////

app.get("/login", function (req, res) {
    res.render("login");
});

app.post("/login", function (req, res) {
    req.body.userAgent = req.get("User-Agent");
    dataServiceAuth.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }
        res.redirect("/people");
    }).catch((err) => {
        res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {
    dataServiceAuth.registerUser(req.body)
        .then(() => {
            res.render("register", { successMessage: "User created successfully" });
        }).catch((err) => {
            res.render("register", { errorMessage: err, userName: req.body.userName });
        });
});

app.get("/logout", function (req, res) {
    req.session.reset();
    res.redirect("/login");
});

app.get("/userHistory", ensureLogin, function (req, res) {
    res.render("userHistory");
});

///////////////////////////////////////////////////
app.use(function (req, res) {
    res.status(404).render('error');
});

dataService.initialize()
    .then(dataServiceAuth.initialize)
    .then(function () {
        app.listen(HTTP_PORT, function () {
            console.log("app listening on: " + HTTP_PORT)
        });
    }).catch(function (err) {
        console.log("unable to start server: " + err);
    });

///////////////////////////////////////////////////