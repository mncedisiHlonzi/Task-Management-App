import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController, ToastController } from '@ionic/angular';
import { TaskService } from '../services/tasks.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  userId: number | null = null;
  username: string = '';
  profilePicture: string = '';
  selectedPicture: string | null = null; // Track the selected/taken picture
  defaultProfilePicture = '../../assets/images/user-default.png'; // Path to your default image
  isImageSelected: boolean = false; // Track if an image has been selected or taken

  completedTasks = 0;
  incompleteTasks = 0;
  cancelledTasks = 0;

  isLoading: boolean = true; // Track loading state

  constructor(
    private http: HttpClient,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.fetchUserDetails();
    this.fetchTaskOverview();  // Fetch task overview for the logged-in user

    // Set a timeout to ensure the loader is shown for at least 3 seconds
    setTimeout(() => {
      this.isLoading = false; // Hide loader after 3 seconds
    }, 1000);
  }

  loadUserData() {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.userId = parsedUser.id;
    }
  }

  fetchUserDetails() {
    if (this.userId) {
      const apiUrl = `http://172.168.161.212:3000/api/users/${this.userId}`;
      this.http.get<any>(apiUrl).subscribe(
        (data) => {
          this.username = data.username;
          this.profilePicture = data.profile_picture || this.defaultProfilePicture;
        },
        (error) => {
          console.error('Error fetching user details:', error);
        }
      );
    }
  }

  async openImageOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Profile Picture',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Take photo',
          icon: 'camera',
          handler: () => this.captureImage(),
        },
        {
          text: 'Choose from gallery',
          icon: 'image',
          handler: () => this.selectImage(),
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          cssClass: 'action-sheet-button-cancel',
        },
      ],
    });
    await actionSheet.present();
  }  

  async captureImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });
    const base64Image = `data:image/jpeg;base64,${image.base64String}`;
    this.previewSelectedPicture(base64Image);
  }

  async selectImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    });
    const base64Image = `data:image/jpeg;base64,${image.base64String}`;
    this.previewSelectedPicture(base64Image);
  }

  previewSelectedPicture(base64Image: string) {
    this.selectedPicture = base64Image;
    this.profilePicture = base64Image;
    this.isImageSelected = true;
  }

  removeSelectedPicture() {
    this.selectedPicture = null;
    this.profilePicture = this.defaultProfilePicture;
    this.isImageSelected = false;
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }

  updateProfilePicture() {
    if (this.selectedPicture && this.userId) {
      const apiUrl = `http://172.168.161.212:3000/api/users/profile-picture/${this.userId}`;
      const formData = new FormData();
      formData.append('profile_picture', this.base64ToBlob(this.selectedPicture), 'profile-picture.jpg');

      this.http.put(apiUrl, formData).subscribe(
        (response: any) => {
          this.profilePicture = response.profile_picture;
          this.selectedPicture = null;
          this.isImageSelected = false; // Reset buttons visibility
          this.showToast('Profile picture updated successfully.');
        },
        (error) => {
          console.error('Error updating profile picture:', error);
        }
      );
    }
  }

  base64ToBlob(base64: string) {
    const byteString = atob(base64.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: 'image/jpeg' });
  }

  //
  fetchTaskOverview() {
    this.taskService.getTaskOverview(this.userId!).subscribe(
      (data) => {
        this.completedTasks = data.completedTasks;
        this.incompleteTasks = data.incompleteTasks;
        this.cancelledTasks = data.cancelledTasks;
      },
      (error) => {
        console.error('Error fetching task overview:', error);
      }
    );
  }
  
}