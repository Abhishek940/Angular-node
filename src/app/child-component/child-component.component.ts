import { Component,Input,Output,EventEmitter,  } from '@angular/core';
export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
}
@Component({
  selector: 'app-child-component',
  standalone: false,
  
  templateUrl: './child-component.component.html',
  styleUrl: './child-component.component.css'
})
export class ChildComponentComponent {
// parent to child
  @Input() name: string = '';

  //child to parent
  @Output() message = new EventEmitter<string>();

  sendMessage(){
    this.message.emit('Hello child component');
  }

  // Parent → Child
  @Input() employee!: Employee;


  // Child → Parent
  @Output() editEmployee =
    new EventEmitter<Employee>();


  // Child → Parent
  @Output() deleteEmployee =
    new EventEmitter<number>();

   edit() {
    this.editEmployee.emit(this.employee);

  }

  delete() {
    this.deleteEmployee.emit(this.employee.id);

  }
}
