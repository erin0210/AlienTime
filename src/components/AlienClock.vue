<template>
  <div id="app">
    <div id="card">
      <h1>Earth Clock</h1>
      <div class="clock">
        <p>{{ currentDate }}<br>{{ currentTime }}</p>
      </div>
      <div class="alarm">
        <label for="alarmTime">Set Alarm:</label>
        <input type="time" v-model="alarmTime" id="alarmTime">
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
        <label for="alarmTime">Set Alarm:</label>
        <input type="time" v-model="alarmTime" id="alarmTime">
        <button @click="setAlarm">Set Alarm</button>
      </div>
      <p v-if="alarmAlienMessage">{{ alarmAlienMessage }}</p>
      <audio ref="alarmAlienSound" src=""></audio>

      <div v-if="showAlienModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="stopAlarm">&times;</span>
          <p>⏰ Alarm ringing!</p>
          <button @click="stopAlarm" class="stop-button">Stop</button>
        </div>
      </div>
    </div>
  </div>
</template>




<script lang="ts">

import { defineComponent } from 'vue';
import { calculateAlienTime, checkAlarm } from '../utility/alienTimeUtils';

export default defineComponent({
  data() {
    return {
      currentTime: '' as string,
      currentDate: '' as string,
      earthTime: new Date('1970-01-01T00:00:00Z') as Date,
      alienTime: '' as string,
      alarmTime: '' as string,
      alarmMessage: '' as string,
      alarmSet: false as boolean,
      showModal: false as boolean,
      alarmAlienMessage: '' as string,
      showAlienModal: false as boolean,
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

      this.currentTime = now.toLocaleTimeString();
      this.currentDate = formattedDate;

      if (checkAlarm(this.alarmSet, this.alarmTime, now, this.showModal)) {
        (this.$refs.alarmSound as HTMLAudioElement).play();
        this.showModal = true;
        this.alarmTime = ''; // Reset alarm
        this.alarmMessage = '';
        this.alarmSet = false;
      }
    },
    updateAlienTime() {
      this.alienTime = calculateAlienTime();
    },
    setAlarm() {
      if (this.alarmTime) {
        this.alarmMessage = `Alarm set for ${this.alarmTime}`;
        this.alarmSet = true;
      } else {
        this.alarmMessage = '';
        this.alarmSet = false;
      }
    },
    stopAlarm() {
      (this.$refs.alarmSound as HTMLAudioElement).pause();
      (this.$refs.alarmSound as HTMLAudioElement).currentTime = 0;
      this.showModal = false;
    },
  },
});

</script>
