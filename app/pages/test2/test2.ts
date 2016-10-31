import {Component, ElementRef} from '@angular/core';
import {NavController} from 'ionic-angular';

declare let PIXI: any;
declare let TWEEN: any;

@Component({
    templateUrl: 'build/pages/test2/test2.html'
})
export class Test2Page {

    multiForResolution: number = 3;

    sprites: any[] = [];
    screenPos:number = 0;
    screenPosLimit:number = 2;

    constructor(private navController: NavController, private el: ElementRef) {

    }

    onPageLoaded() {
        let container = this.el.nativeElement.querySelector(".canvas-container");
        // console.log(window.innerWidth, window.innerHeight, container.style);

        let canvasWidth = window.innerWidth * this.multiForResolution;
        let canvasHeight = window.innerHeight * this.multiForResolution;
        let renderer = PIXI.autoDetectRenderer(canvasWidth, canvasHeight, {transparent: true, antialias: true});

        container.appendChild(renderer.view);

        let stage = new PIXI.Container();

        let spritesPos: number[][] = [
            [canvasWidth / 4, canvasHeight / 4],
            [canvasWidth / 4 * 3, canvasHeight / 4],
            [canvasWidth / 2, canvasHeight / 2],
            [canvasWidth / 4, canvasHeight / 4 * 3],
            [canvasWidth / 4 * 3, canvasHeight / 4 * 3], //여기까지는 화면 안
            [0, canvasHeight / 2],
            [canvasWidth, canvasHeight / 2], //여기까지는 경계
            [canvasWidth / 4 * -1, canvasHeight / 4],
            [canvasWidth / 4 * 5, canvasHeight / 4 * 3],

        ];

        let texture = PIXI.Texture.fromImage('assets/success1.png');

        for (let i = 0; i < spritesPos.length; i++) {
            let pos = spritesPos[i];

            let sprite1 = new PIXI.Sprite(texture);

            sprite1.anchor.x = 0.5;
            sprite1.anchor.y = 0.5;

            sprite1.position.x = pos[0];
            sprite1.position.y = pos[1];

            sprite1.interactive = true;
            sprite1.on('touchstart', onDown);
            sprite1.on('mousedown', onDown);

            function onDown(ev: any) {
                console.log("click", i, ev);
            }

            stage.addChild(sprite1);
            this.sprites.push(sprite1);
        }


        animate();
        function animate() {
            requestAnimationFrame(animate);

            TWEEN.update();
            // just for fun, let's rotate mr rabbit a little
            // sprite1.rotation += 0.05;

            // render the container
            renderer.render(stage);
        }
    }

    swipe(ev: any) {
        // console.log("Swipe :", ev);

        if (ev.offsetDirection === 2) {
            if(this.screenPos < this.screenPosLimit) {
                console.log("RightToLeft");
                this.screenPos++;

                for (let i = 0; i < this.sprites.length; i++) {
                    let sprite = this.sprites[i];
                    let position = sprite.position;

                    let tween = new TWEEN.Tween(position);
                    tween.easing(TWEEN.Easing.Quadratic.InOut);
                    tween.to({x: position.x - 500}, 1000);
                    tween.start();
                }
            }
        }
        else if (ev.offsetDirection === 4) {
            if(this.screenPos > -this.screenPosLimit) {
                console.log("LeftToRight");
                this.screenPos--;

                for (let i = 0; i < this.sprites.length; i++) {
                    let sprite = this.sprites[i];
                    let position = sprite.position;

                    let tween = new TWEEN.Tween(position);
                    tween.easing(TWEEN.Easing.Quadratic.InOut);
                    tween.to({x: position.x + 500}, 1000);
                    tween.start();
                }
            }
        }
    }
}
