<script setup>
</script>

<template>
  <div>
    <div style="text-align: center;">  
        <br>
        <br>
        <br>
        <br>
        
        <div class="maintenance"></div>
        
        <br>
        <br>
        <span>System upgrading</span>
    </div>

  </div>
</template>

<style scoped lang="less">

body {
  background-color: #000;
}
span {
  font-size: 55px;
  color: #fff;
}
.maintenance {
  display: inline-block;
  width: 400px;
  height: 200px;
  position: relative;
  overflow: hidden;
  border: 0px solid red;
  border-bottom: 5px solid #fff;
  
  &:before {
    content: '';
    position: absolute;
    height: 160%;
    top: 20%;
    left: 10%;
    width: 80%;
    background-image: url("https://pasqualevitiello.github.io/Tumblr-Style-Cog-Spinners/cogs/cog20.svg");
    background-size: cover;
    animation: spin 7s infinite linear;
    opacity: 1.0;
  }
}

@-moz-keyframes spin {
    from { -moz-transform: rotate(0deg); }
    to { -moz-transform: rotate(360deg); }
}
@-webkit-keyframes spin {
    from { -webkit-transform: rotate(0deg); }
    to { -webkit-transform: rotate(360deg); }
}
@keyframes spin {
    from {transform:rotate(0deg);}
    to {transform:rotate(360deg);}
}
</style>
