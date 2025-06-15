<<<<<<< HEAD
import React from "react";
import styles from "./IDCardPreview.module.css"; // Import the CSS module

const IDCardPreview = ({ idImage }) => {
  return (
    <div className={styles.previewContainer}>
      <div className={styles.idImageContainer}>
        <img
          src={idImage}
          alt="Generated ID"
          className={styles.idImage} // Use the CSS class for the image
        />
      </div>
    </div>
  );
};

=======
import React from "react";
import styles from "./IDCardPreview.module.css"; // Import the CSS module

const IDCardPreview = ({ idImage }) => {
  return (
    <div className={styles.previewContainer}>
      <div className={styles.idImageContainer}>
        <img
          src={idImage}
          alt="Generated ID"
          className={styles.idImage} // Use the CSS class for the image
        />
      </div>
    </div>
  );
};

>>>>>>> 816d6ffa1a783ece0b06046096cbf7d360e3991d
export default IDCardPreview;