let scanner = null;
let scanning = false;
let scanLocked = false;

// ========================================
// เริ่ม Scanner
// ========================================
function startScanner() {
  if (scanning) return;

  scanLocked = false;
  
  // ซ่อนปุ่มสแกนอีกครั้งระหว่างเปิดกล้อง
  const scanBtn = document.getElementById("scanAgainBtn");
  if (scanBtn) scanBtn.style.display = "none";

  document.getElementById("result").innerHTML = `
    <span class="text-muted"><i class="fas fa-spinner fa-spin mr-1"></i> กำลังเปิดกล้อง...</span>
  `;

  scanner = new Html5Qrcode("reader");

  scanner.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: { width: 220, height: 220 },
      aspectRatio: 1.0
    },
    onScanSuccess,
    onScanFailure
  )
  .then(() => {
    scanning = true;
    document.getElementById("result").innerHTML = `
      <span class="text-primary"><i class="fas fa-camera mr-1"></i> กำลังสแกน...</span>
    `;
    console.log("📷 Camera started");
  })
  .catch(error => {
    console.error("❌ Camera error:", error);
    document.getElementById("result").innerHTML = `
      <span class="text-danger"><i class="fas fa-exclamation-circle mr-1"></i> ไม่สามารถเปิดกล้องได้</span>
    `;
    
    // แสดงปุ่มสแกนอีกครั้งเมื่อเกิดข้อผิดพลาด
    if (scanBtn) scanBtn.style.display = "block";

    alert("ไม่สามารถเปิดกล้องได้\n\nกรุณาอนุญาตให้ใช้งานกล้องถ่ายรูปในเบราว์เซอร์");
  });
}

// ========================================
// QR Scan สำเร็จ
// ========================================
function onScanSuccess(decodedText, decodedResult) {
  if (scanLocked) return;
  scanLocked = true;

  console.log("📷 QR Code:", decodedText);

  document.getElementById("result").innerHTML = `
    <span class="text-success"><i class="fas fa-check-circle mr-1"></i> สแกนสำเร็จ: ${decodedText}</span>
  `;

  if (window.opener && !window.opener.closed) {
    console.log("📤 กำลังส่งข้อมูลกลับ Dashboard...");

    // ส่ง HN กลับไปยัง Dashboard
    window.opener.postMessage(
      {
        type: "QR_SCANNED",
        hn: decodedText
      },
      "*"
    );

    console.log("✅ ส่งข้อมูลกลับ Dashboard แล้ว");

    stopScanner();

    document.getElementById("result").innerHTML = `
      <span class="text-success"><i class="fas fa-paper-plane mr-1"></i> ส่งข้อมูลเข้าระบบเรียบร้อย</span>
    `;

    // ปิดหน้าต่าง Scanner ให้อัตโนมัติใน 800ms
    setTimeout(() => {
      console.log("กำลังปิด Scanner...");
      window.close();
    }, 800);

  } else {
    console.error("❌ ไม่พบ window.opener");
    document.getElementById("result").innerHTML = `
      <span class="text-danger"><i class="fas fa-times-circle mr-1"></i> ไม่พบหน้าเว็บหลักที่เรียกใช้</span>
    `;

    stopScanner();
    
    // แสดงปุ่มสแกนอีกครั้งกรณีไม่มีหน้าต่างแม่
    const scanBtn = document.getElementById("scanAgainBtn");
    if (scanBtn) scanBtn.style.display = "block";
  }
}

// ========================================
// QR ยังไม่ถูกพบ
// ========================================
function onScanFailure(errorMessage) {
  // ไม่ต้องประมวลผลอะไรเพื่อลด Log ซ้ำซ้อน
}

// ========================================
// หยุด Scanner
// ========================================
function stopScanner() {
  if (!scanner || !scanning) {
    return Promise.resolve();
  }

  return scanner.stop()
    .then(() => {
      scanner.clear();
      scanning = false;
      console.log("🛑 Camera stopped");
    })
    .catch(error => {
      console.error("❌ Stop camera error:", error);
      scanning = false;
    });
}

// ========================================
// ปุ่ม Scan อีกครั้ง
// ========================================
document.getElementById("scanAgainBtn")?.addEventListener("click", async () => {
  await stopScanner();
  setTimeout(() => {
    startScanner();
  }, 300);
});

// ========================================
// เริ่มกล้องตอนเปิดหน้า
// ========================================
window.addEventListener("load", () => {
  startScanner();
});
