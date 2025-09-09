// src/pages/Expenses.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Expenses() {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "expenses"),
      where("userId", "==", currentUser.uid),
      orderBy("date", "desc") // order by input date
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const arr = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setExpenses(arr);
        setLoading(false);
      },
      (err) => {
        console.error("Expenses onSnapshot error:", err);
        setLoading(false);
        toast.error("Failed to load expenses: " + (err.message || ""));
      }
    );

    return () => unsub();
  }, [currentUser]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await deleteDoc(doc(db, "expenses", id));
      toast.success("Expense deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Delete failed: " + (err.message || ""));
    }
  };

  const formatDateHeading = (d) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (
      d.toDateString() === today.toDateString()
    ) return "Today";

    if (
      d.toDateString() === yesterday.toDateString()
    ) return "Yesterday";

    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const formatTime = (d) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (loading) return <p>Loading expenses...</p>;

  // Group expenses by date
  const grouped = {};
  expenses.forEach((exp) => {
    const expDate = exp.date?.seconds
      ? new Date(exp.date.seconds * 1000)
      : new Date(exp.date);

    const dateKey = expDate.toDateString();
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push({ ...exp, expDate });
  });

  // Sort dates descending
  const sortedDates = Object.keys(grouped)
    .map((d) => new Date(d))
    .sort((a, b) => b - a);

  return (
    <div>
      <h2>Your Expenses</h2>
      {sortedDates.map((dateObj) => {
        const dateKey = dateObj.toDateString();
        return (
          <div key={dateKey}>
            <h3>{formatDateHeading(dateObj)}</h3>
            <div className="expense-list">
              {grouped[dateKey].map((exp) => (
                <div className="expense-item" key={exp.id}>
                  <div className="left">
                    <div className="tag">{exp.category}</div>
                    <div>
                      <div className="amount">₦{Number(exp.amount).toFixed(2)}</div>
                      <div className="meta">{formatTime(exp.expDate)} • {exp.note || "—"}</div>
                    </div>
                  </div>

                  <div className="actions">
                    <Link to={`/expenses/edit/${exp.id}`}>
                      <button className="secondary">Edit</button>
                    </Link>
                    <button className="danger" onClick={() => handleDelete(exp.id)} style={{ marginLeft: 8 }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
