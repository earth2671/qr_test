let scanner = null;
let scanning = false;
let scanLocked = false;


// ========================================
// เริ่ม Scanner
// ========================================

function startScanner() {

  if (scanning) {
    return;
  }

  scanLocked = false;

  document.getElementById("result").textContent =
    "กำลังเปิดกล้อง...";


  scanner = new Html5Qrcode("reader");


  scanner.start(

    {
      facingMode: "environment"
    },

    {
      fps: 10,

      qrbox: {
        width: 250,
        height: 250
      },

      aspectRatio: 1.0
    },

    onScanSuccess,

    onScanFailure

  )
  .then(() => {

    scanning = true;

    document.getElementById("result").textContent =
      "กำลังสแกน...";

    console.log("📷 Camera started");

  })
  .catch(error => {

    console.error(
      "❌ Camera error:",
      error
    );

    document.getElementById("result").textContent =
      "❌ ไม่สามารถเปิดกล้องได้";

    alert(
      "ไม่สามารถเปิดกล้องได้\n\n" +
      "กรุณาอนุญาต Camera ให้เว็บไซต์นี้"
    );

  });
}


// ========================================
// QR Scan สำเร็จ
// ========================================

function onScanSuccess(decodedText, decodedResult) {

  // ป้องกัน Scan ซ้ำ
  if (scanLocked) {
    return;
  }

  scanLocked = true;


  console.log(
    "📷 QR Code:",
    decodedText
  );


  document.getElementById("result").textContent =
    "สแกนสำเร็จ: " + decodedText;


  // =====================================
  // ตรวจสอบ Dashboard
  // =====================================

  console.log(
    "window.opener =",
    window.opener
  );


  if (
    window.opener &&
    !window.opener.closed
  ) {

    console.log(
      "📤 กำลังส่งข้อมูลกลับ Dashboard..."
    );


    // ===================================
    // ส่ง HN กลับ Dashboard
    // ===================================

    window.opener.postMessage(
      {
        type: "QR_SCANNED",
        hn: decodedText
      },
      "*"
    );


    console.log(
      "✅ ส่งข้อมูลกลับ Dashboard แล้ว"
    );


    // ===================================
    // หยุดกล้อง
    // ===================================

    stopScanner();


    document.getElementById("result").textContent =
      "✅ ส่งข้อมูลกลับ Dashboard แล้ว";


    // ===================================
    // ปิดหน้าต่าง Scanner
    // ===================================

    setTimeout(() => {

      console.log(
        "กำลังปิด Scanner..."
      );

      window.close();

    }, 1000);


  } else {

    // ===================================
    // ไม่มี Dashboard
    // ===================================

    console.error(
      "❌ ไม่พบ window.opener"
    );


    document.getElementById("result").textContent =
      "❌ ไม่พบหน้า Dashboard ที่เปิด Scanner";


    stopScanner();

  }

}


// ========================================
// QR ยังไม่ถูกพบ
// ========================================

function onScanFailure(errorMessage) {

  // ไม่ต้องทำอะไร
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

      console.log(
        "🛑 Camera stopped"
      );

    })

    .catch(error => {

      console.error(
        "❌ Stop camera error:",
        error
      );

      scanning = false;

    });
}


// ========================================
// ปุ่ม Scan อีกครั้ง
// ========================================

document
  .getElementById("scanAgainBtn")
  .addEventListener(
    "click",
    async () => {

      await stopScanner();

      setTimeout(() => {

        startScanner();

      }, 300);

    }
  );


// ========================================
// เริ่มกล้องตอนเปิดหน้า
// ========================================

window.addEventListener(
  "load",
  () => {

    startScanner();

  }
);
