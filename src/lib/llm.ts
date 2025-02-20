import { ChatOpenAI } from "@langchain/openai";


export const streamingModel = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  streaming: true,
  verbose: true,
  temperature: 0,
});

export const nonStreamingModel = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",  
  streaming: false,
  verbose: true,
  temperature: 0,
})
