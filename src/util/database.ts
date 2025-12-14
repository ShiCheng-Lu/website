/**
 * API interface for database
 *
 * const collection = database.collection("<collection_name>");
 *
 * collection.query({ id: "id-value", key: "key-value" })
 *
 */

import {
  DocumentReference,
  FieldPath,
  FieldValue,
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";
import { CookieClickData, db, user } from "./firebase";

export class Collection<T extends { [key: string]: any }> {
  collection;
  constructor(name: string) {
    this.collection = collection(db, name);
  }

  async query(filter: any, ...constraint: any[]): Promise<{ [id: string]: T }> {
    const queries = query(this.collection, filter, ...constraint);
    const documents = await getDocs(queries);
    const data: { [id: string]: T } = {};
    documents.forEach((document) => {
      if (document.exists()) {
        data[document.id] = document.data() as T;
      }
    });
    return data;
  }

  async create(data: T, id: string | null = user.user.uid) {
    if (id) {
      await setDoc(doc(this.collection, id), data);
    } else {
      await addDoc(this.collection, data);
    }
  }

  async read(id: string = user.user.uid) {
    const document = await getDoc(doc(this.collection, id));
    if (document.exists()) {
      return document.data() as T;
    } else {
      return null;
    }
  }

  async update(data: T, id: string = user.user.uid) {
    await updateDoc(doc(this.collection, id), data);
  }

  async delete(id: string = user.user.uid) {
    await deleteDoc(doc(this.collection, id));
  }

  ref(id: string = user.user.uid) {
    return doc(this.collection, id);
  }
}

export const database = {
  collection: <T extends { [key: string]: any }>(collectionName: string) =>
    new Collection<T>(collectionName),
};

export function cookie_clicks() {
  return database.collection<CookieClickData>("cookie_clicks");
}

export type PetData = {
  createdAt: Timestamp;
  createdBy: string;
  palette: string[];
  shape: string;
};

export function pets() {
  return database.collection<PetData>("pets");
}

export type PetOwnerData = {
  lastClaimed: Timestamp;
  lastCreated: Timestamp;
  pets: DocumentReference[];
};

export function pet_owners() {
  return database.collection<PetOwnerData>("pet_owners");
}

export type LobbyData = {
  createdAt: Timestamp;
  offer: string;
  answer: string;
  ice: RTCIceCandidateInit[];
  name: string;
};

export function lobby() {
  return database.collection<LobbyData>("lobby");
}
