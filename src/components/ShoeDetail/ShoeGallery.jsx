import React from "react";

function ShoeGallery({ images }) {
  // ถ้าไม่มีรูปภาพเลย ให้ซ่อน component นี้ไปเลย
  if (!images || images.length === 0) return null;

  return (
    <div style={{ marginTop: "30px" }}>
      <h3
        style={{
          borderLeft: "4px solid #2C3E50",
          paddingLeft: "10px",
          marginBottom: "15px",
        }}
      >
        รูปภาพรายละเอียด:
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
        }}
      >
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`detail-${index}`}
            style={{
              width: "100%",
              height: "250px",
              borderRadius: "8px",
              objectFit: "cover",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "1px solid #eee",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default ShoeGallery;
