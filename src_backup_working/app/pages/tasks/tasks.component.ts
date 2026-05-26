import { Component } from '@angular/core';
import { WEDDING_TASKS } from '../../data/wedding-data';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent {
  tasks = WEDDING_TASKS;
}
