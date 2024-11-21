import { Component } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-home',
  standalone: true,
  providers: [BsModalService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
