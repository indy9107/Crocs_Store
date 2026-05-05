import React from "react";
import "../../App.css";

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
  return (
    <div>
      {/* 1. ส่วนฟอร์มแก้ไขข้อความ */}
      <div className="shoe-edit-form-container">
        <h3 className="shoe-edit-form-header">✏️ แก้ไขข้อมูลสินค้า</h3>

        <div className="shoe-edit-form-fields">
          <div>
            <label className="shoe-edit-label">ชื่อรุ่น:</label>
            <input
              type="text"
              className="shoe-edit-input"
              value={editModel}
              onChange={(e) => setEditModel(e.target.value)}
            />
          </div>

          <div className="shoe-edit-size-color-price">
            <div>
              <label className="shoe-edit-label">ไซส์:</label>
              <input
                type="text"
                className="shoe-edit-input"
                value={editSize}
                onChange={(e) => setEditSize(e.target.value)}
              />
            </div>
            <div>
              <label className="shoe-edit-label">สี:</label>
              <input
                type="text"
                className="shoe-edit-input"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
              />
            </div>
            <div>
              <label className="shoe-edit-label">ราคา (฿):</label>
              <input
                type="number"
                className="shoe-edit-input"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ปุ่มยกเลิก */}
        <div className="shoe-edit-cancel-button">
          <button
            onClick={onCancel}
            className="shoe-edit-button-base shoe-edit-cancel-btn"
          >
            ❌ ยกเลิกการแก้ไข
          </button>
        </div>
      </div>

      {/* 2. ส่วนฟอร์มอัปเดตรูปภาพ */}
      <div className="shoe-edit-image-container">
        <h3 className="shoe-edit-image-header">
          🖼️ อัปเดตรูปภาพใหม่ (เลือกเฉพาะรูปที่ต้องการเปลี่ยน)
        </h3>

        <div className="shoe-edit-image-fields">
          <div>
            <label className="shoe-edit-label">
              1. เปลี่ยนรูปหน้าปก (เลือก 1 รูป):
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onCoverChange}
              className="shoe-edit-input"
            />
          </div>

          <div>
            <label className="shoe-edit-label">
              2. เปลี่ยนรูปรายละเอียด (เลือกได้หลายรูป):
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onDetailChange}
              className="shoe-edit-input"
              style={{ marginBottom: "2rem" }}
            />
            <span className="shoe-edit-helper-text">
              *ระวัง: การอัปโหลดใหม่จะไปแทนที่รูปรายละเอียดเดิมทั้งหมด
            </span>
          </div>
        </div>

        {/* ปุ่มบันทึก */}
        <button
          onClick={onSave}
          className="shoe-edit-button-base shoe-edit-save-btn"
        >
          💾 ยืนยันการบันทึกข้อมูลทั้งหมด
        </button>
      </div>
    </div>
  );
}

export default ShoeEditForm;
