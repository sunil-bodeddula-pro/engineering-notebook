# System Design

How to design systems that scale, stay available and stay correct — the building blocks, the
trade-offs between them, and worked designs of real systems.

## What belongs here

- **Fundamentals:** one note per building block, focused on *when to use it and what it costs*
- **Case studies:** end-to-end designs ("design a URL shortener", "design a ride-sharing dispatch")
- **Real-world write-ups:** notes on how actual companies built things (engineering blogs, papers, talks)
- **Your own systems:** design decisions from projects you work on, and what you would do differently

## Topics

| Area | Topics |
| --- | --- |
| Foundations | Latency vs throughput, back-of-envelope estimation, availability (SLOs, nines), CAP and PACELC |
| Data | SQL vs NoSQL, indexing, replication, sharding/partitioning, consistency models, transactions, schema migration |
| Scaling | Load balancing, horizontal vs vertical scaling, stateless services, caching (CDN, app, DB), rate limiting |
| Communication | REST, gRPC, GraphQL, WebSockets, message queues, event streaming (Kafka), pub/sub |
| Reliability | Retries with backoff, idempotency, timeouts, circuit breakers, bulkheads, graceful degradation |
| Distributed systems | Consensus (Raft), leader election, clocks and ordering, exactly-once vs at-least-once, sagas, outbox pattern |
| Operations | Observability (logs, metrics, traces), deployment strategies, capacity planning, disaster recovery |
| Security | Authentication vs authorisation, OAuth/OIDC, multi-tenancy isolation, secrets management |

## Layout

```
system-design/
├── fundamentals/    ← one file per building block, e.g. fundamentals/caching.md
├── case-studies/    ← one file per system, e.g. case-studies/url-shortener.md
└── references.md    ← books, papers, blogs, talks worth revisiting
```

## How to write a case study

Use the design template in [`templates/`](../templates/). The order matters:

1. **Requirements** — functional, non-functional, explicit non-goals
2. **Estimates** — users, requests per second, storage, bandwidth
3. **API** — the main endpoints or messages
4. **Data model** — entities and how they are stored and keyed
5. **High-level design** — a diagram and the request path
6. **Deep dives** — the 2–3 hardest parts (hot keys, consistency, failure handling)
7. **Trade-offs** — what you chose, what you gave up, and what would change the decision

## Recommended resources

- *Designing Data-Intensive Applications* — Martin Kleppmann (the reference book)
- *System Design Interview* vol. 1 and 2 — Alex Xu
- Company engineering blogs and the papers behind Dynamo, Spanner, Kafka and Raft