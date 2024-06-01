<template>
  <div id="app">
    <div id="card">
      <h1>Earth Clock</h1>
      <div class="clock">
        <p>{{ currentDate }}<br>{{ currentTime }}</p>
      </div>
      <div class="alarm">
        <label for="changeEarthDate">Set Date:</label>
        <input type="date" v-model="changeEarthDate" id="changeEarthDate" @input="validateEarthInput"
          style="margin-right: 10px;">
        <label for="updateEarthTime">Set Time:</label>
        <input type="time" v-model="changeEarthTime" id="changeEarthTime" @input="validateEarthInput"
          style="margin-right: 10px;">
        <button @click="setAlarm">Set Alarm</button>
      </div>
      <p v-if="alarmMessage">{{ alarmMessage }}</p>
      <audio ref="alarmSound" src="./sounds/alarm.mp3"></audio>

      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="stopAlarm">&times;</span>
          <p>⏰ Alarm ringing!</p>
          <button @click="stopAlarm" class="stop-button">Stop</button>
        </div>
      </div>
    </div>
    <div id="card">
      <h1>Alien Clock</h1>
      <div class="clock">
        <p v-html="formattedAlienTime.replace(/\n/g, '<br>')"></p>
      </div>
      <div class="alarm">
        <label for="changeAlienDate">Set Date:</label>
        <input type="date" v-model="changeAlienDate" id="changeAlienDate" @input="validateAlienInput"
          style="margin-right: 10px;">
        <label for="changeAlienTime">Set Time:</label>
        <input type="time" v-model="changeAlienTime" id="changeAlienTime" @input="validateAlienInput"
          style="margin-right: 10px;">
        <button @click="setAlienAlarm">Set Alarm</button>
      </div>
      <p v-if="alarmAlienMessage">{{ alarmAlienMessage }}</p>
      <audio ref="alarmAlienSound" src="./sounds/alarm.mp3"></audio>

      <div v-if="showAlienModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="stopAlienAlarm">&times;</span>
          <p>⏰ Alarm ringing!</p>
          <button @click="stopAlienAlarm" class="stop-button">Stop</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue';
import { calculateAlienTime, checkAlarm, checkAlienAlarm, convertEarthToAlien, convertAlienToEarth } from '../utility/alienTimeUtils';

export default defineComponent({
  data() {
    return {
      currentTime: '' as string,
      currentDate: '' as string,
      earthTime: new Date('1970-01-01T00:00:00Z') as Date,
      alienTime: '' as string,
      alarmTime: '' as string,
      alienAlarmTime: '' as string,
      alarmMessage: '' as string,
      alarmSet: false as boolean,
      alarmAlienSet: false as boolean,
      showModal: false as boolean,
      alarmAlienMessage: '' as string,
      showAlienModal: false as boolean,
      changeEarthDate: '' as string,
      changeEarthTime: '' as string,
      changeAlienDate: '' as string,
      changeAlienTime: '' as string,
    };
  },
  created() {
    this.updateTime();
    setInterval(this.updateTime, 1000);
    setInterval(this.updateAlienTime, 2000); // Update every 2 seconds (1 earth second = 2 alien seconds)
  },
  computed: {
    formattedAlienTime(): string {
      return this.alienTime;
    },
  },
  methods: {
    updateTime() {
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-GB');

      if (this.changeEarthDate) {
        this.setUserDate(this.changeEarthDate);
      } else {
        this.currentDate = formattedDate;
      }

      if (this.changeEarthTime) {
        this.setUserTime(this.changeEarthTime);
      } else {
        this.currentTime = now.toLocaleTimeString();
      }

      if (checkAlarm(this.alarmSet, this.alarmTime, now)) {
        (this.$refs.alarmSound as HTMLAudioElement).play();
        this.showModal = true;
        this.alarmTime = ''; // Reset alarm
        this.alarmMessage = '';
        this.alarmSet = false;
      }
    },
    setUserDate(date: string) {
      const userDate = new Date(date);
      this.currentDate = userDate.toLocaleDateString('en-GB');
    },

    setUserTime(time: string) {
      // Append ':00' if the input doesn't already contain seconds
      if (!time.includes(':')) {
        time += ':00';
      }

      const userTime = new Date(`1970-01-01T${time}`);
      this.currentTime = userTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    },
    updateAlienTime() {
      this.alienTime = calculateAlienTime();

      if (checkAlienAlarm(this.alarmSet, this.alienAlarmTime, this.alienTime)) {
        (this.$refs.alarmAlienSound as HTMLAudioElement).play();
        this.showAlienModal = true;
        this.alienAlarmTime = ''; // Reset alarm
        this.alarmAlienMessage = '';
        this.alarmAlienSet = false;
      }
    },
    setAlarm() {
      if (this.alarmTime) {
        this.alarmMessage = `Earth Alarm set for ${this.alarmTime}`;
        this.alarmAlienMessage = `Alien Alarm set for ${this.alienAlarmTime}`;
        this.alarmSet = true;
      } else {
        this.alarmMessage = '';
        this.alarmAlienMessage = '';
        this.alarmSet = false;
      }
    },
    stopAlarm() {
      (this.$refs.alarmSound as HTMLAudioElement).pause();
      (this.$refs.alarmSound as HTMLAudioElement).currentTime = 0;
      this.showModal = false;
    },
    setAlienAlarm() {
      if (this.alienAlarmTime) {
        this.alarmAlienMessage = `Alien Alarm set for ${this.alienAlarmTime}`;
        this.alarmMessage = `Earth Alarm set for ${this.alarmTime}`;
        this.alarmAlienSet = true;
      } else {
        this.alarmAlienMessage = '';
        this.alarmMessage = '';
        this.alarmAlienSet = false;
      }
    },
    stopAlienAlarm() {
      (this.$refs.alarmAlienSound as HTMLAudioElement).pause();
      (this.$refs.alarmAlienSound as HTMLAudioElement).currentTime = 0;
      this.showModal = false;
    },
    validateEarthInput() {
      const earthDateTime = new Date(`${this.changeEarthDate}T${this.changeEarthTime}`);
      if (earthDateTime.toString() !== 'Invalid Date') {
        this.earthTime = earthDateTime;
        this.alienTime = convertEarthToAlien(earthDateTime);
      }
    },
    validateAlienInput() {
      const alienDateTime = new Date(`${this.changeAlienDate}T${this.changeAlienTime}`);
      if (alienDateTime.toString() !== 'Invalid Date') {
        this.alienTime = alienDateTime.toString();
        this.earthTime = convertAlienToEarth(alienDateTime.toString());
      }
    },
    setEarthDate() {
      // Parse the current date and time strings into a Date object
      const newEarthTime = new Date(`${this.currentDate}T${this.currentTime}`);

      // Update the earthTime data property
      this.earthTime = newEarthTime;

      // Convert the new Earth time to Alien time and update the alienTime data property
      this.alienTime = convertEarthToAlien(newEarthTime);
    },
  },
  watch: {
    changeEarthDate() {
      this.updateTime();
    },

    changeEarthTime() {
      this.updateTime();
    },
  },

  mounted() {
    setInterval(this.updateTime, 1000);
  },
});

</script>
