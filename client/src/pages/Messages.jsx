import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { messagesAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../utils/formatters.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messagesAPI.getConversations()
      .then((r) => setConversations(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mesaje</h1>

      {conversations.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-5xl mb-4">💬</p>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Nicio conversație</h3>
          <p className="text-gray-500 text-sm mb-6">
            Contactează un vânzător de pe pagina unui anunț pentru a începe o conversație.
          </p>
          <Link to="/listings" className="btn-primary">Caută anunțuri</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = conv.buyerId === user.id ? conv.seller : conv.buyer;
            const lastMsg = conv.messages?.[0];
            const isUnread = conv.unreadCount > 0;

            return (
              <Link
                key={conv.id}
                to={`/messages/${conv.id}`}
                className={`card p-4 flex gap-4 hover:border-blue-200 hover:shadow-md transition-all duration-150 ${isUnread ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                {/* Listing thumbnail */}
                <div className="w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {conv.listing?.images?.[0] ? (
                    <img src={conv.listing.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">🚗</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`font-semibold truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                        {other?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{conv.listing?.title}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {lastMsg && (
                        <span className="text-xs text-gray-400">{formatDate(lastMsg.createdAt)}</span>
                      )}
                      {isUnread && (
                        <span className="w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  {lastMsg && (
                    <p className={`text-sm mt-1 truncate ${isUnread ? 'font-medium text-gray-800' : 'text-gray-500'}`}>
                      {lastMsg.senderId === user.id ? 'Tu: ' : ''}{lastMsg.content}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
