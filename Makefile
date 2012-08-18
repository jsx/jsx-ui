
all:
	cd example && make

watch:
	watcher --dir lib -- 'cd example && make'
