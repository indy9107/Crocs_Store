import React, { useState, useEffect } from "react";
// 1. ลบ localforage ทิ้ง แล้วเรียกใช้ Supabase แทน
import { supabase } from "./supabaseClient";
import ShoeList from "./components/ShoeList";
import AddShoe from "./components/AddShoe/AddShoe";
import ShoeDetail from "./components/ShoeDetail/ShoeDetail";
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

  // --- ฟังก์ชันตัวช่วย: ดึงชื่อไฟล์ออกจาก URL (เพราะ Supabase สั่งลบด้วย URL เต็มๆ ไม่ได้ ต้องใช้ชื่อไฟล์) ---
  const getFilePathFromUrl = (url) => {
    if (!url) return null;
    // เปลี่ยน "crocs_images" เป็นชื่อ Bucket ที่คุณตั้งไว้ใน Supabase นะครับ
    const parts = url.split("/crocs_images/");
    return parts.length > 1 ? parts[1] : null;
  };

  // --- ฟังก์ชันหลัก: จัดการอัปเดตข้อมูลและรูปภาพ ---
  const handleUpdateShoe = async (
    id,
    updatedData,
    newCoverFile,
    newDetailFiles,
  ) => {
    try {
      alert("กำลังอัปเดตข้อมูล... กรุณารอสักครู่ครับ ⏳");

      // 1. หาข้อมูลรองเท้าคู่เดิม เพื่อเอา URL รูปเก่ามาเตรียมลบ
      const currentShoe = inventory.find(
        (shoe) => String(shoe.id) === String(id),
      );
      let finalImageUrl = currentShoe.image_url;
      let finalDetailImages = currentShoe.detail_images || [];

      // ==========================================
      // 2. จัดการรูปหน้าปก (ถ้ามีการเลือกไฟล์ใหม่)
      // ==========================================
      if (newCoverFile) {
        // ลบรูปเก่า
        const oldCoverPath = getFilePathFromUrl(currentShoe.image_url);
        if (oldCoverPath) {
          await supabase.storage.from("crocs_images").remove([oldCoverPath]);
        }

        // อัปโหลดรูปใหม่ด้วย ArrayBuffer
        const fileExt = newCoverFile.name.split(".").pop();
        const fileName = `cover_${Date.now()}.${fileExt}`; // ตั้งชื่อไฟล์ใหม่กันซ้ำ
        const arrayBuffer = await newCoverFile.arrayBuffer();

        const { error: uploadError } = await supabase.storage
          .from("crocs_images")
          .upload(fileName, arrayBuffer, { contentType: newCoverFile.type });

        if (uploadError) throw uploadError;

        // ขอ URL เส้นใหม่
        const { data: publicUrlData } = supabase.storage
          .from("crocs_images")
          .getPublicUrl(fileName);
        finalImageUrl = publicUrlData.publicUrl;
      }

      // ==========================================
      // 3. จัดการรูปรายละเอียด (ถ้ามีการเลือกไฟล์ใหม่)
      // ==========================================
      if (newDetailFiles && newDetailFiles.length > 0) {
        // ลบรูปรายละเอียดเก่าทั้งหมด
        if (currentShoe.detail_images && currentShoe.detail_images.length > 0) {
          const oldPaths = currentShoe.detail_images
            .map((url) => getFilePathFromUrl(url))
            .filter((path) => path !== null); // กรองค่าที่พังทิ้ง

          if (oldPaths.length > 0) {
            await supabase.storage.from("crocs_images").remove(oldPaths);
          }
        }

        // อัปโหลดรูปรายละเอียดใหม่ทั้งหมด
        const newDetailUrls = [];
        for (let i = 0; i < newDetailFiles.length; i++) {
          const file = newDetailFiles[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `detail_${id}_${Date.now()}_${i}.${fileExt}`;
          const arrayBuffer = await file.arrayBuffer();

          const { error: uploadError } = await supabase.storage
            .from("crocs_images")
            .upload(fileName, arrayBuffer, { contentType: file.type });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("crocs_images")
            .getPublicUrl(fileName);
          newDetailUrls.push(publicUrlData.publicUrl);
        }
        finalDetailImages = newDetailUrls;
      }

      // ==========================================
      // 4. อัปเดตข้อมูลทั้งหมดลง Database
      // ==========================================
      const dataToUpdate = {
        ...updatedData, // ข้อมูล รุ่น, ไซส์, สี, ราคา ที่พิมพ์แก้
        image_url: finalImageUrl,
        detail_images: finalDetailImages,
      };

      const { error: updateError } = await supabase
        .from("shoes")
        .update(dataToUpdate)
        .eq("id", id); // อัปเดตเฉพาะคู่ที่ ID ตรงกัน

      if (updateError) throw updateError;

      // 5. โหลดข้อมูลใหม่เพื่อให้หน้าเว็บรีเฟรช และเปลี่ยนหน้ากลับไปดูรายละเอียด
      alert("อัปเดตข้อมูลและรูปภาพเรียบร้อยแล้ว! 🎉");
      await fetchShoes(); // เรียกใช้ฟังก์ชัน fetchShoes ที่เราเคยเขียนไว้เพื่อดึงข้อมูลใหม่

      setView("list");
    } catch (error) {
      console.error("Error updating shoe:", error);
      alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูลครับ ดูรายละเอียดใน Console");
    }
  };

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
          onUpdateShoe={handleUpdateShoe}
        />
      )}
    </div>
  );
}

export default App;
