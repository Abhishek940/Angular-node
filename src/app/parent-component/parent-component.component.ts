import { Component } from '@angular/core';
export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
}
@Component({
  selector: 'app-parent-component',
  standalone: false,
  templateUrl: './parent-component.component.html',
  styleUrl: './parent-component.component.css'
})
export class ParentComponentComponent {
  parentName: string = 'Angular';
  messagefromchild:string ='';

  receivedMessage(message:string){
    this.messagefromchild = message;
  }

   employees: Employee[] = [

    {
      id: 1,
      name: 'Abhishek',
      email: 'abhishek@gmail.com',
      department: 'IT'
    },

    {
      id: 2,
      name: 'Rahul',
      email: 'rahul@gmail.com',
      department: 'HR'
    },

    {
      id: 3,
      name: 'Amit',
      email: 'amit@gmail.com',
      department: 'Finance'
    }

  ];



  // Child sends employee here
  editEmployee(employee: Employee) {

    console.log('Edit employee:', employee);

  }


  // Child sends employee ID here
  deleteEmployee(id: number) {

    console.log('Delete employee ID:', id);

    this.employees = this.employees.filter(
      employee => employee.id !== id
    );

  }

}
