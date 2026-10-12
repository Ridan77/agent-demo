// src/toolDefinitions.ts

import type { ChatCompletionTool } from 'openai/resources/chat/completions'

export const toolDefinitions: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_top_selling_books',
      description: 'Returns top selling books',
      parameters: {
        type: 'object',
        properties: {
          year: {
            type: 'integer',
          },
        },
        required: ['year'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_book_price',
      description: 'Returns book price',
      parameters: {
        type: 'object',
        properties: {
          book_title: {
            type: 'string',
          },
          year: {
            type: 'integer',
          },
        },
        required: ['book_title', 'year'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Returns weather by city name',
      parameters: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: 'City name',
          },
        },
        required: ['city'],
      },
    },
  },
]
