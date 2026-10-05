# Languages

Notes on programming languages — idioms, how they really behave under the surface, the traps, and
how each compares to the languages you already know.

## What belongs here

- **Idioms:** the way the language wants to be written ("idiomatic Kotlin", not Java in Kotlin syntax)
- **Internals:** memory model, concurrency model, type system, how the compiler or runtime works
- **Gotchas:** surprising behaviour you hit, with a minimal example
- **Comparisons:** the same concept across languages (null safety, async, generics, error handling)
- **Snippets:** small runnable examples worth keeping

## Languages

| Folder | Language | Focus |
| --- | --- | --- |
| `kotlin/` | Kotlin | Null safety, data and sealed classes, coroutines and Flow, generics and variance, JVM interop |
| `typescript/` | TypeScript | The type system (unions, narrowing, generics, utility types), async patterns, Angular-related patterns |
| `dart/` | Dart | Null safety, async/await and streams, isolates, Flutter-related patterns |

Add a folder when you start a new language (for example `go/`, `python/`, `rust/`).

## Layout inside each language

```
languages/kotlin/
├── README.md        ← what you know well, what you are learning, best resources
├── idioms.md        ← how the language wants to be written
├── concurrency.md   ← e.g. coroutines, structured concurrency, cancellation
├── gotchas.md       ← surprises, each with a tiny example
└── snippets/        ← small runnable files
```

## Cross-language comparisons

Keep comparisons in `comparisons.md` at this level — one section per concept, one row per language:

| Concept | Kotlin | TypeScript | Dart |
| --- | --- | --- | --- |
| Null safety | `String?`, `?.`, `?:` | `strictNullChecks`, `?.`, `??` | Sound null safety, `?`, `??` |
| Async | Coroutines, `suspend` | Promises, `async/await` | Futures, `async/await`, Streams |

## How to add a note

Use the language-note template in [`templates/`](../templates/), log it in the root `LEARNING.md`,
and include a minimal example for every claim — a gotcha without code is hard to trust later.