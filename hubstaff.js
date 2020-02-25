const { openBrowser, goto, evaluate, click, write, $, waitFor } = require('taiko');
const { readFileSync } = require('fs');
const { email, password } = require('./secret.json');

const maxAttempts = 6;
const defaultReason = 'manual entry';

const seqPromises = async (fn, arr)  => {
  const res = [];
  for (let item of arr) {
    res.push(await fn(item));
  }
  return res;
}

const loginToHubstaff = async () => {
  await openBrowser({ headless: false });
  await goto('https://account.hubstaff.com/login');
  await write(email, $('#user_email'));
  await write(password, $('#user_password'));
  await click('Log in')
}

const openTimesheets = async () => {
  try {
    await goto('https://app.hubstaff.com/organizations/40227/time_entries', {
      navigationTimeout: 5000,
    });
  } catch (e) {
    await openTimesheets()
  }
}

const addTime = async ({ start, end, todo, note="", reason=defaultReason }, attempts=1) => {
  try {
    await click($('.add-time'));
    await waitFor(2000);
    await click($('#select2-time_entry_project_id-container'));
    await click($('.select2-results__option:first-of-type'));
    if (todo) {
      await waitFor(1000);
      await click('Select a to-do');
      await write(todo, $('.select2-search__field')); 
      await waitFor(2000);
      await click(todo);
    }
    await write(start, $('#start_time_time')); 
    await write(end, $('#stop_time_time')); 
    if (note) {
      await write(note, $('#time_entry_work_note'));
    }
    await write(reason, $('#time_entry_note'));
    await click('Save');
  } catch (e) {
    console.log('error: ', e);
    console.log('attempt:,', attempts);
    if (attempts < maxAttempts) {
      try {
        await goto('https://app.hubstaff.com/organizations/40227/time_entries', {
      } catch (e) { }
      addTime({ start, end, todo, note, reason }, attempts+1);
    } else {
      console.log('too many failed attempts');
    }
  }
}


const addTimes = async times => seqPromises(addTime, times)

const blankUndefined = item => item === '' ? undefined : item;

const isNotBlank = str => str !== ''

const rowToTime = ([ start, end, todo, note, reason ]) => ({ start, end, todo, note, reason });

const trim = str => str.trim();

const convertRow = row => row.split(',').map(trim).map(blankUndefined);

const parseTimes = str => str.split('\n').filter(isNotBlank).map(convertRow).map(rowToTime);

const times = readFileSync(process.argv[2], 'utf8');

console.log(parseTimes(times));

(async function() {
  await loginToHubstaff();
  await openTimesheets();
  const timeToAdd = parseTimes(times);
  await addTimes(timeToAdd);
})();
// */
