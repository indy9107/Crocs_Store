import { useState } from "react";
import { supabase } from "../supabaseClient";

function AddShoe() {
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  // รูปหลัก 1 รูป
  const [mainImage, setMainImage] = useState(null);

  // กลุ่มรูปภาพรายละเอียด (เก็บเป็น Array)
  const [detailImages, setDetailImages] = useState([]);

  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // ----------------------------------------------------
      // 1. อัปโหลดรูปภาพหลัก (Main Image)
      // ----------------------------------------------------
      const mainFile = mainImage;
      const mainExt = mainFile.name.split(".").pop();
      const mainPath = `main_${Math.random()}.${mainExt}`;

      // ✨ เพิ่มบรรทัดนี้: สร้างไฟล์ใหม่เพื่อล้างชื่อภาษาไทยทิ้ง
      const safeMainFile = new File([mainFile], mainPath, {
        type: mainFile.type,
      });

      let { error: mainUploadError } = await supabase.storage
        .from("crocs_images")
        .upload(mainPath, safeMainFile); // <-- เปลี่ยนตรงนี้เป็น safeMainFile

      if (mainUploadError) throw mainUploadError;

      const { data: mainUrlData } = supabase.storage
        .from("crocs_images")
        .getPublicUrl(mainPath);

      const mainImageUrl = mainUrlData.publicUrl;

      // ----------------------------------------------------
      // 2. อัปโหลดกลุ่มรูปภาพรายละเอียด (Detail Images)
      // ----------------------------------------------------
      let detailImageUrls = [];

      for (const file of detailImages) {
        const fileExt = file.name.split(".").pop();
        const filePath = `detail_${Math.random()}.${fileExt}`;

        // ✨ เพิ่มบรรทัดนี้: สร้างไฟล์ใหม่เพื่อล้างชื่อภาษาไทยทิ้ง
        const safeDetailFile = new File([file], filePath, { type: file.type });

        let { error: detailUploadError } = await supabase.storage
          .from("crocs_images")
          .upload(filePath, safeDetailFile); // <-- เปลี่ยนตรงนี้เป็น safeDetailFile

        if (detailUploadError) throw detailUploadError;

        const { data: detailUrlData } = supabase.storage
          .from("crocs_images")
          .getPublicUrl(filePath);

        detailImageUrls.push(detailUrlData.publicUrl);
      }

      // ----------------------------------------------------
      // 3. บันทึกข้อมูลทั้งหมดลงตาราง shoes
      // ----------------------------------------------------
      const { error: insertError } = await supabase.from("shoes").insert([
        {
          model: model,
          price: parseFloat(price),
          size: size,
          color: color,
          image_url: mainImageUrl, // ลิงก์รูปหลัก
          detail_images: detailImageUrls, // ลิงก์กลุ่มรูปภาพ (ส่งไปเป็น Array)
        },
      ]);

      if (insertError) throw insertError;

      alert("บันทึกข้อมูลและอัปโหลดรูปทั้งหมดสำเร็จแล้ว! 🇰🇷");

      // ล้างค่าฟอร์ม
      setModel("");
      setPrice("");
      setSize("");
      setColor("");
      setMainImage(null);
      setDetailImages([]);

      // Reset ช่อง file input ให้ว่าง
      document.getElementById("detail-image-input").value = "";
      document.getElementById("main-image-input").value = "";
    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
      <h2>เพิ่มรองเท้าใหม่ (พร้อมกลุ่มรูปภาพ)</h2>

      <input
        type="text"
        placeholder="ชื่อรุ่น"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        required
      />
      <br />
      <br />
      <input
        type="text"
        placeholder="สี (เช่น ดำ, ขาว, ชมพู)"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        required
      />
      <br />
      <br />

      <select value={size} onChange={(e) => setSize(e.target.value)} required>
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
      <br />
      <br />

      <input
        type="number"
        placeholder="ราคา"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <br />
      <br />

      <hr />

      <div>
        <label>
          <b>1. รูปภาพหลัก (โชว์หน้าแรก): </b>
        </label>
        <br />
        <input
          id="main-image-input"
          type="file"
          accept="image/*"
          onChange={(e) => setMainImage(e.target.files[0])}
          required
        />
      </div>
      <br />

      <div>
        <label>
          <b>2. กลุ่มรูปภาพรายละเอียด (เลือกได้หลายรูป): </b>
        </label>
        <br />
        {/* ใส่คำว่า multiple เพื่อให้กดเลือกทีละหลายๆ รูปพร้อมกันได้ */}
        <input
          id="detail-image-input"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setDetailImages(Array.from(e.target.files))}
        />
        <p style={{ fontSize: "12px", color: "gray" }}>
          * กดลากคลุมหรือกด Ctrl ค้างไว้เพื่อเลือกหลายรูป
        </p>
      </div>
      <br />

      <button type="submit" disabled={uploading}>
        {uploading ? "กำลังอัปโหลดรูปและบันทึก..." : "บันทึกลง Cloud"}
      </button>
    </form>
  );
}

export default AddShoe;
