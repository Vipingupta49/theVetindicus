import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

interface ContactEntry {
  timestamp: string;
  payload: {
    name?: string;
    organization?: string;
    contact?: string;
    email?: string;
    purpose?: string;
    message?: string;
  };
}

@Component({
  selector: 'app-contact-entries',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-entries.component.html',
  styleUrls: ['./contact-entries.component.css']
})
export class ContactEntriesComponent implements OnInit {
  entries: ContactEntry[] = [];
  currentPage = 1;
  pageSize = 6;
  loading = true;
  errorMessage = '';

  async ngOnInit(): Promise<void> {
    await this.loadEntries();
  }

  async loadEntries(): Promise<void> {
    try {
      const response = await fetch('http://localhost:3001/api/contact-entries');

      if (!response.ok) {
        throw new Error('Unable to load contact entries.');
      }

      const data = await response.json();
      this.entries = Array.isArray(data.entries) ? data.entries : [];
      this.currentPage = 1;
      this.errorMessage = '';
    } catch (error) {
      this.entries = [];
      this.errorMessage = 'Unable to load saved contact entries from the local server.';
    } finally {
      this.loading = false;
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.entries.length / this.pageSize));
  }

  get pagedEntries(): ContactEntry[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.entries.slice(startIndex, startIndex + this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
    }
  }
}
