import "ui/*.jsx" into ui;
import "js/web.jsx";

class _Main {
	static function main(args : string[]) : void {
		log "start";

		var app = new MyApp();
		app.attach(dom.id("world"));
	}
}

class MyApp extends ui.Application {
	function constructor() {
		var firstTab  = new FirstViewController();
		var secondTab = new SecondViewController();

		var tabs = new ui.TabBarController();
		tabs.setViewControllers([firstTab, secondTab] : ui.ViewController[]);

		tabs.getTabBarItemAt(0).setTitle("first");
		tabs.getTabBarItemAt(1).setTitle("second");

		this.setRootViewController(tabs);
	}
}

class FirstViewController extends ui.ViewController {

}

class SecondViewController extends ui.ViewController {


}
