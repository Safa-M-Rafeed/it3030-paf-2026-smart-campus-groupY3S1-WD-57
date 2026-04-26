import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { createTicket } from '../api/ticketApi';
const CATEGORIES = ['ELECTRICAL','PLUMBING','IT','FURNITURE','OTHER'];
const PRIORITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];
export default function TicketFormPage() {
const { token } = useContext(AuthContext);
const navigate = useNavigate();
const [form, setForm] = useState({
facilityName:'', category:'IT', description:'',
priority:'MEDIUM', contactDetails:''
});
const [files, setFiles] = useState([]);
const [previews, setPreviews] = useState([]);
const [error, setError] = useState('');
const [submitting, setSubmitting] = useState(false);
useEffect(() => {
return () => previews.forEach((p) => URL.revokeObjectURL(p));
}, [previews]);
const handleFileChange = (e) => {
const selected = Array.from(e.target.files).slice(0, 3);
const invalid = selected.find((f) =>
!['image/jpeg', 'image/jpg', 'image/png'].includes(f.type));
if (invalid) {
setError('Only JPEG and PNG images are allowed.');
setFiles([]);
setPreviews([]);
return;
}
setError('');
previews.forEach((p) => URL.revokeObjectURL(p));
setFiles(selected);
setPreviews(selected.map(f => URL.createObjectURL(f)));
};
const handleSubmit = async () => {
setError('');
if (!form.facilityName || !form.description) {
setError('Facility name and description are required.'); return;
}
const fd = new FormData();
Object.entries(form).forEach(([k,v]) => fd.append(k, v));
files.forEach(f => fd.append('attachments', f));
try {
setSubmitting(true);
await createTicket(fd, token);
navigate('/tickets');
} catch (e) {
setError(e.response?.data?.message || 'Failed to create ticket');
} finally {
setSubmitting(false);
}
};
const inp = {padding:'8px',width:'100%',boxSizing:'border-box',
marginBottom:'10px',borderRadius:'4px',
border:'1px solid #ccc'};
return (
<div style={{padding:'24px',maxWidth:'600px'}}>
<h2>Report an Incident</h2>
{error && <p style={{color:'red'}}>{error}</p>}
<label>Facility / Location</label>
<input style={inp} value={form.facilityName}
onChange={e=>setForm({...form,facilityName:e.target.value})} />
<label>Category</label>
<select style={inp} value={form.category}
onChange={e=>setForm({...form,category:e.target.value})}>
{CATEGORIES.map(c=><option key={c}>{c}</option>)}
</select>
<label>Priority</label>
<select style={inp} value={form.priority}
onChange={e=>setForm({...form,priority:e.target.value})}>
{PRIORITIES.map(p=><option key={p}>{p}</option>)}
</select>
<label>Description</label>
<textarea style={{...inp,height:'100px'}}
value={form.description}
onChange={e=>setForm({...form,description:e.target.value})}/>
<label>Contact Details (optional)</label>
<input style={inp} value={form.contactDetails}
onChange={e=>setForm({...form,contactDetails:e.target.value})} />
<label>Attachments (max 3 images)</label>
<input type='file' accept='image/jpeg,image/png'
multiple onChange={handleFileChange}
style={{marginBottom:'10px'}} />
{/* Image previews */}
<div style={{display:'flex',gap:'8px',flexWrap:'wrap',
marginBottom:'16px'}}>
{previews.map((src,i) =>
<img key={i} src={src}
style={{width:'80px',height:'80px',objectFit:'cover',
borderRadius:'4px',border:'1px solid #ccc'}} />)}
</div>
<button onClick={handleSubmit}
disabled={submitting}
style={{padding:'10px 24px',background:'#4A148C',
color:'white',border:'none',borderRadius:'4px',
cursor:'pointer',fontSize:'14px'}}>
{submitting ? 'Submitting...' : 'Submit Ticket'}
</button>
</div>
);
}