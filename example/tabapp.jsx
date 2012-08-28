import "../lib/ui/*.jsx" into ui;
import "js/web.jsx";
import "console.jsx";

class _Main {
	static function main(args : string[]) : void {
		console.time("application loading");

		var app = new MyApp();
		app.attach(dom.id("world"));

		console.timeEnd("application loading");
	}
}

class MyApp extends ui.Application {
	function constructor() {
		var top = new ui.TabBarController();

		var firstTab  = new FirstViewController();
		var secondTab = new SecondViewController();

		top.setViewControllers([firstTab, secondTab] : ui.ViewController[]);

		this.setRootViewController(top);
	}
}

class FirstViewController extends ui.ViewController {
	function constructor() {
		this.setTabBarItem(new ui.TabBarItem("first"));

		var view = new ui.View();
		view.setBackgroundColor(ui.Color.GREEN);
		this.setView(view);
	}
}

class SecondViewController extends ui.ViewController {
	function constructor() {
		this.setTabBarItem(new ui.TabBarItem("second"));

		var view = new ui.View();
		view.setBackgroundColor(ui.Color.BLUE);
		this.setView(view);
	}
}
