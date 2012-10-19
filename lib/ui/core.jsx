/***
 * <p>JSX-UI API document.</p>
 * <p>This documents is written by Sho Nakatani (@laysakura).</p>
 *
 * <p>We improved the original JSX-UI in TechStuDIG 2012.</p>
 *
 * <p>See <a href="https://github.com/TechStuDIG2012d/plan-4-jsx/blob/master/doc/nakatani_View-DOM_sync.org">https://github.com/TechStuDIG2012d/plan-4-jsx/blob/master/doc/nakatani_View-DOM_sync.org</a> for the idea we based on while changing this library.</p>
 * <p>See also the comments of View class for the coding rules JSX-UI library should keep.</p>
 *
 * <p>We wrote documents only for some classes and functions which we changed during the internship.</p>
 */

import "js/web.jsx" into web;
import "timer.jsx";
import "./event.jsx";

class Platform {
  static function getWidth() : int {
    return web.dom.window.innerWidth;
  }

  static function getHeight() : int {
    return web.dom.window.innerHeight;
  }

  static const DEBUG = false;
}

class Util {
  static function format(fmt : string, list : variant[]) : string {
    return fmt.replace(/%\d+/g, (s) -> {
      var index = s.slice(1) as int - 1;
      return list[index] as string;
    });
  }

  static function format(fmt : string, list : int[]) : string {
    return Util.format(fmt, list as __noconvert__ variant[]);
  }
  static function format(fmt : string, list : number[]) : string {
    return Util.format(fmt, list as __noconvert__ variant[]);
  }
  static function format(fmt : string, list : string[]) : string {
    return Util.format(fmt, list as __noconvert__ variant[]);
  }

  static function createTextNode(s : string) : web.Node {
    return web.dom.document.createTextNode(s);
  }

  static function createElement(name : string) : web.HTMLElement {
    return web.dom.createElement(name);
  }

  static function createDiv() : web.HTMLElement {
    return Util.createElement("div");
  }

  // XXX: Mobile Safari (iOS 5.1) has no HTMLSpanElement
  static function createSpan() : web.HTMLElement {
    return Util.createElement("span");
  }

  // Not recommended.
  // Use only in Application._attach()
  static function replaceChildElements(element : web.HTMLElement, content: web.HTMLElement) : void {
    var children = element.childNodes;
    for (var i = 0, l = children.length; i < l; ++i) {
      element.removeChild(children[i]);
    }
    element.appendChild(content);
  }

  static function borderWithColor(color : Color) : string {
    return "solid 1px " + color.toString();
  }


  static function applyGradient(style : web.CSSStyleDeclaration, type : string, begin : string, end : string, fromColor : Color, toColor : Color) : void {
    // TODO: portability?
    var s = Util.format("-webkit-gradient(%1, %2, %3, from(%4), to(%5))",
        [type, begin, end, fromColor.toString(), toColor.toString()]);
    style.background = s;
  }
}

/* immutable */ class Point {
  var x : int;
  var y : int;

  function constructor(x : int, y : int) {
    this.x = x;
    this.y = y;
  }
}

/* immutable */ class Size {
  var width  : int;
  var height : int;

  function constructor(width : int, height : int) {
    this.width  = width;
    this.height = height;
  }
  function clone() : Size {
    return new Size(this.width, this.height);
  }
}

/* immutable */ class Rectangle {
  var origin : Point;
  var size : Size;

  function constructor(x : int, y : int, width : int, height : int) {
    this.origin = new Point(x, y);
    this.size   = new Size(width, height);
  }
}

mixin Responder {
  // TODO
}

class Application implements Responder {
  var _view : View;
  var _rootViewController : ViewController = null;

  function constructor() {
    this._view = new View();
    Application.resetStyles();
  }

  function setRootViewController(
    rootElement : web.HTMLElement,
    rootViewController : ViewController
  ) : void {
    this._rootViewController = rootViewController;
    this._attach(rootElement);
  }

  // TODO: remove
  function _attach(rootElement : web.HTMLElement) : void {
    Util.replaceChildElements(rootElement, this.getElement());
  }

  function getElement() : web.HTMLElement {
    var element = this._view.getElement();
    var style   = element.style;

    element.appendChild(this._rootViewController.getView().getElement());

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

/**
 * Super class for controllers.
 *
 * <em>TODO: Integrate common things in controllers.</em>
 */
class ViewController implements Responder {
  var _view : View;
  var _parentViewController : ViewController = null;

  var _tabBarItem : TabBarItem = null;

  function constructor() {
    this._view = new View();
  }
  function constructor(view : View) {
    this._view = view;
  }

  function getView() : View {
    return this._view;
  }

  function getTabBarItem() : TabBarItem {
    return this._tabBarItem;
  }

  function setTabBarItem(item : TabBarItem) : void {
    this._tabBarItem = item;
  }

  function getParentViewController() : ViewController {
    return this._parentViewController;
  }

  function setParentViewController(viewController : ViewController) : void {
    this._parentViewController = viewController;
  }

  function getTabBarController() : TabBarController {
    return this._parentViewController as TabBarController;
  }

}

/**
 * TODO: <em>ugly...</em>
 *
 * TabBarViewController will provide:
 * <ul>
 *   <li>A unique TabBarView inside it</li>
 *   <li>Way to register TabBarItems</li>
 * </ul>
 */
class TabBarController extends ViewController {
  var _viewControllers : Array.<ViewController>;
  var _selectedIndex : int = 0;
  var _tabBar : TabBar;
  var _width : number = Platform.getWidth();

  function constructor() {
    super(new View());
  }

  /**
   * @param viewControllers List of ViewController with TabBarItem inside
   */
  function setViewControllers(viewControllers : Array.<ViewController>) : void {
    this._viewControllers = viewControllers.concat(); // clone

    this._viewControllers.forEach((controller) -> {
      controller.setParentViewController(this);
      controller.getView().getElement().style.display = "none";
      this.getView().addSubview(controller.getView());
    });

    this._tabBar = new TabBar(this,this._viewControllers);
    this._tabBar.setWidth(this._width);

    this._view.addSubview(this._tabBar);

    this.setSelectedIndex(this._selectedIndex);
  }

  function setTabBarWidth(width : number) : void {
    this._width = width;
  }

  function getTabBar() : TabBar {
    return this._tabBar;
  }

  function getSelectedIndex() : int {
    return this._selectedIndex;
  }

  function getSelectedViewController() : ViewController {
    return this._viewControllers[this._selectedIndex];
  }

  function setSelectedIndex(index : int) : void {
    assert index >= 0;
    assert index < this._viewControllers.length;

    var cur = this._viewControllers[this._selectedIndex].getView();
    cur.getElement().style.display = "none";
    this._selectedIndex = index;
    var next = this._viewControllers[this._selectedIndex].getView();
    next.getElement().style.removeProperty("display");
    if (next._horizontalDisplay) next.setHorizontalDisplay(true);
  }
}


/**
 * Interface class for View and its sub classes.
 */
mixin Appearance {
  var _element : web.HTMLElement = null;

  /**
   * Function to generate structure.
   * See View for more description.
   */
  abstract function _toElement() : web.HTMLElement;

  /**
   * Function to generate default attribute.
   * See View for more description.
   */
  abstract function _setDefaultAttribute() : void;
  /**
   * Function to generate default style.
   * See View for more description.
   */
  abstract function _setDefaultStyle() : void;

  /**
   * Provides the only recommended way to translate View into HTMLElement.
   * Users MUST use this function to get HTMLElement.
   * This function instanciate View._element : HTMLElement (hidden from user)
   * when called first time.
   * It at the same time sets the default styles and attributes for the given View.
   *
   * @returns
   * HTMLElement corresponds to View. Default styles and attributes are set.
   */
  final function getElement() : web.HTMLElement {
    if (! this._element) {
      this._element = this._toElement();
      this._setDefaultAttribute();
      this._setDefaultStyle();
    }
    return this._element;
  }

}


/**
 * This class provides a simple view component.
 * Every other view must extend this class.
 *
 * Views construct tree structure.
 * It corresponds to DOM tree conceptually (although not completely symmetric).
 *
 * Each View or its subclass has the following 4 elements.
 * <ul>
 *   <li>(a) Structure</li>
 *   <li>(b) Styles</li>
 *   <li>(c) Attributes</li>
 *   <li>(d) Content</li>
 * </ul>
 * They have corresponding HTML elements.
 * <pre>
 * <a href="menu.html" style="background-color: #eee;">
 *   Menu
 * </a>
 * </pre>
 * In this example,
 * <ul>
 *   <li>(a) is img</li>
 *   <li>(b) is style="background-color: #eee;"</li>
 *   <li>(c) is href="menu.html"</li>
 *   <li>(d) is Menu</li>
 * </ul>
 *
 * Do note that (b), (c), (d) have dependency to (a).
 * In other words, Styles, Attributes, and Content must be created after its structure is created.
 *
 * In View and its subclasses, each element (a)-(d) should be delt with in the following manner basically.
 * <ul>
 *   <li>
 *     Structure: is created in _toElement(). Structure is soon reflected to DOM and never changed.
 *     So structure is not kept in any property in the class.
 *   </li>
 *   <li>
 *     Styles: can be changed by user. They should be kept in class as member variables.
 *     Styles can be got/set using getter/setter manner.
 *     The default styles for the View are defined in _setDefaultStyle().
 *     Subclasses of a View can inherit its parent's default style.
 *     Calling super._setDefaultStyle() at the last of _setDefaultStyle()
 *     will do that.
 *   </li>
 *   <li>
 *     Attributes: can be described almost the same as styles.
 *     Use _setDefaultAttribute() to define default attributes.
 *   </li>
 *   <li>
 *     Contents: can be described almost the same as styles.
 *     (But contents are not appropreately delt with in this libary version.)
 *   </li>
 * </ul>
 *
 * These rules for structure, styles, attributes, and contents should be hold as much as possible.
 *
 * <h4>Fluent Interface</h4>
 * View and its subclasses have fluent interface.
 *
 * All setter of styles and attributes returns `this', then users can set them like this:
 * <pre>
 *   view.addSubview(
 *     new ui.Label()
 *     .setText("Label Text")
 *     .setWidth(100)
 *     .setColor(ui.Color.RED)
 *   );
 * </pre>
 *
 * <em>Known Problem!!</em>: downcast is not supported so the order of setter called matters
 * to pass compilation.
 * See example/test005-fluent-interface-super-sub-order.jsx for more detail.
 */
class View implements Responder, Appearance {
  var _parent : View = null;
  var _subviews = new Array.<View>();

  //
  // Structures
  //
  override function _toElement() : web.HTMLElement {
    var block = Util.createDiv();
    return block;
  }
  //
  // END Structures
  //


  //
  // Attributes
  //
  override function _setDefaultAttribute() : void {}
  //
  // END Attributes
  //


  //
  // Styles
  //
  var _backgroundColor : Color;
  var _transparentBackground : boolean;
  var _color : Color;
  var _opacity : number;
  var _align : Align;
  var _width : string;
  var _height : string;
  var _margin : number;
  var _marginTop : number;
  var _padding : number;
  var _paddingTop : number;
  var _borderRadius : number;  // FIXME: too CSS specific?
  var _gradient : Gradient;
  var _horizontalDisplay : boolean;
  var _borderColor : Color;    // FIXME: too CSS specific?
  var _borderStyle : string;   // FIXME: too CSS specific?
  var _borderWidth : number;   // FIXME: too CSS specific?

  function getBackgroundColor() : Color {
    return this._backgroundColor;
  }
  function setBackgroundColor(color : Color) : View {
    this._backgroundColor = color;
    this.getElement().style.backgroundColor = this._backgroundColor.toHexStyle();
    return this;
  }

  function setTransparentBackground() : View {
    this._transparentBackground = true;
    this.getElement().style.removeProperty("background-image");
    this.getElement().style.backgroundColor = "transparent";
    return this;
  }

  function getColor() : Color {
    return this._color;
  }
  function setColor(color : Color) : View {
    this._color = color;
    this.getElement().style.color = this._color.toHexStyle();
    return this;
  }

  function getOpacity() : number {
    return this._opacity;
  }
  function setOpacity(opacity : number) : View {
    this._opacity = opacity;
    this.getElement().style.opacity = this._opacity as string;
    return this;
  }

  function getAlign() : Align {
    return this._align;
  }
  function setAlign(align : Align) : View {
    this._align = align;
    this.getElement().style.textAlign = this._align.toString();
    return this;
  }

  function getWidth() : string {
    return this._width;
  }
  function setWidth(width : number) : View {
    this._width = width as string + "px";
    this._setWidth();
    return this;
  }
  function setWidth(width : string) : View {
    this._width = width;
    this._setWidth();
    return this;
  }
  function _setWidth() : void {
    this.getElement().style.width = this._width;
  }

  function getHeight() : string {
    return this._height;
  }
  function setHeight(height : number) : View {
    this._height = height as string + "px";
    this._setHeight();
    return this;
  }
  function setHeight(height : string) : View {
    this._height = height;
    this._setHeight();
    return this;
  }
  function _setHeight() : void {
    this.getElement().style.height = this._height;
  }

  function getMargin() : number {
    return this._margin;
  }
  function setMargin(margin : number) : View {
    this._margin = margin;
    this.getElement().style.margin = this._margin as string + "px";
    return this;
  }

  function getMarginTop() : number {
    return this._marginTop;
  }
  function setMarginTop(marginTop : number) : View {
    this._marginTop = marginTop;
    this.getElement().style.marginTop = this._marginTop as string + "px";
    return this;
  }

  function getPadding() : number {
    return this._padding;
  }
  function setPadding(padding : number) : View {
    this._padding = padding;
    this.getElement().style.padding = this._padding as string + "px";
    return this;
  }

  function getPaddingTop() : number {
    return this._paddingTop;
  }
  function setPaddingTop(pl : number) : View {
    this._paddingTop = pl;
    this.getElement().style.paddingTop = this._paddingTop as string + "px";
    return this;
  }

  function getBorderRadius() : number {
    return this._borderRadius;
  }
  function setBorderRadius(borderRadius : number) : View {
    this._borderRadius = borderRadius;
    this.getElement().style.borderRadius = this._borderRadius as string + "px";
    return this;
  }

  function getGradient() : Gradient {
    return this._gradient;
  }
  /**
   * Apply gradation for a View background.
   * See Gradient for supported preset style.
   *
   * @param gradient Gradient object. Presets are available in Gradient class.
   */
  function setGradient(gradient : Gradient) : View {
    this._gradient = gradient;
    Util.applyGradient(this.getElement().style,
      gradient.type, gradient.begin.toString(), gradient.end.toString(),
      gradient.fromColor, gradient.toColor);
    return this;
  }

  function getHorizontalDisplay() : boolean {
    return this._horizontalDisplay;
  }
  /**
   * Set/unset the setting whether to put subviews of a View horizontally.
   *
   * @param horizontal
   */
  function setHorizontalDisplay(horizontal : boolean) : View {
    this._horizontalDisplay = horizontal;
    if (this._horizontalDisplay){
      this.getElement().style.display = "-webkit-box";
    }
    else {
      this.getElement().style.removeProperty("display");
    }
    return this;
  }

  function getBorderColor() : Color {
    return this._borderColor;
  }
  function setBorderColor(borderColor : Color) : View {
    this._borderColor = borderColor;
    this.getElement().style.borderColor = this._borderColor.toHexStyle();
    return this;
  }

  function getBorderStyle() : string {
    return this._borderStyle;
  }
  function setBorderStyle(borderStyle : string) : View {
    this._borderStyle = borderStyle;
    this.getElement().style.borderStyle = this._borderStyle;
    return this;
  }

  function getBorderWidth() : number {
    return this._borderWidth;
  }
  function setBorderWidth(borderWidth : number) : View {
    this._borderWidth = borderWidth;
    this.getElement().style.borderWidth = this._borderWidth as string + "px";
    return this;
  }

  override function _setDefaultStyle() : void {
    // If style is already set, no need for overwriting by default value
    if (!this._transparentBackground) this.setTransparentBackground();
    if (!this._color) this.setColor(Color.DARK_TEXT);
    if (!this._width) this.setWidth("auto");
    if (!this._height) this.setHeight("auto");
    if (!this._margin) this.setMargin(0);
    if (!this._padding) this.setPadding(0);
    if (!this._paddingTop) this.setPaddingTop(0);

    if (Platform.DEBUG) {
      // TODO: Support this.setBorder()
      this.getElement().style.border = Util.borderWithColor(Color.BLUE);
    }
  }
  //
  // END Styles
  //


  function getParent() : View {
    return this._parent;
  }

  function _popSubview(index : int) : void {
    this._subviews.pop()._parent = null;
  }

  /**
   * Function to add a subview to `this'.
   * Call this funtion for adding a view into DOM.
   *
   * DO NOT override this function in subclasses without special reason.
   * It is important in this library to keep strict relationship between View and DOM.
   *
   * @param child Subview of `this'.
   */
  function addSubview(child : View) : void {
    assert this != child;

    var parent = this;
    parent._subviews.push(child);
    child._parent = parent;
    parent.getElement().appendChild(child.getElement());
  }

  /**
   * Function to remove `this' from DOM.
   */
  final function removeMe() : void {
    var parent = this._parent;
    assert this._parent != null;  // TODO: is it really always necessary?
                                  // How about removing root View?
    var me = this;

    // Remove from DOM
    parent.getElement().removeChild(me.getElement());

    // Remove from JSX
    me._parent = null;
    var subviews = parent._subviews;
    for (var i = 0, l = subviews.length; i < l; ++i) {
      if (subviews[i] == me)
        subviews.splice(i, 1);
    }
  }

  function onClick(cb : function(:MouseEvent):void) : void {
    var listener = function (e : web.Event) : void {
      cb(new MouseEvent(e));
    };
    this.getElement().addEventListener("click", listener);
  }


  // Controlls the viwwa and subviews

  function show() : void {
    this.getElement().style.display = "defaulut";
  }
  function hide() : void {
    this.getElement().style.display = "none";
  }

  function bringSubviewToFront(subview : View) : void {
    var style = subview.getElement().style;
    style.zIndex = ((style.zIndex as int) + 1) as string;
  }
  function sendSubviewToBack(subview : View) : void {
    var style = subview.getElement().style;
    style.zIndex = ((style.zIndex as int) - 1) as string;
  }
}

/**
 * @see TabBarItem
 */
class TabBar extends View {
  var _controllers : Array.<ViewController>;
  var _tabBarController : TabBarController;
  var _bottom : Nullable.<string> = null;
  var _position  : Nullable.<string> = null;

  function constructor(tabBarController : TabBarController,controllers : Array.<ViewController>) {
    this._controllers = controllers;
    this._tabBarController = tabBarController;
  }

  //
  // Structures
  //
  override function _toElement() : web.HTMLElement {
    var element = super._toElement();
    var style   = element.style;

    this._controllers.forEach( (controller, i) -> {
      var item        = controller.getTabBarItem();
      var itemElement = item.getElement();

      if (Platform.DEBUG) {
        style.border = Util.borderWithColor(Color.RED);
      }

      element.appendChild(itemElement);
    });
    return element;
  }
  //
  // END Structures
  //


  //
  // Attributes
  //
  override function _setDefaultAttribute() : void {
  }
  //
  // END Attributes
  //


  //
  // Styles
  //
  override function _setDefaultStyle() : void {
    var element = this.getElement();
    if (!this._height)   this.setHeight(this._height);
    if (!this._width)    this.setWidth("100%");
    if (!this._position) element.style.position = "fixed";  // TODO: add setter
    if (!this._bottom)   element.style.bottom   = "0px";    // TODO: add setter

    //var itemWidth = (Platform.getWidth() / this._controllers.length) as int;
    var itemWidth = (Number.parseInt(this.getWidth()) / this._controllers.length) as int;
    this._controllers.forEach( (controller, i) -> {
      var item        = controller.getTabBarItem();
      item.setLeft(i * itemWidth);
      item.setWidth(itemWidth);
      var itemElement = item.getElement();

      // TODO:
      // Seperate from _setDefaultStyle()
      itemElement.addEventListener("click", (e) -> {
        this._tabBarController.setSelectedIndex(i);
        });
    });

    // Default style does harm to me
    // super._setDefaultStyle();
  }
  //
  // END Styles
  //
}

class BarItem extends View {
  var _title = "";
  var _controller : ViewController = null;

  function constructor(title : string) {
    this._title = title;
  }

  //
  // Structures
  //
  override function _toElement() : web.HTMLElement {
    var element = Util.createSpan();
    element.style.textAlign = "center";

    var text = Util.createTextNode(this._title);
    element.appendChild(text);
    return element;
  }
  //
  // END Structures
  //


  //
  // Attributes
  //
  override function _setDefaultAttribute() : void {
  }
  //
  // END Attributes
  //


  //
  // Styles
  //
  override function _setDefaultStyle() : void {
    this.getElement().style.textAlign = "center";
    //super._setDefaultStyle();
  }
  //
  // END Styles
  //


  function setTitle(title : string) : void {
    this._title = title;
  }

  function setController(controller : ViewController) : void {
    this._controller = controller;
  }

  function getController(controller : ViewController) : ViewController {
    return this._controller;
  }
}

/**
 * View used as buttons in TabBar.
 */
class TabBarItem extends BarItem {
  var _id : number = 0;
  var _left : number = 0;
  var _imageUrl : Nullable.<string> = null;
  function constructor(title : string) {
    super(title);
    this.setHeight(70);
  }

  function constructor(title : string, url : string) {
    super(title);
    this.setImageUrl(new Image(url));
    this.setHeight(70);
  }

  function setImageUrl(img : Image) : void {
    this._imageUrl = img.getUrl();
    var imgView = new ImageView(img);
    // TODO: check if supporting any size of image
    imgView.setWidth(40);
    imgView.setHeight(40);
    imgView.setBorderRadius(8);
    this.addSubview(imgView);
  }
  //
  // Structures
  //
  override function _toElement() : web.HTMLElement {
    var element = super._toElement();

    return element;
  }
  //
  // END Structurs
  //


  //
  // Styles
  //
  override function _setDefaultStyle() : void {
    if (!this._backgroundColor) this.setBackgroundColor(new Color(0xEE, 0xEE, 0xEE));
    if (!this._height) this.setHeight(this._height);
    if (!this._gradient) this.setBackgroundColor(Color.WHITE);
    if (!this._borderRadius) this.setBorderRadius(8);

    // TODO: add setters for them.
    var style = this.getElement().style;
    style.left     = this._left as string + "px";
    style.position = "fixed";
    style.bottom   = "0px";
    style.cursor   = "pointer";

    super._setDefaultStyle();
  }
  //
  // END Styles
  //

  function setId(id : number) : void {
    this._id = id;
  }

  function setLeft(left : number) : View {
    var element = this.getElement();
    this._left = left;
    element.style.left = (this._left) as string + "px";

    return this;
  }
}

class NavigationBar extends View {

}


class SideBarView extends TableView
{

  function constructor (type : string) {
    super(type);
    this.addSection("Side Menu");
  }

  function addMenu(name : string) : void{
    var tableViewCell = new TableViewCell();
    tableViewCell.addSubview(new Label().setText(name)
                                        .setGradient(Gradient.RESET)
                                        .setBorderStyle("inset"));
    this.appendCell(tableViewCell,0);
  }

}

class SideBarViewController extends ScrollViewController {

  var _mainView : View;
  var _sideView : SideBarView;

  function constructor( displaySize : Size, mainView : View){
    super(displaySize);
    this._mainView = mainView;
    this._sideView = new SideBarView("simple");

    this.getView().addSubview(this._sideView);
    this.getView().addSubview(this._mainView);
    this.setDisplayedView(1);
  }

  function addSideMenu(name : string) : void
  {
    this._sideView.addMenu(name);
  }

  function setHandler( index : number ,fn : function(e : web.Event) : void) : void{
    this._sideView.setHandler(0,index,fn,"click");
  }

  function displaySideBar() : void{
    this.setPreviousViewDisplayed();
  }

  function displayMainView() : void{
    this.setNextViewDisplayed();
  }
}

/**
 * TODO: <em>ugly...</em>
 *
 * ScrollViewController will provide:
 * <ul>
 *   <li>A unique ScrollView inside it</li>
 *   <li>Interfaces to set scroll animation style</li>
 * </ul>
 */
class ScrollViewController extends ViewController {

  var _curId = 0;
  var _start_x : number = 0;
  var _start_y : number = 0;
  var _end_x : number = 0;
  var _end_y : number = 0;
  var sec : string = "0.5s";
  var _next : Nullable.<web.HTMLElement>;
  var _cur  : Nullable.<web.HTMLElement>;

  // User Custom Parameter
  var _threashold : number = 40;
  var msec : number = 500;

  function constructor(displaySize : Size){
    this._view = new ScrollView(displaySize);
    this._cur = null;
    this._next = null;
    this.setEventListener();
  }

  //
  // Scroll Parameter
  //

  /**
   * @param msec Slide animation speed
   * @return `this' (Supports fluent interface)
   */
  function setAnimationTime(msec : number) : ScrollViewController {
    this.msec = msec;
    this.sec  = ((msec/1000) as string) + "s";
    return this;
  }

  /**
   * @param diffPx Scroll to next column if scrolled larger than diffPx pixels.
   * @return `this' (Supports fluent interface)
   */
  function setTouchThreshold(diffPx : number) : ScrollViewController {
    this._threashold = diffPx;
    return this;
  }

  //
  // Display Control.
  //

  /**
   * Hide all columns
   */
  function clearDisplay() : void {
    var view = this.getView();
    for(var i = 0 ; i < view._subviews.length;i++){
      view._subviews[i].getElement().style.display = "none";
    }
  }

  /**
   * @param id View to display
   */
  function setDisplayedView (id : number) : void {
    this.clearDisplay();
    this._setDisplayedView(id);
    this._curId = id;
  }

  function _setDisplayedView (id : number) : void {
    var view = this.getView();
    view._subviews[id].getElement().style.removeProperty("display");
  }

  // TODO
  function setPreviousViewDisplayed() : void {
    var view = this.getView();
    var id = this._curId;

    if (id > 0  && view._subviews.length > 0) {
      var curElem  = view._subviews[id].getElement();
      var nextElem = view._subviews[id-1].getElement();
      this.clearDisplay();
      this._setDisplayedView(id);
      this._setDisplayedView(id-1);
      this._scrollRight(nextElem,curElem);
      this._curId -= 1;
    }
  }

  function setNextViewDisplayed() : void {
    var view = this.getView();
    var id = this._curId;

    if (id < this.getView()._subviews.length-1 && view._subviews.length > 0){
      var curElem  = view._subviews[id].getElement();
      var nextElem = view._subviews[id+1].getElement();

      this.clearDisplay();
      this._setDisplayedView(id);
      this._setDisplayedView(id+1);
      this._scrollLeft(nextElem,curElem);
      this._curId += 1;
    }
  }

  //
  // Helper functions for scroll animation.
  //
  function _setNext(element : web.HTMLElement) : void{
    this._next = element;
  }
  function _setCurrent(element : web.HTMLElement) : void{
    this._cur = element;
  }

  function _setOriginScrollRight() : void{
    this._cur.style.webkitTransition  = "all 0s linear";
    this._next.style.webkitTransition = "all 0s linear";
    //this._cur.style.webkitTransform   = "translateX(" + ((-Platform.getWidth() ) as string) +"px)";
    //this._next.style.webkitTransform  = "translateX(" + ((-Platform.getWidth() ) as string) +"px)";
    this._cur.style.webkitTransform   = "translateX(" + ((-320) as string) +"px)";
    this._next.style.webkitTransform  = "translateX(" + ((-320) as string) +"px)";
  }


  function _slide(moveX : number) : void {
    this._next.style.webkitTransition = "all " + this.sec + " linear";
    this._cur.style.webkitTransition  = "all " + this.sec + " linear";
    this._next.style.webkitTransform  = "translateX("+ (moveX ) as string +"px)";
    this._cur.style.webkitTransform   = "translateX("+ (moveX )as string +"px)";
  }

  function _hide() : void {
    this._next.style.webkitTransition = "all 0s linear";
    this._next.style.webkitTransform  = "translateX(0px)";
    this._cur.style.webkitTransition = "all 0s linear";
    this._cur.style.webkitTransform  = "translateX(0px)";
    this._cur.style.display = "none";
  }

  function _scrollLeft(next : web.HTMLElement, cur : web.HTMLElement) : void {
    this._setNext(next);
    this._setCurrent(cur);
    Timer.setTimeout(()-> {this._scrollLeft2();},0);
  }

  function _scrollLeft2() : void {
    //this._slide(-Platform.getWidth());
    this._slide(-320);
    Timer.setTimeout(()-> {this._scrollLeft3();},this.msec);
  }

  function _scrollLeft3() : void {
    this._hide();
  }

  function _scrollRight(next : web.HTMLElement, cur : web.HTMLElement) : void {
    this._setNext(next);
    this._setCurrent(cur);
    this._setOriginScrollRight();
    Timer.setTimeout(()-> {this._scrollRight2();},0);
  }

  function _scrollRight2() : void {
    this._slide(0);
    Timer.setTimeout(()-> {this._scrollRight3();},this.msec);
  }

  function _scrollRight3() : void {
    this._hide();
  }

  function setEventListener() : void {
    var topElement = this.getView().getElement();
    //log "setEventListener";

    topElement.addEventListener("touchstart",function(e) {
        this._start_x = (e as web.TouchEvent).touches[0].pageX;
        this._start_y = (e as web.TouchEvent).touches[0].pageY;
    },false);
    topElement.addEventListener("mousedown",function(e) {
        var x = (e as web.MouseEvent).clientX;
        log x;
        this._start_x = (e as web.MouseEvent).clientX;
        this._start_y = (e as web.MouseEvent).clientY;
    },false);

    topElement.addEventListener("touchmove",function(e) {
         this._end_x = (e as web.TouchEvent).touches[0].pageX;
         this._end_y = (e as web.TouchEvent).touches[0].pageY;
         },false);

    topElement.addEventListener("touchend",function(e) {
        if( Math.abs(this._end_y - this._start_y) < 80 ){
          var diff = this._end_x - this._start_x;
          if (diff > this._threashold) {
             if (this._curId > 0) {
               this.setPreviousViewDisplayed();
             }
          }
          else if (diff < -this._threashold){
            if (this._curId < this.getView()._subviews.length-1) {
              this.setNextViewDisplayed();
            }
          }
        }
    },false);

  topElement.addEventListener("mouseup",function(e) {
      this._end_x = (e as web.MouseEvent).clientX;
      this._end_y = (e as web.MouseEvent).clientY;

        if( Math.abs(this._end_y - this._start_y) < 80 ){
          var diff = this._end_x - this._start_x;
          if (diff > this._threashold) {
             if (this._curId > 0) {
               this.setPreviousViewDisplayed();
             }
          }
          else if (diff < -this._threashold){
            if (this._curId < this.getView()._subviews.length-1) {
              this.setNextViewDisplayed();
            }
          }
        }
    },false);

  }

}


/**
 * TODO: Now ScrollView only supports horizontal scroll
 * per display width.
 * Needs "pagingEnabled" like functionality in UIScrollView
 *
 * Not assumed to be used by user.
 * Use ScrollViewController.
 */
class ScrollView extends View {

  //delete function constructor() {}
  function constructor(){ }

  var _displaySize : Size;  // TODO: Unnecessary if core.jsx knows display size correctly...
  function constructor(displaySize : Size) {
    this._displaySize = displaySize;
  }


  override function _setDefaultStyle() : void {
    this.setWidth(this._displaySize.width);
    this.setHorizontalDisplay(true);
  }

  override function _toElement() : web.HTMLElement {
    return super._toElement();  // <div>
  }
  //
  // END Structures
  //


  /**
   *
   * Hook View.addSubview() to insert internal `frame' view.
   * Internal frame has the same size as the display.
   *
   * Parent-child relationship:
   *   ScrollView --- frame -- child
   *               |- frame -- child
   *               |- frame -- child
   */
  override function addSubview(child : View) : void {
    var frame = new View();
    frame.setWidth(this._displaySize.width)
         .setHeight(this._displaySize.height);
    frame.addSubview(child);
    super.addSubview(frame);
  }
}

class Control extends View {

}

/**
 * Label object.
 * This class provides way to display fixed texts.
 */
class Label extends View {
  //
  // Structures
  //
  var _textNode : web.Node = Util.createTextNode("");

  override function _toElement() : web.HTMLElement {
    var element = super._toElement(); // <div>
    element.appendChild(this._textNode);
    return element;
  }
  //
  // END Structures
  //


  //
  // Attributes
  //
  var _text : string;

  function getText() : string {
    return this._text;
  }
  /**
   * Function to set/update text to display.
   */
  function setText(text : string) : Label {
    this._text = text;
    this.getElement().removeChild(this._textNode);
    this._textNode = Util.createTextNode(this._text);
    this.getElement().appendChild(this._textNode);
    return this;
  }

  override function _setDefaultAttribute() : void {
    if (!this._text) this.setText("Label");
  }
  //
  // END Attributes
  //


  //
  // Styles
  //
  var _fontSize  : string;
  var _textAlign : string;

  /**
   * TODO: Create and use Font class
   */
  function setFontSize(size : string) : Label {
    this._fontSize = size;
    this._element.style.fontSize = this._fontSize;
    return this;
  }
  function setTextAlign(align : string) : Label {
    this._textAlign = align;
    this._element.style.textAlign = this._textAlign;
    return this;
  }

  override function _setDefaultStyle() : void {
    if (!this._backgroundColor) this.setBackgroundColor(Color.WHITE);
    if (!this._color) this.setColor(Color.DARK_TEXT);
    if (!this._align) this.setAlign(Align.CENTER);
    if (!this._margin) this.setMargin(2);
    if (!this._padding) this.setPadding(5);
    if (!this._borderRadius) this.setBorderRadius(8);
    if (!this._gradient) this.setGradient(Gradient.SILVER);

    if (!this._fontSize) this.setFontSize("20px");
    if (!this._textAlign) this.setTextAlign("center");

    super._setDefaultStyle();
  }
  //
  // END Styles
  //
}

/**
 * Button object.
 */
class Button extends Control {
  //
  // Structures
  //
  override function _toElement() : web.HTMLElement {
    var node : web.HTMLInputElement =
    web.dom.document.createElement("input") as web.HTMLInputElement;
    return node;
  }
  //
  // END Structures
  //


  //
  // Attributes
  //
  var _label : string;
  var _handler : function(: web.Event) : void;

  function getLabel() : string {
    return this._label;
  }
  function setLabel(label : string) : Button {
    this._label = label;
    var element : web.HTMLInputElement = this.getElement() as web.HTMLInputElement;
    element.value = this._label;
    return this;
  }

  function getHandler() : function (: web.Event) : void {
    return this._handler;
  }
  /**
   * Function to set `onclick' event listner.
   */
  function setHandler(handler : function (: web.Event) : void) : Button {
    this._handler = handler;
    var element : web.HTMLInputElement = this.getElement() as web.HTMLInputElement;
    element.onclick = this._handler;
    return this;
  }

  override function _setDefaultAttribute() : void {
    var element : web.HTMLInputElement = this.getElement() as web.HTMLInputElement;
    element.type = "button";
    if (!this._label) this.setLabel("Button");
    if (!this._handler) this.setHandler(null);
  }
  //
  // END Attributes
  //


  //
  // Styles
  //
  override function _setDefaultStyle() : void {
    this.setWidth("100%");
  }
  //
  // END Styles
  //
}

class TextField extends Control {

  // FIXME KAZUHO circular reference
  var _fontSize : Nullable.<string>;
  var _inputType : Nullable.<string>;

  //
  // Attributes
  //
  var _type : string;

  /**
   * @return Value in the TextField.
   */
  function getValue() : string {
    var element = this.getElement() as web.HTMLInputElement;
    return element.value;
  }
  /**
   * Set a text into TextField.
   */
  function setValue(text : string) : TextField {
    var element = this.getElement() as web.HTMLInputElement;
    element.value = text;
    return this;
  }

  function getType() : string {
    return this._type;
  }
  /**
   * Set the type of TextField.
   *
   * @param type Supported types are: "search", ... (TODO: write it)
   */
  function setType(type : string) : TextField {
    this._type = type;
    var element = this.getElement() as web.HTMLInputElement;
    element.type = this._type;
    return this;
  }
  //
  // END Attributes
  //


  //
  // Styles
  //
  function setFontSize(size : string) : TextField {
    this._fontSize = size;
    this.getElement().style.fontSize = this._fontSize;
    return this;
  }

  override function _setDefaultStyle() : void {
    if (!this._fontSize) this.setFontSize("20px");
    if (!this._width)    this.setWidth("100%");
    super._setDefaultStyle();
  }
  //
  // END Styles
  //


  //
  // Strcutures
  //
  override function _toElement() : web.HTMLElement {
    var element = web.dom.document.createElement("INPUT") as web.HTMLInputElement;
    return element;
  }
  //
  // END Structures
  //

}

/**
 * Image object.
 * This is used as the contents of ImageView.
 */
class Image {
  var _url : string;
  var _width : number;
  var _height : number;

  function constructor(url : string) {
    this._url = url;
  }
  function constructor(url : string, width : number, height : number) {
    this._url = url;
    this._width = width;
    this._height = height;
  }

  function getUrl() : string {
    return this._url;
  }
  function getWidth() : number {
    return this._width;
  }
  function getHeight() : number {
    return this._height;
  }
}

/**
 * View to show Image.
 */
class ImageView extends View {

  delete function constructor() {}

  /**
   * @param image Image object.
   */
  function constructor(image : Image) {
    this._image = image;
  }

  //
  // Structures
  //
  override function _toElement() : web.HTMLElement {
    var element = Util.createElement("img") as web.HTMLImageElement;
    return element;
  }
  //
  // END Structures
  //


  //
  // Attributes
  //
  var _image : Image;

  override function _setDefaultAttribute() : void {
    var element : web.HTMLImageElement = this.getElement() as web.HTMLImageElement;
    element.src = this._image.getUrl();

    var width = this._image.getWidth();
    if (width) element.width = this._image.getWidth();
    var height = this._image.getHeight();
    if (height) element.height = this._image.getHeight();
  }
  //
  // Attributes END
  //


  //
  // Styles
  //
  override function _setDefaultStyle() : void {
    this.setBorderStyle("inset");
  }
  //
  // END Styles
  //
}


/**
 * TODO: <em>Not fully implemented yet...</em>
 *
 * TableViewController will provide:
 * <ul>
 *   <li>A unique TableView inside it</li>
 *   <li>Interfaces of event handlers in common with every TableView</li>
 *   <li>Interfaces to set TableView style</li>
 * </ul>
 *
 * It will NOT provide UITableViewDataSource like property.
 * Data are inside the unique TableView.
 */
class TableViewController extends ViewController {
  var _tableView : TableView;  // The TableView. This property is hidden from user.

  /**
   * TODO:
   * These functions should be abstruct.
   * ViewController have to be interface.
   *
   * Event handlers users must implement.
   *
   */
  function accessoryButtonTappedForRowWithIndexPath() : void {}

  // TODO: Add other functions.
  // Currently this class interface is refers to:
  // http://iphone-tora.sakura.ne.jp/uitableview.html
}

/**
 * TODO:
 * TableViewCell specific things?
 */
class TableViewCell extends View {
}

/**
 * TableView has the following view:
 *
 * <pre>
 *  |-------------------------|
 *  | Section#0 title (row#0) |
 *  | Section#0 row#1         |
 *  | Section#0 row#2         |
 *  | Section#0 row#3         |
 *  |-------------------------|
 *  | Section#1 title (row#0) |
 *  | Section#1 row#1         |
 *  | Section#1 row#2         |
 *  |-------------------------|
 * </pre>
 *
 * Each row has a TableViewCell.
 *
 * NOTE:
 * TableView can be used directly by user
 * or via TableViewController.
 */
class TableView extends View {
  //
  // Structures
  //
  var _headerView : View = null;
  // var _footerView : View = null;  // TODO

  delete function constructor() {}

  function constructor(initWithStyle : string) {  // TODO: enumerate?
    this(null, initWithStyle);
  }
  function constructor(headerView : View, initWithStyle : string) {
    this._headerView = headerView;
    this._initWithStyle = initWithStyle;
  }


   // TODO:
   // function constructor(headerView : View, footerView : View) {
   //   this._headerView = headerView;
   //   this._footerView = footerView;
   // }

  /**
   * _sections[i] means section#i.
   * _sections[i][j] means row#j in section#i.
   * i is 0-origin but j is 1-origin.
   *
   * _sections[i][0] means the title of section#i.
   *
   * If _sections == null, it means there is no section in this TableView.
   * If _sections[i].length == 1, it means section#i has only the title (without any row).
   */
  var _sections : Array.<Array.<TableViewCell> > = null;

  /** TODO:
   * - Whether TableView should have sections is controversial...
   *   IMHO, each TableViewCell has data difficult to separate from View
   *   (e.g. <tag  attribute=??  style="???" > DATA </tag>)
   *   So having Array.<TableViewCell> as a list of data & View of 1 section
   *   is not so unreasonable.
   *   Then, it is natural to having an Array of Array.<TableViewCell> as a section list.
   *
   * - Ugly to have functions to handle _sections (e.g. addSection()) inside this class?
   */

  /**
   * <em>DO NOT USE addSubview() for TableView!!</em>
   *
   * Prohibit addSubview() (use addCellBefore() and appendCell() instead)
   * TODO: delete function support for not only constructor?
   */
  override function addSubview(_DO_NOT_CALL_ : View): void {
    assert false;
  }

  /**
   * Function to add a section to TableView.
   *
   * TODO: Footer View support
   */
  function addSection(sectionTitle : string) : void {
    var titleCell = new TableViewCell();
    var titleLabel = new Label().setText(sectionTitle);
    titleCell.addSubview(titleLabel);
    this._setSectionTitleStyle(titleLabel);
    super.addSubview(titleCell);  // Without footer, new section title always
                                  // comes at the last element of `this'.
                                  // Even with it it's easy to insert titleCell
                                  // just before the footer (TODO).

    if (!this._sections) this._sections = [[titleCell]];
    else this._sections.push([titleCell]);
  }
  /**
   * Function to add a row to a section.
   */
  function addRow(sectionId : number) : void {
    this._sections[sectionId] = null;
  }

  /**
   * Insert cell just before row#rowId in section#sectionId.
   * row#j (j >= rowId) will move to row#(j+1) by this operation.
   *
   * TODO: update this._subview
   */
  function insertCellBefore(cell : TableViewCell, sectionId : number, rowId : number) : void {
    var sections = this._sections;
    assert sectionId < sections.length;
    var section = sections[sectionId];
    assert section[rowId];
    assert rowId > 0;  // rowId == 0 means section title

    section.splice(rowId, 0, cell);  // Insert cell between section[rowId-1] and section[rowId].

    // Change DOM
    this.getElement().insertBefore(cell.getElement(), section[rowId+1].getElement());

    // Change View tree
    cell._parent = this;
    // TODO: update this._subviews!
  }
  /**
   * Append cell at the last row in section#sectionId.
   *
   * TODO: update this._subview
   */
  function appendCell(cell : TableViewCell, sectionId : number) : void {
    var sections = this._sections;
    assert sectionId < sections.length;
    var section = sections[sectionId];

    section.push(cell);

    // Change DOM
    if (sectionId == sections.length - 1) {
      // Add `cell' as the last child of `this'.
      this.getElement().appendChild(cell.getElement());
    }
    else {
      // Add `cell' as just before the title of section#(sectionId+1).
      this.getElement().insertBefore(cell.getElement(), sections[sectionId+1][0].getElement());
    }

    // Change View tree
    cell._parent = this;
    // TODO: update this._subviews!
  }

  override function _toElement() : web.HTMLElement {
    var element = Util.createDiv();

    if (this._headerView) {
      element.appendChild(this._headerView._toElement());
    }
    // TODO: Footer

    return element;
  }
  //
  // END Structures
  //


  //
  // Attributes
  //
  override function _setDefaultAttribute() : void {
  }
  //
  // END Attributes
  //


  //
  // Styles
  //
  var _initWithStyle : string;  // TODO: enumerate?

  function _setSectionTitleStyle(titleLabel : Label) : void {
    // TODO:
    // More style
    if (this._initWithStyle == "simple") {
      titleLabel.setAlign(Align.LEFT)
                .setMargin(0)
                .setPadding(0)
                .setBorderRadius(0)
                .setGradient(Gradient.RESET)
                .setTransparentBackground()
      ;
    }
    else assert false;
  }

  override function _setDefaultStyle() : void {
  }
  //
  // END Styles
  //

  /**
   * Set event listener on the cell at (section#sectionId, row#rowId).
   */
  function setHandler(sectionId : number , rowId : number ,
                      fn : function(e : web.Event) : void,
                      type : string) : void
  {
    var section = this._sections[sectionId];
    section[rowId].getElement().addEventListener(type, fn, false);
  }

}


/* immutable */ class Color {
  static const BLACK      = new Color(0x00, 0x00, 0x00);
  static const DARK_GRAY  = new Color(0x54, 0x54, 0x54);
  static const LIGHT_GRAY = new Color(0xa8, 0xa8, 0xa8);
  static const WHITE      = new Color(0xFF, 0xFF, 0xFF);
  static const GRAY       = new Color(0x7f, 0x7f, 0x7f);
  static const RED        = new Color(0xFF, 0x00, 0x00);
  static const GREEN      = new Color(0x00, 0xFF, 0x00);
  static const BLUE       = new Color(0x00, 0x00, 0xFF);

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

  function toRGBAStyle() : string {
    return "rgba("
      + this._r as string + ", "
      + this._g as string + ", "
      + this._b as string + ", "
      + this._a as string + ")";
  }


  function _hex02(c : int) : string {
    var s = c.toString(16);
    return s.length > 1 ? s : "0" + s;
  }

  function toHexStyle() : string {
    return "#"
      + this._hex02(this._r)
      + this._hex02(this._g)
      + this._hex02(this._b);
  }

  override function toString() : string {
    return this.toRGBAStyle();
  }
}

/**
 * Used for setting `align' style.
 *
 * Available preset:
 * <ul>
 *   <li>Align.LEFT</li>
 *   <li>Align.CENTER</li>
 *   <li>Align.RIGHT</li>
 * </ul>
 */
/* immutable */ class Align {
  static const LEFT   = new Align("left");
  static const CENTER = new Align("center");
  static const RIGHT  = new Align("right");

  var _align : string;

  function constructor(align : Nullable.<string>) {
    assert align == "left" || align == "center" || align == "right"
        || align == null;
    this._align = align;
  }

  override function toString() : Nullable.<string> {
    return this._align;
  }
}

/**
 * Used for describe arbitrary direction.
 *
 * Available preset:
 * <ul>
 *   <li>Direction.LEFT_TOP</li>
 *   <li>Direction.LEFT_BOTTOM</li>
 * </ul>
 */
/* immutable */ class Direction {
  // TODO: Add all direction
  static const LEFT_TOP   = new Direction("left top");
  static const LEFT_BOTTOM = new Direction("left bottom");

  var _direction : string;

  function constructor(direction : Nullable.<string>) {
    assert direction == "left top" || direction == "left bottom"
        || direction == null;
    this._direction = direction;
  }

  override function toString() : Nullable.<string> {
    return this._direction;
  }
}

/**
 * Used for setting gradation style.
 *
 * Available preset:
 * <ul>
 *   <li>Gradient.SILVER</li>
 *   <li>Gradient.RESET</li>
 * </ul>
 */
/* immutable */ class Gradient {
  // TODO: add more beautiful gradients!
  static const SILVER = new Gradient(Direction.LEFT_TOP, Direction.LEFT_BOTTOM,
                                     Color.WHITE, Color.LIGHT_GRAY);
  static const DARK   = new Gradient(Direction.LEFT_TOP, Direction.LEFT_BOTTOM,
                                     Color.BLACK, Color.DARK_GRAY);
  static const RESET  = new Gradient(Direction.LEFT_TOP, Direction.LEFT_BOTTOM,
                                     Color.WHITE, Color.WHITE);

  var type : string = "linear";  // TODO: support more types
  var begin : Direction;
  var end : Direction;
  var fromColor : Color;
  var toColor : Color;

  delete function constructor() {}

  function constructor(begin : Direction, end : Direction,
                       fromColor : Color, toColor : Color)
  {
    this.begin = begin;
    this.end = end;
    this.fromColor = fromColor;
    this.toColor = toColor;
  }
}

class Font {
  // TODO
}

/*
   vim: set expandtab:
   vim: set tabstop=2:
   vim: set shiftwidth=2:
 */
