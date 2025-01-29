import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { UserServiceService } from '../servics/user-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
declare var bootstrap: any;
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent {
  [x: string]: any;
  title = 'angular-frontend';
  items: any;
  users: any;
  userName = '';
  productId: string | null = null;
  productForm!: FormGroup;
  modal: Modal | undefined;
  @ViewChild('productModal', { static: false }) productModal: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = [
    'Slno',
    'productName',
    'productPrice',
    'quantity',
    'Action',
  ];
 // Define pagination properties
 pageSize: number = 5;
 pageSizeOptions: number[] = [5, 10, 20];
  dataSource = new MatTableDataSource<any>(); // Initialize empty data source

  constructor(
    private userServiceService: UserServiceService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.loadItems();
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      price: ['', [Validators.required]],
      quantity: ['', [Validators.required]],
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadItems() {
    this.userServiceService.getProducts().subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.dataSource = new MatTableDataSource(res.data); //  new instance
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      },
      error:(error) => {
        console.error('Error fetching products:', error);
      }
  });
  }

  getProductById(id: number) {
    this.userServiceService.getProductById(id).subscribe(
      (res) => {
        console.log('Fetched product:', res);
        this.productForm.patchValue({
          name: res.data.name,
          price: res.data.price,
          quantity: res.data.quantity,
        });
      },
      (error) => {
        console.error('Error fetching product:', error);
      }
    );
  }


  ngAfterViewInit() {
    this.modal = new Modal(this.productModal.nativeElement);
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  /* openModal(): void {
      if (this.modal) {
        this.modal.show(); 
      }
    }
  
    closeModal(): void {
      if (this.modal) {
        this.modal.hide(); 
      }
    } */

  openModal(productId?: any): void {
    if (productId) {
      // Edit mode
      this.productId = productId;
      console.log('Editing product:', this.productId);
      this.getProductById(productId); // Fetch product data
    } else {
      // Add mode
      this.productId = null;
      this.productForm.reset();
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
    this.productId = null; // Reset the productId when modal is closed
    this.productForm.reset(); // Reset the form
  }

  onSubmit(): void {
    this.productForm.markAllAsTouched();
    this.productForm.updateValueAndValidity();
    console.log('Name:', this.productForm.get('name')?.invalid);
    console.log('Price:', this.productForm.get('price')?.invalid);
    console.log('Quantity:', this.productForm.get('quantity')?.invalid);

    if (this.productForm.invalid) {
      console.log('Form Invalid:', this.productForm.invalid);
      this.closeModal();
      if (this.productForm.get('name')?.invalid) {
        Swal.fire({
          icon: 'error',
          title: 'Error...',
          text: 'Product Name is required!',
          confirmButtonText: 'OK',
        });
        return;
      }
      if (this.productForm.get('price')?.invalid) {
        Swal.fire({
          icon: 'error',
          title: 'Error...',
          text: 'Product Price is required!',
          confirmButtonText: 'OK',
        });
        return;
      }
      if (this.productForm.get('quantity')?.invalid) {
        Swal.fire({
          icon: 'error',
          title: 'Error...',
          text: 'Product Quantity is required!',
          confirmButtonText: 'OK',
        });
        return;
      }
    } else {
      console.log('Form Valid:', this.productForm.value);
      // Prepare the data to send to the backend
      const newItem: {
        name: any;
        price: any;
        quantity: any;
        _id?: string | null;
      } = {
        name: this.productForm.get('name')?.value,
        price: this.productForm.get('price')?.value,
        quantity: this.productForm.get('quantity')?.value,
      };

      // Only add _id for update
      if (this.productId) {
        newItem['_id'] = this.productId; // If productId is present, it's an update
      }

      this.userServiceService.addOrUpdateProduct(newItem).subscribe(
        (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: response.msg,
            confirmButtonText: 'OK',
          });
          this.loadItems();
          this.productForm.reset();
          this.closeModal();
        },
        (error) => {
          console.error('Error:', error);
          let errorMessage =
            error?.error?.msg || 'An unexpected error occurred';
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: errorMessage,
            confirmButtonText: 'OK',
          });
        }
      );
    }
  }

  /* createItem() {
      if (this.userName.trim()) {
        this.userServiceService.createItem({ name: this.userName }).subscribe((item) => {
          this.users.push(item);
          this.userName = ''; 
        });
      }
    } */

  updateItem(id: number) {
    const updatedName = prompt('Enter new name:');
    if (updatedName) {
      this.userServiceService
        .updateItem(id, { name: updatedName })
        .subscribe(() => {
          this.loadItems();
        });
    }
  }

  /*  deleteItem(id: number) {
      console.log('id',id);
      if (confirm('Are you sure?')) {
        this.userServiceService.deleteItem(id).subscribe(() => {
          this.loadItems(); 
        });
      } */

  deleteItem(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete this record??',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userServiceService.deleteItem(id).subscribe({
          next: (response) => {
            console.log('Delete successful:', response);
            this.loadItems();
            Swal.fire('Deleted!', 'Record has been deleted.', 'success');
          },
          error: (error) => {
            console.error('Delete failed:', error);
            Swal.fire('Error', 'Failed to delete item.', 'error');
          },
        });
      }
    });
  }

  onLogout() {
    this.userServiceService.logout();
    this.router.navigate(['/']);
  }
}
