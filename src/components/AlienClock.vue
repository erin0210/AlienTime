<template>
  <div id="app">
    <div class="card-container">
      <div class="card">
        <h1><img src="../assets/earth.png" alt="Earth Icon" style="height: 1em; vertical-align: middle;"> Earth
          Clock
          <img src="../assets/earth.png" alt="Earth Icon" style="height: 1em; vertical-align: middle;">
        </h1><br>
        <div class="clock">
          <p>{{ earthCurrentDate }}<br>{{ earthCurrentTime }}</p>
        </div>
        <div class="alarm">
          <div class="input-container">
            <div class="input-group">
              <label class="alarm-label" for="changeEarthDate">Set Date: </label>
              <input :disabled="alienAlarmDate.length > 0" type="date" v-model="earthAlarmDate" id="changeEarthDate"
                @input="onChangeEarthDate" style="margin-right: 10px;">
            </div>
            <div class="input-group">
              <label for="updateEarthTime">Set Time:</label>
              <input :disabled="earthAlarmDate.length === 0" type="time" v-model="alienAlarmTime" id="changeEarthTime"
                @input="onChangeEarthTime" style="margin-right: 10px;">
            </div>
          </div>
          <button @click="setAlarm">Set Alarm</button>
        </div>
        <p v-if="earthAlarmMessage">{{ earthAlarmMessage }}</p>
        <audio ref="alarmSound" src="./sounds/alarm.mp3"></audio>
        <div v-if="showModal" class="modal">
          <div class="modal-content">
            <span class="close" @click="stopAlarm">&times;</span>
            <p>⏰ Alarm ringing!</p>
            <button @click="stopAlarm" class="stop-button">Stop</button>
          </div>
        </div>
      </div>
      <div class="card">
        <h1><img src="../assets/venus.png" alt="Earth Icon" style="height: 1em; vertical-align: middle;"> Alien Clock
          <img src="../assets/venus.png" alt="Earth Icon" style="height: 1em; vertical-align: middle;">
        </h1>
        <br>
        <div class="clock">
          <p>{{ currentAlienDate }}</p>
          <p>{{ currentAlienTime }}</p>
        </div>
        <div class="alarm">
          <div class="input-container">
            <div class="input-group">
              <label for="changeAlienDate">Set Date: </label>
              <input :disabled="earthAlarmDate.length > 0" type="date" v-model="alienAlarmDate" id="changeAlienDate"
                @input="onChangeAlienDate" style="margin-right: 10px;">
            </div>
            <div class="input-group">
              <label for="changeAlienTime">Set Time:</label>
              <input :disabled="alienAlarmDate.length === 0" type="time" v-model="alienAlarmTime" id="changeAlienTime"
                @input="onChangeAlientTime" style="margin-right: 10px;">
            </div>
          </div>
          <button disabled @click="setAlarm">Set Alarm</button>
        </div>
        <p v-if="alarmAlienMessage">{{ alarmAlienMessage }}</p>
        <audio ref="alarmAlienSound" src="./sounds/alarm.mp3"></audio>

        <div v-if="showAlienModal" class="modal">
          <div class="modal-content">
            <span class="close" @click="stopAlarm">&times;</span>
            <p>⏰ Alarm ringing!</p>
            <button @click="stopAlarm" class="stop-button">Stop</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="resetBtnContainer" @click="onReset">
    <button>
      Reset
    </button>
  </div>

</template>

<script lang="ts">

import { convertEarthToAlienTime, formatAlienTime } from '@/utility/alienTimeUtils';
import { formatInputTextEarthDate, isValidDateEarthTimeFormat } from '@/utility/earthTimeUtility';
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      // earth
      currentTime: '',
      currentDate: '',

      // alien
      currentAlienTime: '',
      currentAlienDate: '',

      // alarm
      earthAlarmTime: '',
      earthAlarmDate: '',
      earthAlarmMessage: '',

      alienAlarmTime: '',
      alienAlarmDate: '',
      alarmAlienMessage: '',

      // modal
      showModal: false,
      showAlienModal: false,

      // state
      isReset: false,
    };
  },
  created() {
    // alien time 2 times slower than earth time, update based on alien 1 second
    const interval = 2000 // 2 * 1 second
    setInterval(() => {
      this.updateTime();
    }, interval);
  },
  computed: {
    earthCurrentTime() {
      return this.earthAlarmTime || this.currentTime;
    },
    earthCurrentDate() {
      return formatInputTextEarthDate(this.earthAlarmDate) || this.currentDate;
    },
  },
  methods: {
    onReset() {
      this.isReset = !this.isReset;
    },
    updateTime() {
      const now = new Date();
      const alienTime = convertEarthToAlienTime(now);
      const { date: alienFormatDate, time: alientFormatTime } = formatAlienTime(alienTime);
      this.currentAlienTime = alientFormatTime;
      this.currentAlienDate = alienFormatDate;
      this.currentTime = now.toLocaleTimeString('en-MY', {
        hour12: false,
      })
      this.currentDate = now.toLocaleDateString('en-MY')
    },
    onChangeEarthTime(event: Event) {
      const input = event.target as HTMLInputElement;
      this.earthAlarmTime = input.value;
    },
    onChangeEarthDate(event: Event) {
      const input = event.target as HTMLInputElement;
      this.earthAlarmDate = input.value;
    },
    onChangeAlientTime(event: Event) {
      const input = event.target as HTMLInputElement;
      this.alienAlarmTime = input.value;
    },
    onChangeAlienDate(event: Event) {
      const input = event.target as HTMLInputElement;
      this.alienAlarmDate = input.value;
    },
    setAlarm() {
      // if (checkAlienAlarm(this.alarmSet, this.alienAlarmTime, this.alienTime)) {
      //   (this.$refs.alarmAlienSound as HTMLAudioElement).play();
      //   this.showAlienModal = true;
      //   this.alienAlarmTime = ''; // Reset alarm
      //   this.alarmAlienMessage = '';
      //   this.alarmAlienSet = false;
      // }
    },
    stopAlarm() {
      (this.$refs.alarmSound as HTMLAudioElement).pause();
      (this.$refs.alarmSound as HTMLAudioElement).currentTime = 0;
      this.showModal = false;
    },
    validateEarthInput() {

    },
    validateAlienInput() {

    },
  },
});

</script>
