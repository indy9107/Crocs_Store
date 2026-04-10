import React, { useState } from "react";
import ShoeCard from "./ShoeCard"; // 1. Import คอมโพเนนต์ที่เพิ่งสร้างมา

function ShoeList({ inventory, onAddClick, onShoeClick }) {
  const [filterSize, setFilterSize] = useState("all");

  const filteredInventory =
    filterSize === "all"
      ? inventory
      : inventory.filter((shoe) => shoe.size === filterSize);

  return (
    <div id="list-view">
      <h1>สต๊อกรองเท้า Crocs</h1>
      <div className="header-actions">
        <div>
          <label>
            <b>หมวดหมู่ไซส์: </b>
          </label>
          <select
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value)}
          >
            <option value="all">ทั้งหมด</option>
            <option value="M4/W6">M4/W6</option>
            <option value="M5/W7">M5/W7</option>
            <option value="M6/W8">M6/W8</option>
            <option value="M7/W9">M7/W9</option>
            <option value="M8/W10">M8/W10</option>
          </select>
        </div>

        <button className="btn-primary" onClick={onAddClick}>
          + เพิ่มรองเท้าใหม่
        </button>
      </div>

      <div className="grid-4" style={{ marginTop: "64px" }}>
        {filteredInventory.map((shoe) => (
          // 2. เรียกใช้ ShoeCard แทนก้อน div เดิม
          <ShoeCard key={shoe.id} shoe={shoe} onClick={onShoeClick} />
        ))}

        {filteredInventory.length === 0 && (
          <p style={{ gridColumn: "span 4", textAlign: "center" }}>
            ยังไม่มีสินค้ารายการนี้ในสต๊อก
          </p>
        )}
      </div>
    </div>
  );
}

export default ShoeList;
