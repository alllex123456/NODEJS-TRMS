const closeModalBtn = document.querySelectorAll('.close-modal');
const modal = document.querySelector('.modal');

const selectClient = document.querySelector('#client');

if (selectClient) {
  selectClient.onchange = (e) =>
    location.replace(`/scheduler/${e.target.value}/setRate?setClientRate=true`);
}

closeModalBtn.forEach((button) => {
  button?.addEventListener('click', () => {
    location.replace(location.pathname);
  });
});
