# url shortener

this project was created to practice the url shortener system design from system design school:
https://systemdesignschool.io/problems/url-shortener/solution

**microservices architecture** with grpc for internal communication:

- gateway: fastify http api + static web app
- urlgen: generates and stores short codes
- redirect: resolves codes to original urls
- analytics: tracks click metrics
- cache: redis
- db: dynamodb

## quickstart (docker only)

```bash
pnpm install
make up
```

then try it:

- web app:

  - open http://localhost:3000
  - paste a long url and click "shorten"
  - copy the short link and open it to test the redirect

- api:
  - post http://localhost:3000/api/urls/shorten with body { "longUrl": "https://example.com" }
  - get http://localhost:3000/:code -> 302 to long url
  - get http://localhost:3000/api/urls/:code

handy make targets:

- make logs -> follow logs for all services
- make tail S=gateway -> logs for a single service
- make ps -> status
- make restart -> rebuild and restart
- make down -> stop and remove containers + volumes

## microservices implementation

### completed

- [x] service separation - each service runs in its own container
- [x] grpc communication - services communicate via grpc instead of direct calls
- [x] single responsibility - each service has focused purpose
- [x] independent deployment - services build/deploy separately via docker

### improvements for true microservices

- [ ] database per service - split shared redis/dynamodb per service ownership
- [ ] remove shared business logic - move data access into each service
- [ ] proper data ownership - analytics shouldn't directly read urls table
- [ ] event-driven architecture - services publish/subscribe to events
