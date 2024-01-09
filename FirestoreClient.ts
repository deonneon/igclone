import { db, auth } from "./firebaseConfig";
import * as firestore from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  AuthError,
} from "firebase/auth";
class FirebaseClient {
  db;
  constructor() {
    this.db = db;
  }
  async upsertValue(
    collection: string,
    doc: string,
    data: firestore.DocumentData
  ) {
    await firestore.setDoc(firestore.doc(this.db, collection, doc), data);
  }

  async addValue(
    collection: string,
    doc: string | null,
    data: firestore.DocumentData
  ) {
    if (doc == null) {
      const newDoct = await firestore.addDoc(
        firestore.collection(this.db, collection),
        data
      );
      return newDoct.id;
    } else {
      await this.upsertValue(collection, doc, data);
      return doc;
    }
  }

  async getValue(collection: string, doc: string) {
    let docRef = firestore.doc(this.db, collection, doc);
    return await firestore.getDoc(docRef);
  }

  async updateAssignedMission(id: string, data: firestore.DocumentData) {
    const docRef = firestore.doc(this.db, "assignedMissions", id);
    await firestore.updateDoc(docRef, data);
  }

  async getWeeklyMissions(user: string) {
    const existingAssignedMission = await this._getExistingWeeklyMission(user);
    console.log(`Weekly missions for ${user}: ${existingAssignedMission.size}`);
    let retObj: Array<firestore.DocumentData> = [];
    if (existingAssignedMission.size > 0) {
      for (const doc of existingAssignedMission.docs) {
        const mission = await this.getValue("missions", doc.data()["mission"]);
        if (mission.exists()) {
          console.log(mission.data());
          retObj.push({
            ...mission.data(),
            id: doc.id,
            isChecked: doc.data()["isChecked"],
          });
        } else {
          console.log(`error, did not find ${doc.data()["mission"]}`);
        }
      }
      console.log(JSON.stringify(retObj));
      return { missions: retObj };
    }
    console.log("Did not find any missions");

    // TODO: Eventually pull user's managed labels isntead of hardcoding
    const labels = ["managed"];
    const missionsCollectionRef = firestore.collection(this.db, "missions");
    const labelsRef = firestore.collection(this.db, "labels");

    const validMissions = await firestore.getDocs(
      firestore.query(labelsRef, firestore.where("label", "in", labels))
    );
    const validMissionsIdLIst: Array<string> = [];
    validMissions.forEach((item) => {
      validMissionsIdLIst.push(item.data()["mission"]);
    });

    const docs = await firestore.getDocs(
      firestore.query(
        missionsCollectionRef,
        firestore.where("__name__", "in", validMissionsIdLIst)
      )
    );
    for (const doc of docs.docs) {
      const id = await this.addValue("assignedMissions", null, {
        week: this._week(),
        user: user,
        mission: doc.id,
        isChecked: false,
      });
      retObj.push({
        ...doc.data(),
        id: id,
      });
    }
    return { missions: retObj };
  }
  async _getExistingWeeklyMission(user: string) {
    const beginningOfWeek = this._week();
    console.log(`beginning of week: ${beginningOfWeek}`);
    const assignedCollectionRef = firestore.collection(
      this.db,
      "assignedMissions"
    );
    console.log("Querying for " + user);
    const query = firestore.query(
      assignedCollectionRef,
      firestore.where("user", "==", user),
      firestore.where("week", "==", beginningOfWeek)
    );

    return await firestore.getDocs(query);
  }

  async _assignWeeklyMission(user: string, mission: firestore.DocumentData) {
    const assignedCollectionRef = firestore.collection(
      this.db,
      "assignedMissions"
    );
    firestore.setDoc(firestore.doc(this.db, "assignedMissions"), mission);
  }

  _week() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    const week = new Date(today.setDate(diff));
    week.setHours(0, 0, 0, 0);
    return week;
  }
}

class FirebaseAuth {
  auth;
  constructor() {
    this.auth = auth;
  }
  async signup(email: string, password: string): Promise<UserCredential> {
    return await createUserWithEmailAndPassword(this.auth, email, password);
  }
  async login(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw error;
    }
  }
}

export const fbClient = new FirebaseClient();
export const fbAuth = new FirebaseAuth();
