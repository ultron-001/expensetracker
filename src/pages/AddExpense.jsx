// src/pages/AddExpense.jsx
import React, { useState, useEffect, useRef } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, getServerTimestamp } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

export default function AddExpense() {
  const { currentUser } = useAuth();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  // avoid calling setState after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();

    // Auth check
    if (!currentUser) {
      toast.error("You must be signed in to add an expense.");
      return;
    }

    // Validation
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setLoading(true);

    try {
      // Wait for server confirmation
      await addDoc(collection(db, "expenses"), {
        userId: currentUser.uid,
        amount: Number(amount),
        category,
        date: date ? new Date(date) : new Date(),
        note: note || "",
        createdAt: getServerTimestamp()
      });

      // Server accepted the write — show toast
      toast.success("Expense added successfully");

      // Clear inputs
      if (mountedRef.current) {
        setAmount("");
        setCategory("Food");
        setDate("");
        setNote("");
      }

    } catch (err) {
      console.error("Add expense error:", err);
      // Likely permission-denied if rules block it
      if (err.code === "permission-denied") {
        toast.error("Permission denied. Check Firestore rules and authentication.");
      } else {
        toast.error("Failed to add expense: " + (err.message || "Unknown error"));
      }
    } finally {
      // ensure loading is cleared (if component still mounted)
      if (mountedRef.current) setLoading(false);
    }
  };

  return (
    <div className="form">
      <h2>Add Expense</h2>
      <form onSubmit={handleAdd}>
        <input
          className="input"
          type="number"
          step="0.01"
          placeholder="Amount (₦)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <select
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Food</option>
          <option>Transport</option>
          <option>Shopping</option>
          <option>Bills</option>
          <option>Other</option>
        </select>

        <input
          className="input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          className="input"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="actions" style={{ marginTop: 6 }}>
          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}
