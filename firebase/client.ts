import { initializeApp, getApp, getApps } from "firebase/app"
import { getAuth } from "@firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
	apiKey: "AIzaSyCNm0oIQg0Y62x4HPj4gOUqE02uvWk9JkI",
	authDomain: "prepwise-281e6.firebaseapp.com",
	projectId: "prepwise-281e6",
	storageBucket: "prepwise-281e6.firebasestorage.app",
	messagingSenderId: "427529532411",
	appId: "1:427529532411:web:745877af43e26fb1a3d15e",
	measurementId: "G-K8JCYQLWT7",
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

export const auth = getAuth(app)
export const db = getFirestore(app)
