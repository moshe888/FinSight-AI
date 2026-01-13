import { Component, signal, ViewChild, ElementRef, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col" dir="rtl">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div class="flex items-center gap-2">
          <div class="bg-blue-600 p-2 rounded-lg shadow-blue-200 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 class="text-xl font-bold tracking-tight text-slate-800">FinSight <span class="text-blue-600">AI</span></h1>
        </div>
        <div class="flex items-center gap-4">
          <span class="hidden md:inline text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">מנוע RAG פעיל</span>
          <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-300">JD</div>
        </div>
      </header>

      <main class="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 w-full">
        
        <!-- Sidebar: Upload & Actions -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">ניהול מסמכים</h2>
            
            <div 
              class="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-all cursor-pointer group bg-slate-50 hover:bg-white"
              (click)="fileInput.click()">
              <input #fileInput type="file" class="hidden" (change)="onFileSelected($event)" accept=".pdf">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 mx-auto text-slate-400 group-hover:text-blue-500 mb-2 transition-transform group-hover:-translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="text-sm font-semibold text-slate-700">לחץ להעלאת PDF</p>
              <p class="text-xs text-slate-400 mt-1">דוחות רבעוניים או שנתיים</p>
            </div>

            @if (selectedFile()) {
              <div class="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg animate-fade-in">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-blue-600 rounded text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div class="flex-1 overflow-hidden">
                    <p class="text-sm font-bold text-blue-900 truncate">{{ selectedFile()?.name }}</p>
                    <p class="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">מוכן לעיבוד</p>
                  </div>
                </div>
                <button 
                  (click)="uploadAndProcess()" 
                  [disabled]="isUploading()"
                  class="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {{ isUploading() ? 'מעבד מסמך...' : 'התחל ניתוח RAG' }}
                </button>
              </div>
            }

            @if (isReady()) {
              <div class="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2 animate-fade-in">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p class="text-xs font-bold text-green-700">המסמך אונדקס בהצלחה</p>
              </div>
            }
          </div>

          <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">תובנות מהירות</h2>
            <ul class="space-y-2">
              @for (suggestion of suggestions; track suggestion) {
                <li>
                  <button 
                    (click)="useSuggestion(suggestion)"
                    [disabled]="!isReady()"
                    class="w-full text-right text-xs p-2.5 rounded-xl hover:bg-blue-50 text-slate-600 border border-slate-100 hover:border-blue-200 transition-all disabled:opacity-30 disabled:hover:bg-transparent">
                    {{ suggestion }}
                  </button>
                </li>
              }
            </ul>
          </div>
        </div>

        <!-- Main: Chat Interface -->
        <div class="lg:col-span-3 flex flex-col h-[600px] md:h-auto">
          <div class="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            
            <!-- Chat Messages -->
            <div #scrollContainer class="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
              @if (chatHistory().length === 0) {
                <div class="h-full flex flex-col items-center justify-center text-center">
                  <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h3 class="text-lg font-bold text-slate-700">מערכת FinSight AI מוכנה</h3>
                  <p class="text-sm text-slate-500 max-w-xs mx-auto mt-2">העלה דוח כספי ב-PDF בצד ימין כדי להתחיל בתשאול הנתונים.</p>
                </div>
              }

              @for (msg of chatHistory(); track msg.timestamp) {
                <div [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
                  <div [class]="msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[85%] shadow-md shadow-blue-100' 
                    : 'bg-white text-slate-800 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] border border-slate-200 shadow-sm'">
                    <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ msg.content }}</p>
                    <div class="flex items-center gap-1 mt-2 opacity-50 text-[10px]">
                      <span>{{ msg.role === 'user' ? 'אתה' : 'FinSight AI' }}</span>
                      <span>•</span>
                      <span>{{ msg.timestamp | date:'HH:mm' }}</span>
                    </div>
                  </div>
                </div>
              }

              @if (isProcessing()) {
                <div class="flex justify-start">
                  <div class="bg-white rounded-2xl rounded-tl-none px-4 py-3 border border-slate-200 shadow-sm">
                    <div class="flex gap-1">
                      <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Input Area -->
            <div class="p-4 bg-slate-50 border-t border-slate-200">
              <div class="relative flex items-center bg-white rounded-xl shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <textarea 
                  [(ngModel)]="rawInput"
                  (keydown.enter)="$event.preventDefault(); sendMessage()"
                  placeholder="שאל שאלה על נתוני הדוח..."
                  rows="1"
                  class="w-full bg-transparent py-3 px-4 pr-12 focus:outline-none resize-none min-h-[50px] max-h-[150px] text-right"
                  [disabled]="!isReady() || isProcessing()"
                ></textarea>
                <button 
                  (click)="sendMessage()"
                  [disabled]="!rawInput.trim() || isProcessing() || !isReady()"
                  class="absolute left-2 p-2 bg-blue-600 text-white rounded-lg disabled:opacity-30 transition-all hover:bg-blue-700 active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
              <p class="text-[10px] text-center text-slate-400 mt-3 font-medium tracking-tight">
                מופעל על ידי GPT-4o & FAISS Vector Engine
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class App {
  // Use inject() instead of constructor injection to avoid decorator metadata issues in ES2015 target
  private http = inject(HttpClient);
  private apiBaseUrl = 'http://localhost:8000';

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  chatHistory = signal<Message[]>([]);
  isProcessing = signal(false);
  isUploading = signal(false);
  selectedFile = signal<File | null>(null);
  isReady = signal(false);
  rawInput = '';

  suggestions = [
    "מה היה אחוז הצמיחה בהכנסות?",
    "מהם סיכוני השוק המרכזיים שצוינו?",
    "סכם את נקודות המפתח מדברי המנכ״ל",
    "מהי תחזית הרווח לשנה הבאה?"
  ];

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
      this.isReady.set(false);
    }
  }

  uploadAndProcess() {
    const file = this.selectedFile();
    if (!file) return;

    this.isUploading.set(true);
    const formData = new FormData();
    formData.append('file', file);

    this.http.post(`${this.apiBaseUrl}/upload`, formData).subscribe({
      next: (res: any) => {
        this.isUploading.set(false);
        this.isReady.set(true);
        this.addMessage('ai', `המסמך "${file.name}" עובד בהצלחה. המידע זמין כעת לשאילתות.`);
      },
      error: (err) => {
        this.isUploading.set(false);
        this.addMessage('ai', 'שגיאה בעיבוד המסמך. וודא ששרת ה-Backend פועל ושה-API Key מוגדר.');
      }
    });
  }

  sendMessage() {
    const text = this.rawInput.trim();
    if (!text || this.isProcessing() || !this.isReady()) return;

    this.addMessage('user', text);
    this.rawInput = '';
    this.isProcessing.set(true);

    this.http.get<any>(`${this.apiBaseUrl}/query`, { params: { question: text } }).subscribe({
      next: (res) => {
        this.addMessage('ai', res.answer);
        this.isProcessing.set(false);
        this.scrollToBottom();
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.addMessage('ai', 'מצטער, חלה שגיאה בתקשורת עם מנוע הבינה המלאכותית.');
      }
    });
  }

  useSuggestion(suggestion: string) {
    this.rawInput = suggestion;
    this.sendMessage();
  }

  private addMessage(role: 'user' | 'ai', content: string) {
    const newMsg: Message = { role, content, timestamp: new Date() };
    this.chatHistory.update(prev => [...prev, newMsg]);
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.scrollContainer?.nativeElement;
      if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  }
}