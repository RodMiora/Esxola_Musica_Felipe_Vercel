// Exemplo em um arquivo de serviço (ex: src/services/authService.ts)
import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";

export const getUserRole = async (uid: string): Promise<string | null> => {
  try {
    // Assumindo que você tem uma coleção 'users' onde o ID do documento é o UID do Firebase Auth
    const userDocRef = doc(db, "users", uid); // Substitua 'users' pelo nome da sua coleção de usuários/alunos
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      return userData?.role || null; // Retorna o campo 'role' ou null se não existir
    } else {
      console.warn(`Documento do usuário com UID ${uid} não encontrado no Firestore.`);
      return null; // Usuário não encontrado no Firestore
    }
  } catch (error) {
    console.error("Erro ao buscar role do usuário:", error);
    throw error; // Re-lança o erro para ser tratado no useEffect
  }
};
