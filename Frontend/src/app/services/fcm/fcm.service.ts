import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { ActionPerformed, PushNotifications, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';
import { ToastController } from '@ionic/angular';

export const FCM_TOKEN = 'push_notification_token';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  private _redirect = new BehaviorSubject<any>(null);

  get redirect() {
    return this._redirect.asObservable();
  }

  constructor(
    private storage: StorageService,
    private toastController: ToastController
  ) { }

  initPush() {
    if (Capacitor.getPlatform() !== 'web') {
      this.registerPush();
    }
  }

  private async registerPush() {
    try {
      await this.addListeners();
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }

      await PushNotifications.register();
    } catch (e) {
      console.log(e);
    }
  }

  async getDeliveredNotifications() {
    const notificationList = await PushNotifications.getDeliveredNotifications();
    console.log('Delivered notifications', notificationList);
  }

  async addListeners() {
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('My token: ', token);
      const fcm_token = token?.value;

      let go = 1;
      const saved_token = JSON.parse((await this.storage.getStorage(FCM_TOKEN)).value);
      if (saved_token) {
        if (fcm_token === saved_token) {
          console.log('Same token');
          go = 0;
        } else {
          go = 2;
        }
      }
      if (go === 1) {
        // Save token
        this.storage.setStorage(FCM_TOKEN, JSON.stringify(fcm_token));
      } else if (go === 2) {
        // Update token
        this.storage.setStorage(FCM_TOKEN, JSON.stringify(fcm_token));
      }

      // Show token in a toast (for development purposes)
      // this.showToast(`FCM Token: ${fcm_token}`);
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error: ' + JSON.stringify(error));
    });

    PushNotifications.addListener('pushNotificationReceived', async (notification: PushNotificationSchema) => {
      console.log('Push received: ' + JSON.stringify(notification));
      const data = notification?.data;
      if (data?.redirect) this._redirect.next(data?.redirect);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', async (notification: ActionPerformed) => {
      const data = notification.notification.data;
      console.log('Action performed: ' + JSON.stringify(notification.notification));
      console.log('Push data: ', data);
      if (data?.redirect) this._redirect.next(data?.redirect);
    });
  }

  async removeFcmToken() {
    try {
      const saved_token = JSON.parse((await this.storage.getStorage(FCM_TOKEN)).value);
      this.storage.removeStorage(saved_token);
    } catch (e) {
      console.log(e);
      throw (e);
    }
  }

  // Function to show toast with the FCM token
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 9000, // Display for 5 seconds
      position: 'bottom',
      color: 'success',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}
