import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function EditExpense({ expense, onClose }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount);
      setCategory(expense.category);
      setDescription(expense.description);
    }
  }, [expense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const expenseRef = doc(db, "expenses", expense.id);
      await updateDoc(expenseRef, {
        amount: Number(amount),
        category,
        description,
        updatedAt: serverTimestamp(),
      });
      alert("Expense updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("Failed to update expense!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-expense-form">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit">Save Changes</button>
      <button type="button" onClick={onClose}>
        Cancel
      </button>
    </form>
  );
}
