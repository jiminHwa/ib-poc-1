import {Component, ElementRef} from '@angular/core';
import {NavController} from 'ionic-angular';

declare let PIXI: any;
declare let TWEEN: any;

@Component({
    templateUrl: 'build/pages/test4/test4.html'
})
export class Test4Page {

    canvasSize: {x: number, y: number};

    multiForResolution: number = 3;

    screenPos: number = 0;
    screenPosLimit: number = 2;

    selectedSpriteIndex: number = -2;

    bubbles: any[] = [];
    sprites: any[] = [];
    texts:any[] = [];
    values: number[] = [];
    minValue: number = 0;
    maxValue: number = 100;
    maxScale: number = 1;
    minScale: number = 0.5;

    objectTouchStartPosition: {x: number, y: number};
    objectDownIndex: number = -1;
    objectUpIndex: number = -1;

    epsilon: number = 10;
    bgTouchStartPosition: {x: number, y: number};

    textStyle:any;

    constructor(private navController: NavController, private el: ElementRef) {
        this.textStyle  = {
            fontFamily: 'Arial',
            fontSize: '100px',
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: '#F7EDCA',
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440
        };
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
        function onDownOnBG(ev: any) {
            // self.deselectSprite();
            self.bgTouchStartPosition = {x: ev.data.global.x, y: ev.data.global.y};

        }

        function onUpOnBG(ev: any) {
            let bgTouchEndPosition = {x: ev.data.global.x, y: ev.data.global.y};
            if (self.isClick(self.bgTouchStartPosition, bgTouchEndPosition)) {
                self.bgTouchStartPosition = undefined;
                self.deselectSprite();
            }
        }

        background.on('mousedown', onDownOnBG);
        background.on('touchstart', onDownOnBG);
        background.on('mouseup', onUpOnBG);
        background.on('touchend', onUpOnBG);
        stage.addChild(background);


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


        PIXI.loader
            .add('assets/sprites/sprites.json')
            .load(onAssetsLoaded);

        let movie;

        function onAssetsLoaded() {
            // create an array of textures from an image path
            let frames = [];

            for (var i = 0; i < 6; i++) {
                frames.push(PIXI.Texture.fromFrame('bubble' + (i + 1) + '.png'));
            }

            for (let i = 0; i < spritesPos.length; i++) {
                let bubble = new PIXI.Container();

                let pos = spritesPos[i];

                self.values.push(self.getARandomBubbleValue());

                // create a MovieClip (brings back memories from the days of Flash, right ?)
                movie = new PIXI.extras.MovieClip(frames);

                movie.interactive = true;
                movie.on('touchstart', onDown);
                movie.on('mousedown', onDown);
                movie.on('touchend', onUp);
                movie.on('mouseup', onUp);

                function onDown(ev: any) {
                    self.objectDownIndex = i;
                    self.objectTouchStartPosition = {x: ev.data.global.x, y: ev.data.global.y};
                }

                function onUp(ev: any) {
                    self.onUpOnObject(ev, i);
                }

                movie.anchor.set(0.5);
                movie.position.x = 0;
                movie.position.y = 0;

                movie.scale.set(self.getScaleBy(self.values[i]));

                movie.animationSpeed = 0.1;

                movie.zOrder = 10;

                movie.play();

                bubble.addChild(movie);
                self.sprites.push(movie);



                let text = self.getText('' + self.values[i]);
                bubble.addChild(text);
                self.texts.push(text);

                // console.log(bubble);
                // bubble.anchor.set(0.5);
                bubble.x = pos[0];
                bubble.y = pos[1];
                stage.addChild(bubble);
                self.bubbles.push(bubble);
            }
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


    onUpOnObject(ev: any, index: number) {
        // console.log("click", index, ev);

        if (this.objectDownIndex != index) {
            return;
        }

        let objectTouchEndPosition = {x: ev.data.global.x, y: ev.data.global.y};
        if (!this.isClick(this.objectTouchStartPosition, objectTouchEndPosition)) {
            this.objectTouchStartPosition = undefined;
            return;
        }

        let tweens: any = [];

        if (this.selectedSpriteIndex != index) {
            this.selectedSpriteIndex = index;
            let distXToCenter = ((this.canvasSize.x / 2) - this.bubbles[index].position.x);

            for (let i = 0; i < this.bubbles.length; i++) {
                let sprite = this.bubbles[i];
                let scale = sprite.scale;
                sprite.scale.originalScale = scale;
                // console.log(scale);
                let tween = new TWEEN.Tween(scale);
                tween.easing(TWEEN.Easing.Quadratic.InOut);
                if (i === index) {
                    tween.to({x: 1.8, y: 1.8}, 1000);

                }
                else {
                    tween.to({x: 0.2, y: 0.2}, 1000);

                }
                tweens.push(tween);
            }


            for (let tween of tweens) {
                tween.start();
            }
            this.tweenSpritePosition(distXToCenter, 0);
        }
        else if (this.selectedSpriteIndex === -2) {

        }
        else {
            this.deselectSprite();
        }
    }

    private deselectSprite() {
        let tweens: any[] = [];
        this.selectedSpriteIndex = -1;
        for (let i = 0; i < this.bubbles.length; i++) {
            let sprite = this.bubbles[i];
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
            if (this.screenPos < this.screenPosLimit) {
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
            if (this.screenPos > -this.screenPosLimit) {
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

    private tweenSpritePosition(relativeX: number, realtiveY: number) {
        for (let i = 0; i < this.bubbles.length; i++) {
            let sprite = this.bubbles[i];
            let position = sprite.position;

            let tween = new TWEEN.Tween(position);
            tween.easing(TWEEN.Easing.Quadratic.InOut);
            tween.to({x: position.x + relativeX, y: position.y + realtiveY}, 1000);
            tween.start();
        }
    }

    action1() {
        let self = this;
        let tweens: any = [];
        for (let i = 0; i < this.bubbles.length; i++) {
            let bubble = this.bubbles[i];
            let sprite = this.sprites[i];
            let text = this.texts[i];
            let scale = sprite.scale;
            let value = this.values[i];

            let destValue = this.getARandomBubbleValue();
            let valueDist = destValue - value;
            let srcScale = scale.x;
            let destScale = this.getScaleBy(destValue);
            let scaleDist = destScale - scale.x;

            let progress = {x: 0};
            let tween = new TWEEN.Tween(progress);
            tween.easing(TWEEN.Easing.Quadratic.InOut);
            tween.to({x: 1}, 1000);

            // if(i == 0) {
            //     console.log(destScale);
            // }

            tween.onUpdate(function(){
                let state = this.x;
                // if(i == 0) {
                //     console.log(sprite.scale.x);
                // }
                sprite.scale.set(srcScale + scaleDist * state);
                bubble.removeChild(text);
                text = self.getText('' + Math.floor((value + valueDist * state)));
                bubble.addChild(text);
            });

            tween.onComplete(function() {
                self.texts[i] = text;
                self.values[i] = destValue;
            });

            tweens.push(tween);
        }

        for (let tween of tweens) {
            tween.start();
        }
    }

    private isClick(start: {x: number, y: number}, end: {x: number, y: number}) {
        if (!start) {
            return false;
        }

        let dist = Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2));

        if (dist < this.epsilon) {
            return true;
        }
        else {
            return false;
        }
    }

    private getARandomBubbleValue() {
        return Math.floor(Math.random() * (this.maxValue - this.minValue) + this.minValue);
    }

    private getScaleBy(value: number) {
        return (((value - this.minValue) / (this.maxValue - this.minValue)) * (this.maxScale - this.minScale) + this.minScale);
    }

    private getText(textString: string) {
        let text = new PIXI.Text(textString, this.textStyle);
        text.anchor.set(0.5);
        text.x = 0;
        text.y = 0;
        return text;
    }
}
