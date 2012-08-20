/***
 * SmartKit core classes
 *
 */

import "js/web.jsx" into web;

import "./event.jsx";

class Platform {
	static const _width  = 320;
	static const _height = 480;

	static function getWidth() : int {
		return Platform._width;
	}

	static function getHeight() : int {
		return Platform._height;
	}
}

class Util {
	static function format(fmt : string, list : int[]) : string {
		return fmt.replace(/%/g, function (s) {
			return list[s as int] as string;
		});
	}
	static function format(fmt : string, list : number[]) : string {
		return fmt.replace(/%/g, function (s) {
			return list[s as int] as string;
		});
	}
	static function format(fmt : string, list : string[]) : string {
		return fmt.replace(/%/g, function (s) {
			return list[s as int] as string;
		});
	}

	static function createTextNode(s : string) : web.Node {
		return web.dom.document.createTextNode(s);
	}

	static function createElement(name : string) : web.HTMLElement {
		return web.dom.createElement(name);
	}

	static function createDiv() : web.HTMLDivElement {
		return Util.createElement("div") as __noconvert__ web.HTMLDivElement;
	}

	static function createSpan() : web.HTMLSpanElement {
		return Util.createElement("span") as __noconvert__ web.HTMLSpanElement;
	}
}

class Point {
	var x : int;
	var y : int;

	function constructor(x : int, y : int) {
		this.x = x;
		this.y = y;
	}
}

class Rectangle {
	var width  : int;
	var height : int;

	function constructor(width : int, height : int) {
		this.width  = width;
		this.height = height;
	}
}

// correspond to EventTarget
mixin Responder {

}

class Application implements Responder {
	var _width  = Platform.getWidth();
	var _height = Platform.getHeight();

	var _rootViewController : ViewController = null;

	function constructor() {
		log [Platform.getWidth(), Platform.getHeight()];
		Application.resetStyles();
	}

	function setRootViewController(rootViewController : ViewController) : void {
		this._rootViewController = rootViewController;
	}

	function attach(rootElement : web.HTMLElement) : void {
		var children = rootElement.childNodes;
		for (var i = 0, l = children.length; i < l; ++i) {
			rootElement.removeChild(children[i]);
		}
		rootElement.appendChild(this.getElement());
	}


	function getElement() : web.HTMLElement {
		var element = Util.createDiv();
		var style   = element.style;
		style.border = "solid 1px black";

		style.width   = (this._width  - 2) as string + "px";
		style.height  = (this._height - 2) as string + "px";

		element.appendChild(this._rootViewController.getElement());

		return element;
	}

	static function resetStyles() : void {
		var s = "";
		s += "* {\n"
			+ "margin: 0;\n"
			+ "padding: 0;\n"
			+ "font-size: 100%;\n"
			+ "}\n"
			+ "\n"
			+ "body {\n"
			+ "line-height: 1.0;\n"
			+ "text-size-adjust: none;\n"
			+ "}\n"
			+ "\n"
			+ "img {\n"
			+ "border: 0;\n"
			+ "vertical-align: bottom;\n"
			+ "\n"
			+ "table {\n"
			+ "border-spacing: 0;\n"
			+ "empty-cells: show;\n"
			+ "}\n"
			+ "\n" // HTML5 block elements
			+ "article,aside,canvas,details,figcaption,figure,footer,header,"
			+ "hgroup,menu,nav,section,summary {\n"
			+ "display: block;\n"
			+ "}"
			;

		var textNode = Util.createTextNode(s);
		var style = Util.createElement("style");
		style.appendChild(textNode);

		web.dom.document.head.appendChild(style);
	}
}

class ViewController implements Responder {
	function getElement() : web.HTMLElement {
		var element = Util.createDiv();
		// FIXME
		return element;
	}
}

class TabBarController extends ViewController {
	var _viewControllers : Array.<ViewController>;
	var _tabBar : TabBar = null;

	function constructor() {
	}

	function setViewControllers(viewControllers : Array.<ViewController>) : void {
		this._viewControllers = viewControllers.concat(); // clone
		this._tabBar = new TabBar(viewControllers.length);
	}

	function getTabBar() : TabBar {
		return this._tabBar;
	}

	function getTabBarItemAt(index : int) : TabBarItem {
		return this._tabBar.getItems()[index];
	}

	override function getElement() : web.HTMLElement {
		var element = super.getElement();
		element.appendChild(this._tabBar.getElement());
		return element;
	}
}


mixin Appearance {
	var _element : web.HTMLElement = null;

	function _toElement() : web.HTMLElement {
		var block = Util.createDiv();
		// TODO: common setting
		return block ;
	}

	function getElement() : web.HTMLElement {
		if (! this._element) {
			this._element = this._toElement();
		}
		return this._element;
	}
}

mixin View implements Responder, Appearance {
}

class Lable implements View {
	var _text : string;

	function constructor(text : string) {
		this._text = text;
	}

	override function _toElement() : web.HTMLElement {
		var element = Util.createSpan();
		element.appendChild(Util.createTextNode(this._text));
		return element;
	}
}

class TabBar implements View {
	var _items : Array.<TabBarItem>;

	var _height = 40;

	function constructor(length : int) {
		this._items = new Array.<TabBarItem>(length);
		for (var i = 0; i < length; ++i) {
			this._items[i] = new TabBarItem();
		}
	}

	function getItems() : Array.<TabBarItem> {
		return this._items;
	}

	override function _toElement() : web.HTMLElement {
		var element = Util.createDiv();
		element.style.border = "solid 1px gray";
		element.style.height = this._height as string + "px";

		var itemWidth = (Platform.getWidth() / this._items.length) as int;
		this._items.forEach( (item, i) -> {
			var itemElement = item.getElement();
			var style       = itemElement.style;
			style.position = "fixed";
			style.bottom   = "0px";
			style.left  = (i * itemWidth) as string + "px";
			style.width = itemWidth as string + "px";
			style.border = "solid 1px red"; // FIXME
			element.appendChild(itemElement);
		});
		return element;
	}
}

class BarItem implements Appearance {
	var _title = "";

	function setTitle(title : string) : void {
		this._title = title;
	}

	function onClick(cb : function(:MouseEvent):void) : void {
		var listener = function (e : web.Event) : void {
			cb(new MouseEvent(e));
		};
		this.getElement().addEventListener("click", listener);
	}

	override function _toElement() : web.HTMLElement {
		var element = Util.createSpan();
		element.style.textAlign = "center";

		var text = Util.createTextNode(this._title);
		element.appendChild(text);
		return element;
	}
}

class TabBarItem extends BarItem {

}

class NavigationBar implements View {

}

class ScrollVIew implements View {

}

mixin Control implements View {

}

class Button implements Control {

}

class TextField implements Control {

}


class Color {
	static const BLACK      = new Color(0x00, 0x00, 0x00);
	static const DARK_GRAY  = new Color(0x54, 0x54, 0x54);
	static const LIGHT_GRAY = new Color(0xa8, 0xa8, 0xa8);
	static const WHITE      = new Color(0xFF, 0xFF, 0xFF);
	static const GRAY       = new Color(0x7f, 0x7f, 0x7f);
	static const RED        = new Color(0xFF, 0x00, 0x00);
	static const GREEN      = new Color(0x00, 0xFF, 0x00);
	static const BLUE       = new Color(0x00, 0xFF, 0x00);

	static const LIGHT_TEXT = new Color(0x99, 0x99, 0x99);
	static const DARK_TEXT  = new Color(0x00, 0x00, 0x00);

	var _r : int;
	var _g : int;
	var _b : int;
	var _a : number;

	function constructor(r : int, g : int, b : int) {
		this(r, g, b, 1.0);
	}
	function constructor(r : int, g : int, b : int, a : number) {
		this._r = r;
		this._g = g;
		this._b = b;
		this._a = a;
	}

	function toStyle() : string {
		return "rgba(" + this._r + ", " + this._g + ", " + this._b + "," + this._a + ")";
	}

	override function toString() : string {
		return this.toStyle();
	}
}

class Font {
	// TODO
}

