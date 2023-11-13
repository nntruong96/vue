<template>
  <button>
    <div><slot /></div>
  </button>
</template>

<style scoped>
button {
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  color: #fff;
  border-radius: 4px;
  padding: 6px 16px;
  background-color: #1976d2; /* Màu nền xanh Mui */
  box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
  transition: background-color 0.3s ease;
  outline: none;
  text-transform: uppercase;
  letter-spacing: 0.02857em;
  font-weight: 500;
}
button:hover {
  background-color: #115293; /* Màu sáng hơn khi hover */
  /* Giữ nguyên box-shadow cho hover */
}
button:disabled {
  background-color: #1976d2 !important;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2) !important; /* Thêm bóng đổ */
  cursor: not-allowed !important;
}
</style>
