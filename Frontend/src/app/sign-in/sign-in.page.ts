import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage {
  username: string = '';
  password: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) {}

  async signIn() {
    if (!this.username || !this.password) {
      this.showToast('Please fill in all fields', 'warning');
      return;
    }

    const loginData = {
       username: this.username,
       password: this.password 
    };

    this.http.post('http://172.168.161.212:3000/api/users/login', loginData).subscribe(
      async (response: any) => {
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        this.showToast(`Welcome back ${this.username}.`, 'primary');

        // Navigate to home page
        this.router.navigate(['/home']);
      },
      async (error) => {
        console.error('Error during login:', error);
        this.showToast('Invalid username or password', 'danger');
      }
    );
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
    });
    toast.present();
  }

  navigateToSignUp() {
    this.router.navigate(['/sign-up']);
  }
}