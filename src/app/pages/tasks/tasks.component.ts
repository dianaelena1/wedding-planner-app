import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SPRINT_3_TASKS, WEDDING_TASKS } from '../../data/wedding-data';
import {
  WeddingTask,
  WeddingTaskChecklistItem,
  WeddingTaskPriority,
  WeddingTaskStatus,
  WeddingTimelineStage
} from '../../models/wedding-data.model';
import { FirebaseTasksService } from '../../services/firebase-tasks.service';
import { FirebaseErrorService } from '../../services/firebase-error.service';
import { EditSafetyService } from '../../core/edit-safety/edit-safety.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent {
  private readonly editSafety = inject(EditSafetyService);
  private readonly firebaseErrorService = inject(FirebaseErrorService);
  private readonly firebaseTasksService = inject(FirebaseTasksService);

  readonly tasks$ = this.firebaseTasksService.getTasks();

  readonly statusOptions: {
    value: WeddingTaskStatus;
    label: string;
  }[] = [
    { value: 'todo', label: 'De făcut' },
    { value: 'in-progress', label: 'În lucru' },
    { value: 'done', label: 'Finalizat' }
  ];

  readonly weddingDate = new Date('2026-09-05T12:00:00');

  readonly timelineOptions: {
    value: WeddingTimelineStage;
    label: string;
    description: string;
  }[] = [
    {
      value: 'now',
      label: 'Acum',
      description: 'Taskuri curente sau fără un termen mai apropiat de nuntă'
    },
    {
      value: 'one-month',
      label: 'Cu o lună înainte',
      description: 'În jurul datei de 5 august 2026'
    },
    {
      value: 'three-weeks',
      label: 'Cu trei săptămâni înainte',
      description: 'În jurul datei de 15 august 2026'
    },
    {
      value: 'one-week',
      label: 'Cu o săptămână înainte',
      description: 'În jurul datei de 29 august 2026'
    },
    {
      value: 'one-day',
      label: 'Cu o zi înainte',
      description: '4 septembrie 2026'
    },
    {
      value: 'wedding-day',
      label: 'În ziua nunții',
      description: '5 septembrie 2026'
    },
    {
      value: 'after-wedding',
      label: 'După nuntă',
      description: 'Plăți, returnări și închideri după eveniment'
    }
  ];

  readonly priorityOptions: {
    value: WeddingTaskPriority;
    label: string;
  }[] = [
    { value: 'low', label: 'Scăzută' },
    { value: 'medium', label: 'Medie' },
    { value: 'high', label: 'Ridicată' },
    { value: 'very high', label: 'Foarte ridicată' }
  ];

  formTask: WeddingTask | null = null;

  newChecklistLabel = '';

  isNewTask = false;
  isSaving = false;

  message = '';
  errorMessage = '';

  searchTerm = '';

  statusFilter: WeddingTaskStatus | 'all' = 'all';
  categoryFilter = 'all';

  viewMode: 'all' | 'checklists' | 'simple' = 'all';
  layoutMode: 'timeline' | 'list' = 'timeline';

  /**
   * Accordion:
   * null = toate etapele sunt închise.
   * Doar o etapă poate fi deschisă simultan.
   */
  expandedStage: WeddingTimelineStage | null = null;

  toggleTimelineStage(stage: WeddingTimelineStage): void {
    this.expandedStage =
        this.expandedStage === stage
            ? null
            : stage;
  }

  isTimelineStageExpanded(stage: WeddingTimelineStage): boolean {
    return this.expandedStage === stage;
  }

  handleTimelineStageKeydown(
      event: KeyboardEvent,
      stage: WeddingTimelineStage
  ): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleTimelineStage(stage);
    }
  }

  startAdd(): void {
    this.clearMessages();
    this.isNewTask = true;
    this.formTask = this.createEmptyTask();
  }

  startEdit(task: WeddingTask): void {
    this.clearMessages();

    this.isNewTask = false;

    this.formTask = {
      ...task,
      checklist: (task.checklist ?? []).map(item => ({
        ...item
      }))
    };
  }

  cancelEdit(): void {
    this.formTask = null;
    this.isNewTask = false;
    this.newChecklistLabel = '';
    this.clearMessages();
  }

  addChecklistItem(): void {
    const label = this.newChecklistLabel.trim();

    if (!this.formTask || !label) {
      return;
    }

    const item: WeddingTaskChecklistItem = {
      id: `item-${Date.now()}`,
      label,
      done: false
    };

    this.formTask.kind = 'checklist';

    this.formTask.checklist = [
      ...(this.formTask.checklist ?? []),
      item
    ];

    this.newChecklistLabel = '';
  }

  removeChecklistItem(itemId: string): void {
    if (!this.formTask) {
      return;
    }

    this.formTask.checklist =
        (this.formTask.checklist ?? []).filter(
            item => item.id !== itemId
        );
  }

  async saveTask(): Promise<void> {
    if (
        !this.formTask?.title.trim() ||
        !this.formTask.category.trim()
    ) {
      this.errorMessage =
          'Completează cel puțin titlul și categoria task-ului.';

      return;
    }

    this.syncStatusFromChecklist(this.formTask);

    this.isSaving = true;
    this.clearMessages();

    try {
      const { id, ...taskData } = this.formTask;

      if (this.isNewTask) {
        await this.firebaseTasksService.addTask(taskData);
      } else {
        await this.firebaseTasksService.saveTask(this.formTask);
      }

      this.formTask = null;
      this.isNewTask = false;

      this.message = 'Task-ul a fost salvat.';
    } catch (error) {
      this.errorMessage =
          this.firebaseErrorService.getMessage(error);
    } finally {
      this.isSaving = false;
    }
  }

  async toggleChecklistItem(
      task: WeddingTask,
      item: WeddingTaskChecklistItem
  ): Promise<void> {
    const updatedTask: WeddingTask = {
      ...task,

      checklist: (task.checklist ?? []).map(current =>
          current.id === item.id
              ? {
                ...current,
                done: !current.done
              }
              : {
                ...current
              }
      )
    };

    this.syncStatusFromChecklist(updatedTask);

    try {
      await this.firebaseTasksService.saveTask(updatedTask);
    } catch (error) {
      this.errorMessage =
          this.firebaseErrorService.getMessage(error);
    }
  }

  async deleteTask(task: WeddingTask): Promise<void> {
    if (!await this.editSafety.confirmDelete(task.title)) {
      return;
    }

    this.clearMessages();

    try {
      await this.firebaseTasksService.deleteTask(task.id);

      this.message = 'Task-ul a fost șters.';
    } catch (error) {
      this.errorMessage =
          this.firebaseErrorService.getMessage(error);
    }
  }

  async importInitialData(): Promise<void> {
    this.isSaving = true;
    this.clearMessages();

    try {
      await this.firebaseTasksService.importInitialTasks(
          WEDDING_TASKS
      );

      this.message =
          'Task-urile existente au fost importate în Firestore.';
    } catch (error) {
      this.errorMessage =
          this.firebaseErrorService.getMessage(error);
    } finally {
      this.isSaving = false;
    }
  }

  async importSprint3Checklist(): Promise<void> {
    this.isSaving = true;
    this.clearMessages();

    try {
      const count =
          await this.firebaseTasksService.importMissingTasks(
              SPRINT_3_TASKS
          );

      this.message = count
          ? `Au fost adăugate ${count} checklisturi din foile de organizare.`
          : 'Checklisturile din Sprintul 3 sunt deja importate.';
    } catch (error) {
      this.errorMessage =
          this.firebaseErrorService.getMessage(error);
    } finally {
      this.isSaving = false;
    }
  }

  getFilteredTasks(tasks: WeddingTask[]): WeddingTask[] {
    const term =
        this.searchTerm.trim().toLowerCase();

    return tasks.filter(task => {
      const matchesStatus =
          this.statusFilter === 'all' ||
          task.status === this.statusFilter;

      const matchesCategory =
          this.categoryFilter === 'all' ||
          task.category === this.categoryFilter;

      const hasChecklist =
          Boolean(task.checklist?.length);

      const matchesView =
          this.viewMode === 'all' ||
          (
              this.viewMode === 'checklists' &&
              hasChecklist
          ) ||
          (
              this.viewMode === 'simple' &&
              !hasChecklist
          );

      const checklistText =
          (task.checklist ?? [])
              .map(item => item.label)
              .join(' ');

      const matchesSearch =
          !term ||
          [
            task.title,
            task.category,
            task.notes ?? '',
            task.vendorName ?? '',
            task.assignee ?? '',
            task.timingLabel ?? '',
            checklistText
          ].some(value =>
              value
                  .toLowerCase()
                  .includes(term)
          );

      return (
          matchesStatus &&
          matchesCategory &&
          matchesView &&
          matchesSearch
      );
    });
  }

  getTimelineTasks(
      tasks: WeddingTask[],
      stage: WeddingTimelineStage
  ): WeddingTask[] {
    return this.getFilteredTasks(tasks)
        .filter(
            task =>
                this.getTimelineStage(task) === stage
        )
        .sort(
            (a, b) =>
                this.getTaskSortValue(a) -
                this.getTaskSortValue(b)
        );
  }

  getTimelineStage(
      task: WeddingTask
  ): WeddingTimelineStage {
    if (task.timelineStage) {
      return task.timelineStage;
    }

    const label =
        (task.timingLabel ?? '')
            .toLowerCase();

    if (
        label.includes('după') ||
        label.includes('dupa')
    ) {
      return 'after-wedding';
    }

    if (
        label.includes('ziua nunții') ||
        label.includes('ziua nuntii') ||
        label.includes('în ziua')
    ) {
      return 'wedding-day';
    }

    if (
        label.includes('o zi') ||
        label.includes('1 zi')
    ) {
      return 'one-day';
    }

    if (
        label.includes('o săptămână') ||
        label.includes('o saptamana') ||
        label.includes('1 săptămână') ||
        label.includes('1 saptamana')
    ) {
      return 'one-week';
    }

    if (
        label.includes('3 săptămâni') ||
        label.includes('3 saptamani') ||
        label.includes('trei săptămâni') ||
        label.includes('trei saptamani')
    ) {
      return 'three-weeks';
    }

    if (
        label.includes('o lună') ||
        label.includes('o luna') ||
        label.includes('1 lună') ||
        label.includes('1 luna')
    ) {
      return 'one-month';
    }

    if (task.dueDate) {
      const due =
          new Date(`${task.dueDate}T12:00:00`);

      const days =
          Math.round(
              (
                  this.weddingDate.getTime() -
                  due.getTime()
              ) /
              86400000
          );

      if (days < 0) {
        return 'after-wedding';
      }

      if (days === 0) {
        return 'wedding-day';
      }

      if (days <= 1) {
        return 'one-day';
      }

      if (days <= 10) {
        return 'one-week';
      }

      if (days <= 24) {
        return 'three-weeks';
      }

      if (days <= 38) {
        return 'one-month';
      }
    }

    return 'now';
  }

  getTimelineLabel(task: WeddingTask): string {
    return (
        this.timelineOptions.find(
            option =>
                option.value ===
                this.getTimelineStage(task)
        )?.label ??
        'Acum'
    );
  }

  getTimelineOpenCount(
      tasks: WeddingTask[],
      stage: WeddingTimelineStage
  ): number {
    return this
        .getTimelineTasks(tasks, stage)
        .filter(
            task =>
                task.status !== 'done'
        )
        .length;
  }

  private getTaskSortValue(
      task: WeddingTask
  ): number {
    if (task.status === 'done') {
      return Number.MAX_SAFE_INTEGER;
    }

    return task.dueDate
        ? new Date(
            `${task.dueDate}T12:00:00`
        ).getTime()
        : this.weddingDate.getTime();
  }

  getCategories(
      tasks: WeddingTask[]
  ): string[] {
    return [
      ...new Set(
          tasks
              .map(task => task.category)
              .filter(Boolean)
      )
    ].sort(
        (a, b) =>
            a.localeCompare(b, 'ro')
    );
  }

  getCount(
      tasks: WeddingTask[],
      status: WeddingTaskStatus
  ): number {
    return tasks.filter(
        task =>
            task.status === status
    ).length;
  }

  getChecklistCount(
      tasks: WeddingTask[]
  ): number {
    return tasks.filter(
        task =>
            Boolean(task.checklist?.length)
    ).length;
  }

  getStatusLabel(
      status: WeddingTaskStatus
  ): string {
    return (
        this.statusOptions.find(
            option =>
                option.value === status
        )?.label ??
        status
    );
  }

  getPriorityLabel(
      priority: WeddingTaskPriority
  ): string {
    return (
        this.priorityOptions.find(
            option =>
                option.value === priority
        )?.label ??
        priority
    );
  }

  getChecklistProgress(
      task: WeddingTask
  ): {
    done: number;
    total: number;
    percent: number;
  } {
    const items =
        task.checklist ?? [];

    const done =
        items.filter(
            item => item.done
        ).length;

    const total =
        items.length;

    return {
      done,
      total,
      percent:
          total
              ? Math.round(
                  (done / total) * 100
              )
              : 0
    };
  }

  isOverdue(task: WeddingTask): boolean {
    if (
        !task.dueDate ||
        task.status === 'done'
    ) {
      return false;
    }

    const dueDate =
        new Date(
            `${task.dueDate}T23:59:59`
        );

    return (
        dueDate.getTime() <
        Date.now()
    );
  }

  private syncStatusFromChecklist(
      task: WeddingTask
  ): void {
    const items =
        task.checklist ?? [];

    if (!items.length) {
      return;
    }

    const done =
        items.filter(
            item => item.done
        ).length;

    task.status =
        done === items.length
            ? 'done'
            : done > 0
                ? 'in-progress'
                : 'todo';
  }

  private createEmptyTask(): WeddingTask {
    return {
      id: '',
      title: '',
      category: '',
      status: 'todo',
      priority: 'medium',
      kind: 'task',
      dueDate: '',
      timingLabel: '',
      timelineStage: 'now',
      vendorName: '',
      assignee: '',
      checklist: [],
      notes: ''
    };
  }

  private clearMessages(): void {
    this.message = '';
    this.errorMessage = '';
  }
}