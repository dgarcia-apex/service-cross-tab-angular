import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  NgZone,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Message } from '../message.interface';
import { SharedService } from '../shared.service';
import { debounceTime, Subscription, Subject } from 'rxjs';

@Component({
  selector: 'app-page-two',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-two.component.html',
  styleUrl: './page-two.component.css',
})
export class PageTwoComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  newMessage = '';
  isOtherTyping = false;
  private subscription$!: Subscription;
  private typingSubscription$!: Subscription;
  private typingSubject$ = new Subject<void>();

  constructor(private sharedService: SharedService) {
    sharedService.messages$.subscribe((msgs) => {
      this.messages = msgs;
    });

    sharedService.isTyping$('page-one').subscribe((isTyping) => {
      console.log("I'm Typing?", isTyping);
    });

    sharedService.isTyping$('page-two').subscribe((isTyping) => {
      this.isOtherTyping = isTyping;
      console.log('Is Other Typing?', isTyping);
    });
  }

  ngOnInit() {
    this.typingSubscription$ = this.sharedService
      .isTyping$('page-one')
      .subscribe((isTyping) => {
        this.isOtherTyping = isTyping;
      });

    this.typingSubject$.pipe(debounceTime(300)).subscribe(() => {
      this.sharedService.setTyping(
        'page-two',
        this.newMessage.trim().length > 0
      );
    });
  }

  ngOnDestroy() {
    if (this.subscription$) {
      this.subscription$.unsubscribe();
    }
    if (this.typingSubscription$) {
      this.typingSubscription$.unsubscribe();
    }
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.sharedService.addMessage({
        source: 'page-two',
        text: this.newMessage,
        time: new Date(),
      });
      this.newMessage = '';
      this.sharedService.setTyping('page-two', false);
    }
  }

  onTyping() {
    this.typingSubject$.next();
  }
}
