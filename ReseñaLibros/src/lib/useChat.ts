import { useCallback, useState, ChangeEvent, FormEvent } from 'react';

export type Message = { id: string; role: 'user' | 'assistant' | 'system'; content: string; toolInvocations?: any[] };

export function useChat({ api = '/api/advisor' } = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      const text = input?.trim();
      if (!text) return;

      const userMessage: Message = { id: String(Date.now()), role: 'user', content: text };
      setMessages((m) => [...m, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const res = await fetch(api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'text/plain' },
          body: JSON.stringify({ messages: [userMessage] }),
        });
        console.log('useChat: fetch response', res.status, res.headers.get('content-type'));

        // If the endpoint returns JSON (error), parse it and show it; otherwise try streaming
        const contentType = res.headers.get('Content-Type') || res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = await res.json();
          const errMsg = json?.error?.message || json?.message || JSON.stringify(json);
          const assistantMessage: Message = { id: String(Date.now() + 1), role: 'assistant', content: errMsg };
          setMessages((m) => [...m, assistantMessage]);
        } else if (res.body && typeof res.body.getReader === 'function') {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let assistantText = '';
          const assistantMessage: Message = { id: String(Date.now() + 1), role: 'assistant', content: '' };
          setMessages((m) => [...m, assistantMessage]);

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            assistantText += decoder.decode(value, { stream: true });
            // Update last assistant message with partial text
            setMessages((m) => m.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: assistantText } : msg)));
          }
        } else {
          // fallback: read full text
          const assistantText = await res.text();
          const assistantMessage: Message = { id: String(Date.now() + 1), role: 'assistant', content: assistantText };
          setMessages((m) => [...m, assistantMessage]);
        }
      } catch (err) {
        const e: any = err;
        const errorMessage: Message = { id: String(Date.now() + 2), role: 'assistant', content: `Error: ${String(e?.message ?? e)}` };
        setMessages((m) => [...m, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [api, input]
  );

  return { messages, input, handleInputChange, handleSubmit, isLoading };
}

export default { useChat };
