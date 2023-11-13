<template>
  <button>
    <div><slot /></div>
  </button>
</template>

<style scoped>
button {
  font-size: 1rem;
  cursor: pointer;
  border: none;
  color: white;
  border-radius: 20px; /* Bo tròn góc */
  padding: 0.5rem 1rem;
  /* Gradient màu tím không gian, từ tím nhẹ đến tím đậm */
  background-image: linear-gradient(to right, #8a2387, #6e48aa);
  transition: all 0.3s;
}
button:hover {
  color: white;
  /* Tăng độ sáng của gradient khi hover */
  background-image: linear-gradient(to right, #8a2387, #8a2387);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2); /* Thêm bóng đổ */
}
button:disabled {
  background-image: linear-gradient(to right, #8a2387, #8a2387) !important;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2) !important; /* Thêm bóng đổ */
  cursor: not-allowed !important;
}
</style>
