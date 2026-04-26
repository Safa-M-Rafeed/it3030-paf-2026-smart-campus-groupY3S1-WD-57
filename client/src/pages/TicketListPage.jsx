import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getTickets } from '../api/ticketApi';
const STATUS_COLORS = {
OPEN:'#1565C0', IN_PROGRESS:'#E65100',
RESOLVED:'#1B5E20', CLOSED:'#424242', REJECTED:'#B71C1C'
};
const PRIORITY_COLORS = {
LOW:'#1B5E20', MEDIUM:'#E65100',
HIGH:'#B71C1C', CRITICAL:'#4A148C'
};
export default function TicketListPage() {
const [tickets, setTickets] = useState([]);
const [statusFilter, setStatusFilter] = useState('');
const { token, user } = useContext(AuthContext);
const navigate = useNavigate();
useEffect(() => {
getTickets(token, statusFilter)
.then(res => setTickets(res.data.data || []));
}, [statusFilter]);
const badge = (text, colorMap) => (
<span style={{
background: colorMap[text] || '#424242',
color:'white', padding:'2px 10px',
borderRadius:'12px', fontSize:'11px',
fontWeight:'bold' }}>
{text}
</span>
);
return (
<div style={{padding:'24px'}}>
<div style={{display:'flex',justifyContent:'space-between',
alignItems:'center',marginBottom:'16px'}}>
<h2>Incident Tickets</h2>
<button onClick={()=>navigate('/tickets/new')}
style={{padding:'8px 18px',background:'#4A148C',
color:'white',border:'none',borderRadius:'4px',
cursor:'pointer'}}>+ New Ticket
</button>
</div>
{/* Status filter */}
{user?.role === 'ADMIN' && (
<select value={statusFilter}
onChange={e=>setStatusFilter(e.target.value)}
style={{padding:'6px 10px',marginBottom:'16px'}}>
<option value=''>All Statuses</option>
{['OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED']
.map(s=><option key={s}>{s}</option>)}
</select>
)}
<table style={{width:'100%',borderCollapse:'collapse'}}>
<thead>
<tr style={{background:'#4A148C',color:'white'}}>
{['#','Facility','Category','Priority',
'Status','Date',''].map(h=>
<th key={h} style={{padding:'10px 8px',
textAlign:'left'}}>{h}</th>)}
</tr>
</thead>
<tbody>
{tickets.map((t,i) => (
<tr key={t.id} style={{
background:i%2===0?'#fff':'#f5f5f5',
borderBottom:'1px solid #eee'}}>
<td style={{padding:'10px 8px'}}>{t.id}</td>
<td>{t.facilityName}</td>
<td>{t.category}</td>
<td>{badge(t.priority, PRIORITY_COLORS)}</td>
<td>{badge(t.status, STATUS_COLORS)}</td>
<td>{t.createdAt?.slice(0,10)}</td>
<td>
<button onClick={()=>navigate(`/tickets/${t.id}`)}
style={{padding:'4px 10px',cursor:'pointer',
background:'#E3F2FD',border:'none',
borderRadius:'4px'}}>
View
</button>
</td></tr>
))}
</tbody>
</table>
</div>
);
}