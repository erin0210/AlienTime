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
          <audio ref="alarmSound" src="/sounds/alarm.mp3"></audio>

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

<script setup lang="ts">

const alienDaysPerMonth = [44, 42, 48, 40, 48, 44, 40, 44, 42, 40, 40, 42, 44, 48, 42, 40, 44, 38]; // Days in each Alien month

export default {
data() {
  return {
    currentTime: '',
    currentDate: '',
    earthTime: new Date('1970-01-01T00:00:00Z'),
    alienTime: '',
    alarmTime: '',
    alarmMessage: '',
    alarmSet: false,
    showModal: false,
    alarmAlienMessage: '',
    showAlienModal: false,
  };
},
created() {
  this.updateTime();
  setInterval(this.updateTime, 1000);
  setInterval(this.updateAlienTime, 2000); // Update every 2 seconds (1 earth second = 2 alien seconds)
},
computed: {
  formattedAlienTime() {
    return this.alienTime;
  },
},
methods: {
  updateTime() {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB');

    this.currentTime = now.toLocaleTimeString();
    this.currentDate = formattedDate;

    this.checkAlarm(now);
  },
  updateAlienTime() {
    this.alienTime = this.calculateAlienTime();
  },
  calculateAlienTime() {
    const earthReferenceTime = new Date('1970-01-01T00:00:00Z');
    const alienReference = {
      year: 2804,
      month: 18,
      day: 31,
      hour: 2,
      minute: 2,
      second: 88
    };

    const earthSecondsSinceReference = Math.floor((new Date() - earthReferenceTime) / 1000); // Seconds since reference in Earth time (rounded down)
    const alienSecondsSinceReference = earthSecondsSinceReference * 0.5; // Convert to Alien seconds (1 second alien time = 0.5 second earth time)
    
    let remainingAlienSeconds = alienReference.second + (alienSecondsSinceReference % 90);
    let alienMinutes = alienReference.minute + Math.floor((alienReference.second + alienSecondsSinceReference) / 90);
    
    let remainingAlienMinutes = alienMinutes % 90;
    let alienHours = alienReference.hour + Math.floor(alienMinutes / 90);
    
    let remainingAlienHours = alienHours % 36;
    let alienDays = alienReference.day - 1 + Math.floor(alienHours / 36);
    
    let alienMonths = alienReference.month - 1;
    let alienYears = alienReference.year;

    while (alienDays >= alienDaysPerMonth[alienMonths]) {
      alienDays -= alienDaysPerMonth[alienMonths];
      alienMonths++;
      if (alienMonths >= 18) {
        alienMonths = 0;
        alienYears++;
      }
    }
    
    alienDays += 1; // Adjust day to 1-based index
    
    // Format the date in d/m/y format
    const formattedDate = `${alienDays.toString().padStart(2, '0')}/${(alienMonths + 1).toString().padStart(2, '0')}/${alienYears.toString().padStart(4, '0')}`;
    
    // Format the time in h:i:s AM/PM format
    const hours12Format = remainingAlienHours % 12 || 12; // Convert 0 hours to 12 for 12 AM/PM format
    const ampm = remainingAlienHours >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hours12Format.toString().padStart(1, '0')}:${remainingAlienMinutes.toString().padStart(2, '0')}:${remainingAlienSeconds.toString().padStart(2, '0')} ${ampm}`;
    
    return `${formattedDate}\n${formattedTime}`;
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
  checkAlarm(now) {
    if (this.alarmSet) {
      const currentFormattedTime = now.toTimeString().slice(0, 5);
      if (this.alarmTime === currentFormattedTime) {
        this.$refs.alarmSound.play();
        this.showModal = true;
        this.alarmTime = ''; // Reset alarm
        this.alarmMessage = '';
        this.alarmSet = false;
      }
    }
  },
  stopAlarm() {
    this.$refs.alarmSound.pause();
    this.$refs.alarmSound.currentTime = 0;
    this.showModal = false;
  },
},
};

</script>
