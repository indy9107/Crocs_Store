import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // 1. Import supabase
import ShoeCard from "./ShoeCard";

function ShoeList({ onAddClick, onShoeClick }) {
  // สังเกตว่าผมเอา prop 'inventory' ออกไปแล้ว เพราะเราจะดึงจาก Cloud แทน
  const [filterSize, setFilterSize] = useState("all");
  const [filterColor, setFilterColor] = useState("all");
  const [shoes, setShoes] = useState([]); // 2. สร้าง state สำหรับเก็บข้อมูลรองเท้า

  // 3. ใช้ useEffect เพื่อเรียก fetchShoes ทันทีที่เปิดหน้านี้ขึ้นมา
  useEffect(() => {
    fetchShoes();
  }, []);

  const fetchShoes = async () => {
    const { data, error } = await supabase
      .from("shoes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error.message);
    } else if (data) {
      setShoes(data); // เก็บข้อมูลลง state
    }
  };

  // 4. เปลี่ยนมาฟิลเตอร์จาก state 'shoes' แทน 'inventory' ตัวเก่า
  const filteredInventory = shoes.filter((shoe) => {
    // เช็คเงื่อนไขไซส์
    const isSizeMatch = filterSize === "all" || shoe.size === filterSize;
    // เช็คเงื่อนไขสี
    const isColorMatch = filterColor === "all" || shoe.color === filterColor;

    // โชว์เฉพาะคู่ที่ผ่านทั้ง 2 เงื่อนไข
    return isSizeMatch && isColorMatch;
  });

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
            <option value="M9/W11">M9/W11</option>
            <option value="M10/W12">M10/W12</option>
            <option value="M11">M11</option>
            <option value="M12">M12</option>
            <option value="M13">M13</option>
          </select>
        </div>
        <div>
          <label>
            <b>หมวดหมู่สี: </b>
          </label>
          <select
            value={filterColor}
            onChange={(e) => setFilterColor(e.target.value)}
          >
            <option value="all">ทั้งหมด</option>
            <option value="ขาว">ขาว</option>
            <option value="ครีม">ครีม</option>
            <option value="เทา">เทา</option>
            <option value="ดำ">ดำ</option>
          </select>
        </div>

        <button className="btn-primary" onClick={onAddClick}>
          + เพิ่มรองเท้าใหม่
        </button>
      </div>

      <div className="grid-4" style={{ marginTop: "64px" }}>
        {filteredInventory.map((shoe) => (
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
