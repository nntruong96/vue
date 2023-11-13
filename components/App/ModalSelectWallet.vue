<script setup>
import { ref, watchEffect } from 'vue';

const { onSelectWallet, isOpen, onClose } = defineProps({
  isOpen: Boolean,
  onClose: Function,
  onSelectWallet: Function,
});

const WALLET_LIST = ref([
  {
    key: 'keplr',
    name: 'Keplr',
  },
  {
    key: 'metamask',
    name: 'Metamask',
  },
]);

const handleSelectWallet = (wallet) => {
  onSelectWallet && onSelectWallet(wallet);
  onClose && onClose();
};

watchEffect(() => {
  if (!isOpen) {
    // Reset or perform cleanup here if needed when modal is closed
  }
});
</script>
<template>
  <div v-if="isOpen" class="modal" @click="onClose">
    <div class="modal-content" @click.stop>
      <span class="close" @click="onClose">&times;</span>
      <h2>Choose Wallet</h2>
      <ul>
        <li
          v-for="wallet in WALLET_LIST"
          :key="wallet.key"
          @click="handleSelectWallet(wallet)"
        >
          {{ wallet.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
.modal {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.7); /* Màn hình mờ đậm hơn */
}

.modal-content {
  background-color: #333; /* Màu nền tối */
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.5); /* Bóng đổ nổi bật hơn */
  width: auto;
  min-width: 300px;
  max-width: 600px;
  color: #fff; /* Màu văn bản trắng */
}

.close {
  color: #bbb; /* Màu nút đóng nhạt hơn */
  float: right;
  font-size: 24px;
  cursor: pointer;
}

.close:hover {
  color: #fff; /* Màu khi hover nổi bật hơn */
}

h2 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #fff; /* Màu tiêu đề trắng */
  font-size: 24px;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

li {
  padding: 12px 16px;
  margin-bottom: 8px;
  background-color: #424242; /* Màu nền cho từng mục tối hơn */
  border-radius: 4px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s ease;
  color: #fff; /* Màu văn bản trắng */
}

li:hover {
  background-color: #505050; /* Màu khi hover nhạt hơn */
}

li:last-child {
  margin-bottom: 0;
}
</style>
