# Algorithms

Data structures, algorithm patterns and solved problems — written so that the **key insight** is
easy to find again, not just the code.

## What belongs here

- **Patterns:** one note per technique, with how to recognise when it applies
- **Problems:** solved problems, each with the insight, the complexity and the mistake you made first
- **Data structures:** how they work, their operations' costs, and when to pick them
- **Complexity:** Big-O cheat sheets and analysis tricks

## Patterns to cover

| Group | Patterns |
| --- | --- |
| Arrays and strings | Two pointers, sliding window, prefix sums, hashing, sorting-based approaches |
| Search | Binary search (including on the answer), BFS, DFS, backtracking |
| Linked structures | Fast/slow pointers, in-place reversal, merge techniques |
| Trees | Traversals, recursion on subtrees, binary search trees, lowest common ancestor, tries |
| Heaps | Top-K, merge K sorted, two heaps (running median), scheduling |
| Graphs | Topological sort, union-find, shortest paths (Dijkstra, Bellman-Ford), minimum spanning tree, cycle detection |
| Dynamic programming | 1-D and 2-D DP, knapsack, longest subsequence, intervals, DP on trees and graphs, memoisation vs tabulation |
| Greedy and intervals | Interval merging and scheduling, greedy choice proofs |
| Other | Bit manipulation, monotonic stack/queue, math and number theory |

## Layout

```
algorithms/
├── patterns/          ← one file per pattern, e.g. patterns/sliding-window.md
├── data-structures/   ← one file per structure, e.g. data-structures/heap.md
└── problems/          ← one file per problem, grouped by pattern in the file name,
                         e.g. problems/sliding-window--longest-substring-no-repeats.md
```

## How to record a problem

Use the problem template in [`templates/`](../templates/). The parts that matter most later:

1. **The insight** in one or two sentences — the thing that makes the solution work
2. **How to recognise it** next time — the clue in the problem statement
3. **Complexity** — time and space, with a one-line reason
4. **Mistakes** — what you tried first and why it failed
5. **Revisit date** — come back in 1 week and again in 1 month; re-solve without looking

Solutions can be in any language you are practising (see [`languages/`](../languages/)).