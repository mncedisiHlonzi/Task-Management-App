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

  isLoading: boolean = true; // Controls skeleton loading
  greeting: string = '';
  username: string = 'Guest';
  profile_picture: string = '../../assets/images/user-default.png';
  notificationCount: number = 5; // Example notification count

  birthdayDate: string = '';
  birthdayWish: string = '';
  birthdayLocation: string = '';
  repeatYearly: boolean = false;
  userId: number | null = null;

  locationSuggestions: any[] = []; // Store location suggestions
  private locationIqApiKey = 'pk.1470faed055efed88ce314062d9bfb9f'; // Replace with your API key

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

    // Simulate loading delay of 3 seconds
    setTimeout(() => {
      this.isLoading = false;
    }, 3000);
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
          this.locationSuggestions = []; // Clear suggestions on error
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
    };

    this.http.post('http://172.168.161.212:3000/api/birthdays', payload).subscribe(
      async (response: any) => {
        console.log('Birthday saved successfully!', response);
        await this.presentToast('Birthday added successfully!', 'success');
        this.clearInputs(); // Clear the form inputs
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

}