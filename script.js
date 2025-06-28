// assumes transformers.min.js has populated window.Transformers
const messagesEl = document.getElementById('messages');
const inputEl    = document.getElementById('user-input');
const btn        = document.getElementById('send-btn');

let generator;
let history = [
  { role: 'system', content: 'You are a helpful assistant.' }
];

function appendMessage(text, role) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerText = text;
  messagesEl.append(div);
  div.scrollIntoView();
}

async function init() {
  appendMessage('Loading model…', 'assistant');
  // load from ./models/gpt2/
  generator = await window.Transformers.pipeline(
    'text-generation',
    './models/gpt2/'
  );
  appendMessage('Model loaded! Ask me anything.', 'assistant');
  btn.disabled = false;
}

async function send() {
  const txt = inputEl.value.trim();
  if (!txt) return;
  inputEl.value = '';
  appendMessage(txt, 'user');
  history.push({ role: 'user', content: txt });

  appendMessage('…thinking…', 'assistant');
  btn.disabled = true;

  try {
    const out = await generator(txt, {
      max_new_tokens: 50,
      do_sample: false,
      return_full_text: false
    });
    const reply = out[0].generated_text.trim();
    // replace last placeholder
    const as = messagesEl.querySelectorAll('.message.assistant');
    as[as.length - 1].innerText = reply;
    history.push({ role: 'assistant', content: reply });
  } catch (e) {
    const as = messagesEl.querySelectorAll('.message.assistant');
    as[as.length - 1].innerText = 'Error: ' + e.message;
    console.error(e);
  }

  btn.disabled = false;
}

btn.addEventListener('click', send);
inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

window.addEventListener('DOMContentLoaded', init);

