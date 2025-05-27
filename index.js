document.getElementById('play').addEventListener('click', () => {
  const opponent = document.querySelector('input[name="opponent"]:checked');
  if (opponent) {
    location.replace(`./game.html?opponent=${opponent.value}`);
  } else {
    console.log('elije oponente')
  }
})

