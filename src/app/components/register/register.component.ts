import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/user.model';
import { Image } from '../../models/image.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/button/button.component';
import { ImageService } from '../../services/image.service';
import { ProfanityFilterService } from '../../services/profanity-filter.service';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, RouterLink],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  error: string = '';
  selectedRoles: string[] = [];
  rolesList: string[] = ['RENTER', 'PROPERTY_OWNER'];
  selectedFile!: File;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private imageService: ImageService,
    private profanityFilter: ProfanityFilterService,
    private errorService: ErrorService
  ) {}

  rolesMapping: { [key: string]: string } = {
    RENTER: 'Book a property',
    PROPERTY_OWNER: 'Rent out your property',
  };

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        username: [
          '',
          [Validators.required, Validators.pattern('^[a-zA-Z0-9._-]{3,}$')],
        ],
        firstName: [
          '',
          [Validators.required, Validators.pattern("^[a-zA-Z'-]{3,}$")],
        ],
        lastName: [
          '',
          [Validators.required, Validators.pattern("^[a-zA-Z'-]{3,}$")],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
        roles: this.fb.array([]),
      },
      { validator: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  private hasProfanity(): boolean {
    const username = this.registerForm.get('username')?.value;
    const firstName = this.registerForm.get('firstName')?.value;
    const lastName = this.registerForm.get('lastName')?.value;
    const email = this.registerForm.get('email')?.value;
    if (
      this.profanityFilter.hasProfanity(username) ||
      this.profanityFilter.hasProfanity(firstName) ||
      this.profanityFilter.hasProfanity(lastName) ||
      this.profanityFilter.hasProfanity(email)
    ) {
      this.errorService.handleError(
        'Profanity detected',
        'Remove any inappropriate words'
      );
      return true;
    }
    return false;
  }
  async register(): Promise<void> {
    if (this.registerForm.invalid) {
      this.error = 'Fill out all the fields';
      console.log(this.registerForm.errors);
      return;
    }

    if (this.hasProfanity()) {
      return;
    }
    const user: User = {
      id: '',
      firstName: this.registerForm.get('firstName')?.value,
      lastName: this.registerForm.get('lastName')?.value,
      profileImage: new Image(),
      username: this.registerForm.get('username')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
      roles: this.selectedRoles,
    };

    if (this.selectedFile) {
      await this.assignImage(user);
    }

    this.apiService.register(user).subscribe({
      next: (response) => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorService.handleError('Registration failed', err);
      },
    });
  }

  async assignImage(user: User) {
    user.profileImage = await this.imageService.mapFileToImage(
      this.selectedFile
    );
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onRoleChange(event: any): void {
    const role = event.target.value;
    if (event.target.checked) {
      this.selectedRoles = [...new Set([...this.selectedRoles, role])];
    } else {
      this.selectedRoles = this.selectedRoles.filter((r) => r !== role);
    }
  }
}
