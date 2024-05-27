const Realm = require('realm');

// Definir los esquemas de datos
const UserSchema = {
  name: 'User',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    name: 'string',
    email: 'string',
    address: 'string',
    password: 'string'
  }
};

const DeviceSchema = {
  name: 'Device',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    name: 'string',
    type: 'string',
    brand: 'string',
    ownerId: 'string',
    price: 'float',
    description: 'string',
    status: 'string',
  }
};

const PurchaseSchema = {
  name: 'Purchase',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    buyerId: 'string',
    deviceId: 'string',
    timestamp: 'string',
    amount: 'float',
  }
};

const RatingSchema = {
  name: 'Rating',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    giverId: 'string',
    receiverId: 'string',
    rating: 'float',
    comment: 'string',
  }
};

const app = new Realm.App({ id: "circutic-clvxecx" }); // Reemplaza con tu propio ID de Realm App

let sync = {
  user: app.currentUser,
  flexible: true,
  initialSubscriptions: {
    update: (subs, realm) => {
      subs.add(realm.objects('User'), { name: "users" });
      subs.add(realm.objects('Device'), { name: "devices" });
      subs.add(realm.objects('Purchase'), { name: "purchases" });
      subs.add(realm.objects('Rating'), { name: "ratings" });
    },
    rerunOnOpen: true,
  },
};

let config = {
  path: './data/circutic.realm', // Nombre de la base de datos
  sync: sync,
  schema: [UserSchema, DeviceSchema, PurchaseSchema, RatingSchema], // Los esquemas a sincronizar
};

// Función para obtener la base de datos con autenticación anónima
exports.getDB = async () => {
  await app.logIn(Realm.Credentials.anonymous());
  return await Realm.open(config);
};

exports.app = app;


// Parte de pruebas
if (process.argv[1] == __filename) {
  if (process.argv.includes("--create")) {
    Realm.deleteFile({ path: './data/blogs.realm' }); // Borra la base de datos si existe

    // Creamos la base de datos Realm con nuestros esquemas
    let DB = new Realm(config)

    // Insertamos objetos en la base de datos
    DB.write(() => {
      let user0 = DB.create('User', {
        _id: new Realm.BSON.ObjectId(),
        name: 'Jon Comida',
        email: 'john@example.com',
        address: 'Calle Barrachina, 18',
        password: '1234'
      });

      let device0 = DB.create('Device', {
        _id: new Realm.BSON.ObjectId(),
        name: 'iPhone 12',
        type: "smartphone",
        brand: "Apple",
        ownerId: user0._id.toString(),
        price: 777.99,
        description: 'en perfecto estado ;)',
        status: 'available'
      });

      let purchase0 = DB.create('Purchase', {
        _id: new Realm.BSON.ObjectId(),
        buyerId: user0._id.toString(),
        deviceId: device0._id.toString(),
        timestamp: '10/04/2024',
        amount: 750
      });

      let rating0 = DB.create('Rating', {
        _id: new Realm.BSON.ObjectId(),
        giverId: user0._id.toString(),
        receiverId: user0._id.toString(),
        rating: 4.5,
        comment: 'Bona compra'
      });

      console.log('Inserted objects:', user0, device0, purchase0, rating0);
    });

    DB.close();
    process.exit();
  } else { // Consultar la BD
    Realm.open({ path: './data/blogs.realm', schema: [DeviceSchema, UserSchema, RatingSchema, PurchaseSchema] }).then(DB => {
      let users = DB.objects('User');
      users.forEach(x => console.log(x.name));
      DB.close();
      process.exit();
    });
  }
}
