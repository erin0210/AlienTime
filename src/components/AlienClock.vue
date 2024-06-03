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
              <input :disabled="alienAlarmTime.length > 0 || alienAlarmDate.length > 0" type="date"
                v-model="earthAlarmDate" id="changeEarthDate" @input="onChangeEarthDate" style="margin-right: 10px;">
            </div>
            <div class="input-group">
              <label for="updateEarthTime">Set Time:</label>
              <input :disabled="earthAlarmDate.length === 0" type="time" v-model="earthAlarmTime" id="changeEarthTime"
                @input="onChangeEarthTime" style="margin-right: 10px;">
            </div>
          </div>
        </div>

        <!-- Display messages for each alarm set -->
        <div v-for="(alarm, index) in earthAlarms" :key="index">
          <p>{{ alarm.message }}</p>
        </div>

        <p v-if="earthAlarmMessage">{{ earthAlarmMessage }}</p>
        <audio ref="alarmSound" src="./sounds/alarm.mp3"></audio>

        <!-- Alarm setting modal -->
        <div v-if="showAlarmModal" class="modal">
          <div class="modal-content" style=" width: 80%">
            <span class="close" @click="showAlarmModal = false">&times;</span><br><br>
            <h3>Set alarm based on the
              earth clock</h3>
            <br>
            <label for="alarmTime">Time:</label>
            <input id="alarmTime" type="time" v-model="newEarthAlarmTime" style=" width:45%;">
            &nbsp;
            <button :disabled="newEarthAlarmTime.length === 0" @click="setAlarm">Confirm</button>
          </div>
        </div>

        <!-- Alarm ringing modal -->
        <div v-if="showModal" class="modal">
          <div class="modal-content" v-for="(alarm, index) in activeAlarms" :key="index">
            <span class="close" @click="stopAlarm(index)">&times;</span>
            <p>⏰ Alarm ringing! Earth time: {{ alarm.time }}:00, Alien time: {{ alarm.alienTime }}</p> <button
              @click="stopAlarm(index)" class="stop-button">Stop</button>
          </div>
        </div>

        <!-- Earth validation modal -->
        <div v-if="showEarthValidationModal" class="modal">
          <div class="modal-content">
            <span class="close" @click="closeEarthValidation">&times;</span>
            <br>
            <p>{{ earthValidationModalMessage }}</p>
            <button @click="closeEarthValidation" class="stop-button">Close</button>
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
              <input :disabled="earthAlarmTime.length > 0 || earthAlarmDate.length > 0" type="date"
                v-model="alienAlarmDate" id="changeAlienDate" @input="onChangeAlienDate" style="margin-right: 10px;">
            </div>
            <div class="input-group">
              <label for="updateAlienTime">Set Time:</label>
              <input :disabled="alienAlarmDate.length === 0" type="time" v-model="alienAlarmTime" id="changeAlienTime"
                @input="onChangeAlienTime" style="margin-right: 10px;">
            </div>
          </div>
        </div>

        <!-- Display messages for each alarm set -->
        <div v-for="(alarm, index) in earthAlarms" :key="index">
          <p>{{ alarm.alienMessage }}</p>
        </div>

        <div v-if="showAlienValidationModal" class="modal">
          <div class="modal-content">
            <span class="close" @click="closeAlienValidation">&times;</span>
            <br>
            <p>{{ alienValidationModalMessage }}</p>
            <button @click="closeAlienValidation" class="stop-button">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="actionButtonContainer">
    <button :disabled="earthAlarmDate !== '' || earthAlarmTime !== '' || alienAlarmDate !== '' || alienAlarmTime !== ''"
      class="alarm-time" @click="showAlarmModal = true">Alarm</button>

    <button @click="onReset">
      Reset
    </button>

    <button
      :class="{ 'reference-time': buttonLabel === 'Reference Time', 'current-time': buttonLabel === 'Current Time' }"
      @click="onReferenceTime">{{ buttonLabel }}</button>
  </div>

</template>

<script lang="ts">

import { ALIEN_REFERENCE_TIME, convertEarthToAlienTime, formatAlienTime, type AlienReference } from '@/utility/alienTimeUtils';
import { convertAlienToEarth, formatInputTextEarthDate, isValidDateEarthTimeFormat } from '@/utility/earthTimeUtility';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { defineComponent } from 'vue';

dayjs.extend(utc);

interface Alarm {
  time: string;
  alienTime: string;
  message?: string;
  alienMessage?: string;
  isActive: boolean;
}

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

      newEarthAlarmTime: '',

      earthAlarms: [] as Alarm[],
      alarmTimeoutIds: [] as number[],
      showAlarmModal: false,

      // modal
      showModal: false,
      showAlienModal: false,
      showEarthValidationModal: false,
      earthValidationModalMessage: '',
      showAlienValidationModal: false,
      alienValidationModalMessage: '',

      //id
      intervalId: 0,

      // misc
      isUsingReferenceTime: false,
      buttonLabel: 'Reference Time',

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
    activeAlarms() {
      return this.earthAlarms.filter(alarm => alarm.isActive);
    }
  },
  methods: {
    onReferenceTime() {
      this.isUsingReferenceTime = !this.isUsingReferenceTime;
      this.buttonLabel = this.isUsingReferenceTime ? 'Current Time' : 'Reference Time';
      this.updateTime();
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

      this.validateEarthInput();

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

      this.validateAlienInput();

    },
    onChangeAlienDate(event: Event) {
      const input = event.target as HTMLInputElement;
      this.alienAlarmDate = input.value;
      this.newAlienDate = input.value;
    },
    updateAlienDate() {
      if (this.newEarthDate && this.newEarthTime) {
        const newEarthDateTime = new Date(`${this.newEarthDate}T${this.newEarthTime}Z`);
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

        const year = earthDate.getUTCFullYear();
        const month = earthDate.getUTCMonth() + 1; // Months are 0-based in JavaScript
        const day = earthDate.getUTCDate();
        this.currentDate = formatInputTextEarthDate(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);

        const hours = earthDate.getUTCHours();
        const minutes = earthDate.getUTCMinutes();
        const seconds = earthDate.getUTCSeconds();
        this.currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Stop the interval
        clearInterval(this.intervalId);
      }
    },
    setAlarm() {
      // Parse the time string into a Date object
      const [hour, minute] = this.newEarthAlarmTime.split(':').map(Number);
      const now = new Date();
      const alarmTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, minute));

      const alienTime = convertEarthToAlienTime(alarmTime);
      const formattedAlienTime = formatAlienTime(alienTime);

      console.log(formattedAlienTime.time)

      // Calculate the time difference between now and the alarm time
      const diff = alarmTime.getTime() - now.getTime();

      // If the alarm time is in the future, set the alarm
      if (diff > 0) {
        const alarmMessage = `Alarm set for ${this.newEarthAlarmTime}:00`;
        const alienAlarmMessage = `Alarm set for ${formattedAlienTime.time}`;

        const newAlarm = { time: this.newEarthAlarmTime, alienTime: formattedAlienTime.time, message: alarmMessage, alienMessage: alienAlarmMessage, isActive: false };

        this.earthAlarms.push(newAlarm);

        // Set a timeout to ring the alarm when the time comes
        this.setAlarmTimeout(newAlarm, diff);
      } else {
        this.earthAlarmMessage = 'The alarm time must be in the future.';
      }
    },

    setAlarmTimeout(alarm: { time: string, message: string, isActive: boolean }, diff: number) {
      const timeoutId = setTimeout(() => {
        alarm.isActive = true;
        this.ringAlarm();
      }, diff);

      this.alarmTimeoutIds.push(timeoutId);
    },
    ringAlarm() {
      this.showModal = true;
      (this.$refs.alarmSound as HTMLAudioElement).play();
    },
    stopAlarm(index: number) {
      this.earthAlarms[index].isActive = false;
      clearTimeout(this.alarmTimeoutIds[index]);
      this.showModal = false;
      (this.$refs.alarmSound as HTMLAudioElement).pause();
      (this.$refs.alarmSound as HTMLAudioElement).currentTime = 0;
      this.earthAlarms.splice(index, 1);
      this.alarmTimeoutIds.splice(index, 1);
    },
    validateEarthInput() {
      const inputDateTime = new Date(`${this.earthAlarmDate}T${this.earthAlarmTime}Z`);
      const referenceDateTime = new Date('1970-01-01T00:00:00Z');

      if (inputDateTime < referenceDateTime) {
        this.earthValidationModalMessage = 'The earth date and time inputs cannot be less than the reference date and time (1/1/1970 00:00:00).';
        this.showEarthValidationModal = true;

        return false;
      }

      return true;
    },
    validateAlienInput() {
      const [inputHour, inputMinute] = this.newAlienTime.split(':').map(Number);

      // Convert the local time to UTC
      const date = new Date();
      date.setHours(inputHour);
      date.setMinutes(inputMinute);
      const utcHour = date.getUTCHours();
      const utcMinute = date.getUTCMinutes();

      const inputDateTime: AlienReference = {
        year: Number(this.newAlienDate.split('-')[0]),
        month: Number(this.newAlienDate.split('-')[1]),
        day: Number(this.newAlienDate.split('-')[2]),
        hour: utcHour,
        minute: utcMinute,
        second: 0, //default 0 second in set time
      };

      if (this.compareAlienTimes(inputDateTime, ALIEN_REFERENCE_TIME) < 0) {
        this.alienValidationModalMessage = 'The alien date and time cannot be less than the reference date and time (31/18/2804 02:02:88).';
        this.showAlienValidationModal = true;
        return false;
      }

      return true;
    },
    compareAlienTimes(time1: AlienReference, time2: AlienReference) {
      // Compare years
      if (time1.year !== time2.year) {
        return time1.year - time2.year
      }

      // Compare months
      if (time1.month !== time2.month) {
        return time1.month - time2.month
      }

      // Compare days
      if (time1.day !== time2.day) {
        return time1.day - time2.day
      }

      // Compare hours
      if (time1.hour !== time2.hour) {
        return time1.hour - time2.hour
      }

      // Compare minutes
      if (time1.minute !== time2.minute) {
        return time1.minute - time2.minute
      }

      // Compare seconds
      return time1.second - time2.second
    },
    closeEarthValidation() {
      this.showEarthValidationModal = false;
      this.resetDateTime();
    },
    closeAlienValidation() {
      this.showAlienValidationModal = false;
      this.resetDateTime();
    },
    resetDateTime() {
      this.earthAlarmDate = '';
      this.earthAlarmTime = '';
      this.alienAlarmDate = '';
      this.alienAlarmTime = '';
      this.newEarthDate = '';
      this.newEarthTime = '';
      this.newAlienDate = '';
      this.newAlienTime = '';
      this.updateTime();
    }
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
