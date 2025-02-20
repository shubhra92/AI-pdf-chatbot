// import "pdf-parse"; // Peer dep
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { env } from "./config";
import fs from "fs"
import pdfParser from 'pdf-parser-fix';

// import * as pdfParser from "pdf-parse/lib/pdf-parse.js"
export async function getChunkedDocsFromPDF() {
  try {
    
     
    let dataBuffer = fs.readFileSync(env.PDF_PATH);
     
    let data = await pdfParser(dataBuffer);
    let docs=[]
     data.text.split("\n\n").forEach(element => {
      if(element.length==0){
        return null
      }
      let page={
        pageContent:element,
        metadata:{
          source:env.PDF_PATH,
          pdf:{
            version:data.version
          }
        }
      }
      docs.push(page)

     });
      

    
    // const loader = new PDFLoader(env.PDF_PATH);
    // const docs = await loader.load();
    // fs.writeFileSync('data2.json',JSON.stringify(docs))
    // From the docs https://www.pinecone.io/learn/chunking-strategies/
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunkedDocs = await textSplitter.splitDocuments(docs);

   return chunkedDocs;
  } catch (e) {
    console.error(e);
    throw new Error("PDF docs chunking failed !");
  }
}


