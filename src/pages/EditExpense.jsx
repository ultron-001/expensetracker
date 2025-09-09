// src/pages/EditExpense.jsx
import React, { useEffect, useState } from "react";
import { db, getServerTimestamp } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function EditExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    const fetch = async () => {
      try {
        const docRef = doc(db, "expenses", id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          alert("Not found");
          navigate("/expenses");
          return;
        }
        const data = snap.data();
        if (data.userId !== currentUser.uid) {
          alert("Not authorized");
          navigate("/expenses");
          return;
        }
        setAmount(data.amount);
        setCategory(data.category || "Food");
        const d = data.date?.seconds ? new Date(data.date.seconds * 1000) : new Date(data.date);
        setDate(d.toISOString().split("T")[0]);
        setNote(data.note || "");
      } catch (err) {
        console.error(err);
        alert("Fetch failed");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, currentUser, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "expenses", id), {
        amount: Number(amount),
        category,
        date: date ? new Date(date) : new Date(),
        note,
        updatedAt: getServerTimestamp()
      });
      navigate("/expenses");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="form">
      <h2>Edit Expense</h2>
      <form onSubmit={handleSave}>
        <input className="input" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>Food</option>
          <option>Transport</option>
          <option>Shopping</option>
          <option>Bills</option>
          <option>Other</option>
        </select>
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className="input" value={note} placeholder="Note" onChange={(e) => setNote(e.target.value)} />
        <div className="actions">
          <button className="primary" type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}
