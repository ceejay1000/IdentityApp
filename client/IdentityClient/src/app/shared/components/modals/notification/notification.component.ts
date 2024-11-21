import { Component } from '@angular/core';
import { BsModalRef, ModalModule } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [ModalModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent {
  isSuccess = true;
  title = '';
  message = '';

  constructor(protected bsModalRef: BsModalRef) {}
}
