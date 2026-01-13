import { Component, ChangeDetectionStrategy, signal, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col" dir="ltr">
      <!-- Navbar -->
      <nav class="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div class="flex items-center gap-2">
          <div class="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 class="text-xl font-bold tracking-tight text-slate-800">FinSight <span class="text-blue-600">AI</span></h1>
        </div>
        <div class="flex items-center gap-4">
          <span class="hidden sm:inline-block text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-md">
            RAG Engine Active
          </span>
          <div class="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">JD</div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
        
        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-4 overflow-y-auto">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <h2 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Document Management</h2>
            
            <div 
              class="group border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
              (click)="fileInput.click()">
              <input #fileInput type="file" class="hidden" (change)="onFileSelected($event)" accept=".pdf">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 mx-auto text-slate-300 group-hover:text-blue-500 mb-2 transition-transform group-hover:-translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="text-sm font-semibold text-slate-700">Upload Financial PDF</p>
              <p class="text-[10px] text-slate-400 mt-1">Drag & drop or click to browse</p>
            </div>

            @if (selectedFile()) {
              <div class="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                <div class="flex items-center gap-2 mb-3">
                  <div class="p-1.5 bg-blue-600 rounded text-white shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span class="text-xs font-bold text-blue-900 truncate flex-1">{{ selectedFile()?.name }}</span>
                </div>
                <button 
                  (click)="upload()" 
                  [disabled]="isUploading()"
                  class="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors">
                  {{ isUploading() ? 'Processing...' : 'Index & Start Analysis' }}
                </button>
              </div>
            }
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Insights</h2>
            <div class="space-y-2">
              @for (suggestion of suggestions; track suggestion) {
                <button 
                  (click)="setQueryFromSuggestion(suggestion)"
                  [disabled]="!isIndexed()"
                  class="w-full text-left text-[11px] p-2.5 rounded-xl border border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-blue-200 transition-all disabled:opacity-30 disabled:hover:bg-transparent">
                  {{ suggestion }}
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Chat Area -->
        <div class="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] lg:h-full">
          <!-- Messages Box -->
          <div #chatBox class="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/30">
            @if (messages().length === 0) {
              <div class="h-full flex flex-col items-center justify-center text-center opacity-40 select-none">
                <div class="p-4 bg-slate-100 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-slate-700">How can I help you?</h3>
                <p class="text-xs text-slate-500 max-w-xs mt-2">Upload a financial PDF report and ask questions about revenue, risks, or outlook.</p>
              </div>
            }

            @for (msg of messages(); track $index) {
              <div [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div [class]="msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[85%] shadow-md shadow-blue-100' 
                  : 'bg-white text-slate-800 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] border border-slate-200 shadow-sm'">
                  <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ msg.text }}</p>
                  <div class="mt-2 flex items-center gap-1.5 opacity-60 text-[9px] uppercase tracking-tighter">
                    <span>{{ msg.role === 'user' ? 'You' : 'FinSight AI' }}</span>
                    <span>•</span>
                    <span>{{ msg.time }}</span>
                  </div>
                </div>
              </div>
            }

            @if (isAsking()) {
              <div class="flex justify-start animate-pulse">
                <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                  <div class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div class="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                </div>
              </div>
            }
          </div>

          <!-- Input Controls -->
          <div class="p-4 bg-white border-t border-slate-100">
            <div class="relative flex items-center group">
              <input 
                #queryInput
                [value]="queryText()"
                (input)="updateQueryText(queryInput.value)"
                (keyup.enter)="ask()"
                [disabled]="!isIndexed() || isAsking()"
                type="text"
                placeholder="Ask a question about the report..."
                class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-5 pl-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              
              <button 
                (click)="ask()"
                [disabled]="!queryText().trim() || !isIndexed() || isAsking()"
                class="absolute right-2.5 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 shadow-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            <p class="text-[9px] text-center text-slate-400 mt-3 font-medium uppercase tracking-wider">
              Powered by RAG Engine • GPT-4o • FAISS
            </p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements AfterViewChecked {
  private http = inject(HttpClient);
  private api = 'http://localhost:8000';

  @ViewChild('chatBox') chatBox!: ElementRef;

  // Signals for Reactive State
  selectedFile = signal<File | null>(null);
  isUploading = signal(false);
  isIndexed = signal(false);
  isAsking = signal(false);
  queryText = signal('');
  messages = signal<{role: 'user' | 'ai', text: string, time: string}[]>([]);

  suggestions = [
    "What was the revenue growth percentage?",
    "Summarize the key points from the CEO statement.",
    "What are the main market risks mentioned?",
    "What is the EBITDA for the last quarter?"
  ];

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
      this.isIndexed.set(false);
    }
  }

  updateQueryText(val: string) {
    this.queryText.set(val);
  }

  setQueryFromSuggestion(val: string) {
    this.queryText.set(val);
    this.ask();
  }

  upload() {
    const file = this.selectedFile();
    if (!file) return;

    this.isUploading.set(true);
    const formData = new FormData();
    formData.append('file', file);

    this.http.post(`${this.api}/upload`, formData).subscribe({
      next: () => {
        this.isUploading.set(false);
        this.isIndexed.set(true);
        this.addMessage('ai', `The report "${file.name}" has been indexed. I am ready to analyze the data.`);
      },
      error: (err) => {
        this.isUploading.set(false);
        this.addMessage('ai', 'Error processing file. Ensure the backend is running on port 8000.');
        console.error('Upload error:', err);
      }
    });
  }

  ask() {
    const q = this.queryText().trim();
    if (!q || !this.isIndexed() || this.isAsking()) return;
    
    this.addMessage('user', q);
    this.queryText.set('');
    this.isAsking.set(true);

    this.http.get<{answer: string}>(`${this.api}/query`, { params: { question: q } }).subscribe({
      next: (res) => {
        this.isAsking.set(false);
        this.addMessage('ai', res.answer);
      },
      error: (err) => {
        this.isAsking.set(false);
        this.addMessage('ai', 'Sorry, there was an error fetching data. Is the backend active?');
        console.error('Query error:', err);
      }
    });
  }

  private addMessage(role: 'user' | 'ai', text: string) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.messages.update(m => [...m, { role, text, time: timeStr }]);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    if (this.chatBox) {
      const el = this.chatBox.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}