# Agent Loop Demo

This repository is a small TypeScript project that demonstrates the core control loop behind a tool-using LLM agent. It is intentionally simple: the model can either answer the user or request one or more predefined tools, while the application remains responsible for executing those tools and returning their results.

The central lesson is that an agent is not a single model call. It is an iterative process in which the model repeatedly observes the conversation state, chooses the next action, receives new information, and decides whether another action is needed.

## The iterative model

The main loop lives in `src/index.ts`:

```text
User question
     |
     v
Send messages and tool definitions to the model
     |
     v
Did the model request a tool?
  |-- Yes -> Run the tool -> Add its result to messages -> Repeat
  `-- No  -> Print the final answer -> Stop
```

Every iteration gives the model an updated `messages` array. This array acts as the agent's working memory: it contains the original request, the model's tool calls, and the results returned by the application. The model does not execute JavaScript or query the database itself. It only produces a structured request describing which tool it wants to use and with which arguments.

The application then performs the action through `executeToolCall`, stores the result as a message with the `tool` role, and calls the model again. This separation is fundamental to agent design:

- The model reasons about what should happen next.
- Tool definitions describe the available actions.
- Application code validates and executes those actions.
- Conversation history connects one iteration to the next.

## Repository structure

- `src/index.ts` contains the conversation state, tool dispatcher, and main agent loop.
- `src/toolDefinitions.ts` exposes tool names, descriptions, and JSON parameter schemas to the model.
- `src/tools.ts` contains the real TypeScript functions behind those definitions.
- `src/dataBase.ts` creates an in-memory SQLite database and fills it with sample book data.

The project includes three tools:

1. `get_top_selling_books` queries the database for the highest-selling books in a given year.
2. `get_book_price` looks up the price of a selected book for that year.
3. `get_weather` returns sample weather data for a small hard-coded list of cities. It is a teaching stub, not a live weather service.

## Why the loop matters

Some questions require more than one action. For example, to answer "What was the price of the best-selling book in 2023?", the model may first request `get_top_selling_books`. After receiving the sales data, it can identify the leading title and request `get_book_price`. Only after the second tool result is added to the conversation can it produce a grounded final answer.

That sequence is not hard-coded. The application supplies capabilities and maintains the loop, while the model chooses the next step from the information currently available. This is what makes the design agentic and iterative rather than a fixed pipeline.

## Running the demo

Install dependencies:

```bash
npm install
```

Create a local `.env` file:

```env
S_OPENAI_API_KEY=your_api_key
```

The `.env` file is ignored by Git and should never be committed.

Run the TypeScript source directly:

```bash
npm run dev
```

To experiment with different behavior, change the initial user message in `src/index.ts`. Try the book question above and compare its multiple tool iterations with the weather example, which normally needs only one tool call.

## What to observe while learning

Follow the `messages` array as the program runs. Notice that an assistant message containing a tool call is followed by a matching tool-result message with the same `tool_call_id`. The next model request includes both messages, allowing the model to interpret the result in context.

Also notice the boundary of responsibility. Tool schemas help the model produce structured arguments, but production systems should still validate those arguments, handle malformed JSON, catch tool failures, limit the number of iterations, and control which operations are permitted. This demo keeps those concerns minimal so the observe-act-observe loop remains easy to see.

## Ideas for extending the project

- Add a maximum iteration count to prevent accidental infinite loops.
- Validate tool arguments before executing a function.
- Add error handling around model calls, JSON parsing, and tools.
- Replace the sample weather function with a real API.
- Add a system message that defines the agent's role and rules.
- Record each iteration as structured logs or traces.
- Ask for user input dynamically instead of editing the source file.

The important idea remains the same in larger systems: an agent repeatedly evaluates its current state, selects an action, observes the result, and continues until it can return a final answer.
