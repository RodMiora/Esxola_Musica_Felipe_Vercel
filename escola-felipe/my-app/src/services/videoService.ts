import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";

export const getYoutubeLinks = async () => {
  const linksRef = collection(db, "youtubeLinks");
  const snapshot = await getDocs(linksRef);
  
  const links: { [key: string]: string } = {};
  snapshot.docs.forEach(doc => {
    links[doc.id] = doc.data().url;
  });
  
  return links;
};

export const saveYoutubeLink = async (videoId: number | string, url: string) => {
  await setDoc(doc(db, "youtubeLinks", videoId.toString()), { url });
};

export const getVideoPermissions = async () => {
  const permissionsRef = collection(db, "videoPermissions");
  const snapshot = await getDocs(permissionsRef);
  
  const permissions: { [key: string]: number[] } = {};
  snapshot.docs.forEach(doc => {
    permissions[doc.id] = doc.data().videos || [];
  });
  
  return permissions;
};

export const updateVideoPermissions = async (studentId: number | string, videoIds: number[]) => {
  await setDoc(doc(db, "videoPermissions", studentId.toString()), { videos: videoIds });
};
