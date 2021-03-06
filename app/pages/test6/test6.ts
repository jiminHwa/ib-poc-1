import {Component, ElementRef} from '@angular/core';
import {NavController} from 'ionic-angular';
import {TestDetailPage} from '../testDetail/testDetail';

declare let PIXI: any;
declare let TWEEN: any;

@Component({
    templateUrl: 'build/pages/test6/test6.html'
})
export class Test6Page {

    stage: any;

    pageWindow: number = 5;
    indexOfPageOnScreen: number = 2;
    pageNumber: number = 0;
    pages: {page:any, bubbles:any[]}[] = [];
    pageSplitter: any;
    pageSplitterOffset: number = 8;
    // bubbles: any[][] = [];
    // bubbles: {bubble: any, circle: any}[] = [];

    canvasSize: {w: number, h: number};
    multiForResolution: number = 3;


    //Slide관련
    stageTouchStartPos: {x: number, y: number};
    slideEnabledOffset: number = 0.5;
    // slidingBlocked: boolean = false;
    stageInteractionBlocked: boolean = false;
    bgInteractionBlocked: boolean = false;

    bubbleTouchStartPos: {x: number, y: number};
    bubbleUpOffset: number;
    epsilon: number = 5;

    indexOfSelectedBubble: number = -1;

    // colorPoolIndex:number = 0;
    // bubbleColors:number[] = [0xFF0000, 0xFFFF00, 0x00FF00, 0x00FFFF, 0x0000FF];

    textStyle: any;

    renderer: any;
    stopRendering: boolean = true;

    constructor(private nav: NavController, private el: ElementRef) {
        this.textStyle = {
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

        for (let i = 0; i < this.pageWindow; i++) {
            this.pages[i] = {page:undefined, bubbles:[]};
        }
    }

    onPageLoaded() {
        let self = this;

        let container = this.el.nativeElement.querySelector(".canvas-container");
        // console.log(window.innerWidth, window.innerHeight, container.style);

        let canvasWidth = window.innerWidth * this.multiForResolution;
        let canvasHeight = window.innerHeight * this.multiForResolution;
        this.canvasSize = {w: canvasWidth, h: canvasHeight};
        let renderer = PIXI.autoDetectRenderer(canvasWidth, canvasHeight, {transparent: true, antialias: true});
        this.renderer = renderer;

        container.appendChild(renderer.view);

        let stage = new PIXI.Container();
        this.stage = stage;

        for (let i = 0; i < this.pageWindow; i++) {
            this.createAPage(i, i - this.indexOfPageOnScreen);
        }


        this.render();
    }

    ionViewWillEnter() {
        this.stageInteractionBlocked = false;
        this.bgInteractionBlocked = false;
        this.stopRendering = true;
        this.toogleRendering();

        if(this.indexOfSelectedBubble >= 0) {
            this.deselectBubble(500);
        }
    }

    render() {
        let self = this;
        let count = 0;
        let starts = [];
        for(let i = 0 ; i < self.pages[self.indexOfPageOnScreen].bubbles.length ; i++) {
            starts[i] = Math.random() * Math.PI;
        }

        animate();

        function animate() {
            // console.log(self.indexOfPageOnScreen);

            if (self.stopRendering) {
                return;
            }

            count += 0.1;

            let bubbles = self.pages[self.indexOfPageOnScreen].bubbles;
            for(let i = 0 ; i < bubbles.length ; i++) {
                let bubble = bubbles[i];
                bubble.scale.x = Math.sin(starts[i] + count) * 0.05 + 0.99;
                bubble.scale.y = Math.cos(starts[i] + count) * 0.05 + 0.99;
            }

            requestAnimationFrame(animate);
            // render the container
            TWEEN.update();
            self.renderer.render(self.stage);
        }
    }


    createAPage(index: number, pageNumber: number) {
        // console.log("Create A Page : ", index);
        let self = this;

        let page = new PIXI.Container();
        this.pages[index].page = page;

        // page.index = index;
        page.pageNumber = pageNumber;

        page.interactive = true;
        page.hitArea = new PIXI.Rectangle(0, 0, this.canvasSize.w, this.canvasSize.h);

        page.on('touchstart', touchOnPage);
        page.on('touchmove', touchOnPage);
        page.on('touchend', touchOnPage);

        function touchOnPage(ev: any) {
            // console.log("Page: ", ev);
            if (!self.stageInteractionBlocked) {
                self.touchOnAPage(ev);
            }
        }

        page.position.x = (index - this.indexOfPageOnScreen) * this.canvasSize.w;
        this.stage.addChild(page);


        let background = new PIXI.Container();
        background.zOrder = 0;
        background.interactive = true;
        background.hitArea = new PIXI.Rectangle(0, 0, this.canvasSize.w, this.canvasSize.h);
        function onDownOnBG(ev: any) {
            if(!self.bgInteractionBlocked && self.indexOfSelectedBubble >= 0) {
                console.log("Click!");
                self.deselectBubble();
            }
        }

        background.on('mousedown', onDownOnBG);
        background.on('touchstart', onDownOnBG);
        page.addChild(background);


        let bubblesPos: number[][] = [
            [this.canvasSize.w / 4, this.canvasSize.h / 4],
            [this.canvasSize.w / 4 * 3, this.canvasSize.h / 4],
            [this.canvasSize.w / 2, this.canvasSize.h / 2],
            [this.canvasSize.w / 4, this.canvasSize.h / 4 * 3],
            [this.canvasSize.w / 4 * 3, this.canvasSize.h / 4 * 3], //여기까지는 화면 안
        ];


        // let bubbleColor = this.bubbleColors[this.colorPoolIndex++];
        // if(this.colorPoolIndex >= this.bubbleColors.length) {
        //     this.colorPoolIndex = 0;
        // }

        for (let i = 0; i < bubblesPos.length; i++) {
            let pos = bubblesPos[i];


            let bubble = new PIXI.Container();
            let circle = new PIXI.Graphics();

            circle.lineStyle(0);
            circle.beginFill(0xFF0000, 0.5);
            circle.drawCircle(0, 0, 150);
            circle.endFill();


            circle.interactive = true;
            circle.on('touchstart', touchOnCircle);
            circle.on('touchend', touchOnCircle);


            function touchOnCircle(ev: any) {
                // console.log("click", i, ev);
                self.bubbleUp(i, ev);
            }


            // circle.anchor.x = 0.5;
            // circle.anchor.y = 0.5;
            // circle.position.x = 0;
            // circle.position.y = 0;

            // background.zOrder = 1;

            bubble.addChild(circle);

            bubble.position.x = pos[0];
            bubble.position.y = pos[1];

            bubble.zOrder = 1;

            page.addChild(bubble);
            this.pages[index].bubbles[i] = bubble;

            if (i === 2) {
                let text = self.getText('' + pageNumber);
                bubble.addChild(text);
            }
            // console.log(page.position.x);
            // this.bubbles.push({bubble: bubble, circle: circle});
        }


        if (index === this.indexOfPageOnScreen) {
            this.drawPageSplitter(page);
        }
        else {
            page.alpha = 0;
        }
    }

    drawPageSplitter(page: any) {
        let splitterOffset = this.pageSplitterOffset;

        let splitter = new PIXI.Graphics();

        splitter.lineStyle(4, 0xff0000, 0.5);
        splitter.beginFill(0);
        splitter.moveTo(-splitterOffset, this.canvasSize.h * (1 / 5));
        splitter.lineTo(-splitterOffset, this.canvasSize.h * (4 / 5));
        splitter.moveTo(this.canvasSize.w + splitterOffset, this.canvasSize.h * (1 / 5));
        splitter.lineTo(this.canvasSize.w + splitterOffset, this.canvasSize.h * (4 / 5));
        splitter.endFill();

        page.addChild(splitter);

        this.pageSplitter = splitter;
    }

    touchOnAPage(ev: any) {
        let page = this.pages[this.indexOfPageOnScreen].page;
        let pos = {x: ev.data.global.x, y: ev.data.global.y};
        if (ev.type === 'touchstart') {
            this.stageTouchStartPos = pos;
        }
        else {
            let distX = pos.x - this.stageTouchStartPos.x;
            let indexOfNextPage = this.indexOfPageOnScreen;
            let nextPage;
            if (distX > 0) {
                indexOfNextPage -= 1;
            }
            else {
                indexOfNextPage += 1;
            }

            nextPage = this.pages[indexOfNextPage].page;

            if (ev.type === 'touchmove') {
                page.position.x = distX;
                nextPage.alpha = Math.abs((distX / this.canvasSize.w));
                page.alpha = 1 - Math.abs((distX / this.canvasSize.w));
                if (distX > 0) {
                    nextPage.position.x = (-1 * this.canvasSize.w) + distX;
                }
                else {
                    nextPage.position.x = this.canvasSize.w + distX;
                }

            }
            else if (ev.type === 'touchend') {
                // console.log(Math.abs((distX/this.canvasSize.w)));

                let tweens: any[] = [];



                if (Math.abs((distX / this.canvasSize.w)) <= this.slideEnabledOffset) { //Page가 변하지 않는 경우.
                    let tween = this.getTweenForSlideTo(page, 0, true);
                    tweens.push(tween);
                    // page.position.x = 0;
                    let nextPos = this.canvasSize.w;
                    if (distX > 0) {
                        nextPos *= -1;
                    }

                    tween = this.getTweenForSlideTo(nextPage, nextPos, false);
                    tweens.push(tween);

                }
                else { //Page가 변화할 경우
                    page.removeChild(this.pageSplitter);
                    this.drawPageSplitter(nextPage);

                    for (let i = 0; i < this.pageWindow; i++) {
                        let tempPage = this.pages[i].page;

                        if (distX > 0 && (this.pageWindow - 1 === i)) {
                            this.stage.removeChild(tempPage);
                        }
                        else if (distX < 0 && i === 0) {
                            this.stage.removeChild(tempPage);
                        }
                        else {
                            let newPosX = ((i - this.indexOfPageOnScreen) * this.canvasSize.w);

                            if (distX > 0) {
                                newPosX += this.canvasSize.w;
                            }
                            else {
                                newPosX -= this.canvasSize.w;
                            }

                            if (i === this.indexOfPageOnScreen) {
                                let tween = this.getTweenForSlideTo(tempPage, newPosX, false, 'Out');
                                tweens.push(tween);
                            }
                            else if(i === indexOfNextPage){
                                let tween = this.getTweenForSlideTo(tempPage, newPosX, true, 'Out');
                                tweens.push(tween);
                            }
                            else {
                                tempPage.position.x = newPosX;
                            }
                        }
                    }

                    if (distX > 0) {
                        this.pageNumber--;
                        for (let i = this.pageWindow - 2; i >= 0; i--) {
                            // console.log(this.pages[i], this.pages[i - 1]);

                            this.pages[i+1].page = this.pages[i].page;
                            this.pages[i+1].bubbles = this.pages[i].bubbles;
                        }
                        this.createAPage(0, this.pageNumber - this.indexOfPageOnScreen);
                    }
                    else if(distX < 0){
                        this.pageNumber++;
                        for (let i = 0; i < this.pageWindow - 1; i++) {
                            this.pages[i].page = this.pages[i + 1].page;
                            this.pages[i].bubbles = this.pages[i + 1].bubbles;
                            // this.pages[i] = this.pages[i + 1];
                        }
                        this.createAPage(this.pageWindow - 1, this.pageNumber + this.indexOfPageOnScreen);
                    }
                }

                for (let tw of tweens) {
                    tw.start();
                }

            }
        }
    }

    bubbleUp(index: number, ev: any) {
        let pos = {x: ev.data.global.x, y: ev.data.global.y};

        if (ev.type === 'touchstart') {
            this.bubbleTouchStartPos = pos;
        }
        else if (ev.type === 'touchend' && this.isClick(this.bubbleTouchStartPos, pos)) {
            let bubbles = this.pages[this.indexOfPageOnScreen].bubbles;
            let tweens: any = [];

            if (this.indexOfSelectedBubble != index) {
                if (this.indexOfSelectedBubble >= 0) {
                    this.deselectBubble();
                }

                this.indexOfSelectedBubble = index;
                let distXToCenter = ((this.canvasSize.w / 2) - bubbles[index].position.x);

                for (let i = 0; i < bubbles.length; i++) {
                    let sprite = bubbles[i];
                    let scale = sprite.scale;
                    let scaleX = scale.x;
                    let tween = new TWEEN.Tween(scale);
                    tween.easing(TWEEN.Easing.Quadratic.InOut);
                    if (i === index) {
                        let destScale = 1.5;
                        tween.to({x: destScale, y: destScale}, 1000);

                        let pageTransited = false;
                        let self = this;
                        tween.onUpdate(function() {
                            // console.log((this.x - scaleX)/(destScale - scaleX));
                            if(!pageTransited && (destScale != scaleX) && (this.x - scaleX)/(destScale - scaleX) >= 0.8) {

                                pageTransited = true;
                                self.nav.push(TestDetailPage);
                            }
                        });

                        tween.onComplete(function () {
                            self.toogleRendering();
                        });

                    }
                    else {
                        tween.to({x: 0.5, y: 0.5}, 1000);

                    }
                    tweens.push(tween);
                }

                this.stageInteractionBlocked = true;
                this.bgInteractionBlocked = true;
                for (let tween of tweens) {
                    tween.start();
                }

                this.bubbleUpOffset = distXToCenter;
                this.tweenBubblesPosition(bubbles, distXToCenter, 0);

            }
            else {

            }
        }
    }


    private tweenBubblesPosition(bubbles: any[], relativeX: number, realtiveY: number, duration: number = 1000) {
        for (let i = 0; i < bubbles.length; i++) {
            let sprite = bubbles[i];
            let position = sprite.position;

            let tween = new TWEEN.Tween(position);
            tween.easing(TWEEN.Easing.Quadratic.InOut);
            tween.to({x: position.x + relativeX, y: position.y + realtiveY}, duration);
            tween.start();
        }
    }

    // private distance2D(point1: {x: number, y: number}, point2: {x: number, y: number}) {
    //     return Math.sqrt(Math.pow(point1.x - point1.x, 2) + Math.pow(point2.y - point2.y, 2));
    // }

    private getTweenForSlideTo(page: any, destX: any, fadeIn: boolean, easing: string = 'InOut', duration: number = 500) {
        let tween = new TWEEN.Tween(page.position);
        let start = page.position.x;
        let prevAlpha = page.alpha;
        tween.easing(TWEEN.Easing.Quadratic[easing]);
        tween.to({x: destX}, duration);
        tween.onUpdate(function() {
            let progress = (this.x - start)/(destX - start);
            if(fadeIn) {
                page.alpha = prevAlpha + (1 - prevAlpha) * progress;
                // console.log(page.alpha);
            }
            else {
                page.alpha = prevAlpha * (1 - progress);
            }
        });
        return tween;
    }


    private getText(textString: string) {
        let text = new PIXI.Text(textString, this.textStyle);
        text.anchor.set(0.5);
        // text.x = this.canvasSize.w/2;
        // text.y = this.canvasSize.h/2;
        return text;
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

    private deselectBubble(duration: number = 1000) {
        if (this.indexOfSelectedBubble >= 0) {
            let tweens: any[] = [];
            let bubbles = this.pages[this.indexOfPageOnScreen].bubbles;
            this.indexOfSelectedBubble = -1;
            for (let i = 0; i < bubbles.length; i++) {
                let sprite = bubbles[i];
                let scale = sprite.scale;
                let tween = new TWEEN.Tween(scale);
                tween.easing(TWEEN.Easing.Quadratic.InOut);
                tween.to({x: 1, y: 1}, 1000);
                tweens.push(tween);
            }


            for (let tween of tweens) {
                tween.start();
            }

            this.tweenBubblesPosition(bubbles, -this.bubbleUpOffset, 0, duration);
        }
    }

    toogleRendering() {
        if (!this.stopRendering) {
            this.stopRendering = true;
        }
        else {
            this.stopRendering = false;
            this.render();
        }
    }
}
