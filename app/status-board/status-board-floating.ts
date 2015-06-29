/// <reference path="../../typings/tsd.d.ts" />

import {Component, View, NgFor, NgIf} from 'angular2/angular2';

var dimensions = {
	rows: 30,
	cols: 10
};

interface IMinMax {
	min: number;
	max: number;
}

interface IBounds {
	x: IMinMax;
	y: IMinMax;
}

interface IPositionConfig {
	velocity: IBounds;
	bounds: IBounds;
}

var requestAnimationFrame = window.requestAnimationFrame || window['mozRequestAnimationFrame'] ||
    window['webkitRequestAnimationFrame'] || window.msRequestAnimationFrame;

@Component({
	selector: 'status-board'
})
@View({
	templateUrl: 'app/status-board/status-board-floating.html',
	directives: [NgFor, NgIf]
})
export class StatusBoardFloating {
	statusBoard: Position[][] = [];

	private _config: IPositionConfig = {
		velocity: {
			x: { min: 0, max: 100 },
			y: { min: 0, max: 100 }
		},
		bounds: {
			x: { min: 100, max: 900 },
			y: { min: 100, max: 700 }
		}
	};

	constructor() {
		this.initStatusBoard();

		requestAnimationFrame(this.updateBoard);
	}

	initStatusBoard() {
		for (let row = 0; row < dimensions.rows; row++) {
			let rowData = this.statusBoard[row] = [];
			for (let col = 0; col < dimensions.cols; col++) {
				rowData[col] = Position.create(this._config);
			}
		}
	}

	// Use arrow function to lock the scope.
	updateBoard = (now: number, lastTime = 0) => {
		const elapsedSeconds = new TimeSpan(lastTime, now).totalSeconds;
		const bounds = this._config.bounds;

		for (let row = 0; row < dimensions.rows; row++) {
			for (let col = 0; col < dimensions.cols; col++) {
				this.statusBoard[row][col].move(elapsedSeconds, bounds);
			}
		}

		// Pass current timestamp to next update using a closure (no need to store in a property).
		requestAnimationFrame(nextTime => this.updateBoard(nextTime, now));
	};
}

class Position {
	top: string;
	left: string;

	constructor(
		public x: number,
		public y: number,
		private velocityX: number,
		private velocityY: number) { }

	move(timeDelta: number, bounds?:IBounds) {
		this.x += (this.velocityX * timeDelta);
		this.y += (this.velocityY * timeDelta);

		this.top = `${this.y}px`;
		this.left = `${this.x}px`;

		if(!bounds) return;

		if(this.x > bounds.x.max || this.x < bounds.x.min){
			this.x = this.x > bounds.x.max ? bounds.x.max : bounds.x.min;
			this.velocityX *= -1;
		}
		if(this.y > bounds.y.max || this.y < bounds.y.min){
			this.y = this.y > bounds.y.max ? bounds.y.max : bounds.y.min;
			this.velocityY *= -1;
		}
	}

	static create(config:IPositionConfig){
		return new Position(
			getRandomInt(config.bounds.x.min, config.bounds.x.max),
			getRandomInt(config.bounds.y.min, config.bounds.y.max),
			getRandomInt(config.velocity.x.min, config.velocity.x.max),
			getRandomInt(config.velocity.y.min, config.velocity.y.max)
		);
	}
}

function getRandomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min)) + min;
}

class TimeSpan {
	private _totalMilliseconds: number;

	constructor(beginMilliseconds: number, endMilliseconds: number) {
		this._totalMilliseconds = endMilliseconds - beginMilliseconds;
	}

	get totalSeconds() {
		return this._totalMilliseconds / 1000;
	}

	get totalMilliseconds() {
		return this._totalMilliseconds;
	}
}
