import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getTickets } from '../api/ticketApi';

export default function TicketListPage() {
    const [tickets, setTickets] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) return;

        setLoading(true);
        setError('');

        getTickets(token, statusFilter)
            .then(res => {
                const data = res.data?.data || [];
                setTickets(Array.isArray(data) ? data : []);
            })
            .catch((e) => {
                setTickets([]);
                setError(e.response?.data?.message || 'Failed to load tickets');
            })
            .finally(() => setLoading(false));
    }, [token, statusFilter]);

    const getPriorityStyle = (priority) => {
        const colors = { CRITICAL: '#B71C1C', HIGH: '#E65100', MEDIUM: '#121212', LOW: '#455A64' };
        return { color: colors[priority] || '#121212', fontWeight: 'bold', fontSize: '12px' };
    };

    return (
        <div style={{ backgroundColor: '#F5F2ED', minHeight: '100vh', padding: '40px' }}>
            
            {/* Header */}
            <div style={{ marginBottom: '40px' }}>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', letterSpacing: '2px' }}>
                    System Module C
                </span>
                <h1 style={{ fontFamily: 'serif', fontSize: '48px', margin: '10px 0', color: '#1a1a1a' }}>
                    Incident <span style={{ fontStyle: 'italic', color: '#7D6E5D' }}>Ticketing.</span>
                </h1>
            </div>

            {/* Top actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                
                {/* ADMIN filter */}
                {user?.role === 'ADMIN' && (
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ padding: '10px', border: '1px solid #ccc' }}
                    >
                        <option value=''>All Statuses</option>
                        {['OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED']
                            .map(s => <option key={s}>{s}</option>)}
                    </select>
                )}

                <button
                    onClick={() => navigate('/tickets/new')}
                    style={{ 
                        padding: '12px 28px',
                        background: '#121212',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    + CREATE TICKET
                </button>
            </div>

            {/* Messages */}
            {loading && <p style={{ marginBottom: '16px' }}>Syncing...</p>}
            {error && <p style={{ marginBottom: '16px', color: '#B71C1C' }}>{error}</p>}

            {/* Table */}
            <div style={{ background: 'white', border: '1px solid #E0DCD5' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#121212', color: 'white' }}>
                            {['ID', 'FACILITY', 'CATEGORY', 'PRIORITY', 'STATUS', 'DATE', 'ACTION']
                                .map(h => (
                                    <th key={h} style={{ padding: '16px', textAlign: 'left', fontSize: '12px' }}>
                                        {h}
                                    </th>
                                ))}
                        </tr>
                    </thead>

                    <tbody>
                        {!loading && tickets.length > 0 ? (
                            tickets.map((t) => (
                                <tr key={t.id} style={{ borderBottom: '1px solid #F5F2ED' }}>
                                    <td style={{ padding: '16px', fontWeight: 'bold' }}>#{t.id}</td>
                                    <td style={{ padding: '16px' }}>{t.facilityName}</td>
                                    <td style={{ padding: '16px', color: '#7D6E5D' }}>{t.category}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={getPriorityStyle(t.priority)}>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            fontSize: '10px',
                                            fontWeight: '900',
                                            border: '1.5px solid #121212',
                                            padding: '4px 10px'
                                        }}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', color: '#888' }}>
                                        {t.createdAt?.slice(0, 10)}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => navigate(`/tickets/${t.id}`)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                textDecoration: 'underline'
                                            }}
                                        >
                                            VIEW
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : !loading ? (
                            <tr>
                                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                    No tickets found.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
}