/**
 * API interface for database
 *
 * const collection = database.collection("<collection_name>");
 *
 * collection.query({ id: "id-value", key: "key-value" })
 *
 */

import { collection, doc } from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

export class Collection {
  collection;
  constructor(name: string) {
    this.collection = collection(db, name);
  }

  query(filter: any) {}

  create() {}

  read() {}

  update() {}

  async delete(id: string) {
    await deleteDoc(doc(this.collection, id));
  }
}

export const database = {
  collection: (name: string) => new Collection(name),
};

export function cookie_clicks() {
  return database.collection("cookie_clicks");
}
