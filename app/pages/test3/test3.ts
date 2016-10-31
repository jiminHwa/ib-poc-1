import {Component, ElementRef} from '@angular/core';
import {NavController} from 'ionic-angular';

declare let PIXI: any;
declare let TWEEN: any;

@Component({
    templateUrl: 'build/pages/test3/test3.html'
})
export class Test3Page {

    canvasSize:{x:number, y:number};

    multiForResolution: number = 3;

    sprites: any[] = [];
    screenPos:number = 0;
    screenPosLimit:number = 2;

    selectedSpriteIndex:number = -2;


    constructor(private navController: NavController, private el: ElementRef) {

    }

    onPageLoaded() {
        let self = this;

        let container = this.el.nativeElement.querySelector(".canvas-container");
        // console.log(window.innerWidth, window.innerHeight, container.style);

        let canvasWidth = window.innerWidth * this.multiForResolution;
        let canvasHeight = window.innerHeight * this.multiForResolution;
        this.canvasSize = {x: canvasWidth, y: canvasHeight};
        let renderer = PIXI.autoDetectRenderer(canvasWidth, canvasHeight, {transparent: true, antialias: true});

        container.appendChild(renderer.view);

        let stage = new PIXI.Container();

        let background = new PIXI.Container();
        background.zOrder = 0;
        background.interactive = true;
        background.hitArea = new PIXI.Rectangle(0, 0, canvasWidth, canvasHeight);
        function onDownOnBG(ev:any) {
            self.deselectSprite();
        }
        background.on('mousedown', onDownOnBG);
        background.on('touchstart', onDownOnBG);
        stage.addChild(background);


        // PIXI.loader
        //     .add('assets/sprites/sprites.json')
        //     .load(onAssetsLoaded);
        //
        // let movie;
        //
        // function onAssetsLoaded() {
        //     // create an array of textures from an image path
        //     let frames = [];
        //
        //     for (var i = 0; i < 6; i++) {
        //         frames.push(PIXI.Texture.fromFrame('bubble' + (i+1) + '.png'));
        //     }
        //
        //
        //     // create a MovieClip (brings back memories from the days of Flash, right ?)
        //     movie = new PIXI.extras.MovieClip(frames);
        //
        //     /*
        //      * A MovieClip inherits all the properties of a PIXI sprite
        //      * so you can change its position, its anchor, mask it, etc
        //      */
        //     movie.position.set(canvasWidth / 2, canvasHeight / 2);
        //
        //     movie.anchor.set(0.5);
        //     movie.animationSpeed = 0.1;
        //
        //     movie.play();
        //
        //     stage.addChild(movie);
        // }



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
                // console.log("click", i, ev);
                self.onDown(ev, i);
            }

            sprite1.zOrder = 10;

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

    onDown(ev: any, index: number) {
        // console.log("click", index, ev);

        let tweens:any = [];

        if(this.selectedSpriteIndex != index) {
            this.selectedSpriteIndex = index;
            let distXToCenter = ((this.canvasSize.x / 2) - this.sprites[index].position.x);

            for (let i = 0; i < this.sprites.length; i++) {
                let sprite = this.sprites[i];
                let scale = sprite.scale;
                let tween = new TWEEN.Tween(scale);
                tween.easing(TWEEN.Easing.Quadratic.InOut);
                if (i === index) {
                    tween.to({x: 3, y: 3}, 1000);

                }
                else {
                    tween.to({x: 0.3, y: 0.3}, 1000);

                }
                tweens.push(tween);
            }


            for (let tween of tweens) {
                tween.start();
            }
            this.tweenSpritePosition(distXToCenter, 0);
        }
        else if(this.selectedSpriteIndex === -2) {

        }
        else {
            this.deselectSprite();
        }
    }

    private deselectSprite() {
        let tweens:any[] = [];
        this.selectedSpriteIndex = -1;
        for (let i = 0; i < this.sprites.length; i++) {
            let sprite = this.sprites[i];
            let scale = sprite.scale;
            let tween = new TWEEN.Tween(scale);
            tween.easing(TWEEN.Easing.Quadratic.InOut);
            tween.to({x: 1, y: 1}, 1000);
            tweens.push(tween);
        }


        for (let tween of tweens) {
            tween.start();
        }
    }

    onSwipe(ev: any) {
        // console.log("Swipe :", ev);

        if (ev.offsetDirection === 2) {
            if(this.screenPos < this.screenPosLimit) {
                console.log("RightToLeft");
                this.screenPos++;
                this.tweenSpritePosition(-500, 0);
                // for (let i = 0; i < this.sprites.length; i++) {
                //     let sprite = this.sprites[i];
                //     let position = sprite.position;
                //
                //     let tween = new TWEEN.Tween(position);
                //     tween.easing(TWEEN.Easing.Quadratic.InOut);
                //     tween.to({x: position.x - 500}, 1000);
                //     tween.start();
                // }
            }
        }
        else if (ev.offsetDirection === 4) {
            if(this.screenPos > -this.screenPosLimit) {
                console.log("LeftToRight");
                this.screenPos--;
                this.tweenSpritePosition(500, 0);
                // for (let i = 0; i < this.sprites.length; i++) {
                //     let sprite = this.sprites[i];
                //     let position = sprite.position;
                //
                //     let tween = new TWEEN.Tween(position);
                //     tween.easing(TWEEN.Easing.Quadratic.InOut);
                //     tween.to({x: position.x + 500}, 1000);
                //     tween.start();
                // }
            }
        }
    }

    private tweenSpritePosition(relativeX:number, realtiveY:number) {
        for (let i = 0; i < this.sprites.length; i++) {
            let sprite = this.sprites[i];
            let position = sprite.position;

            let tween = new TWEEN.Tween(position);
            tween.easing(TWEEN.Easing.Quadratic.InOut);
            tween.to({x: position.x + relativeX, y: position.y + realtiveY}, 1000);
            tween.start();
        }
    }

    action1() {

    }
}
