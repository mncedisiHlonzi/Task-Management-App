import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.page.html',
  styleUrls: ['./create-task.page.scss'],
})
export class CreateTaskPage implements OnInit {
  isLoading = true; // Controls skeleton visibility

  task = {
    title: '',
    description: '',
    dueTime: '',
    priority: 'low',
  };

  userId: number | null = null;
  private apiUrl = 'http://172.168.161.212:3000/api/tasks';

  constructor(private http: HttpClient, private toastController: ToastController) {}

  ngOnInit() {
    this.loadUserData();

    // Show the skeleton for 3 seconds before revealing the form
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  loadUserData() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData && userData.id) {
      this.userId = userData.id;
    }
  }

  async createTask() {
    if (this.task.title && this.task.description && this.task.dueTime && this.userId) {
      try {
        const payload = { ...this.task, userId: this.userId };
        await this.http.post(this.apiUrl, payload).toPromise();

        const toast = await this.toastController.create({
          message: `Task "${this.task.title}" created successfully!`,
          duration: 2000,
          color: 'success',
        });
        await toast.present();

        this.resetForm();
      } catch (error) {
        console.error('Error creating task:', error);

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
    const localTime = event.detail.value;
    if (!localTime) {
      console.error('Invalid time value:', localTime);
      return;
    }
  
    try {
      const today = new Date().toISOString().split('T')[0];
      const isoString = `${today}T${localTime}:00Z`;
      const utcTime = new Date(isoString).toISOString();
      this.task.dueTime = utcTime;
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