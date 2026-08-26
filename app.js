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

    console.log("Camera started");

  })
  .catch(error => {

    console.error(
      "Camera error:",
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
// เมื่ออ่าน QR สำเร็จ
// ========================================

function onScanSuccess(decodedText, decodedResult) {

  if (scanLocked) {
    return;
  }

  scanLocked = true;

  console.log("QR Code:", decodedText);

  document.getElementById("result").textContent =
    "สแกนสำเร็จ: " + decodedText;


  // =====================================
  // ตรวจสอบว่ามีหน้าหลักที่เปิด Scanner หรือไม่
  // =====================================

  console.log("window.opener =", window.opener);


  if (window.opener && !window.opener.closed) {

    console.log("กำลังส่งข้อมูลกลับ Dashboard...");

    window.opener.postMessage(
      {
        type: "QR_SCANNED",
        hn: decodedText
      },
      "*"
    );

    console.log("ส่งข้อมูลกลับแล้ว");


    // หยุดกล้องก่อน

    stopScanner();


    // แจ้งผู้ใช้ก่อนปิด

    document.getElementById("result").textContent =
      "✅ ส่งข้อมูลกลับ Dashboard แล้ว";


    setTimeout(function () {

      window.close();

    }, 1000);


  } else {

    console.error(
      "ไม่พบ window.opener"
    );

    document.getElementById("result").textContent =
      "❌ ไม่พบหน้า Dashboard ที่เปิด Scanner";

    stopScanner();

  }
}

function onScanFailure(errorMessage) {

  // ไม่ต้องทำอะไร
  //
  // function นี้จะถูกเรียกบ่อยมาก
  // ขณะที่กล้องกำลังหา QR
}


// ========================================
// หยุด Scanner
// ========================================

function stopScanner() {

  if (!scanner || !scanning) {
    return;
  }


  scanner.stop()

    .then(() => {

      scanner.clear();

      scanning = false;

      console.log(
        "Camera stopped"
      );

    })

    .catch(error => {

      console.error(
        "Stop camera error:",
        error
      );

    });
}


// ========================================
// ปุ่มสแกนใหม่
// ========================================

document
  .getElementById("scanAgainBtn")
  .addEventListener("click", () => {

    stopScanner();

    setTimeout(() => {

      startScanner();

    }, 300);

  });


// ========================================
// เริ่มกล้องเมื่อเปิดหน้า
// ========================================

window.addEventListener(
  "load",
  () => {

    startScanner();

  }
);
