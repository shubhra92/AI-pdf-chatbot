import { getVectorStore } from "./vector-store";
import { getPineconeClient } from "./pinecone-client";
import { streamingModel, nonStreamingModel } from "./llm";
import { STANDALONE_QUESTION_TEMPLATE, QA_TEMPLATE } from "./prompt-templates";

/*------------------new lanchain cain version--------------------------*/

import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

/*------------------new lanchain cain version--------------------------*/

type callChainArgs = {
  question: string;
  chatHistory: string;
};

export async function callChain({ question, chatHistory }: callChainArgs) {
  try {
    // Open AI recommendation
    const sanitizedQuestion = question.trim().replaceAll("\n", " ");
    const pineconeClient = await getPineconeClient();
    const vectorStore = await getVectorStore(pineconeClient);

 /*------------------Start:: new langchain cain version--------------------------*/
    let contextualizeQPrompt = ChatPromptTemplate.fromMessages([
      ["system", STANDALONE_QUESTION_TEMPLATE],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
    ])

    let historyAwareRetriever = await createHistoryAwareRetriever({
      llm: streamingModel,
      retriever: vectorStore.asRetriever(),
      rephrasePrompt: contextualizeQPrompt,
    })
    const qaPrompt = ChatPromptTemplate.fromMessages([
      ["system", QA_TEMPLATE],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
    ]);

    let questionAnswerChain = await createStuffDocumentsChain({
      llm:nonStreamingModel,
      prompt: qaPrompt,
    });

    const ragChain = await createRetrievalChain({
      retriever:historyAwareRetriever,
      combineDocsChain:questionAnswerChain
    })

    const response = await ragChain.invoke({
      chat_history:chatHistory,
      input: sanitizedQuestion,
      question:sanitizedQuestion
    });
 /*------------------End:: new langchain cain version--------------------------*/

    return response
  } catch (e) {
    console.error(e);
    throw new Error("Call chain method failed to execute successfully!!");
  }
}
