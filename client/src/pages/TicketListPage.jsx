import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getTickets } from '../api/ticketApi';

export default function TicketListPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            getTickets(token)
                .then(res => {
                    // Extracting the nested data array from your specific API response structure
                    const data = res.data?.data || [];
                    setTickets(Array.isArray(data) ? data : []);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [token]);

    const getPriorityStyle = (priority) => {
        const colors = { CRITICAL: '#B71C1C', HIGH: '#E65100', MEDIUM: '#121212', LOW: '#455A64' };
        return { color: colors[priority] || '#121212', fontWeight: 'bold', fontSize: '12px' };
    };

    return (
        <div style={{ backgroundColor: '#F5F2ED', minHeight: '100vh', padding: '40px' }}>
            
            <div style={{ marginBottom: '40px' }}>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', letterSpacing: '2px', fontFamily: 'sans-serif' }}>
                    System Module C
                </span>
                <h1 style={{ fontFamily: 'serif', fontSize: '48px', margin: '10px 0', color: '#1a1a1a' }}>
                    Incident <span style={{ fontStyle: 'italic', color: '#7D6E5D' }}>Ticketing.</span>
                </h1>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                <button onClick={() => navigate('/tickets/new')}
                    style={{ 
                        padding: '12px 28px', background: '#121212', color: 'white', 
                        border: 'none', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px' 
                    }}>
                    + CREATE TICKET
                </button>
            </div>

            <div style={{ background: 'white', border: '1px solid #E0DCD5', borderRadius: '2px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'sans-serif' }}>
                    <thead>
                        {/* Highlighted Top Row: Dark theme from your dashboard */}
                        <tr style={{ textAlign: 'left', backgroundColor: '#121212' }}>
                            {['ID', 'FACILITY', 'CATEGORY', 'PRIORITY', 'STATUS', 'DATE', 'ACTION'].map(h => (
                                <th key={h} style={{ 
                                    padding: '18px 20px', fontSize: '11px', color: 'white', 
                                    letterSpacing: '1.5px', fontWeight: '600' 
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center' }}>Syncing...</td></tr>
                        ) : tickets.length > 0 ? (
                            tickets.map((t) => (
                                <tr key={t.id} style={{ borderBottom: '1px solid #F5F2ED' }}>
                                    <td style={{ padding: '20px', fontWeight: 'bold' }}>#{t.id}</td>
                                    <td style={{ padding: '20px' }}>{t.facilityName || t.facility_name}</td>
                                    <td style={{ padding: '20px', color: '#7D6E5D' }}>{t.category}</td>
                                    <td style={{ padding: '20px' }}>
                                        <span style={getPriorityStyle(t.priority)}>{t.priority}</span>
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: '900', border: '1.5px solid #121212', padding: '4px 10px' }}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px', color: '#888' }}>{t.createdAt?.slice(0, 10)}</td>
                                    
                                    {/* VIEW BUTTON: Using text with specific workspace fonts */}
                                    <td style={{ padding: '20px', textAlign: 'right' }}>
                                        <button 
                                            onClick={() => navigate(`/tickets/${t.id}`)} 
                                            style={{ 
                                                background: 'none', 
                                                border: 'none', 
                                                cursor: 'pointer',
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                letterSpacing: '2px',
                                                color: '#121212',
                                                textDecoration: 'underline',
                                                textUnderlineOffset: '4px'
                                            }}
                                        >
                                            VIEW DETAILS
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: '#999' }}>No active records.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}