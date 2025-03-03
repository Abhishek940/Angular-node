import { Component,ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';
declare var bootstrap: any;
import { RoleService } from '../services/role.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-role',
  standalone: false,
  templateUrl: './role.component.html',
  styleUrl: './role.component.css'
})
export class RoleComponent {
  roleId:number | null =null;
  roleForm!:FormGroup;
  modal: any;
  @ViewChild('roleModal', { static: false }) roleModal: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<any>();
  modalInstance: any;
  isUpdateMode : boolean=false;
  roles: any[] = [];
    
constructor(
  private FormGroup:FormBuilder,
  private roleService:RoleService
){}

ngOnInit() {
  this.getroleData();
    this.roleForm = this.FormGroup.group({
    name: ['', [Validators.required]],
      
  });
     
}

ngAfterViewInit() {
  this.modal = new Modal(this.roleModal.nativeElement);
}

  openModal(roleId?: any): void {
    if (roleId) {
      // Edit mode
      this.roleId = roleId;
     // this.getRoleById(roleId); // Fetch product data
    } else {
      // Add mode
      this.roleId = null;
     // this.roleForm.reset();
    }

    // Open the modal using the modal reference
    if (this.modal) {
      this.modal.show();
    }
  }

  closeModal(): void {
    if (this.modal) {
      this.modal.hide();
    }
    this.roleId = null; // Reset the productId when modal is closed
    //this.roleForm.reset(); // Reset the form
  }

  getroleData(){
    this.roleService.getRole().subscribe({
      next:(res:any)=>{
        console.log(res);
        if(res?.data){
          this.roles = res.data;
          this.dataSource =new MatTableDataSource(res.data);
          this.dataSource.paginator =this.paginator;
          this.dataSource.sort =this.sort;
        }
      },
      error:(error)=>{
        console.error('Error fetching role:',error);
      }
    })
  
  }

  
  onValidateString(event: any): void {
    let inputValue = event.target.value;
     inputValue = inputValue.replace(/[0-9]/g, '');
     event.target.value = inputValue;
  }

   onSubmit(): void {
      if (this.roleForm.invalid) {
       if (this.roleForm.get('name')?.invalid) {
        Swal.fire({
          icon: 'error',
          title: 'Error...',
          text: 'Role Name is required!',
          confirmButtonText: 'OK',
        });
        return;
      }
      console.log(this.roleForm.valid);
    } else {
      // Get form values
      const name = this.roleForm.get('name')?.value;
      const status = this.roleForm.get('status')?.value;  
    console.log('name',name);
      // payload for submission
      const payload: any = {
        name: name,
       // status: status,
      };

    console.log('payload',payload);
      // If we are updating an existing role, append the roleId
      if (this.isUpdateMode && this.roleId) {
        payload['_id'] = this.roleId.toString(); 
      }
    
     
      // Call the service to add or update the role
      this.roleService.addOrUpdateRole(payload).subscribe({
        next: (response: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: response.msg,
            confirmButtonText: 'OK',
          });
       //   this.loadItems();  // Reload items after success
          this.roleForm.reset();  // Reset the form after success
          this.closeModal();  // Close the modal after success
        },
        error: (error: any) => {
          console.error('Error:', error);
          let errorMessage = error?.error?.msg || 'An unexpected error occurred';
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: errorMessage,
            confirmButtonText: 'OK',
          });
        }
      });
    }
  }    
 
}
