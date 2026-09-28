const API_URL = "https://ahliya-lookup.zadmed.workers.dev";

function setState(html) {
  document.getElementById("resultArea").innerHTML = html;
}

function loadingState() {
  setState(`
    <div class="state-message loading">جارٍ البحث...</div>
  `);
}

function errorState(message) {
  setState(`
    <div class="state-message error">${message}</div>
  `);
}

function studentState(student) {
  const yearRow = student.year
    ? `<dt>الفرقة</dt><dd>${escapeHtml(student.year)}</dd>`
    : "";
  const groupRow = student.group
    ? `<dt>المجموعة</dt><dd>${escapeHtml(student.group)}</dd>`
    : "";
  const sectionRow = student.section
    ? `<dt>السكشن</dt><dd>${escapeHtml(student.section)}</dd>`
    : "";

  setState(`
    <div class="student-card">
      <div class="ribbon">تم العثور على الطالب</div>
      <dl>
        <dt>اسم الطالب</dt>
        <dd>${escapeHtml(student.name)}</dd>
        ${yearRow}
        ${groupRow}
        ${sectionRow}
        <dt>كود الدخول (زاد ومودل)</dt>
        <dd class="code">${escapeHtml(student.usercode)}</dd>
      </dl>
    </div>
  `);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

async function retrieveInfo() {
  const idInput = document.getElementById("nationalID");
  const id = idInput.value.trim();

  setState("");

  if (!/^\d{14}$/.test(id)) {
    errorState("الرجاء إدخال رقم بطاقة صحيح (14 رقم)");
    return;
  }

  loadingState();

  try {
    const response = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`);

    if (response.status === 404) {
      errorState("رقم البطاقة غير صحيح");
      return;
    }

    if (!response.ok) {
      errorState("حدث خطأ، حاول مرة أخرى");
      return;
    }

    const student = await response.json();
    studentState(student);
  } catch (err) {
    errorState("تعذر الاتصال بالخادم");
  }
}

// Allow pressing Enter in the input to trigger the search
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("nationalID");
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") retrieveInfo();
    });
  }
});
