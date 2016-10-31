/**
 * Created by jiminHwa on 2016. 10. 28..
 */
import {Component, ElementRef} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

// declare let PIXI:any;

@Component({
    templateUrl: 'build/pages/testDetail/testDetail.html'
})
export class TestDetailPage {
    pageNumber:number;
    bubbleIndex:number;
    constructor(private nav: NavController, private navParams: NavParams, private el: ElementRef) {
        this.pageNumber = this.navParams.get('pageNumber');
        this.bubbleIndex = this.navParams.get('bubbleIndex');
    }

    onPageLoaded() {
        // let container = this.el.nativeElement.querySelector(".canvas-container");
        // console.log(window.innerWidth, window.innerHeight, container.style);

        // let renderer = PIXI.autoDetectRenderer(canvasSize.width, canvasSize.height, {transparent: true, antialias: true});
        // container.appendChild(renderer.view);
    }
}