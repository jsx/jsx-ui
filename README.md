Concepts
=====================================================================

* JSX GUI Toolkit
* iOS UIKitを参考にインターフェイスを設計
* 生のDOMやCSSを触らずにすむように
* ただしレイアウトはCSSの薄いラッパ
* スマートフォンに最適化
* PCサポートはChrome/Safariだけでよい

Notes
=====================================================================

* [html5でアプリの壁を超える方法](http://0-9.sakura.ne.jp/pub/appsemi/start.html)
* [スマートフォン対応、気をつけたいトラブル](http://www.slideshare.net/HiroakiWakamatsu/ss-14011485)
* [CSSのmarginが難しい](http://kojika17.com/2012/08/margin-of-css.php)
* [Creating Fast Buttons for Mobile Web Applications](https://developers.google.com/mobile/articles/fast_buttons)
 * [FastClick](http://jsdo.it/kyo_ago/fastClick)
* [コールバック関数の実行回数を間引く](http://level0.kayac.com/#!2012/07/post_115.php) (JSX ver. http://jsdo.it/__gfx__/throttle)

How to develop
=====================================================================

JSX repoの web/example/ にこのリポジトリを clone する。
(またはjsx-uiをmvする)

	cd $JSX/web/example
	git clone git@github.com:jsx/jsx-ui.git

JSX repoのrootディレクトリで make web && make server。

	make web
	make server

以下のURLにアクセスする。

	open http://localhost:5000/try/example/jsx-ui/example/simulator.html

これで編集 & リロードで開発できる。

