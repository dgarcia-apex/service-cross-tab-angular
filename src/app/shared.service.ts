import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Message } from './message.interface';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private typingSubjects: { [key: string]: Subject<boolean> } = {
    'page-one': new Subject<boolean>(),
    'page-two': new Subject<boolean>(),
  };

  constructor() {}

  addMessage(message: Message) {
    this.addMessageLocally(message);
  }

  private addMessageLocally(message: Message) {
    const messages = this.messagesSubject.getValue();
    messages.push(message);
    this.messagesSubject.next(messages);
  }

  setTyping(source: string, isTyping: boolean) {
    this.setTypingLocally(source, isTyping);
  }

  private setTypingLocally(source: string, isTyping: boolean) {
    this.typingSubjects[source].next(isTyping);
  }

  isTyping$(source: string) {
    return this.typingSubjects[source].asObservable();
  }
}
