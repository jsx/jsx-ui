
import "js/web.jsx" into web;

abstract class Event.<T> {
  var _event : T;

  function constructor(e : web.Event) {
    this._event = e as __noconvert__ T;
  }

  function getRawEvent() : T {
    return this._event;
  }

  function getTarget() : web.HTMLElement {
    return this._event.target as __noconvert__ web.HTMLElement;
  }
}

class MouseEvent extends Event.<web.MouseEvent> {
  function constructor(e : web.Event) {
    super(e);
  }
}

/*
   vim: set expandtab:
   vim: set tabstop=2:
   vim: set shiftwidth=2:
 */
