<template>
  <div>
    <main>
      <div class="hero">
        <AppConnectWallet />
      </div>
    </main>
  </div>
</template>

<style>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
body {
  background: #1f1f1f;
  color: white;
  font-family: Arial, Helvetica, sans-serif;
}
main {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.header {
  position: absolute;
  left: 0;
  right: 0;

  display: flex;
  justify-content: flex-end;
  padding: 1rem;
}

.logo {
  width: 20vw;
  margin-bottom: 2rem;
}
.hero {
  display: flex;
  gap: 1rem;
  flex-direction: column;
  align-items: center;
}

a {
  color: lightgreen;
}
</style>
