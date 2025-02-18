import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage implements OnInit {

  isLoading: boolean = true; // Controls skeleton loading
  isDarkMode: boolean = false;
  greeting: string = '';
  username: string = 'Guest';
  profile_picture: string = '../../assets/images/user-default.png';
  notificationCount: number = 5; // Example notification count

  taskOptions = [
    { icon: 'add-circle-outline', label: 'Create Task', action: () => this.navigateToCreateTask() },
    { icon: 'scan-outline', label: 'View Tasks', action: () => this.navigateToViewTasks() },
    { icon: 'analytics-outline', label: 'Analytics', action: () => this.navigateToAnalytics() }
  ];

  constructor(private storage: Storage, private router: Router) {
    this.storage.create();
  }

  async ngOnInit() {
    this.setGreeting();
    this.loadUserData();
    const darkMode = await this.storage.get('darkMode');
    this.isDarkMode = darkMode === true;
    this.setAppTheme(this.isDarkMode);

    // Simulate loading delay of 3 seconds
    setTimeout(() => {
      this.isLoading = false;
    }, 3000);
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.setAppTheme(this.isDarkMode);
    this.storage.set('darkMode', this.isDarkMode);
  }

  setAppTheme(darkMode: boolean) {
    document.body.classList.toggle('dark', darkMode);
  }

  setGreeting() {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      this.greeting = 'Good Morning 👋';
    } else if (currentHour >= 12 && currentHour < 17) {
      this.greeting = 'Good Afternoon 🌕';
    } else if (currentHour >= 17 && currentHour < 21) {
      this.greeting = 'Good Evening 🌖';
    } else {
      this.greeting = 'Good Night 🌙';
    }
  }

  loadUserData() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData && userData.username) {
      this.username = userData.username;
    }
    if (userData.profile_picture && userData.profile_picture !== '') {
      this.profile_picture = userData.profile_picture;
    }
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  navigateToNotifications() {
    this.router.navigate(['/notifications']);
  }

  navigateToCreateTask() {
    this.router.navigate(['/create-task']);
  }

  navigateToViewTasks() {
    this.router.navigate(['/view-tasks']);
  }

  navigateToAnalytics() {
    this.router.navigate(['/analytics']);
  }
}