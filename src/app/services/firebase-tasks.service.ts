import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { WeddingTask } from '../models/wedding-data.model';

@Injectable({ providedIn: 'root' })
export class FirebaseTasksService {
  private readonly firestore = inject(Firestore);
  private readonly collectionName = 'weddingTasks';

  getTasks(): Observable<WeddingTask[]> {
    const tasksQuery = query(
      collection(this.firestore, this.collectionName),
      orderBy('sortOrder', 'asc')
    );

    return collectionData(tasksQuery, { idField: 'id' }) as Observable<WeddingTask[]>;
  }

  async hasTasks(): Promise<boolean> {
    const snapshot = await getDocs(collection(this.firestore, this.collectionName));
    return !snapshot.empty;
  }

  addTask(task: Omit<WeddingTask, 'id'>): Promise<unknown> {
    return addDoc(collection(this.firestore, this.collectionName), {
      ...this.toFirestore(task),
      sortOrder: Date.now(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  saveTask(task: WeddingTask): Promise<void> {
    if (!task.id) {
      return Promise.reject(new Error('Lipsește ID-ul task-ului.'));
    }

    return setDoc(
      doc(this.firestore, `${this.collectionName}/${task.id}`),
      {
        ...this.toFirestore(task),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  }

  deleteTask(taskId: string): Promise<void> {
    return deleteDoc(doc(this.firestore, `${this.collectionName}/${taskId}`));
  }

  async importInitialTasks(tasks: WeddingTask[]): Promise<void> {
    if (await this.hasTasks()) {
      throw new Error('Colecția de task-uri conține deja date. Importul a fost oprit pentru a nu suprascrie modificările.');
    }

    const batch = writeBatch(this.firestore);
    const tasksRef = collection(this.firestore, this.collectionName);

    tasks.forEach((task, index) => {
      batch.set(doc(tasksRef, task.id), {
        ...this.toFirestore(task),
        sortOrder: index,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
  }

  async importMissingTasks(tasks: WeddingTask[]): Promise<number> {
    const tasksRef = collection(this.firestore, this.collectionName);
    const missing: WeddingTask[] = [];

    for (const task of tasks) {
      const snapshot = await getDoc(doc(tasksRef, task.id));
      if (!snapshot.exists()) {
        missing.push(task);
      }
    }

    if (!missing.length) {
      return 0;
    }

    const batch = writeBatch(this.firestore);
    missing.forEach((task, index) => {
      batch.set(doc(tasksRef, task.id), {
        ...this.toFirestore(task),
        sortOrder: 1000 + index,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
    return missing.length;
  }

  private toFirestore(task: Partial<WeddingTask>): Record<string, unknown> {
    return {
      title: task.title?.trim() ?? '',
      category: task.category?.trim() ?? '',
      dueDate: task.dueDate?.trim() ?? '',
      status: task.status ?? 'todo',
      priority: task.priority ?? 'medium',
      kind: task.kind ?? 'task',
      vendorId: task.vendorId?.trim() ?? '',
      vendorName: task.vendorName?.trim() ?? '',
      assignee: task.assignee?.trim() ?? '',
      timingLabel: task.timingLabel?.trim() ?? '',
      checklist: (task.checklist ?? []).map(item => ({
        id: item.id,
        label: item.label.trim(),
        done: Boolean(item.done)
      })),
      notes: task.notes?.trim() ?? ''
    };
  }
}
