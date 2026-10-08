# System Design Interviews — Quick Reference

## The interview in brief

- **The task:** take a vague, high-level problem and break it into the infrastructure needed to solve it (services, load balancers, databases).
- **No single right answer.** You are judged on navigating complexity, reasoning about trade-offs and explaining your thinking.
- **Common formats:** product design ("design Uber") or infrastructure design ("design a rate limiter").
- **Who gets it:** rare at entry level, common at mid-level, standard and heavily weighted at senior.
- **By level:** everyone must deliver a complete design that meets the requirements. Mid-level covers the basics well; senior moves through the basics fast and spends the time on deep dives.

## What interviewers assess

Every company's rubric covers the same four areas, whatever words it uses.

| Competency | What they want to see | How candidates fail |
| --- | --- | --- |
| **Problem navigation** (often the most important) | Break the problem into pieces, prioritize what matters, and drive to a working solution | Skipping requirements; spending time on trivial parts; getting stuck; no working system at the end |
| **Solution design** | Solve each piece with solid fundamentals and fit the pieces together cleanly | Weak core concepts; ignoring scale and performance; tangled "spaghetti" design |
| **Technical excellence** | Know current technologies and well-known patterns, and apply them to the problem | Unaware of available tech; outdated approaches or hardware assumptions; missing common patterns |
| **Communication and collaboration** | Explain clearly, take feedback well, work the problem with the interviewer | Unclear explanations; defensive when challenged; lost in details |

Expect probing: interviewers doubt answers and push on trade-offs to catch memorized solutions.

## How to prepare

- **Use a fixed structure** (the Delivery Framework) for every design. Lack of structure is the main reason candidates stall.
- **Practice, don't just consume.** Attempt real problems, then compare with the solution and learn the pattern behind it.
- **Build depth on fundamentals** so you can defend trade-offs, not recite answers.
- **Use modern assumptions.** Hardware has moved on; know the key numbers.
- **Time:** the full course is about 28 hours, usually spread over 2–4 months.

## Delivery Framework

The top reason candidates fail is not delivering a working system. Follow these steps in order: they keep you focused and give you a path back if you get lost.

| # | Step | Time | Key points |
| --- | --- | --- | --- |
| 1 | Functional requirements | ~5 min (with 2–3) | "Users should be able to..." Ask questions like a PM would. Prioritize the **top 3** features; a long list hurts you. |
| 2 | Non-functional requirements | | "The system should be..." Pick the **top 3–5**, tied to this system and quantified ("search < 500 ms", not "low latency"). |
| 3 | Capacity estimation | | Skip upfront. Do math only when it changes the design (e.g. whether a Top-K heap fits on one machine or needs sharding). |
| 4 | Core entities | ~2 min | Short bulleted list of the main nouns and actors (e.g. User, Tweet, Follow). Add fields later. Name them well. |
| 5 | API | ~5 min | Default to **REST** with plural resource names. GraphQL for varied client data needs; gRPC for fast internal calls; WebSockets/SSE for real-time. Take the user from the auth token, never the request body. |
| 6 | Data flow (optional) | ~5 min | Only for processing pipelines: a simple ordered list of steps. |
| 7 | High-level design | ~10–15 min | Boxes and arrows that satisfy each API endpoint in turn. Keep it simple; note caches, queues etc. and move on. Talk through data flow and state changes. Write only the DB fields that matter. |
| 8 | Deep dives | ~10 min | Harden the design: meet non-functional requirements, edge cases, bottlenecks, interviewer probes. |

**Non-functional checklist:** CAP (consistency vs availability) · environment limits (mobile, bandwidth, memory) · scalability (bursts, read vs write ratio) · latency · durability · security · fault tolerance · compliance.

**Deep-dive tips:**

- Seniors should find and lead the deep dives themselves; juniors can expect the interviewer to point to them.
- Leave room for the interviewer's questions. Talking over them misses the signals they want and hurts your communication score.
- Practice beforehand with the whiteboard tool the interview will use.

## Networking Essentials

Deeper focus in infrastructure roles; product roles need the basics. Default answers: **TCP + REST over HTTPS, L7 load balancer, retries with exponential backoff.** Deviate only with a stated reason.

### Layers that matter

| Layer | Protocols | Role |
| --- | --- | --- |
| L3 Network | IP | Addressing and routing packets (best effort) |
| L4 Transport | TCP, UDP, QUIC | End-to-end delivery; TCP adds reliability, ordering, flow control |
| L7 Application | DNS, HTTP, WebSockets, WebRTC, gRPC | What apps use; runs in user space, more flexible but slower |

**A web request:** DNS lookup → TCP 3-way handshake (SYN, SYN-ACK, ACK) → HTTP request → server work → response → TCP teardown (FIN/ACK both ways).

- Every connection is state on both sides and costs setup latency. Reuse it with keep-alive or HTTP/2 multiplexing.
- Higher in the stack = more latency and processing.

### TCP vs UDP

| | TCP (default) | UDP |
| --- | --- | --- |
| Connection | Connection-oriented | Connectionless |
| Delivery and order | Guaranteed, in order | Best effort, may drop or reorder |
| Flow and congestion control | Yes | No |
| Speed | Slower (overhead) | Faster |
| Use for | Almost everything | Live video, gaming, VoIP, DNS, lossy telemetry |

- Pick UDP when low latency matters more than losing some data. Browsers only support it through WebRTC, so plan a fallback for web clients.
- QUIC: a modern, faster take on TCP; rarely needed in interviews.

### HTTP basics

- Stateless request/response. Keep as much of the system stateless as possible.
- Methods: GET (read, idempotent), POST (create), PUT (replace), PATCH (partial update), DELETE (idempotent).
- Status codes: 200, 201 · 301, 302 · 401 unauthenticated, 403 forbidden, 404, 429 rate limited · 500, 502 bad gateway.
- HTTPS encrypts in transit but the body can still be forged: **never trust user IDs from the request body**; take identity from auth and validate inputs.

### Choosing an API / protocol

| Option | What it is | Use when |
| --- | --- | --- |
| **REST** (default) | Resources + HTTP verbs, usually JSON | Public and most internal APIs. Model resources, not actions (`PATCH /games {status: started}`, not `startGame`). |
| **GraphQL** | Client asks for exactly the fields it needs | Many clients/teams with changing data needs; avoids over- and under-fetching. Rarely needed in interviews. |
| **gRPC** | HTTP/2 + Protocol Buffers (binary, typed) | Internal service-to-service calls where performance matters. Not for browsers or public APIs. |
| **SSE** | Server streams many messages in one HTTP response | Server → client push only (notifications, live auction prices). Auto-reconnects with last message ID. |
| **WebSockets** | Persistent two-way connection, upgraded from HTTP | High-frequency, bi-directional real-time (chat, games). Stateful and costly: justify before using. |
| **WebRTC** | Peer-to-peer over UDP (signaling + STUN/TURN for NAT) | Audio/video calls and conferencing only. |

Avoid premature optimization: REST everywhere is fine unless the problem demands more.

### Load balancing

Scale vertically when you can (modern hardware is powerful), but interviews usually expect horizontal scaling behind a load balancer.

| Type | How it works | Use for |
| --- | --- | --- |
| **Client-side** | Client gets the server list from a registry (or DNS) and picks one | Internal services you control (gRPC, Redis Cluster); DNS for many clients when slow updates are OK |
| **L4 (dedicated)** | Routes by IP/port; keeps one TCP connection per client–server pair; fast | **WebSockets** and other persistent connections |
| **L7 (dedicated)** | Terminates the connection; routes by URL, headers, cookies | **HTTP traffic** (default); path-based routing, sticky sessions |

- **Algorithms:** round robin or random for stateless services; **least connections** for SSE/WebSocket servers; IP hash for session stickiness.
- **Health checks** (TCP or HTTP 200) remove dead servers automatically.
- Avoid a single point of failure: two load balancers in different regions, rotated with DNS.
- Very high throughput: mention hardware load balancers. Examples: F5, HAProxy, NGINX, Envoy, AWS ALB/NLB.

### Common deep dives

**Latency and regions**

- Distance costs time (New York–London round trip ≥ ~56 ms from physics alone). Keep data close to compute and to users.
- **CDN:** cache static or rarely changing data at edge locations (images, video, even cacheable search results).
- **Regional partitioning:** split data and services by geography when users only need local data (Uber rides by city region).

**Failures (assume the network is unreliable)**

- **Timeouts + retries with exponential backoff and jitter.** Jitter stops clients from retrying in sync.
- **Idempotency:** make retried writes safe with an idempotency key, so a payment is charged once.
- **Circuit breaker:** after repeated failures the circuit opens and calls fail fast; after a timeout it goes half-open and a test request decides whether to close it. Prevents cascading failures and "thundering herd" retries. Use around third-party APIs, databases and service-to-service calls.

**Hands-on practice:** capture your own traffic with Wireshark; simulate bad networks with a network link conditioner.

## API Design

Spend **≤ 5 minutes** here: interviewers want a reasonable API, then move on. It matters more for frontend, product and junior roles. Default: "I'll use REST" and list only the user-facing endpoints; just mention that internal services talk over RPC.

### Protocol choice

| Protocol | Pick when | Watch out for |
| --- | --- | --- |
| **REST** (default, ~90% of cases) | CRUD on resources for web/mobile clients | JSON is less efficient, rarely matters |
| **GraphQL** | Interviewer hints at different clients needing different data, over/under-fetching, fast frontend iteration | **N+1 queries** (fix with batching/dataloader); field-level auth; more complexity |
| **RPC (gRPC, Thrift)** | Internal microservices: performance, type safety, many languages, streaming | Not for public/browser clients |
| WebSockets / SSE | Real-time push (chat, notifications) | Persistent connections, not request/response |

### REST essentials

**Resources:** your core entities as **plural nouns** (`/events`, `/bookings`), never actions (`/getUserBookings` → `GET /users/{id}/bookings`).

| Input | Purpose | Example |
| --- | --- | --- |
| Path parameter | **Required**, identifies the resource | `/events/123/tickets` |
| Query parameter | **Optional** filter, sort, paging, flags | `/tickets?event_id=123&section=VIP&sort=-date` |
| Request body | The data being created or updated | Booking details on `POST /events/123/bookings` |

| Method | Use | Idempotent? |
| --- | --- | --- |
| GET | Read | Yes |
| POST | Create (server assigns ID) | **No** |
| PUT | Replace whole resource | Yes |
| PATCH | Partial update | Depends on implementation |
| DELETE | Remove | Yes |

**Responses:** status code + JSON body. Know 200, 201, 400, 401, 404, 500; the key point is 4xx = client's fault, 5xx = server's fault.

### Nine principles (apply them out loud, don't recite them)

1. Resources, not actions
2. Consistent names, parameters and response shapes everywhere
3. Least surprise: GET never changes data; no errors hidden inside a 200
4. Stateless: each request carries auth and all inputs, so any server can handle it
5. Safe retries (idempotency keys on important POSTs)
6. Paginate every growing list, with a max page size
7. Secure by default: auth required unless marked public; check per-resource permission; rate limit
8. Evolve without breaking clients: adding fields is safe; renaming or removing needs a new version
9. Actionable errors: right status class + machine-readable code + human message

Example of applying one: "I'll add an idempotency key here so a retry can't double-book the seat."

### Common patterns

- **Pagination:** offset (`?offset=20&limit=10`) is simple and usually fine; **cursor** (`?cursor=<last id>&limit=10`) is stable when data changes often or at high volume. Remembering pagination matters more than which kind.
- **Filtering and sorting:** query params, same names on every endpoint; `sort=-date` for descending.
- **Idempotency key:** client sends a unique `Idempotency-Key` header; server stores the result and returns it on retry. Raise it for payments, bookings and orders (Stripe does this).
- **Error envelope:** `{ "error": { "code": "SEAT_UNAVAILABLE", "message": "..." } }`, identical on every endpoint.
- **Versioning:** URL (`/v1/events`) is the safe interview choice; header versioning is cleaner but less obvious. Often skipped in interviews.

### Security

- **Authentication** = who you are. **Authorization** = what you may do with this resource (John can cancel only his own booking).
- **JWT** for user sessions in web/mobile: signed, carries user ID, role and expiry, verified without a DB lookup; works across services. A DB-stored session is also fine.
- **API keys** for service-to-service calls and third-party developers; not for end users.
- **RBAC:** permissions attached to roles (customer, venue manager, admin). Mention which roles can call which endpoints only if relevant.
- **Rate limiting** per user, per IP or per endpoint, at the API gateway; return **429**. One sentence is enough unless asked.

## Data Modeling

The bar is "good enough", not a full normalized schema. It shows up twice: list **core entities** during requirements, then sketch the **schema beside the database** in the high-level design (key fields, relationships, indexes, partitioning).

### Choosing a database

**Default to relational (PostgreSQL).** Don't pick exotic databases to impress.

| Type | Pick over SQL when | Modeling impact | Examples |
| --- | --- | --- | --- |
| **Relational (default)** | Most problems; joins; ACID for payments, inventory, no double-charge | Tables, foreign keys, constraints. Scales with read replicas, sharding, pooling, caching | PostgreSQL, MySQL |
| Document | Interviewer says schemas change often; deeply nested or very different records | Embed related data, denormalize more | MongoDB, Firestore |
| Key-value | Lookup by one key: cache, sessions, feature flags, very high writes | Flat; duplicate data per access pattern. Usually a cache **in front of** SQL, not instead | Redis, DynamoDB, Memcached |
| Wide-column | Huge append-heavy writes: time series, telemetry, logs, IoT | Model around queries; time is first-class; duplicate data per query | Cassandra, HBase |
| Graph | Almost never in interviews (Facebook, LinkedIn use SQL for social graphs) | Nodes and edges | Neo4j, Neptune |

Heavy multi-table joins at scale are a yellow flag: consider denormalized views, caching or precomputed results.

### Schema design drivers

Tie every choice to one of these, out loud:

1. **Access patterns** (most important): what queries does each API endpoint need?
2. **Data volume:** whether data must be split across stores or shards.
3. **Consistency:** strong (payments) keeps related data in one ACID database; eventual (likes, feeds) can be spread out.

Example: "Feeds must load fast and likes can be eventually consistent, so I'll store a like count on the posts table."

### Entities, keys and relationships

- Primary keys: **system-generated IDs** (`post_id`), not business data like email.
- Relationships: 1:N (user → posts), N:M (likes between users and posts), 1:1 (rare; usually merge the tables).
- Foreign keys prevent orphan records but slow writes; very large systems sometimes enforce integrity in the app instead.
- Constraints: NOT NULL, UNIQUE (email), CHECK (price > 0).
- Use domain names (users, tweets, follows), not abstract ones.

### Indexes

Index the columns your key queries filter or sort on, and tie each one to an endpoint: "`GET /users/{id}/posts` needs an index on `posts.user_id`". Use composite indexes for combined lookups, e.g. `(user_id, created_at)` for a user's recent posts.

### Normalization vs denormalization

- **Start normalized** (each fact stored once); duplicated data goes stale and is hard to keep consistent.
- Denormalize only for analytics/reporting, point-in-time logs or audit trails, and read-heavy search.
- Better option: keep the database normalized as the source of truth and put a **denormalized cache** in front for fast reads.

### Sharding

- **Shard by the main access pattern** (posts by user → shard by `user_id`) so related data sits together.
- **Avoid time-range sharding** for write-heavy data: all new writes hit one hot shard. Fine for archives and analytics.
- Avoid cross-shard queries (e.g. a timeline across many followed users); they are slow and complex.
- The shard key is close to permanent, so choose it carefully.

### Interview checklist (when you add the database)

1. Pick the database type
2. List the columns each entity needs for the functional requirements
3. Mark primary and foreign keys
4. Mark indexed columns
5. Decide if anything must be denormalized
6. Decide if sharding is needed, and the shard key

Whiteboard example (Postgres):

```
Users:    userId (pk), name, email (unique), createdAt
Posts:    postId (pk), userId (fk, index), content, mediaUrls, createdAt (index)
Comments: commentId (pk), postId (fk, index), userId (fk, index), content, createdAt (index)
```

## Database Indexing

An index is a separate structure that lets the database jump to matching rows instead of scanning every page. Mid-level: know when and where to add one. Staff: know the types and trade-offs. **When in doubt, use a B-tree**; the exceptions are geospatial data and full-text search.

**Cost of indexes:** extra disk space (sometimes near the table size) and slower writes, since every index is updated on each insert/update. Skip them on write-heavy, rarely-read tables (logs) and tiny tables.

### Index types

| Type | Good at | Weak at | Used by / when |
| --- | --- | --- | --- |
| **B-tree** (default) | Equality **and** range queries, ORDER BY, prefix match; balanced; 2–3 disk reads per lookup | Write-heavy firehose loads | Postgres primary keys and unique constraints, MySQL, MongoDB |
| **LSM tree** | Very high write throughput (sequential appends) | Reads may check many files; secondary indexes are extra | Cassandra, RocksDB, DynamoDB-style stores: metrics, logs, IoT, audit trails |
| **Hash** | O(1) exact match | No ranges or sorting; rarely used on disk | In-memory stores (Redis). Don't over-emphasize in interviews |
| **Geospatial** | "Nearby" queries on lat/long | Two separate B-trees on lat and long can't do this well | Uber, Yelp, Find My Friends |
| **Inverted** | Full-text search (word → list of documents) | Big storage; every word re-indexed on update | Elasticsearch, Lucene; `LIKE '%word%'` can't use a B-tree |

### LSM tree in brief

Write path: memtable in memory + write-ahead log (WAL) → flush to an immutable sorted file (SSTable) on disk → background **compaction** merges files.
Read path: memtable → older memtables → SSTables newest first. Sped up with **bloom filters** (skip files that definitely lack the key), sparse indexes and the compaction strategy.
Choose LSM when writes far exceed reads; choose B-tree for user-facing apps with many reads.

### Geospatial options

| Approach | How | Notes |
| --- | --- | --- |
| **Geohash** (learn this one) | Encode lat/long into a string; longer = more precise; nearby places share prefixes | Index the string with a normal B-tree; prefix range scans + neighbor cells. Redis GEO uses it. Edge case: neighbors across a cell border |
| Quadtree | Recursively split a square into 4 when it has too many points | Adapts to density; needs a custom structure; rare in databases today |
| **R-tree** | Overlapping bounding rectangles that fit the data | Default in PostGIS/MySQL; handles points and shapes (delivery zones) |

Interview line: "B-trees treat lat and long separately. Geohash turns 2D into a 1D string so a B-tree can do proximity search; R-trees group nearby objects into nested rectangles for more flexibility."

### Optimization patterns

- **Composite index** `(user_id, created_at)`: one index handles both the filter and the sort. **Column order matters**: it only helps queries that use the leftmost columns (not `created_at` alone). Put the equality filter first, then the sort/range column. Examples: `(customer_id, order_date)`, `(status, priority, created_at)`, `(user_id, type, timestamp)`.
- **Covering index** (`... INCLUDE (likes)`): stores extra columns so the query never touches the table. Larger and more to maintain; a niche optimization, so justify it before using it.

### Interview takeaways

1. For each key query, say which columns need an index and why.
2. Default to B-tree.
3. Location search → geohash (or R-tree); text search → inverted index.
4. Write-heavy ingestion → LSM-based store.

## Caching

Cache when the database is the bottleneck for reads: memory reads take ~1 ms vs ~50 ms from Postgres. The cost is staleness, invalidation and new failure modes. **Default: Redis with cache-aside, LRU + TTL, invalidate on write.** Don't cache everything; sometimes a well-indexed database is enough.

### Where to cache

| Layer | What it is | Use when |
| --- | --- | --- |
| **External cache** (default) | Shared network cache: Redis, Memcached | Any high-read system; shared by all app servers; LRU + TTL |
| **CDN** | Edge servers near users (Cloudflare, Fastly, Akamai) | Static media at scale (images, video): ~20–40 ms instead of 250–300 ms cross-world |
| Client-side | Browser/app storage, or client libraries (Redis cluster map) | Offline use, reusing downloads; little backend control, harder invalidation |
| In-process | Memory inside each app server; fastest, not shared | Small, hot, rarely changing data: config, feature flags, hot keys, counters. An add-on after Redis |

### Cache patterns

| Pattern | How | Trade-off | Use |
| --- | --- | --- | --- |
| **Cache-aside** (default) | App checks cache → on miss reads DB, fills cache | Lean cache; extra latency on a miss | Almost always |
| Write-through | App writes to cache; cache writes to DB synchronously | Fresh reads, slower writes, unused data in cache; dual-write inconsistency risk; needs a library | Reads must always be fresh |
| Write-behind | App writes to cache; cache flushes to DB later in batches | Very fast writes; data lost if cache crashes | Metrics, analytics, high write volume |
| Read-through | Cache fetches from DB itself on a miss | Central logic; needs special tooling | CDNs; rarely for app caches |

### Eviction

- **LRU** (default): remove least recently used.
- **LFU:** remove least often used; good for steadily popular items (trending videos).
- **FIFO:** oldest first; rarely used.
- **TTL:** expiry time per key; combine with LRU/LFU when data must refresh.

### Common problems

| Problem | What happens | Fix |
| --- | --- | --- |
| **Cache stampede** (thundering herd) | Hot key expires; many requests hit the DB at once | **Request coalescing** (one request rebuilds, others wait); warm hot keys before TTL expiry; probabilistic early expiration |
| **Stale data** | DB updated, cache still has the old value | **Delete the key on write**; short TTLs; accept eventual consistency for feeds/metrics |
| **Hot key** | One key overloads one Redis node (a celebrity profile) | Replicate the key across nodes; in-process cache for it; rate limit |
| **Cache down** | All traffic falls through to the DB | Circuit breaker; small in-process fallback cache |

### How to present it in an interview

1. **Name the bottleneck with rough numbers:** read-heavy load, expensive query (200 ms feed join), high DB CPU, or a tight latency target.
2. **What to cache:** data that is read often, changes rarely, is costly to compute. Name the keys (`user:123:profile`, `trending:posts:global`).
3. **Pattern:** "cache-aside with Redis"; add CDN for media, in-process for very hot keys.
4. **Eviction:** LRU + TTL (e.g. 10 min), invalidate on update.
5. **Downsides:** pick 1–2 that fit the system (invalidation, cache failure, stampede). Staff level: focus on the non-obvious ones.

## Sharding

Shard only when one database can't keep up (storage, write or read throughput). **Default: hash-based sharding with consistent hashing on a key that matches your main query (usually `user_id`).** The #1 mistake is sharding before proving it's needed: do the math first.

### Partitioning vs sharding

- **Partitioning:** splits a big table into pieces on **one** machine. Horizontal = rows (orders by year); vertical = columns (hot vs rarely used columns). Faster queries and maintenance.
- **Sharding:** horizontal partitioning across **many** machines, each a standalone DB. Scales storage and throughput, but adds routing, hot spots, rebalancing and cross-shard work.
- People use the terms loosely; just be clear whether data is on one machine or many.

### Choosing a shard key

A good key has **high cardinality**, **even distribution**, and **matches the common queries** (they should hit one shard).

- Good: `user_id` for user-centric apps; `order_id` for orders.
- Bad: booleans like `is_premium` (only 2 shards); `created_at` on a growing table (all writes hit the newest shard); country (skewed).

### Distribution strategies

| Strategy | How | Pros | Cons | Use |
| --- | --- | --- | --- | --- |
| **Hash** (default) | `hash(key) % N`, ideally **consistent hashing** | Even spread | Adding shards moves data unless you use consistent hashing; no range scans | Most systems; assumed unless you say otherwise |
| Range | Key ranges per shard (IDs 1–1M → shard 1) | Simple; efficient range scans | Hot spots when traffic clusters (recent data) | Multi-tenant SaaS (a range per customer) |
| Directory | Lookup table maps key → shard | Most flexible; can isolate heavy users | Extra lookup on every request; directory is a single point of failure | Rarely the interview answer |

### Challenges and fixes

| Challenge | Fix |
| --- | --- |
| **Hot spots** (celebrity user, newest time shard) | Move hot keys to dedicated shards; compound key like `hash(user_id + date)`; automatic shard splitting (MongoDB). Spot them via per-shard latency/CPU |
| **Cross-shard queries** (global top 10 = query all shards and merge) | Cache results (leaderboards, trending); precompute in background jobs; denormalize related data onto the same shard; accept for rare admin queries. A common cross-shard query means rethink the design |
| **Cross-shard transactions** | Best: keep all of a user's data on one shard so transactions stay local. Otherwise **saga** (steps + compensating actions, e.g. refund A if crediting B fails). Avoid 2PC (slow, fragile). Accept eventual consistency where OK (follower counts) |

Frequent distributed transactions = wrong shard key or boundaries.

### Don't build it yourself

Cassandra, DynamoDB and MongoDB shard by partition key and rebalance automatically. For SQL: Vitess, Citus, Aurora, Spanner. Saying "DynamoDB with `user_id` as partition key" is enough.

### Interview script

**When:** name the limit with numbers, explain why one DB can't handle it, then propose sharding. E.g. 50K writes/sec at peak, or 10x growth past single-instance storage.

1. **Shard key:** "Queries are user-centric (feed, followers, likes), so I'll shard by `user_id`."
2. **Strategy:** "Hash-based with consistent hashing for even distribution."
3. **Trade-offs:** "Global queries like trending posts hit all shards, so I'll cache and precompute them in a background job."
4. **Growth:** "Start with 64 shards; consistent hashing lets us add shards and move only a fraction of the data."

## Consistent Hashing

Decides which node holds which key while **moving as little data as possible** when nodes are added or removed. In most interviews, just say "DynamoDB/Cassandra use consistent hashing under the hood". Go deep only when asked to design a distributed database, cache or message broker.

### The problem with modulo

`node = hash(key) % N`. Changing N (adding a node, or one failing) remaps **almost every key** → huge data movement, load spikes, slow or unavailable reads.

### How the ring works

1. Hash space forms a circle (in practice 0 to 2^32 − 1).
2. Hash each node onto the ring.
3. Hash the key and **walk clockwise** to the first node: that node owns it.

- **Add a node:** only keys between it and the previous node move to it.
- **Remove a node:** only its keys move to the next node clockwise.

### Virtual nodes

Problem: with one point per node, a removed node dumps all its load on one neighbor, and a new node only relieves one neighbor.
Fix: place each node at many points (`DB1-vn1`, `DB1-vn2`, ...). Load from a failed or new node spreads across many nodes. More virtual nodes = more even balance.

### Hot spots (traffic, not data)

Consistent hashing spreads **keys** evenly, not **traffic** (a Taylor Swift concert gets 100x the reads).

- **Read replicas** for popular keys (most common).
- **Key salting:** `taylor-swift-{0..9}` spreads one key across nodes; reads gather and combine.
- **Adaptive rebalancing:** move hot ranges automatically (DynamoDB does this).

Interview line: **virtual nodes fix uneven key distribution; replication and salting fix uneven traffic.**

### In practice

- Failures are handled by **replication**, not data movement: replicas on the next N ring nodes (Cassandra) or across 3 AZs (DynamoDB) take over. Data moves only for planned changes (adding capacity, replacing a node).
- Used by Cassandra, DynamoDB, CDNs, distributed caches, message brokers, app server pools.
- Alternative: **fixed hash slots** (Redis Cluster: `CRC16(key) mod 16384` slots assigned to nodes). Simpler to reason about, more coordination when rebalancing.

### What to explain in an infrastructure interview

1. Why the ring beats modulo
2. How virtual nodes balance load
3. What happens on node add and failure
4. Hot spots and their fixes
5. How it works with replication for fault tolerance

## CAP Theorem

**Partition tolerance is mandatory in distributed systems, so CAP is one choice: when the network splits, keep serving possibly stale data (availability) or refuse until data is current (consistency)?** Decide it first in the non-functional requirements.

- **Consistency:** every read returns the latest write, from any node (not the same as ACID's "C").
- **Availability:** every working node answers, possibly with stale data.
- **Partition tolerance:** keeps running when nodes can't talk to each other.

**Deciding question:** "Would it be catastrophic if users briefly saw inconsistent data?" Yes → consistency. No → availability. (Equivalently: must every read see the most recent write?)

### Which to choose

| Prioritize | Examples | Design choices | Technologies |
| --- | --- | --- | --- |
| **Consistency** | Ticket/seat booking, inventory (last item), payments, trading order books | Distributed transactions (2PC) at the cost of latency; single-node DB as one source of truth | PostgreSQL, MySQL, Spanner, DynamoDB strong-consistency mode |
| **Availability** (most systems) | Social profiles and feeds, Netflix descriptions, Yelp hours | Async read replicas; change data capture (CDC) to update replicas and caches; eventual consistency | Cassandra, DynamoDB multi-AZ, Redis clusters |

Most distributed databases can be configured either way.

### Senior/staff: mix per feature

- **Ticketmaster:** consistency for booking seats; availability for browsing events.
- **Tinder:** consistency for matches; availability for viewing profiles.
- Say it like: "I'll prioritize consistency for bookings and availability for browsing."

### Consistency levels (strongest → weakest)

| Level | Meaning | Example |
| --- | --- | --- |
| Strong | Every read sees the latest write; most expensive | Bank balances |
| Causal | Related events appear in order for everyone | A comment never shows before its post |
| Read-your-own-writes | You see your own updates immediately; others may lag | Editing your own profile |
| Eventual | Converges over time; default when choosing availability | DNS, feeds |

## Numbers to Know

Modern hardware is far bigger than old textbooks assume. Using 2015-era limits leads to over-engineered designs. **Do the math before adding shards, caches or queues.**

### Hardware baseline

- **Servers:** 128 vCPUs and 512 GiB RAM common; up to 4–24 TB RAM on memory-optimized machines.
- **Storage:** 60 TB local SSD per instance; S3 effectively unlimited.
- **Network:** 25 Gbps standard (50–100 Gbps high end). Latency: < 1 ms same AZ, 1–2 ms across AZs, **50–150 ms cross-region**.

### Cheat sheet

| Component | Capacity (one well-tuned instance) | Latency | Scale when |
| --- | --- | --- | --- |
| **Cache** (Redis) | Up to ~1 TB memory; 100k–200k+ ops/sec | < 1 ms | Data near 1 TB; sustained 100k+ ops/sec; need < 0.5 ms; hit rate < 80%; memory > 80% |
| **Database** (Postgres/MySQL, RDS/Aurora) | 64 TiB (Aurora 256 TiB); reads up to 50k TPS; writes 10–20k TPS; 5–20k connections | Reads 1–5 ms cached, 5–30 ms disk; commits 5–15 ms | Data near 50 TiB; writes > 10k TPS sustained; need < 5 ms uncached; multi-region; backups take hours |
| **App server** | 100k+ concurrent connections; 8–64 cores; 64–512 GB RAM (up to 2 TB) | Starts in seconds to minutes | CPU > 70–80%; memory > 80%; latency over SLA; near bandwidth limit |
| **Message queue** (Kafka) | Up to 1M msgs/sec per broker; 50 TB storage; weeks–months retention; 1 KB–10 MB messages | 1–5 ms end to end | Near 800k msgs/sec; ~200k partitions per cluster; consumer lag keeps growing |

### What it means for design

- **Caches** can often hold the whole dataset; the limit is usually ops/sec or bandwidth, not memory.
- **One database** handles millions to tens of millions of users. Still run replicas for availability: replication (HA) and sharding (scale) are separate decisions.
- **App servers:** CPU runs out first, not memory. Use RAM for local caches; autoscaling is fast enough to avoid over-provisioning.
- **Queues** are fast enough to sit inside synchronous request flows (when there's no backlog).

### Common interview mistakes

| Mistake | Reality check |
| --- | --- |
| **Premature sharding** | Yelp: 10M businesses × 1 KB = 10 GB; ×10 for reviews = 100 GB. One DB. A LeetCode leaderboard at ~400 GB still fits one large cache |
| **Overestimating DB latency** | Indexed row lookup on SSD is sub-ms to a few ms; no cache needed for simple lookups (do cache expensive queries) |
| **Queue for "high" writes** | Postgres handles 20k+ simple writes/sec, so 5k WPS needs no queue. Try batching, better indexes, connection pooling, async commits first. Use queues for guaranteed delivery, decoupling, event sourcing or spikes beyond DB capacity |
| **Cost** | Don't memorize pricing; think in orders of magnitude, but avoid 100 machines where 1 will do |

## Common Patterns (overview)

Spotting the right patterns saves time and shows seniority. Patterns combine: a video platform uses large blobs (upload), long-running tasks (transcoding), realtime updates (progress) and multi-step processes (whole workflow). **Start simple; add complexity only when a requirement demands it.**

| Pattern | Problem | Core approach | Watch out for |
| --- | --- | --- | --- |
| **Realtime updates** | Push changes to users (chat, notifications, live dashboards) | Start with HTTP polling → SSE/WebSockets when needed. Server side: pub/sub to decouple (WhatsApp) or stateful servers on a consistent hash ring for heavy processing (Google Docs) | Connection infrastructure is tricky |
| **Long-running tasks** | Work too slow for a request (video encoding, reports, bulk jobs) | Validate → put job on a queue → return a job ID in ms; workers pull and process. Track status, retries, dead letter queue | Don't queue short jobs; synchronous is simpler with clearer back-pressure |
| **Contention** | Many users want the same thing (last ticket, auction bid) | Single DB first: transactions, pessimistic locks, optimistic concurrency. Distributed: distributed locks, 2PC, queue-based serialization | Splitting data across DBs means re-solving what databases already handle |
| **Scaling reads** | Reads grow faster than writes (10:1 → 100:1+) | In order: indexes and denormalization → read replicas → Redis cache + CDN | Cache invalidation, replica lag, hot keys |
| **Scaling writes** | Writes exceed one server | Sharding with a good partition key, vertical partitioning, batching; queues for bursts; load shedding for low-priority writes | Partition key must spread load yet keep related data together |
| **Large blobs** | Videos, images, documents | **Presigned URLs**: clients upload directly to S3; download through a CDN with signed URLs | Keeping DB metadata in sync with storage (use storage event notifications); failed uploads; file lifecycle |
| **Multi-step processes** | Workflows across services that must survive failures (orders, onboarding, payments) | Simple orchestrator → event sourcing → workflow engines (**Temporal**, AWS Step Functions) for state, retries, exactly-once, audit trail | Scattered state and manual error handling |
| **Proximity search** | Find things near a location (Uber, Gopuff) | Geospatial index: PostGIS, Redis GEO, Elasticsearch geo; divide the map into regions | Only worth it for 100k+ items; for ~1,000, just scan. Queries are usually local, not global |

## Pattern: Scaling Reads

Reads outgrow writes (10:1 up to 100:1+ for content apps). Goal: **reduce database load**. Follow the progression and don't skip steps: **(1) optimize the database → (2) scale it horizontally → (3) add caches.**

### 1. Optimize within the database

- **Indexes first:** on columns you filter, join or sort by. Full scan O(n) → O(log n). Under-indexing hurts far more than over-indexing; add them confidently in interviews.
- **Hardware:** SSDs, more RAM, more cores. Worth a mention, but not what interviewers want.
- **Denormalization:** store duplicate data (e.g. an `order_summary` table) to avoid joins. Faster reads, harder writes; check the read/write ratio first.
- **Materialized views:** precompute expensive aggregations (average ratings) in a background job.

### 2. Scale the database horizontally

Rough trigger: **> 50k–100k reads/sec** even with good indexes.

- **Read replicas:** writes go to the leader, reads to followers; also gives failover. **Replication lag** is the key trade-off: synchronous = consistent but slower; asynchronous = fast but possibly stale (users may not see their own writes).
- **Sharding:** smaller datasets per DB. Functional (users DB vs products DB) or geographic (US vs EU). Mainly a write technique; for reads, caching is usually simpler.

### 3. Add caching

Access is skewed (viral tweets, popular products), so caching hits hard.

- **App cache (Redis/Memcached), cache-aside:** sub-ms hits; popular data stays cached, the rest expires via TTL.
- **CDN/edge:** ~200 ms → < 10 ms; can cut origin load 90%+. Only for data **shared by many users** (public posts, catalogs, search results), never personal data.

**Invalidation strategies** (combine them; short TTL of 5–15 min as a safety net + active invalidation for critical data):

| Strategy | How | Trade-off |
| --- | --- | --- |
| TTL | Entries expire after a fixed time | Stale until expiry. **Set TTL from the staleness requirement** ("≤ 30 s stale" → 30 s TTL) |
| Write-through invalidation | Update/delete cache on each DB write | Consistent; slower writes, error handling |
| Write-behind invalidation | Queue invalidations asynchronously | Fast writes; brief stale window |
| Tagged | Clear all entries with a tag (`user:123:posts`) | Handles dependencies; must maintain tags |
| **Versioned keys** | Key includes a version (`event:123:v43`) bumped in the same DB transaction | No races, no deletes; two lookups per read; old versions need TTL. Best for single entities |

### When to use (and not)

**Use** for read-heavy, high-traffic endpoints. In the API step, flag hammered endpoints: "Profile views could be billions of reads a day; I'll handle that in the deep dive."

| Scenario | Approach |
| --- | --- |
| URL shortener | Cache short→long URL in Redis with no expiry (never changes) + CDN |
| Ticketmaster | Cache event, venue and seat map; **never cache live seat availability**; replicas for browsing, primary for purchases |
| News feed | Precompute feeds for active users; cache recent posts; paginate (people read only the top) |
| YouTube | Cache metadata; view counts eventually consistent (update every few min); CDN for thumbnails |

**Don't lead with it for:** write-heavy systems (Uber location updates), small scale ("1,000 users" → one indexed DB), strongly consistent data (use short TTLs + aggressive invalidation), real-time collaboration (Google Docs).

### Common deep dives

| Question | Answer |
| --- | --- |
| Queries slow down as data grows | Missing indexes → full table scans. Add indexes (check with `EXPLAIN`); composite index column order matters |
| Millions of reads on one hot key | **Request coalescing** (one in-flight fetch per key per server, so the backend sees only N requests); **key fanout** (`feed:taylor-swift:1..10`, clients pick one at random; more memory, harder invalidation) |
| Cache stampede when a hot entry expires | Distributed lock so one request rebuilds (fragile if slow); **probabilistic early refresh** (refresh chance rises near expiry); background refresh for the most critical keys |
| Updates must be visible immediately | Plain delete-after-write has race conditions and multi-layer gaps → **versioned keys**; for feeds/search, a small **deleted-items cache** to filter results while full invalidation runs; for CDN, purge APIs, shorter edge TTLs, or no-cache headers for critical data |

## Deep Dive: PostgreSQL

**Postgres is the default database: start with it, then justify any deviation.** Interviewers want architecture decisions, not DBA internals. Saying "it's ACID" isn't enough; explain *how* you use transactions and locks.

### Read features

- **B-tree** (default; primary key auto-indexed): exact match, ranges, sorting. Composite `(user_id, created_at)`. Don't index every column (slower writes, disk, may go unused).
- **Full-text search:** `tsvector` + **GIN** index; stemming, ranking, many languages. Often replaces Elasticsearch. Use Elasticsearch only for advanced relevance, facets, fuzzy/type-ahead, very large distributed search, analytics.
- **JSONB + GIN:** flexible attributes (hashtags, mentions, media type) without a document DB.
- **PostGIS + GiST:** radius and polygon queries (`ST_DWithin`). Uber started on it. Try before a specialized geo DB.
- These combine in one query (text + JSON + location).
- **Covering index** (`INCLUDE (title, created_at)`): answer from the index alone. **Partial index** (`WHERE status = 'active'`): smaller and faster.

### Rough numbers (single node)

| Operation | Throughput |
| --- | --- |
| Simple indexed reads | 50k+/sec per core |
| Indexed multi-table joins | Thousands–tens of thousands/sec |
| Complex aggregations | Hundreds–low thousands/sec |
| Simple inserts | ~5k/sec per core |
| Updates touching indexes | ~1–2k/sec per core |
| Multi-table transactions | Hundreds/sec |
| Bulk loads | Tens of thousands of rows/sec |

Rules of thumb: tables get unwieldy past ~100M rows; joins hard past ~10M rows; full-text good to tens of millions of docs; **performance drops when the working set no longer fits in RAM.**

### Writes

Path: change pages in memory + WAL record → **WAL flushed to disk at commit** (sequential; this sets commit latency) → background writer saves data pages later; every index adds WAL work.
Limits come from WAL disk speed, number of indexes, synchronous replication, transaction complexity, and **connections** (one OS process each, so use **PgBouncer**).

**Scaling writes beyond ~5k/sec** (in rough order):

1. **Vertical scaling:** NVMe, RAM, cores.
2. **Batching:** multi-row inserts in one transaction (lose the batch if the server crashes).
3. **Write offloading:** analytics, logs, "last seen" → Kafka → workers write in batches.
4. **Table partitioning** by time (monthly): parallel writes, smaller index updates, reads scan only recent partitions; old partitions on cheaper storage.
5. **Sharding** (most common interview answer): shard by the main query key (`user_id`). No built-in sharding; use **Citus** or build it.

### Replication

- **Async** (default): fast; recent writes can be lost on failover; replicas lag (watch **read-your-writes**).
- **Sync:** waits for a replica; durable, slower. Common hybrid: one or two sync replicas + several async replicas for reads.
- Uses: **read scaling** (×N replicas) and **high availability** (detect failure → promote replica → repoint apps; managed by RDS/Cloud SQL). Say both.

### Consistency and concurrency

Transactions give all-or-nothing, but at the default **Read Committed** level two transactions can read the same value and both act (auction: both see $90 max bid).

| Fix | How | Best when |
| --- | --- | --- |
| **Row lock** (preferred) | `SELECT ... FOR UPDATE` on the row, then write | You know exactly which rows (bids, inventory). Watch for deadlocks |
| **Serializable** isolation | Transactions act as if run one at a time | Complex logic where locks are hard to define; app must retry on conflict |
| **Optimistic (OCC)** | Version column; `UPDATE ... WHERE version = 5`; 0 rows → retry | Conflicts are rare; no locks held |

Isolation levels: Read Committed (default) < Repeatable Read (Postgres also blocks phantom reads) < Serializable. Interview phrasing: "transactions **plus a row lock on the auction row**".

### When to use / not

**Use for:** complex relationships, strong consistency, rich queries, mixed structured and JSON data, search, geo. E.g. e-commerce, finance, CMS, moderate analytics.

**Consider alternatives when:**

| Need | Option |
| --- | --- |
| Millions of writes/sec | Cassandra (events), Redis (counters) |
| Active-active writes in multiple regions | CockroachDB (global ACID), Cassandra, DynamoDB global tables |
| Pure key-value lookups | Redis, DynamoDB, Cassandra |

"It scales better" alone is not a valid reason to leave Postgres.

**ACID in one line each:** Atomicity = all or nothing · Consistency = constraints always hold (`CHECK balance >= 0`; different from CAP consistency) · Isolation = how concurrent transactions see each other · Durability = committed data survives crashes (WAL).

## Deep Dive: Redis

The most versatile tool to know well: an in-memory **data structure store**, single-threaded (one command at a time, no locks), ~100k ops/sec per node with sub-ms latency. Simple data structures make it easy to reason about at scale. **Not a system of record.**

### Basics

- **Data structures:** strings, hashes, lists, sets, **sorted sets**, **streams**, geospatial, plus Bloom filters, JSON and time series (Redis 8).
- **Durability gaps:** RDB snapshots lose data since the last snapshot; AOF fsyncs every second by default, so up to ~1 s lost. Need real durability → AWS MemoryDB.
- **Cluster:** keys hash to **16,384 slots** spread across nodes. Clients cache the slot map; a wrong node answers `MOVED`. No query router: **a command must touch keys on one node**, so key design = scaling design. **Hash tags** `{user:123}:posts` and `{user:123}:likes` force keys into the same slot.
- **Replication is async:** a failover can lose acknowledged writes. Replica reads (`READONLY`) add read capacity but lag.
- Speed makes N+1 lookups tolerable; batch with pipelining or `MGET`.

### Use cases

| Use | How | Watch out for |
| --- | --- | --- |
| **Cache** | `product:123` → JSON or hash; TTL per key | TTL handles staleness, not memory: set an eviction policy (`allkeys-lru`) or writes fail when full. Hot keys |
| **Distributed lock** | `SET lock:concert:343 <token> NX EX 30`; release with a Lua script that deletes only if the token matches | Async failover can grant the lock twice; Redlock is debated; no fencing tokens. **An efficiency tool, not a correctness guarantee.** For correctness use DB row locks / `UPDATE ... WHERE version`, or ZooKeeper/etcd. Optimistic option: `WATCH` + `MULTI/EXEC` |
| **Leaderboard** | Sorted set: `ZADD` score + member (re-add updates rank); `ZREMRANGEBYRANK key 0 -6` keeps the top 5 | Memory if unbounded; trim periodically |
| **Rate limiting** | Fixed window: `INCR` counter, set `EXPIRE` only when count = 1, in one Lua script; over limit → 429. Sliding window: sorted set of timestamps (remove old, count, add) in Lua | Calling EXPIRE every time never resets the window |
| **Proximity search** | `GEOADD`, `GEOSEARCH ... BYRADIUS` (geohash in a sorted set) | Grid boxes → filter step for the exact radius |
| **Work queue / event log** | **Streams**: `XADD`; consumer groups `XREADGROUP`, ack; dead worker's items reclaimed with `XCLAIM`/`XAUTOCLAIM` | Items can run twice → make processing **idempotent**; durability follows persistence settings |
| **Pub/Sub** | `PUBLISH`/`SUBSCRIBE`; in a cluster use sharded `SPUBLISH`/`SSUBSCRIBE` (Redis 7+, scales with nodes) | **At-most-once**: offline subscribers miss messages. For durability use Streams, Kafka, SNS→SQS or an outbox |

- **Streams vs Kafka:** Streams for modest queues when Redis is already there (jobs, notification fan-out). Kafka for long retention, replay by many consumers, durable high-scale ordering.
- **Pub/Sub tips:** one connection per node (not per channel); channels exist only while subscribed. Don't build your own "subscriber list in a key": more hops, new TCP connections, heartbeat cleanup.

### Hot keys

One key gets as much traffic as the rest combined and overloads its node.

- **Client-side cache** of the hottest keys in each app server (short TTL; some staleness).
- **Key copies:** `product:123:1..10` on different nodes, readers pick one at random; writes must update all copies, and clients must know which keys are copied.
- **Read replicas:** only help if clients read from replicas; useless for write-hot keys.

Spotting hot keys earns points; proactively fixing them earns more.

### Don't use Redis when

- It would be the **system of record** (async replication + persistence gaps lose writes).
- The working set doesn't fit in RAM affordably.
- You need joins or cross-key queries (multi-key ops only within one slot).
- You need durable, replayable, long-retention streams for many consumers → Kafka.

## Problem: News Aggregator (Google News)

### Requirements

- **Functional:** view an aggregated feed from thousands of publishers; infinite scroll; click through to the publisher's site. *Out of scope:* personalization, saving, sharing.
- **Non-functional:** availability over consistency; 100M DAU with spikes to 500M; feed loads < 200 ms. *Out of scope:* privacy, monitoring, publisher API failures.

### Entities and API

- **Article** (id, title, summary, thumbnail URL, published_at, publisher_id, region, url) · **Publisher** (id, name, url, feed URL, region) · **User** (id, region; may be anonymous).
- `GET /feed?region=&limit=&cursor=` → Article[]. Clicking an article is just a browser link to the publisher (optionally via `GET /article/{id}` → log the click + 302 redirect).

### High-level design

- **Data Collection Service** (background): reads publishers from the DB, polls RSS/APIs, downloads images → thumbnails in **S3**, saves article rows to the **DB**. Store our own thumbnail copies: publisher images are slow, change or disappear.
- **Feed Service** (user-facing): Client → API Gateway (auth, rate limit) → Feed Service → DB/cache.
- Keep the two services separate: write-heavy batch vs read-heavy real-time, scaled independently.

### Deep dives (✗ bad · ~ good · ✓ great)

**1. Pagination for infinite scroll**

- ✗ Offset/page numbers: new articles shift the list → duplicates or skipped items.
- ~ Timestamp cursor (`WHERE published_at < cursor`): stable, but articles with the same timestamp get skipped.
- ✓ Composite cursor `(published_at, article_id)` with a tuple comparison + composite index.
- ✓ **Monotonic IDs** (ULID / auto-increment): cursor = last ID; `WHERE id < cursor ORDER BY id DESC LIMIT 20`. Simplest. Plan the ID scheme up front.

**2. Feed latency < 200 ms**

- ~ Redis cache-aside per region (`feed:US` sorted set, 30-min TTL): stale for up to 30 min; thundering herd when it expires.
- ✓ **Precomputed regional feeds via CDC:** new article row → CDC event → Feed Generation Workers `ZADD` to the regional sorted set and trim to the latest 1–2k (`ZREMRANGEBYRANK`). Reads are `ZREVRANGE` in < 5 ms. Cost: CDC, queue and worker pipeline to operate.

**3. Articles visible within 30 min of publishing** (juniors/mids can usually treat ingestion as a black box; ask)

- ~ Tiered RSS polling: top outlets every 5–10 min, others every 30 min–3 h; use ETag/Last-Modified. More requests, risk of being blocked, and not every publisher has RSS.
- ~ Web scraping for sites without RSS (like a web crawler): brittle HTML parsing, legal concerns; use as a fallback.
- ✓ **Publisher webhooks** (`POST /webhooks/article-published`, authenticated): seconds of delay; needs publisher buy-in. Keep RSS + scraping as fallbacks (hybrid).

**4. Thumbnails**

- ✗ Images as blobs in the DB.
- ~ S3 + direct URLs: slow far from the region, high egress costs.
- ✓ **S3 + CDN with several sizes** (mobile/desktop/retina via `srcset`): CDN absorbs 90%+ of requests.

**5. Breaking-news spikes (~10M concurrent)**

- News is **regional** → deploy separate regional stacks that scale independently.
- Feed Service is stateless → autoscale horizontally behind load balancers.
- Reads hit the cache, not the DB.
- Redis: ~2k articles per region fit on one primary; the problem is throughput (~100k req/s per node), so add **read replicas** (Sentinel for failover; ~200 ms lag is fine). ~10M req/s ≈ 100 instances total, spread by regional demand.

**6. Category feeds (bonus)**

- ✗ Filter categories in DB queries: millions of DB hits.
- ~ Precomputed `feed:sports:US` sorted sets: 250+ sets, more memory and cleanup.
- ✓ **Store article JSON (with category) in the regional feed; read ~1,000 and filter in memory** (~10 ms). The simplest option wins.

**7. Personalization (bonus)**

- ✗ Score articles per user at request time: seconds, not ms.
- ~ Precomputed feed per user: memory explodes (50M users × 1,000 items); can miss big breaking news.
- ✓ **Hybrid:** small preference vector per user; build the feed on request by **mixing category feeds** (e.g. 60% tech, 30% business, 10% trending); boost trending during big events. ~100x less memory, less precise personalization.

## Pattern: Scaling Writes

Core idea: **reduce the write throughput each component handles.** Four strategies, roughly in order: **(1) vertical scaling + the right database → (2) sharding/partitioning → (3) queues and load shedding for bursts → (4) batching and hierarchical aggregation.** Do the math first; don't add write scaling where it isn't needed.

### 1. Vertical scaling and database choice

- Confirm you're actually hitting disk, CPU or network limits. Modern boxes have 200 cores and 10+ Gbps. Make the case, but don't argue if the interviewer pushes past it.
- **Write-optimized databases** (they trade read speed for write speed):
    - **Cassandra:** append-only commit log, 10k+ writes/sec on modest hardware vs ~1k for a relational DB doing the same work; slower reads.
    - Time-series: InfluxDB, TimescaleDB. Log-structured: LevelDB. Columnar: ClickHouse (batched analytics writes).
- Tune any DB: drop foreign keys/triggers/full-text indexing in hot paths; batch WAL flushes; fewer indexes.
- Explain *why* (append-only vs B-tree updates), not just "use a faster DB".

### 2. Sharding and partitioning

- **Horizontal sharding:** e.g. Redis Cluster (CRC hash → slot → node) or consistent hashing. 10 shards ≈ 10x writes **if the key is good**.
- **Partition key:** hash of a main ID (`userId`, `postId`) for flat distribution; not something skewed like country. Also check reads: "How many shards does this request hit, and how often does it run?"
- **Vertical partitioning:** split by access pattern, each in a store tuned for it:
    - `post_content`: write once, read many → B-tree DB.
    - `post_metrics`: very frequent counter updates → in-memory/counter store.
    - `post_analytics`: append-only events → time-series/columnar.

### 3. Bursts: queues and load shedding

Autoscaling is slow, and resizing databases often costs throughput or downtime.

- **Write queue** (Kafka, SQS): absorbs short bursts; DB drains at a steady rate. Writes become async: clients only know the write was queued and may need a way to check status. **If input stays above DB capacity, the queue grows without limit.** Don't use a queue to hide a DB that can't handle normal load. Check at requirements time how much delay is acceptable.
- **Load shedding:** drop the least valuable writes when overloaded. Uber/Strava location pings (a fresher one arrives in seconds); drop impressions to keep clicks. Turns overload into degraded service instead of an outage.

### 4. Batching and hierarchical aggregation

- **App-level batching:** best when the app isn't the source of truth (e.g. Kafka consumer: on crash, re-read the topic). If it is the source of truth, a crash loses acknowledged writes in the batch.
- **Intermediate batcher:** e.g. a Like Batcher sums likes per post per minute → 100 writes become 1. Staff-level: check it actually helps (posts with 1 like/hour gain nothing).
- **DB-level:** flush intervals (Redis flushes to disk about every 100 ms). A last resort.
- **Hierarchical aggregation** (live comments/likes for millions of viewers): write processors (by comment ID) aggregate over a window → a root processor merges → **broadcast nodes** (viewers assigned by consistent hashing) fan out to viewers. Avoids the all-to-all problem at the cost of some latency.

### When to use

Flag the bottleneck yourself with numbers, then say e.g.: "I'll partition posts by user ID; for one user posting heavily, a queue and rate limits."

| Scenario | Technique |
| --- | --- |
| Instagram / social | Shard by user ID; vertical partitioning (profiles, posts, analytics); tiered storage for old posts |
| News feed | Balance celebrity fan-out writes against feed reads |
| Search | Partition + batch the indexing pipeline |
| Live comments | Hierarchical aggregation |

Trade-offs to state: queues = delay and eventual consistency; partitioning can hurt reads; batching adds latency and moving parts.

### Common deep dives

| Question | Answer |
| --- | --- |
| **Resharding** (8 → 16 shards) without downtime | Gradual migration: **dual-write** to old and new shards, read preferring the new one, move data in the background, then switch over |
| **Hot key** too big even for one shard (viral tweet, 100k likes/sec) | **Split every key** k ways (`post1Likes-0..k-1`): simple, but k× data and k× reads. Or **split only hot keys dynamically** (e.g. 100 sub-keys), summing on read. Readers must know about splits: simplest is readers always check sub-keys (most common); alternatively writers announce splits. Works only for summable values (likes, views, counts), not atomic records |

## Deep Dive: Kafka

A distributed, durable **append-only log**, usable as a **message queue** or an **event stream**. Lead with your **partition key** and how you'll handle **hot partitions**. "Kafka is always available, sometimes consistent."

### Core concepts

| Term | Meaning |
| --- | --- |
| Broker | A server in the cluster; more brokers = more storage and clients |
| Partition | Ordered, immutable log on a broker; the **unit of parallelism and ordering** |
| Topic | Logical group of partitions you publish to and subscribe to (soccer vs basketball) |
| Producer / Consumer | Writes to / **pulls** from topics (consumer controls its own pace) |
| Consumer group | Each partition goes to **one** consumer in the group, so work is split without overlap |
| Offset | Position of a message in its partition; consumers commit offsets to resume after a crash |

- **Message:** value + **key** + timestamp + headers. `partition = hash(key) % partitions`, so **same key = same partition = ordered** (e.g. all events of one match). No key = spread evenly but unordered.
- **Replication:** a leader per partition handles writes; followers on other brokers copy it; the controller promotes an in-sync follower if the leader dies. Use **replication factor 3** and **`acks=all`** for the strongest durability.
- **Delivery:** at-least-once by default (crash before committing the offset → reprocess). Exactly-once = idempotent producer + transactions.
- **Queue vs stream:** queue = one group processes each message; stream = many groups read independently and can replay. Retention defaults to 7 days (`retention.ms` / `retention.bytes`); longer costs storage.

### When to use

| As a queue | As a stream |
| --- | --- |
| Async work (YouTube: transcode later) | Continuous real-time processing (ad click aggregation) |
| Ordered processing (Ticketmaster waiting queue) | Many consumers read the same data (FB Live comments pub/sub) |
| Decouple producers and consumers so they scale independently | Replay history |

If you need built-in retries and a dead letter queue without extra work, **SQS** can be simpler (used in the Web Crawler design).

### Scaling

- One broker: roughly **1 TB** and up to **~1M msgs/sec** (depends on message size). Below that, don't discuss scaling.
- **Keep messages < 1 MB.** Never put blobs in Kafka: store the video in S3 and send a pointer.
- Scale by adding brokers **and enough partitions** to use them. Scale per topic. Managed options: Confluent Cloud, AWS MSK.
- Throughput tweaks: batch sends, compression (GZIP, Snappy, LZ4), and above all a well-spread partition key.

**Hot partitions** (e.g. a viral Nike ad's clicks):

- **No key:** even spread, but no ordering.
- **Salting:** `adId + random/timestamp`; consumers must re-aggregate.
- **Compound key:** `adId + region` or user segment.
- **Back pressure:** slow producers when partition lag grows.

### Failures and retries

- **Kafka itself down** is unrealistic; you can gently push back on that question.
- **Consumer down:** resumes from the last committed offset; the group **rebalances** partitions to the survivors. Commit only after work is safely stored (Web Crawler: after the HTML is in blob storage). Keep each consumer's work small so less is redone.
- **Producer retries:** built in; enable **`idempotent: true`** to avoid duplicates.
- **Consumer retries:** not built in. Send failures to a **retry topic** with its own consumer, then to a **dead letter queue (DLQ)** after N attempts.

## Deep Dive: Cassandra

Distributed, wide-column NoSQL database, **eventually consistent, write-optimized (LSM tree)**, scales horizontally on commodity hardware. Used by Discord, Netflix, Apple. **Pick it for availability + very high write throughput with a few clear access patterns; avoid it for strict consistency, joins or ad-hoc queries.**

### Data model

- **Keyspace** (like a database; sets replication) → **table** → **row** (by primary key) → **column** (can differ per row; each has a write timestamp; conflicts resolved by **last write wins**).
- **Primary key = partition key + clustering key(s):**
    - **Partition key** decides which node holds the data (`PRIMARY KEY ((a, b), c)` = composite partition key a+b).
    - **Clustering key** sorts rows inside a partition (`WITH CLUSTERING ORDER BY (c DESC)`).
- No joins, no foreign keys, no multi-row transactions (only row-level atomic writes).

### How it works

| Area | Mechanism |
| --- | --- |
| **Partitioning** | Consistent hashing ring + **vnodes** (bigger machines own more vnodes) |
| **Replication** | Next N distinct physical nodes clockwise. **NetworkTopologyStrategy** for production (spread across data centers/racks, e.g. `dc1: 3, dc2: 2`); SimpleStrategy for tests |
| **Tunable consistency** | Per query: ONE … **QUORUM** (n/2 + 1) … ALL. **QUORUM reads + QUORUM writes** overlap on ≥ 1 node, so reads see the latest write |
| **Query routing** | Any node can coordinate: it hashes the key and contacts the replicas |
| **Writes (LSM)** | Commit log (durability) → memtable (memory, sorted) → flushed to immutable **SSTables**. Updates and deletes are new entries; deletes write **tombstones** |
| **Reads** | Memtable → **bloom filters** pick candidate SSTables → newest to oldest; SSTable indexes give byte offsets. **Compaction** merges SSTables and drops tombstones |
| **Cluster membership** | **Gossip** (peer-to-peer, seed nodes, version clocks); no single point of failure |
| **Failures** | Phi accrual detector marks nodes down (kept in the ring, no rebalance); **hinted handoff** stores writes for a down node and replays them; long outages fixed by rebuild/read repair |

### Data modeling: query-first

Design tables around access patterns, not entities. Decide: partition key, maximum partition size, clustering order, and which data to **denormalize** (duplicate) across tables.

- **Discord messages:**
    - v1: `PRIMARY KEY (channel_id, message_id)` sorted newest first; one partition per channel; **Snowflake IDs** (time-sortable, no collisions) instead of timestamps.
    - Busy channels made partitions huge and ever-growing → v2: `PRIMARY KEY ((channel_id, bucket), message_id)` with **10-day buckets**. Partitions stay bounded; recent messages usually sit in one partition.
- **Ticketmaster seat browsing** (eventual consistency OK; checkout checks a consistent DB):
    - v1: `(event_id, seat_id)` → huge partitions, aggregation on every view.
    - v2: `tickets` with `PRIMARY KEY ((event_id, section_id), seat_id)` for the section view, plus a denormalized **`event_sections`** table `(event_id, section_id)` holding ticket count and min price for the venue map (approximate counts like "100+" are fine).

### Advanced features

- **Storage-Attached Indexes (SAI):** secondary indexes for less frequent queries, instead of yet another table.
- **Materialized views:** Cassandra keeps a denormalized copy of a table up to date for you.
- **Search:** plug in Elasticsearch/Solr (e.g. Lucene index plugin).

### In an interview

- **Use:** availability over consistency, huge write volume (messages, events, time series, IoT), sparse or flexible columns, a few well-known query patterns.
- **Avoid:** strong consistency or transactions (payments), joins, ad-hoc aggregations.

## Pattern: Real-time Updates

Two separate problems: **hop 1** — getting updates from server to client (protocol); **hop 2** — getting updates from the source to the right server (trigger). **Start simple: polling unless real-time is truly needed.** Typical answer: **SSE or WebSockets + Pub/Sub.** (Networking basics are in Networking Essentials.)

### Hop 1: server → client

| Option | How | Pros | Cons | Use when |
| --- | --- | --- | --- | --- |
| **Simple polling** | Client requests every N sec (keep-alive helps) | Simplest, stateless, no special infra, quick to explain | Delay up to the interval; wasted requests (1M clients / 10 s = 100k QPS) | Not latency-sensitive; real-time isn't the core problem. "I'll start with polling so I can focus on X" |
| **Long polling** | Server holds the request until data arrives; client re-requests | Plain HTTP, easy | Extra latency on bursts (re-request round trip); hard to monitor; browser per-domain limits; align LB timeouts (15–30 s) | Rare updates; waiting for an async job (payment status) |
| **SSE** | One HTTP response streamed in chunks; browser `EventSource` auto-reconnects with last event ID | Efficient, HTTP-based, simple | **Server → client only**; some proxies buffer streams; connections last ~30–60 s | Push-only feeds: dashboards, auction prices, **AI token streaming**. Writes go over normal POST |
| **WebSockets** | HTTP upgrade → persistent two-way connection | Full duplex, low overhead per message | Stateful; needs infra support (prefer **L4 LB**); reconnects; deploys drop connections; uneven load | **Frequent two-way** traffic: chat, games. Don't pick it too eagerly |
| **WebRTC** | Peer-to-peer over UDP via signaling server + STUN (NAT hole punching) / TURN (relay fallback) | Lowest latency, saves server bandwidth | Complex setup, NAT issues, slow to connect | **Audio/video calls**, screen share, some P2P collaboration (Canva cursors, CRDT docs) |

**Decision flow:** not latency-sensitive → polling · one-way → SSE · frequent two-way → WebSockets · audio/video → WebRTC.

**WebSocket tips:** terminate sockets in a dedicated WebSocket service so the rest of the system stays stateless (and that service rarely redeploys); **least-connections** load balancing; on deploy, drop and let clients reconnect; keep heavy processing in other services.

### Hop 2: source → server

| Approach | How | Pros | Cons | Use when |
| --- | --- | --- | --- | --- |
| **Pull via polling** | Updates stored in a DB; clients query "since my last message" | Simple; state only in the DB; decoupled | Latency; heavy DB reads from many pollers | Real-time not required |
| **Consistent hashing** | Each user/document owned by one server on a hash ring; a coordinator (**ZooKeeper/etcd**) tracks servers; clients redirected to the owner; senders hash the ID to find the server | Predictable owner; little churn when scaling; keeps **heavy per-connection state** in one place | Complex; needs a coordinator; state lost if a server dies | Stateful sessions, e.g. **Google Docs** document editing |
| **Pub/Sub** (default) | Clients connect to **any** lightweight endpoint server, which subscribes to a topic (e.g. one per user) in Redis/Kafka; publishers post to the topic | Endpoint servers stay simple; easy least-connections balancing; efficient broadcast; < 10 ms extra | Can't tell if subscribers are connected; pub/sub is a bottleneck/SPOF (shard it: Redis Cluster); many-to-many connections | Broadcasting small messages to many clients: **chat**, notifications |

**Scaling with consistent hashing:** announce the scaling event with old and new assignments → move clients gradually → send messages to both old and new servers in the meantime → finalize assignments in the coordinator. Watch the central lookup becoming a bottleneck.

### Interview scenarios

| Scenario | Approach |
| --- | --- |
| Chat | WebSockets + pub/sub; ordering, typing indicators, presence |
| Live comments | Hierarchical aggregation + batching for huge fan-out |
| Collaborative editing | WebSockets + consistent hashing; conflicts via OT or CRDTs |
| Live dashboards | SSE; decide what "real-time enough" means |
| Games | WebRTC for peers + WebSockets for coordination |

Flag real-time needs early ("messages must arrive instantly — WebSockets"). Skip real-time entirely when polling is good enough; senior interviews reward the simpler design.

### Common deep dives

| Question | Answer |
| --- | --- |
| Connection drops / reconnects | **Heartbeats** to detect dead connections; **sequence numbers** or a per-user queue (e.g. **Redis Streams**) so reconnecting clients get what they missed |
| Celebrity with millions of followers | Store the update once; distribute through layers (regional servers pull and push locally); see hierarchical aggregation in Scaling Writes |
| Message ordering across servers | Simplest: send related messages through **one server/partition** and stamp them there. Vector/logical clocks mainly for deep infra questions |

## Pattern: Dealing with Contention

Contention = many requests competing for one resource (last ticket, auction item). The bug is a **lost update**: read → decide → write is not atomic, so two buyers both see "1 seat" and both buy. **Fix it at the single source of truth, using the simplest tool that fits.** Make sure the contended thing exists as one row/key/item the store can guard.

### Choosing a tool (take the first that fits)

| Situation | Tool | How | Avoid when |
| --- | --- | --- | --- |
| The check is a condition on the row being written (counter, status, claim) | **Conditional write** (start here) | `UPDATE ... SET available = available - 1 WHERE id = X AND available > 0`; claim a seat with `WHERE status = 'available'`. **Check rows affected** (0 is not an error); chain follow-up inserts to it (`WITH ... RETURNING` → `INSERT ... SELECT`) | Decision needs app logic or other rows |
| Read, decide in app code, then write; **high contention** | **Pessimistic lock** | `SELECT ... FOR UPDATE` on the rows, decide (e.g. find 4 adjacent seats), update, commit | Conflicts are rare (every request pays for the lock) |
| Same, but **conflicts are rare** | **Optimistic concurrency (OCC)** | `version` column; `UPDATE ... SET ..., version = version + 1 WHERE version = 42`; 0 rows → re-read and retry. Same as HTTP ETag/If-Match, etcd revision, DynamoDB version attribute | High contention (retry storms) |
| Rule spans rows that never collide (**write skew**: two on-call engineers both step down) | **SERIALIZABLE** isolation, or move the rule onto one row (count on the team row, lock that row) | DB aborts one transaction; the app retries | Hot paths (expensive tracking and aborts); mostly unavailable outside relational DBs |
| Hold must outlast one transaction (10-min seat hold, external call, many steps) | **Distributed lock / lease** | See below | A single-row guard inside one transaction already works |

**Key lesson:** guard the thing people actually fight over. A seat counter proves "a seat is left", not "seat A15 is free", so give each seat its own row.

### Lock and OCC pitfalls

- **Lock as little as possible, for as short as possible.** Never call a payment API while holding a lock; do slow I/O before or after.
- **Deadlocks:** two transfers lock accounts in opposite order. Fix: **always lock in a fixed order** (sort by ID, not "initiator first"); the DB still detects deadlocks, so catch the error and retry.
- **ABA problem (OCC):** a value goes A → B → A and the check passes wrongly. Use a **dedicated version counter** that always increments (or every field you read in the WHERE, or Postgres `xmin`). Business values are only safe as versions if they move one way (auction high bid).
- Isolation levels: Read Uncommitted · **Read Committed** (Postgres default) · **Repeatable Read** (MySQL default) · Serializable. Only Serializable catches write skew.

### Distributed locks (leases)

| Where | How | Trade-off |
| --- | --- | --- |
| **Redis** | `SET key owner NX EX 600` (NX is essential) | Fast, self-expiring. A stalled holder past its TTL can briefly overlap another holder → fine for soft holds, not for correctness. Redis is a SPOF |
| **DB columns** | `UPDATE seats SET reserved_by = ?, reserved_until = NOW() + 10 min WHERE id = ? AND (reserved_until IS NULL OR reserved_until < NOW())` | No new infra; expired holds count as free without cleanup; slower; lock row can get hot |
| **ZooKeeper / etcd** | Consensus-backed leases; ephemeral nodes vanish when the client dies | Most robust; another cluster to run |

Reservations are also **better UX**: the conflict happens at seat selection, not after entering payment.

Equivalents outside SQL: conditional write = DynamoDB `ConditionExpression`, Redis `SET NX`, Cassandra LWT, HTTP `If-Match`; lock = mutex/distributed lock.

**Boundary:** keep contended data in **one database** whenever possible. An operation spanning services or shards is a **distributed transaction** (see Multi-step Processes); multi-leader writes need conflict resolution (last write wins, vector clocks, CRDTs).

### Interview use

**Signals:** limited inventory (tickets, flash sales, auctions, driver matching), double-booking or double-charging risk, balances, simultaneous updates from many servers. Raise it yourself when the requirements call for strong consistency.

| Scenario | Approach |
| --- | --- |
| Auction | OCC using the **current high bid** as the version (only goes up, so no ABA) |
| Ticketmaster | **Seat reservation with a 10-min TTL**, then a conditional write at purchase |
| Banking (one DB) | Pessimistic lock in ID order, or OCC; across services → distributed transaction |
| Ride dispatch | Set driver to `pending_request` with a ~10 s expiry (cache TTL or expiry column) |
| Flash sale | OCC on inventory + TTL cart holds |
| Yelp ratings | OCC with a version column when updating the average |

Sample lines: "Bidders compete, so I'll use OCC with the high bid as the version." · "I'll reserve the seat for 10 minutes so users don't lose it after entering payment."

**Don't overcomplicate:** no Redis lock when a row lock or OCC works; low contention → OCC + retry; single-user data needs no coordination.

### Common deep dives

| Question | Answer |
| --- | --- |
| Prevent deadlocks | Ordered locking + retry on the DB's deadlock error |
| ABA with OCC | Dedicated version column |
| Everyone wants one item (celebrity, Taylor Swift drop) | Sharding, load balancing and replicas don't help one row. **First change the problem** (split into 10 identical items, make likes/follows eventually consistent). Else **queue-based serialization**: one queue + single worker for that item (sequential, absorbs spikes; caps throughput; needs a standby) |

## Pattern: Multi-step Processes

Workflows across flaky services, external callbacks and humans (charge → reserve inventory → ship → email) that must survive crashes, retries and deploys, and run for hours to days. **Progression: single server → saga (choreography or orchestration) → workflow engine / durable execution (Temporal, Step Functions).** Big in AI-agent pipeline questions too.

### Why the naive approach breaks

- **One server runs the steps in order:** a crash mid-way loses all memory of progress (charged but not reserved); a payment webhook can land on a different server.
- **Patch with DB checkpoints + pub/sub for callbacks:** now you hand-build a state machine, a poller to find stalled orders, locking so two servers don't grab the same order, retries, and still **no compensation**. A sign you need a real solution.

### Sagas

- A sequence of local steps, each with a **compensating action** (refund the payment, release the inventory). On failure, run compensations backwards.
- Why not one distributed transaction (2PC)? Locks held across slow services, a stuck coordinator blocks everyone, and external systems (payment gateways) don't support it. Sagas guarantee **what happened can be undone**, not all-or-nothing.
- Cost: brief inconsistency (order "pending" after the charge). **Compensations can fail too** → retries, idempotency, and a manual fallback.

| Coordination | How | Best for |
| --- | --- | --- |
| **Choreography** | No coordinator: workers react to events and emit new ones | Independent teams/services, mid-complexity flows |
| **Orchestration** | One coordinator owns the flow | Complex flows needing central control and visibility |

### Option 1: Event-driven choreography

- Events go into a durable log (**Kafka**, or Redis Streams): `OrderPlaced` → payment worker → `PaymentCharged` / `PaymentFailed` → inventory worker → ... Compensation runs the same way (payment worker hears `InventoryFailed` → refund → `PaymentRefunded`). The API just emits the first event.
- **Pros:** fault tolerant (consumer groups commit offsets; **workers must be idempotent**), scales up to the partition count, full audit trail, easy to add new listeners.
- **Cons:** the flow isn't written anywhere; inserting a step means changing event contracts; you need lots of tooling to trace what happened. Good for mid-complexity only.

### Option 2: Workflow orchestration (preferred for complex flows)

**Durable execution (Temporal; Cadence came first at Uber):** write the workflow as normal code.

- **Workflow** = the flow/decisions; must be **deterministic** (no network calls, random values or clock reads directly).
- **Activity** = one step that touches the outside world; must be **idempotent** (it may be retried).
- **Recovery by replay:** every activity result is saved in a history DB. After a crash, a new worker reruns the workflow from the top; finished activities return their saved result instead of running again, so execution continues exactly where it stopped. The customer is charged once.
- Parts: Temporal Server (schedules tasks, timers, records progress; doesn't run your code), history DB, workflow and activity worker pools.
- **Signals** wait for external events (human pickup, webhook, signature) **without holding a thread**; durable timers (e.g. wait 30 days).

**Managed workflow systems** (AWS Step Functions, Google Cloud Workflows, Azure Durable Functions): define the workflow as a state machine/DAG in JSON/YAML (or generate it with AWS CDK). Visual diagrams and nothing to operate; less expressive. Step Functions limits: 1-year runs, 256 KB payloads.

| Tool | Notes |
| --- | --- |
| **Temporal** | Most powerful open-source option; code-based; you operate it (or Temporal Cloud) |
| **AWS Step Functions** | Serverless, managed; JSON state machines |
| Azure Durable Functions / Google Cloud Workflows | Managed, easier, less flexible |
| Apache Airflow | Scheduled batch / ETL pipelines, not user-facing event flows |
| DBOS, Hatchet, Netflix Conductor | Fine to name-drop |

The specific tool matters less than **knowing how it recovers and its limits**.

### When to use

- **Signals:** flowchart-like processes; "if step X fails, undo Y"; "all steps or none"; payments/e-commerce; **human-in-the-loop** (driver accepts a ride); long waits; audit needs.
- **Depth by level:** mid-level = recognize the need and name a tool; senior/staff = defend it, explain failures, compensation and the deep dives.
- **Don't use for:** single async steps (resize an image, send an email → just a queue), synchronous latency-sensitive requests, high-volume low-value operations (engine overhead per step).

### Common deep dives

| Question | Answer |
| --- | --- |
| Saga coordinator crashes mid-way | Store progress durably; on restart resume forward or compensate; steps idempotent. Workflow engines give you this for free |
| Change a workflow with 10,000 running | **Versioning** (old runs keep old code, new runs use new code; slow to take effect) or **migration**: Temporal `patched("change")` picks the path deterministically; Step Functions runs stay pinned to their original definition (restart them or pre-model the branch) |
| History grows too big | Pass IDs instead of large payloads; **Continue-as-New** (snapshot state, start a fresh run with empty history) |
| Wait 5 min or 5 days for a signature | **Signal** + durable timer: wait up to 30 days, send a reminder, wait 7 more, then cancel. Webhook → engine API → wakes the workflow |
| Make a step happen exactly once (refund, email) | Delivery is at-least-once; make the **effect** exactly-once with an **idempotency key**: mark IN_PROGRESS → do it → COMPLETED. COMPLETED → skip; IN_PROGRESS → reconcile with the provider rather than blindly retry |

## Pattern: Handling Large Blobs

Files go in **blob storage** (S3: unlimited, 11 nines durability), metadata in the **database**. Rule of thumb: **> 10 MB and no SQL queries → blob storage.** Don't proxy bytes through app servers (they become slow, costly pipes). **Clients upload directly with presigned URLs and download via CDN; servers only handle permissions and metadata.**

### Direct upload and download

- **Presigned URL:** the server checks the user and quota, then signs a URL in memory (no call to S3) for one object key, one action, 15 min–1 h. Anyone holding it can use it, so **sign in limits**: `content-length-range` (size) and `content-type`. The client does a `PUT` straight to storage (nearest region).
- **Downloads:** presigned storage URL (simple, cheap, infrequent files) or **CDN signed URL/cookie** (CloudFront). The CDN checks signatures at the edge with a public key, so no call back to you.
- **Resumable (multipart) upload:** S3 multipart (parts ≥ 5 MB, each with its own presigned URL); GCS/Azure use one session URL with chunks. On failure, list uploaded parts and resume from the missing one. Progress = parts done. Finish with a **complete** call (part list + checksums). Lifecycle rule deletes incomplete uploads after 24–48 h (they cost money).

### Keeping DB and storage in sync

- When issuing the URL, create the DB row with `status = 'pending'` and the **storage key** (server-chosen, e.g. `uploads/{user_id}/{timestamp}/{uuid}`; never client-chosen).
- **Don't trust a client "done" call:** races, orphan files, faked completions, lost notifications.
- **Storage event notifications** (S3 → SNS/SQS/Lambda) carry the key → update that row.
- **Reconciliation job** periodically checks rows stuck in pending against storage, in case events are lost.
- Keep rich metadata in the DB, not object tags (S3 allows only 10 tags; can't query them). Conditional uploads that require metadata headers are possible but rarely needed.

### Provider equivalents

| Feature | AWS | Google Cloud | Azure |
| --- | --- | --- | --- |
| Temporary upload URL | Presigned URL | Signed URL | SAS token |
| Chunked upload | Multipart (5 MB–5 GB parts) | Resumable upload | Block blobs (4–100 MB) |
| Upload events | S3 Event Notifications | Pub/Sub | Event Grid |
| Signed CDN | CloudFront | Cloud CDN | Azure CDN |
| Cleanup | Lifecycle rules | Lifecycle management | Lifecycle policies |

### When to use

**Any file > ~10 MB.**

| Scenario | Flow |
| --- | --- |
| YouTube | Presigned multipart upload → S3 event triggers transcoding → CloudFront signed URLs for adaptive streaming |
| Instagram | Direct upload of originals (50 MB+) → event → workers make thumbnails/filters → CDN with signed URLs (stops hotlinking) |
| Dropbox | Chunked presigned uploads → sync workflows; shares are time-limited signed URLs |
| WhatsApp | Media uploaded directly; chat passes only the file reference; recipients get expiring download URLs |

**Don't use for:** small payloads (< 10 MB, just use the API); uploads that must be **validated synchronously** (CSV headers); **compliance scanning** before storage (proxy it, in chunks); instant content-based UX (e.g. face detection on upload).

### Common deep dives

| Question | Answer |
| --- | --- |
| Upload fails at 99% | Multipart/resumable upload; the client keeps the upload ID (e.g. in localStorage), lists completed parts, resumes; lifecycle cleanup of abandoned parts |
| Prevent abuse | **Quarantine bucket** first → virus scan, content/type checks → move to the public bucket and mark available. Always sign size limits into the URL |
| Metadata | DB row created as `pending` with the storage key when the URL is issued; events + reconciliation flip it to completed |
| Fast downloads | **CDN** (~200 ms → ~5 ms after first request); **HTTP range requests** for resumable downloads of big files; parallel chunk downloads only for multi-GB files when users complain |

## Pattern: Managing Long-Running Tasks

Anything taking more than a few seconds (PDF reports, video transcoding, thumbnails, bulk email, CSV imports) shouldn't run inside the request: load balancers time out around 30–60 s, users retry, and web servers get tied up. **Accept quickly → queue → process asynchronously → notify when done.** The web tier only validates and returns a **job ID**; a **worker pool** does the work.

### Flow

1. Web server validates the request, creates a job row (`pending`).
2. Pushes the **job ID** (not the payload) to the queue.
3. Returns the job ID immediately.
4. Worker pulls it, loads the job from the DB, sets `processing`.
5. Does the work; stores results (S3 for files, DB for metadata).
6. Sets `completed`/`failed`; notifies the user (email, push, WebSocket) or the client polls a status endpoint.

Each part can fail on its own: queue down → jobs wait as pending in the DB; workers down → jobs wait in the queue.

### Trade-offs

| Gain | Cost |
| --- | --- |
| Millisecond API responses, immediate acknowledgement | More moving parts (queue, workers, job tracking) |
| Web and workers scale independently; right hardware for each (GPU workers, cheap web servers) | Eventual consistency: work isn't done when the API returns |
| Fault isolation: a crashed worker doesn't take down the API; retries | Status storage, endpoints, retries to build |
| Better resource use | Monitoring queue depth, failures, latency; new failure modes (full queue, poison messages) |

### Technology

| Queue | Notes |
| --- | --- |
| Redis + Bull/BullMQ | Simple; retries, delays, priorities built in; memory-first, so a hard crash can lose jobs |
| AWS SQS | Fully managed, guaranteed delivery; pay per message; 1 MB limit (pass IDs) |
| RabbitMQ | Rich routing; self-hosted, more ops work |
| **Kafka** | Safe default at scale: replay, fan-out, retention, ordering per partition |

| Workers | Notes |
| --- | --- |
| **Regular servers** (default) | Simple, easy to debug, no time limit; you pay for idle capacity |
| Serverless (Lambda) | Great for spiky loads, pay per use; 15–60 min limit, cold starts, little local disk |
| Containers (Kubernetes/ECS) | Middle ground: autoscaling, long jobs allowed; more complex |

Interview default: Kafka (or the queue you know best) + regular worker processes. Focus on separating concerns, not queue debates.

### When to use

- **Slow operations mentioned:** "Transcoding takes minutes, so I'll return a job ID and process it async."
- **The math doesn't work:** 1M images/day × 10 s ≈ 12/s ≈ 120 s of work per second, too much for web servers → worker pool on compute-optimized machines.
- **Different hardware needs:** don't run GPU/ML work on the servers that handle logins.
- **Crash or 10x traffic questions:** a crashed worker's job is picked up by another.
- Examples: YouTube (transcode, thumbnails, captions, moderation), Instagram (resizes, tagging, celebrity fan-out), Uber (matching while showing "finding drivers"), Stripe (fraud checks, webhooks, delayed settlements), Dropbox (scanning, indexing, previews, sync).

### Common deep dives

| Question | Answer |
| --- | --- |
| Worker crashes mid-job | **Heartbeat / visibility timeout** (SQS visibility timeout, RabbitMQ heartbeat, Kafka session timeout); the job goes back to another worker. ~10–30 s: too long delays recovery, too short marks slow jobs (GC pauses) as dead |
| Job keeps failing (poison message) | After 3–5 attempts move it to a **Dead Letter Queue (DLQ)**; monitor and alert on it; fix and re-queue |
| User clicks 3 times | **Idempotency key** (user + action + rounded time, or a hash of the input): return the existing job ID. Make the work itself idempotent (check whether the email already went) |
| Black Friday 10x load | **Backpressure:** cap queue depth, reply "system busy". **Autoscale workers on queue depth**, not CPU |
| 5-second and 5-hour jobs in one queue | Separate **fast** and **slow** queues (different worker counts and instance types) to avoid head-of-line blocking; or split big jobs into chunks; or move jobs that exceed a time limit to the slow queue |
| Jobs that depend on each other (fetch → PDF → email) | Simple chains: each worker queues the next step with full context (`workflow_id`, step, S3 URLs). Complex branching: Step Functions, Temporal or Airflow (see Multi-step Processes) |

## Deep Dive: Proximity Search

A B-tree sorts on **one** dimension, so lat/long indexes (even composite) return a huge strip of the map, then check distances row by row. **A spatial index only produces a small candidate set; always finish with an exact distance/geometry filter.** Two approaches, chosen by the shape of your data:

**Rule:** **spatial tree for shapes** (polygons, roads, zones) · **encoded cells for moving points** (drivers, users) · **always post-filter.**

### Approach 1: Custom spatial trees

| Tree | How | Strength | Weakness | Used in |
| --- | --- | --- | --- | --- |
| Quadtree | Split each cell into 4 until few points remain; search leaf + neighbor leaves | Adapts to density (deep downtown, coarse over lakes) | Splits at geometric midpoints → deep in dense areas, uneven latency; pointer-based, poor on disk | In memory: map tiles, game collision detection |
| k-d tree → **BKD tree** | Alternate x/y splits **at the median** (balanced, log n depth); BKD packs points into disk-page blocks | Balanced regardless of clustering | k-d is pointer-based; BKD is built once (**write-once**), bad for churning data | **Elasticsearch** geo fields |
| **R-tree** (R*-tree) | Wrap each object in a minimum bounding rectangle, nest rectangles; balanced, page-sized nodes like a B-tree | Handles **points, lines and polygons** (containment, intersection) | Overlapping rectangles → search several branches; rebalancing makes writes costly | **PostGIS** (GiST), SQLite, Oracle Spatial |

### Approach 2: Encoded keys (cell IDs on a normal index)

Turn lat/long into a sortable key or cell ID and use an ordinary B-tree or sorted set. No spatial extension; a moving driver = **one cheap integer update** (scales to millions of writes/sec).

| Scheme | How | Notes |
| --- | --- | --- |
| **Geohash** | World → 32 cells → 32 sub-cells... one base32 char each (5 bits); 5 chars ≈ 5 km, 6 ≈ 1 km, 9 ≈ 5 m. Shared prefix ≈ nearby | Query = prefix scan (`WHERE geohash LIKE 'dr5ru%'`); Redis GEO stores a 52-bit geohash as a sorted-set score (range query). **Boundary problem** → query the **3×3 cells** (own + 8 neighbors), then post-filter. Cells distort away from the equator |
| **S2** (Google) | Cube projected onto the sphere; roughly equal-area cells; 64-bit hierarchical IDs (truncate for parent) | Good at global scale, handles the antimeridian; used by MongoDB `2dsphere` |
| **H3** (Uber) | **Hexagons**: 6 equidistant neighbors, clean "rings" for dispatch and heat maps | IDs aren't range-ordered; compute the ring of cell IDs and look them up: `WHERE h3_cell IN (...)`. Uber dispatch: drivers in ~200 m cells, rider's cell + ring (widen if needed), post-filter |

### Interview tips

- The point that scores: explain **why a plain index fails** on lat/long, choose the boring production option, and talk through the trade-off. Naming geohash vs S2 vs H3 is a bonus.
- Geometry questions (delivery zone contains address) → PostGIS/R-tree.
- Live moving points (Uber, Find My Friends) → geohash/H3 cells in Redis or a regular index.
- Small datasets (~1,000 items) → just scan.

## Problem: Metrics Monitoring (Datadog / Prometheus)

### Requirements

- **Functional:** ingest metrics from services; query and visualize on dashboards; define alert rules (threshold over a time window, e.g. p99 > 500 ms for 5 min); send notifications (email, Slack, PagerDuty). *Out of scope:* logs, tracing, ML anomaly detection.
- **Non-functional:** **500k servers × 100 points / 10 s = 5M metrics/sec (~1 GB/s)**; dashboards answer in seconds over days or weeks; alerts fire < 1 min after emission; highly available (eventual consistency OK for dashboards, alerts must be reliable); handle late/out-of-order data. *Out of scope:* multi-region, strong consistency.
- Why < 1 min is fine: most alerts use averages/trends. For instant detection, design a stable metric (Amazon: milliseconds since the last order).

### Entities, data flow and API

- **Label** (`host="server-1"`) · **Metric** (name + labels + value + time) · **Series** = one unique metric + label combination over time (500k hosts → 500k series; more labels multiply it = **cardinality explosion**) · **Alert rule** · **Dashboard**.
- Flow: emit → ingest/store (write-heavy, constant) → query (read-heavy, bursty) → evaluate alerts → notify (must be reliable).
- API (protobuf on the wire at this scale):
    - `POST /metrics/ingest` with a batch of `{name, labels, value, timestamp}`.
    - `GET /metrics/query?query=avg(cpu_usage{region="us-east"})&start&end&step` (PromQL-style DSL).
    - `POST /alerts/rules` with `{name, query, for: "5m", notifications}`.

### High-level design

1. **Ingestion:** ✗ just add ingestion servers (the DB is still the bottleneck; no buffer or replay) → ~ **Kafka** between ingestion and storage, partitioned by hash(metric + labels): absorbs spikes, durable, parallel → ✓ **agents on every server** (Datadog Agent / OTEL collector) collect, aggregate, batch and buffer locally, then flush (5M points/s becomes ~50k requests/s) **+ Kafka**. Catching up after an outage needs spare capacity; dropping some data can beat staying permanently behind.
2. **Storage and queries:** ✗ Postgres (can't take 5M writes/s, sharding breaks queries, deletes are costly) → ✓ **time-series DB** (InfluxDB, TimescaleDB, VictoriaMetrics): append-only/LSM writes, time partitions (drop old chunks), columnar compression (~100 KB → 5 KB per host-day), built-in rollups. Partition by time + hash(series). Retention: raw 10 s for 15 days, 1 min for 90 days, 1 h for a year. Separate **query service** (DSL → TSDB, caching) so reads and writes scale independently.
3. **Alerts:** don't jump to Flink. **Alert evaluator polls**: rules in Postgres, run as scheduled queries against the TSDB every minute (how Prometheus works) → emits alert events.
4. **Notifications:** don't call Slack/PagerDuty from the evaluator. A **Notification Service** (like Alertmanager) handles **dedup** (notify only when an alert starts firing or resolves), **grouping** (30-s window by cluster/service: one page, not 100), **silencing** (maintenance) and **escalation** (no acknowledgement → another channel).

### Deep dives (✗ bad · ~ good · ✓ great)

**1. Fast dashboards over weeks of data**

- ✗ Query raw data: 30 days × 1,000 pods at 10 s ≈ 259M rows ≈ 25 GB per panel → minutes.
- ~ **Rollups at several resolutions** (raw 2 days, 1 min 2 weeks, 1 h 90 days, 1 day 2 years); the query engine picks one by time range (30 days → 720 hourly points). Lossy: keep **histograms/sketches** for percentiles.
- ✓ **Redis cache + query splitting:** recent ~2 h straight from the DB, older ranges from cache; precompute popular dashboards; cache results by query + time range (refreshes overlap heavily). < 100 ms. Watch invalidation after backfills, and cache size.

**2. Alerts faster than 1 minute**

- ~ Poll every 15–30 s (10k rules every 15 s ≈ 670 queries/s, competes with dashboards; still up to 14 s late).
- ✓ **Flink** as a second Kafka consumer: windowed state per series (e.g. 5-min buffer), rules compiled into operators, no DB queries, seconds of latency. Needs checkpointing and careful rule updates. Use it only for critical alerts; keep polling for the rest.

**3. High availability**

- ✗ Single instances, direct calls to Slack.
- ~ Redundant everything: multiple ingestion servers, replicated Kafka (leader election, ISR), replicated TSDB, Flink consumer group, notification retries + queue. Risk: long lag exceeds Kafka retention.
- ✓ **Every step resumable:** agents buffer and retry; Kafka replicated across zones; **idempotent writes**; checkpointed alert state; **alert events written to Kafka before notifying**; retry + fallback channel. **Late beats lost**: lose freshness, not correctness. Add SLOs and a watchdog. **Monitor the monitoring system with a separate system.**

**4. Cardinality explosion** (`http_requests` × hosts × regions × endpoints × status × method → tens of millions of series; slow writes, memory use, slow aggregations)

- In ingestion, before publishing to Kafka: **policy store** (Postgres: allowed labels per metric, max series, per-label limits) + **cardinality tracker** (Redis set of series per metric).
- Flow: drop labels not on the allowlist → hash labels to a series ID → known series? accept : under cap? accept : **drop and count `dropped_metrics`** + alert the team.
- Tune policies per metric; reduce Redis calls with batching or a local **bloom filter**.

### Expectations by level

| Level | Breadth / depth | Bar |
| --- | --- | --- |
| Mid | 80 / 20 | Ingest → store → query → alert; a queue for scale; a TSDB (and why not Postgres); polling alerts; discuss cardinality if asked |
| Senior | 60 / 40 | Raise cardinality yourself + controls; streaming vs polling alerts; rollups and retention; 2–3 deep dives done well |
| Staff+ | 40 / 60 | Drives the discussion: monitoring the monitor, backpressure cascades, alert fatigue, multi-tenant isolation, pull (Prometheus) vs push (Datadog), histogram aggregation, migrations |
