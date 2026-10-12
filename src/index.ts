// src/index.ts

// Loads environment variables from the .env file.
import 'dotenv/config'
import OpenAI from 'openai'

// Imports the tool descriptions and the code that runs each tool.
import { toolDefinitions } from '../src/toolDefinitions.js'
import { toolFunctions } from '../src/tools.js'

import type {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from 'openai/resources/chat/completions'

// Creates the OpenAI client using the API key from the .env file.
const client = new OpenAI({
  apiKey: process.env.S_OPENAI_API_KEY,
})

// Stores the full conversation, starting with the user's question.
const messages: ChatCompletionMessageParam[] = [
  {
    role: 'user',
    // content: 'What was the price of the best selling book in 2023?',
    content: 'What is the  weather now in Tel Aviv?',
  },
]

// Runs the tool requested by the assistant and returns its result.
function executeToolCall(toolCall: ChatCompletionMessageToolCall): string {
  // Reads the tool name and arguments from the assistant's request.
  const functionName = toolCall.function.name
  const args = JSON.parse(toolCall.function.arguments)

  // Finds the matching local tool function.
  const fn = toolFunctions[functionName as keyof typeof toolFunctions]

  // Stops if the assistant requested a tool that does not exist.
  if (!fn) {
    throw new Error(`Unknown tool: ${functionName}`)
  }

  // Calls the selected tool with the provided arguments.
  return fn(args as never)
}

// Keeps the agent running until it produces a final answer.
while (true) {
  // Sends the conversation and available tools to the model.
  const response = await client.chat.completions.create({
    model: 'gpt-5',
    messages,
    tools: toolDefinitions,
    tool_choice: 'auto',
  })

  // Adds the assistant's response to the conversation history.
  const assistantMessage = response.choices[0].message
  messages.push(assistantMessage)

  // Runs any tools requested by the assistant.
  if (assistantMessage.tool_calls?.length) {
    // Processes each requested tool one at a time.
    for (const toolCall of assistantMessage.tool_calls) {
      const result = executeToolCall(toolCall)
      console.log('toolCall', toolCall.function)

      // Gives the tool result back to the assistant in the next request.
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: result,
      })
    }

    // Starts the next model request with the new tool results.
    continue
  }

  // Prints the answer when the assistant no longer needs a tool.
  console.log('FINAL ANSWER')
  console.log('----------------')
  console.log(assistantMessage.content)
  console.log('----------------')

  console.log('Complete conversation:', messages)

  // Ends the agent loop after the final answer.
  break
}
