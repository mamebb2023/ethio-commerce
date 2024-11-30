import Bull from "bull";
import dbClient from "./db.js";

const queue = new Bull("addToCartQueue");

class fileUtils {
  static async getItem(...query) {
    const user = await dbClient.itemsCollection.findOne(...query);
    return user;
  }

  static async getUserCart(...query) {
    const userCart = await dbClient.cartCollection.findOne(...query);
    return userCart;
  }
}

async function processAddToCart(job) {
  const { userId, itemId } = job.data;

  try {
    const existingItem = await dbClient.cartCollection.findOne({ userId });

    if (existingItem) {
      // Update quantity if the item already exists
      await dbClient.cartCollection.updateOne(
        { userId },
        { $inc: { [itemId]: 1 } }
      );
    } else {
      // Insert the item with quantity 1 if it doesn't exist
      await dbClient.cartCollection.updateOne(
        { userId },
        { $set: { [itemId]: 1 } }
      );
    }
  } catch (error) {
    console.error("Error adding item to cart:", error);
  }
}

export async function addToCart(userId, itemId) {
  try {
    if (!itemId) {
      return { error: "Bad Request: Missing itemId" };
    }
    await queue.add({ userId, itemId });
    return { msg: "Item added to cart processing queue." };
  } catch (error) {
    console.error("Error adding item to queue:", error);
    return { error: "Internal Server Error" };
  }
}

queue.process(processAddToCart);

export default fileUtils;
