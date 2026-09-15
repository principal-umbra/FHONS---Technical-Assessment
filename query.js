import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "ai-studio-cuestionariodeev-1e446a7e-4f8a-4c8e-8c30-94f6f7b18e73"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const docRef = doc(db, "evaluations_servicio_al_cliente", "eval_1784040881131_g70ieme");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data().profile);
  } else {
    console.log("No such document!");
  }
}
run();
