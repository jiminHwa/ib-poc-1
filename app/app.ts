import {Component} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
// import {TabsPage} from './pages/tabs/tabs';
// import {Test1Page} from './pages/test1/test1';
// import {Test2Page} from './pages/test2/test2';
// import {Test3Page} from './pages/test3/test3';
import {Test4Page} from './pages/test4/test4';
// import {Test5Page} from './pages/test5/test5';
// import {Test6Page} from './pages/test6/test6';
import {Test7Page} from './pages/test7/test7';
import {Test8Page} from './pages/test8/test8';
import {Test9Page} from './pages/test9/test9';


@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class MyApp {

  private rootPage:any;

  constructor(private platform:Platform) {
    this.rootPage = Test9Page;//Test4Page;//Test8Page;//Test7Page;//Test6Page;//Test5Page;//Test3Page;//Test2Page;//Test1Page;//TabsPage;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }
}

ionicBootstrap(MyApp)
