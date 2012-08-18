/***
 * SmartKit core classes
 *
 */

import "js/web.jsx";

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

	function attach(rootElement : HTMLElement) : void {
		var children = rootElement.childNodes;
		for (var i = 0, l = children.length; i < l; ++i) {
			rootElement.removeChild(children[i]);
		}
		rootElement.appendChild(this.getElement());
	}


	function getElement() : HTMLElement {
		var element = dom.createElement("div");
		var style   = element.style;
		style.border = "solid 1px black";

		style.width   = (this._width  - 2) as string + "px";
		style.height  = (this._height - 2) as string + "px";
		style.margin  = "0px";
		style.padding = "0px";

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

		var textNode = dom.document.createTextNode(s);
		var style = dom.createElement("style");
		style.appendChild(textNode);

		dom.document.head.appendChild(style);
	}
}

class ViewController implements Responder {
	function getElement() : HTMLElement {
		var element = dom.createElement("div");
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

	override function getElement() : HTMLElement {
		var element = super.getElement();
		element.appendChild(this._tabBar.getElement());
		return element;
	}
}


mixin Appearance {
	var _element : HTMLElement = null;

	function _toElement() : HTMLElement {
		var block = dom.createElement("div");
		// TODO: common setting
		return block ;
	}

	function getElement() : HTMLElement {
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

	override function _toElement() : HTMLElement {
		var element = dom.createElement("span");
		element.appendChild(dom.document.createTextNode(this._text));
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

	override function _toElement() : HTMLElement {
		var element = dom.createElement("div");
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

	function onClick(cb : function () : void) : void {
		var listener = function (e : Event) : void {
			cb();
		};
		this.getElement().addEventListener("click", listener);
	}

	override function _toElement() : HTMLElement {
		var element = dom.createElement("span");
		element.style.textAlign = "center";

		var text = dom.document.createTextNode(this._title);
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

}

class Font {

}

