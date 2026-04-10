import React from "react";

// รับ props 2 ตัวจาก App.jsx:
// 1. onBack = ฟังก์ชันสำหรับกดย้อนกลับไปหน้ารายการ
// 2. onSave = ฟังก์ชันสำหรับส่งข้อมูลรองเท้าคู่ใหม่กลับไปให้ App.jsx บันทึก
function AddShoe({ onBack, onSave }) {
  // ฟังก์ชันแปลงไฟล์รูปเป็น Base64 (ย้ายมาไว้ที่นี่)
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // จัดการฟอร์มตอนกดบันทึกรองเท้า
  const handleAddShoe = async (e) => {
    e.preventDefault();
    const form = e.target;

    try {
      const coverFile = form["shoe-cover"].files[0];
      const detailFiles = form["shoe-details"].files;

      // แปลงภาพหน้าปก
      const coverBase64 = await fileToBase64(coverFile);

      // แปลงภาพรายละเอียด (หลายภาพ)
      const detailsBase64 = [];
      for (let file of detailFiles) {
        detailsBase64.push(await fileToBase64(file));
      }

      // สร้าง Object รองเท้าคู่ใหม่
      const newShoe = {
        id: form["shoe-id"].value,
        model: form["shoe-model"].value,
        size: form["shoe-size"].value,
        color: form["shoe-color"].value,
        price: form["shoe-price"].value,
        date: form["shoe-date"].value,
        coverImage: coverBase64,
        detailImages: detailsBase64,
      };

      // ส่งข้อมูลกลับไปให้ App.jsx เพื่ออัปเดต State หลัก
      onSave(newShoe);

      // แจ้งเตือนเมื่อเสร็จสิ้น
      alert("บันทึกสำเร็จ!");
    } catch (error) {
      alert("เกิดข้อผิดพลาด: รูปภาพอาจใหญ่เกินไป");
      console.error(error);
    }
  };

  return (
    <div id="add-view">
      {/* เมื่อกดปุ่มนี้ จะเรียกฟังก์ชัน onBack เพื่อกลับหน้าหลัก */}
      <button className="btn-back" onClick={onBack}>
        ← กลับหน้ารายการ
      </button>

      <div className="form-container">
        <h2>เพิ่มรองเท้าเข้าสต๊อก</h2>
        <form onSubmit={handleAddShoe}>
          <div className="form-group">
            <label>ID รหัสสินค้า</label>
            <input type="text" name="shoe-id" required />
          </div>
          <div className="form-group">
            <label>ชื่อรุ่น</label>
            <select name="shoe-model">
              <option value="Classic">Classic</option>
              <option value="Platform">Platform</option>
              <option value="Crush">Crush</option>
              <option value="Classic Baya">Classic Baya</option>
              <option value="Platform Baya">Platform Baya</option>
            </select>
          </div>
          <div className="form-group">
            <label>ไซส์ (Size)</label>
            <select name="shoe-size">
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
          <div className="form-group">
            <label>สี</label>
            <input type="text" name="shoe-color" required />
          </div>
          <div className="form-group">
            <label>ราคา</label>
            <input type="number" name="shoe-price" required />
          </div>
          <div className="form-group">
            <label>วันที่เพิ่ม</label>
            <input type="date" name="shoe-date" required />
          </div>
          <div className="form-group">
            <label>ภาพหน้าปก (1 ภาพ)</label>
            <input type="file" name="shoe-cover" accept="image/*" required />
          </div>
          <div className="form-group">
            <label>ภาพรายละเอียด (เลือกหลายภาพได้)</label>
            <input
              type="file"
              name="shoe-details"
              accept="image/*"
              multiple
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%" }}
          >
            บันทึกข้อมูล
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddShoe;
