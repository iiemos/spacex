<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { useGlobalState } from "@/store";
import { useDebounceFn } from '@vueuse/core'
// import Web3 from 'web3'
import { useI18n } from 'vue-i18n'
import { ElMessage } from "element-plus";
import {
  Pointer,
} from '@element-plus/icons-vue'
import SpaceXABI from "@/abis/defiABI.json";
const { t } = useI18n()
const state = useGlobalState();
console.log("state", state);
let web3 = ref();
let myAddress = ref(""); //我的地址
let infoData = ref(""); //我的地址
let myETHBalance = ref(""); // EHT余额
let DeFiContract = ref(""); // 合约实例
let teamArray = ref([]); // 合约实例
const centerDialogVisible = ref(false)
let spaceCoinPrice = ref(""); // SpaceX实时价格
const gasPrice = ref(0) // 当前gas价格
const gasLimit = ref(0) // gas最高限制费用
const USDTtransFormSpaceXCoin = (val) => {
  return (Number(val) * spaceCoinPrice.value / 1000000000000000000).toFixed(3)
}

let refLinks = computed(()=>{ 
    if(myAddress.value){
      return window.location.origin + `/?invs=${myAddress.value}`
    }
    return 'Connect Wallet'
  })
let fromWeiFun = (val)=>{ 
  if(val == 0) return val
  return (val / 1000000000000000000)
}

onMounted(() => {
  // Web3浏览器检测
  if (typeof window.ethereum !== "undefined") {
    console.log("MetaMask is installed!");
    // console.log("当前连接网络的id:", window.ethereum.chainId);
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
  setInterval(() => {
    joinWeb3()
  }, 15000);
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
  let eth_chainId = await web3.value.eth.getChainId();
  console.log("eth_chainId", eth_chainId);
  DeFiContract.value = new web3.value.eth.Contract(
    SpaceXABI,
    state.contractAddress.value
  );
  console.log('DeFiContract',DeFiContract.value);
  // 请求用户授权 解决web3js无法直接唤起Meta Mask获取用户身份
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  // // 授权获取账户
  // 返回指定地址账户的余额
  let balance = await web3.value.eth.getBalance(accounts[0]);
  myAddress.value = accounts[0];
  console.log("balance", balance);
  // 账户余额
  try {
    myETHBalance.value = web3.value.utils.fromWei(balance, "ether");
    infoData.value = await DeFiContract.value.methods
      .getInfo(myAddress.value)
      .call();
    state.updateInfoData(infoData.value);
    state.userLevel.value = await DeFiContract.value.methods
      .getUserLevel(myAddress.value)
      .call();
    console.log("state.userLevel.value", state.userLevel.value);
    // userLevel
    console.log("state", state.infoData.value);


    // 获取LP实时价格 getPrice
    const SpaceXPrice = await DeFiContract.value.methods.getPrice(state.infoData.value.spaceCoin).call();
    spaceCoinPrice.value = web3.value.utils.fromWei(SpaceXPrice, "ether");
    console.log('实时价格为：' ,spaceCoinPrice.value);

    // 获取当前gas价格
    gasPrice.value = await web3.value.eth.getGasPrice();
    // 设置gas费用
    gasLimit.value = 5000000; // 设置gas限制
    const gasCost = gasLimit.value * gasPrice.value;
    console.log('计算后的gas价格', gasCost);

    // 获取直推地址列表
    if(state.infoData.value.teamLength>0){
      let teamData = await DeFiContract.value.methods
      .getTeamArry(myAddress.value,0,state.infoData.value.teamLength)
      .call();
      teamArray.value = teamData.filter(arrItem => arrItem != '0x0000000000000000000000000000000000000000');
    }
  } catch (e) {
    console.log(e);
  }
};

 
const receiveFunc = useDebounceFn((val) => {
  if(!myAddress.value || myAddress.value === '0x00000000000000000000000000000000deadbeef'){
    return joinWeb3()
  }
  if(myETHBalance.value * 1 < 0.001) return ElMessage.warning(t('gasError'));
  
  // 直接推荐
  if(val == 'award'){
    if(state.infoData.value.teamAward == '0') return ElMessage.warning(t('awardMsg'));
    getClaimTeam()
  }
  // 15代直推
  if(val == 'award2'){
    if(state.infoData.value.team2Award == '0') return ElMessage.warning(t('awardMsg'));
    getClaimTeam2()
  }
}, 500)
 
// 领取直推团队收益
const getClaimTeam = () => {
  try{
    DeFiContract.value.methods.claimTeam().send({
      from: myAddress.value,
      gas: gasLimit.value,
      gasPrice: gasPrice.value
    })
    .on('transactionHash', (hash)=>{
      console.log(hash);
      ElMessage.success(t('TransactionSend'))
    })
    .once('receipt', res => {
      ElMessage.success(t('TransactionConfirmed'))
      joinWeb3();
    })
    .then(res => {

    })
    .catch((error) => {
        console.error('failed:', error.code);
        if(error.code == '-32603' || error.message == 'transaction underpriced'){
          ElMessage.error(t('gasLow'));
        }
      });
  }catch(e){
    console.log(e);
  }
}

// 领取15代团队收益
const getClaimTeam2 = () => {
  try{
    DeFiContract.value.methods.claimTeam2().send({
      from: myAddress.value,
      gas: gasLimit.value,
      gasPrice: gasPrice.value
    })
    .on('transactionHash', (hash)=>{
      console.log(hash);
      ElMessage.success(t('TransactionSend'))
    })
    .once('receipt', res => {
      ElMessage.success(t('TransactionConfirmed'))
      joinWeb3();
    })
    .then(res => {

    })
    .catch((error) => {
        console.error('failed:', error.code);
        if(error.code == '-32603' || error.message == 'transaction underpriced'){
          ElMessage.error(t('gasLow'));
        }
      });
  }catch(e){
    console.log(e);
  }
}

const copyLink = () => {
  let _input = document.createElement('input')
    _input.value = refLinks.value;
    document.body.appendChild(_input)
    _input.select()
    document.execCommand('Copy')
    ElMessage.success(t('copyInvSuccess'))
    _input.remove()
};
</script>
<template>
  <div class="home">
    <Header />
    <section class="section-animate section-a"></section>
    <div class="section-inner-center team_inner">
      <div class="team_warp">
        <h2>{{ $t("myTeam") }}</h2>
        <table class="data additional-toggle" style="display: table">
          <tbody>
            <tr class="js-stagger" v-if="false">
              <td>{{ $t("NumberOfDirectReferrals") }}</td>
              <td>{{ state.infoData.value.teamLength }}</td>
            </tr>
            <tr class="js-stagger" v-if="false">
              <td>{{ $t("15NumberOfReferrals") }}</td>
							<td>{{ state.infoData.value.team2Length }}</td>
            </tr>
            <tr class="js-stagger">
              <td>{{ $t("TeamComputingPower") }}</td>
              <td>
                <count-to class="conut_to" :startVal='0' :endVal='fromWeiFun(state.infoData.value.teamCp)' :duration='1000' :decimals="5"/>
                <span class="td_span">/ ALL</span>
              </td>
            </tr>
            <tr class="js-stagger">
              <td>{{ $t("15ThTeamComputingPower") }}</td>
              <td>
                <count-to class="conut_to" :startVal='0' :endVal='fromWeiFun(state.infoData.value.teamCp2)' :duration='1000' :decimals="5"/>
              </td>
            </tr>
						<tr class="js-stagger" v-if="false">
              <td>{{ $t("RewardsReceived") }}</td>
              <td>
                {{ fromWeiFun(state.infoData.value.overTeam) }}</td>
            </tr>
						<tr class="js-stagger" v-if="false">
              <td>{{ $t("15RewardsReceived") }}</td>
              <td>{{ fromWeiFun(state.infoData.value.overTeam2) }}</td>
            </tr>
            <tr class="js-stagger">
              <td>{{ $t("ZTRewardsAvailable") }}</td>
              <td>
								<div class="receive_btn" @click="receiveFunc('award')">
                  <div class="receive_box">
                    <div>
                      <count-to class="conut_to" :startVal='0' :endVal='fromWeiFun(state.infoData.value.teamAward)' :duration='3000' :decimals="5"/>
                      <span> USDT</span>
                    </div>
                    <div class="transfrom_text">
                      <span>
                        ≈ {{ USDTtransFormSpaceXCoin(state.infoData.value.teamAward) }} SpaceX
                      </span>
                    </div>
                  </div>
									<el-icon style="margin-left: 4px;"><Pointer /></el-icon>
								</div>
							</td>
            </tr>
						<tr class="js-stagger">
              <td>{{ $t("15ZTRewardsAvailable") }}</td>
              <td>
                <div class="receive_btn" @click="receiveFunc('award2')">
                  <div class="receive_box">
                    <div>
                      <count-to class="conut_to" :startVal='0' :endVal='fromWeiFun(state.infoData.value.team2Award)' :duration='3000' :decimals="5"/>
                      <span> USDT</span>
                    </div>
                    <div class="transfrom_text">
                      <span>
                        ≈ {{ USDTtransFormSpaceXCoin(state.infoData.value.team2Award) }} SpaceX
                      </span>
                    </div>
                   </div>
									<el-icon style="margin-left: 4px;"><Pointer /></el-icon>
								</div>
              </td>
            </tr>
            <tr class="js-stagger">
              <td>{{ $t("SuperiorAddress") }}</td>
              <td v-if="state.infoData.value.inivet == '0x0000000000000000000000000000000000000000'">--</td>
              <td style="text-align: right" v-else>
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  :content="state.infoData.value.inivet"
                  placement="top-end"
                >
                  <span class="address_txt">{{ state.infoData.value.inivet }}</span>
                </el-tooltip>
              </td>
            </tr>
            <tr class="js-stagger">
              <td>{{ $t("MyInvitationLink") }}</td>
              <td style="text-align: right">
                <span class="address_txt"
                  >{{ myAddress }}</span
                >
              </td>
            </tr>
          </tbody>
        </table>
        <div class="ref_wrapper" v-if="teamArray.length > 0" @click="centerDialogVisible = true">
          <span class="text">{{ $t("ViewInvitationAddress") }}</span>
        </div>
        <div class="ref_wrapper" @click="copyLink()" v-if="myAddress">
          <span class="text">{{ $t("CopyInvitationLink") }}</span>
        </div>
        <div class="ref_wrapper" @click="connections()" v-if="!myAddress">
          <span class="text">{{ $t("ConnectWallet") }}</span>
        </div>
      </div>
    </div>
    <el-dialog
      v-model="centerDialogVisible"
      :title="t('invitationList')"
      width="90%"
      align-center
    >
      <div class="inv_list">
        <div class="inv_item" v-for="invitem in teamArray" :key="invitem">
          {{ invitem }}
        </div>
      </div>
    </el-dialog>
    <Footer />
  </div>
</template>

<style scoped lang="less">
.inv_list{
  max-height: 60vh;
  overflow-y: scroll;
  font-size: 12px;
  .inv_item{
    padding: 10px 0;
    border-bottom: 1px solid rgba(0, 0, 0, .2);
  }
}
.team_inner{
	position: relative;
	left: auto;
	top: auto;
	transform: none;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	margin-top: -80vh;
	margin-bottom: 100px;
  max-width: 100%;
  padding: 0 20px;
}
.ref_wrapper {
  margin-top: 20px;
  cursor: pointer;
  text-align: center;
  padding: 10px 15px;
  border: 1px solid #fff;
}
.team_warp {
  h2 {
    text-align: left;
  }
}
.receive_btn{
	display: flex;
	align-items: center;
	justify-content: end;
	font: 600 16px/18px D-DIN-Regular, Arial, Verdana, sans-serif;
}
.receive_box{
  .transfrom_text{
    color: #868686;
  }
}
.ref_wrapper {
}
.address_txt {
  color: #fff !important;
  display: inline-block;
  max-width: 200px;
  text-align: right;
  cursor: text;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
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
table.data td .td_span {
  color: #868686;
}
.conut_to{
  color: #fff !important;
  font: 600 16px/18px D-DIN-Regular, Arial, Verdana, sans-serif;
}
</style>
