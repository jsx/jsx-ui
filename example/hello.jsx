import "../lib/ui/*.jsx" into ui;
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

		var top = new ui.TabBarController();
		top.setViewControllers([firstTab, secondTab] : ui.ViewController[]);

		this.setRootViewController(top);
	}
}

class FirstViewController extends ui.ViewController {
	function constructor() {
		this.setTabBarItem(new ui.TabBarItem("first"));
	}
}

class SecondViewController extends ui.ViewController {
	function constructor() {
		this.setTabBarItem(new ui.TabBarItem("second"));
	}
}
