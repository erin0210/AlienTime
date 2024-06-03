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
              <input :disabled="alienAlarmTime.length > 0" type="date" v-model="earthAlarmDate" id="changeEarthDate"
                @input="onChangeEarthDate" style="margin-right: 10px;">
            </div>
            <div class="input-group">
              <label for="updateEarthTime">Set Time:</label>
              <input :disabled="earthAlarmDate.length === 0" type="time" v-model="earthAlarmTime" id="changeEarthTime"
                @input="onChangeEarthTime" style="margin-right: 10px;">
            </div>
          </div>
          <button :disabled="alienAlarmTime.length !== 0 || earthAlarmTime.length !== 0" @click="setAlarm">Set
            Alarm</button>
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
          <p>{{ alienCurrentDate }}</p>
          <p>{{ alienCurrentTime }}</p>
        </div>
        <div class="alarm">
          <div class="input-container">
            <div class="input-group">
              <label for="changeAlienDate">Set Date: </label>
              <input :disabled="earthAlarmTime.length > 0" type="date" v-model="alienAlarmDate" id="changeAlienDate"
                @input="onChangeAlienDate" style="margin-right: 10px;">
            </div>
            <div class="input-group">
              <label for="updateAlienTime">Set Time:</label>
              <input :disabled="alienAlarmDate.length === 0" type="time" v-model="alienAlarmTime" id="changeAlienTime"
                @input="onChangeAlienTime" style="margin-right: 10px;">
            </div>
          </div>
          <button :disabled="earthAlarmTime.length !== 0 || alienAlarmTime.length !== 0" @click="setAlarm">Set
            Alarm</button>
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

  <div class="actionButtonContainer">
    <button @click="onReset">
      Reset
    </button>

    <button @click="onReferenceTime">
      Reference Time
    </button>
  </div>

</template>

<script lang="ts">

import { convertEarthToAlienTime, formatAlienTime } from '@/utility/alienTimeUtils';
import { convertAlienToEarth, formatInputTextEarthDate, isValidDateEarthTimeFormat } from '@/utility/earthTimeUtility';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { defineComponent } from 'vue';

dayjs.extend(utc);

export default defineComponent({
  data() {
    return {
      // earth
      currentTime: '',
      currentDate: '',
      newEarthDate: '',
      newEarthTime: '',

      // alien
      currentAlienTime: '',
      currentAlienDate: '',
      newAlienDate: '',
      newAlienTime: '',

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

      //id
      intervalId: 0,

      // misc
      isUsingReferenceTime: false,

    };
  },
  created() {
    // alien time 2 times slower than earth time, update based on alien 1 second
    const interval = 2000 // 2 * 1 second
    this.intervalId = setInterval(() => {
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
    alienCurrentTime() {
      return this.alienAlarmTime || this.currentAlienTime;
    },
    alienCurrentDate() {
      return formatInputTextEarthDate(this.alienAlarmDate) || this.currentAlienDate;
    },
  },
  methods: {
    onReferenceTime() {
      this.isUsingReferenceTime = !this.isUsingReferenceTime;
    },
    onReset() {
      location.reload()
    },
    updateTime() {
      const now = this.isUsingReferenceTime ? new Date('1970-01-01T00:00:00Z') : new Date()
      const alienTime = convertEarthToAlienTime(now);
      const { date: alienFormatDate, time: alientFormatTime } = formatAlienTime(alienTime);
      this.currentAlienTime = alientFormatTime;
      this.currentAlienDate = alienFormatDate;
      this.currentTime = dayjs.utc(now.toUTCString()).format('HH:mm:ss');
      this.currentDate = dayjs(now.toUTCString()).format('DD/MM/YYYY');
    },
    onChangeEarthTime(event: Event) {
      const input = event.target as HTMLInputElement;
      this.earthAlarmTime = `${input.value}:00`;
      this.newEarthTime = input.value;
    },
    onChangeEarthDate(event: Event) {
      const input = event.target as HTMLInputElement;
      this.earthAlarmDate = input.value;
      this.newEarthDate = input.value;
    },
    onChangeAlienTime(event: Event) {
      const input = event.target as HTMLInputElement;
      this.alienAlarmTime = `${input.value}:00`;
      this.newAlienTime = input.value;
    },
    onChangeAlienDate(event: Event) {
      const input = event.target as HTMLInputElement;
      this.alienAlarmDate = input.value;
      this.newAlienDate = input.value;
    },
    updateAlienDate() {
      if (this.newEarthDate && this.newEarthTime) {
        const newEarthDateTime = new Date(`${this.newEarthDate}T${this.newEarthTime}`);
        const alienDate = convertEarthToAlienTime(newEarthDateTime);
        const formattedAlienTime = formatAlienTime(alienDate);

        this.currentAlienDate = formattedAlienTime.date;

        this.currentAlienTime = formattedAlienTime.time;

        // Stop the interval
        clearInterval(this.intervalId);
      }
    },
    updateEarthDate() {
      if (this.newAlienDate && this.newAlienTime) {
        const newAlienDateTime = `${this.newAlienDate.split('-').reverse().join('/')}\n${this.newAlienTime}:00`;
        const earthDate = convertAlienToEarth(newAlienDateTime);

        this.currentDate = formatInputTextEarthDate(earthDate.toISOString().split('T')[0]);

        this.currentTime = earthDate.toTimeString().split(' ')[0];

        // Stop the interval
        clearInterval(this.intervalId);
      }
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
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const timeRegex = /^\d{2}:\d{2}$/;

      if (!dateRegex.test(this.earthAlarmDate)) {
        alert('Invalid Earth date. The format should be YYYY-MM-DD.');
        return false;
      }

      if (!timeRegex.test(this.earthAlarmTime)) {
        alert('Invalid Earth time. The format should be HH:MM.');
        return false;
      }

      return true;
    },
    validateAlienInput() {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const timeRegex = /^\d{2}:\d{2}$/;

      if (!dateRegex.test(this.newAlienDate)) {
        alert('Invalid Alien date. The format should be YYYY-MM-DD.');
        return false;
      }

      if (!timeRegex.test(this.newAlienTime)) {
        alert('Invalid Alien time. The format should be HH:MM.');
        return false;
      }

      return true;
    },
  },
  watch: {
    newEarthDate() {
      this.updateAlienDate();
    },
    newEarthTime() {
      this.updateAlienDate();
    },
    newAlienDate() {
      this.updateEarthDate();
    },
    newAlienTime() {
      this.updateEarthDate();
    },
  },
});

</script>
