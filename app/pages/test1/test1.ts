import {Component, ElementRef} from '@angular/core';
import {NavController} from 'ionic-angular';

declare let PIXI: any;

@Component({
    templateUrl: 'build/pages/test1/test1.html'
})
export class Test1Page {

    multiForResolution: number = 3;

    constructor(private navController: NavController, private el: ElementRef) {

    }

    onPageLoaded() {
        let container = this.el.nativeElement.querySelector(".canvas-container");
        // console.log(window.innerWidth, window.innerHeight, container.style);

        let canvasWidth = window.innerWidth * this.multiForResolution;
        let canvasHeight =  window.innerHeight * this.multiForResolution;
        let renderer = PIXI.autoDetectRenderer(canvasWidth, canvasHeight, {transparent: true, antialias: true});

        container.appendChild(renderer.view);

        let stage = new PIXI.Container();

        let texture = PIXI.Texture.fromImage('assets/success1.png');

        let sprite1 = new PIXI.Sprite(texture);

        sprite1.anchor.x = 0.5;
        sprite1.anchor.y = 0.5;

        sprite1.position.x = canvasWidth/2;
        sprite1.position.y = canvasHeight/2;

        stage.addChild(sprite1);

        animate();
        function animate() {
            requestAnimationFrame(animate);

            // just for fun, let's rotate mr rabbit a little
            sprite1.rotation += 0.05;

            // render the container
            renderer.render(stage);
        }
    }
}
