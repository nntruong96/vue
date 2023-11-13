<script setup lang="ts">
import { getAddresses, walletStrategy } from '@/app/services/wallet';
import { prepareSignAndBroadcastKeplr } from '@/utils/Keplr';
import ModalSelectWallet from './ModalSelectWallet.vue';
import { onMounted } from 'vue';
import { setStore, getStore } from '@/utils';
import { getInjectiveAddress } from '@injectivelabs/sdk-ts';
import { Wallet } from '@injectivelabs/wallet-ts';
// import { prepareSignAndBroadcastMetaMask } from '@/utils/MetaMask';
const address = ref('');
const isOpenModal = ref(false);
const txHash = ref('');
const requesting = ref(false);
const error = ref('');
const walletSelect = ref(getStore(Constants.STORAGE.wallet));
onMounted(async () => {
  await handleConnectWallet();
});

const prepare = async () => {
  requesting.value = true;
  error.value = '';
  let res;
  try {
    if (walletSelect.value === Wallet.Metamask) {
      res = await prepareSignAndBroadcastMetaMask(address.value);
    } else {
      res = await prepareSignAndBroadcastKeplr(address.value);
    }
    if (!res) {
      throw 'Some thing when wrong';
    }
    console.log(res);
    txHash.value = res?.txHash || '';
  } catch (e: any) {
    error.value = e?.message || e;
  }
  requesting.value = false;
};
async function handleConnectWallet() {
  if (!address.value && walletSelect.value) {
    walletStrategy.setWallet(walletSelect.value);
    let _address = await getAddresses();
    if (walletSelect.value === Wallet.Metamask) {
      address.value = getInjectiveAddress(_address[0]);
    } else {
      address.value = _address[0];
    }
  }
}
const disconnect = async () => {
  await walletStrategy.disconnectWallet();
  walletSelect.value = '';
  setStore(Constants.STORAGE.wallet, '');
  address.value = '';
};
const handleSelectWallet = async (wallet: { key: string }) => {
  walletSelect.value = wallet.key;
  setStore(Constants.STORAGE.wallet, wallet.key);
  handleConnectWallet();
};
const onClose = () => {
  isOpenModal.value = false;
};
const handleOpenModal = () => {
  if (address.value) {
    return;
  }
  isOpenModal.value = true;
};
</script>

<template>
  <div class="flex">
    <AppButton @click="handleOpenModal">{{
      address
        ? `${walletSelect}: ${address.slice(0, 6)}...${address.slice(-8)}`
        : 'Connect Wallet'
    }}</AppButton>
    <AppButtonSecondary
      v-if="address"
      @click="disconnect"
      class="button-disconnect"
      >Disconnect</AppButtonSecondary
    >
    <br />
    <br />
    <AppButtonSecondary v-if="address" @click="prepare" :disabled="requesting"
      >Prepare Sign and Broadcast</AppButtonSecondary
    >
    <br />
    <p>{{ txHash }}</p>
    <br />
    <br />
    <p v-if="Boolean(error)">Error: {{ error }}</p>

    <br />
    <br />

    <ModalSelectWallet
      :isOpen="isOpenModal"
      :onClose="onClose"
      :onSelectWallet="handleSelectWallet"
    />
  </div>
</template>

<style scoped>
.button-disconnect {
  margin-left: 12px;
}
</style>
