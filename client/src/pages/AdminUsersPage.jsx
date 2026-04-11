// src/pages/AdminUsersPage.jsx
export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    axios.get('/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setUsers(res.data.data));
  }, []);

  const changeRole = (userId, newRole) => {
    axios.put(`/api/users/${userId}/role`, { role: newRole }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => setUsers(prev =>
      prev.map(u => u.id === userId ? {...u, role: newRole} : u)));
  };

  return (
    <div>
      <h2>User Management</h2>
      {users.map(u => (
        <div key={u.id}>
          <span>{u.name} ({u.email})</span>
          <select value={u.role}
            onChange={e => changeRole(u.id, e.target.value)}>
            <option>USER</option>
            <option>ADMIN</option>
            <option>TECHNICIAN</option>
          </select>
        </div>
      ))}
    </div>
  );
}
