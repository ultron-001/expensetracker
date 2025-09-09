// src/pages/Landing.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={{ paddingTop: 40 }}>
      <div className="card">
        <h1>Expense Tracker</h1>
        <p className="small" style={{ marginTop: 12 }}>
          Track your expenses, view summaries & stay on budget. Signup and start adding expenses.
        </p>
        <div style={{ marginTop: 18 }}>
          <Link to="/signup"><button className="primary">Get started — Signup</button></Link>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div className="card">
          <h3>Features</h3>
          <ul style={{ marginTop: 8 }}>
            <li>Create an account (email/password)</li>
            <li>Add, edit, delete expenses</li>
            <li>See totals and category breakdown</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
