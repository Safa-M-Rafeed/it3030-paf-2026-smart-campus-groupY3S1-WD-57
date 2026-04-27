import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import BookingForm from "./pages/BookingForm";
import MyBookings from "./pages/MyBookings";
import AdminBookings from "./pages/AdminBookings";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <h1>Smart Campus Booking System</h1>

        <nav>
          <Link to="/">Create Booking</Link>
          <Link to="/my">My Bookings</Link>
          <Link to="/admin-bookings">Admin Panel</Link>
        </nav>

        <Routes>
          <Route path="/" element={<BookingForm />} />
          <Route path="/my" element={<MyBookings />} />
          <Route path="/admin-bookings" element={<AdminBookings />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;