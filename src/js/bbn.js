/**
 * Created by undershot on 03.11.2016.
 */

;(function (w) {
	if (typeof Object.assign != 'function') {
		(function () {
			Object.assign = function (target) {
				'use strict';
				// We must check against these specific cases.
				if (target === undefined || target === null) {
					throw new TypeError('Cannot convert undefined or null to object');
				}

				var output = Object(target);
				for (var index = 1; index < arguments.length; index++) {
					var source = arguments[index];
					if (source !== undefined && source !== null) {
						for (var nextKey in source) {
							if (source.hasOwnProperty(nextKey)) {
								output[nextKey] = source[nextKey];
							}
						}
					}
				}
				return output;
			};
		})();
	}

	var Bnr = function ( opts ) {
		function F( opts ){
			this._items = opts;

			this._currentItem = null;

			this._elements = {};

			return this;
		}

		F.prototype = Bnr.prototype;

		return new F(opts);
	};

	Bnr.prototype.global = {
		template: "",
		_randomChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
		_LSName: "boxViewed",
		_classes: {
			box: "",
			boxClose: "",
			boxLink: "",
			boxImg: "",
			boxActive: ""
		},
		states: {

		},
		counter: {
			boxCloseClicks: 0,
			boxClicks: 0,
			_toCloseBox: 1,
			_boxInterval: Math.floor(24/3) * 60 * 60
		},
		events: {
			boxClick: function (event) {
				event.preventDefault();

				//w.open(this._currentItem.href, "", "");

				this.global.counter.boxClicks++;

				console.log(this._currentItem.href, this.global.counter);

				return false;
			},
			_boxHide: function () {
				var self = this,
					box = self._elements.box;

				box.classList.add("closed");


				setTimeout(function () {
					localStorage.setItem( self.global._LSName, +new Date() );

					document.body.removeChild(box);
				}, 200);



				return false;
			},
			boxImgLoaded: function (event) {
				var c = this.__getClasses();

				this._elements.box.classList.add(c.boxActive);
				
			},
			boxCloseClicked: function (event) {
				event.preventDefault();

				if(this.global.counter.boxCloseClicks == this.global.counter._toCloseBox-1){
					return this.global.events._boxHide.call(this);
				}

				this.global.counter.boxCloseClicks++;
			}
		},
		renders: {
			content: {
				image: function (opts) {
					var img = document.createElement("img");

					img.setAttribute("src", opts.src);

					return img;
				}
			}
		}
	};

	Bnr.prototype.__randomString = function( c ) {
		var str = "",
			i = 0,
			min = 10,
			max = 62;

		for( ; i++ < c ; ){
			var r = Math.random() * ( max - min ) + min << 0;
			str += String.fromCharCode( r += r>9 ? r<36 ? 55 : 61 : 48 );
		}
		return str;
	};

	Bnr.prototype.__setClasses = function () {
		var c = this.global._classes;

		for(var i in c){
			c[i] = this.__randomString(10);
		}
	};

	Bnr.prototype.__getClasses = function () {
		return this.global._classes;
	};

	Bnr.prototype.__renderStyles = function () {
		this.__setClasses();

		var c = this.__getClasses();

		var styles = "." + c["box"] + "{\
		position: fixed;\
		width: 300px;\
		height: 250px;\
		right: 0;\
		bottom: 0;\
		z-index: 99999;\
		overflow: hidden;\
		border-radius: 3px;\
		display: block;\
		transition: transform .2s cubic-bezier(.42,0,.4,1);\
		transform: translate(100%,-5px);\
	}\
	\
	." + c["box"] + "." + c["boxActive"] + "{\
	    transform: translate(-5px,-5px);\
		display:block;\
	}\
	." + c["box"] + ".closed{\
		transform: translate(100%,-5px);\
	}\
		." + c["boxImg"] + "{\
		width: 100%;\
		position: relative;\
	}\
	." + c["boxLink"] + "{\
		display: block;\
		width: 100%;\
		height: 100%;\
		position: absolute;\
		cursor:pointer;\
		top: 0;\
		left: 0;\
		z-index: 1;\
	}\
	." + c["boxClose"] + "{\
		display: block;\
		position: absolute;\
		width: 25px;\
		height: 25px;\
		cursor:pointer;\
		z-index: 2;\
		top: 10px;\
		left: 10px;\
		background: #ef4a4a;\
		line-height: 25px;\
		text-align: center;\
		border-radius: 40px;\
		text-decoration: none;\
		transition: background-color .2s;\
	}\
	." + c["boxClose"] + ":before{\
		font: 400 22px/25px sans-serif;\
		content: '\\00d7';\
		color: #fff;\
	}\
	." + c["boxClose"] + ":hover{\
		background-color: #ff7878;\
	}";

		//var s = "." + c["box"] + "{position: fixed;width: 300px;height: 300px;right: 0;bottom: 0;z-index: 99999;overflow: hidden;}." + c["boxImg"] + "{width: 100%;position: relative;}." + c["boxLink"] + "{display: block;width: 100%;height: 100%;position: absolute;top: 0;left: 0;z-index: 1;}." + c["boxClose"] + "{display: block;position: absolute;width: 30px;height: 30px;z-index: 2;top: 0;left: 0;background: red;}";

		return styles;
	};

	Bnr.prototype._pasteStyles = function(){
		var s = document.createElement("style");

		s.innerHTML = this.__renderStyles();

		document.head.appendChild(s);
	};

	Bnr.prototype.__setRandomItem = function() {
		var r = Math.round( Math.random() * ( this._items.length-1 ) );

		this._currentItem = this._items[r];
	};

	Bnr.prototype.__renderContent = function () {
		var type = this._currentItem.type || "image",
			r    = this.global.renders.content;

		if( !r.hasOwnProperty(type) ) {
			throw new Error("Undefined type: " + type);
		}

		return r[type].call(this, this._currentItem);
	};

	Bnr.prototype._assignEventElements = function () {
		var els = this._elements,
			self = this;

		els.boxLink.addEventListener("click", function (event) {
			self.global.events.boxClick.call(self, event);
		});

		els.boxClose.addEventListener("click", function (event) {
			self.global.events.boxCloseClicked.call(self, event);
		});

		els.boxImg.addEventListener("load", function (event) {
			self.global.events.boxImgLoaded.call(self, event);
		});

		return this._elements;
	};

	Bnr.prototype._render = function(){
		this.__setRandomItem();

		var rEl = this.__randomString(3),
			box      = document.createElement(rEl),
			boxClose = document.createElement(rEl),
			boxImg   = this.__renderContent(),
			boxLink  = document.createElement(rEl),
			c = this.__getClasses(),
			attr = this._currentItem;

		box.setAttribute("class", c.box);
		boxClose.setAttribute("class", c.boxClose);

		boxImg.setAttribute("class", c.boxImg);

		boxLink.setAttribute("class", c.boxLink);

		boxLink.appendChild(boxImg);
		box.appendChild(boxLink);
		box.appendChild(boxClose);

		Object.assign(this._elements, {
			box: box,
			boxImg: boxImg,
			boxClose: boxClose,
			boxLink: boxLink
		});

		this._assignEventElements();

		return box;
	};

	Bnr.prototype._createNew = function () {

		document.body.appendChild( this._render() );

		return this;
	};

	Bnr.prototype._checkStorage = function () {
		var ls = localStorage.getItem( this.global._LSName );

		if( !ls ) return true;

		return (+new Date()) - ls >= this.global.counter._boxInterval;

	};

	Bnr.prototype.init = function () {
		if( !this._checkStorage() ) return;

		this._pasteStyles();

		this._createNew();


		return this;
	};

	w.Bnr = Bnr
}(window));