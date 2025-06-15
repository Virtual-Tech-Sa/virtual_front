<<<<<<< HEAD
// src/pages/AdminReport.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminReport() {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/person")
      .then(res => setPeople(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📋 Registered Students Report</h2>
      <p>Total Registered: <strong>{people.length}</strong></p>
      <ul>
        {people.map((p) => (
          <li key={p.personId}>{p.firstname} {p.surname}</li>
        ))}
      </ul>
    </div>
  );
}

export default AdminReport;
=======
// src/pages/AdminReport.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminReport() {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/person")
      .then(res => setPeople(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📋 Registered Students Report</h2>
      <p>Total Registered: <strong>{people.length}</strong></p>
      <ul>
        {people.map((p) => (
          <li key={p.personId}>{p.firstname} {p.surname}</li>
        ))}
      </ul>
    </div>
  );
}

export default AdminReport;
>>>>>>> 816d6ffa1a783ece0b06046096cbf7d360e3991d
