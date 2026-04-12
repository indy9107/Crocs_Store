import React from "react";

function AddShoeImageFields({ setMainImage, setDetailImages }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label-blue">1. รูปภาพหน้าปก (โชว์หน้าแรก)</label>
        <input
          className="form-control"
          id="main-image-input"
          type="file"
          accept="image/*"
          onChange={(e) => setMainImage(e.target.files[0])}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label-blue">
          2. รูปภาพรายละเอียด (เลือกได้หลายรูป)
        </label>
        <input
          className="form-control"
          id="detail-image-input"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setDetailImages(Array.from(e.target.files))}
        />
        <span className="form-helper-text">
          * กดลากคลุมหรือกด Ctrl ค้างไว้เพื่อเลือกหลายรูป
        </span>
      </div>
    </>
  );
}

export default AddShoeImageFields;
