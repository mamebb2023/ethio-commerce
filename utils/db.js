import { MongoClient } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'ethio-commerce';
const url = `mongodb://${DB_HOST}:${DB_PORT}/`;
const options = {
  useUnifiedTopology: true,
};

class DBClient {
  constructor() {
    MongoClient.connect(url, options, (err, client) => {
      if (err) {
        console.log(err.message);
        this.db = false;
      }

      this.db = client.db(DB_DATABASE);
      this.userCollection = this.db.collection('users');
      this.itemsCollerction = this.db.collection('items');
    });
  }

  isAlive() {
    return Boolean(this.db);
  }

  async nbUsers() {
    return this.db.userCollection.countDocuments();
  }

  async nbItems() {
    return this.db.itemsCollerction.countDocuments()
  }
}

const dbClient = new DBClient();

export default dbClient;
