const Sequelize = require("sequelize");

var sequelize = new Sequelize('dc0cfqfloqjq1f', 'enhkbctopcpzky', 'd929322b84bada70fdacf70eacb926dc8ec77c4cdaca20b61fef53be1aa21e0b', {
    host: 'ec2-54-157-78-113.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});

///////////////////////////////////////////////////

var People = sequelize.define('People', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    first_name: Sequelize.STRING,
    last_name: Sequelize.STRING,
    phone: Sequelize.STRING,
    address: Sequelize.STRING,
    city: Sequelize.STRING
});

var Car = sequelize.define('Car', {
    vin: {
        type: Sequelize.STRING,
        primaryKey: true,
        unique: true
    },
    make: Sequelize.STRING,
    model: Sequelize.STRING,
    year: Sequelize.STRING
});

var Store = sequelize.define('Store', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    retailer: Sequelize.STRING,
    phone: Sequelize.STRING,
    address: Sequelize.STRING,
    city: Sequelize.STRING
});

Car.hasMany(People, { foreignKey: 'vin' });

///////////////////////////////////////////////////

module.exports.initialize = function () { // NEED TO CHECK AGAIN
    return new Promise(function (resolve, reject) {
        sequelize.sync()
            .then(() => {
                resolve();
            }).catch((err) => {
                reject("unable to sync the database");
            });
    });
}

///////////////////////////////////////////////////

module.exports.addPeople = function (peopleData) {
    return new Promise(function (resolve, reject) {
        for (i in peopleData) {
            peopleData[i] = (peopleData[i] == "") ? null : peopleData[i];
        }
        People.create(peopleData)
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject("unable to create the person");
            });
    });
}

module.exports.getAllPeople = function () {
    return new Promise(function (resolve, reject) {
        People.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("no results returned");
            });
    });
}

module.exports.getPeopleByVin = function (vinData) {
    return new Promise(function (resolve, reject) {
        People.findAll({
            where: {
                vin: vinData
            }
        })
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("no results returned");
            });
    });
}

module.exports.getPeopleById = function (idData) {
    return new Promise(function (resolve, reject) {
        People.findAll({
            where: {
                id: idData
            }
        })
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("no results returned");
            });
    });
}

module.exports.updatePerson = function (personData) {
    return new Promise(function (resolve, reject) {
        for (i in personData) {
            personData[i] = (personData[i] == "") ? null : personData[i];
        }
        People.update(personData, {
            where: { id: personData.id }
        })
            .then((data) => {
                resolve();
            })
            .catch((err) => {
                reject("unable to update person");
            });
    });
}

module.exports.deletePeopleById = function (idData) {
    return new Promise(function (resolve, reject) {
        People.destroy({
            where: { id: idData }
        })
            .then((data) => {
                resolve("destroyed");
            })
            .catch((err) => {
                reject();
            });
    });
}

///////////////////////////////////////////////////

module.exports.addStore = function (storeData) {
    return new Promise(function (resolve, reject) {
        for (i in storeData) {
            storeData[i] = (storeData[i] == "") ? null : storeData[i];
        }
        Store.create(storeData)
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject("unable to create store");
            });
    });
}

module.exports.getStores = function () {
    return new Promise(function (resolve, reject) {
        Store.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("no results returned");
            });
    });

}

module.exports.getStoresByRetailer = function (retailerData) {
    return new Promise(function (resolve, reject) {
        Store.findAll({
            where: {
                retailer: retailerData
            }
        })
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("no results returned");
            });
    });
}

module.exports.getStoreById = function (idData) {
    return new Promise(function (resolve, reject) {
        Store.findAll({
            where: {
                id: idData
            }
        })
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("no results returned");
            });
    });
}

module.exports.updateStore = function (storeData) {
    return new Promise(function (resolve, reject) {
        for (i in storeData) {
            storeData[i] = (storeData[i] == "") ? null : storeData[i];
        }
        Store.update(storeData, {
            where: { id: storeData.id }
        })
            .then((data) => {
                resolve();
            })
            .catch((err) => {
                reject("unable to update store");
            });
    });
}

module.exports.deleteStoreById = function (idData) {
    return new Promise(function (resolve, reject) {
        Store.destroy({
            where: { id: idData }
        })
            .then((data) => {
                resolve("destroyed");
            })
            .catch((err) => {
                reject();
            });
    });
}

///////////////////////////////////////////////////

module.exports.addCar = function (carData) {
    return new Promise(function (resolve, reject) {
        for (i in carData) {
            carData[i] = (carData[i] == "") ? null : carData[i];
        }
        Car.create(carData)
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject("unable to create car");
            });
    });
}

module.exports.getCars = function () {
    return new Promise(function (resolve, reject) {
        Car.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("no results returned");
            });
    });
}

module.exports.getCarsByVin = function (vinData) {
    return new Promise(function (resolve, reject) {
        Car.findAll({
            where: {
                vin: vinData
            }
        })
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("no results returned");
            });
    });
}

module.exports.getCarsByMake = function (makeData) {
    return new Promise(function (resolve, reject) {
        Car.findAll({
            where: {
                make: makeData
            }
        })
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("no results returned");
            });
    });
}

module.exports.getCarsByYear = function (yearData) {
    return new Promise(function (resolve, reject) {
        Car.findAll({
            where: {
                year: yearData
            }
        })
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("no results returned");
            });
    });
}

module.exports.updateCar = function (carData) {
    return new Promise(function (resolve, reject) {
        for (i in carData) {
            carData[i] = (carData[i] == "") ? null : carData[i];
        }
        Car.update(carData, {
            where: { vin: carData.vin }
        })
            .then((data) => {
                resolve();
            })
            .catch((err) => {
                reject("unable to update car");
            });
    });
}

module.exports.deleteCarByVin = function (vinData) {
    return new Promise(function (resolve, reject) {
        Car.destroy({
            where: { vin: vinData }
        })
            .then((data) => {
                resolve("destroyed");
            })
            .catch((err) => {
                reject();
            });
    });
}

///////////////////////////////////////////////////