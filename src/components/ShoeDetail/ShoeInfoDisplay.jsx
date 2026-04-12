import React from "react";

function ShoeInfoDisplay({ shoe, onShare, onDelete, onToggleEdit }) {
  // สไตล์ปุ่มที่ดึงมาเฉพาะที่ใช้ในไฟล์นี้
  const buttonBaseStyle = {
    padding: "10px 16px",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s",
  };

  return (
    <div>
      {/* 1. ส่วนแสดงข้อความ */}
      <h2 style={{ margin: "0 0 15px 0", fontSize: "24px", color: "#ffffff" }}>
        {shoe.model}{" "}
        <span style={{ fontSize: "14px", color: "#888", fontWeight: "normal" }}>
          (ID: {shoe.id})
        </span>
      </h2>
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          color: "#ffffff",
          fontSize: "16px",
        }}
      >
        <p style={{ margin: "5px 0" }}>
          📏 <b>ไซส์:</b> {shoe.size}
        </p>
        <p style={{ margin: "5px 0" }}>
          🎨 <b>สี:</b> {shoe.color}
        </p>
        <p style={{ margin: "5px 0" }}>
          💰 <b>ราคา:</b> ฿{shoe.price.toLocaleString()}
        </p>
        <p style={{ margin: "5px 0" }}>
          📅 <b>วันที่ลงสต๊อก:</b>{" "}
          {new Date(shoe.date || shoe.created_at).toLocaleDateString("th-TH")}
        </p>
      </div>

      {/* 2. ส่วนแสดงปุ่มกด */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "20px",
        }}
      >
        <button
          onClick={onShare}
          style={{
            ...buttonBaseStyle,
            backgroundColor: "#3498DB",
            color: "white",
          }}
        >
          📤 แชร์ข้อมูล
        </button>
        <button
          onClick={() => onDelete(shoe.id)}
          style={{
            ...buttonBaseStyle,
            backgroundColor: "#E74C3C",
            color: "white",
          }}
        >
          🗑️ ขายแล้ว (ลบ)
        </button>

        {/* ปุ่มนี้ดันไปอยู่ขวาสุดด้วย marginLeft: "auto" */}
        <button
          onClick={onToggleEdit}
          style={{
            ...buttonBaseStyle,
            backgroundColor: "#F39C12",
            color: "white",
            marginLeft: "auto",
          }}
        >
          ✏️ แก้ไขข้อมูล / เปลี่ยนรูป
        </button>
      </div>
    </div>
  );
}

export default ShoeInfoDisplay;
