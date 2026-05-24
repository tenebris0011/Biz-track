.PHONY: dev build start test test-watch migrate generate install clean \
        docker-build docker-up docker-down docker-logs docker-restart

# ── Local dev ──────────────────────────────────────────────────────────────────

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

install:
	npm ci

test:
	npm run test

test-watch:
	npm run test:watch

# ── Database ───────────────────────────────────────────────────────────────────

migrate:
	npx drizzle-kit migrate

generate:
	npx drizzle-kit generate

# ── Docker ─────────────────────────────────────────────────────────────────────

docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

docker-restart:
	docker compose down && docker compose up -d

# ── Shorthand ──────────────────────────────────────────────────────────────────

clean:
	rm -rf .next node_modules

deploy: docker-build docker-restart
