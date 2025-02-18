import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage {
  username: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router, private toastController: ToastController) {}

  async signUp() {
    if (!this.username || !this.password) {
      this.showToast('Please fill in all fields', 'warning');
      return;
    }

    const signUpData = {
      username: this.username,
      password: this.password
    };

    this.http.post('http://172.168.161.212:3000/api/users', signUpData).subscribe(
      async (response: any) => {
        this.showToast(`Welcome ${this.username}, Account created successfully.`, 'success');
        // Reset input fields
        this.username = '';
        this.password = '';
      },
      async (error) => {
        console.error('Error during signup:', error);
        this.showToast('Failed to create account. Please try again.', 'danger');
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

  navigateToSignIn() {
    this.router.navigate(['/sign-in']);
  }
}