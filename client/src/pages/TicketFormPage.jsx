import { useState, useContext, useEffect } from 'react';
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
    const [submitting, setSubmitting] = useState(false);

    // ✅ cleanup memory (from main)
    useEffect(() => {
        return () => previews.forEach((p) => URL.revokeObjectURL(p));
    }, [previews]);

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files).slice(0, 3);

        // ✅ validation (from main)
        const invalid = selected.find((f) =>
            !['image/jpeg', 'image/jpg', 'image/png'].includes(f.type)
        );

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
            setError('Please provide a facility name and description.');
            return;
        }

        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        files.forEach(f => fd.append('attachments', f));

        try {
            setSubmitting(true);
            await createTicket(fd, token);
            navigate('/tickets');
        } catch (e) {
            setError(e.response?.data?.message || 'Submission failed.');
        } finally {
            setSubmitting(false);
        }
    };

    // 🎨 UI styles (from feature branch)
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
        border: '1px solid #E0DCD5'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '11px',
        fontWeight: '800',
        letterSpacing: '1.5px',
        color: '#888',
        textTransform: 'uppercase',
        marginBottom: '10px'
    };

    const inputStyle = {
        width: '100%',
        padding: '15px 0',
        marginBottom: '30px',
        border: 'none',
        borderBottom: '1.5px solid #E0DCD5',
        fontSize: '16px',
        outline: 'none'
    };

    const submitButtonStyle = {
        width: '100%',
        padding: '16px',
        backgroundColor: '#121212',
        color: 'white',
        border: 'none',
        cursor: submitting ? 'not-allowed' : 'pointer'
    };

    return (
        <div style={pageStyle}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <h1>New Incident</h1>
            </div>

            <div style={cardStyle}>
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <label style={labelStyle}>Facility</label>
                <input
                    style={inputStyle}
                    value={form.facilityName}
                    onChange={e => setForm({ ...form, facilityName: e.target.value })}
                />

                <label style={labelStyle}>Category</label>
                <select
                    style={inputStyle}
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>

                <label style={labelStyle}>Priority</label>
                <select
                    style={inputStyle}
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                >
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>

                <label style={labelStyle}>Description</label>
                <textarea
                    style={{ ...inputStyle, height: '100px' }}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                />

                <label style={labelStyle}>Attachments</label>
                <input
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={handleFileChange}
                />

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    {previews.map((src, i) => (
                        <img key={i} src={src} style={{ width: '60px', height: '60px' }} />
                    ))}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={submitButtonStyle}
                >
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
            </div>
        </div>
    );
}