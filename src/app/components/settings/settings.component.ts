import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserUpdatingDTO, User } from '../../models/user.model';

type EditableField = 'username' | 'userEmail' | 'preference';

interface UserWithPreference extends User {
  userEmail?: string;
  preference?: number | string;
}

interface SettingsForms {
  username: FormGroup<{ username: FormControl<string | null> }>;
  userEmail: FormGroup<{ userEmail: FormControl<string | null> }>;
  preference: FormGroup<{ preference: FormControl<number | null> }>;
}

type PreferenceValue = 0 | 1 | 2; // 0: Importancia, 1: Balance, 2: Urgencia

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  loading = true;
  error: string | null = null;

  // Form related
  editForms: SettingsForms;
  editingField: EditableField | null = null;

  // Current user data
  currentUser: UserWithPreference = {
    id: 0,
    username: '',
    email: '',
    streak: 0,
    preference: ''
  };

  // Preference options for the slider
  preferenceOptions = [
    { value: 0, label: 'Importancia' },
    { value: 1, label: 'Balance' },
    { value: 2, label: 'Urgencia' }
  ];

  // Get preference label for display
  getPreferenceLabel(value: number): string {
    const option = this.preferenceOptions.find(opt => opt.value === value);
    return option ? option.label : 'No especificada';
  }

  // Expose preference for template
  get preference(): number | null {
    return this.currentUser.preference !== undefined ? Number(this.currentUser.preference) : null;
  }

  constructor(private authService: AuthService, private fb: FormBuilder) {
    this.editForms = this.initializeForms();
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  private initializeForms(): SettingsForms {
    return {
      username: this.fb.group({
        username: [this.currentUser.username, [Validators.required]]
      }),
      userEmail: this.fb.group({
        userEmail: [this.currentUser.userEmail || this.currentUser.email, [Validators.required, Validators.email]]
      }),
      preference: this.fb.group({
        preference: [this.currentUser.preference !== undefined ? Number(this.currentUser.preference) : 1, [Validators.required]]
      })
    };
  }

  private loadUserData(): void {
    this.loading = true;
    this.error = null;
    
    this.authService.getCurrentUser().subscribe({
      next: (userData: UserUpdatingDTO | null) => {
        if (userData) {
          this.currentUser = {
            ...this.currentUser,
            ...userData,
            preference: userData.preference || ''
          };
          this.updateForms();
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching user data:', error);
        this.error = 'Error al cargar los datos del usuario';
        this.loading = false;
      }
    });
  }

  private updateForms(): void {
    // Update each form with current user data
    this.editForms.username.patchValue({
      username: this.currentUser.username
    });
    
    this.editForms.userEmail.patchValue({
      userEmail: this.currentUser.userEmail || this.currentUser.email
    });
    
    this.editForms.preference.patchValue({
      preference: this.currentUser.preference !== undefined ? Number(this.currentUser.preference) : 1
    });
    
    this.loading = false;
  }

  startEditing(field: EditableField): void {
    this.editingField = field;
  }

  saveField(field: EditableField): void {
    let form: FormGroup;
    let fieldName: string;
    
    // Get the appropriate form and field name
    switch (field) {
      case 'username':
        form = this.editForms.username;
        fieldName = 'username';
        break;
      case 'userEmail':
        form = this.editForms.userEmail;
        fieldName = 'userEmail';
        break;
      case 'preference':
        form = this.editForms.preference;
        fieldName = 'preference';
        break;
      default:
        return;
    }

    if (form.invalid) {
      return;
    }

    const fieldValue = form.get(fieldName)?.value as string;
    
    // Create update payload with only the changed field
    const updatePayload: Partial<UserUpdatingDTO> = { 
      id: this.currentUser.id,
      username: field === 'username' ? fieldValue : this.currentUser.username,
      email: field === 'userEmail' ? fieldValue : this.currentUser.email
    };
    
    if (field === 'preference') {
      (updatePayload as any).preference = fieldValue;
    }

    // Show loading spinner and disable interactions
    this.loading = true;
    this.editingField = null; // Disable editing while saving

    // Make the API request
    this.authService.updateUser(updatePayload as UserUpdatingDTO).subscribe({
      next: (updatedUser: any) => {
        // Update local state with the updated user data
        this.currentUser = {
          ...this.currentUser,
          username: updatedUser.username || this.currentUser.username,
          email: updatedUser.email || this.currentUser.email,
          preference: updatedUser.preference || this.currentUser.preference
        };
        // Update forms with new data
        this.updateForms();
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.error = 'Error al actualizar los datos';
        // Re-enable editing if there was an error
        this.startEditing(field);
      },
      complete: () => {
        // Hide loading spinner and reload data
        this.loading = false;
        this.loadUserData();
      }
    });
  }

  cancelEdit(): void {
    this.editingField = null;
  }
  
  isEditingField(field: EditableField): boolean {
    return this.editingField === field;
  }
}
