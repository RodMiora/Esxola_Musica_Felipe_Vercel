// studentService.ts
import { db } from "@/firebase/config";
import { collection, addDoc, getDocs, query, where, updateDoc as firebaseUpdateDoc, doc as firebaseDoc, DocumentData, DocumentReference, PartialWithFieldValue, deleteDoc } from "firebase/firestore";

// Interface para definir a estrutura de um estudante
export interface Student {
  id?: string; // Adicione id como opcional para atualizações
  name: string;
  email: string;
  password: string; // Cuidado ao lidar com senhas!
  role?: string; // 'student' ou 'admin'
  sequentialId?: number; // Novo campo para ID sequencial
  // Adicione explicitamente outros campos que você usa no AdminPage
  modulo: number;
  telefone?: string;
  endereco?: string;
  dataNascimento?: string;
  nomePaiMae?: string;
  dataInicioCurso?: string;
  telefoneResponsavel?: string;
  login: string; // Pode ser o email ou um login separado
  videosLiberados: number[]; // Array de IDs de vídeo liberados
  [key: string]: any; // Para campos adicionais que podem existir (menos preferível que listar explicitamente)
}

export const getStudents = async (): Promise<Student[]> => { // Adicionado tipo de retorno explícito
  const studentsRef = collection(db, "students");
  const snapshot = await getDocs(studentsRef);

  const students = snapshot.docs.map(doc => {
    // Mapeia o documento do Firestore para um objeto,
    // combinando o ID do documento com os dados.
    // Usamos 'as Student' para dizer ao TypeScript que este objeto
    // deve ser tratado como um Student.
    return { id: doc.id, ...doc.data() } as Student;
  });

  // Re-mapeia para adicionar/atualizar o sequentialId baseado na ordem atual
  // (Se você armazena sequentialId no Firestore, pode ajustar esta lógica)
  const studentsWithSequentialId = students.map((student, index) => ({
    ...student, // Espalha o objeto Student (que agora o TS reconhece)
    sequentialId: index + 1 // Adiciona ou sobrescreve o sequentialId
  }));

  // Ordenar por sequentialId calculado (opcional, mas mantém a consistência)
  studentsWithSequentialId.sort((a, b) => (a.sequentialId || 0) - (b.sequentialId || 0));


  return studentsWithSequentialId;
};

export const addStudent = async (student: Student) => {
  // Obter todos os estudantes para determinar o próximo ID sequencial
  // Nota: Esta abordagem pode ter problemas de concorrência se muitos usuários adicionarem ao mesmo tempo.
  // Uma abordagem mais robusta seria usar uma transação ou uma Cloud Function.
  const students = await getStudents(); // getStudents agora retorna Student[]
  const nextSequentialId = students.length + 1;

  // Adicionar o ID sequencial ao estudante antes de salvar
  // Crie um novo objeto para garantir que não modifica o objeto 'student' original
  const studentToAdd = {
    ...student,
    sequentialId: nextSequentialId,
    role: student.role || 'student', // Garante que o role existe
    videosLiberados: student.videosLiberados || [] // Garante que videosLiberados é um array
  };

  await addDoc(collection(db, "students"), studentToAdd);
};

// Função para atualizar um estudante
export const updateStudent = async (studentId: string, data: PartialWithFieldValue<Student>) => {
  const studentDocRef: DocumentReference<DocumentData> = firebaseDoc(db, "students", studentId);
  await firebaseUpdateDoc(studentDocRef, data);
};

// Função para remover um estudante
export const deleteStudent = async (studentId: string) => {
  const studentDocRef = firebaseDoc(db, "students", studentId);
  await deleteDoc(studentDocRef);

  // Reordenar IDs sequenciais após a remoção
  // Nota: Esta abordagem também pode ter problemas de concorrência e é custosa
  // (lê todos os documentos e escreve em todos).
  // Considere alternativas dependendo do volume de dados e frequência de exclusão.
  const remainingStudents = await getStudents(); // getStudents agora retorna Student[]
  for (let i = 0; i < remainingStudents.length; i++) {
    const student = remainingStudents[i];
    // Verifique se o ID existe antes de atualizar, embora getStudents deva retornar IDs válidos
    if (student.id) {
      await updateStudent(student.id, { sequentialId: i + 1 });
    }
  }
};

// Importações e funções para vídeos (se estiverem neste arquivo, senão remova)
// import { getYoutubeLinks, getVideoPermissions, updateVideoPermissions } from "./videoService";
// export { getYoutubeLinks, getVideoPermissions, updateVideoPermissions }; // Re-exporta se necessário
