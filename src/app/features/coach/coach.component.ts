import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject as RxSubject, takeUntil } from 'rxjs';
import { StudyPlannerService } from '../../core/services/study-planner.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';
import { ChatMessage, Subject } from '../../models';

interface QuickPrompt {
  icon: string;
  title: string;
  prompt: string;
  tag: string;
}

@Component({
  selector: 'app-coach',
  templateUrl: './coach.component.html',
  styleUrls: ['./coach.component.scss']
})
export class CoachComponent implements OnInit, OnDestroy {
  @ViewChild('chatScroll') chatScrollContainer!: ElementRef;

  messages: ChatMessage[] = [];
  inputMessage = '';
  isAiThinking = false;
  isSpeaking = false;
  isDark = false;
  subjects: Subject[] = [];
  selectedSubject = 'all';

  quickPrompts: QuickPrompt[] = [
    {
      icon: 'bolt',
      title: 'Explain In 3 Minutes',
      prompt: 'Explain Database Normalization (1NF to 3NF) with a simple real-world restaurant menu analogy.',
      tag: 'Mental Model'
    },
    {
      icon: 'target',
      title: 'Generate Quick Quiz',
      prompt: 'Create 3 challenging multiple-choice questions on Java Stream API with clear explanations.',
      tag: 'Practice'
    },
    {
      icon: 'strategy',
      title: 'Study Strategy',
      prompt: 'I have 14 days until my Operating Systems midterm. How should I allocate my 2 daily study hours?',
      tag: 'Pacing'
    },
    {
      icon: 'bulb',
      title: 'Memory Mnemonic',
      prompt: 'Give me memorable acronyms and mnemonics to memorize the 7 layers of the OSI model.',
      tag: 'Retention'
    }
  ];

  private destroy$ = new RxSubject<void>();

  constructor(
    private plannerService: StudyPlannerService,
    private notificationService: NotificationService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  isSidebarCollapsed = false;
  isMobileNavOpen = false;

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileNav(): void {
    this.isMobileNavOpen = !this.isMobileNavOpen;
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  ngOnInit(): void {
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => this.isDark = theme === 'dark');

    this.plannerService.subjects$
      .pipe(takeUntil(this.destroy$))
      .subscribe(subs => this.subjects = subs);

    // Initial greeting message
    this.messages = [
      {
        id: 'msg-0',
        role: 'assistant',
        content: `👋 Hello! I am your **StudyPilot AI Coach**. 
I have reviewed your upcoming exam dates (Java Programming in 14 days, Database Management in 21 days).

How can I help you accelerate your learning today? You can ask me to:
- 💡 Explain complex concepts with intuitive metaphors
- 📝 Generate rapid-fire flashcards & test questions
- 📊 Analyze your study velocity and suggest schedule tweaks`,
        timestamp: new Date()
      }
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sendMessage(customText?: string): void {
    const text = (customText || this.inputMessage).trim();
    if (!text || this.isAiThinking) return;

    // Add User Message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    this.messages.push(userMsg);
    this.inputMessage = '';
    this.scrollToBottom();

    // Trigger AI Response Simulation
    this.isAiThinking = true;

    setTimeout(() => {
      const response = this.generateAiResponse(text);
      this.messages.push({
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });
      this.isAiThinking = false;
      this.scrollToBottom();
    }, 1100);
  }

  private generateAiResponse(query: string): string {
    const lower = query.toLowerCase();

    if (lower.includes('normalization') || lower.includes('database') || lower.includes('1nf')) {
      return `### 🗄️ Database Normalization: The Restaurant Analogy

Think of normalization as organizing a restaurant kitchen ticket system to eliminate chaos and duplicate orders!

1. **1NF (Atomic Values — "No Combo Plates on One Line")**
   - *Rule:* Each table cell contains a single value; rows must be distinct.
   - *Analogy:* Instead of ordering \`"Burger + Fries + Coke"\` as one string, write three distinct items.

2. **2NF (No Partial Dependencies — "Kitchen vs Bar Separation")**
   - *Rule:* Every non-key column must depend on the *whole* primary key, not just part of a composite key.
   - *Analogy:* Don't put "Bartender's Name" on the Food Chef's ticket.

3. **3NF (No Transitive Dependencies — "Supplier info doesn't belong on receipt")**
   - *Rule:* Non-key columns cannot depend on other non-key columns ($A \\rightarrow B \\rightarrow C$).
   - *Analogy:* Customer receipt has "Burger Price", but shouldn't list "Beef Wholesaler Phone Number".

> 💡 **Study Tip:** Remember: *"The key, the whole key, and nothing but the key, so help me Codd."*`;
    }

    if (lower.includes('stream') || lower.includes('java') || lower.includes('quiz')) {
      return `### ☕ Java Stream API: Rapid Check

Here is a 3-question diagnostic to test your mastery:

**Q1. What is the difference between \`map()\` and \`flatMap()\`?**
- \`map()\` applies a 1-to-1 function: transforms each element \`T -> R\`.
- \`flatMap()\` flattens nested structures: transforms \`T -> Stream<R>\` into a single stream.

**Q2. Are Stream operations executed eagerly or lazily?**
- Intermediate operations (\`filter\`, \`map\`, \`sorted\`) are **lazy** — they don't execute until a terminal operation (\`collect\`, \`forEach\`, \`reduce\`) is invoked!

**Q3. Quick Code Inspection:**
\`\`\`java
List<String> names = Arrays.asList("Alex", "Bob", "Charlie");
names.stream()
     .filter(s -> s.length() > 3)
     .map(String::toUpperCase)
     .forEach(System.out::println);
// Output: ALEX, CHARLIE
\`\`\`

Would you like me to turn this into 5 flashcards in your Study Deck?`;
    }

    if (lower.includes('osi') || lower.includes('mnemonic') || lower.includes('network')) {
      return `### 🌐 OSI 7-Layer Model Mnemonics

Here are two classic mnemonics that top engineering students use:

**From Top (Layer 7) down to Bottom (Layer 1):**
> **"All People Seem To Need Data Processing"**
- **7. Application** (HTTP, DNS, SSH)
- **6. Presentation** (SSL/TLS, JPEG, ASCII)
- **5. Session** (Sockets, RPC)
- **4. Transport** (TCP, UDP, Port numbers)
- **3. Network** (IP, Routers, Packets)
- **2. Data Link** (MAC addresses, Switches, Frames)
- **1. Physical** (Cables, Bits, Voltages)

**From Bottom (Layer 1) to Top (Layer 7):**
> **"Please Do Not Throw Sausage Pizza Away"**

**Pro Exam Tip:** Exam questions frequently test Layer 2 (Frames/MAC) vs Layer 3 (Packets/IP) boundaries!`;
    }

    if (lower.includes('14 days') || lower.includes('operating systems') || lower.includes('plan') || lower.includes('midterm')) {
      return `### 14-Day Tactical Study Blueprint for Operating Systems

With 2 hours daily (28 total hours), here is your highest-yield strategy:

| Days | Focus Module | Daily Split | Target Mastery |
| :--- | :--- | :--- | :--- |
| **Days 1–4** | Process Scheduling & Synchronization | 75m study + 45m problem sets | Semaphore & Deadlock conditions |
| **Days 5–8** | Memory Management & Paging | 75m study + 45m diagrams | Page replacement algorithms (LRU, FIFO) |
| **Days 9–11** | File Systems & Disk Scheduling | 60m study + 60m practice | SCAN, C-SCAN, Inodes |
| **Days 12–13**| Full Past Exam Papers | 2-hour timed simulations | Speed & error diagnosis |
| **Day 14** | High-Yield Formula & Flowchart Review | 90m light review + rest | Peak mental readiness |

I have already updated your planner schedule with these milestones!`;
    }

    // Default intelligent response
    return `### Study Coach Cognitive Brief

Regarding **"${query}"**:

1. **Core Principle:** Deconstruct this concept into fundamental first principles. Before memorizing details, ensure you understand *why* this problem exists and *what* trade-offs it solves.
2. **Active Recall Prompt:** Without looking at your notes, write down the 3 most important definitions or equations related to this topic.
3. **Pacing Recommendation:** Dedicate a 45-minute Pomodoro block to this tomorrow morning when cognitive alertness is highest.

Would you like me to create a quick quiz on this or draft a revision cheat sheet?`;
  }

  toggleSpeech(content: string): void {
    if ('speechSynthesis' in window) {
      if (this.isSpeaking) {
        window.speechSynthesis.cancel();
        this.isSpeaking = false;
        return;
      }

      const plainText = content.replace(/[*#`_>|]/g, '');
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => { this.isSpeaking = false; };
      utterance.onerror = () => { this.isSpeaking = false; };
      this.isSpeaking = true;
      window.speechSynthesis.speak(utterance);
    } else {
      this.notificationService.info('Speech', 'Text-to-speech is not supported in this browser.');
    }
  }

  copyContent(content: string): void {
    navigator.clipboard?.writeText(content).then(() => {
      this.notificationService.success('Copied to Clipboard', 'Study notes copied successfully.');
    });
  }

  clearChat(): void {
    this.messages = [this.messages[0]];
    this.notificationService.info('Chat Cleared', 'Conversation history reset.');
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatScrollContainer) {
        const el = this.chatScrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 100);
  }
}
