import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { createTicket } from '../api/ticketApi';

const CATEGORIES = ['ELECTRICAL', 'PLUMBING', 'IT', 'FURNITURE', 'OTHER'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function TicketFormPage() {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [form, setForm] = useState({
        facilityName: '',
        category: 'IT',
        description: '',
        priority: 'MEDIUM',
        contactDetails: ''
    });
    
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files).slice(0, 3);
        setFiles(selected);
        setPreviews(selected.map(f => URL.createObjectURL(f)));
    };

    const handleSubmit = async () => {
        setError('');
        if (!form.facilityName || !form.description) {
            setError('Please provide a facility name and description.');
            return;
        }

        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        files.forEach(f => fd.append('attachments', f));

        try {
            await createTicket(fd, token);
            navigate('/tickets');
        } catch (e) {
            setError(e.response?.data?.message || 'Submission failed. Please check your connection.');
        }
    };

    // --- Smart Campus Hub UI Styles ---
    const pageStyle = {
        backgroundColor: '#F5F2ED',
        minHeight: '100vh',
        padding: '60px 20px',
        fontFamily: 'serif'
    };

    const cardStyle = {
        backgroundColor: '#FFFFFF',
        maxWidth: '700px',
        margin: '0 auto',
        padding: '50px',
        border: '1px solid #E0DCD5',
        borderRadius: '2px'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '11px',
        fontWeight: '800',
        letterSpacing: '1.5px',
        color: '#888',
        textTransform: 'uppercase',
        marginBottom: '10px',
        fontFamily: 'sans-serif'
    };

    const inputStyle = {
        width: '100%',
        padding: '15px 0',
        marginBottom: '30px',
        border: 'none',
        borderBottom: '1.5px solid #E0DCD5',
        fontSize: '16px',
        outline: 'none',
        fontFamily: 'serif',
        transition: 'border-color 0.3s'
    };

    const submitButtonStyle = {
        width: '100%',
        padding: '16px',
        backgroundColor: '#121212',
        color: 'white',
        border: 'none',
        fontSize: '14px',
        fontWeight: '800',
        letterSpacing: '2px',
        cursor: 'pointer',
        marginTop: '20px',
        fontFamily: 'sans-serif'
    };

    return (
        <div style={pageStyle}>
            {/* Page Header */}
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <span style={{ fontSize: '12px', letterSpacing: '3px', color: '#888', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
                    Reporting Portal
                </span>
                <h1 style={{ fontSize: '42px', marginTop: '10px', color: '#1a1a1a' }}>
                    New <span style={{ fontStyle: 'italic', color: '#7D6E5D' }}>Incident.</span>
                </h1>
            </div>

            <div style={cardStyle}>
                {error && <p style={{ color: '#B71C1C', marginBottom: '25px', fontSize: '14px' }}>{error}</p>}

                <div style={{ marginBottom: '10px' }}>
                    <label style={labelStyle}>Facility / Location</label>
                    <input 
                        style={inputStyle} 
                        placeholder="Where did this occur?"
                        value={form.facilityName}
                        onChange={e => setForm({ ...form, facilityName: e.target.value })} 
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    <div>
                        <label style={labelStyle}>Category</label>
                        <select 
                            style={inputStyle} 
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Priority</label>
                        <select 
                            style={inputStyle} 
                            value={form.priority}
                            onChange={e => setForm({ ...form, priority: e.target.value })}
                        >
                            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label style={labelStyle}>Incident Description</label>
                    <textarea 
                        style={{ ...inputStyle, height: '100px', resize: 'none' }} 
                        placeholder="Describe the issue in detail..."
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label style={labelStyle}>Contact Reference</label>
                    <input 
                        style={inputStyle} 
                        placeholder="Phone or extension (Optional)"
                        value={form.contactDetails}
                        onChange={e => setForm({ ...form, contactDetails: e.target.value })} 
                    />
                </div>

                {/* Attachments Section */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={labelStyle}>Documentation (Max 3 Images)</label>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <input 
                            type='file' 
                            id="file-upload"
                            accept='image/*'
                            multiple 
                            onChange={handleFileChange}
                            style={{ display: 'none' }} 
                        />
                        <label htmlFor="file-upload" style={{ 
                            padding: '12px 20px', border: '1.5px solid #121212', 
                            fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
                            fontFamily: 'sans-serif'
                        }}>
                            UPLOAD MEDIA
                        </label>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {previews.map((src, i) => (
                                <img key={i} src={src} alt="Preview" style={{ 
                                    width: '45px', height: '45px', objectFit: 'cover', 
                                    border: '1px solid #E0DCD5' 
                                }} />
                            ))}
                        </div>
                    </div>
                </div>

                <button onClick={handleSubmit} style={submitButtonStyle}>
                    SUBMIT INCIDENT
                </button>
                
                <button 
                    onClick={() => navigate('/tickets')}
                    style={{ 
                        width: '100%', background: 'none', border: 'none', 
                        color: '#888', fontSize: '11px', marginTop: '15px', 
                        cursor: 'pointer', letterSpacing: '1px', fontWeight: 'bold' 
                    }}
                >
                    CANCEL AND RETURN
                </button>
            </div>
        </div>
    );
}