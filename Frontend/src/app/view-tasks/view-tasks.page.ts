import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router'; // Import Router for navigation

@Component({
  selector: 'app-view-tasks',
  templateUrl: './view-tasks.page.html',
  styleUrls: ['./view-tasks.page.scss'],
})
export class ViewTasksPage implements OnInit {

  private baseUrl: string = 'http://172.168.161.212:3000/api'; // Base URL for the API
  userId: number | null = null; // To store user ID
  tasks: any[] = [];  // Array to store tasks fetched from the database
  showFullDescription: boolean = false;
  isStatusLocked: { [taskId: number]: boolean } = {}; // Lock dropdown per task

  constructor(
    private alertController: AlertController,
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router // Inject Router
  ) { 
    this.loadUserData();
  }

  ngOnInit() {
    this.loadTasks();  // Load tasks when the component initializes
  }

  // Fetch user ID from localStorage
  loadUserData() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData && userData.id) {
      this.userId = userData.id;
    }
  }

  // Fetch tasks from the backend
  loadTasks() {
    this.loadUserData(); // Ensure userId is loaded
  
    if (this.userId) {
      const apiUrl = `${this.baseUrl}/tasks?userId=${this.userId}`;
      this.http.get<any[]>(apiUrl).subscribe(
        (data) => {
          this.tasks = data; // Assign fetched tasks to the tasks array
        },
        (error) => {
          console.error('Error fetching tasks:', error);
        }
      );
    } else {
      console.error('User ID not found. Cannot load tasks.');
    }
  }  

  // Toggle full description
  toggleDescription(task: any) {
    task.showFullDescription = !task.showFullDescription;
  }

  // Change status and update in the database
  async changeStatus(task: any, event: any) {
    const selectedStatus = event.detail.value;

    if (selectedStatus === 'completed' && !this.isStatusLocked[task.id]) {
      // Show confirmation alert for marking as completed
      const alert = await this.alertController.create({
        header: 'Complete Task',
        message: 'Are you sure you want to mark this task as completed?',
        cssClass: 'custom-alert',
        buttons: [
          {
            text: 'No, Not yet',
            role: 'cancel',
            cssClass: 'cancel-buttons',
            handler: () => {
              // Revert the status back to pending if canceled
              task.status = 'pending';
            }
          },
          {
            text: 'Yes, Complete',
            cssClass: 'buttons',
            handler: () => {
              // Update task status to 'completed' and lock it
              task.status = 'completed';
              this.isStatusLocked[task.id] = true;
              this.updateTaskStatus(task);
            }
          }
        ]
      });

      await alert.present();
    } else if (selectedStatus === 'cancelled' && !this.isStatusLocked[task.id]) {
      // Show confirmation alert for marking as cancelled
      const alert = await this.alertController.create({
        header: 'Cancel Task',
        message: 'Are you sure you want to cancel this task?',
        cssClass: 'custom-alert',
        buttons: [
          {
            text: 'No, Keep it',
            role: 'cancel',
            cssClass: 'cancel-buttons',
            handler: () => {
              // Revert the status back to pending if canceled
              task.status = 'pending';
            }
          },
          {
            text: 'Yes, Cancel',
            cssClass: 'buttons',
            handler: () => {
              // Update task status to 'cancelled' and lock it
              task.status = 'cancelled';
              this.isStatusLocked[task.id] = true;
              this.updateTaskStatus(task);
            }
          }
        ]
      });

      await alert.present();
    } else {
      // Directly update the status if no lock is involved
      this.updateTaskStatus(task);
    }
  }

  // Update task status in the database
  updateTaskStatus(task: any) {
    const apiUrl = `${this.baseUrl}/tasks/${task.id}`; // Use baseUrl for API
    this.http.put(apiUrl, { status: task.status }).subscribe(
      async () => {
        console.log(`Task ${task.id} status updated to ${task.status}`);
        await this.presentToast(`Task status updated to ${task.status}.`);
      },
      async (error) => {
        console.error('Error updating task status:', error);
        await this.presentToast('Failed to update task status. Please try again.');
      }
    );
  }

  // Get appropriate class based on task priority
  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'low':
        return 'priority-low';
      case 'medium':
        return 'priority-medium';
      case 'high':
        return 'priority-high';
      default:
        return '';
    }
  }

  async openReminderSheet(task: any) {
    // Check if the task is completed or cancelled
    if (task.status === 'completed' || task.status === 'cancelled' || task.status === 'Incompleted') {
      const statusAlert = await this.alertController.create({
        header: 'Reminder Not Allowed',
        message: `This task is already ${task.status}. You can't set a reminder for it.`,
        cssClass: 'custom-alert',
        buttons: [
          {
            text: 'OK',
            cssClass: 'buttons'
          }
        ],
      });
      await statusAlert.present();
      return; // Prevent further execution
    }
  
    // Check if a reminder is already set
    if (task.reminder) {
      const existingReminder = new Date(task.reminder).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
  
      const confirmAlert = await this.alertController.create({
        header: 'Reminder Already Set',
        message: `You already set a reminder for this task at ${existingReminder}. Do you want to change it?`,
        cssClass: 'custom-alert',
        buttons: [
          {
            text: 'No, Cancel',
            role: 'cancel',
            cssClass: 'cancel-buttons'
          },
          {
            text: 'Yes, Change',
            cssClass: 'buttons',
            handler: async () => {
              await this.openSetReminderSheet(task);
            },
          },
        ],
      });
  
      await confirmAlert.present();
    } else {
      // Open sheet for setting a new reminder
      await this.openSetReminderSheet(task);
    }
  }
  
  private async openSetReminderSheet(task: any) {
    const alert = await this.alertController.create({
      header: 'Set Reminder',
      inputs: [
        {
          name: 'reminder',
          type: 'time',
          placeholder: 'Select Reminder Time',
        },
      ],
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'cancel-buttons',
        },
        {
          text: 'Set Reminder',
          cssClass: 'buttons',
          handler: async (data) => {
            if (data.reminder) {
              await this.setReminder(task, data.reminder);
            } else {
              this.presentToast('Please select a reminder time.');
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  
  setReminder(task: any, reminder: string) {
    const reminderUTC = this.timeChange(reminder); // Convert to UTC time
  
    const apiUrl = `${this.baseUrl}/tasks/${task.id}/reminder`;
  
    this.http.put(apiUrl, { reminder: reminderUTC }).subscribe(
      async (response: any) => {
        task.reminder = reminderUTC; // Update task reminder locally
        await this.presentToast(`Task reminder set to ${reminder}.`);
      },
      async (error) => {
        console.error('Error setting reminder:', error);
        const errorMessage =
          error.error?.error || 'Failed to set reminder. Please try again.';
        await this.presentToast(errorMessage);
      }
    );
  }

  // Method to handle task deletion
  async deleteTask(task: any) {
    // Confirmation alert
    const alert = await this.alertController.create({
      header: 'Delete Task',
      message: `Are you sure you want to delete task, '${task.title}' ?`,
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'No, Keep it',
          role: 'cancel',
          cssClass: 'cancel-buttons',
          handler: () => {
            console.log('Delete canceled');
          },
        },
        {
          text: 'Yes, Delete',
          cssClass: 'buttons',
          handler: () => {
            // Perform task deletion
            this.http.delete(`${this.baseUrl}/tasks/${task.id}`).subscribe(
              () => {
                // Remove the task from the array
                this.tasks = this.tasks.filter(t => t.id !== task.id);

                // Show success toast message
                this.presentToast('Task deleted successfully.');
              },
              (error) => {
                console.error('Error deleting task:', error);
              }
            );
          },
        },
      ],
    });

    await alert.present();
  }

  // Toast message
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000, // Toast duration in milliseconds
      position: 'bottom', // Toast position
    });
    await toast.present();
  }

  // Navigate to Create Task Page
  navigateToCreateTask() {
    this.router.navigate(['/create-task']); // Adjust the route as per your app's routing module
  }

  timeChange(time: string): string {
    const localDate = new Date(); // Current local date
    const [hours, minutes] = time.split(':').map(Number); // Extract hours and minutes
    localDate.setHours(hours, minutes, 0, 0); // Set provided time in local date
    const utcDate = new Date(localDate.toISOString()); // Convert to UTC
    return utcDate.toISOString().split('T')[1].slice(0, 5); // Return HH:mm format in UTC
  }
}