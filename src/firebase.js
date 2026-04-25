import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBAvcrfi6ceTyczzxboqOdf7zFpkONh9IM",
  authDomain: "fxcalc-pro.firebaseapp.com",
  projectId: "fxcalc-pro",
  storageBucket: "fxcalc-pro.firebasestorage.app",
  messagingSenderId: "669190287843",
  appId: "1:669190287843:web:134c4c36f6925e41f170d6",
  measurementId: "G-BFXDJQ2YB8"
};     

const app = initializeApp(firebaseConfig)

export const auth     = getAuth(app)
export const db       = getFirestore(app)
export const provider = new GoogleAuthProvider()




 