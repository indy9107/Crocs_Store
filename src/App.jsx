import React, { useState, useEffect } from "react";
// 1. ลบ localforage ทิ้ง แล้วเรียกใช้ Supabase แทน
import { supabase } from "./supabaseClient";
import ShoeList from "./components/ShoeList";
import AddShoe from "./components/AddShoe";
import ShoeDetail from "./components/ShoeDetail";
import ShoeCard from "./components/ShoeCard"; // ถ้าในหน้านี้ไม่ได้ใช้ ShoeCard ลบทิ้งได้นะครับ
import "./App.css";

function App() {
  const [inventory, setInventory] = useState([]);
  const [view, setView] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 2. ฟังก์ชันสำหรับดึงข้อมูลจาก Supabase
  const fetchShoes = async () => {
    setIsLoaded(false); // เริ่มโหลด
    try {
      // ดึงข้อมูลทั้งหมดจากตาราง shoes และเรียงจากล่าสุดขึ้นก่อน
      const { data, error } = await supabase
        .from("shoes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setInventory(data);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลจาก Supabase:", error);
    } finally {
      setIsLoaded(true); // โหลดเสร็จแล้ว
    }
  };

  // 3. สั่งให้ดึงข้อมูลใหม่ทุกครั้งที่เปิดเว็บ หรือสลับหน้าจอ (เช่น กลับมาจากหน้า Add)
  useEffect(() => {
    fetchShoes();
  }, [view]);

  // 4. หน้า AddShoe จัดการเซฟลง Supabase เองแล้ว หน้านี้แค่สั่งเปลี่ยนหน้าก็พอ
  const handleSaveShoe = () => {
    setView("list");
  };

  // 5. อัปเกรดฟังก์ชันลบ ให้ไปลบใน Supabase ด้วย
  const handleDeleteShoe = async (id) => {
    if (
      window.confirm("ยืนยันว่ารองเท้าคู่นี้ขายแล้ว และต้องการลบออกจากสต๊อก?")
    ) {
      try {
        const { error } = await supabase.from("shoes").delete().eq("id", id); // ลบแถวที่ id ตรงกัน

        if (error) throw error;

        // ถ้าลบในฐานข้อมูลสำเร็จ ค่อยเอาออกจากหน้าจอ
        setInventory(inventory.filter((shoe) => shoe.id !== id));
        setView("list");
      } catch (error) {
        console.error("ลบข้อมูลไม่สำเร็จ:", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูลครับ");
      }
    }
  };

  // ✨ ท่าไม้ตายกันพลาด: แปลง ID เป็น String ก่อนเทียบ (กันปัญหา String ไม่เท่ากับ Number)
  const selectedShoe = inventory.find(
    (shoe) => String(shoe.id) === String(selectedId),
  );

  if (!isLoaded && inventory.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        กำลังเชื่อมต่อกับโกดังสินค้า (Supabase)... ⏳
      </div>
    );
  }

  return (
    <div className="app-container">
      {view === "list" && (
        <ShoeList
          inventory={inventory}
          onAddClick={() => setView("add")}
          onShoeClick={(id) => {
            setSelectedId(id);
            setView("detail");
          }}
        />
      )}
      {view === "add" && (
        <AddShoe onBack={() => setView("list")} onSave={handleSaveShoe} />
      )}
      {view === "detail" && (
        <ShoeDetail
          shoe={selectedShoe}
          onBack={() => setView("list")}
          onDelete={handleDeleteShoe}
        />
      )}
    </div>
  );
}

export default App;
