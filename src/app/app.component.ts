import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { UserServiceService } from './servics/user-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var bootstrap: any;
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
}