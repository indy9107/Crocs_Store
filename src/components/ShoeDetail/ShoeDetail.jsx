import React, { useState } from "react";
import ShoeInfoDisplay from "./ShoeInfoDisplay";
import ShoeEditForm from "./ShoeEditForm";
import ShoeGallery from "./ShoeGallery";

function ShoeDetail({ shoe, onBack, onDelete, onUpdateShoe }) {
  // --- State สำหรับโหมดแก้ไข ---
  const [isEditingMode, setIsEditingMode] = useState(false);

  // State สำหรับข้อความ
  const [editModel, setEditModel] = useState("");
  const [editSize, setEditSize] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editPrice, setEditPrice] = useState("");

  // State สำหรับรูปภาพ
  const [newCoverFile, setNewCoverFile] = useState(null);
  const [newDetailFiles, setNewDetailFiles] = useState([]);

  if (!shoe) {
    return <p className="text-center-mt50">ไม่พบข้อมูลรองเท้า</p>;
  }

  const handleShare = async () => {
    if (!shoe.detail_images || shoe.detail_images.length === 0) {
      alert("ไม่มีรูปรายละเอียดสำหรับแชร์ครับ");
      return;
    }
    try {
      const filePromises = shoe.detail_images.map(async (imgUrl, index) => {
        const response = await fetch(imgUrl);
        const blob = await response.blob();
        return new File([blob], `${shoe.model}-detail-${index + 1}.jpg`, {
          type: "image/jpeg",
        });
      });
      const filesToShare = await Promise.all(filePromises);
      if (navigator.canShare && navigator.canShare({ files: filesToShare })) {
        await navigator.share({ files: filesToShare });
      } else {
        alert(
          "เบราว์เซอร์หรืออุปกรณ์นี้ ไม่รองรับการแชร์รูปภาพหลายรูปพร้อมกันครับ",
        );
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        alert("เกิดข้อผิดพลาดในการแชร์รูปภาพ");
        console.error(error);
      }
    }
  };

  // --- ฟังก์ชันเปิด/ปิดโหมดแก้ไข ---
  const toggleEditMode = () => {
    if (!isEditingMode) {
      setEditModel(shoe.model);
      setEditSize(shoe.size);
      setEditColor(shoe.color);
      setEditPrice(shoe.price);
    } else {
      setNewCoverFile(null);
      setNewDetailFiles([]);
    }
    setIsEditingMode(!isEditingMode);
  };

  const handleCoverChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewCoverFile(e.target.files[0]);
    }
  };

  const handleDetailChange = (e) => {
    if (e.target.files) {
      setNewDetailFiles(Array.from(e.target.files));
    }
  };

  const handleSaveChanges = () => {
    if (!editModel || !editSize || !editColor || !editPrice) {
      alert("กรุณากรอกข้อมูลตัวหนังสือให้ครบทุกช่องครับ");
      return;
    }

    const updatedData = {
      model: editModel,
      size: editSize,
      color: editColor,
      price: parseFloat(editPrice),
    };

    if (onUpdateShoe) {
      onUpdateShoe(shoe.id, updatedData, newCoverFile, newDetailFiles);
    } else {
      console.log("ข้อมูลที่รอส่งอัปเดต:", updatedData);
      console.log("ไฟล์หน้าปกใหม่:", newCoverFile);
      console.log("ไฟล์รายละเอียดใหม่:", newDetailFiles);
      alert("รับข้อมูลสำเร็จ! (รอเอา onUpdateShoe มาต่อฝั่ง App.jsx)");
    }
  };

  return (
    <div className="shoe-detail-container">
      {/* ปุ่มกลับ */}
      <button className="btn-back-outline" onClick={onBack}>
        &larr; กลับหน้ารายการ
      </button>

      <div className="shoe-detail-content">
        {/* ✨ สลับโหมดตรงนี้: ถ้าไม่ได้แก้ให้โชว์ ShoeInfoDisplay ถ้าแก้ให้โชว์ ShoeEditForm */}
        {!isEditingMode ? (
          <ShoeInfoDisplay
            shoe={shoe}
            onShare={handleShare}
            onDelete={onDelete}
            onToggleEdit={toggleEditMode}
          />
        ) : (
          <ShoeEditForm
            editModel={editModel}
            setEditModel={setEditModel}
            editSize={editSize}
            setEditSize={setEditSize}
            editColor={editColor}
            setEditColor={setEditColor}
            editPrice={editPrice}
            setEditPrice={setEditPrice}
            onCoverChange={handleCoverChange}
            onDetailChange={handleDetailChange}
            onSave={handleSaveChanges}
            onCancel={toggleEditMode}
          />
        )}
      </div>

      {!isEditingMode && <ShoeGallery images={shoe.detail_images} />}
    </div>
  );
}

export default ShoeDetail;
