import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { WEDDING_TASKS } from '../../data/wedding-data';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent {
  tasks = WEDDING_TASKS;

  todo = this.tasks.filter(task => task.status === 'todo');
  inProgress = this.tasks.filter(task => task.status === 'in-progress');
  done = this.tasks.filter(task => task.status === 'done');
}
