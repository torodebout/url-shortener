COMPOSE ?= docker compose

.PHONY: up down restart logs ps rebuild tail clean help

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down -v

restart:
	$(COMPOSE) down && $(COMPOSE) up -d --build

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

rebuild:
	$(COMPOSE) build --no-cache

# Tail logs for a single service, e.g. make tail S=gateway
S ?=
 tail:
	@if [ -z "$(S)" ]; then echo "Usage: make tail S=<service>"; exit 1; fi; \
	$(COMPOSE) logs -f $(S)

clean:
	docker system prune -f

help:
	@echo "Available targets:"
	@echo "  up        - build and start all services in background"
	@echo "  down      - stop and remove containers, networks, and volumes"
	@echo "  restart   - restart stack (down + up)"
	@echo "  logs      - follow logs for all services"
	@echo "  ps        - show container status"
	@echo "  rebuild   - rebuild images without cache"
	@echo "  tail S=x  - follow logs for a single service (gateway, urlgen, redirect, analytics)"
	@echo "  clean     - prune unused Docker resources"
