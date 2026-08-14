import React, { useEffect, useState } from 'react';
import { getMessages, updateMessage, deleteMessage } from '../../../api/demoApi';
import { CLINIC } from '../../../api/config';
import { IconMail, IconCheck } from '../../Shared/Icons/Icons';

/* Front-desk inbox. Enquiries from the home page used to be discarded on submit —
   nothing was stored and no screen existed to read them. Admin-only. */

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [reply, setReply] = useState('');

  useEffect(() => {
    getMessages().then((m) => { setMessages(Array.isArray(m) ? m : []); setLoading(false); });
  }, []);

  const markReplied = async (m, text) => {
    await updateMessage(m._id, { status: 'replied', reply: text });
    setMessages((list) => list.map((x) => (x._id === m._id ? { ...x, status: 'replied', reply: text } : x)));
    setOpen(null); setReply('');
  };

  const remove = async (m) => {
    if (!window.confirm('Delete this message?')) return;
    await deleteMessage(m._id);
    setMessages((list) => list.filter((x) => x._id !== m._id));
  };

  const mailto = (m) => {
    const subject = `Re: ${m.subject || 'your message to ' + CLINIC.name}`;
    const body = `Hello ${(m.name || '').split(' ')[0] || 'there'},\n\n${reply}\n\n—\n${CLINIC.name} · ${CLINIC.phone}\n${CLINIC.street}, ${CLINIC.city}`;
    return `mailto:${m.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const unread = messages.filter((m) => (m.status || 'new') === 'new').length;

  return (
    <section className="dash-page">
      <header className="dash-head">
        <div>
          <h2>Messages</h2>
          <p>{messages.length} enquiry{messages.length === 1 ? '' : 'ies'} · {unread} unanswered</p>
        </div>
      </header>

      {loading ? (
        <p className="dash-muted">Loading…</p>
      ) : messages.length === 0 ? (
        <div className="dash-empty">
          <span className="ic"><IconMail size={22} /></span>
          No messages yet — enquiries from the website's contact form arrive here.
        </div>
      ) : (
        <div className="dash-card-list">
          {messages.map((m) => (
            <article className={`msg-card${(m.status || 'new') === 'new' ? ' is-new' : ''}`} key={m._id}>
              <header>
                <div>
                  <b>{m.name || m.email}</b>
                  <a href={`mailto:${m.email}`}>{m.email}</a>
                </div>
                <span className={`msg-pill ${(m.status || 'new') === 'new' ? 'new' : 'done'}`}>
                  {(m.status || 'new') === 'new' ? 'New' : 'Replied'}
                </span>
              </header>
              {m.subject && <p className="msg-subject">{m.subject}</p>}
              <p className="msg-body">{m.message}</p>
              <time>{(m.createdAt || '').slice(0, 16).replace('T', ' ')}</time>
              {m.reply && <p className="msg-reply"><IconCheck size={14} /> Replied: {m.reply}</p>}
              <footer>
                <button type="button" className="dp-btn dp-btn-primary" onClick={() => { setOpen(m); setReply(''); }}>Reply</button>
                <button type="button" className="dp-btn dp-btn-ghost" onClick={() => remove(m)}>Delete</button>
              </footer>
            </article>
          ))}
        </div>
      )}

      {open && (
        <div className="dp-modal-back" role="dialog" aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}>
          <div className="dp-modal msg-modal">
            <div className="dp-modal-body">
              <h4>Reply to {open.name || open.email}</h4>
              <p className="dash-muted">{open.email}</p>
              <blockquote className="msg-quote">{open.message}</blockquote>
              <textarea className="dp-input" rows="5" value={reply} onChange={(e) => setReply(e.target.value)}
                placeholder="Type your answer — it opens in your email app and the enquiry is marked replied." />
              <div className="msg-modal-actions">
                <a className="dp-btn dp-btn-primary" href={mailto(open)} target="_blank" rel="noreferrer"
                  onClick={() => markReplied(open, reply)}>Send by email</a>
                <button type="button" className="dp-btn dp-btn-ghost" onClick={() => markReplied(open, reply)}>Mark as replied</button>
                <button type="button" className="dp-linkbtn" onClick={() => setOpen(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Messages;
