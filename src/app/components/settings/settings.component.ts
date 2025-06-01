import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserUpdatingDTO } from '../../models/user.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  user$ = this.authService.currentUser$;
  loading = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getCurrentUser$().subscribe({
      next: (userData) => {
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
        this.loading = false;
      }
    });
  }
}
