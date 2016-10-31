import {Component, ElementRef} from '@angular/core';
import {NavController} from 'ionic-angular';
import {TestDetailPage} from '../testDetail/testDetail';

declare let PIXI: any;
declare let TWEEN: any;

@Component({
    templateUrl: 'build/pages/test7/test7.html'
})
export class Test7Page {

    stage: any;

    pageWindow: number = 5;
    indexOfPageOnScreen: number;
    pageNumber: number = 0;
    pages: {page: any, bubbles: any[]}[] = [];
    pageSplitter: any;
    pageSplitterOffset: number = 8;

    shadowOffset: {x: number, y: number} = {x: 20, y: 30};
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

        this.indexOfPageOnScreen = Math.floor(this.pageWindow/2);


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
            this.pages[i] = {page: undefined, bubbles: []};
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


        // setInterval(()=> {
        //     console.log("===============");
        //     this.pages.forEach((pageContainer:any) => {
        //         console.log( pageContainer.page.pageNumber);
        //     });
        // }, 3000);
    }

    ionViewWillEnter() {
        this.stageInteractionBlocked = false;
        this.bgInteractionBlocked = false;
        this.stopRendering = true;
        this.toogleRendering();

        if (this.indexOfSelectedBubble >= 0) {
            this.deselectBubble(300);
        }
    }

    render() {
        let self = this;
        let count = 0;
        let starts = [];
        for (let i = 0; i < self.pages[self.indexOfPageOnScreen].bubbles.length; i++) {
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
            // console.log(self.pages[self.indexOfPageOnScreen].page.pageNumber);
            for (let i = 0; i < bubbles.length; i++) {
                let circle = bubbles[i].getChildAt(1);
                // console.log(circle.pageNumber);
                // if(self.pages[self.indexOfPageOnScreen].page.pageNumber != circle.pageNumber){
                //     console.log(i, self.pages[self.indexOfPageOnScreen].page.pageNumber, circle.pageNumber);
                // }
                circle.scale.x = Math.sin(starts[i] + count) * 0.05 + 0.99;
                circle.scale.y = Math.cos(starts[i] + count) * 0.05 + 0.99;

            }

            requestAnimationFrame(animate);
            // render the container
            TWEEN.update();
            self.renderer.render(self.stage);
        }
    }


    createAPage(index: number, pageNumber: number) {
        // console.log("Create A Page : ", index, pageNumber, this.pages[index]);

        let self = this;

        // self.pages[index].page = undefined;
        // self.pages[index].bubbles = [];

        let page = new PIXI.Container();
        this.pages[index].page = page;

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
            if (!self.bgInteractionBlocked && self.indexOfSelectedBubble >= 0) {
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

        let bubbleContainer = new PIXI.Container();

        for (let i = 0; i < bubblesPos.length; i++) {
            let pos = bubblesPos[i];


            let bubble = new PIXI.Container();

            let blurFilter = new PIXI.filters.BlurFilter();
            blurFilter.blur = 20;
            let shadow = new PIXI.Graphics();
            shadow.lineStyle(0);
            shadow.beginFill(0x000000, 0.3);
            shadow.drawCircle(self.shadowOffset.x, self.shadowOffset.y, 150);
            shadow.endFill();
            shadow.filters = [blurFilter];

            bubble.addChildAt(shadow, 0);

            let circle = new PIXI.Graphics();

            circle.lineStyle(0);
            circle.beginFill(0xFF5555, 1);
            circle.drawCircle(0, 0, 150);
            circle.endFill();


            circle.interactive = true;
            circle.on('touchstart', touchOnCircle);
            circle.on('touchend', touchOnCircle);


            function touchOnCircle(ev: any) {
                // console.log("click", i, ev);
                self.bubbleUp(i, ev);
            }

            circle.pageNumber = pageNumber;
            // circle.anchor.x = 0.5;
            // circle.anchor.y = 0.5;
            // circle.position.x = 0;
            // circle.position.y = 0;

            // background.zOrder = 1;

            bubble.addChildAt(circle, 1);


            bubble.position.x = pos[0];
            bubble.position.y = pos[1];

            bubble.zOrder = 1;

            bubbleContainer.addChild(bubble);
            this.pages[index].bubbles[i] = bubble;

            if (i === 2) {
                let text = self.getText('' + pageNumber);
                bubble.addChild(text);
            }
            // console.log(page.position.x);
            // this.bubbles.push({bubble: bubble, circle: circle});
        }

        page.addChild(bubbleContainer);

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

            if (!this.isClick(this.stageTouchStartPos, pos)) {
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
                        // console.log("Change");
                        tweens = this.onPageSlideingSucceed(tweens, page, nextPage, indexOfNextPage, distX);
                    }

                    for (let tw of tweens) {
                        tw.start();
                    }

                }
            }
        }
    }

    private onPageSlideingSucceed(tweens: any[], page: any, nextPage: any, indexOfNextPage: number, distX: number) {
        page.removeChild(this.pageSplitter);
        this.drawPageSplitter(nextPage);


        for (let i = 0; i < this.pageWindow; i++) {
            if (distX > 0 && i === this.pageWindow - 1) {
                continue;
            }
            else if (distX < 0 && i === 0) {
                continue;
            }

            let tempPage = this.pages[i].page;

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
            else if (i === indexOfNextPage) {
                let tween = this.getTweenForSlideTo(tempPage, newPosX, true, 'Out');
                tweens.push(tween);
            }
            else {
                tempPage.position.x = newPosX;
            }
        }

        if (distX > 0) {
            this.pageNumber--;

            this.stage.removeChild(this.pages[this.pageWindow - 1].page);
            this.pages[this.pageWindow - 1].page.destroy(true);

            for (let i = this.pageWindow - 2; i >= 0; i--) {
                // console.log(this.pages[i], this.pages[i - 1]);

                this.pages[i + 1].page = this.pages[i].page;
                this.pages[i + 1].bubbles = this.pages[i].bubbles;
            }

            this.pages[0].page = undefined;
            this.pages[0].bubbles = [];

            this.createAPage(0, this.pageNumber - this.indexOfPageOnScreen);
        }
        else if (distX < 0) {
            this.pageNumber++;

            this.stage.removeChild(this.pages[0].page);
            this.pages[0].page.destroy(true);

            for (let i = 1; i < this.pageWindow; i++) {
                this.pages[i - 1].page = this.pages[i].page;
                this.pages[i - 1].bubbles = this.pages[i].bubbles;
            }

            this.pages[this.pageWindow - 1].page = undefined;
            this.pages[this.pageWindow - 1].bubbles = [];


            this.createAPage(this.pageWindow - 1, this.pageNumber + this.indexOfPageOnScreen);
        }

        return tweens;
    }


    bubbleUp(index: number, ev: any) {
        let pos = {x: ev.data.global.x, y: ev.data.global.y};

        if (ev.type === 'touchstart') {
            this.bubbleTouchStartPos = pos;
        }
        else if (ev.type === 'touchend' && this.isClick(this.bubbleTouchStartPos, pos)) {
            let bubbles = this.pages[this.indexOfPageOnScreen].bubbles;
            let tweens: any = [];

            console.log(this.pages[this.indexOfPageOnScreen].page.index, this.pages[this.indexOfPageOnScreen].page.pageNumber);

            if (this.indexOfSelectedBubble != index) {
                if (this.indexOfSelectedBubble >= 0) {
                    this.deselectBubble();
                }

                this.indexOfSelectedBubble = index;
                let distXToCenter = ((this.canvasSize.w / 2) - bubbles[index].position.x);
                this.bubbleUpOffset = distXToCenter;

                for (let i = 0; i < bubbles.length; i++) {
                    let bubble = bubbles[i];
                    let scale = bubble.scale;
                    // let scaleX = scale.x;
                    let tween = new TWEEN.Tween(scale);
                    tween.easing(TWEEN.Easing.Quadratic.InOut);

                    // let shadow = shadows[i];
                    // let tween2 = new TWEEN.Tween(shadow.scale);
                    // tween2.easing(TWEEN.Easing.Quadratic.InOut);

                    if (i === index) {
                        let self = this;
                        // let destScale = 1.5;
                        tween.to({x: 1.5, y: 1.5}, 1000);

                        // let pageTransited = false;

                        // tween.onUpdate(function() {
                        //     // console.log((this.x - scaleX)/(destScale - scaleX));
                        //     if(!pageTransited && (destScale != scaleX) && (this.x - scaleX)/(destScale - scaleX) >= 0.8) {
                        //
                        //         pageTransited = true;
                        //         self.nav.push(TestDetailPage);
                        //     }
                        // });

                        tween.onComplete(function () {
                            self.toogleRendering();
                            self.nav.push(TestDetailPage, {
                                pageNumber: self.pageNumber,
                                bubbleIndex: index
                            });
                        });

                    }
                    else {
                        tween.to({x: 0.5, y: 0.5}, 1000);
                    }
                    tweens.push(tween);
                    // tweens.push(tween2);
                }

                this.stageInteractionBlocked = true;
                this.bgInteractionBlocked = true;

                this.tweenBubblesPosition(bubbles, distXToCenter, 0);

                for (let tween of tweens) {
                    tween.start();
                }
            }
            else {

            }
        }
    }


    private tweenBubblesPosition(bubbles: any[], relativeX: number, realtiveY: number, duration: number = 1000) {
        for (let i = 0; i < bubbles.length; i++) {
            let bubble = bubbles[i];
            let position = bubble.position;

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
        tween.onUpdate(function () {
            let progress = (this.x - start) / (destX - start);
            if (fadeIn) {
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

            for (let i = 0; i < bubbles.length; i++) {
                let bubble = bubbles[i];
                let scale = bubble.scale;
                let tween = new TWEEN.Tween(scale);
                tween.easing(TWEEN.Easing.Quadratic.InOut);
                tween.to({x: 1, y: 1}, 1000);
                tweens.push(tween);

            }


            for (let tween of tweens) {
                tween.start();
            }

            this.tweenBubblesPosition(bubbles, -this.bubbleUpOffset, 0, duration);

            this.indexOfSelectedBubble = -1;
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
