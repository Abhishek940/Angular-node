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
  selectedFile='';
  productId: number | null = null;
  productForm!: FormGroup;
  productImage: string | null = null;  // To hold existing image URL (for update)
  //imageSrc: string ='';
  imageSrc: string | ArrayBuffer | null = null; 
  image: string = '';
  modal: Modal | undefined;
  @ViewChild('productModal', { static: false }) productModal: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = [
    'Slno',
    'image',
    'productName',
    'productPrice',
    'quantity',
    'Action',
  ];
 // Define pagination properties
 pageSize: number = 5;
 pageSizeOptions: number[] = [5, 10, 20];
 dataSource = new MatTableDataSource<any>(); // Initialize empty data source
 isUpdateMode :boolean=false;
  constructor(
    private userServiceService: UserServiceService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.getuserData();
    this.loadItems();
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      price: ['', [Validators.required]],
      quantity: [''],
      image:['',],
   
    });

  this.setImageValidators();
       
  }

  setImageValidators() {
    const image = this.productForm.get('image');
    const quantity = this.productForm.get('quantity');

    if(this.isUpdateMode){
      quantity ?.clearValidators();
     }else{
      quantity?.setValidators([Validators.required]);
    }

    quantity?.updateValueAndValidity();
  
    if (this.isUpdateMode && this.imageSrc) {
      image?.clearValidators();  // In update mode, it's not required if there's an existing image
    } else {
      image?.setValidators([Validators.required]);  // In add mode, it's required
    }

    image?.updateValueAndValidity();  // Revalidate the control after changing the validator
  }

  

  getProductById(id: number): void {
    this.userServiceService.getProductById(id).subscribe({
      next: (res) => {
        this.isUpdateMode = true; // Set update mode to true when editing
        this.productForm.patchValue({
          name: res.data.name,
          price: res.data.price,
          quantity: res.data.quantity,
        });

        // Set image src if the product already has an image
        this.imageSrc = `http://localhost:3000/${res.data?.image}`;
        this.setImageValidators();
      },
      error: (error) => {
        console.error('Error fetching product:', error);
      }
    });
  }

 /*  getProductById(id: number) {
    this.userServiceService.getProductById(id).subscribe({
      next:(res) => {
        console.log('Fetched product:', res);
        this.productForm.patchValue({
          name: res.data.name,
          price: res.data.price,
          quantity: res.data.quantity,
       
        });
        this.imageSrc = `http://localhost:3000/${res.data?.image}`;
      },
      error:(error) => {
        console.error('Error fetching product:', error);
      }
  });
  } */


  
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getImageUrl(imagePath: string): string {
    return `http://localhost:3000/${imagePath}`;
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

  getuserData() {
    this.userServiceService.getUserData().subscribe({
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

   
     /* onFileChange(event: any): void {
      const reader = new FileReader();
      if (event.target.files && event.target.files.length) {
        const [file] = event.target.files;
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.imageSrc = reader.result as string;  // Set the image preview
          this.productForm.patchValue({
            image: file,  
          });
        };
      }
    }  */

      // Handle file input change event
   
      onFileChange(event: any): void {
        const file = event.target.files[0];
        if (file) {
          // Check file type (only images are allowed)
          const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      
          // If file is not an image (video or any non-image type), show an error for invalid file type
          if (!allowedImageTypes.includes(file.type)) {
            Swal.fire({
              icon: 'error',
              title: 'Error...',
              text: 'Only jpg, jpeg, and png images are allowed.',
              confirmButtonText: 'Ok'
            });
            this.selectedFile = '';  // Clear the selected file
            this.imageSrc = null; // Clear the preview
            return;
          }
      
          // If file is an image, check the file size (1MB)
          if (file.size > 1024 * 1024) { // 1MB = 1048576 bytes
            Swal.fire({
              icon: 'error',
              title: 'Error...',
              text: 'File size should not exceed 1 MB.',
              confirmButtonText: 'Ok'
            });
            this.selectedFile = '';  // Clear the selected file
            this.imageSrc = null; // Clear the preview
            return;
          }
      
          // If both file type and size are valid, store the file
          this.selectedFile = file;
               
          // Reading the file as Data URL for preview
          const reader = new FileReader();
          reader.readAsDataURL(file);  // Read the file as a data URL
      
          reader.onload = () => {
            this.imageSrc = reader.result;  // Set the image preview source
          };
      
          reader.onerror = (error) => {
            console.error('Error reading file:', error);
          };
        }
      }
        
  
  onSubmit(): void {
  
    if (this.productForm.invalid) {
      
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
      if(this.productForm.get('image')?.invalid){
        Swal.fire({
          icon:'error',
          title:'Error...',
          text:'Image is required!',
          confirmButtonText:'Ok',
        })
      }
    } else {
    //  console.log('Form Valid:', this.productForm.value);
        const formData = new FormData();
        formData.append('name', this.productForm.get('name')?.value);
        formData.append('price', this.productForm.get('price')?.value);
        formData.append('quantity', this.productForm.get('quantity')?.value);

         // Check if the 'image' control has a file object, and append it to FormData
        //  const imageFile = this.productForm.get('image')?.value;
       /* if (imageFile) {
          formData.append('image', imageFile);  // Append the actual file, not the path
        }  */
      // for preview

        const fileInput = document.getElementById('imageInput') as HTMLInputElement;
            if (fileInput.files && fileInput.files.length > 0) {
               formData.append('image', fileInput.files[0]);
         } 

      // updating an existing product, 
      if (this.isUpdateMode && this.productId) {
        formData.append('_id', this.productId.toString());
      }

      this.userServiceService.addOrUpdateProduct(formData).subscribe({
        next:(response) => {
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
        error:(error) => {
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
    });
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
        this.userServiceService.deleteProduct(id).subscribe({
          next: (res) => {
            console.log('Delete successful:', res);
            this.loadItems();
            Swal.fire('Deleted!', res.msg, 'success');
          },
          error: (error) => {
            console.error('Delete failed:', error);
            Swal.fire('Error', 'Failed to delete item.', 'error');
          },
        });
      }
    });
  }

  /* Logout() {
    this.userServiceService.logout();
    this.router.navigate(['/']);
  } */

    Logout() {
      this.userServiceService.logout().subscribe({
       next: (response) => {
         this.router.navigate(['/']);
        },
        error:(error) => {
          console.log('Logout failed:', error);
        }
    });
    }

    isAdmin(): boolean {
      const role = localStorage.getItem('role');
      return role === 'admin';  // Check if the stored role is 'admin'
  }
    
}
