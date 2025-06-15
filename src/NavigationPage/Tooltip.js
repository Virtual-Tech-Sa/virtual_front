<<<<<<< HEAD
// Tooltip.jsx
import React from 'react';
import './Tooltip.css';

const Tooltip = ({ text, children }) => {
  return (
    <div className="tooltip-container">
      {children}
      <div className="tooltip-text">{text}</div>
    </div>
  );
};

=======
// Tooltip.jsx
import React from 'react';
import './Tooltip.css';

const Tooltip = ({ text, children }) => {
  return (
    <div className="tooltip-container">
      {children}
      <div className="tooltip-text">{text}</div>
    </div>
  );
};

>>>>>>> 816d6ffa1a783ece0b06046096cbf7d360e3991d
export default Tooltip;