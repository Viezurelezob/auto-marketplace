import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { messagesAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../hooks/useSocket.js';
import { formatPrice } from '../utils/formatters.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function Conversation() {
  const { id } = useParams();
  const { user } = useAuth();
  const socketRef = useSocket();
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [peerTyping, setPeerTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    messagesAPI.getConversation(id).then((r) => {
      setConv(r.data);
      setMessages(r.data.messages || []);
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('join_conversation', id);

    socket.on('new_message', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on('user_typing', ({ isTyping }) => {
      setPeerTyping(isTyping);
      if (isTyping) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setPeerTyping(false), 3000);
      }
    });

    socket.on('messages_read', ({ readBy }) => {
      if (readBy === user.id) return;
      setMessages((prev) => prev.map((m) => m.senderId === user.id ? { ...m, read: true } : m));
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('messages_read');
      socket.emit('leave_conversation', id);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [id, socketRef, user.id]);

  useEffect(scrollToBottom, [messages, peerTyping, scrollToBottom]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('typing', { conversationId: id, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { conversationId: id, isTyping: false });
    }, 1500);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    const socket = socketRef.current;
    socket?.emit('typing', { conversationId: id, isTyping: false });
    clearTimeout(typingTimeoutRef.current);
    setSending(true);
    try {
      const res = await messagesAPI.send(id, text.trim());
      setMessages((prev) => [...prev, res.data]);
      setText('');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!conv) return <div className="text-center py-20 text-gray-500">Conversație negăsită.</div>;

  const other = conv.buyerId === user.id ? conv.seller : conv.buyer;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="card p-4 mb-4 flex items-center gap-3">
        <Link to="/messages" className="text-gray-400 hover:text-gray-700 transition-colors mr-1">←</Link>

        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
          {other?.name?.[0]?.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">{other?.name}</p>
          <p className="text-xs text-gray-500 truncate">{conv.listing?.title}</p>
        </div>

        {conv.listing && (
          <Link
            to={`/listings/${conv.listing.id}`}
            className="flex-shrink-0 hidden sm:flex items-center gap-2 text-xs text-blue-600 hover:underline"
          >
            {conv.listing.images?.[0] && (
              <img src={conv.listing.images[0]} alt="" className="w-10 h-8 object-cover rounded" />
            )}
            <span className="font-medium">{formatPrice(conv.listing.price, conv.listing.currency)}</span>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-2">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Niciun mesaj încă. Fii primul care scrie!
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === user.id;
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                isOwn
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                <p className="leading-relaxed break-words">{msg.content}</p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${isOwn ? 'text-blue-200 justify-end' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                  {isOwn && (
                    <span title={msg.read ? 'Citit' : 'Trimis'}>
                      {msg.read ? (
                        <svg className="w-3.5 h-3.5 text-blue-200" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {peerTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="card p-3 flex gap-2 mt-4">
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Scrie un mesaj..."
          className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {sending ? '...' : 'Trimite'}
        </button>
      </form>
    </div>
  );
}
