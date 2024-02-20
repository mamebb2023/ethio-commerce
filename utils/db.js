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
    });
  }

  isAlive() {
    return Boolean(this.db);
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();

export default dbClient;