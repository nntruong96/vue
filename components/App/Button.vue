<template>
  <button>
    <div><slot /></div>
  </button>
</template>

<style scoped>
button {
  font-size: 1rem;
  cursor: pointer;
  transform: skewX(-30deg);
  border: none;
  color: white;
  border-left: 2px solid lightgreen;
  border-right: 2px solid lightgreen;
  padding: 0.5rem 1rem;
  background: none;
  transition: all 0.3s;
}
button:hover {
  background-color: lightgreen;
  color: black;
}

button div {
  transform: skewX(30deg);
}
</style>
