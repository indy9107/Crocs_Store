import React from "react";

function AddShoeBasicFields({
  model,
  setModel,
  color,
  setColor,
  size,
  setSize,
  price,
  setPrice,
}) {
  return (
    <>
      <div className="form-group">
        <label className="form-label">ชื่อรุ่นรองเท้า</label>
        <input
          className="form-control"
          type="text"
          placeholder="เช่น Crocs Classic Clog"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">สี</label>
          <input
            className="form-control"
            type="text"
            placeholder="เช่น ดำ, ขาว, ชมพู"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">ไซส์</label>
          <select
            className="form-control"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            required
          >
            <option value="" disabled>
              เลือกไซส์
            </option>
            <option value="M4/W6">M4/W6</option>
            <option value="M5/W7">M5/W7</option>
            <option value="M6/W8">M6/W8</option>
            <option value="M7/W9">M7/W9</option>
            <option value="M8/W10">M8/W10</option>
            <option value="M9/W11">M9/W11</option>
            <option value="M10/W12">M10/W12</option>
            <option value="M11">M11</option>
            <option value="M12">M12</option>
            <option value="M13">M13</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">ราคา (บาท)</label>
        <input
          className="form-control"
          type="number"
          placeholder="เช่น 1590"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>
    </>
  );
}

export default AddShoeBasicFields;
