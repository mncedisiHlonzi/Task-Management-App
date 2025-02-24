import { Component } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonicModule, Platform } from '@ionic/angular';
import { FcmService } from './services/fcm/fcm.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private fcm: FcmService
  ) {

    this.initializeApp();  
    
    this.platform.ready().then(() => {
      this.fcm.initPush();
    }).catch(e => {
      console.log('error fcm: ', e);
    });

  }

  initializeApp() {
    this.setStatusBar();
  }

  setStatusBar() {
    StatusBar.setBackgroundColor({ color: '#E5DAEC' });
    StatusBar.setStyle({ style: Style.Light });
    StatusBar.setOverlaysWebView({
      overlay: false,
    });
  }

  async setStatusBarColor() {
    await StatusBar.setBackgroundColor({ color: '#E5DAEC' });
  }
  
}