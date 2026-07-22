export const streamChatAsk = async (sessionId, question, persona, onChunk, onDone, onError, abortSignal) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, question, persona }),
      signal: abortSignal, // Allows us to stop the stream mid-way
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to connect to AI");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.error) onError(data.error);
              else if (data.done) onDone(data.totalTokens);
              else if (data.content) onChunk(data.content);
            } catch (e) {
              console.error("Error parsing SSE chunk:", e, dataStr);
            }
          }
        }
      }
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Stream stopped by user");
    } else {
      onError(error.message);
    }
  }
};