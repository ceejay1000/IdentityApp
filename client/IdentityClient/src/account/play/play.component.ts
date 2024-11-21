import { Component, inject, OnInit } from '@angular/core';
import { PlayService } from '../../app/play.service';
import { NgIf } from '@angular/common';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [NgIf],
  providers: [BsModalService],
  templateUrl: './play.component.html',
  styleUrl: './play.component.css',
})
export class PlayComponent implements OnInit {
  private playService = inject(PlayService);
  message: any;

  ngOnInit(): void {
    this.playService.getPlayers().subscribe({
      next: (res: any) => (this.message = res.value.message),
      error: (error) => console.log(error),
    });
  }
}
