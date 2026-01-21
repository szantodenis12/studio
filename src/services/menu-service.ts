
'use client';
import {
  doc,
  setDoc,
  Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface MenuItemData {
  name: string;
  price: string;
  description?: string;
  imageUrl?: string;
}

export interface MenuPageData {
  title: string;
  items: MenuItemData[];
}

export interface MenuData {
  id: string;
  pages: MenuPageData[];
}

export const saveMenu = async (db: Firestore, menuId: string, data: { pages: MenuPageData[] }) => {
  if (!db) throw new Error("Firestore not available");

  const menuRef = doc(db, 'menus', menuId);

  try {
    // We use setDoc with merge: true which acts as an upsert.
    // This will create the document if it doesn't exist, or update it if it does.
    await setDoc(menuRef, data, { merge: true });
  } catch (error) {
    console.error("Error saving menu:", error);

    const permissionError = new FirestorePermissionError({
      path: `menus/${menuId}`,
      operation: 'update',
      requestResourceData: data,
    });

    errorEmitter.emit('permission-error', permissionError);
    throw error;
  }
};
