import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";

// Interface para definir a estrutura de um estudante
interface Student {
  name: string;
  email: string;
  password: string;
  role?: string;
  [key: string]: any; // Para campos adicionais que podem existir
}

export const getStudents = async () => {
  const studentsRef = collection(db, "students");
  const snapshot = await getDocs(studentsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addStudent = async (student: Student) => {
  await addDoc(collection(db, "students"), student);
};
