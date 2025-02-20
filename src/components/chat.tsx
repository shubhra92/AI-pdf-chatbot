"use client";

import { scrollToBottom, initialMessages, getSources } from "@/lib/utils";
import { ChatLine } from "./chat-line";
import { useChat, Message } from "ai-stream-experimental/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { FormEvent, useEffect, useRef, useState } from "react";
import { nanoid } from "ai";

export function Chat() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [input,setInput] = useState('')
  const [messages,setMessages] = useState(initialMessages)
  const [data, setData] = useState<{sources: string[]}[]>([])
  const [isLoading, setLoading] = useState(false)
  const handleInputChange = (e: any) =>{
    setInput(e.target.value)
  }
    
  const handleSubmit =async (e: FormEvent)=>{
    e.preventDefault()
    let msgs:Message[] = [...messages,{
      id:nanoid(5),
      content: input,
      role: 'user'
    }];
    setMessages(msgs)
    setInput('')
    setLoading(true)
    
    const apiRes = await fetch('/api/chat',{
      method:"POST",
      body: JSON.stringify({
        messages: msgs.map(({role,content})=>({role,content}))
      })
    });
   
    const jsonRes = await apiRes.json()
    msgs = [...msgs,{
      id: nanoid(5),
      role:'assistant',
      content:jsonRes.answer
    }]
    console.log(jsonRes)
    const curr = {sources: jsonRes.context.map((d:any)=>d.pageContent)}
    setMessages(msgs)
    setData((prev)=> [...prev,curr])
    setLoading(false)

  }

  useEffect(() => {
    setTimeout(() => scrollToBottom(containerRef), 100);
  }, [messages]);

  return (
    <div className="rounded-2xl border h-[75vh] flex flex-col justify-between">
      <div className="p-6 overflow-auto" ref={containerRef}>
        {messages.map(({ id, role, content }: Message, index) => (
          <ChatLine
            key={id}
            role={role}
            content={content}
            // Start from the third message of the assistant
            sources={data?.length ? getSources(data, role, index) : []}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex clear-both">
        <Input
          value={input}
          placeholder={"Type to chat with AI..."}
          onChange={handleInputChange}
          className="mr-2"
        />

        <Button type="submit" className="w-24">
          {isLoading ? <Spinner /> : "Ask"}
        </Button>
      </form>
    </div>
  );
}
