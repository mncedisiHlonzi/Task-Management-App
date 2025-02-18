import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { Component } from '@angular/core';

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.page.html',
  styleUrls: ['./create-task.page.scss'],
})
export class CreateTaskPage {
  task = {
    title: '',
    description: '',
    dueTime: '',
    priority: 'low',
  };

  userId: number | null = null; // To store user ID

  // Define base URL for the API
  private apiUrl = 'http://172.168.161.212:3000/api/tasks';

  constructor(private http: HttpClient, private toastController: ToastController) {
    this.loadUserData();
  }

  // Fetch user ID from localStorage
  loadUserData() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData && userData.id) {
      this.userId = userData.id;
    }
  }

  async createTask() {
    if (this.task.title && this.task.description && this.task.dueTime && this.userId) {
      try {
        const payload = { ...this.task, userId: this.userId }; // Include userId
        await this.http.post(this.apiUrl, payload).toPromise();

        // Show success toast
        const toast = await this.toastController.create({
          message: `Task "${this.task.title}" created successfully!`,
          duration: 2000,
          color: 'success',
        });
        await toast.present();

        // Reset form
        this.resetForm();
      } catch (error) {
        console.error('Error creating task:', error);

        // Show error toast
        const toast = await this.toastController.create({
          message: 'Failed to create task. Please try again later.',
          duration: 2000,
          color: 'danger',
        });
        await toast.present();
      }
    } else {
      const toast = await this.toastController.create({
        message: 'Please fill in all fields.',
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
    }
  }

  dueTimeChanged(event: any) {
    const localTime = event.detail.value; // Local time from ion-datetime
    
    if (!localTime) {
      console.error('Invalid time value from ion-datetime:', localTime);
      return; // Exit the method early if the value is invalid
    }
  
    try {
      // If only time is selected (HH:mm), append the current date to form a valid UTC timestamp
      const today = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD
      const isoString = `${today}T${localTime}:00Z`; // Append time and seconds for ISO format
      const utcTime = new Date(isoString).toISOString(); // Convert to UTC and get full timestamp
      this.task.dueTime = utcTime; // Store the full timestamp with timezone in UTC
    } catch (error) {
      console.error('Error processing time value:', localTime, error);
    }
  }

  resetForm() {
    this.task = {
      title: '',
      description: '',
      dueTime: '',
      priority: 'low',
    };
  }
}