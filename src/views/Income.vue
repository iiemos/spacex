<script setup>
import { ref, onMounted } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { useGlobalState } from "@/store";
import { useDebounceFn } from '@vueuse/core'
import SpaceXABI from "@/abis/defiABI.json";
import usdtABI from "@/abis/usdtABI.json";
// import Web3 from 'web3'
import { ElMessage } from "element-plus";
const state = useGlobalState();
console.log("state", state);
let web3 = ref();
let myAddress = ref(""); //我的地址
let infoData = ref(""); //我的地址
let DeFiContract = ref(""); // 合约实例
let myETHBalance = ref(""); // ETH余额 
let usdtContract = ref(""); // usdt合约实例
let myUSDTBalance = ref(""); // USDT余额
let SpaceXContract = ref(""); // SpaceX合约实例
let mySpaceXBalance = ref(""); // SpaceX余额

let fromWeiFun = (val)=>{ 
  if(val == 0) return val
  return (val / 1000000000000000000).toFixed(6)
}

onMounted(() => {
  // Web3浏览器检测
  if (typeof window.ethereum !== "undefined") {
    console.log("MetaMask is installed!");
    console.log("当前连接网络的id:", window.ethereum.chainId);
  }

  web3.value = new Web3(window.ethereum);
  // 连接钱包账户切换后触发的事件
  ethereum.on("accountsChanged", function (accounts) {
    console.log("连接钱包账户切换后触发的事件", accounts[0]); //一旦切换账号这里就会执行
    myAddress.value = accounts[0];
    joinWeb3();
  });
  // 正确处理链更改之后的业务流程可能很复杂。官方建议链更改只有重新加载页面
  ethereum.on("chainChanged", (chainId) => {
    console.log("chainId", chainId);
    window.location.reload();
  });
  // 断开连接监听事件
  ethereum.on("disconnect", async function (result, error) {
    console.log("断开连接", result);
    console.log("error", error);
  });
  connections();
});

const connections = () => {
  //链接小狐狸钱包
  window.ethereum
    .request({ method: "eth_requestAccounts" })
    .then((res) => {
      console.log(res, "当前钱包地址");
      myAddress.value = res[0];
      joinWeb3();
    })
    .catch((err) => {
      console.log(err);
      if (err.code == 4001) {
        console.log("用户拒绝连接");
      }
    });
};
const joinWeb3 = async () => {
  let eth_chainId = web3.value.eth.getChainId();
    console.log("eth_chainId", eth_chainId);
    let accounts = await web3.value.eth.getAccounts();
    console.log("查询eth_chainId", eth_chainId);
    // 请求用户授权 解决web3js无法直接唤起Meta Mask获取用户身份
    const enable = await ethereum.enable();
    console.log("enable", enable[0]);
    // // 授权获取账户
    // 返回指定地址账户的余额
    let balance = await web3.value.eth.getBalance(enable[0]);
    myAddress.value = accounts[0];
    console.log("balance", balance);
    try {
      // 创建合约实例
      DeFiContract.value = new web3.value.eth.Contract(SpaceXABI,state.contractAddress.value);
      console.log('DeFiContract.value ',DeFiContract.value );
      // 获取合约中返回的信息
      infoData.value = await DeFiContract.value.methods.getInfo(myAddress.value).call();
      // 设置info值
      state.updateInfoData(infoData.value);
      console.log('infoData.value',infoData.value);
      // 创建usdt合约实例
      usdtContract.value = new web3.value.eth.Contract(usdtABI, state.infoData.value.usdtCoin);
      console.log('usdtContract.value',usdtContract.value);
      // 获取钱包eth余额
      myETHBalance.value = web3.value.utils.fromWei(balance, "ether");
      console.log('myETHBalance',myETHBalance.value);
      // 获取usdt余额
      let usdtBalance = await usdtContract.value.methods.balanceOf(myAddress.value).call();
      myUSDTBalance.value = web3.value.utils.fromWei(usdtBalance, "ether");
      console.log('usdtBalance',myUSDTBalance.value);
      // 创建spacex合约实例
      SpaceXContract.value = new web3.value.eth.Contract(usdtABI, state.infoData.value.spaceCoin);
      console.log('usdtContract.value',SpaceXContract.value);
      // 获取spacex余额
      let SpaceXBalance = await SpaceXContract.value.methods.balanceOf(myAddress.value).call();
      mySpaceXBalance.value = web3.value.utils.fromWei(SpaceXBalance, "ether");
      console.log('mySpaceXBalance',mySpaceXBalance.value);
      // 获取当前质押等级
      state.userLevel.value = await DeFiContract.value.methods.getUserLevel(myAddress.value).call();
      console.log("state.userLevel.value", state.userLevel.value);
    } catch (e) {
      console.log(e);
    }
};
// 提现
const withdraw = useDebounceFn( async() => {
  if(!myAddress.value || myAddress.value === '0x00000000000000000000000000000000deadbeef'){
    return joinWeb3()
  }
  if(myETHBalance.value * 1 < 0.001) return ElMessage.warning('Insufficient Gas');
  if(state.infoData.value.userAward == '0') return ElMessage.warning('当前奖励为0，请确认后再进行操作！');
  try{
    DeFiContract.value.methods.claim().send({from: myAddress.value})
    .on('transactionHash', (hash)=>{
      console.log('hash',hash);
      ElMessage.success('Transaction sent')
      console.log("Transaction sent");
    })
    .once('receipt', res => {
      ElMessage.success('Transaction confirmed')
      console.log("Transaction confirmed");
      joinWeb3();
    })
    .catch(err => console.log(err))
  }catch(e){
    console.log(e);
  }
})
// 复投
const compound = useDebounceFn( async() => {
  if(!myAddress.value || myAddress.value === '0x00000000000000000000000000000000deadbeef'){
    return joinWeb3()
  }
  if(myETHBalance.value * 1 < 0.001) return ElMessage.warning('Insufficient Gas');
  if(state.infoData.value.userAward == '0') return ElMessage.warning('当前奖励为0，请确认后再进行操作！');
  try{
    // DeFiContract.value.methods.claim().send({from: myAddress.value})
    // .on('transactionHash', (hash)=>{
    //   console.log(hash);
    //   ElMessage.success('Transaction sent')
    //   console.log("Transaction sent");
    // })
    // .once('receipt', res => {
    //   ElMessage.success('Transaction confirmed')
    //   console.log("Transaction confirmed");
    //   joinWeb3();
    // })
    // .catch(err => console.log(err))
  }catch(e){
    console.log(e);
  }
})
</script>
<template>
  <div class="income">
    <Header />
    <section class="section-animate bg-falcon-9"></section>
    <div class="section-inner-center">
      <h3>{{ $t("WalletBalance") }}</h3>
      <p>{{ $t("SpacexTokenIncomeStatus") }}</p>
    </div>
    <div id="slider" role="region" aria-label="Falcon 9 information carousel" tabindex="0"
      class="slider quickjump section swiper-container swiper-initialized swiper-horizontal swiper-backface-hidden"
      data-vehicle="">
      <div class="swiper-slide swiper-slide-active" role="group" aria-label="1 / 5" style="width: 100%">
        <div class="background gallery-background gallery-full overflow-visible">
          <span class="reveal-bg" role="img"
            aria-label="A rendering of a fully stacked Falcon 9 booster with second stage and payload fairings"
            data-desktop="../../static/images/falcon-9/desktop/WebsiteF9Fairings_Render_Desktop.jpg"
            data-mobile="../../static/images/falcon-9/mobile/WebsiteF9Fairings_Render_Mobile.jpg" style="
              background-image: url('https://www.spacex.com/static/images/falcon-9/desktop/WebsiteF9Fairings_Render_Desktop.jpg');
            ">
          </span>
          <div class="reveal-container">
            <div class="reveal-overflow u-fullParent">
              <span class="reveal-render u-fullParent" role="img"
                aria-label="A rendering of fully stacked Falcon 9 booster with second stage and payload fairings"
                data-desktop="../../static/images/falcon-9/desktop/WebsiteF9Fairings_Render_Desktop.jpg"
                data-mobile="../../static/images/falcon-9/mobile/WebsiteF9Fairings_Render_Mobile.jpg" style="
                  background-image: url('https://www.spacex.com/static/images/falcon-9/desktop/WebsiteF9Fairings_Render_Desktop.jpg');
                ">
                <div class="vsc-controller"></div>
                <video id="reveal-video" role="img" aria-hidden="true" aria-describedby="f9-video-description"
                  aria-labelledby="f9-video-description" autoplay="" loop="" muted="" width="100%" height="100%"
                  preload="auto" autobuffer="true">
                  <source type="video/mp4" src="@/assets/media/WebsiteF9Fairings_Anim_Render_Desktop.mp4" />
                  <p id="f9-video-description">
                    A rendering of a fully stacked Falcon 9 booster spinning
                    around its vertical axis
                  </p>
                </video>
              </span>
              <span id="reveal-lines" class="reveal-lines u-fullParent" role="img"
                aria-label="A wireframe rendering of a Falcon 9 booster with second stage and payload fairings"
                data-desktop="../../static/images/falcon-9/desktop/WebsiteF9Fairings_Lines_Desktop.jpg"
                data-mobile="../../static/images/falcon-9/mobile/WebsiteF9Fairings_Lines_Mobile.jpg" style="
                  background-image: url('https://www.spacex.com/static/images/falcon-9/desktop/WebsiteF9Fairings_Lines_Desktop.jpg');
                  opacity: 0;
                ">
                <div class="vsc-controller"></div>
                <video role="img" aria-hidden="true" loop="" muted="" width="100%" height="100%" preload="auto"
                  autobuffer="true">
                  <source type="video/mp4" src="@/assets/media/WebsiteF9Fairings_Anim_Lines_Desktop.mp4" />
                </video>
              </span>
            </div>
          </div>
        </div>
        <div class="section-inner">
          <div id="reveal-overview" class="inner-left-middle" style="">
            <p class="over-header js-bounding" style="margin: 0px; font-family: D-DIN-Bold">
              {{ $t("income") }}
            </p>
            <h2 class="js-stagger" style="font-family: D-DIN-Bold">{{ $t("Overview") }}</h2>
            <table class="data additional-toggle" style="display: table">
              <tbody>
                <tr class="js-stagger">
                  <td>{{ $t("WalletBalance") }}</td>
                  <td>{{ myUSDTBalance }} <span>USDT /</span> {{ mySpaceXBalance }} <span>SpaceX</span></td>
                </tr>
                <tr class="js-stagger">
                  <td>{{ $t("MyComputingPower") }}</td>
                  <td>{{ state.infoData.value.userCp }} <span> / v{{ state.userLevel.value }}</span></td>
                </tr>
                <tr class="js-stagger">
                  <td>{{ $t("AllComputingPower") }}</td>
                  <td>{{ state.infoData.value.allStakeCp }} <span>/ ALL</span></td>
                </tr>
                <tr class="js-stagger">
                  <td>{{ $t("ReceivedRewards") }}</td>
                  <td>{{ state.infoData.value.overAward }} <span>USDT</span></td>
                </tr>
                <tr class="js-stagger">
                  <td>{{ $t("RewardsAvailable") }}</td>
                  <td>{{ state.infoData.value.userAward }} <span>USDT</span></td>
                </tr>
              </tbody>
            </table>
            <div class="action_btns">
              <!-- <span>{{ $t("Reinvest") }}</span> -->
              <span @click="withdraw()">{{ $t("withdraw") }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="collapse">
      <div class="section-inner resize" style="">
        <div class="inner-left-top">
          <p class="bold-over-header animate">{{ $t("revenue") }}</p>
          <h2 class="animate">{{ $t("mechanism") }}</h2>
          <div class="content-tabs animate" role="tablist"></div>
          <div class="content-tab-data" data-tab-bg="vacuum" role="tabpanel" id="vacuum-tab-panel"
            aria-labelledby="vacuum-tab">
            <p class="animate p_item">
              <strong> {{ $t("StaticIncome") }}</strong>
              <span style="font-weight: 300">
                {{ $t("StaticIncomeTxt") }}
              </span>
            </p>
            <p class="animate p_item">
              <strong>{{ $t("DirectPromotionIncome") }} </strong>
              <span style="font-weight: 300">
                {{ $t("DirectPromotionIncomeTxt") }}
              </span>
            </p>
            <p class="animate p_item">
              <strong> {{ $t("TeamIncome") }}</strong>
              <span style="font-weight: 300">
                {{ $t("TeamIncomeTxt") }}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="collapse">
      <div class="section-inner resize" style="">
        <div class="inner-left-top">
          <p class="bold-over-header animate">{{ $t("Mining") }}</p>
          <h2 class="animate">{{ $t("power") }}</h2>
          <div class="content-tabs animate" role="tablist"></div>
          <table class="data animate">
            <tbody>
              <tr>
                <td>{{ $t("level") }}</td>
                <td>{{ $t("power") }}</td>
                <td>{{ $t("Weights") }}</td>
              </tr>
              <tr>
                <td>V1</td>
                <td>1-5000</td>
                <td>0.5</td>
              </tr>
              <tr>
                <td>V2</td>
                <td>5001-12500</td>
                <td>1</td>
              </tr>
              <tr>
                <td>V3</td>
                <td>12501-25000</td>
                <td>1.2</td>
              </tr>
              <tr>
                <td>V2</td>
                <td>>= 25001</td>
                <td>1.5</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style lang="less" scoped>
.p_item {
  padding: 20px 0;
  border-bottom: 1pt solid rgba(255, 255, 255, 0.3);
}

// @import '@/assets/css/style.min.css';
.inner-left-middle,
.inner-right-middle {
  top: 50%;
  -webkit-transform: translate(0, -50%);
  transform: translate(0, -50%);
  position: absolute;
}

.inner-left-bottom,
.inner-left-middle,
.inner-left-top,
.inner-right-bottom,
.inner-right-middle,
.inner-right-top,
.outer-right-top {
  text-align: left;
  width: 50%;
  max-width: 520px;
}

.reveal-inner {
  z-index: 3;
}

@media (max-width: 600px) {
  .section-inner {
    bottom: 40px;
    left: 0;
  }
}

#wrapper,
.background,
.section,
.section-inner {
  display: block;
  width: 100%;
}

.section-inner {
  position: relative;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

#slider {
  overflow: hidden;
}

#reveal .section-inner {
  height: 100%;
}

@media screen and (max-width: 960px) {
  #reveal .inner-left-middle {
    width: 70%;
    right: 0;
    left: 0;
    margin: auto;
    top: 300px;
  }
}

.background {
  position: absolute;
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #000;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
}

.overflow-visible {
  overflow: visible !important;
}

.gallery-background,
.swiper-slide {
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
}

.gallery-background {
  display: block;
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  height: auto;
  bottom: 100px;
}

.background {
  background-position: center bottom;
  height: 100vh;
}

.slider .gallery-background {
  position: relative;
  height: 500px;
  top: auto;
  right: auto;
  left: auto;
  bottom: auto;
}

.section-inner {
  position: relative;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.slider .section-inner {
  height: auto !important;
}

@media screen and (max-width: 960px) {
  .slider .section-inner>div {
    position: relative;
    top: 0;
    left: auto;
    right: auto;
    -webkit-transform: none;
    transform: none;
    padding: 40px 20px;
    width: 100%;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
}

#controls,
#reveal-overview,
.swiper-pagination-bullet {
  -webkit-transition: opacity 0.2s linear;
  transition: opacity 0.2s linear;
}

#reveal-overview {
  max-width: 100%;
}

a.btn,
p:first-of-type {
  margin-top: 15px;
  font-family: D-DIN-Bold;
}

#feature .inner-center {
  -webkit-transform: translate(-50%, -50%) translateY(-30px);
  transform: translate(-50%, -50%) translateY(-30px);
}

table {
  width: 100%;
  margin-top: 30px;
}

table td {
  font: 600 16px/18px D-DIN-Regular, Arial, Verdana, sans-serif;
  text-align: left;
  color: #fff;
  padding: 20px 0;
  border-bottom: 1pt solid rgba(255, 255, 255, 0.3);
}

table.data td {
  text-align: right;
}

table.data td:first-child {
  font: 14px/18px D-DIN-Bold, Arial, Verdana, sans-serif;
  text-align: left;
}

table.data td {
  text-align: right;
}

table.data td span {
  color: #868686;
}

@media screen and (max-width: 600px) {
  .section-inner h2 {
    font-size: 40px;
    line-height: normal;
  }

  .inner-left-bottom,
  .inner-left-top,
  .inner-right-bottom,
  .inner-right-top {
    width: auto;
    max-width: none;
    right: 20px;
    left: 20px;
  }

  .collapse .inner-left-bottom,
  .collapse .inner-left-middle,
  .collapse .inner-left-top,
  .collapse .inner-right-bottom,
  .collapse .inner-right-middle,
  .collapse .inner-right-top {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    bottom: auto;
    -webkit-transform: none;
    transform: none;
    padding: 40px 20px;
    width: auto;
    font-family: "D-DIN-Regular";
  }
}
</style>
