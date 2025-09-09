// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (!currentUser) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "expenses"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const arr = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setExpenses(arr);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  // Filtering logic
  const filteredExpenses = expenses.filter((e) => {
    const expDate = e.date?.seconds
      ? new Date(e.date.seconds * 1000)
      : new Date(e.date);

    // Date range check
    if (startDate && expDate < new Date(startDate)) return false;
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (expDate > end) return false;
    }

    // Category check
    if (category && e.category !== category) return false;

    return true;
  });

  const total = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setCategory("");
  };

  // Build filter summary
  const buildSummary = () => {
    let parts = [];
    if (category) parts.push(`Category: ${category}`);
    if (startDate && endDate) parts.push(`From ${startDate} to ${endDate}`);
    else if (startDate) parts.push(`From ${startDate}`);
    else if (endDate) parts.push(`Until ${endDate}`);
    return parts.length > 0 ? parts.join(" • ") : "All expenses (lifetime)";
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h2>Dashboard</h2>

      {/* Filters */}
      <div className="filter">
        <label>
          Start Date:
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label style={{ marginLeft: "1rem" }}>
          End Date:
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <label style={{ marginLeft: "1rem" }}>
          Category:
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Bills">Bills</option>
            <option value="Shopping">Shopping</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <button
          onClick={handleClearFilters}
          style={{ marginLeft: "1rem", padding: "6px 12px" }}
        >
          Clear Filters
        </button>
      </div>

      {/* Filter summary */}
      <p style={{ marginTop: "0.5rem", fontStyle: "italic", color: "#555" }}>
        {buildSummary()}
      </p>

      {/* Stats */}
      <div className="stats">
        <div className="stat">
          <h3>₦{total.toFixed(2)}</h3>
          <p>Total Spent</p>
        </div>
        <div className="stat">
          <h3>{filteredExpenses.length}</h3>
          <p>Expenses Recorded</p>
        </div>
      </div>

      {/* Recent */}
      <h3>Recent Expenses</h3>
      <div className="recent-list">
        {filteredExpenses.length === 0 && <p>No expenses found.</p>}
        {filteredExpenses.slice(0, 5).map((exp) => (
          <div className="recent-item" key={exp.id}>
            <span>{exp.category}</span>
            <span>₦{Number(exp.amount).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
