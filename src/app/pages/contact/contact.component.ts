import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  formData = {
    name: '',
    organization: '',
    contact: '',
    email: '',
    purpose: '',
    message: ''
  };

  statusMessage = '';
  statusType: 'error' | 'success' = 'error';
  showSuccessState = false;
  submitted = false;

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidContact(contact: string): boolean {
    return /^[0-9+()\-\s]{7,}$/.test(contact);
  }

  isFormValid(): boolean {
    return Boolean(
      this.formData.name.trim() &&
      this.formData.organization.trim() &&
      this.isValidContact(this.formData.contact) &&
      this.isValidEmail(this.formData.email) &&
      this.formData.purpose.trim() &&
      this.formData.message.trim()
    );
  }

  getFieldError(field: 'name' | 'organization' | 'contact' | 'email' | 'purpose' | 'message'): string {
    if (!this.submitted) {
      return '';
    }

    switch (field) {
      case 'name':
        return this.formData.name.trim() ? '' : 'Please enter your name.';
      case 'organization':
        return this.formData.organization.trim() ? '' : 'Please enter your organization name.';
      case 'contact':
        return this.isValidContact(this.formData.contact) ? '' : 'Please enter a valid contact number.';
      case 'email':
        return this.isValidEmail(this.formData.email) ? '' : 'Please enter a valid email address.';
      case 'purpose':
        return this.formData.purpose.trim() ? '' : 'Please select a purpose.';
      case 'message':
        return this.formData.message.trim() ? '' : 'Please enter your message.';
      default:
        return '';
    }
  }

  hasFieldError(field: 'name' | 'organization' | 'contact' | 'email' | 'purpose' | 'message'): boolean {
    return Boolean(this.getFieldError(field));
  }

  resetForm(): void {
    this.formData = {
      name: '',
      organization: '',
      contact: '',
      email: '',
      purpose: '',
      message: ''
    };
    this.statusMessage = '';
    this.statusType = 'error';
    this.showSuccessState = false;
    this.submitted = false;
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;

    if (!this.isFormValid()) {
      this.showSuccessState = false;
      this.statusType = 'error';
      this.statusMessage = '';
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.formData)
      });

      if (!response.ok) {
        throw new Error('Unable to save the form data.');
      }

      this.showSuccessState = true;
      this.statusType = 'success';
      this.statusMessage = 'Message Sent!';
      this.formData = {
        name: '',
        organization: '',
        contact: '',
        email: '',
        purpose: '',
        message: ''
      };
    } catch (error) {
      this.showSuccessState = false;
      this.statusType = 'error';
      this.statusMessage = 'Submission failed. Start the local contact server to persist the file entry.';
    }
  }
}
