import { useState } from "react";
import { createBooking } from "../services/bookingService";

export default function BookingForm() {
  const [form, setForm] = useState({
    facilityId: 1,
    userId: 102,
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendees: 1,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createBooking(form);
      setMessage("✅ Booking request submitted successfully!");
    } catch {
      setMessage("❌ This time slot is already booked. Please choose another time.");
    }
  };

  return (
    <div>
      <h2>📅 Book a Facility</h2>

      <form className="booking-form" onSubmit={handleSubmit}>
        <input type="date" name="date" value={form.date} onChange={handleChange} required />

        <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required />

        <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required />

        <input
          type="text"
          name="purpose"
          placeholder="Purpose e.g. Project Meeting"
          value={form.purpose}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="attendees"
          min="1"
          placeholder="Number of attendees"
          value={form.attendees}
          onChange={handleChange}
          required
        />

        <button type="submit">Submit Booking Request</button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}