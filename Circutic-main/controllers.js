const { graphql, buildSchema } = require('graphql');
const model = require('./model'); // Base de datos
const Realm = require('realm');
const graph = require('./my-graph.json');

let DB;

model.getDB().then(db => {
    DB = db;
});

// Notifications
const sse = require('./utils/notifications');
sse.start();

const fs = require('fs');
const gql = fs.readFileSync('esquema.gql').toString();
const schema = buildSchema(gql);

const rootValue = {

    jsonld: () => JSON.stringify(graph),

    // Consultas (Queries)
    users: () => {
        return DB.objects('User');
    },
    user: async ({ id }) => {
        const user = await DB.objectForPrimaryKey('User', id);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return user;
    },
    devices: () => {
        return DB.objects('Device');
    },
    device: async ({ id }) => {
        const device = await DB.objectForPrimaryKey('Device', id);
        if (!device) {
            throw new Error('Dispositivo no encontrado');
        }
        return device;
    },
    purchases: () => {
        return DB.objects('Purchase');
    },
    purchase: async ({ id }) => {
        const purchase = await DB.objectForPrimaryKey('Purchase', id);
        if (!purchase) {
            throw new Error('Compra no encontrada');
        }
        return purchase;
    },
    ratings: () => {
        return DB.objects('Rating');
    },
    rating: async ({ id }) => {
        const rating = await DB.objectForPrimaryKey('Rating', id);
        if (!rating) {
            throw new Error('Valoración no encontrada');
        }
        return rating;
    },

    purchasesByUser: ({ userId }) => {
        const user = DB.objectForPrimaryKey('User', userId);
        if (!user) {
            throw new Error('El usuario no existe.');
        }
        return DB.objects('Purchase').filtered(`buyerId = "${userId}"`);
    },

    ratingsByUser: ({ userId }) => {
        const user = DB.objectForPrimaryKey('User', userId);
        if (!user) {
            throw new Error('El usuario no existe.');
        }
        return DB.objects('Rating').filtered(`receiverId = "${userId}" OR giverId = "${userId}"`);
    },

    devicesByBrand: ({ brand }) => {
        return DB.objects('Device').filtered(`brand = "${brand}"`);
    },

    devicesByType: ({ type }) => {
        return DB.objects('Device').filtered(`type = "${type}"`);
    },

    purchaseDetails: ({ purchaseId }) => {
        const purchase = DB.objectForPrimaryKey('Purchase', purchaseId);
        if (!purchase) {
            throw new Error('La compra no existe.');
        }
        return purchase;
    },

    visibleDevices: () => {
        return DB.objects('Device').filtered('status = "visible"');
    },

    // Mutaciones (Mutations)
    createUser: ({ input }) => {
        const { name, email, address, password } = input;

        // Verificar si ya existe un usuario con el mismo correo electrónico
        const existingUserWithEmail = DB.objects('User').filtered(`email = "${email}"`);
        if (existingUserWithEmail.length > 0) {
            throw new Error('Ya existe un usuario con este correo electrónico.');
        }

        let usr = DB.objectForPrimaryKey('User', name);

        if (!usr) {
            let data = {
                _id: Realm.BSON.ObjectID(),
                name: name,
                email: email,
                address: address,
                password: password
            };

            DB.write(() => {
                usr = DB.create('User', data);
            });

            return data;
        }

        return null;
    },

    createDevice: ({ input }) => {
        const { name, type, brand, ownerId, price, description, status } = input;

        // No hay necesidad de verificar duplicados para el nombre de dispositivo
        console.log(input);
        let device = null;

        let data = {
            _id: Realm.BSON.ObjectID(),
            name: name,
            type: type,
            brand: brand,
            ownerId: ownerId,
            price: price,
            description: description,
            status: status
        };

        DB.write(() => {
            device = DB.create('Device', data);
        });

        return device;
    },

    createPurchase: ({ input }) => {
        const { buyerId, deviceId, timestamp, amount } = input;
        // Verificar si el comprador y el dispositivo existen en la base de datos
        const buyer = DB.objectForPrimaryKey('User', Realm.BSON.ObjectID(buyerId));
        const device = DB.objectForPrimaryKey('Device', Realm.BSON.ObjectID(deviceId));
    
        if (!buyer || !device) {
            throw new Error('El comprador o el dispositivo no existen.');
        }
    
        let purchase = null;
    
        let data = {
            _id: Realm.BSON.ObjectID(),
            buyerId: buyerId,
            deviceId: deviceId,
            timestamp: timestamp,
            amount: amount
        };
    
        DB.write(() => {
            purchase = DB.create('Purchase', data);
        });
    
        return purchase;
    },
    
    createRating: ({ input }) => {
        const { giverId, receiverId, rating, comment } = input;
    
        // Verificar si tanto el dador como el receptor existen en la base de datos

        const giver = DB.objectForPrimaryKey('User', Realm.BSON.ObjectID(giverId));
        const receiver = DB.objectForPrimaryKey('User', Realm.BSON.ObjectID(receiverId));
        console.log(giver.name, receiver.name)
        if (!giver || !receiver) {
            throw new Error('El dador o el receptor no existen.');
        }
    
        let ratingObj = null;
    
        let data = {
            _id: Realm.BSON.ObjectID(),
            giverId: giverId,
            receiverId: receiverId,
            rating: rating,
            comment: ""
        };
    
        DB.write(() => {
            ratingObj = DB.create('Rating', data);
        });
        return data;
    },

    deleteDevice: ({ id }) => {
        // Verificar si el dispositivo existe en la base de datos
        const device = DB.objectForPrimaryKey('Device', id);
        if (!device) {
            throw new Error('El dispositivo no existe.');
        }
    
        DB.write(() => {
            DB.delete(device);
        });
    
        return true; // Devolver true para indicar que el dispositivo fue eliminado con éxito
    },

    updateDevice: ({ id, input }) => {
        const { name, description, brand, price, type } = input;
    
        // Verificar si el dispositivo existe en la base de datos
        let device = DB.objectForPrimaryKey('Device', id);
        if (!device) {
            throw new Error('El dispositivo no existe.');
        }
    
        DB.write(() => {
            // Actualizar los campos del dispositivo con los valores proporcionados
            if (name) device.name = name;
            if (description) device.description = description;
            if (brand) device.brand = brand;
            if (price) device.price = price;
            if (type) device.type = type;
        });
    
        return device;
    },
    
    updateUser: ({ id, input }) => {
        const { name, address } = input;
    
        // Verificar si el usuario existe en la base de datos
        let user = DB.objectForPrimaryKey('User', id);
        if (!user) {
            throw new Error('El usuario no existe.');
        }
    
        DB.write(() => {
            // Actualizar los campos del usuario con los valores proporcionados
            if (name) user.name = name;
            if (address) user.address = address;
        });
    
        return user;
    },

    changeDeviceStatus: ({ id, status }) => {
        // Verificar si el dispositivo existe en la base de datos
        let device = DB.objectForPrimaryKey('Device', id);
        if (!device) {
            throw new Error('El dispositivo no existe.');
        }
    
        DB.write(() => {
            device.status = status;
        });
    
        return device;
    }    
    
};

exports.root = rootValue;
exports.schema = schema;
exports.sse = sse;
