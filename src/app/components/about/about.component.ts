import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  projectName = 'Booking App';
  description =
    'This platform is designed to help users find and book their perfect vacation rentals.';
  features = [
    'User-friendly interface',
    'Secure backend booking system',
    'Detailed property descriptions',
  ];
  technologies = [
    'Angular',
    'Spring Boot',
    'PostgreSQL'
  ]
}
