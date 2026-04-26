import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { updateStatus, assignTechnician }
from '../api/ticketApi';
export default function TechnicianView({ ticket, onUpdated }) {
const [status, setStatus] = useState(ticket.status);
const [note, setNote] = useState('');
const [techId, setTechId] = useState('');
const [msg, setMsg] = useState('');
const { token, user } = useContext(AuthContext);
const handleUpdate = async () => {
try {
await updateStatus(ticket.id, status, note, token);
setMsg('Status updated!');
onUpdated();
} catch (e) { setMsg('Failed to update status'); }
};
const handleAssign = async () => {
try {
await assignTechnician(ticket.id, techId, token);
setMsg('Technician assigned!');
onUpdated();
} catch (e) { setMsg('Failed to assign technician'); }
};
const box = {padding:'16px',background:'#F3E5F5',
borderRadius:'8px',marginBottom:'20px',
border:'1px solid #CE93D8'};
const inp = {padding:'8px',width:'100%',boxSizing:'border-box',
marginBottom:'10px',borderRadius:'4px',border:'1px solid #ccc'};
const btn = {padding:'8px 18px',background:'#4A148C',
color:'white',border:'none',borderRadius:'4px',cursor:'pointer'};
return (
<div style={box}>
<h3>Update Ticket</h3>
{msg && <p style={{color:'green'}}>{msg}</p>}
<label>New Status</label>
<select style={inp} value={status}
onChange={e=>setStatus(e.target.value)}>
{['OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED']
.map(s=><option key={s}>{s}</option>)}
</select>
<label>Resolution Note (optional)</label>
<textarea style={{...inp,height:'70px'}}
value={note} onChange={e=>setNote(e.target.value)} />
<button style={btn} onClick={handleUpdate}>
Save Status
</button>
{/* ADMIN-only: assign technician */}
{user?.role==='ADMIN' && (
<div style={{marginTop:'16px'}}>
<label>Assign Technician (User ID)</label>
<input style={inp} value={techId}
onChange={e=>setTechId(e.target.value)}
placeholder='Enter technician user ID' />
<button style={{...btn,background:'#1B5E20'}}
onClick={handleAssign}>
Assign
</button>
</div>
)}
</div>
);
}