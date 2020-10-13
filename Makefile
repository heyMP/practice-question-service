SHELL := /usr/bin/env bash
USER=$(shell whoami)

start-dev:
	docker-compose -f docker-compose-dev.yml up -d --build
	cd hasura; hasura migrate apply --admin-secret password
	cd hasura; hasura seeds apply --admin-secret password
	cd hasura; hasura console --admin-secret password

remove-dev:
	docker-compose -f docker-compose-dev.yml down -v --remove-orphans