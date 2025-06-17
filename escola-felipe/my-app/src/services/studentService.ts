// studentService.ts
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, updateDoc as firebaseUpdateDoc, doc as firebaseDoc, DocumentData, DocumentReference, PartialWithFieldValue } from "firebase/firestore"; // Importe updateDoc e doc com aliases para evitar conflitos se necessário, e tipos

// Interface para definir a estrutura de um estudante
interface Student {
  id?: string; // Adicione id como opcional para atualizações
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

// Nova função para atualizar um estudante usando a referência correta
export const updateStudent = async (studentId: string, data: PartialWithFieldValue<Student>) => {
  // Obtém a referência do documento usando a função doc e a instância do db
  const studentDocRef: DocumentReference<DocumentData> = firebaseDoc(db, "students", studentId);
  // Chama a função updateDoc com a referência do documento e os dados
  await firebaseUpdateDoc(studentDocRef, data);
};
