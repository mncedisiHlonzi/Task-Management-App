import { Component } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor() {
    this.initializeApp();
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