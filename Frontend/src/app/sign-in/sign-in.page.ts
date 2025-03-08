import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import * as CryptoJS from 'crypto-js'; // Import crypto-js

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage {
  username: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;

  private encryptionKey = '#Tasks20Management25App!';

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) {
    // Check if credentials are stored in local storage
    const savedCredentials = localStorage.getItem('rememberMeCredentials');
    if (savedCredentials) {
      const { username, encryptedPassword } = JSON.parse(savedCredentials);
      this.username = username;
      this.password = this.decryptPassword(encryptedPassword); // Decrypt the password
      this.rememberMe = true;
    }
  }

  // Toggle password visibility
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async signIn() {
    if (!this.username || !this.password) {
      this.showToast('Please fill in all fields', 'warning');
      return;
    }

    const loginData = {
      username: this.username,
      password: this.password,
    };

    this.http.post('http://172.168.161.212:3000/api/users/login', loginData).subscribe(
      async (response: any) => {
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Save credentials if "Remember Me" is checked
        if (this.rememberMe) {
          const encryptedPassword = this.encryptPassword(this.password); // Encrypt the password
          localStorage.setItem('rememberMeCredentials', JSON.stringify({ username: this.username, encryptedPassword }));
        } else {
          localStorage.removeItem('rememberMeCredentials'); // Clear saved credentials
        }

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

  // Encrypt the password
  private encryptPassword(password: string): string {
    return CryptoJS.AES.encrypt(password, this.encryptionKey).toString();
  }

  // Decrypt the password
  private decryptPassword(encryptedPassword: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
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