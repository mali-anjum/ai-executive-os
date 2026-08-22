# Frontend Testing Standards — Building Stage

We are currently in the product **BUILDING** stage, so do not create tests for every UI file.

## Core Rules
1. Test meaningful behavior, logic, and user interactions.
2. **Atoms:** Normally do not test unless they contain meaningful logic or interaction.
3. **Molecules:** Test when they contain meaningful behavior, state, or business logic.
4. **Organisms:** Test important behavior and user interactions.
5. **Screens:** Test important user workflows/behavior, not implementation details.
6. **Hooks, state, utilities, and services:** Test meaningful logic because these are higher-risk areas.
7. Critical workflows should be covered by E2E tests.
8. When modifying existing code, update/add tests when the behavior being changed is already tested or is important enough to require coverage.
9. Do not create tests merely to increase coverage numbers.
10. Do not test simple rendering, static markup, styling, or trivial wrappers unless there is a specific reason.
11. Tests should verify BEHAVIOR and expected outcomes, not implementation details.
12. Before adding a new test, ask: "Does this test protect important behavior or prevent a realistic regression?"
13. Keep tests close to the relevant frontend code using `*.test.ts` / `*.test.tsx`.
14. AI-generated code must not be considered correct until the relevant tests/type checks/linting pass.
