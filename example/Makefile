
all: simulator.jsx.js
	jsx --add-search-path ../lib --executable web --output hello.jsx.js hello.jsx

simulator.jsx.js: simulator.jsx
	jsx --executable web --output $@ $<
