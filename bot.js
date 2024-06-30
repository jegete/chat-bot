const fs = require('fs');
const tmi = require('tmi.js');
require('dotenv').config();

const opts = {
  connection: { reconnect: true },
  identity: {
    username: process.env.CHAT_BOT_NAME,
    password: process.env.OAUTH_TOKEN
  },
  channels: ['yorks_bot']
};

const commands = [
  "links", "timer", "wheel", "bow", "tg", "boosty",
  "youtube", "instagram", "dsize", "8ball", "bday", "rules", "punish",
  "donate", "bot"
];

const client = new tmi.Client(opts);
let activeTimers = {};
let bow = 0; // Initialize bow count

// Read bow count from JSON file on startup
fs.readFile('data.json', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  try {
    const jsonData = JSON.parse(data);
    bow = jsonData.bow || 0; // Default to 0 if not found
  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
});

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();

function onMessageHandler(target, context, msg, self) {
  if (self) return; // Ignore messages from the bot itself

  const message = msg.toLowerCase();

  if (message.startsWith('!')) {
    const command = message.split(' ')[0].substring(1);

    if (commands.includes(command)) {
      if (command === 'timer') {
        handleTimerCommand(target, context, message);
      } else if (command === 'links') {
        if (doNotTakeArgs(message, command, client, target, context)) {
          client.say(target, "Check out my links: https://beacons.ai/missyork");
        }
      } else if (command === 'bot') {
        if (doNotTakeArgs(message, command, client, target, context)) {
          client.say(target, "I am a custom chat bot developed by Yorkswallet to serve Princess. Please enjoy the stream. Use !bow command to show respect to the princess!");
        }
      } else if (command === 'wheel') {
        if (doNotTakeArgs(message, command, client, target, context)) {
          client.say(target, "Spin the wheel to win one of the following prizes: [My telegram, Be my boy, On ur knees, Surprise, Laugh, Tip more, U lose, Feet, Worship, Heels on, Task for u]");
        }
      } else if (command === 'bow') {
        if (doNotTakeArgs(message, command, client, target, context)) {
          bow++;
          updateBowCount(); // Update bow count in JSON file
          client.say(target, `@${context.username} bows to the goddess. ${bow} people have bowed to the goddess so far`);
        }
      } else if (command === 'tg') {
        if (doNotTakeArgs(message, command, client, target, context)) {
          client.say(target, "Join my telegram channel: https://t.me/princessyork");
        }
      } else if (command === 'boosty') {
        if (doNotTakeArgs(message, command, client, target, context)) {
          client.say(target, "Subscribe to my channel: https://boosty.to/mirryork");
        }
      } else if (command === 'youtube') {
        if (doNotTakeArgs(message, command, client, target, context)) {
          client.say(target, "Check out my youtube channel: https://www.youtube.com/@Missyork");
        }
      } else if (command === 'instagram') {
        if (doNotTakeArgs(message, command, client, target, context)) {
          client.say(target, "Follow my instagram: https://www.instagram.com/york_findom/?igsh=OGQ5ZDc2ODk2ZA%3D%3D");
        }
      } else if (command === 'dsize') {
        if (doNotTakeArgs(message, command, client, target, context)) {
          size = Math.floor(Math.random() * 30) + 1;
          client.say(target, `@${context.username} dsize is ${size} cm`);
        }
      } else if (command === '8ball') {
        idx = Math.floor(Math.random() * ansBall.length);
        client.say(target, ansBall[idx]);
      } else if (command === 'bday') {
        if (doNotTakeArgs(message, command, client, target, context)) {
          const msg = calculateTimeUntilNextBirthday();
          client.say(target, msg);
        }
      } else if (command === 'rules') {
        if (doNotTakeArgs(message, command, client, target, context)) {
          client.say(target, "Rules for the stream, please follow them! - You have to be of the age 18+ to be in this stream! - Respect the streamer - Respect each other - No politics or religion - Only English, French and Spanish - No sexual comments - Tribute to respect the Princess");
        }
      } else if (command === 'donate') {
        if (doNotTakeArgs(message, command, client, target, context)) {
          client.say(target, "Donate here: https://www.donationalerts.com/r/missyork");
        }
      } else if (command === 'punish') {
        if (doNotTakeArgs(message, command, client, target, context)) {
          time = Math.floor(Math.random() * 10) + 1;
          client.say(target, `@${context.username}, Princess commands for ${time} minute!`);
        }
      }
    } else {
      client.say(target, `@${context.username}, unknown command: !${command}`);
    }
  }
}

function handleTimerCommand(target, context, message) {
  const parts = message.split(' ');

  if (parts.length === 2 && !isNaN(parts[1])) {
    const timerValue = parseInt(parts[1], 10);
    startTimer(target, context.username, timerValue * 60);
  } else {
    client.say(target, `@${context.username}, usage: !timer <minutes>`);
  }
}

function startTimer(target, username, duration) {
  if (duration <= 0) {
    client.say(target, `@${username}, timer duration must be greater than zero.`);
    return;
  }

  if (activeTimers[username]) {
    client.say(target, `@${username}, you already have an active timer.`);
    return;
  }

  client.say(target, `@${username}, timer set for ${duration / 60} minutes.`);

  activeTimers[username] = {
    countdownTimeout: null,
    endTimeout: null
  };

  activeTimers[username].countdownTimeout = setTimeout(() => {
    countdown(target, username, 5);
  }, (duration - 5) * 1000);

  activeTimers[username].endTimeout = setTimeout(() => {
    client.say(target, `@${username}, time's up!`);
    clearActiveTimer(username);
  }, duration * 1000);
}

function countdown(target, username, seconds) {
  if (seconds <= 0) return;

  client.say(target, `@${username}, ${seconds}...`);
  setTimeout(() => {
    countdown(target, username, seconds - 1);
  }, 1000);
}

function clearActiveTimer(username) {
  if (activeTimers[username]) {
    clearTimeout(activeTimers[username].countdownTimeout);
    clearTimeout(activeTimers[username].endTimeout);
    delete activeTimers[username];
  }
}

function doNotTakeArgs(message, command, client, target, context) {
  const fullCommand = `!${command}`;

  const parts = message.split(' ');

  if (parts.length > 1) {
    client.say(target, `@${context.username}, The command ${fullCommand} does not take any arguments.`);
    return false;
  }

  return true;
}

function calculateTimeUntilNextBirthday() {
  const birthday = "1998-09-01";
  const [year, month, day] = birthday.split('-').map(Number);
  const today = new Date();
  const nextBirthday = new Date(today.getFullYear(), month - 1, day);

  if (today > nextBirthday) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  const difference = nextBirthday.getTime() - today.getTime();
  const daysUntilBirthday = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hoursUntilBirthday = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const monthsUntilBirthday = Math.floor(daysUntilBirthday / 30);
  const remainingDays = daysUntilBirthday % 30;

  return `Princess birthday is in ${monthsUntilBirthday} months, ${remainingDays} days, and ${hoursUntilBirthday} hours! (September 2nd)`;
}

function updateBowCount() {
  const data = { bow };
  fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error('Error writing JSON file:', err);
    } 
  });
}

function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
  client.say(opts.channels[0], "@Yorks_bot is now connected and ready to serve");
}
