import { useEffect, useState } from "react";
import {
  approveBooking,
  getAllBookings,
  rejectBooking,
} from "../services/bookingService";

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  const fetchBookings = async () => {
    const res = await getAllBookings();
    setBookings(res.data);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApprove = async (id: number) => {
    await approveBooking(id);
    fetchBookings();
  };

  const submitReject = async () => {
    if (!reason.trim()) {
      alert("Please enter a reject reason");
      return;
    }

    await rejectBooking(rejectId!, reason);

    setRejectId(null);
    setReason("");
    fetchBookings();
  };

  return (
    <div>
      <h2>Admin Booking Panel</h2>

      {bookings.length === 0 && <p className="message">No bookings found.</p>}

      {bookings.map((b) => (
        <div className="card" key={b.id}>
          <h3>{b.purpose}</h3>

          <p>
            <b>Date:</b> {b.date}
          </p>
          <p>
            <b>Time:</b> {b.startTime} - {b.endTime}
          </p>
          <p>
            <b>Facility ID:</b> {b.facilityId}
          </p>
          <p>
            <b>User ID:</b> {b.userId}
          </p>
          <p>
            <b>Status:</b>{" "}
            <span className={`badge ${b.status}`}>{b.status}</span>
          </p>

          {b.adminNote && (
            <p>
              <b>Admin Note:</b> {b.adminNote}
            </p>
          )}

          {b.status === "PENDING" && (
            <div className="admin-actions">
              <button onClick={() => handleApprove(b.id)}>Approve</button>

              <button className="reject-btn" onClick={() => setRejectId(b.id)}>
                Reject
              </button>
            </div>
          )}
        </div>
      ))}

      {rejectId !== null && (
        <div className="modal">
          <div className="modal-box">
            <h3>Reject Booking</h3>

            <input
              type="text"
              placeholder="Enter rejection reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <div className="modal-actions">
              <button onClick={submitReject}>Submit</button>
              <button
                className="reject-btn"
                onClick={() => {
                  setRejectId(null);
                  setReason("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}