build:
	@npm install
	@./node_modules/.bin/bower install
	@./node_modules/.bin/gulp

clean:
	@rm -rf node_modules bower_modules .tmp dist

release:
	@make clean
	@make build

.PHONY: build clean release`