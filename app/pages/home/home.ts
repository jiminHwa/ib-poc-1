import {Component, ElementRef} from '@angular/core';
import {NavController} from 'ionic-angular';

declare let PIXI:any;

@Component({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
  constructor(private navController: NavController, private el: ElementRef) {
  
  }

  onPageLoaded() {
    let container = this.el.nativeElement.querySelector(".canvas-container");
    console.log(window.innerWidth, window.innerHeight, container.style);

    // let renderer = PIXI.autoDetectRenderer(canvasSize.width, canvasSize.height, {transparent: true, antialias: true});
    // container.appendChild(renderer.view);
  }
}
