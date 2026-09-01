import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParentComponentComponent } from './parent-component.component';
import { ChildComponentComponent } from '../child-component/child-component.component';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
describe('ParentComponentComponent', () => {
  let component: ParentComponentComponent;
  let fixture: ComponentFixture<ParentComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParentComponentComponent, ChildComponentComponent],
       imports: [
        ReactiveFormsModule
      ],
       providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    
    .compileComponents();

    fixture = TestBed.createComponent(ParentComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
