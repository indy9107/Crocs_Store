import React, { useState } from "react";

// ✨ เปลี่ยนชื่อ prop จาก onUpdateImages เป็น onUpdateShoe เพื่อให้ครอบคลุมทั้งข้อมูลและรูปภาพ
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

  if (!shoe) return <p>ไม่พบข้อมูลรองเท้า</p>;

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
      // ถ้ากำลังจะเปิดโหมดแก้ไข ให้ดึงข้อมูลเดิมมาใส่รอไว้ในช่องกรอก
      setEditModel(shoe.model);
      setEditSize(shoe.size);
      setEditColor(shoe.color);
      setEditPrice(shoe.price);
    } else {
      // ถ้ากดยกเลิก ให้เคลียร์ไฟล์รูปที่เลือกค้างไว้ทิ้ง
      setNewCoverFile(null);
      setNewDetailFiles([]);
    }
    setIsEditingMode(!isEditingMode);
  };

  // --- ฟังก์ชันจัดการการเลือกไฟล์ใหม่ ---
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

  // --- ฟังก์ชันกดบันทึกการแก้ไขทั้งหมด ---
  const handleSaveChanges = () => {
    // เช็คว่าผู้ใช้กรอกข้อมูลครบไหม
    if (!editModel || !editSize || !editColor || !editPrice) {
      alert("กรุณากรอกข้อมูลตัวหนังสือให้ครบทุกช่องครับ");
      return;
    }

    // มัดรวมข้อมูลตัวหนังสือที่พิมพ์แก้ใหม่
    const updatedData = {
      model: editModel,
      size: editSize,
      color: editColor,
      price: parseFloat(editPrice), // แปลงราคาเป็นตัวเลข
    };

    if (onUpdateShoe) {
      // ส่งข้อมูลกลับไปให้ไฟล์แม่ (ID รองเท้า, ข้อมูลใหม่, ไฟล์หน้าปก, ไฟล์รายละเอียด)
      onUpdateShoe(shoe.id, updatedData, newCoverFile, newDetailFiles);
    } else {
      console.log("ข้อมูลที่รอส่งอัปเดต:", updatedData);
      console.log("ไฟล์หน้าปกใหม่:", newCoverFile);
      console.log("ไฟล์รายละเอียดใหม่:", newDetailFiles);
      alert("รับข้อมูลสำเร็จ! (รอเอา onUpdateShoe มาต่อฝั่ง App.jsx)");
    }
  };

  return (
    <div id="detail-view">
      <button className="btn-back" onClick={onBack}>
        ← กลับหน้ารายการ
      </button>

      <div>
        <div className="detail-info">
          {/* ✨ ส่วนแสดงข้อมูล: สลับโชว์ระหว่าง "ข้อความธรรมดา" กับ "ช่องกรอกข้อมูล" */}
          {!isEditingMode ? (
            <div>
              <h2>
                รุ่น: {shoe.model} (ID: {shoe.id})
              </h2>
              <p>
                <b>ไซส์:</b> {shoe.size} | <b>สี:</b> {shoe.color}
              </p>
              <p>
                <b>ราคา:</b> ฿{shoe.price} | <b>วันที่ลงสต๊อก:</b>{" "}
                {shoe.date || shoe.created_at}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                backgroundColor: "#f9f9f9",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#F39C12" }}>
                แก้ไขข้อมูลสินค้า
              </h3>
              <div>
                <label>
                  <b>รุ่น: </b>
                </label>
                <input
                  type="text"
                  value={editModel}
                  onChange={(e) => setEditModel(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", gap: "15px" }}>
                <div>
                  <label>
                    <b>ไซส์: </b>
                  </label>
                  <input
                    type="text"
                    value={editSize}
                    onChange={(e) => setEditSize(e.target.value)}
                    style={{ width: "80px" }}
                  />
                </div>
                <div>
                  <label>
                    <b>สี: </b>
                  </label>
                  <input
                    type="text"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    style={{ width: "100px" }}
                  />
                </div>
                <div>
                  <label>
                    <b>ราคา (฿): </b>
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    style={{ width: "100px" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "15px",
            }}
          >
            {!isEditingMode && (
              <>
                <button
                  className="btn-primary"
                  onClick={handleShare}
                  style={{ backgroundColor: "#3498DB" }}
                >
                  📤 แชร์ข้อมูลให้ลูกค้า
                </button>
                <button
                  className="btn-danger"
                  onClick={() => onDelete(shoe.id)}
                >
                  ขายแล้ว (ลบออกจากสต๊อก)
                </button>
              </>
            )}

            <button
              className="btn-secondary"
              onClick={toggleEditMode}
              style={{
                backgroundColor: isEditingMode ? "#95A5A6" : "#F39C12",
                color: "white",
                border: "none",
                padding: "10px 15px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {isEditingMode ? "ยกเลิกการแก้ไข" : "✏️ แก้ไขข้อมูล / เปลี่ยนรูป"}
            </button>
          </div>
        </div>

        {/* ✨ แผงควบคุมการอัปโหลดรูปภาพ (โชว์เฉพาะตอนกดแก้ไข) */}
        {isEditingMode && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              border: "2px dashed #F39C12",
              borderRadius: "8px",
              backgroundColor: "#FFF9F2",
            }}
          >
            <h3 style={{ color: "#D68910", marginTop: "0" }}>
              อัปเดต / เปลี่ยนรูปภาพใหม่ (เลือกเฉพาะรูปที่ต้องการเปลี่ยน)
            </h3>

            <div style={{ marginBottom: "15px" }}>
              <label>
                <b>1. เปลี่ยนรูปหน้าปก (เลือก 1 รูป):</b>
              </label>
              <br />
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                style={{ marginTop: "5px" }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                <b>2. เปลี่ยนรูปรายละเอียด (เลือกได้หลายรูป):</b>
                <br />
                <span style={{ fontSize: "12px", color: "#666" }}>
                  *การอัปโหลดใหม่จะไปแทนที่รูปรายละเอียดเดิมทั้งหมด
                </span>
              </label>
              <br />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleDetailChange}
                style={{ marginTop: "5px" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                className="btn-primary"
                onClick={handleSaveChanges}
                style={{ backgroundColor: "#27AE60" }}
              >
                💾 ยืนยันการบันทึกข้อมูลทั้งหมด
              </button>
            </div>
          </div>
        )}

        {/* โชว์รูปภาพรายละเอียด (ซ่อนตอนโหมดแก้ไขเพื่อไม่ให้รกรุงรัง) */}
        {!isEditingMode && (
          <>
            <h3>รูปภาพรายละเอียด:</h3>
            <div className="grid-4">
              {shoe.detail_images &&
                shoe.detail_images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`detail-${index}`}
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      objectFit: "cover",
                      height: "300px",
                    }}
                  />
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ShoeDetail;
