import { Component, OnInit, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { IonModal, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage implements OnInit {

  @ViewChild('modal', { static: true }) modal!: IonModal;
  @ViewChild('viewBirthdayModal') viewBirthdayModal!: IonModal;

  isLoading: boolean = true; // Controls skeleton loading
  greeting: string = '';
  username: string = 'Guest';
  profile_picture: string = '../../assets/images/user-default.png';
  //notificationCount: number = 5;

  birthdayDate: string = '';
  birthdayWish: string = '';
  birthdayLocation: string = '';
  repeatYearly: boolean = false;
  userId: number | null = null;
  daysLeft: number | null = null;
  hasBirthday: boolean = false;
  timeLeft: string = '';
  isBirthdayToday: boolean = false;

  fcmToken: string | null = null; // Store the FCM token

  locationSuggestions: any[] = []; // Store location suggestions
  private locationIqApiKey = 'pk.1470faed055efed88ce314062d9bfb9f'; // API key

  taskOptions = [
    { icon: 'add', label: 'Create Task', action: () => this.navigateToCreateTask() },
    { icon: 'scan-outline', label: 'View Tasks', action: () => this.navigateToViewTasks() },
    { icon: 'analytics-outline', label: 'Analytics', action: () => this.navigateToAnalytics() }
  ];

  constructor(private storage: Storage, private router: Router, private toastController: ToastController, private http: HttpClient) {
    this.storage.create();
  }

  async ngOnInit() {
    this.setGreeting();
    this.loadUserData();
    this.fetchBirthday();

    // Update days left every 24 hours
    setInterval(() => {
      this.fetchBirthday();
    }, 24 * 60 * 60 * 1000);

    // Simulate loading delay of 3 seconds
    setTimeout(() => {
      this.isLoading = false;
    }, 7000);
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
    if (userData && userData.id) {
      this.userId = userData.id;
      this.fcmToken = userData.fcm_token; // Fetch the FCM token from user data
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

  openModal() {
    this.modal.present();
  }

  closeModal() {
    this.modal.dismiss();
  }

  // Fetch location suggestions as the user types
  searchLocation(event: any) {
    const query = event.target.value;

    if (query.length > 2) { // Only search if the query has at least 3 characters
      const url = `https://api.locationiq.com/v1/autocomplete?key=${this.locationIqApiKey}&q=${query}&limit=5`;

      this.http.get(url).subscribe(
        (response: any) => {
          this.locationSuggestions = response; // Store location suggestions
        },
        (error) => {
          console.error('Error fetching location suggestions:', error);
          this.locationSuggestions = [];
        }
      );
    } else {
      this.locationSuggestions = []; // Clear suggestions if the query is too short
    }
  }

  // Select a location from the suggestions
  selectLocation(location: any) {
    this.birthdayLocation = location.display_name; // Set the selected location
    this.locationSuggestions = []; // Clear the suggestions list
  }

  async saveBirthday() {
    if (!this.birthdayDate || !this.userId) {
      this.presentToast('Date and User ID are required.', 'warning');
      return;
    }
  
    const payload = {
      date: this.birthdayDate,
      wish: this.birthdayWish,
      location: this.birthdayLocation,
      repeatYearly: this.repeatYearly,
      userId: this.userId,
      fcm_token: this.fcmToken, // Include the FCM token from user data
    };
  
    this.http.post('http://172.168.161.212:3000/api/birthdays', payload).subscribe(
      async (response: any) => {
        console.log('Birthday saved successfully!', response);
        await this.presentToast('Birthday added successfully!', 'success');
  
        // Refetch the birthday data to update the card
        this.fetchBirthday();
        this.hasBirthday = true;
  
        this.clearInputs();
        this.closeModal();
      },
      async (error) => {
        console.error('Error saving birthday:', error);
        await this.presentToast('Failed to add birthday. Please try again.', 'danger');
      }
    );
  }

  // Clear form inputs
  clearInputs() {
    this.birthdayDate = '';
    this.birthdayWish = '';
    this.birthdayLocation = '';
    this.repeatYearly = false;
    this.locationSuggestions = []; // Clear location suggestions
  }

  // Show a toast message
  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
    });
    await toast.present();
  }

  //fetch Birthday
  fetchBirthday() {
    if (!this.userId) return;
  
    const apiUrl = `http://172.168.161.212:3000/api/birthdays/${this.userId}`;
  
    this.http.get(apiUrl).subscribe(
      (response: any) => {
        if (response.length > 0) {
          const birthday = response[0];
          this.birthdayDate = birthday.date;
          this.birthdayWish = birthday.wish;
          this.birthdayLocation = birthday.location;
          this.repeatYearly = birthday.repeatYearly;
          this.timeLeft = this.calculateDaysLeft(birthday.date); // Store the remaining time
          this.hasBirthday = true; // User has a birthday
  
          // Check if today is the birthday
          this.isBirthdayToday = this.isTodayBirthday(birthday.date);
        } else {
          this.hasBirthday = false; // User does not have a birthday
          this.isBirthdayToday = false; // Reset the flag
        }
      },
      (error) => {
        console.error('Error fetching birthday:', error);
        this.hasBirthday = false;
        this.isBirthdayToday = false;
      }
    );
  }
  
  // Check if today is the birthday
  isTodayBirthday(birthdayDate: string): boolean {
    const today = new Date();
    const birthday = new Date(birthdayDate);
  
    // Compare the month and day
    return (
      today.getMonth() === birthday.getMonth() &&
      today.getDate() === birthday.getDate()
    );
  }

  getScrollDuration(text: string): number {
    const baseDuration = 10; // Base duration for 20 characters
    const duration = (text.length / 20) * baseDuration;
    return Math.max(duration, 10); // Ensure a minimum duration of 10s
  }

  // Calculate days left until the birthday
  calculateDaysLeft(birthdayDate: string): string {
    const today = new Date();
    const birthday = new Date(birthdayDate);
  
    // Set the year to the current year for comparison
    birthday.setFullYear(today.getFullYear());
  
    // If the birthday has already passed this year, set it to next year
    if (birthday < today) {
      birthday.setFullYear(today.getFullYear() + 1);
    }
  
    // Calculate the difference in milliseconds
    const timeDifference = birthday.getTime() - today.getTime();
  
    // Convert milliseconds to days, hours, and minutes
    const daysLeft = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  
    if (daysLeft > 1) {
      return `${daysLeft} days left`;
    } else if (daysLeft === 1) {
      return '1 day left';
    } else if (hoursLeft > 0) {
      return 'Hours left';
    } else if (minutesLeft > 0) {
      return 'Minutes left';
    } else {
      return 'Today is the day!';
    }
  }

  // Open the View/Edit Birthday Modal
  openViewBirthdayModal() {
    this.viewBirthdayModal.present();
  }

  // Close the View/Edit Birthday Modal
  closeViewBirthdayModal() {
    this.viewBirthdayModal.dismiss();
  }

  // Update the Birthday
  async updateBirthday() {
    if (!this.birthdayDate || !this.userId) {
      this.presentToast('Date and User ID are required.', 'warning');
      return;
    }

    const payload = {
      date: this.birthdayDate,
      wish: this.birthdayWish,
      location: this.birthdayLocation,
      repeatYearly: this.repeatYearly,
      userId: this.userId,
    };

    const apiUrl = `http://172.168.161.212:3000/api/birthdays/${this.userId}`;

    this.http.put(apiUrl, payload).subscribe(
      async (response: any) => {
        console.log('Birthday updated successfully!', response);
        await this.presentToast('Birthday updated successfully!', 'success');
        this.fetchBirthday();
        this.closeViewBirthdayModal();
      },
      async (error) => {
        console.error('Error updating birthday:', error);
        await this.presentToast('Failed to update birthday. Please try again.', 'danger');
      }
    );
  }

}