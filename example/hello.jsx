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
		var top = new ui.ViewController();
		this.setRootViewController(top);

		var view = new ui.View();
		top.setView(view);

		view.addSubview(new ui.Label("first").toCenter());
		view.addSubview(new ui.Label("second").toCenter());
		view.addSubview(new ui.Label("third").toCenter());

		var t = new ui.TextField("John");
		view.addSubview(t);

		var b = new ui.Button("click me!", function (e) {
			dom.window.alert("my name is " + t.getValue());
		});
		view.addSubview(b);
	}
}

