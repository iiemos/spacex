<template>
    <div class="home">
      <Header />

        <section class="section-animate section-c"></section>
        <div class="section-inner-center inner_warp">
            <h3>{{ $t('Introduction') }}</h3>
            <p>{{ $t('IntroductionDesc1') }}</p>
            <p>{{ $t('IntroductionDesc2') }}</p>
        </div>
      <Footer />
    </div>
  </template>
  
  <style>
  .inner_warp{
    position: relative;
    left: auto;
    top: auto;
    transform: none;
    width: 100%;
    margin-top: -70vh;
    margin-bottom: 100px;
    max-width: 100%;
    padding: 0 20px;
    text-align: left;
  }
  </style>
  