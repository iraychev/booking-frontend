import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  @Input({ required: true }) text: string = 'Click Me!';
  @Input() isGhost: boolean = false;
  @Input() isRed: boolean = false;
  @Input() disabled: boolean = false;
}
