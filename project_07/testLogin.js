import axios from 'axios';

async function test() {
  try {
    const log = await axios.post('http://127.0.0.1:3000/api/auth/login', {
      email: 'bot@bot.com',
      password: 'password123'
    });
    console.log('Login success:', log.data);
  } catch (err) {
    console.error('Login error:', err.response ? err.response.data : err.message);
    if (err.response && err.response.status === 401) {
        console.log('Attempting register instead...');
        const reg = await axios.post('http://127.0.0.1:3000/api/auth/register', {
          name: 'bot',
          email: 'bot@bot.com',
          password: 'password123'
        });
        console.log('Register success:', reg.data);
        const log2 = await axios.post('http://127.0.0.1:3000/api/auth/login', {
          email: 'bot@bot.com',
          password: 'password123'
        });
        console.log('Login2 success:', log2.data);
    }
  }
}
test();
