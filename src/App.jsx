import React, { useState, useEffect } from "react";
import localforage from "localforage"; // 1. Import localforage เข้ามา
import ShoeList from "./components/ShoeList";
import AddShoe from "./components/AddShoe";
import ShoeDetail from "./components/ShoeDetail";
import ShoeCard from "./components/ShoeCard";
import "./App.css";

function App() {
  const [inventory, setInventory] = useState([]);
  const [view, setView] = useState("list");
  const [selectedId, setSelectedId] = useState(null);

  // 2. สร้าง State เพื่อเช็คว่าโหลดข้อมูลเสร็จหรือยัง (กันข้อมูลเก่าหาย)
  const [isLoaded, setIsLoaded] = useState(false);

  // 3. เปลี่ยนจาก localStorage เป็น localforage.getItem
  useEffect(() => {
    // localforage จะทำงานแบบ Asynchronous (ใช้เวลาหาข้อมูลแป๊บนึง)
    localforage
      .getItem("crocsStockReact")
      .then((savedData) => {
        if (savedData) {
          setInventory(savedData);
        }
        setIsLoaded(true); // โหลดเสร็จแล้วค่อยบอกให้ระบบรู้
      })
      .catch((err) => console.log("เกิดข้อผิดพลาดในการโหลด:", err));
  }, []);

  // 4. เปลี่ยนจาก localStorage เป็น localforage.setItem
  useEffect(() => {
    // ต้องรอให้โหลดข้อมูลตอนแรกเสร็จก่อน ค่อยอนุญาตให้เซฟทับได้
    if (isLoaded) {
      localforage.setItem("crocsStockReact", inventory).catch((err) => {
        console.log("เกิดข้อผิดพลาดในการเซฟ:", err);
      });
    }
  }, [inventory, isLoaded]);

  const handleSaveShoe = (newShoe) => {
    setInventory([...inventory, newShoe]);
    setView("list");
  };

  const handleDeleteShoe = (id) => {
    if (
      window.confirm("ยืนยันว่ารองเท้าคู่นี้ขายแล้ว และต้องการลบออกจากสต๊อก?")
    ) {
      setInventory(inventory.filter((shoe) => shoe.id !== id));
      setView("list");
    }
  };

  const selectedShoe = inventory.find((shoe) => shoe.id === selectedId);

  // ถ้ายังโหลดข้อมูลไม่เสร็จ ให้ขึ้นข้อความรอก่อน
  if (!isLoaded) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        กำลังโหลดสต๊อกสินค้า...
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
