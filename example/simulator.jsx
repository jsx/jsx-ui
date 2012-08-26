import "js/web.jsx";

class _Main {
	static function main(args : string[]) : void {
		var input  = dom.id("address-bar") as HTMLInputElement;
		var screen = dom.id("screen") as HTMLIFrameElement;

		dom.id("main-form").addEventListener("submit", (e) -> {
			log "simulator: loading " + input.value;

			e.preventDefault();
			e.stopPropagation();

			screen.src = input.value;
		});
	}
}
