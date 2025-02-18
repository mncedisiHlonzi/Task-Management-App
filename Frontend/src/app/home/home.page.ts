import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage implements OnInit {
  
  isDarkMode: boolean = false;
  greeting: string = ''; // To store the dynamic greeting
  username: string = 'Guest'; // Default username
  profile_picture: string = '../../assets/images/user-default.png'; // Default profile image

  constructor(private storage: Storage, private router: Router) {
    this.storage.create();
  }

  async ngOnInit() {
    // Dark mode
    const darkMode = await this.storage.get('darkMode');
    this.isDarkMode = darkMode === true;
    this.setAppTheme(this.isDarkMode);

    // Set dynamic greeting
    this.setGreeting();

    // Fetch logged-in user data
    this.loadUserData();

    // Update greeting in real-time every minute
    setInterval(() => {
      this.setGreeting();
    }, 60000); // Update every 60 seconds
  }

  // Dark mode
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode; // Toggle the mode
    this.setAppTheme(this.isDarkMode); // Apply the theme
    this.storage.set('darkMode', this.isDarkMode); // Save the preference
  }

  setAppTheme(darkMode: boolean) {
    document.body.classList.toggle('dark', darkMode);
  }

  // Set dynamic greeting based on time of day
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

  // Fetch user data from localStorage
  loadUserData() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData && userData.username) {
      this.username = userData.username; // Update the username
    }
    if (userData.profile_picture && userData.profile_picture !== '') {
      this.profile_picture = userData.profile_picture; // Update the profile image
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