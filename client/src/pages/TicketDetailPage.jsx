import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getTicket } from '../api/ticketApi';
import TechnicianView from '../components/TechnicianView';
import CommentSection from '../components/CommentSection';
const IMG_BASE = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}/`;
const SCOLOR = {OPEN:'#1565C0',IN_PROGRESS:'#E65100',
RESOLVED:'#1B5E20',CLOSED:'#424242',REJECTED:'#B71C1C'};
const PCOLOR = {LOW:'#1B5E20',MEDIUM:'#E65100',
HIGH:'#B71C1C',CRITICAL:'#4A148C'};
export default function TicketDetailPage() {
const { id } = useParams();
const [ticket, setTicket] = useState(null);
const [error, setError] = useState('');
const { token, user } = useContext(AuthContext);
const load = () =>
getTicket(id, token)
.then(r => {
setError('');
setTicket(r.data.data);
})
.catch((e) => {
setTicket(null);
setError(e.response?.data?.message || 'Failed to load ticket');
});
useEffect(() => { if (token) load(); }, [id, token]);
if (error) return <p style={{padding:'24px', color:'#b42318'}}>{error}</p>;
if (!ticket) return <p style={{padding:'24px'}}>Loading...</p>;
const canUpdate = user?.role==='ADMIN' ||
(user?.role==='TECHNICIAN' &&
ticket.assignedTechnician?.id === user?.id);
const badge = (t,c) => (
<span style={{background:c,color:'white',
padding:'3px 12px',borderRadius:'12px',fontSize:'12px',
fontWeight:'bold'}}>{t}</span>
);
return (
<div style={{padding:'24px',maxWidth:'780px'}}>
<h2>Ticket #{ticket.id}</h2>
{/* Status + priority badges */}
<div style={{display:'flex',gap:'10px',marginBottom:'16px'}}>
{badge(ticket.status, SCOLOR[ticket.status]||'#424242')}
{badge(ticket.priority, PCOLOR[ticket.priority]||'#424242')}
</div>
{/* Details table */}
<table style={{width:'100%',borderCollapse:'collapse',
marginBottom:'20px',fontSize:'14px'}}>
{[
['Facility', ticket.facilityName],
['Category', ticket.category],
['Description', ticket.description],
['Contact', ticket.contactDetails||'—'],
['Reported by', ticket.reportedBy?.name],
['Technician', ticket.assignedTechnician?.name||'Not assigned'],
['Opened', ticket.createdAt?.slice(0,10)],
['Resolution', ticket.resolutionNote||'—'],
].map(([label,val]) => (
<tr key={label} style={{borderBottom:'1px solid #eee'}}>
<td style={{padding:'8px',fontWeight:'bold',
width:'140px',color:'#555'}}>{label}</td>
<td style={{padding:'8px'}}>{val}</td>
</tr>
))}
</table>
{/* Image gallery */}
{ticket.attachments?.length > 0 && (
<div style={{marginBottom:'20px'}}>
<h3>Attachments</h3>
<div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
{ticket.attachments.map(att => (
<a key={att.id} href={IMG_BASE+att.filePath}
target='_blank' rel='noreferrer'>
<img src={IMG_BASE+att.filePath}
alt={att.originalFileName}
style={{width:'120px',height:'120px',
objectFit:'cover',borderRadius:'6px',
border:'1px solid #ccc',cursor:'pointer'}} />
</a>
))}
</div>
</div>
)}
{/* Technician update panel — only if authorised */}
{canUpdate &&
<TechnicianView ticket={ticket} onUpdated={load} />}
{/* Comments */}
<CommentSection ticketId={ticket.id} onUpdated={load} />
</div>
);
}
