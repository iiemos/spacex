<script setup>
    import { useI18n } from 'vue-i18n'
    const { t } = useI18n()
</script>
<template>
    <div class="home">
      <Header />

        <section class="section-animate section-d">
          <div class="section-inner-center">
          <h3>{{ $t('Ecology') }}</h3>
          <div class="card_warp">
            <div class="card_item">
              <el-badge :value="t('NotOpenYet')" class="item">
                <img width="60px" src="@/assets/img/moon_small.png" alt="">
              </el-badge>
              {{ $t('EcologyDesc1') }}
            </div>
            <div class="card_item">
              <el-badge :value="t('NotOpenYet')" class="item">
                <img width="60px" src="@/assets/img/huoxing_small.png" alt="">
              </el-badge>
              {{ $t('EcologyDesc2') }}
            </div>
          </div>
        </div>
        </section>
      <Footer />
    </div>
  </template>
  
  <style lang="less">
  .card_warp{
    margin-top: 60px;
    display: flex;
    justify-content: space-around;
    padding: 0 20px;
    .card_item{
      display: flex;
      align-items: center;
      flex-direction: column;
    }
  }
  </style>
  