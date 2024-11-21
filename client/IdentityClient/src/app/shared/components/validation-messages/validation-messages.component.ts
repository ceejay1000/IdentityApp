import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-validation-messages',
  standalone: true,
  imports: [],
  templateUrl: './validation-messages.component.html',
  styleUrl: './validation-messages.component.css',
})
export class ValidationMessagesComponent {
  @Input() errorMessages: string[] = [];
}
