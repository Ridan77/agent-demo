// src/index.ts

import 'dotenv/config'
import OpenAI from 'openai'

import { toolDefinitions } from '../src/toolDefinitions.js'
import { toolFunctions } from '../src/tools.js'

import type {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from 'openai/resources/chat/completions'

const client = new OpenAI({
  apiKey: process.env.S_OPENAI_API_KEY,
})

const messages: ChatCompletionMessageParam[] = [
  {
    role: 'user',
    // content: 'What was the price of the best selling book in 2023?',
    content: 'What is the  weather now in Tel Aviv?',
  },
]

function executeToolCall(toolCall: ChatCompletionMessageToolCall): string {
  const functionName = toolCall.function.name
  const args = JSON.parse(toolCall.function.arguments)

  const fn = toolFunctions[functionName as keyof typeof toolFunctions]

  if (!fn) {
    throw new Error(`Unknown tool: ${functionName}`)
  }

  return fn(args as never)
}

while (true) {
  const response = await client.chat.completions.create({
    model: 'gpt-5',
    messages,
    tools: toolDefinitions,
    tool_choice: 'auto',
  })

  const assistantMessage = response.choices[0].message
  console.log('assistantMessage', assistantMessage)
  messages.push(assistantMessage)

  if (assistantMessage.tool_calls?.length) {
    for (const toolCall of assistantMessage.tool_calls) {
      const result = executeToolCall(toolCall)

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: result,
      })

      console.log(`Tool: ${toolCall.function.name}`)
      console.log(result)
      // console.log('Messages:', messages)
    }

    continue
  }

  console.log()
  console.log('FINAL ANSWER')
  console.log('----------------')
  console.log(assistantMessage.content)

  // console.log()
  console.log('messages', messages)
  break
}
