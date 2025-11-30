import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { getDoc, getDocs } from "firebase/firestore";
import { query, orderBy, limit } from "firebase/firestore";
import { setDoc, updateDoc, increment } from "firebase/firestore";

import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBI1D7vF25O6lnh0LBAfV6s22HKSrdWf9U",
  authDomain: "website-c8b0f.firebaseapp.com",
  databaseURL: "https://website-c8b0f-default-rtdb.firebaseio.com",
  projectId: "website-c8b0f",
  storageBucket: "website-c8b0f.firebasestorage.app",
  messagingSenderId: "599988907580",
  appId: "1:599988907580:web:468d4743453cf963c15d39",
  measurementId: "G-NQG9K8X8T0",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const user = await signInAnonymously(auth);

export type CookieClickData = {
  id: string;
  display_name: string;
  count: number;
};

export function getTopClickers(
  resultHandler: (data: CookieClickData[]) => void
): Unsubscribe {
  const cookie_clicks = collection(db, "cookie_clicks");
  const topCountQuery = query(
    cookie_clicks,
    orderBy("count", "desc"),
    limit(3)
  );
  return onSnapshot(topCountQuery, (data) => {
    const cookieClickData = data.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as CookieClickData)
    );
    resultHandler(cookieClickData);
  });
}

export async function getUser(): Promise<CookieClickData> {
  const document = doc(db, "cookie_clicks", user.user.uid);
  const data = await getDoc(document);
  if (data.exists()) {
    return {
      id: user.user.uid,
      ...data.data(),
    } as CookieClickData;
  } else {
    throw "User Not Found";
  }
}

// ! will overwrite
export async function createUser(): Promise<CookieClickData> {
  const document = doc(db, "cookie_clicks", user.user.uid);
  const data = { display_name: "", count: 0 };
  await setDoc(document, data);
  return { id: user.user.uid, ...data };
}

export async function updateDisplayName(newDisplayName: string) {
  const document = doc(db, "cookie_clicks", user.user.uid);

  await updateDoc(document, {
    display_name: newDisplayName,
  });
}

export async function clickCookie(count: number) {
  const document = doc(db, "cookie_clicks", user.user.uid);

  await updateDoc(document, {
    count: increment(count),
  });
}
