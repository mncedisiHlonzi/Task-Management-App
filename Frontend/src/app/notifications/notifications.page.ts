import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'], 
})
export class NotificationsPage implements OnInit {
  tasks: any[] = []; // Array to store tasks / New tasks
  tasksWithReminders: any[] = []; // Array to store tasks with reminders
  completedTasks: any[] = []; // Array to store completed tasks
  cancelledTasks: any[] = []; // Array to store cancelled tasks
  incompletedTasks: any[] = []; // Array to store Incompleted tasks
  userId: number | null = null; // To store user ID
  username: string = ''; // To store username

  segments = [
    { label: 'New', icon: 'add-outline' },
    { label: 'Completed', icon: 'checkmark-done-circle-outline' },
    { label: 'Incomplete', icon: 'warning-outline' },
    { label: 'Cancelled', icon: 'close-circle-outline' },
    { label: 'Reminder', icon: 'alarm-outline' },
  ];

  selectedSegment = 0;
  selectSegment(index: number) {
    this.selectedSegment = index;
  }

  constructor(private http: HttpClient) {
    this.loadUserData();
  }

  ngOnInit() {
    this.loadTasks(); // Load regular tasks
    this.loadTasksWithReminders(); // Load tasks with reminders
    this.loadCompletedTasks(); // Load completed tasks
    this.loadCancelledTasks(); // Load cancelled tasks
    this.loadIncompletedTasks(); // Load Incompleted tasks
  }

  // Fetch user ID and username from localStorage
  loadUserData() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData && userData.id) {
      this.userId = userData.id;
    }
    if (userData && userData.username) {
      this.username = userData.username; // Update the username
    }
  }

  // Fetch tasks from the backend
  loadTasks() {
    if (this.userId) {
      const apiUrl = `http://172.168.161.212:3000/api/tasks?userId=${this.userId}`;
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

  // Fetch tasks with reminders from the backend
  loadTasksWithReminders() {
    if (this.userId) {
      const apiUrl = `http://172.168.161.212:3000/api/mains/tasks-with-reminders?userId=${this.userId}`;
      this.http.get<any[]>(apiUrl).subscribe(
        (data) => {
          const currentTime = new Date().getTime();

          this.tasksWithReminders = data.map((task) => {
            const reminderTime = new Date(task.reminder).getTime();
            const dueTime = new Date(task.dueTime).getTime();
            
            const remainingMinutesToDue = Math.max(
              0,
              Math.floor((dueTime - currentTime) / (1000 * 60))
            );

            const timeLeft = this.calculateTimeLeft(remainingMinutesToDue); // Get the formatted time left

            const delayTime = reminderTime - currentTime;

            if (delayTime > 0) {
              setTimeout(() => {
                this.triggerReminderNotification(task, timeLeft);
              }, delayTime);
            } else if (currentTime >= reminderTime) {
              this.triggerReminderNotification(task, timeLeft);
            }

            return {
              ...task,
              remainingMinutesToDue,
              notificationTriggered: currentTime >= reminderTime,
              timeLeft, // Store the formatted time left in the task object
            };
          });
        },
        (error) => {
          console.error('Error fetching tasks with reminders:', error);
        }
      );
    } else {
      console.error('User ID not found. Cannot load tasks with reminders.');
    }
  }

  // Calculate time left in hours, minutes, and seconds
  calculateTimeLeft(remainingMinutes: number): string {
    const hours = Math.floor(remainingMinutes / 60); // Get the hours
    const minutes = remainingMinutes % 60; // Get the remaining minutes
    const seconds = Math.floor((remainingMinutes * 60) % 60); // Get the remaining seconds

    let timeLeftString = '';
    
    // Format hours, minutes, and seconds into a readable string
    if (hours > 0) {
      timeLeftString += `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
      if (timeLeftString) timeLeftString += ', '; // Add a separator if there's already hours
      timeLeftString += `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    if (seconds > 0 || timeLeftString === '') { // Always show seconds if no hours or minutes
      if (timeLeftString) timeLeftString += ', '; // Add separator
      timeLeftString += `${seconds} second${seconds > 1 ? 's' : ''}`;
    }

    return timeLeftString;
  }

  // Trigger a reminder notification
  triggerReminderNotification(task: any, timeLeft: string) {
    console.log(`Reminder triggered for task: ${task.title}`);

    // Update or add the task in tasksWithReminders
    const index = this.tasksWithReminders.findIndex((t) => t.id === task.id);
    if (index > -1) {
      this.tasksWithReminders[index] = {
        ...this.tasksWithReminders[index],
        notificationTriggered: true,
        timeLeft, // Store the formatted time left here
      };
    } else {
      this.tasksWithReminders.push({
        ...task,
        notificationTriggered: true,
        timeLeft, // Store the formatted time left here
      });
    }
  }

  // Fetch completed tasks from the backend
  loadCompletedTasks() {
    if (this.userId) {
      const apiUrl = `http://172.168.161.212:3000/api/mains/completed-tasks?userId=${this.userId}`;
      this.http.get<any[]>(apiUrl).subscribe(
        (data) => {
          this.completedTasks = data.map((task) => {
            return {
              ...task,
              completionTime: task.completionTime,
              dueTime: task.dueTime,
              formattedTimeToDue: task.formattedTimeToDue, // Directly use the formatted time from the backend
            };
          });
        },
        (error) => {
          console.error('Error fetching completed tasks:', error);
        }
      );
    } else {
      console.error('User ID not found. Cannot load completed tasks.');
    }
  }

  // Add user experience
  updateTaskExperience(taskId: number, taskExperience: string) {
    const apiUrl = `http://172.168.161.212:3000/api/mains/update-task-experience`;
    this.http.post(apiUrl, { taskId, taskExperience }).subscribe(
      (response) => {
        console.log('Task experience updated successfully:', response);
  
        // Update the UI: hide other chips and show the selected one
        const task = this.completedTasks.find((t) => t.id === taskId);
        if (task) {
          task.taskExperience = taskExperience;
        }
      },
      (error) => {
        console.error('Error updating task experience:', error);
      }
    );
  }

  // Fetch cancelled tasks from the backend
  loadCancelledTasks() {
    if (this.userId) {
      const apiUrl = `http://172.168.161.212:3000/api/mains/cancelled-tasks?userId=${this.userId}`;
      this.http.get<any[]>(apiUrl).subscribe(
        (data) => {
          this.cancelledTasks = data.map((task) => {
            // Directly use the formatted time from the backend
            const formattedDueTime = new Date(task.dueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
            return {
              ...task,
              formattedTimeToDue: task.formattedTimeToDue, // Use the formatted time directly
              formattedDueTime, // Add formatted due time
            };
          });
        },
        (error) => {
          console.error('Error fetching cancelled tasks:', error);
        }
      );
    } else {
      console.error('User ID not found. Cannot load cancelled tasks.');
    }
  }

  // Add cancel reason
  updateCancelReason(taskId: number, cancelreason: string) {
    const apiUrl = `http://172.168.161.212:3000/api/mains/cancel-reason`;
    this.http.post(apiUrl, { taskId, cancelreason }).subscribe(
      (response) => {
        console.log('Cancel reason updated successfully:', response);
  
        // Update the UI: hide other chips and show the selected one
        const task = this.cancelledTasks.find((t) => t.id === taskId);
        if (task) {
          task.cancelreason = cancelreason;
        }
      },
      (error) => {
        console.error('Error updating cancel reason:', error);
      }
    );
  }
  
  loadIncompletedTasks() {
    if (this.userId) {
      const apiUrl = `http://172.168.161.212:3000/api/mains/incompleted-tasks?userId=${this.userId}`;
      this.http.get<any[]>(apiUrl).subscribe(
        (data) => {
          this.incompletedTasks = data; // Directly assign the response data
        },
        (error) => {
          console.error('Error fetching incompleted tasks:', error);
        }
      );
    } else {
      console.error('User ID not found. Cannot load incompleted tasks.');
    }
  }

}