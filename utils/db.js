import pkg from "mongodb";
const { MongoClient } = pkg;

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || "ethio-commerce";
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
      } else {
        this.db = client.db(DB_DATABASE);
        this.userCollection = this.db.collection("users");
        this.itemsCollection = this.db.collection("items");
        this.cartCollection = this.db.collection("cart");
      }
    });
  }

  async isAlive() {
    return Boolean(this.db);
  }

  async nbUsers() {
    return this.db.collection("users").countDocuments();
  }

  async nbItems() {
    return this.db.collection("items").countDocuments();
  }

  async nbCart() {
    return this.db.collection("cart").countDocuments();
  }
}

const dbClient = new DBClient();

export default dbClient;
