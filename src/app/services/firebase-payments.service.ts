import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { WeddingDrinkItem, WeddingExpense } from '../models/wedding-data.model';

@Injectable({ providedIn: 'root' })
export class FirebasePaymentsService {
  private readonly firestore = inject(Firestore);
  private readonly expensesCollection = 'weddingExpenses';
  private readonly drinksCollection = 'weddingDrinks';

  getExpenses(): Observable<WeddingExpense[]> {
    return collectionData(collection(this.firestore, this.expensesCollection), {
      idField: 'id'
    }) as Observable<WeddingExpense[]>;
  }

  getDrinks(): Observable<WeddingDrinkItem[]> {
    return collectionData(collection(this.firestore, this.drinksCollection), {
      idField: 'id'
    }) as Observable<WeddingDrinkItem[]>;
  }

  addExpense(expense: Omit<WeddingExpense, 'id'>): Promise<unknown> {
    return addDoc(collection(this.firestore, this.expensesCollection), {
      ...this.prepareExpense(expense),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  saveExpense(expense: WeddingExpense): Promise<void> {
    return setDoc(
      doc(this.firestore, `${this.expensesCollection}/${expense.id}`),
      { ...this.prepareExpense(expense), updatedAt: serverTimestamp() },
      { merge: true }
    );
  }

  deleteExpense(id: string): Promise<void> {
    return deleteDoc(doc(this.firestore, `${this.expensesCollection}/${id}`));
  }

  addDrink(drink: Omit<WeddingDrinkItem, 'id'>): Promise<unknown> {
    return addDoc(collection(this.firestore, this.drinksCollection), {
      ...this.prepareDrink(drink),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  saveDrink(drink: WeddingDrinkItem): Promise<void> {
    return setDoc(
      doc(this.firestore, `${this.drinksCollection}/${drink.id}`),
      { ...this.prepareDrink(drink), updatedAt: serverTimestamp() },
      { merge: true }
    );
  }

  deleteDrink(id: string): Promise<void> {
    return deleteDoc(doc(this.firestore, `${this.drinksCollection}/${id}`));
  }

  async importInitialData(expenses: WeddingExpense[], drinks: WeddingDrinkItem[]): Promise<void> {
    const [expenseSnapshot, drinkSnapshot] = await Promise.all([
      getDocs(collection(this.firestore, this.expensesCollection)),
      getDocs(collection(this.firestore, this.drinksCollection))
    ]);

    if (!expenseSnapshot.empty || !drinkSnapshot.empty) {
      throw new Error('Există deja plăți sau băuturi în Firestore. Importul a fost oprit pentru a evita duplicatele.');
    }

    const batch = writeBatch(this.firestore);
    const expenseRef = collection(this.firestore, this.expensesCollection);
    const drinkRef = collection(this.firestore, this.drinksCollection);

    expenses.forEach(expense => {
      batch.set(doc(expenseRef, expense.id), {
        ...this.prepareExpense(expense),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    drinks.forEach(drink => {
      batch.set(doc(drinkRef, drink.id), {
        ...this.prepareDrink(drink),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
  }

  private prepareExpense(expense: Partial<WeddingExpense>): Record<string, unknown> {
    const quantity = expense.quantity ?? null;
    const unitPrice = this.numberOrNull(expense.unitPrice);
    const total = this.numberOrNull(expense.total) ??
      (typeof quantity === 'number' && unitPrice !== null ? quantity * unitPrice : null);
    const advancePaid = this.numberOrNull(expense.advancePaid) ?? 0;
    const remainingPayment = total !== null ? Math.max(total - advancePaid, 0) : null;
    const deadlineType = expense.deadlineType ??
      (expense.dueDate ? 'exact' : expense.relativeDeadline ? 'relative' : 'unspecified');
    const paymentMoment = expense.payAfterWedding
      ? 'after-wedding'
      : (expense.paymentMoment ?? 'before-wedding');

    return {
      category: expense.category?.trim() ?? '',
      name: expense.name?.trim() ?? '',
      quantity,
      unitPrice,
      total,
      currency: expense.currency ?? 'RON',
      advancePaid,
      remainingPayment,
      dueDate: deadlineType === 'exact' ? (expense.dueDate?.trim() ?? '') : '',
      deadlineType,
      relativeDeadline: deadlineType === 'relative' ? (expense.relativeDeadline?.trim() ?? '') : '',
      paymentMoment,
      payAfterWedding: expense.payAfterWedding === true || expense.paymentMoment === 'after-wedding',
      vendorId: expense.vendorId?.trim() ?? '',
      vendorName: expense.vendorName?.trim() ?? '',
      source: expense.source ?? 'Manual',
      notes: expense.notes?.trim() ?? '',
      status: expense.status ?? 'unknown',
      includeInTotals: expense.includeInTotals !== false
    };
  }

  private prepareDrink(drink: Partial<WeddingDrinkItem>): Record<string, unknown> {
    const pricePerLiter = this.numberOrNull(drink.pricePerLiter);
    const quantity = this.numberOrNull(drink.quantity);
    const total = this.numberOrNull(drink.total) ??
      (pricePerLiter !== null && quantity !== null ? pricePerLiter * quantity : null);

    return {
      name: drink.name?.trim() ?? '',
      pricePerLiter,
      quantity,
      total,
      packageVolume: this.numberOrNull(drink.packageVolume),
      bottles: this.numberOrNull(drink.bottles),
      notes: drink.notes?.trim() ?? ''
    };
  }

  private numberOrNull(value: unknown): number | null {
    if (value === '' || value === null || value === undefined) {
      return null;
    }
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  }
}
