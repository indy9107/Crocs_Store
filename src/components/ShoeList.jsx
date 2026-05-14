import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  getStoragePathFromPublicUrl,
  removeImagesByPaths,
} from "../utils/storage";
import ShoeCard from "./ShoeCard";

function ShoeList() {
  const navigate = useNavigate();
  const [filterSize, setFilterSize] = useState("all");
  const [filterColor, setFilterColor] = useState("all");
  const [shoes, setShoes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchShoes();
  }, []);

  const fetchShoes = async () => {
    setIsLoaded(false);
    const { data, error } = await supabase
      .from("shoes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error.message);
    } else if (data) {
      setShoes(data);
    }
    setIsLoaded(true);
  };

  const filteredInventory = shoes.filter((shoe) => {
    const isSizeMatch = filterSize === "all" || shoe.size === filterSize;
    const isColorMatch = filterColor === "all" || shoe.color === filterColor;
    return isSizeMatch && isColorMatch;
  });

  const enterSelectMode = () => {
    setSelectMode(true);
    setSelectedIds(new Set());
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(filteredInventory.map((s) => s.id)));
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `ยืนยันว่าต้องการลบรองเท้าที่เลือก ${ids.length} คู่ออกจากสต๊อก?`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const shoesToDelete = shoes.filter((s) => selectedIds.has(s.id));
      const imagePaths = shoesToDelete.flatMap((s) => [
        getStoragePathFromPublicUrl(s.image_url),
        ...(s.detail_images || []).map(getStoragePathFromPublicUrl),
      ]);

      const { error: storageError } = await removeImagesByPaths(imagePaths);
      if (storageError) {
        console.warn("ลบรูปบางรูปไม่สำเร็จ:", storageError.message);
      }

      const { error } = await supabase.from("shoes").delete().in("id", ids);
      if (error) throw error;

      exitSelectMode();
      await fetchShoes();
    } catch (error) {
      console.error("ลบข้อมูลไม่สำเร็จ:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูลครับ");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isLoaded && shoes.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        กำลังเชื่อมต่อกับโกดังสินค้า (Supabase)... ⏳
      </div>
    );
  }

  const selectedCount = selectedIds.size;
  const allVisibleSelected =
    filteredInventory.length > 0 &&
    filteredInventory.every((s) => selectedIds.has(s.id));

  return (
    <div id="list-view" style={{ textAlign: "center" }}>
      <h1 style={{ color: "white" }}>สต๊อกรองเท้า Crocs</h1>
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
            <option value="M4/W6">M3/W5</option>
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
      </div>

      {!selectMode ? (
        <div className="list-actions">
          <button className="btn-primary" onClick={() => navigate("/add")}>
            + เพิ่มรองเท้าใหม่
          </button>
          <button
            className="btn-select-toggle"
            onClick={enterSelectMode}
            disabled={shoes.length === 0}
          >
            🗑️ เลือกเพื่อลบ
          </button>
        </div>
      ) : (
        <div className="select-bar">
          <span className="select-bar-count">
            เลือกแล้ว <b>{selectedCount}</b> คู่
          </span>
          <button
            className="btn-select-toggle"
            onClick={
              allVisibleSelected
                ? () => setSelectedIds(new Set())
                : selectAllVisible
            }
            disabled={filteredInventory.length === 0}
          >
            {allVisibleSelected ? "ล้างการเลือก" : "เลือกทั้งหมด"}
          </button>
          <button
            className="btn-bulk-delete"
            onClick={handleBulkDelete}
            disabled={selectedCount === 0 || isDeleting}
          >
            {isDeleting ? "⏳ กำลังลบ..." : `🗑️ ลบที่เลือก (${selectedCount})`}
          </button>
          <button
            className="btn-select-cancel"
            onClick={exitSelectMode}
            disabled={isDeleting}
          >
            ยกเลิก
          </button>
        </div>
      )}

      <div className="grid-4" style={{ marginTop: "64px" }}>
        {filteredInventory.map((shoe) => (
          <ShoeCard
            key={shoe.id}
            shoe={shoe}
            selectMode={selectMode}
            isSelected={selectedIds.has(shoe.id)}
            onClick={(id) =>
              selectMode ? toggleSelect(id) : navigate(`/shoe/${id}`)
            }
          />
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
