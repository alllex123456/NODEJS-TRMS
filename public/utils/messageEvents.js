const successMessage = document.getElementById('success');
const errorMessage = document.getElementById('error');

const messages = [successMessage, errorMessage];

setTimeout(() => {
  messages.forEach((message) => {
    if (message) {
      message.style.opacity = '0';
    }
  });
}, 3000);
