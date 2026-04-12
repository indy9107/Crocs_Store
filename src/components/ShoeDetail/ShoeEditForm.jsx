import React from "react";

function ShoeEditForm({
  editModel,
  setEditModel,
  editSize,
  setEditSize,
  editColor,
  setEditColor,
  editPrice,
  setEditPrice,
  onCoverChange,
  onDetailChange,
  onSave,
  onCancel,
}) {
  // --- สไตล์ที่ใช้เฉพาะในฟอร์มนี้ ---
  const inputStyle = {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "15px",
    width: "100%",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontWeight: "bold",
    fontSize: "14px",
    color: "#555",
    marginBottom: "5px",
    display: "block",
  };

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
      {/* 1. ส่วนฟอร์มแก้ไขข้อความ */}
      <div
        style={{
          backgroundColor: "#f9f9f9",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <h3 style={{ margin: "0 0 15px 0", color: "#F39C12" }}>
          ✏️ แก้ไขข้อมูลสินค้า
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={labelStyle}>ชื่อรุ่น:</label>
            <input
              type="text"
              style={inputStyle}
              value={editModel}
              onChange={(e) => setEditModel(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={labelStyle}>ไซส์:</label>
              <input
                type="text"
                style={inputStyle}
                value={editSize}
                onChange={(e) => setEditSize(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={labelStyle}>สี:</label>
              <input
                type="text"
                style={inputStyle}
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <label style={labelStyle}>ราคา (฿):</label>
              <input
                type="number"
                style={inputStyle}
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ปุ่มยกเลิก */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              ...buttonBaseStyle,
              backgroundColor: "#95A5A6",
              color: "white",
            }}
          >
            ❌ ยกเลิกการแก้ไข
          </button>
        </div>
      </div>

      {/* 2. ส่วนฟอร์มอัปเดตรูปภาพ */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "2px dashed #F39C12",
          borderRadius: "8px",
          backgroundColor: "#FFF9F2",
        }}
      >
        <h3
          style={{
            color: "#D68910",
            marginTop: "0",
            marginBottom: "15px",
            fontSize: "18px",
          }}
        >
          🖼️ อัปเดตรูปภาพใหม่ (เลือกเฉพาะรูปที่ต้องการเปลี่ยน)
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={labelStyle}>1. เปลี่ยนรูปหน้าปก (เลือก 1 รูป):</label>
            <input
              type="file"
              accept="image/*"
              onChange={onCoverChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              2. เปลี่ยนรูปรายละเอียด (เลือกได้หลายรูป):
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onDetailChange}
              style={inputStyle}
            />
            <span
              style={{
                fontSize: "13px",
                color: "#e74c3c",
                display: "block",
                marginTop: "5px",
              }}
            >
              *ระวัง: การอัปโหลดใหม่จะไปแทนที่รูปรายละเอียดเดิมทั้งหมด
            </span>
          </div>
        </div>

        {/* ปุ่มบันทึก */}
        <button
          onClick={onSave}
          style={{
            ...buttonBaseStyle,
            backgroundColor: "#27AE60",
            color: "white",
            width: "100%",
            marginTop: "20px",
            padding: "12px",
          }}
        >
          💾 ยืนยันการบันทึกข้อมูลทั้งหมด
        </button>
      </div>
    </div>
  );
}

export default ShoeEditForm;
