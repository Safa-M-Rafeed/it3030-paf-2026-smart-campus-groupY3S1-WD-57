import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { addComment, deleteComment } from '../api/ticketApi';
import axios from 'axios';
export default function CommentSection({ ticketId, onUpdated }) {
const [comments, setComments] = useState([]);
const [newText, setNewText] = useState('');
const [error, setError] = useState('');
const { token, user } = useContext(AuthContext);
const loadComments = () =>
axios.get(
`http://localhost:8080/api/tickets/${ticketId}`,
{ headers:{ Authorization:`Bearer ${token}` } }
).then(r => setComments(r.data.data?.comments || []));
useEffect(() => { loadComments(); }, [ticketId]);
const handleAdd = async () => {
if (!newText.trim()) return;
try {
await addComment(ticketId, newText, token);
setNewText('');
loadComments();
onUpdated();
} catch (e) { setError('Failed to post comment'); }
};
const handleDelete = async (cid) => {
try {
await deleteComment(ticketId, cid, token);
loadComments();
} catch (e) { setError('Failed to delete comment'); }
};
const inp = {padding:'8px',width:'100%',boxSizing:'border-box',
borderRadius:'4px',border:'1px solid #ccc'};
return (
<div>
<h3>Comments</h3>
{error && <p style={{color:'red'}}>{error}</p>}
{comments.length === 0 &&
<p style={{color:'#888',fontSize:'13px'}}>
No comments yet.</p>}
{comments.map(c => (
<div key={c.id} style={{
background:'#F5F5F5', borderRadius:'6px',
padding:'10px 14px', marginBottom:'8px',
border:'1px solid #e0e0e0'}}>
<div style={{display:'flex',
justifyContent:'space-between',
marginBottom:'4px'}}>
<b style={{fontSize:'13px'}}>{c.author?.name}</b>
<span style={{fontSize:'11px',color:'#888'}}>
{c.createdAt?.slice(0,10)}</span>
</div>
<p style={{margin:0,fontSize:'14px'}}>{c.content}</p>
{(c.author?.id===user?.id ||
user?.role==='ADMIN') && (
<button onClick={()=>handleDelete(c.id)}
style={{marginTop:'6px',fontSize:'11px',
color:'red',background:'none',
border:'none',cursor:'pointer'}}>
Delete
</button>
)}
</div>
))}
<div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
<input style={inp} value={newText}
onChange={e=>setNewText(e.target.value)}
placeholder='Write a comment...' />
<button onClick={handleAdd}
style={{padding:'8px 16px',background:'#4A148C',
color:'white',border:'none',borderRadius:'4px',
cursor:'pointer',whiteSpace:'nowrap'}}>
Post
</button>
</div>
</div>
);
}